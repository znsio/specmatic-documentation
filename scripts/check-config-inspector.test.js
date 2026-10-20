const {test} = require('node:test');
const assert = require('node:assert/strict');
const {inspect,targetFor} = require('../src/components/ConfigurationInspector/inspect');
test('auth fixtures distinguish config shape from agreement with a contract or credential', () => {
  const fs=require('node:fs'),path=require('node:path'),yaml=require('js-yaml');
  const folder=path.join(__dirname,'../docs/references/configuration/includes/auth');
  for(const name of fs.readdirSync(folder).filter(n=>n.endsWith('.yaml')&&n!=='auth.yaml')) {
    const text=fs.readFileSync(path.join(folder,name),'utf8').replace('{API_TOKEN:wrong-demo}','demo-bearer');
    const result=inspect(text);
    assert.equal(result.schemaCheck.passed,true,name);
    assert.deepEqual(result.diagnostics,[],name);
  }
  const config=yaml.load(fs.readFileSync(path.join(folder,'specmatic.yaml'),'utf8'));
  const service=config.systemUnderTest.service;
  assert.equal(service.definitions[0].definition.specs[0].spec.id,service.runOptions.openapi.specs[0].spec.id);
  const contract=yaml.load(fs.readFileSync(path.join(folder,'auth.yaml'),'utf8'));
  assert.deepEqual(Object.keys(service.runOptions.openapi.specs[0].spec.securitySchemes).sort(),Object.keys(contract.components.securitySchemes).sort());
  assert.equal(Object.keys(contract.paths).length,7);
  assert.ok(Object.values(contract.paths).every(p=>p.get.responses['200'].content['application/json'].schema));
  const badType=structuredClone(config);badType.systemUnderTest.service.runOptions.openapi.specs[0].spec.securitySchemes.BearerAuth.type='http';
  assert.equal(inspect(yaml.dump(badType)).schemaCheck.passed,false);
});
test('TLS recipes preserve template inputs and validate resolved certificate roles and refs', () => {
  const fs=require('node:fs'),path=require('node:path'),yaml=require('js-yaml');
  const folder=path.join(__dirname,'../docs/references/configuration/includes/https');
  for (const name of fs.readdirSync(folder).filter(name=>name.endsWith('.yaml')&&name!=='greeting.yaml')) {
    const text=fs.readFileSync(path.join(folder,name),'utf8');
    const result=inspect(text.replaceAll('{TLS_PASSWORD:docs-demo-pass}','docs-demo-pass'));
    assert.equal(result.schemaCheck.passed,true,name);
    assert.deepEqual(result.diagnostics,[],name);
  }
  const mock=yaml.load(fs.readFileSync(path.join(folder,'specmatic.yaml'),'utf8'));
  const incoming=yaml.load(fs.readFileSync(path.join(folder,'mtls-mock.yaml'),'utf8'));
  const outgoing=yaml.load(fs.readFileSync(path.join(folder,'test-mtls.yaml'),'utf8'));
  assert.equal(mock.dependencies.services[0].service.runOptions.openapi.cert.keyStore.alias,'demo-server');
  assert.equal(incoming.dependencies.services[0].service.runOptions.openapi.cert.mtlsEnabled,true);
  assert.equal(outgoing.systemUnderTest.service.runOptions.openapi.cert.keyStore.alias,'demo-client');
  assert.equal(outgoing.systemUnderTest.service.runOptions.openapi.cert.mtlsEnabled,undefined);
  const broken=yaml.load(fs.readFileSync(path.join(folder,'mock-ref.yaml'),'utf8'));
  delete broken.components.certificates.demoTls;
  assert.ok(inspect(yaml.dump(broken)).diagnostics.some(d=>d.message.includes('reference')));
});
test('GraphQL recipes keep valid role-specific nesting and reject the intentional wrong mode', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/graphql');
  for (const name of fs.readdirSync(folder).filter(name => name.endsWith('.yaml'))) {
    const result = inspect(fs.readFileSync(path.join(folder, name), 'utf8'));
    assert.equal(result.schemaCheck.passed, name !== 'wrong-type.yaml', name);
    if (name === 'wrong-type.yaml') {
      assert.ok(result.diagnostics.some(d => d.path.endsWith('/graphqlsdl/type') && d.message.includes('"test"')));
    } else assert.deepEqual(result.diagnostics, [], name);
  }
  const component = 'version: 3\ncomponents:\n  runOptions:\n    catalog:\n      graphqlsdl:\n        port: 9101\n';
  assert.equal(inspect(component).schemaCheck.passed, false);
  assert.equal(inspect(component + '        type: mock\n').schemaCheck.passed, true);
});
test('WSDL recipes retain unresolved templates and validate their resolved service roles', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/wsdl');
  for (const name of fs.readdirSync(folder).filter(name => name.endsWith('.yaml'))) {
    const input = fs.readFileSync(path.join(folder, name), 'utf8');
    assert.equal(inspect(input).schemaCheck.state, 'skipped', name);
    const resolved = inspect(input.replace('{SOAP_SPEC_DIRECTORY:.}', '.'));
    assert.equal(resolved.schemaCheck.passed, name !== 'wrong-type.yaml', name);
    if (name === 'wrong-type.yaml') {
      assert.ok(resolved.diagnostics.some(d => d.path.endsWith('/wsdl/type') && d.message.includes('"test"')));
    } else assert.deepEqual(resolved.diagnostics, [], name);
  }
  const component = 'version: 3\ncomponents:\n  runOptions:\n    soap:\n      wsdl:\n        port: 9101\n';
  assert.equal(inspect(component).schemaCheck.passed, false);
  assert.equal(inspect(component + '        type: mock\n').schemaCheck.passed, true);
  const inline = 'version: 3\ndependencies:\n  services:\n    - service:\n        definitions: []\n        runOptions:\n          wsdl:\n            port: 9101\n';
  assert.equal(inspect(inline).schemaCheck.passed, true);
});
test('finds references, canonical and alias fields without modifying input', () => {
  const input = 'version: 3\nsystemUnderTest:\n  service:\n    $ref: "#/components/services/books"\ncomponents:\n  services:\n    books:\n      definitions: []\nspecmatic:\n  settings:\n    test:\n      resiliencyTests: all\n';
  const result = inspect(input);
  assert.equal(result.references[0].status,'found');
  assert.equal(result.diagnostics.length,0);
  assert.ok(result.nodes.find(n=>n.name==='resiliencyTests').keys.some(k=>k.id==='TestSettings/schemaResiliencyTests'));
  assert.equal(result.nodes.find(n=>n.pointer==='#/components/services/books').value.definitions.length,0);
});
test('reports syntax, wrong roots, unresolved refs and templates without fetching', () => {
  assert.match(inspect('version: [').diagnostics[0].message,/Cannot parse/);
  assert.match(inspect('[]').diagnostics[0].message,/configuration object/);
  const result = inspect('version: 3\nsettings: {}\ndependencies:\n  services:\n    - service:\n        $ref: "#/components/services/missing"\n        name: "${NAME:books}"');
  assert.ok(result.diagnostics.some(d=>d.path==='#/settings'));
  assert.ok(result.diagnostics.some(d=>d.message.includes('No component exists')));
  assert.ok(result.diagnostics.some(d=>d.message.includes('Template input')));
  assert.ok(inspect('version: 3\ncomponents:\n  services:\n    books:\n      $ref: https://example.invalid/config.yaml').diagnostics.some(d=>d.message.includes('not fetched')));
});
test('matches literal map lookup in the released component resolver and bounds cycles/large input', () => {
  assert.equal(targetFor({components:{services:{'a/b~c':7}}},'#/components/services/a~1b~0c'),undefined);
  assert.equal(targetFor({components:{services:{'a~1b~0c':7}}},'#/components/services/a~1b~0c'),7);
  assert.equal(targetFor({components:{services:{a:{definitions:[7]}}}},'#/components/services/a/definitions/0'),undefined);
  assert.equal(targetFor({components:{services:{a:null}}},'#/components/services/a'),undefined);
  assert.equal(targetFor({components:{}},'#/components/toString'),undefined);
  assert.ok(inspect('version: 3\ncomponents: &c\n  services: *c').diagnostics.some(d=>d.message.includes('recursive YAML alias')));
  assert.equal(inspect(' '.repeat(200001)+'version: 3').nodes.length,0);
  const result = inspect('version: 3\ncomponents:\n  data: [' + Array(4000).fill('1').join(',') + ']');
  assert.equal(result.nodes.length,3000);
});

