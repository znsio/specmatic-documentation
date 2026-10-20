const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const catalog = require('../src/data/configuration/catalog.json');
const schema = require('../src/data/configuration/schema-v3.json');
const find = id => catalog.keys.find(key => key.id === id);

test('authentication guidance separates credential lookup from mock enforcement', () => {
  const map=find('OpenApiRunOptionSpecification/securitySchemes').runtime;
  assert.match(map.effect,/spec ID and scheme name must match/);
  assert.match(map.caveat,/absent bearer header and arbitrary bearer token/);
  const token=find('SecuritySchemeConfigurationV3/token').runtime;
  assert.match(token.precedence,/nonblank configured token wins/);
  assert.match(token.omission,/blank configured token is ignored/);
  assert.match(find('SecuritySchemeConfigurationV3/type').runtime.effect,/mismatched valid enum/);
  assert.equal(token.verification.recipe,'/references/configuration/authentication');
});

test('TLS guidance distinguishes server/client identities, passwords and directory effects', () => {
  assert.match(find('CertConfiguration/mtlsEnabled').runtime.caveat,/insecure trust manager/);
  assert.match(find('CertConfiguration/mtlsEnabled').runtime.caveat,/HTTP\/1.1/);
  assert.match(find('KeyStoreFileConfiguration/password').description,/private key/);
  assert.match(find('KeyStoreDirectoryConfiguration/directory').runtime.effect,/deletes an existing specmatic.jks/);
  assert.equal(find('KeyStoreDirectoryConfiguration/directory').runtime.verification,undefined);
  assert.match(find('KeyStoreFileConfiguration/file').runtime.effect,/tests additionally accept .p12/);
  assert.match(find('CertConfiguration/keyStorePassword').runtime.precedence,/correct CLI store password does not replace/);
  assert.equal(find('Components/certificates').runtime.verification.recipe,'/references/configuration/https');
});

test('release baseline matches committed versions and schema without requiring local JARs', () => {
  const crypto = require('node:crypto');
  const manifest = require('../src/data/configuration/source-manifest.json');
  const versions = require('../src/constants/specmatic-versions.json');
  const verification = manifest.runtimeVerification;
  assert.equal(verification.configurationFormatVersion,3);
  const schemaHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'src/data/configuration/schema-v3.json'))).digest('hex');
  assert.equal(manifest.schemaSha256,schemaHash);
  for (const [edition,constant] of [['oss','specmatic-core-version'],['enterprise','specmatic-enterprise-version']]) {
    const artifact = verification.artifacts[edition];
    assert.equal(artifact.version,versions[constant]);
    assert.equal(artifact.version,manifest.releases[edition]);
    assert.ok(artifact.mavenCoordinate.endsWith(':'+artifact.version));
    assert.match(artifact.jarSha256,/^[a-f0-9]{64}$/);
    assert.match(artifact.executableRevision,/^[a-f0-9]{40}$/);
    assert.match(artifact.embeddedCore.revision,/^[a-f0-9]{40}$/);
    assert.ok(artifact.versionOutput.includes(artifact.version));
    assert.ok(artifact.versionOutput.includes(artifact.executableRevision.slice(0,8)));
    assert.equal(artifact.packagedSchemaSha256,schemaHash);
  }
  for (const difference of verification.knownDifferences.filter(item=>item.path)) {
    assert.equal(difference.researchRevision,manifest.revisions[difference.repo]);
    assert.equal(difference.releaseRevision,verification.artifacts[difference.repo].executableRevision);
    assert.ok(manifest.sources.some(source=>source.repo===difference.repo && source.path===difference.path));
  }
  assert.match(verification.scope,/identity and schema parity only/i);
});

