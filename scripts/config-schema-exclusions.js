// Collect unconditional property-absence constraints at this object, not its children.
const assert = require('node:assert/strict');
function forbiddenProperties(node, resolve, visited = []) {
  if (!node || typeof node !== 'object') return new Set();
  const forbidden = new Set();
  if (node.not) assert.ok(Object.keys(node.not).length === 1 && (node.not.required || node.not.anyOf), 'Review new schema exclusion form before generating placements');
  const exclusions = node.not?.anyOf || (node.not ? [node.not] : []);
  for (const exclusion of exclusions) {
    assert.ok(Object.keys(exclusion).length === 1 && Array.isArray(exclusion.required), 'Review new schema exclusion branch before generating placements');
    // A forbidden combination does not forbid its members individually.
    if (Object.keys(exclusion).length === 1 && exclusion.required?.length === 1)
      forbidden.add(exclusion.required[0]);
  }
  const conjuncts = [...(node.allOf || [])];
  if (node.$ref && !visited.includes(node.$ref))
    conjuncts.push(resolve(node.$ref));
  for (const conjunct of conjuncts)
    for (const key of forbiddenProperties(conjunct, resolve, node.$ref ? [...visited, node.$ref] : visited))
      forbidden.add(key);
  return forbidden;
}
module.exports = { forbiddenProperties };