test('keeps runtime reference names separate from escaped inspector node locations',()=>{
  const result=inspect(`version: 3
systemUnderTest:
  service:
    $ref: "#/components/services/books~v1"
components:
  services:
    books~v1:
      definitions: []
`);
  assert.equal(result.references[0].status,'found');
  assert.equal(result.references[0].targetPointer,'#/components/services/books~0v1');
  assert.ok(result.nodes.some(n=>n.pointer===result.references[0].targetPointer));
  assert.deepEqual(result.diagnostics,[]);
});

test('checks the same complete configurations used by released CLI recipes', () => {
  const fs=require('node:fs'),path=require('node:path');
  for(const name of ['specmatic-mock.yaml','specmatic-test.yaml','specmatic-components.yaml']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/local-openapi',name),'utf8');
    const result=inspect(text);
    assert.equal(result.schemaCheck.state,'checked');
    assert.equal(result.schemaCheck.passed,true,name);
    assert.deepEqual(result.diagnostics,[],name);
  }
  for(const name of ['full.yaml','limited.yaml','short-timeout.yaml']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/test-settings',name),'utf8');
    assert.deepEqual(inspect(text).diagnostics,[],name);
  }
  for(const name of ['default.yaml','default.json','config/mock.yaml']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/discovery',name),'utf8');
    assert.deepEqual(inspect(text).diagnostics,[],name);
  }
  const nested=inspect(fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/discovery/config/test.yaml'),'utf8'));
  assert.equal(nested.schemaCheck.state,'skipped');
  assert.ok(nested.diagnostics.every(d=>d.message.includes('Template input')));
});
test('locates wrong nesting, wrong roles and scalar type errors', () => {
  const result=inspect(`version: 3
systemUnderTest:
  service:
    definitions: []
    port: 9100
    runOptions:
      openapi:
        type: mock
        port: "9100"
`);
  assert.equal(result.schemaCheck.passed,false);
  assert.ok(result.diagnostics.some(d=>d.path==='#/systemUnderTest/service/port' && d.message.includes('not allowed')));
  assert.ok(result.diagnostics.some(d=>d.path==='#/systemUnderTest/service/runOptions/openapi/type' && d.message.includes('"test"')));
  assert.ok(result.diagnostics.some(d=>d.path==='#/systemUnderTest/service/runOptions/openapi/port' && d.message.includes('whole number')));
  assert.equal(result.nodes.find(n=>n.pointer==='#/systemUnderTest/service/runOptions/openapi/port').value,'9100');
});
test('detects missing definitions, mutually exclusive sources and invalid URLs', () => {
  assert.ok(inspect('version: 3\ncomponents:\n  sources:\n    empty: {}').diagnostics.some(d=>d.message.includes('exactly one source provider')));
  assert.ok(inspect('version: 3\nsystemUnderTest:\n  service: {}').diagnostics.some(d=>d.path==='#/systemUnderTest/service/definitions'));
  const result=inspect(`version: 3
systemUnderTest:
  service:
    definitions:
      - definition:
          source:
            filesystem: {directory: .}
            git: {url: https://example.com/contracts.git}
          specs: [books.yaml]
    runOptions:
      openapi: {baseUrl: "not a uri"}
`);
  assert.equal(result.schemaCheck.passed,false);
  assert.ok(result.diagnostics.some(d=>d.message.includes('exactly one source provider')));
  assert.ok(result.diagnostics.some(d=>d.path==='#/systemUnderTest/service/runOptions/openapi/baseUrl' && d.message.includes('absolute URI')));
});
test('leaves templates and authored reference overrides unresolved', () => {
  const template=inspect('version: 3\nsystemUnderTest:\n  service:\n    definitions: "${DEFINITIONS:[]}"');
  assert.equal(template.schemaCheck.state,'skipped');
  assert.ok(template.schemaCheck.reason.includes('Resolve templates'));
  const reference=inspect('version: 3\nsystemUnderTest:\n  service:\n    $ref: "https://example.invalid/config.yaml#/components/services/books"\n    runOptions: {openapi: {baseUrl: http://localhost:9100}}');
  assert.equal(reference.schemaCheck.state,'checked');
  assert.equal(reference.references[0].status,'unresolved');
  assert.equal(reference.nodes.find(n=>n.pointer==='#/systemUnderTest/service/runOptions/openapi/baseUrl').value,'http://localhost:9100');
});
test('recognizes only runtime template syntax in values and leaves map names literal',()=>{
  const literal=inspect('version: 3\nsystemUnderTest:\n  service:\n    definitions: "${DEFINITIONS}"');
  assert.equal(literal.schemaCheck.state,'checked');
  assert.equal(literal.schemaCheck.passed,false);
  assert.ok(literal.diagnostics.some(d=>d.path==='#/systemUnderTest/service/definitions' && d.message.includes('YAML list')));
  const named=inspect('version: 3\ncomponents:\n  services:\n    "${NAME:books}":\n      definitions: []');
  assert.equal(named.schemaCheck.state,'checked');
  assert.deepEqual(named.diagnostics,[]);
  assert.ok(named.nodes.some(node=>node.name==='${NAME:books}'));
});
test('compiled validation is reproducible and does not mutate authored values', () => {
  const {execFileSync}=require('node:child_process'),path=require('node:path');
  execFileSync(process.execPath,[path.join(__dirname,'build-config-validator.js'),'--check']);
  const {checkSchema}=require('../src/components/ConfigurationInspector/check-schema');
  const input={version:3,specmatic:{settings:{test:{timeoutInMilliseconds:'5000'}}}};
  const before=JSON.stringify(input);
  assert.equal(checkSchema(input).passed,false);
  assert.equal(JSON.stringify(input),before);
  const minimal={version:3};
  assert.equal(checkSchema(minimal).passed,true);
  assert.deepEqual(minimal,{version:3});
});

test('recognizes fields beneath chosen names containing dots and pointer escapes',()=>{
  const result=inspect(`version: 3
components:
  services:
    "books.v1/a~b":
      definitions:
        - definition:
            source: {filesystem: {directory: .}}
            specs: [books.yaml]
`);
  const source=result.nodes.find(n=>n.pointer==='#/components/services/books.v1~1a~0b/definitions/0/definition/source');
  assert.ok(source.keys.some(k=>k.id==='DefinitionValue/source'));
  assert.deepEqual(result.diagnostics,[]);
});

test('data selection illustration has valid nested shapes and resolvable local refs',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/data-selection/specmatic.yaml'),'utf8');
  const result=inspect(text);
  assert.equal(result.schemaCheck.state,'checked');
  assert.equal(result.schemaCheck.passed,true);
  assert.deepEqual(result.diagnostics,[]);
  assert.ok(result.references.length>=8);
  assert.ok(result.references.every(ref=>ref.status==='found'));
  const notes=require('../src/data/configuration/field-behavior.json');
  for(const id of ['DataDefinition/examples','DataDefinition/dictionary','ExampleDirectories/directories','DictionaryConfiguration/path','ExamplesConfiguration/commonExamples','ExamplesConfiguration/testExamples','ExamplesConfiguration/mockExamples']) {
    assert.ok(notes[id]);
    const evidence=require('../src/data/configuration/coverage.json').find(row=>row.id===id).executionEvidence;
    if(id==='ExamplesConfiguration/testExamples') assert.equal(evidence,'pending');
    else assert.equal(evidence.status,'released-core-openapi-mock-examples');
  }
});


