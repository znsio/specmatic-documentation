// Structural inventory comes from the pinned schema; behavior notes are reviewed separately.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { forbiddenProperties } = require('./config-schema-exclusions');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'src/data/configuration');
const schema = JSON.parse(fs.readFileSync(path.join(directory, 'schema-v3.json')));
const notes = JSON.parse(fs.readFileSync(path.join(directory, 'behavior.json')));
const fieldNotes = JSON.parse(fs.readFileSync(path.join(directory, 'field-behavior.json')));
const aliases = { 'TestSettings/resiliencyTests': 'schemaResiliencyTests', 'LogOutputConfiguration/logPrefix': 'logFilePrefix' };
const entries = new Map();
const locations = new Map();
const escape = key => key.replace(/~/g, '~0').replace(/\//g, '~1');
function inventory(node, pointer = '#', owner = 'Root') {
  if (!node || typeof node !== 'object') return;
  if (pointer.startsWith('#/definitions/')) owner = pointer.split('/')[2];
  for (const [key, property] of Object.entries(node.properties || {})) {
    const canonical = aliases[`${owner}/${key}`] || key;
    const id = `${owner}/${canonical}`;
    const location = `${pointer}/properties/${escape(key)}`;
    if (!entries.has(id)) entries.set(id, { id, owner, key: canonical, aliases: [], declarations: [], contexts: [], title: property.title || canonical, description: property.description || (property.$ref ? resolve(property.$ref).description : '') || (owner === 'AsyncServerWrapper' && key === 'server' ? 'Wraps one inline or specification-referenced AsyncAPI server.' : ''), schema: property, requiredInVariant: [], runtimeReview: notes[owner] ? 'group-source-traced' : 'pending' });
    const entry = entries.get(id);
    entry.declarations.push(location);
    if (canonical !== key) entry.aliases.push(key);
    if ((node.required || []).includes(key)) entry.requiredInVariant.push(pointer);
    locations.set(location, entry);
  }
  for (const [key, child] of Object.entries(node)) inventory(child, `${pointer}/${escape(key)}`, owner);
}
const resolve = ref => ref.slice(2).split('/').reduce((node, key) => node[key.replace(/~1/g, '/').replace(/~0/g, '~')], schema);
inventory(schema);
function contexts(node, pointer, location, ancestors = [], inheritedExclusions = new Set()) {
  if (!node || typeof node !== 'object') return;
  const exclusions = new Set([...inheritedExclusions, ...forbiddenProperties(node, resolve)]);
  if (node.$ref) {
    assert.ok(node.$ref.startsWith('#/'), `Unsupported schema reference ${node.$ref}`);
    if (!ancestors.includes(node.$ref)) contexts(resolve(node.$ref), node.$ref, location, [...ancestors, node.$ref], exclusions);
  }
  for (const [key, property] of Object.entries(node.properties || {})) {
    if (exclusions.has(key)) continue;
    const p = `${pointer}/properties/${escape(key)}`;
    const entry = locations.get(p);
    const next = location ? `${location}.${key}` : key;
    if (entry && !entry.contexts.includes(next)) entry.contexts.push(next);
    contexts(property, p, next, ancestors);
  }
  for (const union of ['allOf', 'anyOf', 'oneOf']) (node[union] || []).forEach((child, index) => contexts(child, `${pointer}/${union}/${index}`, location, ancestors, exclusions));
  for (const branch of ['then', 'else']) if (node[branch]) contexts(node[branch], `${pointer}/${branch}`, location, ancestors, exclusions);
  if (node.items) contexts(node.items, `${pointer}/items`, `${location}[]`, ancestors);
  if (node.additionalProperties && typeof node.additionalProperties === 'object') contexts(node.additionalProperties, `${pointer}/additionalProperties`, `${location}.<name>`, ancestors);
}
contexts(schema, '#', '');
const keys = [...entries.values()].sort((a,b) => a.owner.localeCompare(b.owner) || a.key.localeCompare(b.key));
const declarations = keys.flatMap(entry => entry.declarations);
assert.equal(declarations.length, 301, 'Schema property count changed; review the baseline and coverage expectations');
assert.equal(new Set(declarations).size, declarations.length);
assert.equal(keys.length, 289);
for (const entry of keys) {
  entry.contexts.sort();
  assert.ok(entry.description, `Missing schema explanation: ${entry.id}`);
  if (fieldNotes[entry.id]) {
    entry.runtime = fieldNotes[entry.id];
    entry.description = fieldNotes[entry.id].description || entry.description;
  }
}
for (const [id,note] of Object.entries(fieldNotes)) {
  assert.ok(entries.has(id), `Behavior note has no canonical key: ${id}`);
  for (const field of ['scope','effect','omission','precedence','caveat','example']) assert.ok(typeof note[field]==='string' && note[field].trim(), `Missing ${field}: ${id}`);
  assert.ok(Array.isArray(note.evidence) && note.evidence.length, `Missing behavior evidence: ${id}`);
}
const catalog = { formatVersion: 3, schemaPropertyCount: declarations.length, canonicalEntryCount: keys.length, behavior: notes, keys };
const catalogText = JSON.stringify(catalog, null, 2) + '\n';
const safe = value => String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
// Example endpoints are literal values, not links to live services.
const runtimeText = value => safe(value).replace(/https?:\/\/[^\s<>&)]+/g, url => {
  const suffix = url.match(/[.,;:!?]+$/)?.[0] || '';
  return `<code>${url.slice(0,url.length-suffix.length)}</code>${suffix}`;
});
const title = owner => owner.replace(/([a-z])([A-Z])/g, '$1 $2');
function valueType(node, visited = []) {
  if (node.const !== undefined) return `exactly ${JSON.stringify(node.const)}`;
  if (node.enum) return node.enum.map(v=>JSON.stringify(v)).join(', ');
  if (node.$ref && !visited.includes(node.$ref)) return valueType(resolve(node.$ref), [...visited,node.$ref]);
  if (node.oneOf || node.anyOf) return [...new Set((node.oneOf || node.anyOf).map(n=>valueType(n, visited)))].join(' or ');
  return node.type || (node.allOf ? node.allOf.map(n=>valueType(n, visited)).join(' + ') : 'see variant constraints');
}
let document = `---\ntitle: All V3 Configuration Keys\nsidebar_position: 2\nhide_table_of_contents: true\n---\n\n# All V3 configuration keys\n\nThis reference lists ${keys.length} canonical property entries across ${declarations.length} schema declarations. The same spelling can behave differently in different object variants. Aliases appear with their canonical property.\n\nThese are **resolved-config** constraints: templates are resolved before Specmatic applies this schema. Required means required inside the indicated object variant, not that the object must appear in every file. Named component/map entries are shown as \`<name>\`; array entries as \`[]\`. Runtime explanations below are separate from schema facts.\n\n[Start with a task](/references/configuration) · [Configuration basics](/references/configuration/getting-started)\n\n`;
for (const owner of [...new Set(keys.map(e=>e.owner))]) {
  document += `## ${title(owner)}\n\n`;
  if (notes[owner]) document += `${safe(notes[owner].summary)}\n\n${safe(notes[owner].interaction)}\n\n`;
  for (const entry of keys.filter(e=>e.owner===owner)) {
    const anchor = entry.id.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    document += `<details id="${anchor}">\n<summary><code>${safe(entry.key)}</code> — ${safe(entry.title)}</summary>\n\n${safe(entry.description)}\n\n`;
    document += `- **Value:** ${safe(valueType(entry.schema))}.\n`;
    document += `- **Requirement:** ${entry.requiredInVariant.length ? 'Required in this object variant; alternative branches can have different requirements.' : 'Not directly required by this property’s parent; enclosing alternatives may impose conditions.'}\n`;
    if (entry.aliases.length) document += `- **Also accepted:** ${entry.aliases.map(a=>'`'+a+'`').join(', ')}.\n`;
    if (entry.runtime) {
      document += '\n**Runtime behavior**\n\n';
      for (const [field,label] of [['scope','Applies to'],['effect','Effect'],['omission','When omitted'],['precedence','Precedence'],['caveat','Watch for'],['example','Example']]) document += `- **${label}:** ${runtimeText(entry.runtime[field])}\n`;
      if (entry.runtime.verification) document += `\n[Try the complete tested example](${entry.runtime.verification.recipe}).\n`;
      else if (entry.runtime.guide) document += `\n[See the complete configuration guide](${entry.runtime.guide}).\n`;
    }
    for (const field of ['minimum','maximum','minLength','maxLength','pattern','default','deprecated']) if (entry.schema[field] !== undefined) document += `- **${field}:** ${safe(JSON.stringify(entry.schema[field]))}.\n`;
    if (entry.contexts.length) document += `\n**Placement**\n\n${entry.contexts.map(c=>'- `'+c+'`').join('\n')}\n`;
    else document += '\nThis declaration supplies a schema variant rather than an independently reachable root path. Refer to its enclosing variant before using it.\n';
    document += '\n</details>\n\n';
  }
}
function write(file, content) {
  if (process.argv.includes('--check')) assert.equal(fs.readFileSync(file,'utf8'), content, `Stale generated file: ${path.relative(root,file)}`);
  else fs.writeFileSync(file,content);
}
write(path.join(directory,'catalog.json'),catalogText);
write(path.join(directory,'coverage.json'),JSON.stringify(keys.map(entry=>({id:entry.id,declarations:entry.declarations,reference:`/references/configuration/all-keys#${entry.id.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,schemaDocumentation:'generated',runtimeReview:entry.runtimeReview,fieldDefaultsAndPrecedence:entry.runtime?'source-traced-scoped':'pending',...(entry.runtime?{behaviorScope:entry.runtime.scope,behaviorEvidence:entry.runtime.evidence}:{}),runnableExample:entry.runtime?.verification?.recipe||'pending',executionEvidence:entry.runtime?.verification||'pending'})),null,2)+'\n');
write(path.join(root,'docs/references/configuration/all-keys.mdx'),document);
console.log(`${keys.length} canonical entries; ${declarations.length} declarations; ${keys.reduce((n,k)=>n+k.contexts.length,0)} placements. ${process.argv.includes('--check')?'Checked':'Generated'}.`);
