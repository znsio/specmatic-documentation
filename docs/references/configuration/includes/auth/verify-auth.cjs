const assert=require('node:assert/strict'),fs=require('node:fs');
const expected={bearer:'Bearer demo-bearer',oauth:'Bearer demo-oauth',oidc:'Bearer demo-oidc',basic:'Basic ZG9jczpkZW1v',header:'demo-header',query:'demo-query',public:null};
const mode=process.argv[2];
(async()=>{
 if(mode==='mock'||mode==='target') {
  const port=mode==='mock'?19131:19130;
  const headers=mode==='mock'?[{}, {Authorization:'Bearer arbitrary-demo-token'}]:[{Authorization:'Bearer demo-bearer'}];
  for(const h of headers){const r=await fetch(`http://127.0.0.1:${port}/bearer`,{headers:h});assert.equal(r.status,200);assert.deepEqual(await r.json(),{message:'hello auth'});}
 } else {
  const fail=mode==='wrong-id.sh'?6:['wrong-name.sh','wrong-type.sh','wrong-token.sh','full-header.sh','empty-env.sh'].includes(mode)?1:0;
  const xml=fs.readFileSync('reports/TEST-junit-jupiter.xml','utf8');
  assert.match(xml,/tests="7"/);assert.match(xml,new RegExp(`failures="${fail}"`));assert.match(xml,/errors="0"/);
  const requests=fs.readFileSync('requests.log','utf8').trim().split('\n').map(JSON.parse);
  assert.equal(requests.length,7);assert.equal(requests.filter(r=>!r.accepted).length,fail);
  assert.deepEqual(requests.map(r=>r.route).sort(),Object.keys(expected).sort());
  const failedRoutes=requests.filter(r=>!r.accepted).map(r=>r.route).sort();
  assert.deepEqual(failedRoutes,fail===6?Object.keys(expected).filter(r=>r!=='public').sort():fail===1?['bearer']:[]);
  for(const r of requests)if(r.accepted)assert.equal(r.credential,expected[r.route],r.route);
  if(mode==='full-header.sh')assert.equal(requests.find(r=>r.route==='bearer').credential,'Bearer Bearer demo-bearer');
  if(mode==='wrong-token.sh')assert.equal(requests.find(r=>r.route==='bearer').credential,'Bearer wrong-demo');
 }
 console.log('Auth outcome verified.');
})().catch(e=>{console.error(e);process.exitCode=1;});
