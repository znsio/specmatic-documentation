const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const response = await fetch(`http://127.0.0.1:${process.argv[2]}/soap`, {
    method: 'POST', headers: {'Content-Type':'text/xml', SOAPAction:'http://specmatic.io/SOAPService/SimpleOperation'},
    body: fs.readFileSync('request.xml', 'utf8'),
  });
  assert.equal(response.status, 200);
  const normalize = xml => xml.replace(/>\s+</g, '><').trim();
  assert.equal(normalize(await response.text()), normalize(fs.readFileSync('response.xml', 'utf8')));
})().catch(error => { console.error(error); process.exitCode = 1; });
