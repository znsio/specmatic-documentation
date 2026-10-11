const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');
const execFile = promisify(require('node:child_process').execFile);
const setup = path.join(__dirname, '../docs/contract_driven_development/includes/service-virtualization/.setup');
const runner = path.join(__dirname, 'check-doc-examples.js');

for (const verificationCode of [0, 7]) {
  test(`cleanup bounds a SIGTERM-resistant mock and preserves verification exit ${verificationCode}`, async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'mock-cleanup-test-'));
    let pid;
    try {
      await fs.writeFile(path.join(folder, '.setup'), `export PATH="$PWD:$PATH"\n${await fs.readFile(setup, 'utf8')}`);
      const files = {
        'prepare.js': '', 'capture-response': '',
        'verify-response.js': `console.log('response checked'); process.exit(${verificationCode});`,
        'sample.sh': 'echo documented response\n',
        'sample.terminaloutput': 'documented response\nresponse checked\n',
        'curl': '#!/usr/bin/env bash\nexit 0\n',
        'specmatic': `#!/usr/bin/env node\nconst fs=require('node:fs');\nprocess.on('SIGTERM',()=>{});\nfs.writeFileSync(${JSON.stringify(path.join(folder, 'mock.pid'))},String(process.pid));\nconsole.log('Mock server is running on the following URLs:');\nsetInterval(()=>{},1000);\n`,
      };
      for (const [name, content] of Object.entries(files)) await fs.writeFile(path.join(folder, name), content, { mode: 0o755 });
      let result;
      try {
        result = { ...(await execFile(process.execPath, [runner, folder], { env: { ...process.env, DOC_EXAMPLE_TIMEOUT_MS: '6000' }, timeout: 10_000 })), code: 0 };
      } catch (error) { result = error; }
      pid = Number(await fs.readFile(path.join(folder, 'mock.pid'), 'utf8'));
      assert.doesNotMatch(result.stderr, /Command timed out/);
      if (verificationCode === 0) assert.equal(result.code, 0, result.stderr);
      else { assert.notEqual(result.code, 0); assert.match(result.stderr, /Unexpected exit code/); assert.match(result.stderr, /7 !== 0/); }
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    } finally {
      if (pid) { try { process.kill(pid, 'SIGKILL'); } catch {} }
      await fs.rm(folder, { recursive: true, force: true });
    }
  });
}
