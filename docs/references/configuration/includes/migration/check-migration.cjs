const assert = require('node:assert/strict');
const fs = require('node:fs');
assert.equal(fs.readFileSync('before.yaml', 'utf8'), fs.readFileSync('original.yaml', 'utf8'));
if (fs.existsSync('after.yaml')) {
  assert.equal(fs.readFileSync('after.yaml', 'utf8'), fs.readFileSync('expected-v3.yaml', 'utf8'));
}
if (process.argv[2] === 'upgrade.sh') {
  const output = fs.readFileSync('after.yaml', 'utf8');
  assert.throws(() => require('node:child_process').execFileSync('bash', ['upgrade.sh']), error => error.status === 1);
  assert.equal(fs.readFileSync('after.yaml', 'utf8'), output);
}
if (process.argv[2] === 'already-v3.sh') assert.equal(fs.existsSync('another.yaml'), false);
if (process.argv[2].endsWith('-test.sh')) {
  const requests = fs.readFileSync('target.log', 'utf8').split('\n').filter(line => line.startsWith('{')).map(JSON.parse);
  assert.ok(requests.some(request => request.method === 'GET' && request.path === '/books/1' && request.port === 9100));
  assert.match(fs.readFileSync('reports/TEST-junit-jupiter.xml', 'utf8'), /<testcase\b/);
}
