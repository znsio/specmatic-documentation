const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const yaml=require('js-yaml');
const {build,defaults}=require('../src/components/ConfigurationBuilder/build');
const {inspect}=require('../src/components/ConfigurationInspector/inspect');
test('generated starters match the published, release-tested inline recipes',()=>{
  for(const task of ['mock','test']) {
    const result=build({task});
    assert.deepEqual(result.errors,[]);
    const file=path.join(__dirname,`../docs/references/configuration/includes/local-openapi/specmatic-${task}.yaml`);
    assert.deepEqual(result.config,yaml.load(fs.readFileSync(file,'utf8')));
  }
});
test('all starter task/source/forms produce schema-valid files with existing local destinations',()=>{
  for(const task of ['mock','test','both'])for(const source of ['filesystem','git','web'])for(const form of ['inline','components']) {
    const result=build({task,source,form,url:'https://example.com/contracts/',testSpecs:'one.yaml\ntwo.yaml',mockSpecs:'backend.yaml',branch:'main'});
    assert.deepEqual(result.errors,[],`${task}/${source}/${form}`);
    const checked=inspect(result.yaml);
    assert.equal(checked.schemaCheck.passed,true);
    assert.deepEqual(checked.diagnostics,[]);
    for(const ref of checked.references)assert.equal(ref.status,'found');
    assert.deepEqual(JSON.parse(result.json),yaml.load(result.yaml));
  }
});
test('rejects incomplete inputs and unsafe component names instead of emitting a partial file',()=>{
  for(const change of [{task:'other'},{source:'other'},{form:'components',sourceName:'bad/name'},{task:'both',form:'components',testName:'same',mockName:'same'},{port:'0'},{port:'65536'},{port:'4.2'},{source:'git',url:'git@example.com:contracts.git'},{source:'web',url:'https://user:password@example.com/contracts/'},{task:'test',baseUrl:'localhost:9100'},{mockSpecs:''},{task:'test',timeoutEnabled:true,timeout:'-1'}])assert.ok(build(change).errors.length,JSON.stringify(change));
});
test('optional settings are absent until chosen, and multiple spec paths retain their order',()=>{
  const simple=build({task:'test'}).config.systemUnderTest.service;
  assert.equal(simple.settings,undefined);assert.equal(simple.data,undefined);
  const result=build({task:'test',timeoutEnabled:true,timeout:'7500',examples:'examples/one\nexamples/two',dictionary:'dictionary.json',testSpecs:' b.yaml\na.yaml\n'});
  assert.deepEqual(result.errors,[]);
  const service=result.config.systemUnderTest.service;
  assert.equal(service.settings.timeoutInMilliseconds,7500);
  assert.deepEqual(service.definitions[0].definition.specs,['b.yaml','a.yaml']);
  assert.deepEqual(service.data,{examples:[{directories:['examples/one','examples/two']}],dictionary:{path:'dictionary.json'}});
  assert.equal(defaults.timeoutEnabled,false);
});
