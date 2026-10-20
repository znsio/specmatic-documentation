const assert=require('node:assert/strict');
const fs=require('node:fs');
const name=process.argv[2];
const requests=fs.readFileSync('targets.log','utf8').split('\n').filter(line=>line.startsWith('{')).map(JSON.parse);
if(name==='invalid-environment.sh') {assert.equal(requests.length,0);process.exit(0);}
const expected={
  'configured.sh':9100,
  'configured-environment.sh':9100,
  'configured-cli-port.sh':9100,
  'cli-base-url.sh':9100,
  'cli-fallback.sh':9102,
  'environment-property.sh':9102,
  'host-port.sh':9102,
  'no-target.sh':9000,
  'template-target.sh':9102,
}[name];
assert.ok(expected,`Missing routing assertion for ${name}`);
assert.ok(requests.some(r=>r.port===expected && r.path==='/books/1'));
assert.equal(requests.some(r=>r.port!==expected),false);
assert.match(fs.readFileSync('reports/TEST-junit-jupiter.xml','utf8'),/<testcase\b/);