test('absence constraints cross conjuncts and refs without banning combinations or alternatives', () => {
  const {forbiddenProperties} = require('./config-schema-exclusions');
  const definitions = {common: {not: {required: ['legacy']}}};
  const result = forbiddenProperties({allOf: [{$ref: 'common'}, {not: {anyOf: [
    {required: ['timing']}, {required: ['a', 'b']}
  ]}}], anyOf: [{not: {required: ['alternative']}}], properties: {
    child: {not: {required: ['nested']}}
  }}, ref => definitions[ref]);
  assert.deepEqual([...result].sort(), ['legacy', 'timing']);
  assert.deepEqual([...forbiddenProperties({$ref: 'cycle'}, () => ({$ref: 'cycle'}))], []);
  assert.throws(()=>forbiddenProperties({not: {properties: {type: {const: 'mock'}}}}, ()=>{}), /Review new schema exclusion/);
});

test('catalog removes variant-forbidden paths while retaining valid shared declarations', () => {
  const suffix = '.runOptions.asyncapi.specs[].spec.';
  for (const key of ['replyTimeout', 'subscriberReadinessWaitTime']) {
    const entry = find(`AsyncApiRunOptionSpecificationCommon/${key}`);
    assert.ok(!entry.contexts.includes('dependencies.services[].service' + suffix + key));
    assert.ok(entry.contexts.includes('systemUnderTest.service' + suffix + key));
    assert.ok(entry.contexts.includes('components.runOptions.<name>.asyncapi.specs[].spec.' + key));
  }
  const legacy = find('AsyncApiRunOptionSpecificationCommon/inMemoryBroker');
  assert.ok(!legacy.contexts.includes('systemUnderTest.service' + suffix + 'inMemoryBroker'));
  assert.ok(legacy.contexts.includes('dependencies.services[].service' + suffix + 'inMemoryBroker'));
  for (const key of ['host','logDir','port']) {
    const entry = find(`InMemoryBrokerConfiguration/${key}`);
    assert.ok(!entry.contexts.includes('systemUnderTest.service' + suffix + 'inMemoryBroker.' + key));
    assert.ok(entry.contexts.includes('dependencies.services[].service' + suffix + 'inMemoryBroker.' + key));
  }
  const timeout = find('ProtobufRunOptionSpecificationCommon/requestTimeout');
  assert.ok(!timeout.contexts.includes('dependencies.services[].service.runOptions.protobuf.specs[].spec.requestTimeout'));
  assert.ok(timeout.contexts.includes('systemUnderTest.service.runOptions.protobuf.specs[].spec.requestTimeout'));
  const reference = fs.readFileSync(path.join(root,'docs/references/configuration/all-keys.mdx'),'utf8');
  assert.ok(!reference.includes('dependencies.services[].service.runOptions.asyncapi.specs[].spec.replyTimeout'));
  assert.ok(!reference.includes('systemUnderTest.service.runOptions.asyncapi.specs[].spec.inMemoryBroker'));
  assert.ok(!reference.includes('dependencies.services[].service.runOptions.protobuf.specs[].spec.requestTimeout'));
});

