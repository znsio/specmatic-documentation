const assert=require('node:assert/strict');
async function main(){
 for(const [port,route,title] of [[9100,'books','Specmatic Handbook'],[9102,'authors','Authors Handbook']]){
  const response=await fetch(`http://127.0.0.1:${port}/${route}/1`);
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{id:1,title});
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
