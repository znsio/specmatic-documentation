const yaml = require('js-yaml');
const schema = require('../../data/configuration/schema-v3.json');
function canonicalPath(entry,path) {
  const parts=path.split('.');
  if(entry.aliases.includes(parts.at(-1)))parts[parts.length-1]=entry.key;
  return parts.join('.');
}
const operations = [['test','Test'],['mock','Mock'],['proxy','Proxy'],['mcp','MCP test'],['compatibility','Backward compatibility']];
const protocols = [['openapi','OpenAPI'],['wsdl','SOAP / WSDL'],['graphqlsdl','GraphQL'],['protobuf','gRPC / Protobuf'],['asyncapi','AsyncAPI'],['mcp','MCP']];
function placementFacets(entry) {
  const operation = new Set(), protocol = new Set();
  for (const path of entry.contexts) {
    if (/^systemUnderTest(?:\.|$)|^specmatic\.settings\.test(?:\.|$)|^components\.settings\.<name>\.test(?:\.|$)/.test(path)) operation.add('test');
    if (/^dependencies(?:\.|$)|^specmatic\.settings\.mock(?:\.|$)|^components\.settings\.<name>\.mock(?:\.|$)/.test(path)) operation.add('mock');
    if (/^proxies(?:\[\]|\.|$)|(?:^|\.)proxy(?:\.|$)/.test(path)) operation.add('proxy');
    if (/^mcp(?:\.|$)/.test(path)) {operation.add('mcp');protocol.add('mcp');}
    if (/(?:^|\.)backwardCompatibility(?:\.|$)/.test(path)) operation.add('compatibility');
    for (const [name] of protocols) if (path.split('.').includes(name)) protocol.add(name);
  }
  return {operations:[...operation],protocols:[...protocol]};
}
function matchesPlacement(entry, operation='all', protocol='all') {
  const facets=placementFacets(entry);
  return (operation==='all'||!facets.operations.length||facets.operations.includes(operation))
    && (protocol==='all'||!facets.protocols.length||facets.protocols.includes(protocol));
}
function preferredPlacement(entry, operation='all', protocol='all') {
  const paths=[...new Set(entry.contexts.map(path=>canonicalPath(entry,path)))];
  const score=path=>{
    const facets=placementFacets({contexts:[path]});
    return (operation!=='all'&&facets.operations.includes(operation)?4:0)
      +(protocol!=='all'&&facets.protocols.includes(protocol)?2:0)
      +(!path.startsWith('components.')?1:0);
  };
  return paths.sort((a,b)=>score(b)-score(a))[0]||'';
}
function catalogTree(entries) {
  const root={path:'',label:'Configuration',entries:[],children:[]};
  for(const entry of entries)for(const context of entry.contexts) {
    let node=root;
    for(const label of canonicalPath(entry,context).replace(/\[\]/g,'.[]').split('.')) {
      let child=node.children.find(n=>n.label===label);
      if(!child){child={path:label==='[]'?`${node.path}[]`:node.path?`${node.path}.${label}`:label,label,entries:[],children:[]};node.children.push(child);}
      node=child;
    }
    if(!node.entries.some(e=>e.id===entry.id))node.entries.push(entry);
  }
  const order=Object.keys(schema.properties);
  root.children.sort((a,b)=>order.indexOf(a.label)-order.indexOf(b.label));
  return root;
}
function exampleTree(nodes) {
  const byPointer=new Map(nodes.map(node=>[node.pointer,{...node,label:node.name,entries:node.keys,children:[]}]));
  for(const node of byPointer.values())if(node.pointer!=='#') {
    const parent=node.pointer.slice(0,node.pointer.lastIndexOf('/'));
    byPointer.get(parent)?.children.push(node);
  }
  return byPointer.get('#');
}
function sampleValue(entry, visited=[]) {
  function from(node) {
    if(node.examples?.length)return node.examples[0];
    if(node.const!==undefined)return node.const;
    if(node.enum?.length)return node.enum[0];
    if(node.$ref && !visited.includes(node.$ref)) {
      const ref=node.$ref.slice(2).split('/').reduce((value,key)=>value[key],schema);
      return sampleValue({...entry,schema:ref},[...visited,node.$ref]);
    }
    const type=Array.isArray(node.type)?node.type[0]:node.type;
    if(type==='boolean')return false;
    if(type==='integer'||type==='number')return Math.min(node.maximum??Infinity,Math.max(node.minimum??0,entry.key==='port'?9101:1));
    if(type==='object'||node.properties||node.allOf)return {};
    if(type==='array')return [];
    if(node.format==='uri')return entry.key==='baseUrl'?'http://127.0.0.1:9100':'https://example.com/contracts/';
    if(entry.key==='$ref')return '#/components/<collection>/<name>'; 
    return '<your value>';
  }
  return from(entry.schema);
}
function placementFragment(path,value) {
  if(!path)return yaml.dump(value,{lineWidth:100});
  const parts=path.split('.');
  let result=value;
  for(const part of parts.reverse()) {
    const array=part.endsWith('[]');
    const name=array?part.slice(0,-2):part;
    result={[name]:array?[result]:result};
  }
  return yaml.dump(result,{lineWidth:100});
}
function scopeFacts(nodes,pointer) {
  const value=nodes.find(n=>n.pointer===pointer)?.value;
  if(!value||typeof value!=='object')return [];
  const facts=[];
  for(const [index,entry] of (value.definitions||[]).entries()) {
    for(const [specIndex,spec] of (entry.definition?.specs||[]).entries()) {
      const name=typeof spec==='string'?spec:spec.spec?.path;
      if(name)facts.push({label:'Spec',value:name,pointer:`${pointer}/definitions/${index}/definition/specs/${specIndex}`});
    }
  }
  const options=value.runOptions?.openapi;
  for(const key of ['type','baseUrl','host','port'])if(options&&Object.hasOwn(options,key))facts.push({label:key,value:options[key],pointer:`${pointer}/runOptions/openapi/${key}`});
  if(value.filesystem&&Object.hasOwn(value.filesystem,'directory'))facts.push({label:'Directory',value:value.filesystem.directory,pointer:`${pointer}/filesystem/directory`});
  return facts;
}
function relationshipOwner(pointer) {
  return /^#\/components\/[^/]+\/[^/]+/.exec(pointer)?.[0]
    || /^#\/systemUnderTest\/service/.exec(pointer)?.[0]
    || /^#\/dependencies\/services\/\d+\/service/.exec(pointer)?.[0]
    || pointer;
}
function relationships(nodes,selectedPointer) {
  const refs=nodes.filter(n=>n.value && typeof n.value==='object' && !Array.isArray(n.value) && typeof n.value.$ref==='string').map(n=>({from:n.pointer,to:n.value.$ref}));
  let scope=relationshipOwner(selectedPointer);
  while(scope!=='#' && !refs.some(r=>r.from===scope) && !/^#\/components\/[^/]+\/[^/]+$/.test(scope))scope=scope.slice(0,scope.lastIndexOf('/'))||'#';
  const inside=(pointer,parent)=>pointer===parent||pointer.startsWith(parent+'/');
  return {scope,uses:refs.filter(r=>inside(r.from,scope)),usedBy:refs.filter(r=>inside(r.to,scope))};
}
module.exports={canonicalPath,catalogTree,exampleTree,sampleValue,placementFragment,relationships,relationshipOwner,scopeFacts,operations,protocols,placementFacets,matchesPlacement,preferredPlacement};
