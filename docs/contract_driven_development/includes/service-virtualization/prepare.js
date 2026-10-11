// Test-only preparation: each scenario gets its own temporary folder.
const fs = require('node:fs');
const name = process.env.DOC_EXAMPLE_NAME.replace(/\.sh$/, '');
const copy = (from, to) => { fs.rmSync(to, { force: true }); fs.copyFileSync(from, to); };
function example(file) {
  fs.mkdirSync('employees_examples', { recursive: true });
  copy(file, `employees_examples/${file}`);
}
if (name === 'external-request') example('external-example.json');
if (name === 'out-of-sync-request') example('out-of-sync.json');
if (name === 'data-type-request') example('any-name.json');
if (name === 'phonebook-request') {
  copy('phonebook/phonebook.yaml', 'phonebook.yaml');
  copy('phonebook/specmatic.yaml', 'specmatic.yaml');
  fs.cpSync('phonebook/phonebook_examples', 'phonebook_examples', { recursive: true });
}
if (['direct-request', 'lookup-sales-request', 'lookup-engineering-request', 'partial-request'].includes(name)) {
  copy('correlated-employees.yaml', 'employees.yaml');
  example(name === 'direct-request' ? 'direct-substitution.json' : name === 'partial-request' ? 'partial-request-example.json' : 'data-lookup.json');
}
