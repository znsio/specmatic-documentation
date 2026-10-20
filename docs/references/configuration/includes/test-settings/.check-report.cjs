const assert = require('node:assert/strict');
const fs = require('node:fs');
const report = fs.readFileSync('reports/TEST-junit-jupiter.xml', 'utf8');
assert.match(report, /<testcase\b/);
assert.match(report, /handbook/);
