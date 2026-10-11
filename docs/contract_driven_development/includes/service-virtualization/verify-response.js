const assert = require('node:assert/strict');
const fs = require('node:fs');
const scenario = process.env.DOC_EXAMPLE_NAME.replace(/\.sh$/, '');
const name = scenario === 'inline-mock' ? 'inline-request' : scenario === 'strict-mock' ? 'strict-request' : scenario;
const headers = fs.readFileSync('response-headers.txt', 'utf8');
const status = Number(headers.match(/HTTP\/\S+ (\d+)/)?.[1]);
assert.equal(status, name === 'strict-request' ? 400 : ['phonebook-request','direct-request','lookup-sales-request','lookup-engineering-request','partial-request'].includes(name) ? 200 : 201);
if (name !== 'strict-request') {
  const body = JSON.parse(fs.readFileSync('response-body.txt', 'utf8'));
  if (name === 'out-of-sync-request') {
    assert.equal(typeof body.id, 'number');
    assert.match(fs.readFileSync('mock.log', 'utf8'), /abc123/);
  } else {
    const expected = {
      'inline-request': 'inline-response.json',
      'external-request': 'external-response.json',
      'data-type-request': 'data-type-response.json',
      'phonebook-request': 'phonebook-response.json',
      'direct-request': 'direct-response.json',
      'lookup-sales-request': 'lookup-sales-response.json',
      'lookup-engineering-request': 'lookup-engineering-response.json',
      'partial-request': 'partial-response.json',
    };
    assert.deepEqual(body, JSON.parse(fs.readFileSync(expected[name], 'utf8')));
  }
}
console.log('Verified documented response');
