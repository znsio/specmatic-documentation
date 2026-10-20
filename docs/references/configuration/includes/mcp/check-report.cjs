const assert = require('node:assert/strict');
const fs = require('node:fs');
const report = JSON.parse(fs.readFileSync('build/reports/specmatic/mcp/mcp_test_report.json', 'utf8'));
assert.ok(Array.isArray(report) && report.length > 0, 'MCP report has no test scenarios');
assert.ok(report.every(test => test.verdict === 'PASSED'), 'MCP report contains failing scenarios');
console.log('MCP report: all scenarios passed');