test('released data recipes keep valid config shapes and local reference destinations',()=>{
  const fs=require('node:fs'),path=require('node:path');
  for(const name of ['service-data','shared-data','empty-examples','extra-only','combined-data']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/data-recipes',name+'.yaml'),'utf8');
    const result=inspect(text);
    assert.equal(result.schemaCheck.passed,true,name);
    assert.deepEqual(result.diagnostics,[],name);
    assert.ok(result.references.every(ref=>ref.status==='found'),name);
  }
});

test('mock settings recipes have valid nesting and keep lifecycle versus service scopes',()=>{
  const fs=require('node:fs'),path=require('node:path');
  for(const name of ['relaxed','strict','delayed']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/mock-settings',name+'.yaml'),'utf8');
    const result=inspect(text);
    assert.equal(result.schemaCheck.passed,true,name);
    assert.deepEqual(result.diagnostics,[],name);
    assert.ok(result.nodes.some(node=>node.pointer==='#/dependencies/settings/hotReload' && node.value===false));
    assert.ok(result.nodes.some(node=>node.pointer==='#/dependencies/services/0/service/settings/strictMode'));
  }
});

test('released template recipes stay authored and do not claim resolved browser validation',()=>{
  const fs=require('node:fs'),path=require('node:path');
  for(const name of ['specmatic','structured-options','invalid-port']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/template-recipes',name+'.yaml'),'utf8');
    const result=inspect(text);
    assert.equal(result.schemaCheck.state,'skipped',name);
    assert.ok(result.schemaCheck.reason.includes('Resolve templates'),name);
    assert.equal(result.nodes.find(node=>node.pointer==='#/dependencies/settings').value,'{DOC_TEMPLATE_SETTINGS:{"strictMode":true,"hotReload":false}}');
  }
});

