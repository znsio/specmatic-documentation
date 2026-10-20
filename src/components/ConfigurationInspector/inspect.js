const yaml = require('js-yaml');
const catalog = require('../../data/configuration/catalog.json');
const {checkSchema} = require('./check-schema');
const rootKeys = new Set(catalog.keys.filter(k => k.owner === 'Root').map(k => k.key));
const placements = catalog.keys.flatMap(key => key.contexts.map(context => ({
  key,
  segments: context.replace(/\[\]/g,'.[]').split('.').map(part=>part==='[]'?null:part),
})));
const token = /\$?\{([^}:]+):([^}]*)\}/;
const encode = key => key.replace(/~/g, '~0').replace(/\//g, '~1');
function targetFor(root, ref) {
  if (!ref.startsWith('#/components/')) return undefined;
  let value = root;
  // InternalComponentsResolver uses literal map segments, not JSON Pointer decoding or list indices.
  for (const key of ref.slice(2).split('/')) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.hasOwn(value, key)) return undefined;
    value = value[key];
  }
  return value == null ? undefined : value;
}
function inspect(text) {
  const diagnostics = [], nodes = [], references = [];
  if (!text.trim()) return {diagnostics, nodes, references};
  if (text.length > 200000) return {diagnostics: [{path:'#', message:'This local inspector accepts files up to 200,000 characters. Use Specmatic validation for a larger file.'}], nodes, references};
  let root;
  try { root = yaml.load(text); }
  catch (error) {
    const line = error.mark ? ` at line ${error.mark.line + 1}, column ${error.mark.column + 1}` : '';
    return {diagnostics:[{path:'#', message:`Cannot parse YAML/JSON${line}: ${error.reason || 'invalid input'}. Correct the syntax and try again.`}], nodes, references};
  }
  if (!root || typeof root !== 'object' || Array.isArray(root)) {
    return {diagnostics:[{path:'#', message:'Use a configuration object beginning with version: 3, followed by sections such as dependencies or systemUnderTest.'}], nodes, references};
  }
  if (root.version !== 3) diagnostics.push({path:'#/version', message:token.test(String(root.version)) ? 'The version is templated. Supply its resolved value to check that this is V3.' : 'This inspector covers V3. Set version: 3 for a V3 file; use the migration guide for older formats.'});
  for (const key of Object.keys(root)) if (!rootKeys.has(key)) diagnostics.push({path:`#/${encode(key)}`, message:`Unknown root key “${key}”. Check the key reference for its supported parent. For example, settings belong under specmatic.settings or the applicable service scope.`});
  const ancestors = new Set();
  let truncated = false, templated = false, cyclic = false;
  function walk(value, pointer, path, name, depth = 0, segments = []) {
    if (depth > 100) { truncated = true; return; }
    if (nodes.length >= 3000) { truncated = true; return; }
    const entries = placements.filter(p => p.segments.length===segments.length && p.segments.every((part,index)=>part==='<name>'?typeof segments[index]==='string':part===segments[index])).map(p => p.key);
    nodes.push({pointer, path, name, value, keys: [...new Map(entries.map(e => [e.id,e])).values()]});
    if (typeof value === 'string' && token.test(value)) { templated = true; diagnostics.push({path:pointer, message:'Template input is unresolved here. The browser does not read your environment or system properties.'}); }
    if (!value || typeof value !== 'object') return;
    if (ancestors.has(value)) { cyclic = true; diagnostics.push({path:pointer, message:'A recursive YAML alias cannot be inspected as a configuration tree. Replace the cycle with a finite value.'}); return; }
    ancestors.add(value);
    if (Object.hasOwn(value, '$ref')) {
      const ref = value.$ref;
      const refPath = `${pointer}/$ref`;
      let status = 'unresolved';
      if (typeof ref !== 'string') diagnostics.push({path:refPath, message:'A $ref must be a string, such as #/components/services/books.'});
      else if (token.test(ref)) diagnostics.push({path:refPath, message:'Resolve this templated reference before checking its destination.'});
      else if (!ref.startsWith('#/components/')) diagnostics.push({path:refPath, message:'This inspector only resolves local component refs. External refs are not fetched; check them with Specmatic.'});
      else if (targetFor(root, ref) === undefined) diagnostics.push({path:refPath, message:'No component exists at this reference. Check its collection and chosen name, for example #/components/services/books.'});
      else status = 'found';
      references.push({pointer:refPath, ref, status, targetPointer:status==='found' ? '#/'+ref.slice(2).split('/').map(encode).join('/') : undefined});
    }
    for (const [key, child] of Object.entries(value)) {
      const childPath = Array.isArray(value) ? `${path}[${key}]` : path ? `${path}.${key}` : key;
      walk(child, `${pointer}/${encode(key)}`, childPath, Array.isArray(value) ? `[${key}]` : key, depth + 1, [...segments,Array.isArray(value)?null:key]);
    }
    ancestors.delete(value);
  }
  walk(root, '#', '', 'Configuration');
  if (truncated) diagnostics.push({path:'#', message:'Inspection is limited to 3,000 values and 100 nesting levels. Use Specmatic validation to inspect the complete file.'});
  let schemaCheck;
  if (templated || truncated || cyclic) {
    schemaCheck = {state:'skipped',reason: templated ? 'Resolve templates before checking against the resolved-config schema.' : 'Schema checking was skipped for a cyclic or oversized structure.'};
  } else {
    // SourceV3's constructor enforces this independently of the resolved schema.
    const badSources = [];
    for (const node of nodes) {
      const isSource = node.keys.some(k=>k.id==='DefinitionValue/source') || /^#\/components\/sources\/[^/]+$/.test(node.pointer);
      if (!isSource || !node.value || typeof node.value !== 'object' || Array.isArray(node.value) || Object.hasOwn(node.value,'$ref')) continue;
      const providers = ['git','filesystem','web'].filter(key=>Object.hasOwn(node.value,key) && node.value[key]!=null);
      if (providers.length!==1) {
        badSources.push(node.pointer);
        diagnostics.push({path:node.pointer,message:'Choose exactly one source provider: git, filesystem or web. For example: source: {filesystem: {directory: .}}. Put another provider in a separate definition.'});
      }
    }
    const check = checkSchema(root);
    schemaCheck = {state:'checked',passed:check.passed};
    // Avoid duplicating the existing root/version corrections.
    diagnostics.push(...check.diagnostics.filter(d=>!badSources.some(source=>d.path===source || d.path.startsWith(source+'/')) && !diagnostics.some(existing=>existing.path===d.path)));
    if (check.omitted) diagnostics.push({path:'#',message:`${check.omitted} more schema issues were found. Correct the displayed issues, then check again.`});
    let projected = 0;
    for (const reference of references.filter(ref=>ref.status==='found')) {
      reference.shapeCheck = 'skipped';
      if (projected >= 50) continue;
      const node = nodes.find(node=>`${node.pointer}/$ref`===reference.pointer);
      const target = targetFor(root,reference.ref);
      // Check one use site without recursively dereferencing or changing the authored file.
      if (!node || node.pointer==='#' || target && typeof target==='object' && Object.hasOwn(target,'$ref')) continue;
      projected++;
      const siblings = Object.fromEntries(Object.entries(node.value).filter(([key])=>key!=='$ref'));
      let candidate = target;
      if (Object.keys(siblings).length) {
        if (!target || typeof target!=='object' || Array.isArray(target)) {
          reference.shapeCheck = 'issues';
          diagnostics.push({path:reference.pointer,message:'This destination is not an object, so Specmatic cannot apply sibling overrides. Remove those siblings or reference an object of the required shape.'});
          continue;
        }
        candidate = {...target,...siblings};
      }
      const segments = node.pointer.slice(2).split('/').map(key=>key.replace(/~1/g,'/').replace(/~0/g,'~'));
      function replace(value,index) {
        if(index===segments.length)return candidate;
        const key=segments[index];
        return Array.isArray(value)?value.map((child,i)=>i===Number(key)?replace(child,index+1):child):{...value,[key]:replace(value[key],index+1)};
      }
      const projectedCheck = checkSchema(replace(root,0));
      if(projectedCheck.omitted)continue;
      const issues = projectedCheck.diagnostics.filter(issue=>issue.path===node.pointer || issue.path.startsWith(node.pointer+'/'));
      const isSource = node.keys.some(key=>key.id==='DefinitionValue/source');
      if(isSource && candidate && typeof candidate==='object' && !Array.isArray(candidate)) {
        const providers=['git','filesystem','web'].filter(key=>Object.hasOwn(candidate,key) && candidate[key]!=null);
        if(providers.length!==1)issues.push({message:'Choose exactly one source provider: git, filesystem or web.'});
      }
      reference.shapeCheck = issues.length?'issues':'checked';
      for(const issue of issues.slice(0,3))diagnostics.push({path:reference.pointer,message:`The destination exists, but its shallow combination with sibling overrides fails the documented shape at this use site. Check that the reference selects the right kind of component for “${node.name}”, then check any sibling replacements. Shape detail: ${issue.message}`});
    }
    if(references.some(ref=>ref.status==='found' && ref.shapeCheck==='skipped'))diagnostics.push({path:'#',message:'Some local destination shapes were not checked: reference chains, truncated schema diagnostics, or the 50-reference check limit require Specmatic validation. Found destinations do not establish runtime compatibility.'});
  }
  return {diagnostics, nodes, references, schemaCheck};
}
module.exports = {inspect, targetFor};
