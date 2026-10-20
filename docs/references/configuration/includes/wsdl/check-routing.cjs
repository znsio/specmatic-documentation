const assert = require('node:assert/strict');
const fs = require('node:fs');
const requests = fs.readFileSync('target.log', 'utf8').split('\n').filter(line => line.startsWith('{')).map(JSON.parse);
const port = process.argv[2] === 'test-override.sh' ? 9102 : 9100;
assert.ok(requests.length);
assert.ok(requests.every(request => request.port === port && request.method === 'POST' && request.path === '/soap' && request.body.includes('<SimpleRequest>')));
const action = 'http://specmatic.io/SOAPService/SimpleOperation';
assert.ok(requests.every(request => request.action === (process.argv[2] === 'test-quoted-action.sh' ? `"${action}"` : action)));
assert.match(fs.readFileSync('reports/TEST-junit-jupiter.xml', 'utf8'), /<testcase\b/);