test('per-spec recipes retain selected files and vary only their intended override behavior',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const cases={};
  for(const name of ['matched','mismatched','duplicate','base-url']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/spec-overrides',name+'.yaml'),'utf8');
    const result=inspect(text);
    assert.equal(result.schemaCheck.passed,true,name);
    assert.deepEqual(result.diagnostics,[],name);
    cases[name]=result.nodes.find(node=>node.pointer==='#/dependencies/services/0/service').value;
    assert.deepEqual(cases[name].definitions[0].definition.specs.map(entry=>entry.spec.id),['books','authors']);
  }
  assert.equal(cases.mismatched.runOptions.openapi.specs[0].spec.id,'Authors');
  assert.deepEqual(cases.duplicate.runOptions.openapi.specs.map(entry=>entry.spec.port),[9102,9103]);
  assert.equal(cases['base-url'].runOptions.openapi.specs[0].spec.baseUrl,'http://127.0.0.1:9102');
  assert.equal(cases['base-url'].runOptions.openapi.specs[0].spec.port,9103);
});

test('test-target recipes keep ID mismatches and per-spec prefixes scoped to their intended declaration',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const cases={};
  for(const name of ['test-matched','test-mismatched','test-prefix']) {
    const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/spec-test-overrides',name+'.yaml'),'utf8');
    const result=inspect(text);
    assert.equal(result.schemaCheck.passed,true,name);
    assert.deepEqual(result.diagnostics,[],name);
    cases[name]=result.nodes.find(node=>node.pointer==='#/systemUnderTest/service').value;
    assert.deepEqual(cases[name].definitions[0].definition.specs.map(entry=>entry.spec.id),['books','authors']);
  }
  assert.equal(cases['test-mismatched'].runOptions.openapi.specs[1].spec.id,'Authors');
  assert.equal(cases['test-prefix'].definitions[0].definition.specs[1].spec.urlPathPrefix,'/v2/');
  assert.equal(cases['test-prefix'].definitions[0].definition.specs[0].spec.urlPathPrefix,undefined);
  assert.deepEqual(cases['test-matched'].runOptions.openapi.specs.map(entry=>entry.spec.baseUrl),['http://127.0.0.1:9100','http://127.0.0.1:9102']);
});

