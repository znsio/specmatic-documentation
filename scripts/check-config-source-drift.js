// Run with local sibling checkouts when refreshing the research baseline, never during a docs build.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const directory = path.join(root,'src/data/configuration');
const repoPaths = {specmatic:path.resolve(process.argv[2] || path.join(root,'../specmatic')),enterprise:path.resolve(process.argv[3] || path.join(root,'../enterprise'))};
const folders = {
  specmatic:['core/src/main/kotlin/io/specmatic/core/config'],
  enterprise:['async/src/main/kotlin/io/specmatic/async/internal/client/config','async/src/main/kotlin/io/specmatic/async/internal/configvalidation','grpc/src/main/kotlin/io/specmatic/grpc/internal/application/command/config','graphql/src/main/kotlin/io/specmatic/graphql/internal/config'],
};
const extras = {
  specmatic:['application/src/main/kotlin/application/ConfigCommand.kt','core/src/main/kotlin/io/specmatic/core/SpecmaticConfig.kt','core/src/main/kotlin/io/specmatic/core/Configuration.kt','core/src/main/kotlin/io/specmatic/core/config/v3/SpecmaticConfigV3Impl.kt','core/src/main/kotlin/io/specmatic/core/utilities/Flags.kt'],
  enterprise:['grpc/src/main/kotlin/io/specmatic/grpc/junit/GrpcTestSettings.kt','graphql/src/main/kotlin/io/specmatic/graphql/internal/test/GraphQLTestSettings.kt'],
};
const fieldNotes = require('../src/data/configuration/field-behavior.json');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function files(dir) {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const sources=[];
for(const [repo,repoPath] of Object.entries(repoPaths)) {
  const reviewedFiles=Object.values(fieldNotes).flatMap(note=>note.evidence).filter(ref=>ref.startsWith(repo+':')).map(ref=>ref.slice(repo.length+1).split('#')[0]);
  const names=[...new Set([...folders[repo].flatMap(folder=>files(path.join(repoPath,folder))),...[...extras[repo],...reviewedFiles].map(file=>path.join(repoPath,file))])].filter(file=>file.endsWith('.kt')).sort();
  for(const file of names)sources.push({repo,path:path.relative(repoPath,file),sha256:hash(file)});
}
const schemaPath='core/src/main/resources/config-validation/config-v3-resolved.schema.json';
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(repoPaths.specmatic,schemaPath))),JSON.parse(fs.readFileSync(path.join(directory,'schema-v3.json'))),'Schema drift: review and refresh schema-v3.json');
const manifestFile=path.join(directory,'source-manifest.json');
if(process.argv.includes('--record')) {
  const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile)) : {};
  const revisions=Object.fromEntries(Object.entries(repoPaths).map(([repo,dir])=>[repo,execFileSync('git',['rev-parse','HEAD'],{cwd:dir,encoding:'utf8'}).trim()]));
  fs.writeFileSync(manifestFile,JSON.stringify({recorded:new Date().toISOString().slice(0,10),releases:{oss:require('../src/constants/specmatic-versions.json')['specmatic-core-version'],enterprise:require('../src/constants/specmatic-versions.json')['specmatic-enterprise-version']},revisions,schemaSha256:hash(path.join(directory,'schema-v3.json')),sources,...(previous.runtimeVerification ? {runtimeVerification:previous.runtimeVerification} : {})},null,2)+'\n');
  console.log(`Recorded ${sources.length} source fingerprints. Recording is a baseline update, not a runtime behavior check.`);
} else {
  const old=JSON.parse(fs.readFileSync(manifestFile));
  assert.deepEqual(old.sources,sources,'Config models/accessors/DTOs changed: review runtime notes and coverage before recording a new baseline');
  console.log(`No drift in ${sources.length} tracked configuration sources. Consumer-only changes still require manual review.`);
}
