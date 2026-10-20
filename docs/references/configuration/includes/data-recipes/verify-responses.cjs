const assert = require('node:assert/strict');
const scenarios = {
  'combined-data': {common: true, service: true, extra: true, shared: false},
  'service-data': {common: true, service: true, extra: false, shared: false},
  'shared-data': {common: true, service: false, extra: false, shared: true},
  'empty-examples': {common: true, service: false, extra: false, shared: false},
  'configured-cli': {common: true, service: true, extra: false, shared: false},
  'configured-environment': {common: true, service: true, extra: false, shared: false},
  'cli-only': {common: false, service: false, extra: true, shared: false},
  'environment-only': {common: false, service: false, extra: true, shared: false},
};
const mode = process.argv[2];
async function check(path, expected) {
  const response = await fetch(`http://127.0.0.1:9101${path}`, {signal: AbortSignal.timeout(5000)});
  assert.equal(response.status, 200, path);
  assert.deepEqual(await response.json(), expected, path);
}
async function main() {
  assert.ok(Object.hasOwn(scenarios, mode));
  const scenario = scenarios[mode];
  const dictionary = scenario.shared ? {id: 70, title: 'Shared dictionary'} : {id: 77, title: 'Service dictionary'};
  await check('/orders/1', scenario.common ? {id: 1, title: 'Common example'} : dictionary);
  await check('/orders/2', scenario.service ? {id: 2, title: 'Service example'} : dictionary);
  await check('/orders/3', scenario.extra ? {id: 3, title: 'Environment example'} : dictionary);
  await check('/generated', dictionary);
  console.log(`PASS: ${mode} selected examples and generated dictionary response`);
}
main().catch(error => {console.error(error); process.exitCode = 1;});