test('local reference shapes distinguish existing incompatible targets and retain authored shallow overrides',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const folder=path.join(__dirname,'../docs/references/configuration/includes/component-references');
  for(const name of ['shared','replace-settings','keep-strict']) {
    const text=fs.readFileSync(path.join(folder,name+'.yaml'),'utf8');
    const result=inspect(text);
    assert.deepEqual(result.diagnostics,[],name);
    assert.ok(result.references.every(ref=>ref.shapeCheck==='checked'),name);
    const service=result.nodes.find(node=>node.pointer==='#/dependencies/services/0/service').value;
    assert.equal(service.$ref,'#/components/services/books');
    if(name==='replace-settings')assert.deepEqual(service.settings,{delayInMilliseconds:0});
  }
  const wrong=inspect(fs.readFileSync(path.join(folder,'wrong-type.yaml'),'utf8'));
  assert.equal(wrong.schemaCheck.passed,true);
  assert.equal(wrong.references[0].status,'found');
  assert.equal(wrong.references[0].shapeCheck,'issues');
  assert.ok(wrong.diagnostics.some(issue=>issue.message.includes('right kind of component for “service”')));
  assert.ok(wrong.diagnostics.some(issue=>issue.path==='#/dependencies/services/0/service/$ref' && issue.message.includes('definitions')));
  const array=inspect(fs.readFileSync(path.join(folder,'array-target.yaml'),'utf8'));
  assert.equal(array.references[0].status,'unresolved');
});

test('reference projections reject non-object sibling overrides and report unexamined limits or chains',()=>{
  const result=inspect(`version: 3
dependencies:
  services: []
  data:
    examples:
      $ref: '#/components/examples/mockExamples'
      directories: [extra]
components:
  examples:
    mockExamples: []`);
  assert.equal(result.references[0].shapeCheck,'issues');
  assert.ok(result.diagnostics.some(issue=>issue.message.includes('not an object')));
  const services=Array.from({length:51},()=>({service:{$ref:'#/components/services/books'}}));
  const capped=inspect(JSON.stringify({version:3,dependencies:{services},components:{services:{books:{definitions:[]}}}}));
  assert.equal(capped.references.filter(ref=>ref.shapeCheck==='checked').length,50);
  assert.equal(capped.references.filter(ref=>ref.shapeCheck==='skipped').length,1);
  assert.ok(capped.diagnostics.some(issue=>issue.message.includes('50-reference')));
  const chain=inspect(JSON.stringify({version:3,dependencies:{services:[{service:{$ref:'#/components/services/alias'}}]},components:{services:{alias:{$ref:'#/components/services/books'},books:{definitions:[]}}}}));
  assert.equal(chain.references[0].shapeCheck,'skipped');
});