test('every schema property declaration is accounted for exactly once', () => {
  const actual = [];
  function walk(node, pointer = '#') {
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node.properties || {})) actual.push(`${pointer}/properties/${key.replace(/~/g,'~0').replace(/\//g,'~1')}`);
    for (const [key, child] of Object.entries(node)) walk(child, `${pointer}/${key.replace(/~/g,'~0').replace(/\//g,'~1')}`);
  }
  walk(schema);
  const indexed = catalog.keys.flatMap(key => key.declarations);
  assert.deepEqual(indexed.slice().sort(), actual.sort());
  assert.equal(new Set(indexed).size, indexed.length);
});
test('binding aliases consolidate without inventing hook aliases', () => {
  assert.deepEqual(find('TestSettings/schemaResiliencyTests').aliases, ['resiliencyTests']);
  assert.deepEqual(find('LogOutputConfiguration/logFilePrefix').aliases, ['logPrefix']);
  assert.equal(find('TestSettings/resiliencyTests'), undefined);
  assert.ok(find('AdapterConfiguration/stubLoadContract'));
  assert.ok(find('AdapterConfiguration/stub_load_contract'));
});
test('placements traverse references, named maps, arrays and conditional protocol variants', () => {
  assert.ok(find('TestSettings/timeoutInMilliseconds').contexts.includes('systemUnderTest.service.settings.timeoutInMilliseconds'));
  assert.ok(find('TestSettings/timeoutInMilliseconds').contexts.includes('specmatic.settings.test.timeoutInMilliseconds'));
  assert.ok(find('SpecificationObject/id').contexts.includes('components.services.<name>.definitions[].definition.specs[].spec.id'));
  assert.ok(find('OpenApiTestRunOptions/baseUrl').contexts.includes('components.runOptions.<name>.openapi.baseUrl'));
  assert.ok(find('LogOutputConfiguration/logFilePrefix').contexts.includes('specmatic.settings.general.logging.text.logPrefix'));
});
test('generated catalog and readable reference are reproducible', () => {
  execFileSync(process.execPath, [path.join(__dirname,'build-config-catalog.js'),'--check']);
  assert.ok(fs.readFileSync(path.join(root,'docs/references/configuration/all-keys.mdx'),'utf8').includes('schemaResiliencyTests'));
});
test('field behavior appears in both reference surfaces with scoped evidence and bounded execution claims',()=>{
  const notes=require('../src/data/configuration/field-behavior.json');
  const coverage=require('../src/data/configuration/coverage.json');
  const sources=require('../src/data/configuration/source-manifest.json').sources;
  const document=fs.readFileSync(path.join(root,'docs/references/configuration/all-keys.mdx'),'utf8');
  const referenceText=document.replace(/<\/?code>/g,'').replace(/&#123;/g,'{').replace(/&#125;/g,'}').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  for (const [id,note] of Object.entries(notes)) {
    assert.deepEqual(find(id).runtime,note);
    const row=coverage.find(item=>item.id===id);
    assert.equal(row.fieldDefaultsAndPrecedence,'source-traced-scoped');
    if(note.verification) {
      assert.deepEqual(row.executionEvidence,note.verification);
      assert.equal(row.runnableExample,note.verification.recipe);
      assert.ok(fs.existsSync(path.join(root,'docs',row.runnableExample+'.mdx')));
      assert.ok(note.verification.assertions.length);
    } else assert.equal(row.executionEvidence,'pending');
    if(note.guide) {
      assert.ok(fs.existsSync(path.join(root,'docs',note.guide+'.mdx')),`Missing guide: ${id}`);
      if(!note.verification) assert.ok(document.includes(`[See the complete configuration guide](${note.guide})`),`Missing guide link: ${id}`);
    }
    assert.deepEqual(row.behaviorEvidence,note.evidence);
    for(const evidence of note.evidence) {
      const [repo,location]=evidence.split(':');
      assert.ok(sources.some(source=>source.repo===repo && source.path===location.split('#')[0]),`Untracked reviewed consumer: ${evidence}`);
    }
    assert.ok(referenceText.includes(note.omission),`Missing omission guidance: ${id}`);
  }
  assert.equal(coverage.find(item=>item.id==='MockSettings/strictMode').fieldDefaultsAndPrecedence,'source-traced-scoped');
  assert.ok(catalog.keys.filter(key=>key.owner==='MockSettings').every(key=>notes[key.id]));
  assert.equal(coverage.find(item=>item.id==='MockSettings/lenientMode').executionEvidence,'pending');
  assert.ok(catalog.keys.filter(key=>key.owner==='TestSettings').every(key=>notes[key.id]));
  assert.equal(coverage.find(item=>item.id==='TestSettings/lenientMode').executionEvidence,'pending');
});

test('static reference renders example target URLs as literal values',()=>{
  const document=fs.readFileSync(path.join(root,'docs/references/configuration/all-keys.mdx'),'utf8');
  assert.ok(document.includes('<code>http://localhost:9000</code>.'));
  assert.ok(document.includes('<code>http://127.0.0.1:9100</code>'));
  assert.ok(document.includes('<code>http://127.0.0.1:9102</code>'));
});

