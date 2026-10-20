import React, {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import catalog from '../../data/configuration/catalog.json';
import {inspect} from '../ConfigurationInspector/inspect';
import {canonicalPath,catalogTree,exampleTree,sampleValue,placementFragment,relationships,relationshipOwner,scopeFacts,operations,protocols,placementFacets,matchesPlacement,preferredPlacement} from './structure';
import styles from './styles.module.css';

type Entry = typeof catalog.keys[number];
const groups = [
  ['Structure', /^(Root|Components|.*Service.*|Definition.*|Specification.*|Reference)$/],
  ['Contract sources', /^(.*Source.*|Git.*Authentication|RefOrSource)$/],
  ['Run options', /^(.*RunOption.*|Workflow.*|SecurityScheme.*|Async.*|Graphql.*|Protobuf.*|SchemaRegistry.*|InMemory.*)$/],
  ['Settings', /^(.*Settings|FeatureFlags|LoggingConfiguration|LogOutputConfiguration)$/],
  ['Examples & adapters', /^(DataDefinition|Example.*|Dictionary.*|Adapter.*|RefOrAdapter|RefOrDictionary|RefOrExample.*)$/],
  ['Certificates', /^(Cert.*|KeyStore.*|RefOrCert)$/],
  ['Proxy', /^Proxy(Entry|Definition)$/],
  ['MCP', /^Mcp.*/],
  ['Reports & license', /^(SpecmaticDefinition|License.*|Governance|Reports.*|SuccessCriteria.*)$/],
] as const;
const views=['Placement','YAML','Connections','Behavior','Constraints'];
function category(entry: Entry) {return groups.find(([,pattern])=>pattern.test(entry.owner))?.[0]||'Structure';}
function anchor(entry: Entry) {return entry.id.toLowerCase().replace(/[^a-z0-9]+/g,'-');}
function firstPath(entry:Entry) {return canonicalPath(entry,entry.contexts.find(p=>!p.startsWith('components.') && p.split('.').at(-1)===entry.key)||entry.contexts[0]||'');}
const behaviors=catalog.behavior as Record<string,{summary:string;interaction:string}>;
const startingKey='Root/systemUnderTest';
const completeDemo=require('../../../docs/references/configuration/includes/local-openapi/specmatic-components.yaml?raw');
const demo=inspect(completeDemo);
const demoTree=exampleTree(demo.nodes);
const allTree=catalogTree(catalog.keys);

export default function ConfigurationExplorer() {
  const detailHeading=useRef<HTMLHeadingElement>(null);
  const focusDetails=useRef(false);
  const navigation=useRef({id:startingKey,path:'systemUnderTest',scope:'all',query:'',group:'All keys',operation:'all',protocol:'all',view:'Placement'});
  const [query,setQuery]=useState('');
  const [group,setGroup]=useState('All keys');
  const [scope,setScope]=useState('all');
  const [operation,setOperation]=useState('all');
  const [protocol,setProtocol]=useState('all');
  const [outline,setOutline]=useState('Tree');
  const [selection,setSelection]=useState(startingKey);
  const [selectedPath,setPath]=useState('systemUnderTest');
  const [view,setView]=useState('Placement');
  const [expanded,setExpanded]=useState(()=>new Set([
    ...allTree.children.map((n:any)=>'all:'+n.path),
    ...demoTree.children.map((n:any)=>'demo:'+n.pointer),
  ]));
  useEffect(()=>{
    const ancestors:string[]=[];
    function visit(node:any) {
      const key=scope==='demo'?node.pointer:node.path;
      if(scope==='demo'?selectedPath.startsWith(key+'/'):selectedPath.startsWith(key+'.')||selectedPath.startsWith(key+'['))ancestors.push(scope+':'+key);
      for(const child of node.children)visit(child);
    }
    for(const node of (scope==='demo'?demoTree:allTree).children)visit(node);
    setExpanded(previous=>new Set([...previous,...ancestors]));
  },[scope,selectedPath]);
  useEffect(()=>{
    const read=()=>{
      const params=new URLSearchParams(window.location.search);
      const id=params.get('key');
      const entry=catalog.keys.find(k=>k.id===id)||catalog.keys.find(k=>k.id===startingKey)!;
      const nextScope=params.get('example')==='components'?'demo':'all';
      const path=params.get('path');
      setSelection(entry.id);setScope(nextScope);
      setPath(nextScope==='demo'?(demo.nodes.some(n=>n.pointer===path)?path!:'#/systemUnderTest'):(entry.contexts.some(p=>canonicalPath(entry,p)===path)?path!:firstPath(entry)));
      setView(views.includes(params.get('view')||'')?params.get('view')!:'Placement');
      setQuery(params.get('q')||'');
      const area=['All keys',...groups.map(([name])=>name)].includes(params.get('group')||'')?params.get('group')!:'All keys';
      setGroup(area);
      const nextOperation=operations.some(([id])=>id===params.get('operation'))?params.get('operation')!:'all';
      const nextProtocol=protocols.some(([id])=>id===params.get('protocol'))?params.get('protocol')!:'all';
      setOperation(nextOperation);setProtocol(nextProtocol);
      navigation.current={id:entry.id,path:nextScope==='demo'?(demo.nodes.some(n=>n.pointer===path)?path!:'#/systemUnderTest'):(entry.contexts.some(p=>canonicalPath(entry,p)===path)?path!:firstPath(entry)),scope:nextScope,query:params.get('q')||'',group:area,operation:nextOperation,protocol:nextProtocol,view:views.includes(params.get('view')||'')?params.get('view')!:'Placement'};
    };
    read();window.addEventListener('popstate',read);return ()=>window.removeEventListener('popstate',read);
  },[]);
  useEffect(()=>{
    if(focusDetails.current) {detailHeading.current?.focus();focusDetails.current=false;}
  },[selectedPath,scope,view]);
  function navigate(id:string|undefined, options:{path?:string;scope?:string;query?:string;group?:string;operation?:string;protocol?:string;view?:string;replace?:boolean}={}) {
    const previous=navigation.current;
    const next={id:id??previous.id,path:options.path??(id?firstPath(catalog.keys.find(k=>k.id===id)!):previous.path),scope:options.scope??previous.scope,query:options.query??previous.query,group:options.group??previous.group,operation:options.operation??previous.operation,protocol:options.protocol??previous.protocol,view:options.view??previous.view};
    navigation.current=next;
    const url=new URL(window.location.href);
    url.searchParams.set('key',next.id);url.searchParams.set('path',next.path);
    for(const [key,value] of [['q',next.query],['group',next.group==='All keys'?'':next.group],['example',next.scope==='demo'?'components':''],['view',next.view==='Placement'?'':next.view],['operation',next.operation==='all'?'':next.operation],['protocol',next.protocol==='all'?'':next.protocol]]) value?url.searchParams.set(key,value):url.searchParams.delete(key);
    window.history[options.replace?'replaceState':'pushState']({},'',url);
    setSelection(next.id);setPath(next.path);setScope(next.scope);setQuery(next.query);setGroup(next.group);setOperation(next.operation);setProtocol(next.protocol);setView(next.view);
  }
  const matches=useMemo(()=>{
    const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return catalog.keys.filter(entry=>{
      if(!matchesPlacement(entry,operation,protocol))return false;
      if(group!=='All keys'&&category(entry)!==group)return false;
      if(scope==='demo'&&!demo.nodes.some(n=>n.keys.some(k=>k.id===entry.id)))return false;
      const note=behaviors[entry.owner];
      const text=[entry.key,entry.owner,entry.title,entry.description,...entry.aliases,...entry.contexts,note?.summary,note?.interaction,...Object.values(entry.runtime||{}).filter(value=>typeof value==='string')].join(' ').toLowerCase();
      return words.every(word=>text.includes(word));
    }).sort((a,b)=>{
      const exact=(key:Entry)=>[key.key,...key.aliases].some(name=>name.toLowerCase()===query.trim().toLowerCase())?0:1;
      if(words.length&&exact(a)!==exact(b))return exact(a)-exact(b);
      if(a.owner==='Root'&&b.owner!=='Root')return -1;
      if(b.owner==='Root'&&a.owner!=='Root')return 1;
      return a.owner.localeCompare(b.owner)||a.key.localeCompare(b.key);
    });
  },[query,group,scope,operation,protocol]);
  const entry=catalog.keys.find(k=>k.id===selection)!;
  const guide=entry.runtime?.verification?.recipe||entry.runtime?.guide;
  const activeNode=scope==='demo'?demo.nodes.find(n=>n.pointer===selectedPath):undefined;
  const note=behaviors[entry.owner];
  const entryPlacements=[...new Set(entry.contexts.map(p=>canonicalPath(entry,p)))];
  const connections=relationships(demo.nodes,activeNode?.pointer||'#');
  function clearFilters(reveal=false) {
    navigate(undefined,{scope:reveal?'all':scope,path:reveal&&scope==='demo'?firstPath(entry):selectedPath,query:'',group:'All keys',operation:'all',protocol:'all'});
    detailHeading.current?.focus();
  }
  function connectionLabel(pointer:string) {
    if(pointer==='#')return 'Complete demo';
    if(pointer==='#/systemUnderTest/service')return 'Test · system under test';
    if(/^#\/dependencies\/services\/\d+\/service$/.test(pointer))return 'Mock · dependency';
    const name=demo.nodes.find(n=>n.pointer===pointer)?.name||pointer;
    const collection=pointer.split('/')[2];
    return `${collection==='sources'?'Source':collection==='services'?'Service':'Entry'} · ${name}`;
  }
  const namedNode=activeNode&&!activeNode.keys.length;
  const nodeKind=!namedNode?category(entry):activeNode?.pointer==='#'?'Complete file':activeNode?.name.startsWith('[')?'List item':'Named entry';
  const path=activeNode?activeNode.path:selectedPath;
  const fragment=placementFragment(path.replace(/\[\d+\]/g,'[]'),activeNode?activeNode.value:sampleValue(entry));
  const leaf=path.split('.').at(-1)?.replace(/\[.*\]$/,'')||entry.key;
  const highlight=activeNode?.pointer==='#'?0:fragment.split('\n').findIndex(line=>line.trim().replace(/^-\s*/,'').startsWith(`${leaf}:`))+1;
  function selectDemo(pointer:string,nextView=view,resetFilters=false,moveFocus=false) {
    let node=demo.nodes.find(n=>n.pointer===pointer);
    if(!node)return;
    const selected=node;
    if(moveFocus) {
      if(selectedPath===pointer && view===nextView)detailHeading.current?.focus();
      else focusDetails.current=true;
    }
    while(node&&!node.keys.length&&node.pointer!=='#')node=demo.nodes.find(n=>n.pointer===node!.pointer.slice(0,node!.pointer.lastIndexOf('/')));
    navigate(node?.keys[0]?.id||startingKey,{path:selected.pointer,scope:'demo',view:nextView,...(resetFilters?{query:'',group:'All keys',operation:'all',protocol:'all'}:{})});
  }
  function selectKey(key:Entry,path?:string) {
    if(scope==='demo')selectDemo(demo.nodes.find(n=>n.keys.some(k=>k.id===key.id))!.pointer,'Placement');
    else navigate(key.id,{path:path||preferredPlacement(key,operation,protocol),view:'Placement'});
  }
  function tree(node:any):React.ReactNode {
    const selected=scope==='demo'?node.pointer===selectedPath:node.path===selectedPath;
    const select=()=>scope==='demo'?selectDemo(node.pointer,'Placement'):node.entries.length&&selectKey(node.entries.find((e:Entry)=>e.id===selection)||node.entries[0],node.path);
    const label=node.label==='<name>'?'your chosen name':node.label==='[]'?'list item []':node.label;
    const content=node.entries.length||scope==='demo'?<button type="button" aria-current={selected?'true':undefined} className={selected?styles.treeSelected:styles.treeButton} onClick={select}>{selected&&<span aria-hidden="true">✓ </span>}{label}</button>:<span>{label}</span>;
    const expansionKey=scope+':'+(scope==='demo'?node.pointer:node.path);
    const open=expanded.has(expansionKey);
    const childrenId=`configuration-${scope}-${encodeURIComponent(node.path)}`;
    return node.children.length?<div className={styles.treeBranch} key={node.path}><div className={styles.treeRow}><button type="button" className={styles.expandButton} aria-label={`${open?'Collapse':'Expand'} ${node.path}`} aria-expanded={open} aria-controls={childrenId} onClick={()=>setExpanded(previous=>{const next=new Set(previous);next.has(expansionKey)?next.delete(expansionKey):next.add(expansionKey);return next;})}><span aria-hidden="true">{open?'▾':'▸'}</span></button>{content}</div><div className={styles.treeChildren} id={childrenId} hidden={!open}>{node.children.map((child:any)=>tree(child))}</div></div>:<div className={styles.treeLeaf} key={node.path}>{content}</div>;
  }
  const filterActive=!!query||group!=='All keys'||operation!=='all'||protocol!=='all';
  const selectedVariants=scope==='all'?catalog.keys.filter(k=>k.contexts.some(p=>canonicalPath(k,p)===selectedPath)):activeNode?.keys||[];
  return <section className={styles.explorer} aria-label="V3 configuration explorer">
    <div className={styles.intro}><div><span className={styles.eyebrow}>SPECMATIC CONFIGURATION · V3</span><p>Explore V3 keys, or follow a working configuration from source to test and mock.</p></div><Link className={styles.referenceLink} to="/references/configuration/all-keys">Read the full reference ↗</Link></div>
    <div className={styles.scopeSwitch} role="group" aria-label="Configuration to explore"><button type="button" aria-pressed={scope==='all'} onClick={()=>navigate(selection,{scope:'all',path:firstPath(entry),query:'',group:'All keys',operation:'all',protocol:'all'})}>All schema keys</button><button type="button" aria-pressed={scope==='demo'} onClick={()=>navigate(startingKey,{scope:'demo',path:'#/systemUnderTest',query:'',group:'All keys',operation:'all',protocol:'all'})}>Local component demo</button></div>
    <p className={styles.hint}>{scope==='all'?'Optional keys remain visible. The tree shows possible placements, not one file containing every variant.':'This complete example tests a gateway and mocks its backend. A shared source supplies both services. Only keys present in this file are shown.'}</p>
    <div className={styles.toolbar}><label className={styles.search}><span>Find a key or a use case</span><input type="search" placeholder="Try timeout, examples, or private Git…" value={query} onChange={e=>navigate(undefined,{query:e.target.value,replace:true})}/></label><label className={styles.group}><span>Configuration area</span><select value={group} onChange={e=>navigate(undefined,{group:e.target.value})}><option>All keys</option>{groups.map(([name])=><option key={name}>{name}</option>)}</select></label><label><span>Operation placement</span><select value={operation} onChange={e=>navigate(undefined,{operation:e.target.value})}><option value="all">All operations</option>{operations.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label><span>Protocol placement</span><select value={protocol} onChange={e=>navigate(undefined,{protocol:e.target.value})}><option value="all">All protocols</option>{protocols.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div>
    <p className={styles.filterSummary}>Shared keys stay visible. These filters describe schema placements, not runtime or edition support. {filterActive&&<button type="button" onClick={()=>clearFilters()}>Clear filters</button>}</p>
    {matches.length>0&&!matches.some(k=>k.id===selection)&&<p className={styles.selectionOutside}>Your selected key is outside these results. Its detail stays open. <button type="button" onClick={()=>clearFilters(true)}>Reveal selected key</button></p>}
    <div className={styles.workspace}>
      <nav className={styles.keyList} aria-label="Configuration keys"><div className={styles.listHeader}><strong role="status" aria-live="polite" aria-atomic="true">{matches.length} keys</strong><span>Aliases included in search</span></div><div className={styles.outlineSwitch} role="group" aria-label="Browse keys">{filterActive?<span className={styles.hint}>Filtered results</span>:['Tree','List'].map(name=><button type="button" key={name} aria-pressed={outline===name} onClick={()=>setOutline(name)}>{name}</button>)}</div>
        {matches.length===0?<div className={styles.empty}><strong>No matching keys</strong><p>Try a shorter phrase, or include keys absent from this example.</p><button onClick={()=>clearFilters(true)}>Show all keys</button></div>:outline==='Tree'&&!filterActive?(scope==='all'?allTree:demoTree).children.map((node:any)=>tree(node)):matches.map(key=><button key={key.id} className={key.id===selection?styles.selectedKey:styles.key} aria-current={key.id===selection?'true':undefined} onClick={()=>selectKey(key)}><code>{key.id===selection&&<span aria-hidden="true">✓ </span>}{key.key}</code><span>{preferredPlacement(key,operation,protocol)}</span></button>)}
      </nav>
      <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">{path||'Complete file'} selected. {view} view.</p>
      <article className={styles.detail} aria-label={`Details for ${activeNode?.name||entry.key}`}>
        <div className={styles.detailHeading}><span className={styles.eyebrow}>{nodeKind}</span><h3 ref={detailHeading} tabIndex={-1}><code>{activeNode?.name||entry.key}</code></h3><p>{namedNode?(nodeKind==='Complete file'?'The complete configuration used by the local runnable demo.':nodeKind==='List item'?'An item in this example’s list. The enclosing key describes its supported form. Inspect its YAML or references.':'A named entry in this example. Follow its references and use sites, or expand it to inspect its fields.'):entry.description}</p>{!namedNode&&entry.aliases.length>0&&<p className={styles.alias}>Also accepted: {entry.aliases.map(a=><code key={a}>{a}</code>)}</p>}
          <p className={styles.selectedLocation}><span>Selected location</span><code>{path||'Complete file'}</code></p>
          {!namedNode&&<p className={styles.hint}>Schema contexts: {placementFacets(entry).operations.map(id=>operations.find(([key])=>key===id)?.[1]).join(', ')||'Shared / unclassified'} · {placementFacets(entry).protocols.map(id=>protocols.find(([key])=>key===id)?.[1]).join(', ')||'Shared / unclassified'}</p>}
          {selectedVariants.length>1&&<label className={styles.variant}>Object variant<select value={selection} onChange={e=>navigate(e.target.value,{path:selectedPath})}>{selectedVariants.map((k:Entry)=><option value={k.id} key={k.id}>{k.owner.replace(/([a-z])([A-Z])/g,'$1 $2')}</option>)}</select></label>}
        </div>
        <div className={styles.viewSwitch} role="group" aria-label="Key detail view">{views.map(name=><button key={name} aria-pressed={view===name} onClick={()=>navigate(undefined,{view:name})}>{name}</button>)}</div>
        <div className={styles.detailBody}>
          {view==='Placement'&&<>
            <h4>Where it belongs</h4>
            <div className={styles.path}><code>{activeNode?.pointer||selectedPath}</code></div>
            {!namedNode&&<>
              <h4>When omitted</h4>
              {entry.runtime?<>
                <p>{entry.runtime.omission}</p>
                <p className={styles.hint}>Reviewed scope: {entry.runtime.scope}</p>
                <div className={styles.tip}><strong>Example</strong><p>{entry.runtime.example}</p></div>
                {guide&&<p><Link to={guide}>{entry.runtime.verification?'Try the complete tested example →':'See the complete configuration guide →'}</Link></p>}
              </>:<p className={styles.hint}>Omission behavior for this key is still being reviewed. An illustrative YAML value is not a runtime default.</p>}
            </>}
            {scope==='all'&&<>
              <p className={styles.hint}>“Your chosen name” represents a named map entry; <code>[]</code> is a list item. Available fields depend on the protocol and test/mock variant.</p>
              <details><summary>All {entryPlacements.length} placements</summary><ul className={styles.placements}>{entryPlacements.map(p=><li key={p}><button className={styles.placementButton} onClick={()=>navigate(selection,{path:p})}><code>{p}</code></button></li>)}</ul></details>
            </>}
            <div className={styles.tip}><strong>See it in YAML</strong><p>Fragments show nesting; the local demo supplies a complete runnable file.</p><button type="button" className={styles.placementButton} onClick={()=>{focusDetails.current=true;navigate(undefined,{view:'YAML'});}}>View this placement in YAML →</button></div>
          </>}
          {view==='YAML'&&<><h4>Placement fragment</h4><p className={styles.hint}>This fragment shows nesting, not a runnable file. {scope==='all'?'Values are illustrative, not runtime defaults; empty objects/lists need the applicable fields and entries.':'Values come from the selected example.'}</p><CodeBlock language="yaml" showLineNumbers metastring={highlight?`{${highlight}}`:undefined}>{fragment}</CodeBlock><details><summary>Complete local demo configuration</summary><p>This is the same file used by the <Link to="/references/configuration/local-openapi#test-with-a-mocked-dependency">runnable recipe</Link>. It does not demonstrate every optional key.</p><CodeBlock language="yaml" title="specmatic-components.yaml">{completeDemo.trimEnd()}</CodeBlock></details></>}
          {view==='Connections'&&<>{scope==='all'?<><h4>Follow real references</h4><p>The catalog shows possible structure. Switch to the component demo to see actual named sources, services and their test/mock use sites.</p><button className={styles.placementButton} onClick={()=>selectDemo('#/components/sources/localContracts','Connections',true,true)}>Explore the shared source →</button></>:<><h4>References around this selection</h4><p className={styles.hint}>These show authored links, not merged runtime values. Browser Back returns to your previous selection.</p><div className={styles.connectionGrid}><div><strong>Used by</strong>{connections.usedBy.length?connections.usedBy.map(r=><button key={r.from} onClick={()=>selectDemo(relationshipOwner(r.from),'Connections',true,true)}><b>{connectionLabel(relationshipOwner(r.from))}</b><code>{relationshipOwner(r.from)}</code><span>Reference at {r.from} →</span>{scopeFacts(demo.nodes,relationshipOwner(r.from)).map(f=><span key={f.pointer}>{f.label}: {String(f.value)}</span>)}</button>):<p className={styles.hint}>No direct incoming component refs.</p>}</div><div className={styles.connectionFocus}><strong>{connectionLabel(connections.scope)}</strong><code>{connections.scope}</code><div className={styles.facts}>{scopeFacts(demo.nodes,connections.scope).map(f=><button key={f.pointer} onClick={()=>selectDemo(f.pointer,'YAML',true,true)}>{f.label}: <b>{String(f.value)}</b></button>)}</div></div><div><strong>Uses</strong>{connections.uses.length?connections.uses.map(r=><button key={r.from} onClick={()=>selectDemo(r.to,'Connections',true,true)}><b>{connectionLabel(r.to)}</b><code>{r.to}</code><span>← referenced from {r.from}</span></button>):<p className={styles.hint}>No outgoing component refs.</p>}</div></div><button className={styles.placementButton} onClick={()=>selectDemo('#','Connections',false,true)}>Show all demo references</button></>}</>}
          {view==='Behavior'&&<>{entry.runtime&&!namedNode?<><h4>What this key changes</h4><p>{entry.runtime.effect}</p><p className={styles.hint}>{entry.runtime.scope}</p><h4>When omitted</h4><p>{entry.runtime.omission}</p><h4>Which value wins</h4><p>{entry.runtime.precedence}</p><div className={styles.tip}><strong>Example</strong><p>{entry.runtime.example}</p></div><h4>Watch for</h4><p>{entry.runtime.caveat}</p>{guide&&<p><Link to={guide}>{entry.runtime.verification?'Try the complete tested example →':'See the complete configuration guide →'}</Link></p>}</>:<p className={styles.hint}>Field-specific runtime guidance is still being reviewed. The section notes below do not establish this key's individual defaults or precedence.</p>}<details><summary>How this section works</summary>{note?<><p>{note.summary}</p><div className={styles.tip}><strong>Interactions to know</strong><p>{note.interaction}</p></div></>:<p>Check the enclosing object and reference for the applicable variant.</p>}</details><p className={styles.hint}>Runtime guidance is source traced for the stated runner and scope; schema acceptance alone does not establish a runtime effect.</p></>}
          {view==='Constraints'&&activeNode?.pointer==='#'?<p>Select a field in the tree for its constraints. The <Link to="/references/configuration/local-openapi#validate-the-configuration-files">recipe validation commands</Link> check the complete file.</p>:view==='Constraints'&&<><h4>Resolved configuration constraints</h4><p>Templates resolve before these constraints apply. Requiredness is local to the indicated object variant.</p><p>{entry.requiredInVariant.length?'Required within this object variant; the enclosing object may be optional.':'Not directly required by its parent; alternatives can impose conditions.'}</p><CodeBlock language="json">{JSON.stringify(entry.schema,null,2)}</CodeBlock></>}
        </div><footer className={styles.detailFooter}><Link to={activeNode?.pointer==='#'?'/references/configuration/all-keys':`/references/configuration/all-keys#${anchor(entry)}`}>Open the key reference ↗</Link> · <Link to="/references/configuration/inspect">Inspect your own file</Link></footer>
      </article>
    </div>
  </section>;
}
