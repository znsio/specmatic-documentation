const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const response=await fetch('http://127.0.0.1:9101/books/1');
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{id:1,title:process.argv[2]==='git-alternate'?'Alternate Handbook':'Specmatic Handbook'});
  if(['git-repository','git-alternate'].includes(process.argv[2])) {
    const branch=process.argv[2]==='git-alternate'?'alternate':'main';
    const directory='.specmatic/repos/source-repository';
    assert.equal(require('node:child_process').execFileSync('git',['-C',directory,'branch','--show-current'],{encoding:'utf8'}).trim(),branch);
    assert.ok(fs.readFileSync(`${directory}/books.yaml`,'utf8').includes(branch==='alternate'?'Alternate Handbook':'Specmatic Handbook'));
  }
  if(process.argv[2].startsWith('web')) {
    const requests=fs.readFileSync('source.log','utf8').split('\n').filter(line=>line.startsWith('{')).map(JSON.parse);
    assert.ok(requests.some(r=>r.method==='GET' && r.path==='/contracts/books.yaml'));
    assert.equal(requests.some(r=>r.path!=='/contracts/books.yaml'),false);
    assert.equal(fs.readFileSync('.specmatic/web/127.0.0.1/contracts/books.yaml','utf8'),fs.readFileSync('contracts/books.yaml','utf8'));
  }
})().catch(error=>{console.error(error);process.exit(1);});
