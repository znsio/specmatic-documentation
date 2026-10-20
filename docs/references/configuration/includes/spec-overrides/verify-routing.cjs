const assert = require('node:assert/strict');
const authorsPort = Number(process.argv[2]);
async function read(port, route) {
  return fetch(`http://127.0.0.1:${port}/${route}/1`, {signal:AbortSignal.timeout(5000)});
}
async function main() {
  assert.ok([9101,9102].includes(authorsPort));
  const books=await read(9101,'books');
  assert.equal(books.status,200);
  assert.deepEqual(await books.json(),{id:1,title:'Specmatic Handbook'});
  const authors=await read(authorsPort,'authors');
  assert.equal(authors.status,200);
  assert.deepEqual(await authors.json(),{id:1,title:'Authors Handbook'});
  if(authorsPort!==9101) {
    const misplaced=await read(9101,'authors');
    assert.equal(misplaced.status,400);
    assert.match(await misplaced.text(),/STRICT MODE ON/);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
