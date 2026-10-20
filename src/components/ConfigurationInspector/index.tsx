import React, {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import {dump} from 'js-yaml';
import {inspect} from './inspect';
import styles from './styles.module.css';

type Node = {pointer:string; path:string; name:string; value:unknown; keys:{id:string; key:string; description:string}[]};
const placeholder = 'version: 3\ndependencies:\n  services:\n    - service:\n        $ref: "#/components/services/books"\n';
export default function ConfigurationInspector() {
  const [text,setText] = useState('');
  const [selection,setSelection] = useState('#');
  const [history,setHistory] = useState<string[]>([]);
  const [expanded,setExpanded] = useState<Record<string,boolean>>({});
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const focusDetails = useRef(false);
  const result = useMemo(()=>inspect(text),[text]);
  const nodes = result.nodes as Node[];
  const selected = nodes.find(n=>n.pointer===selection) || nodes[0];
  const children = useMemo(()=>{
    const groups = new Map<string,Node[]>();
    for(const node of nodes.slice(1)) {
      const parent=node.pointer.slice(0,node.pointer.lastIndexOf('/'));
      groups.set(parent,[...(groups.get(parent)||[]),node]);
    }
    return groups;
  },[nodes]);
  useEffect(()=>{if(focusDetails.current){detailHeading.current?.focus();focusDetails.current=false;}},[selection]);
  function choose(pointer:string,focus=false) {
    if(focus && selected?.pointer===pointer)detailHeading.current?.focus();
    else focusDetails.current=focus;
    setHistory([...history,selected?.pointer||'#']);setSelection(pointer);
  }
  function tree(node:Node,depth=0):React.ReactNode {
    const nested=children.get(node.pointer)||[];
    const open=expanded[node.pointer]??depth===0;
    const current=selected?.pointer===node.pointer;
    const button=<button type="button" aria-current={current?'true':undefined} onClick={()=>choose(node.pointer)}>{current && <span aria-hidden="true">✓ </span>}{node.name}</button>;
    return <div key={node.pointer} className={styles.leaf}><div className={styles.row}>{nested.length>0 && <button type="button" aria-label={`${open?'Collapse':'Expand'} ${node.path}`} aria-expanded={open} aria-controls={`config-children-${encodeURIComponent(node.pointer)}`} onClick={()=>setExpanded({...expanded,[node.pointer]:!open})}><span aria-hidden="true">{open?'▾':'▸'}</span></button>}{button}</div>{nested.length>0 && <div hidden={!open} id={`config-children-${encodeURIComponent(node.pointer)}`} className={styles.children}>{open && nested.map(n=>tree(n,depth+1))}</div>}</div>;
  }
  const reference = result.references.find(r=>r.pointer===`${selected?.pointer}/$ref` || r.pointer===selected?.pointer);
  return <section className={styles.inspector} aria-label="Local configuration inspector">
    <label htmlFor="config-input"><strong>Your YAML or JSON</strong></label>
    <p className={styles.hint}>Text stays in this page's memory. It is not uploaded, saved to browser storage or included in links. Clear it when finished.</p>
    <textarea id="config-input" spellCheck={false} value={text} placeholder={placeholder} onChange={e=>{setText(e.target.value);setSelection('#');setHistory([]);setExpanded({});}} />
    <div className={styles.actions}><button type="button" disabled={!text} onClick={()=>{setText('');setHistory([]);setSelection('#');}}>Clear file</button><span>Checks run locally as you edit.</span></div>
    {text.trim() && <>
      <div className={styles.status} role="status"><strong>{result.diagnostics.length ? `${result.diagnostics.length} items to review` : 'No issues found by the available browser checks'}</strong><p>Checks: YAML/JSON parsing, V3 structure, source-provider exclusivity, local destinations and their use-site shapes where checkable. This does not establish runtime validity; a found destination does not prove that its type or overrides are compatible.</p>{result.schemaCheck && <p><strong>Authored structure:</strong> {result.schemaCheck.state==='skipped' ? result.schemaCheck.reason : result.schemaCheck.passed ? 'Passed against the documented V3 snapshot.' : 'Issues found; see corrections below.'}</p>}</div>
      {result.diagnostics.length>0 && <ul className={styles.diagnostics}>{result.diagnostics.map((d,i)=><li key={i}><button type="button" onClick={()=>choose(d.path,true)}><code>{d.path}</code></button><p>{d.message}</p></li>)}</ul>}
      {selected && <div className={styles.workspace}>
        <nav className={styles.structure} aria-label="Structure of your configuration"><strong>Your file · {nodes.length} values</strong>{(children.get('#')||[]).map(n=>tree(n))}</nav>
        <article className={styles.detail}>
          <div className={styles.selection}><h2 ref={detailHeading} tabIndex={-1}>{selected.name}</h2><button type="button" disabled={!history.length} onClick={()=>{focusDetails.current=true;setSelection(history.at(-1)!);setHistory(history.slice(0,-1));}}>Back to previous selection</button></div>
          <p className={styles.path}><code>{selected.pointer}</code></p><p className={styles.hint}>Reference links open in a new tab so your pasted file stays here.</p>
          {selected.keys.length ? selected.keys.map(key=><div key={key.id}><p>{key.description}</p><Link target="_blank" rel="noopener noreferrer" to={`/references/configuration/explorer?key=${encodeURIComponent(key.id)}`}>Explore {key.key} →</Link></div>) : <p className={styles.hint}>This is a container, named entry, extension value or an unrecognized placement. Its parent and the <Link target="_blank" rel="noopener noreferrer" to="/references/configuration/all-keys">key reference</Link> explain supported structure. Unknown content is preserved.</p>}
          {reference && <div className={styles.reference}><strong>Component reference: {reference.status==='found'?'destination found':'unresolved'}</strong><p><code>{String(reference.ref)}</code></p>{reference.status==='found' && <button type="button" onClick={()=>choose(reference.targetPointer,true)}>Follow reference</button>}<p className={styles.hint}>{reference.shapeCheck==='checked'?'The local target with shallow sibling overrides passes the documented use-site shape. This does not establish runtime compatibility.':reference.shapeCheck==='issues'?'The destination exists, but its use-site shape needs correction; see the diagnostic.':'The destination shape has not been established here.'} Navigation follows the authored destination; your file and settings are not rewritten.</p></div>}
          {result.references.some(r=>r.targetPointer===selected.pointer) && <div className={styles.reference}><strong>Referenced from</strong><ul>{result.references.filter(r=>r.targetPointer===selected.pointer).map(r=><li key={r.pointer}><button type="button" onClick={()=>choose(r.pointer,true)}><code>{r.pointer}</code></button></li>)}</ul></div>}
          <details><summary>Selected value as a YAML preview</summary><p className={styles.hint}>This preview changes formatting only for display. Your original text above is preserved.</p><CodeBlock language="yaml">{dump(selected.value,{lineWidth:100})}</CodeBlock></details>
        </article>
      </div>}
    </>}
  </section>;
}
