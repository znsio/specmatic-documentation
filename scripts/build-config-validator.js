// Generate a browser-safe validator: no runtime schema compilation or remote loading.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const standalone = require('ajv/dist/standalone').default;
const schema = require('../src/data/configuration/schema-v3.json');
const ajv = new Ajv({allErrors:true, strict:false, strictNumbers:true, ownProperties:true, code:{source:true}});
addFormats(ajv, ['uri']);
const validate = ajv.compile(schema);
const output = '// Generated from schema-v3.json by scripts/build-config-validator.js. Do not edit.\n' + standalone(ajv,validate) + '\n';
const file = path.resolve(__dirname,'../src/data/configuration/validate-v3.js');
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(file,'utf8'),output,'Stale browser validator; run node scripts/build-config-validator.js');
else fs.writeFileSync(file,output);
console.log(`Resolved V3 validator ${process.argv.includes('--check')?'checked':'generated'} (${output.length} bytes).`);
