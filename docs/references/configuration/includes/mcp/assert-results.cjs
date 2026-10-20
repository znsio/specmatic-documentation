const assert = require('node:assert/strict');
const fs = require('node:fs');
const name = process.argv[2];
const report = JSON.parse(fs.readFileSync('build/reports/specmatic/mcp/mcp_test_report.json', 'utf8'));
const schema = JSON.parse(fs.readFileSync('build/reports/specmatic/mcp/tools_schema.json', 'utf8'));
assert.ok(Array.isArray(report));
assert.deepEqual(schema.map(tool => tool.name).sort(), name === 'bad-auth' ? [] : ['broken','echo']);
const count = name === 'mixed' || name === 'gate-mixed' ? 2 : name === 'resilience' ? 4 : ['empty','bad-auth'].includes(name) ? 0 : 1;
assert.equal(report.length, count);
const calls = fs.existsSync('calls.jsonl') ? fs.readFileSync('calls.jsonl','utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line)) : [];
assert.equal(calls.length, count);
if (count === 0) process.exit(0);
assert.deepEqual(report.map(test=>test.toolName).sort(), count === 2 ? ['broken','echo'] : Array(count).fill('echo'));
for (const test of report) {
  assert.equal(test.verdict, test.toolName === 'broken' ? 'FAILED' : 'PASSED');
  if (test.toolName === 'echo' && !test.negative) {
    assert.equal(test.response.result.isError, false);
    assert.deepEqual(test.response.result.structuredContent, test.request);
    if (name !== 'missing-dictionary') assert.equal(test.request.text, name === 'dictionary-cli' ? 'hello CLI' : 'hello docs');
  }
}
if (name === 'resilience') assert.equal(report.filter(test=>test.negative).length, 3);
