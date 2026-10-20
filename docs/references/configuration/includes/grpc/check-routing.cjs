const assert = require('node:assert/strict');
const fs = require('node:fs');
const port = Number(process.argv[2]);
const requests = fs.readFileSync('target.log','utf8').split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line));
assert.deepEqual(requests, [{port, method:'/docs.Greeter/SayHello', name:process.argv[3] === 'test-custom.sh' ? 'team' : 'docs'}]);
