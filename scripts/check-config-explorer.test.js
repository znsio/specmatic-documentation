const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const yaml=require('js-yaml');
const catalog=require('../src/data/configuration/catalog.json');
const {inspect}=require('../src/components/ConfigurationInspector/inspect');
const {catalogTree,exampleTree,placementFragment,relationships,relationshipOwner,scopeFacts}=require('../src/components/ConfigurationExplorer/structure');
test('catalog tree retains every canonical entry and deduplicates aliases at a placement',()=>{
  const root=catalogTree(catalog.keys), ids=new Set(), paths=[];
  function visit(n){for(const e of n.entries)ids.add(e.id);paths.push(n.path);for(const c of n.children)visit(c);}
  visit(root);
  assert.equal(ids.size,289);
  assert.deepEqual(root.children.map(n=>n.label),Object.keys(require('../src/data/configuration/schema-v3.json').properties));
  const services=root.children.find(n=>n.label==='dependencies').children.filter(n=>n.label==='services');
  assert.equal(services.length,1);
  assert.ok(services[0].children.some(n=>n.label==='[]'&&n.path==='dependencies.services[]'));
  assert.equal(root.children.filter(n=>n.label.startsWith('proxies')).length,1);
  assert.equal(new Set(paths).size,paths.length);
  assert.ok(!paths.some(p=>p.endsWith('.resiliencyTests')||p.endsWith('.logPrefix')));
  assert.ok(paths.includes('systemUnderTest.service.settings.schemaResiliencyTests'));
});
test('a placement fragment preserves named slots and arrays and is explicitly a fragment',()=>{
  const text=placementFragment('dependencies.services[].service.settings.startTimeoutInMilliseconds',20000);
  assert.deepEqual(yaml.load(placementFragment('',{version:3})),{version:3});
  assert.deepEqual(yaml.load(text),{dependencies:{services:[{service:{settings:{startTimeoutInMilliseconds:20000}}}]}});
});
test('relationship view follows both source reuse and test/mock service use sites in the published demo',()=>{
  const text=fs.readFileSync(path.join(__dirname,'../docs/references/configuration/includes/local-openapi/specmatic-components.yaml'),'utf8');
  const nodes=inspect(text).nodes;
  const tree=exampleTree(nodes);
  assert.equal(tree.pointer,'#');
  const source=relationships(nodes,'#/components/sources/localContracts/filesystem/directory');
  assert.equal(source.scope,'#/components/sources/localContracts');
  assert.equal(source.usedBy.length,2);
  assert.deepEqual(source.usedBy.map(r=>relationshipOwner(r.from)),['#/components/services/booksGateway','#/components/services/booksBackend']);
  assert.equal(relationships(nodes,source.usedBy[0].from).scope,'#/components/services/booksGateway');
  assert.equal(source.uses.length,0);
  const gateway=relationships(nodes,'#/components/services/booksGateway');
  assert.deepEqual(gateway.usedBy,[{from:'#/systemUnderTest/service',to:'#/components/services/booksGateway'}]);
  assert.equal(gateway.uses[0].to,'#/components/sources/localContracts');
  assert.deepEqual(scopeFacts(nodes,gateway.scope).map(f=>f.value),['books.yaml']);
  assert.deepEqual(scopeFacts(nodes,'#/systemUnderTest/service').map(f=>f.value),['test','http://127.0.0.1:9100']);
  for(const fact of scopeFacts(nodes,gateway.scope))assert.ok(nodes.some(n=>n.pointer===fact.pointer));
  const useSite=relationships(nodes,'#/systemUnderTest/service/runOptions/openapi/baseUrl');
  assert.equal(useSite.scope,'#/systemUnderTest/service');
  assert.equal(useSite.uses[0].to,'#/components/services/booksGateway');
});

