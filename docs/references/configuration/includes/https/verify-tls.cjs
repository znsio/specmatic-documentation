const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const mode=process.argv[2];
if(mode==='rejected') {
  assert.ok(!fs.existsSync('target-requests.log'),'Missing-client test must not reach the authenticated handler');
} else if(mode==='report') {
  const reports=fs.readdirSync('reports').filter(name=>name.endsWith('.xml'));
  assert.ok(reports.length);
  const xml=reports.map(name=>fs.readFileSync('reports/'+name,'utf8')).join('');
  assert.match(xml, /tests="1"/);
  assert.match(xml, /failures="0"/);
  assert.match(xml, /errors="0"/);
  const requests=fs.readFileSync('target-requests.log','utf8').trim().split('\n').map(JSON.parse);
  assert.ok(requests.some(request=>request.authorized===true&&request.client==='docs-client'));
} else {
  const port=mode==='target'?19121:19120;
  const url=`https://127.0.0.1:${port}/greeting`;
  const common=['--http1.1','--fail','--silent','--show-error','--max-time','10','--cacert','certificates/server.pem'];
  const client=['--cert','certificates/client.pem','--key','certificates/client-key.pem'];
  const response=spawnSync('curl',[...common,...(mode==='https'?[]:client),url],{encoding:'utf8'});
  assert.equal(response.status,0,response.stderr);
  assert.deepEqual(JSON.parse(response.stdout),{message:'hello TLS'});
  if(mode==='https') assert.notEqual(spawnSync('curl',['--fail','--silent','--max-time','5',`http://127.0.0.1:${port}/greeting`]).status,0);
  else assert.notEqual(spawnSync('curl',[...common,url]).status,0,'A request without a client certificate must fail');
}
console.log('TLS outcome verified.');