test('WSDL coverage distinguishes source explanations from verified transport behavior', () => {
  const keys = catalog.keys.filter(key => key.owner.includes('Wsdl'));
  assert.equal(keys.length, 18);
  assert.ok(keys.every(key => key.runtime?.omission && key.runtime?.precedence));
  for (const role of ['Mock', 'Test']) {
    assert.equal(find(`Wsdl${role}RunOptions/cert`).runtime.verification, undefined);
    assert.match(find(`Wsdl${role}RunOptions/cert`).runtime.caveat, /TLS\/mTLS execution remains pending/);
    assert.equal(find(`Wsdl${role}RunOptions/baseUrl`).runtime.verification.recipe, '/references/configuration/wsdl');
  }
  assert.match(find('WsdlRunOptionSpecification/host').runtime.omission, /does not inherit the service host/);
  assert.equal(find('WsdlRunOptionSpecification/host').runtime.verification, undefined);
  assert.equal(find('FeatureFlags/escapeSoapAction').runtime.verification.assertions.length, 3);
});

test('GraphQL reference keeps edition and whole-map consumer boundaries visible', () => {
  const keys = catalog.keys.filter(key => key.owner.includes('Graphql'));
  assert.equal(keys.length, 12);
  assert.ok(keys.every(key => key.runtime?.scope.includes('Enterprise 1.28.3')));
  assert.match(find('GraphqlSdlRunOptionSpecificationCommon/port').runtime.omission, /not the outer service port/);
  assert.match(find('GraphqlSdlCommonRunOptions/host').runtime.caveat, /one listener/);
  for (const key of keys.filter(key => key.runtime.verification)) {
    assert.deepEqual(key.runtime.verification.editions, ['Enterprise 1.28.3']);
    assert.equal(key.runtime.verification.recipe, '/references/configuration/graphql');
  }
  assert.match(find('DataDefinition/examples').runtime.caveat, /test runner still reads the colocated/);
});

test('compatibility guidance distinguishes skipped comparisons and unverified Insights strictness', () => {
  const keys = catalog.keys.filter(key => key.owner === 'BackwardCompatibilitySettings');
  assert.equal(keys.length, 4);
  assert.ok(keys.every(key => key.runtime?.scope && key.runtime?.omission));
  assert.match(find('BackwardCompatibilitySettings/baseBranch').runtime.omission, /otherwise the current branch/);
  assert.match(find('BackwardCompatibilitySettings/targetPath').runtime.caveat, /substring filter/);
  assert.equal(find('BackwardCompatibilitySettings/strictMode').runtime.verification, undefined);
  assert.match(find('BackwardCompatibilitySettings/strictMode').runtime.caveat, /execution-pending/);
  for (const key of keys.filter(key => key.runtime.verification)) {
    assert.deepEqual(key.runtime.verification.editions, ['OSS 2.55.3', 'Enterprise 1.28.3']);
    assert.equal(key.runtime.verification.recipe, '/references/configuration/compatibility');
  }
});


test('AsyncAPI server notes retain scoped Kafka evidence and the server inheritance exception', () => {
  const ids = ['AsyncApiCommonRunOptions/servers', 'AsyncApiRunOptionSpecificationCommon/servers', 'AsyncClientServerConfig/host', 'AsyncClientServerConfig/protocol', 'AsyncClientServerConfig/type', 'AsyncServerReferenceConfig/type', 'AsyncServerReferenceConfig/$serverRef', 'AsyncApiMockRunOptions/inMemoryBroker'];
  for (const id of ids) {
    const note = find(id).runtime;
    assert.ok(note.omission && note.precedence && note.caveat, id);
    assert.deepEqual(note.verification.editions, ['Enterprise 1.28.3']);
    assert.equal(note.verification.recipe, '/references/configuration/async-kafka');
  }
  assert.match(find(ids[0]).runtime.precedence, /special exception to whole-map replacement/);
  assert.match(find('AsyncClientServerConfig/type').runtime.omission, /requires an explicit type/);
  assert.match(find('AsyncServerReferenceConfig/$serverRef').runtime.caveat, /spec level, with AsyncAPI 3/);
  assert.match(find('AsyncApiTestRunOptions/replyTimeout').runtime.caveat, /Do not describe DTO selection as an effective CLI deadline/);
});


