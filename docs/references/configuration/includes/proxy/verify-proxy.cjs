const assert = require('node:assert/strict');
const fs = require('node:fs');
const name = process.argv[2];
const port = name === 'port-cli' ? 19112 : 19111;
const directory = name === 'recordings-cli' ? 'cli-recordings' : 'recordings';
const pause=()=>new Promise(resolve=>setTimeout(resolve,50));
(async()=>{
  if (name !== 'dump') {
  const response = await fetch(`http://127.0.0.1:${port}/${['short-timeout','timeout-cli'].includes(name)?'slow':'greeting'}`);
  if (name === 'short-timeout') {
    assert.equal(response.status,500);
    assert.match(await response.text(),/timeout|timed out/i);
    return;
  }
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-trace'),'demo-trace');
  assert.deepEqual(await response.json(),{message:'hello proxy'});
  assert.ok(fs.readFileSync('target-calls.jsonl','utf8').includes('"method":"GET"'));
  const dump = await fetch(`http://127.0.0.1:${port}/_specmatic/proxy/dump`,{method:'POST'});
  assert.equal(dump.status,202);
  await dump.text();
  }
  if (name === 'no-record') {
    let completed=false;
    for(let attempt=0;attempt<200;attempt++) {
      if(fs.existsSync('no-record.log') && fs.readFileSync('no-record.log','utf8').includes('No stubs were recorded. No contract will be written.')){completed=true;break;}
      await pause();
    }
    assert.ok(completed, 'Wait for the completed empty recording result');
    assert.equal(fs.existsSync(directory+'/proxy_generated.yaml'),false);
    const examples=directory+'/proxy_generated_examples';
    assert.equal(fs.existsSync(examples)?fs.readdirSync(examples).filter(x=>x.endsWith('.json')).length:0,0);
    return;
  }
  let files=[];
  for(let attempt=0;attempt<200;attempt++) {
    const examples=directory+'/proxy_generated_examples';
    if(fs.existsSync(examples))files=fs.readdirSync(examples).filter(x=>x.endsWith('.json'));
    if(files.length&&fs.existsSync(directory+'/proxy_generated.yaml'))break;
    await pause();
  }
  assert.equal(files.length,1);
  const example=JSON.parse(fs.readFileSync(directory+'/proxy_generated_examples/'+files[0],'utf8'));
  assert.deepEqual(example['http-response'].body,{message:'hello proxy'});
  assert.equal(example['http-response'].status,200);
  assert.equal(example['http-response'].headers['X-Trace'],'demo-trace', 'Released ignoreHeaders did not remove the configured response header');
  assert.ok(Object.keys(example['http-response'].headers).some(key=>key.toLowerCase()==='x-keep'));
  assert.ok(fs.readFileSync(directory+'/proxy_generated.yaml','utf8').includes('openapi:'));
  if(name==='two-proxies')await assert.rejects(fetch('http://127.0.0.1:19112/greeting'));
  if(name==='recordings-cli')assert.equal(fs.existsSync('recordings/proxy_generated.yaml'),false);
})().catch(error=>{console.error(error);process.exitCode=1;});
