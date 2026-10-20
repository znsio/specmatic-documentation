const validate = require('../../data/configuration/validate-v3');
const encode = key => key.replace(/~/g,'~0').replace(/\//g,'~1');
function checkSchema(value) {
  const passed = validate(value);
  const diagnostics = [];
  const seen = new Set();
  for (const error of validate.errors || []) {
    if (error.keyword === 'if') continue; // The concrete branch failures carry the useful explanation.
    let path = '#' + error.instancePath;
    let message;
    const p = error.params;
    switch (error.keyword) {
      case 'required': path += '/' + encode(p.missingProperty); message = `Add the required “${p.missingProperty}” field in this object. See the parent's key reference for a complete example.`; break;
      case 'additionalProperties': path += '/' + encode(p.additionalProperty); message = `“${p.additionalProperty}” is not allowed in this object variant. Check its supported parent in the key reference; move it there rather than discarding its value.`; break;
      case 'type': message = `Use ${p.type === 'integer' ? 'a whole number without quotes' : p.type === 'array' ? 'a YAML list (items beginning with -)' : p.type === 'object' ? 'a nested YAML object' : `a ${p.type} value`} here. ${p.type==='integer'?'For example: port: 9101 or timeoutInMilliseconds: 5000, depending on the field.':''}`.trim(); break;
      case 'const': message = `This variant requires ${JSON.stringify(p.allowedValue)}. Check the test/mock use site before changing the value.`; break;
      case 'enum': message = `Choose one of: ${p.allowedValues.map(v=>JSON.stringify(v)).join(', ')}.`; break;
      case 'format': message = 'Use an absolute URI, for example http://127.0.0.1:9100 for an HTTP endpoint.'; break;
      case 'anyOf': case 'oneOf': message = 'This object does not match the supported alternatives. Check the enclosing variant and the detailed field issues below; requirements from different alternatives are not a combined checklist.'; break;
      default: message = `Schema constraint: ${error.message}. Check the field's constraints in the reference.`;
    }
    const signature = `${path}:${message}`;
    if (!seen.has(signature)) { diagnostics.push({path,message});seen.add(signature); }
  }
  const omitted = Math.max(0,diagnostics.length-30);
  return {passed,diagnostics:diagnostics.slice(0,30),omitted};
}
module.exports = {checkSchema};