test('Kafka test timeout guidance separates the fixed CLI wait from DTO and per-spec selection', () => {
  const service = find('AsyncApiTestRunOptions/replyTimeout').runtime;
  const spec = find('AsyncApiRunOptionSpecificationCommon/replyTimeout').runtime;
  assert.match(service.precedence, /already-created timeout argument/);
  assert.equal(service.verification.recipe, '/references/configuration/async-kafka-test');
  assert.equal(spec.verification, undefined);
  assert.match(spec.caveat, /not a mock response-delay selector/);
  assert.match(find('AsyncClientServerConfig/host').runtime.caveat, /initial availability check/);
});


test('AsyncAPI mode, identity and readiness notes preserve use-site boundaries', () => {
  for (const role of ['Mock', 'Test']) {
    for (const id of [`AsyncApi${role}RunOptions/type`, `AsyncApi${role}RunOptions/specs`, `AsyncApi${role}RunOptionSpecificationEntry/spec`]) {
      assert.ok(find(id).runtime.omission && find(id).runtime.precedence, id);
    }
  }
  assert.match(find('ComponentAsyncApiRunOptions/type').runtime.omission, /Required in this component schema/);
  assert.match(find('AsyncApiRunOptionSpecificationCommon/id').runtime.precedence, /first exact matching ID/);
  assert.match(find('AsyncApiRunOptionSpecificationCommon/subscriberReadinessWaitTime').runtime.caveat, /per-spec mock variant forbids/);
  assert.equal(find('AsyncApiRunOptionSpecificationCommon/subscriberReadinessWaitTime').runtime.verification, undefined);
});


test('MCP notes cover its scoped keys without treating a successful exit as all-pass evidence', () => {
  for (const key of catalog.keys.filter(key => key.owner.startsWith('Mcp') || key.id === 'Root/mcp')) {
    assert.ok(key.runtime?.omission && key.runtime?.precedence && key.runtime?.caveat, key.id);
    assert.deepEqual(key.runtime.verification.editions, ['OSS 2.55.3', 'Enterprise 1.28.3']);
    assert.equal(key.runtime.verification.recipe, '/references/configuration/mcp');
  }
  assert.match(find('Root/mcp').runtime.caveat, /at least one scenario passed/);
  assert.match(find('McpTestRunOptions/filterTools').runtime.precedence, /combine as a set/);
  assert.match(find('McpTestRunOptions/dictionaryFile').runtime.omission, /nonexistent files/);
  assert.match(find('McpTestRunOptions/transportKind').runtime.omission, /without an effective CLI\/config transport/);
});


test('proxy notes retain first-entry selection and observed recording/redaction boundaries', () => {
  const ids = ['Root/proxies', 'ProxyEntry/proxy', 'ProxyDefinition/baseUrl', 'ProxyDefinition/target', 'ProxyDefinition/timeoutInMilliseconds', 'ProxyDefinition/recordingsDirectory', 'ProxySettings/recordRequests', 'ProxySettings/ignoreHeaders'];
  for (const id of ids) {
    const note = find(id).runtime;
    assert.ok(note.omission && note.precedence && note.caveat, id);
    assert.deepEqual(note.verification.editions, ['OSS 2.55.3', 'Enterprise 1.28.3']);
    assert.equal(note.verification.recipe, '/references/configuration/proxy');
  }
  assert.match(find('Root/proxies').runtime.effect, /only the first entry/);
  assert.match(find('ProxySettings/ignoreHeaders').runtime.caveat, /header removal|unchanged accumulator/);
  assert.match(find('ProxySettings/recordRequests').runtime.caveat, /not console traffic logs/);
  assert.equal(find('ProxyDefinition/cert').runtime, undefined);
});
