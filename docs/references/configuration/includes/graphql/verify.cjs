const assert = require('node:assert/strict');
(async () => {
  const [port, type, value] = process.argv.slice(2);
  const response = await fetch(`http://127.0.0.1:${port}/graphql`, {
    method: 'POST', headers: {'Content-Type': 'application/json', 'X-Example': type === 'book' ? 'custom-examples' : 'catalog_examples'},
    body: JSON.stringify({query: `query { get(type: "${type}") }`})
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {data: {get: Number(value)}});
})().catch(error => {console.error(error); process.exit(1);});
