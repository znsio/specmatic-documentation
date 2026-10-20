const assert = require('node:assert/strict');
const fs = require('node:fs');
const requests = fs.readFileSync('target.log', 'utf8').split('\n').filter(line => line.startsWith('{')).map(JSON.parse);
const port = process.argv[2] === 'test-override.sh' ? 9102 : 9100;
assert.equal(requests.length, 1);
for (const request of requests) {
  assert.equal(request.port, port);
  assert.equal(request.method, 'POST'); assert.equal(request.path, '/graphql');
  assert.equal(request.example, 'catalog_examples');
  assert.match(JSON.parse(request.body).query, /get\(type:\s*"gadget"\)/);
}