test('test target recipes preserve endpoint variants and reject a named environment root',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const folder=path.join(__dirname,'../docs/references/configuration/includes/test-targets');
  for(const name of ['configured','fallback','host-port']) {
    const result=inspect(fs.readFileSync(path.join(folder,`${name}.yaml`),'utf8'));
    assert.deepEqual(result.diagnostics,[],name);
    assert.equal(result.schemaCheck.passed,true,name);
  }
  const authored=require('js-yaml').load(fs.readFileSync(path.join(folder,'configured.yaml'),'utf8'));
  assert.equal(authored.systemUnderTest.service.runOptions.openapi.baseUrl,'http://127.0.0.1:9100');
  assert.equal(authored.systemUnderTest.service.runOptions.openapi.port,9102);
  const unresolved=inspect(fs.readFileSync(path.join(folder,'templated.yaml'),'utf8'));
  assert.equal(unresolved.schemaCheck.state,'skipped');
  assert.ok(unresolved.nodes.some(node=>node.value==='{BOOKS_TARGET:http://127.0.0.1:9100}'));
  const unsupported=inspect(fs.readFileSync(path.join(folder,'named-environment.yaml'),'utf8'));
  assert.ok(unsupported.diagnostics.some(issue=>issue.path==='#/environments'));
  const notes=require('../src/data/configuration/field-behavior.json');
  assert.match(notes['OpenApiTestRunOptions/baseUrl'].precedence,/file-loaded endpoints stay selected/);
  assert.match(notes['OpenApiTestRunOptions/host'].omission,/Host alone/);
  assert.match(notes['OpenApiTestRunOptions/port'].caveat,/0 is a value/);
});

test('source recipes expose provider boundaries without treating unresolved Git inputs as checked',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const folder=path.join(__dirname,'../docs/references/configuration/includes/source-recipes');
  for(const name of ['filesystem','local-directory','git-current','web','web-leading-path','web-trailing-source']) {
    const result=inspect(fs.readFileSync(path.join(folder,`${name}.yaml`),'utf8'));
    assert.deepEqual(result.diagnostics,[],name);
    assert.equal(result.schemaCheck.passed,true,name);
  }
  for(const name of ['empty-source','multiple-providers']) {
    const result=inspect(fs.readFileSync(path.join(folder,`${name}.yaml`),'utf8'));
    assert.ok(result.diagnostics.some(issue=>issue.message.includes('exactly one source provider')),name);
  }
  const web=inspect(fs.readFileSync(path.join(folder,'empty-web-url.yaml'),'utf8'));
  assert.ok(web.diagnostics.some(issue=>issue.path.endsWith('/web/url')));
  const git=inspect(fs.readFileSync(path.join(folder,'git-repository.yaml'),'utf8'));
  assert.equal(git.schemaCheck.state,'skipped');
  const coverage=require('../src/data/configuration/coverage.json');
  assert.equal(coverage.find(row=>row.id==='GitSourceOptions/branch').executionEvidence.status,'released-core-openapi-source-examples');
  for(const id of ['GitSourceOptions/matchBranch','GitSourceOptions/auth','GitBearerEnvAuthentication/bearerEnvironmentVariable','GitBearerFileAuthentication/bearerFile','GitPersonalAccessTokenAuthentication/personalAccessToken'])assert.equal(coverage.find(row=>row.id===id).executionEvidence,'pending');
  const page=fs.readFileSync(path.join(folder,'../../contract-management.mdx'),'utf8');
  assert.equal(page.includes('V2V3SpecmaticConfigTabs'),false);
  assert.ok(page.includes('versions-2---provides-and-consumes'));
  assert.ok(fs.readFileSync(path.join(folder,'../../legacy-contract-management.mdx'),'utf8').includes('V2V3SpecmaticConfigTabs'));
});

test('published migration output has valid V3 nesting and matching override IDs', () => {
  const fs = require('node:fs'), path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/migration');
  const input = fs.readFileSync(path.join(folder, 'expected-v3.yaml'), 'utf8');
  const result = inspect(input);
  assert.equal(result.schemaCheck.state, 'checked');
  assert.equal(result.schemaCheck.passed, true);
  assert.equal(result.diagnostics.length, 0);
  const config = require('js-yaml').load(input);
  const testService = config.systemUnderTest.service;
  const mockService = config.dependencies.services[0].service;
  for (const service of [testService, mockService]) {
    assert.equal(service.definitions[0].definition.specs[0].spec.id, service.runOptions.openapi.specs[0].spec.id);
    assert.equal(service.definitions[0].definition.specs[0].spec.path, 'books.yaml');
  }
  assert.equal(testService.runOptions.openapi.specs[0].spec.baseUrl, 'http://127.0.0.1:9100');
  assert.equal(mockService.runOptions.openapi.specs[0].spec.port, 9101);
  assert.equal(config.specmatic.settings.mock.hotReload, false);
  assert.equal(config.specmatic.settings.test.junitReportDir, 'reports');
});

