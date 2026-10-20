const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const scenario = process.argv[2];
const checked = new Set(['compatible.sh', 'breaking.sh', 'recovery.sh', 'recovery-after-breaking.sh', 'cli-target.sh', 'default-target.sh', 'default-repository.sh', 'cli-repository.sh']);
if (!checked.has(scenario)) process.exit(0);
const base = scenario === 'default-repository.sh' ? 'contracts-demo' : '.';
const folder = path.join(base, 'build/reports/specmatic/backward_compatibility');
const report = JSON.parse(fs.readFileSync(path.join(folder, 'ctrf/ctrf-report.json'), 'utf8'));
const failing = new Set(['breaking.sh', 'cli-target.sh', 'default-target.sh']).has(scenario);
assert.ok(report.results.summary.tests > 0);
assert.equal(report.results.summary.failed > 0, failing);
const details = report.results.summary.extra.executionDetails;
const expectedSpecs = scenario === 'default-target.sh' ? ['contract.yaml', 'other.yaml'] : [scenario === 'cli-target.sh' ? 'other.yaml' : 'contract.yaml'];
assert.deepEqual(details.map(entry => entry.specification).sort(), expectedSpecs.sort());
for (const entry of details) {
  assert.equal(entry.branch, 'main');
  assert.ok(entry.operations.some(operation => operation.path === '/greeting' && operation.method === 'GET' && operation.responseCode === 200));
}
assert.ok(fs.readFileSync(path.join(folder, 'html/index.html'), 'utf8').includes('<html'));