const {placementFacets,matchesPlacement,preferredPlacement}=require('../src/components/ConfigurationExplorer/structure');
test('tree, operation filters and fragments respect variant-specific exclusions',()=>{
  const paths=[];
  function visit(node){paths.push(node.path);node.children.forEach(visit);}
  visit(catalogTree(catalog.keys));
  for (const key of ['replyTimeout','subscriberReadinessWaitTime']) {
    const entry=catalog.keys.find(k=>k.id===`AsyncApiRunOptionSpecificationCommon/${key}`);
    assert.equal(matchesPlacement(entry,'mock','asyncapi'),false);
    assert.equal(matchesPlacement(entry,'test','asyncapi'),true);
    assert.ok(!paths.includes(`dependencies.services[].service.runOptions.asyncapi.specs[].spec.${key}`));
    const placement=preferredPlacement(entry,'test','asyncapi');
    assert.equal(placement,`systemUnderTest.service.runOptions.asyncapi.specs[].spec.${key}`);
    const fragment=yaml.load(placementFragment(placement,1000));
    assert.equal(fragment.systemUnderTest.service.runOptions.asyncapi.specs[0].spec[key],1000);
  }
  const legacy=catalog.keys.find(k=>k.id==='AsyncApiRunOptionSpecificationCommon/inMemoryBroker');
  assert.equal(matchesPlacement(legacy,'test','asyncapi'),false);
  assert.equal(matchesPlacement(legacy,'mock','asyncapi'),true);
  const timeout=catalog.keys.find(k=>k.id==='ProtobufRunOptionSpecificationCommon/requestTimeout');
  assert.equal(matchesPlacement(timeout,'mock','protobuf'),false);
  assert.equal(matchesPlacement(timeout,'test','protobuf'),true);
});
test('placement filters distinguish dedicated variants and retain shared or unclassified keys',()=>{
  const byId=id=>catalog.keys.find(k=>k.id===id);
  assert.deepEqual(placementFacets(byId('OpenApiTestRunOptions/port')),{operations:['test'],protocols:['openapi']});
  assert.deepEqual(placementFacets(byId('MockSettings/strictMode')).operations,['mock']);
  assert.equal(matchesPlacement(byId('MockSettings/strictMode'),'test','openapi'),false);
  assert.equal(matchesPlacement(byId('OpenApiTestRunOptions/port'),'test','wsdl'),false);
  assert.equal(matchesPlacement(byId('OpenApiTestRunOptions/port'),'test','openapi'),true);
  assert.equal(matchesPlacement(byId('Root/version'),'mock','asyncapi'),true);
  assert.equal(matchesPlacement(byId('GitSourceOptions/url'),'test','protobuf'),true);
  assert.deepEqual(placementFacets(byId('McpTestRunOptions/baseUrl')).operations,['mcp']);
  assert.deepEqual(placementFacets(byId('Root/proxies')).operations,['proxy']);
  assert.equal(matchesPlacement(byId('Root/proxies'),'test'),false);
  for (const [owner,protocol] of [['OpenApi','openapi'],['Wsdl','wsdl'],['GraphqlSdl','graphqlsdl'],['Protobuf','protobuf'],['AsyncApi','asyncapi']]) {
    for (const entry of catalog.keys.filter(key=>key.owner.includes(owner))) {
      assert.ok(placementFacets(entry).protocols.includes(protocol),entry.id);
    }
  }
  for(const entry of catalog.keys) assert.equal(matchesPlacement(entry),true,entry.id);
});
test('filtered selections prefer the matching use site without losing alias identity',()=>{
  const entry=catalog.keys.find(k=>k.id==='DataDefinition/examples');
  assert.match(preferredPlacement(entry,'test'),/^systemUnderTest/);
  assert.match(preferredPlacement(entry,'mock'),/^dependencies/);
  const alias=catalog.keys.find(k=>k.id==='TestSettings/schemaResiliencyTests');
  assert.ok(preferredPlacement(alias,'test').endsWith('.schemaResiliencyTests'));
  assert.equal(catalog.keys.length,289);
});