test('gRPC recipe roles and complete override maps retain declared identities', () => {
  const fs = require('node:fs'), path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/grpc');
  for (const name of ['mock','test','mock-override','test-override','mock-custom','test-custom','mock-import','test-import','test-timeout','test-timeout-recovery']) {
    const text = fs.readFileSync(path.join(folder, name + '.yaml'), 'utf8');
    const result = inspect(text);
    assert.equal(result.schemaCheck.passed, true, name);
    assert.deepEqual(result.diagnostics, [], name);
    const config = require('js-yaml').load(text);
    const service = name.startsWith('mock') ? config.dependencies.services[0].service : config.systemUnderTest.service;
    assert.equal(service.runOptions.protobuf.type, name.startsWith('mock') ? 'mock' : 'test');
    if (name.endsWith('override')) {
      const override = service.runOptions.protobuf.specs[0].spec;
      assert.equal(override.id, service.definitions[0].definition.specs[0].spec.id);
      assert.equal(override.protocVersion, '3.23.4');
      assert.equal(override.port, 9102);
      if (name.startsWith('test')) assert.equal(override.host, '127.0.0.1');
    }
  }
  assert.equal(inspect(fs.readFileSync(path.join(folder, 'wrong-type.yaml'), 'utf8')).schemaCheck.passed, false);
});

test('gRPC import and deadline recoveries keep structural checks separate from execution', () => {
  const fs = require('node:fs'), path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/grpc');
  const read = name => {
    const text = fs.readFileSync(path.join(folder, name + '.yaml'), 'utf8');
    assert.equal(inspect(text).schemaCheck.passed, true, name);
    return require('js-yaml').load(text);
  };
  const broken = read('missing-import').dependencies.services[0].service;
  const fixed = read('mock-import').dependencies.services[0].service;
  assert.deepEqual(broken.definitions, fixed.definitions);
  assert.deepEqual(broken.data, fixed.data);
  assert.deepEqual(broken.runOptions.protobuf.importPaths, []);
  assert.deepEqual(fixed.runOptions.protobuf.importPaths, ['.']);
  assert.equal(fs.readFileSync(path.join(folder, 'missing-import.exitcode'), 'utf8').trim(), '1');
  const short = read('test-timeout'), recovered = read('test-timeout-recovery');
  assert.deepEqual(short.systemUnderTest.service.definitions, recovered.systemUnderTest.service.definitions);
  assert.deepEqual(short.specmatic, recovered.specmatic);
  assert.equal(short.systemUnderTest.service.runOptions.protobuf.requestTimeout, 500);
  assert.equal(recovered.systemUnderTest.service.runOptions.protobuf.requestTimeout, 3000);
  assert.equal(fs.readFileSync(path.join(folder, 'test-timeout.exitcode'), 'utf8').trim(), '1');
  assert.match(fs.readFileSync(path.join(folder, 'test-timeout.terminaloutput'), 'utf8'), /DEADLINE_EXCEEDED/);
});

test('gRPC validation recovery distinguishes extra-property acceptance from declared mock settings', () => {
  const fs = require('node:fs'), path = require('node:path'), yaml = require('js-yaml');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/grpc');
  const text = fs.readFileSync(path.join(folder, 'validation.yaml'), 'utf8');
  const result = inspect(text);
  assert.equal(result.schemaCheck.passed, true);
  assert.deepEqual(result.diagnostics, []);
  const config = yaml.load(text);
  assert.deepEqual(config.systemUnderTest.service.data.examples[0].directories, ['extra-examples']);
  const mock = yaml.load(fs.readFileSync(path.join(folder, 'mock.yaml'), 'utf8'));
  assert.equal(inspect(yaml.dump(mock)).schemaCheck.passed, true);
  mock.dependencies.services[0].service.runOptions.protobuf.host = '127.0.0.1';
  assert.equal(inspect(yaml.dump(mock)).schemaCheck.passed, true);
  assert.equal(require('../src/data/configuration/catalog.json').keys.some(key => key.id === 'ProtobufMockRunOptions/host'), false);
  const bad = JSON.parse(fs.readFileSync(path.join(folder, 'extra-examples/bad.json'), 'utf8'));
  const corrected = JSON.parse(fs.readFileSync(path.join(folder, 'corrected-example.json'), 'utf8'));
  assert.equal(typeof bad.request.name, 'number');
  assert.equal(typeof corrected.request.name, 'string');
  assert.equal(bad.fullMethodName, corrected.fullMethodName);
  assert.deepEqual(bad.response, corrected.response);
});

