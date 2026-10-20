const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const includes=path.join(root,'docs/references/configuration/includes');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const shells=files(includes).filter(f=>f.endsWith('.sh')||path.basename(f)==='.setup');
test('configuration commands use Enterprise Docker and retain valid shell syntax',()=>{
  let commands=0;
  for(const file of shells){
    execFileSync('bash',['-n',file]);
    const text=fs.readFileSync(file,'utf8');
    assert.doesNotMatch(text.replaceAll('/usr/local/bin/specmatic ',''),/\bspecmatic\s+(mock|test|config|validate|proxy|mcp|backward-compatibility-check)\b/,file);
    for(const command of text.split('docker run ').slice(1)){
      assert.match(command,/specmatic\/enterprise /,file);
      assert.match(command,/--network host/,file);
      assert.match(command,/-v \.\/:\/usr\/src\/app/,file);
      assert.match(command,/-v "\$HOME\/\.specmatic:\/root\/\.specmatic"/,file);
      assert.doesNotMatch(command,/--entrypoint|--user|--workdir|--init|--env JAVA_OPTS=|--env SPECMATIC_LICENSE_CONTENT|\/usr\/local\/bin\/specmatic/,file);
      commands++;
    }
  }
  assert.ok(commands>200);
});
test('published Docker scripts preserve quoted paths, empty values and exported template inputs',()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'config docker '));
  const receipt=path.join(temporary,'arguments.jsonl');
  fs.writeFileSync(path.join(temporary,'docker'),'#!/usr/bin/env node\nrequire("fs").appendFileSync(process.env.DOCKER_ARGUMENT_RECEIPT,JSON.stringify({args:process.argv.slice(2),templateFormat:process.env.DOC_TEMPLATE_FORMAT})+"\\n");\n',{mode:0o755});
  const run=relative=>{
    fs.writeFileSync(receipt,'');
    execFileSync('bash',[path.join(includes,relative)],{cwd:temporary,env:{...process.env,PATH:temporary+path.delimiter+process.env.PATH,DOCKER_ARGUMENT_RECEIPT:receipt}});
    return fs.readFileSync(receipt,'utf8').trim().split('\n').map(JSON.parse);
  };
  try{
    const records=run('local-openapi/validate.sh');
    assert.equal(records.length,1);
    for(const {args} of records){assert.ok(args.includes('./:/usr/src/app'));assert.ok(args.includes(process.env.HOME+'/.specmatic:/root/.specmatic'));assert.ok(args.includes('specmatic/enterprise'));assert.ok(!args.includes('--workdir'));}
    const starter=run('local-openapi/mock.sh')[0].args;
    assert.equal(starter.at(-1),'mock');assert.ok(!starter.some(arg=>arg.startsWith('CONFIG_FILE_PATH=')));
    const empty=run('auth/empty-env.sh')[0].args;
    assert.ok(empty.includes('BearerAuth='));assert.ok(empty.includes('SPECMATIC_OAUTH2_TOKEN=demo-bearer'));
    const exported=run('template-recipes/environment-wins.sh')[0];
    assert.equal(exported.templateFormat,'yaml');assert.ok(exported.args.includes('DOC_TEMPLATE_FORMAT'));
    assert.ok(exported.args.includes('JAVA_TOOL_OPTIONS=-DDOC_TEMPLATE_FORMAT=missing'));
    const source=run('source-recipes/git-repository.sh')[0].args;
    assert.ok(source.includes('CONTRACTS_REPOSITORY=file:///usr/src/app/source-repository'));
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
test('CI retains every published configuration Docker folder in its Enterprise step',()=>{
  const workflow=fs.readFileSync(path.join(root,'.github/workflows/check-doc-examples.yml'),'utf8');
  const dockerStep=workflow.split('- name: Run published configuration Docker examples')[1];
  assert.ok(dockerStep);assert.match(dockerStep,/run-config-docker-examples.js/);
  for(const folder of new Set(shells.filter(f=>fs.readFileSync(f,'utf8').includes('docker run ')).map(f=>path.relative(root,path.dirname(f)))))assert.ok(dockerStep.includes(folder),folder);
});
test('Docker example orchestration removes only its recorded containers after stopping a server',()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'docker-orchestration-'));
  const bin=path.join(temporary,'bin'),folder=path.join(temporary,'examples'),receipt=path.join(temporary,'removed.jsonl');
  fs.mkdirSync(bin);fs.mkdirSync(folder);
  fs.writeFileSync(path.join(bin,'docker'),`#!/usr/bin/env node
const fs=require('fs'),args=process.argv.slice(2);
if(args[0]==='create') console.log('fixture-image-container');
else if(args[0]==='cp') fs.writeFileSync(args[2],'fixture jar');
else if(args[0]==='rm') fs.appendFileSync(process.env.DOCKER_FIXTURE_REMOVALS,JSON.stringify(args)+'\\n');
else if(args.includes('--version')) console.log('Specmatic Enterprise fixture');
else {
  fs.writeFileSync(args[args.indexOf('--cidfile')+1],'fixture-running-container');
  console.log('fake-server-ready');setInterval(()=>{},1000);
}
`,{mode:0o755});
  fs.writeFileSync(path.join(folder,'server.sh'),'docker run --rm specmatic/enterprise mock\n');
  fs.writeFileSync(path.join(folder,'server.terminaloutput'),'fake-server-ready\n');
  fs.writeFileSync(path.join(folder,'server.verify'),'true\n');
  try{
    execFileSync(process.execPath,[path.join(root,'scripts/run-config-docker-examples.js'),folder],{env:{...process.env,PATH:bin+path.delimiter+process.env.PATH,DOCKER_FIXTURE_REMOVALS:receipt},timeout:15000});
    const removed=fs.readFileSync(receipt,'utf8').trim().split('\n').map(JSON.parse);
    assert.ok(removed.some(args=>args.includes('fixture-image-container')));
    assert.ok(removed.some(args=>args.includes('fixture-running-container')));
    assert.ok(removed.every(args=>args.at(-1).startsWith('fixture-')));
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
