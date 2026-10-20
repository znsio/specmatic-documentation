const assert = require('node:assert/strict');
async function main() {
  const response = await fetch(`http://127.0.0.1:${process.argv[2]}/books/1`, {signal: AbortSignal.timeout(5000)});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {id: 1, title: 'Specmatic Handbook'});
}
main().catch(error => {console.error(error); process.exitCode = 1;});
