const assert = require('node:assert/strict');
const fs = require('node:fs');
assert.match(fs.readFileSync('reports/TEST-junit-jupiter.xml','utf8'), /<testcase\b/);
assert.equal(fs.existsSync('config/reports/TEST-junit-jupiter.xml'),false);
