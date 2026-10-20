const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const http = require('node:http');
const {Script} = require('node:vm');

// Requires an existing production build and a free local audit port (3021).
test('local audit serves the build, records its control and rejects unsafe requests', async t => {
  const server = spawn(process.execPath, [require.resolve('./configuration-browser-audit')]);
  t.after(() => server.kill());
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Audit server did not start')), 5000);
    server.stdout.once('data', () => { clearTimeout(timeout); resolve(); });
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Audit server exited: ${code}`)); });
  });
  const request = (path, body) => new Promise((resolve, reject) => {
    const req = http.request({host:'127.0.0.1', port:3021, path, method:body === undefined ? 'GET' : 'POST'}, res => {
      let text = '';
      res.on('data', chunk => { text += chunk; });
      res.on('end', () => resolve({status:res.statusCode, text}));
    });
    req.on('error', reject);
    req.end(body);
  });
  const page = await request('/references/configuration/inspect');
  assert.equal(page.status, 200);
  const injected = page.text.match(/<head><script>([\s\S]*?)<\/script>/);
  assert.ok(injected, 'observer is injected before app scripts');
  new Script(injected[1]);
  assert.equal((await request('/%')).status, 400);
  assert.equal((await request('/%2e%2e%2fpackage.json')).status, 403);
  assert.equal((await request('/_audit-probe', 'x'.repeat(1000001))).status, 413);
  await request('/_audit-reset');
  await request('/_audit-probe?marker=FICTIONAL_CONFIG_PRIVACY_20261009', 'FICTIONAL_CONFIG_PRIVACY_20261009');
  const records = JSON.parse((await request('/_audit-records')).text);
  assert.equal(records.filter(record => record.marker).length, 1);
  assert.equal(records[0].method, 'POST');
});