test('compatibility configurations retain process-directory and path-filter defaults', () => {
  const fs = require('node:fs'), path = require('node:path'), yaml = require('js-yaml');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/compatibility');
  const configs = {};
  for (const name of ['specmatic', 'no-baseline', 'no-target', 'no-repository', 'bad-repository']) {
    const text = fs.readFileSync(path.join(folder, name + '.yaml'), 'utf8');
    assert.equal(inspect(text).schemaCheck.passed, true, name);
    assert.deepEqual(inspect(text).diagnostics, [], name);
    configs[name] = yaml.load(text).specmatic.settings.backwardCompatibility;
  }
  assert.equal(configs.specmatic.baseBranch, 'main');
  assert.equal(configs.specmatic.repoDirectory, 'contracts-demo');
  assert.equal(configs.specmatic.targetPath, 'contract.yaml');
  assert.equal(configs['no-baseline'].baseBranch, undefined);
  assert.equal(configs['no-target'].targetPath, undefined);
  assert.equal(configs['no-repository'].repoDirectory, undefined);
  assert.equal(configs['bad-repository'].repoDirectory, 'missing-demo');
  const original = yaml.load(fs.readFileSync(path.join(folder, 'original.yaml'), 'utf8'));
  const compatible = yaml.load(fs.readFileSync(path.join(folder, 'compatible.yaml'), 'utf8'));
  const breaking = yaml.load(fs.readFileSync(path.join(folder, 'breaking.yaml'), 'utf8'));
  assert.deepEqual(original.paths['/greeting'].get.responses, compatible.paths['/greeting'].get.responses);
  assert.equal(compatible.paths['/greeting'].get.parameters[0].required, false);
  assert.equal(breaking.paths['/greeting'].get.responses['200'].content['application/json'].schema.properties.message.type, 'integer');
});


test('Kafka fixtures separate browser schema acceptance from CLI protocol validation', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/async-kafka');
  for (const name of ['mock', 'mock-override', 'mock-ref', 'mock-components', 'global-ref', 'missing-type', 'deprecated']) {
    const input = fs.readFileSync(path.join(folder, name + '.yaml'), 'utf8');
    const result = inspect(input);
    assert.equal(result.schemaCheck.passed, true, name);
    assert.deepEqual(result.diagnostics, [], name);
  }
  const invalid = inspect(fs.readFileSync(path.join(folder, 'wrong-type.yaml'), 'utf8'));
  assert.equal(invalid.schemaCheck.passed, false);
  assert.ok(invalid.diagnostics.some(item => item.path.endsWith('/asyncapi/type') && item.message.includes('"mock"')));
});


test('Kafka test configs validate without making runtime reachability or deadline claims', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  for (const name of ['test', 'test-short', 'test-endpoint', 'test-readiness']) {
    const text = fs.readFileSync(path.join(__dirname, '../docs/references/configuration/includes/async-kafka-test', name + '.yaml'), 'utf8');
    const result = inspect(text);
    assert.equal(result.schemaCheck.passed, true, name);
    assert.deepEqual(result.diagnostics, [], name);
  }
});


test('AsyncAPI common timing declarations do not make timing keys valid in per-spec mock options', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const mock = fs.readFileSync(path.join(__dirname, '../docs/references/configuration/includes/async-kafka/mock-override.yaml'), 'utf8');
  for (const timing of ['replyTimeout', 'subscriberReadinessWaitTime']) {
    const object = require('js-yaml').load(mock);
    object.dependencies.services[0].service.runOptions.asyncapi.specs[0].spec[timing] = 500;
    assert.equal(inspect(JSON.stringify(object)).schemaCheck.passed, false, timing);
  }
  const inline = require('js-yaml').load(mock);
  delete inline.dependencies.services[0].service.runOptions.asyncapi.type;
  assert.equal(inspect(JSON.stringify(inline)).schemaCheck.passed, true);
  const component = 'version: 3\ncomponents:\n  runOptions:\n    broker:\n      asyncapi:\n        servers: []\n';
  assert.equal(inspect(component).schemaCheck.passed, false);
  assert.equal(inspect(component + '        type: mock\n').schemaCheck.passed, true);
});


test('MCP complete configs validate while schema transport omission remains distinct from runtime requiredness', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/mcp');
  for (const name of fs.readdirSync(folder).filter(name=>name.endsWith('.yaml'))) {
    const text = fs.readFileSync(path.join(folder,name),'utf8');
    assert.equal(inspect(text).schemaCheck.passed,true,name);
  }
  const text = fs.readFileSync(path.join(folder,'specmatic.yaml'),'utf8');
  assert.equal(inspect(text.replace('    transportKind: STREAMABLE_HTTP\n','')).schemaCheck.passed,true);
  assert.equal(inspect(text.replace('STREAMABLE_HTTP','stdio')).schemaCheck.passed,false);
});


test('proxy recipes keep valid V3 structure independently from runtime redaction and list selection', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const folder = path.join(__dirname, '../docs/references/configuration/includes/proxy');
  for (const file of fs.readdirSync(folder).filter(name=>name.endsWith('.yaml'))) {
    const result = inspect(fs.readFileSync(path.join(folder,file),'utf8'));
    assert.equal(result.schemaCheck.passed,true,file);
    assert.deepEqual(result.diagnostics,[],file);
  }
});
