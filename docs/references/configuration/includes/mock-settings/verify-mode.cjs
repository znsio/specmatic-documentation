const assert = require('node:assert/strict');
const mode = process.argv[2];
async function get(id) {
  return fetch(`http://127.0.0.1:9101/books/${id}`, {signal: AbortSignal.timeout(5000)});
}
async function main() {
  assert.ok(['strict','relaxed','delayed'].includes(mode));
  const start = performance.now();
  const example = await get(1);
  assert.equal(example.status, 200);
  assert.deepEqual(await example.json(), {id: 1, title: 'Specmatic Handbook'});
  const elapsed = performance.now() - start;
  if (mode === 'delayed') assert.ok(elapsed >= 500, `600 ms service delay missing: ${elapsed} ms`);
  const unmatched = await get(2);
  if (mode === 'strict') {
    assert.equal(unmatched.status, 400);
    assert.match(await unmatched.text(), /STRICT MODE ON/);
  } else {
    assert.equal(unmatched.status, 200);
    const body = await unmatched.json();
    assert.equal(Number.isInteger(body.id), true);
    assert.equal(typeof body.title, 'string');
  }
}
main().catch(error => {console.error(error); process.exitCode = 1;});
