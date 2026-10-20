const yaml = require('js-yaml');
const {checkSchema} = require('../ConfigurationInspector/check-schema');
const defaults = {
  task:'mock', form:'inline', source:'filesystem', directory:'.', url:'', branch:'',
  sourceName:'contracts', testName:'booksApi', mockName:'booksBackend',
  testSpecs:'books.yaml', mockSpecs:'books.yaml', baseUrl:'http://127.0.0.1:9100', host:'127.0.0.1', port:'9101',
  timeoutEnabled:false, timeout:'5000', examples:'', dictionary:'',
};
const lines = text => text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
const namePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
function build(options) {
  const o = {...defaults,...options};
  const errors=[];
  if (!['mock','test','both'].includes(o.task)) errors.push('Choose mock, test, or test with mocked dependencies.');
  if (!['inline','components'].includes(o.form)) errors.push('Choose inline or reusable components.');
  if (!['filesystem','git','web'].includes(o.source)) errors.push('Choose a filesystem, Git, or web source.');
  const testing=o.task!=='mock', mocking=o.task!=='test';
  if(testing && !lines(o.testSpecs).length)errors.push('Add at least one contract path for the API under test.');
  if(mocking && !lines(o.mockSpecs).length)errors.push('Add at least one contract path for the mock.');
  if(o.form==='components') {
    for(const [label,value] of [['Source',o.sourceName],...(testing?[['Test service',o.testName]]:[]),...(mocking?[['Mock service',o.mockName]]:[])]) if(!namePattern.test(value))errors.push(`${label} starter name must start with a letter and use letters, numbers, underscores or hyphens.`);
    if(testing && mocking && o.testName===o.mockName)errors.push('Give the test and mock services different names.');
  }
  if(mocking && !o.host.trim())errors.push('Set the mock listener host, for example 127.0.0.1.');
  if(mocking && (!/^\d+$/.test(o.port)||Number(o.port)<1||Number(o.port)>65535))errors.push('Use a mock port from 1 to 65535.');
  if(testing && o.timeoutEnabled && (!/^\d+$/.test(o.timeout)||Number(o.timeout)<1||!Number.isSafeInteger(Number(o.timeout))))errors.push('Use a positive whole-number timeout in milliseconds.');
  for(const [label,value] of [...(testing?[['Test base URL',o.baseUrl]]:[]),...(o.source!=='filesystem'?[['Source URL',o.url]]:[])]) {
    try { const url=new URL(value);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error(); }
    catch { errors.push(`${label} must be an absolute HTTP(S) URL without embedded credentials.`); }
  }
  if(o.source==='filesystem' && !o.directory.trim())errors.push('Set the source directory, for example . for this folder.');
  if(errors.length)return {errors};
  const source=o.source==='filesystem'?{filesystem:{directory:o.directory.trim()}}:o.source==='git'?{git:{url:o.url,...(o.branch.trim()?{branch:o.branch.trim()}: {})}}:{web:{url:o.url}};
  const services={};
  const config={version:3};
  function service(role) {
    const name=role==='test'?o.testName:o.mockName;
    const definition={definitions:[{definition:{source:o.form==='components'?{$ref:`#/components/sources/${o.sourceName}`} : source,specs:lines(role==='test'?o.testSpecs:o.mockSpecs)}}]};
    const result=o.form==='components'?{$ref:`#/components/services/${name}`} : definition;
    if(o.form==='components')services[name]=definition;
    result.runOptions={openapi:role==='test'?{type:'test',baseUrl:o.baseUrl}:{type:'mock',host:o.host.trim(),port:Number(o.port)}};
    if(role==='test' && o.timeoutEnabled)result.settings={timeoutInMilliseconds:Number(o.timeout)};
    const examples=lines(o.examples);
    if(examples.length || o.dictionary.trim())result.data={...(examples.length?{examples:[{directories:examples}]}:{}),...(o.dictionary.trim()?{dictionary:{path:o.dictionary.trim()}}: {})};
    return result;
  }
  if(testing)config.systemUnderTest={service:service('test')};
  if(mocking)config.dependencies={services:[{service:service('mock')}]};
  if(o.form==='components')config.components={sources:{[o.sourceName]:source},services};
  const validation=checkSchema(config);
  if(!validation.passed)return {errors:validation.diagnostics.map(d=>`${d.path}: ${d.message}`)};
  return {errors:[],config,yaml:yaml.dump(config,{lineWidth:100,noRefs:true}),json:JSON.stringify(config,null,2)+'\n'};
}
module.exports = {build,defaults};
