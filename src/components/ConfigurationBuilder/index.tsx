import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import copyFallback from 'copy-text-to-clipboard';
import {build,defaults} from './build';
import {inspect} from '../ConfigurationInspector/inspect';
import styles from './styles.module.css';

export default function ConfigurationBuilder() {
  const [options,setOptions] = useState(defaults);
  const [format,setFormat] = useState('yaml');
  const [edited,setEdited] = useState<string|null>(null);
  const [editedFormat,setEditedFormat] = useState('yaml');
  const [mode,setMode] = useState('guided');
  const [feedback,setFeedback] = useState('');
  const [downloadUrl,setDownloadUrl] = useState('');
  const result = useMemo(()=>build(options),[options]);
  const guided = result.errors.length ? '' : result[format];
  const output = mode==='edited' ? edited||'' : guided;
  const activeFormat = mode==='edited' ? editedFormat : format;
  useEffect(()=>{
    if(!output){setDownloadUrl('');return;}
    const url=URL.createObjectURL(new Blob([output],{type:activeFormat==='json'?'application/json':'application/yaml'}));
    setDownloadUrl(url);
    return ()=>URL.revokeObjectURL(url);
  },[output,activeFormat]);
  const checked = useMemo(()=>output.trim() ? inspect(output) : null,[output]);
  const testing=options.task!=='mock', mocking=options.task!=='test';
  function change(key:string,value:string|boolean) {setOptions({...options,[key]:value});setFeedback('');}
  function field(key:string,label:string,hint?:string,multiline=false) {
    const props={id:`starter-${key}`,'aria-describedby':hint?`starter-${key}-hint`:undefined,value:options[key],onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>change(key,e.target.value)};
    return <div className={styles.field}><label htmlFor={props.id}>{label}</label>{multiline?<textarea {...props} rows={3}/>:<input {...props}/>}{hint&&<small id={`starter-${key}-hint`}>{hint}</small>}</div>;
  }
  async function copy() {
    try {await navigator.clipboard.writeText(output);setFeedback(`Copied the ${mode==='edited'?'edited file':'guided starter'}.`);}
    catch {
      const copied=copyFallback(output);
      setFeedback(copied?`Copied the ${mode==='edited'?'edited file':'guided starter'}.`:'Clipboard access was unavailable. Select and copy the displayed text.');
    }
  }
  return <section className={styles.builder} aria-label="Configuration starter builder">
    <div className={styles.layout}>
      <div className={styles.form}>
        <h2>1. Choose your setup</h2><p className={styles.hint}>Guide and inspector links open in a new tab, keeping your starter and edits here.</p>
        <label className={styles.field}><span>What do you want to do?</span><select value={options.task} onChange={e=>change('task',e.target.value)}><option value="mock">Mock an API</option><option value="test">Test an API</option><option value="both">Test with mocked dependencies</option></select></label>
        <p className={styles.hint}>OpenAPI · OSS &amp; Enterprise. For another protocol, use its <Link target="_blank" rel="noopener noreferrer" to="/references/configuration/test-configuration">configuration guide</Link>.</p>
        <label className={styles.field}><span>Configuration style</span><select value={options.form} onChange={e=>change('form',e.target.value)}><option value="inline">Inline — start small</option><option value="components">Reusable components — share definitions</option></select></label>
        <label className={styles.field}><span>Where are your contracts?</span><select value={options.source} onChange={e=>change('source',e.target.value)}><option value="filesystem">Local filesystem</option><option value="git">Git repository over HTTP(S)</option><option value="web">Web URL over HTTP(S)</option></select></label>
        {options.source==='filesystem' ? field('directory','Contract directory','The default . is the folder for these local examples.') : field('url',options.source==='git'?'Repository URL':'Web source URL','Use your real URL. Private Git credentials are configured separately; never embed them in the URL.')}
        {options.source==='git' && field('branch','Branch (optional)','Leave blank to omit it; this does not mean the builder chooses a branch.')}
        {options.form==='components' && <details><summary>Name your reusable components</summary>{field('sourceName','Source name')}{testing&&field('testName','Test service name')}{mocking&&field('mockName','Mock service name')}<p className={styles.hint}>References point to the names above. Run options stay at the test/mock use sites.</p></details>}
        <h2>2. Set contracts and targets</h2>
        {testing && <>{field('testSpecs','API-under-test contract paths','One path per line, relative to the selected source.',true)}{field('baseUrl','Running API base URL','The demo listens on port 9100. Replace this with your application URL.')}</>}
        {mocking && <>{field('mockSpecs',testing?'Dependency contract paths':'Mock contract paths','One path per line, relative to the selected source.',true)}{field('host','Mock listener host','127.0.0.1 limits this example to your machine.')}{field('port','Mock listener port','9101 is the example port; choose an available one.')}</>}
        <details><summary>Add optional data and settings</summary>{testing&&<><label className={styles.checkbox}><input type="checkbox" checked={options.timeoutEnabled} onChange={e=>change('timeoutEnabled',e.target.checked)}/><span>Set test timeout explicitly</span></label>{options.timeoutEnabled&&field('timeout','Test timeout (milliseconds)','Omitted until enabled. 5000 is a suggested value, not a claimed runtime default.')}</>}{field('examples','Example directories (optional)','One local directory per line. In a combined setup these directories apply to both services.',true)}{field('dictionary','Dictionary file (optional)','A local dictionary path. In a combined setup it applies to both services.')}<p className={styles.hint}>Use the <Link target="_blank" rel="noopener noreferrer" to="/references/configuration/explorer">key reference</Link> and editable file for other settings and per-spec overrides.</p></details>
        {result.errors.length>0&&<div className={styles.errors} role="status"><strong>Complete the guided inputs</strong><ul>{result.errors.map((error,i)=><li key={i}>{error}</li>)}</ul></div>}
      </div>
      <div className={styles.output}>
        <h2>3. Make it yours</h2>
        <div className={styles.tabs} role="group" aria-label="Working configuration"><button type="button" aria-pressed={mode==='guided'} onClick={()=>{setMode('guided');setFeedback('');}}>Guided starter</button><button type="button" aria-pressed={mode==='edited'} disabled={edited===null && !guided} onClick={()=>{if(edited===null){setEdited(guided);setEditedFormat(format);}setMode('edited');setFeedback('');}}>My edited file</button></div>
        <p className={styles.hint}>{mode==='edited'?'Copy and download use your edited text below. Guided changes never overwrite it.':'Copy and download use the guided starter below.'}{edited!==null&&mode==='guided'?' Your edited file is still available in its tab.':''} Both versions stay in page memory only.</p>
        {mode==='guided' ? <><label className={styles.field}><span>Output format</span><select value={format} onChange={e=>{setFormat(e.target.value);setFeedback('');}}><option value="yaml">YAML</option><option value="json">JSON</option></select></label>{guided ? <CodeBlock language={format} title={`specmatic.${format}`}>{guided}</CodeBlock> : <p>Complete the inputs to generate a file. Your saved manual edits remain available.</p>}</> : <label className={styles.field}><span>Your edited configuration ({editedFormat.toUpperCase()})</span><textarea className={styles.editor} spellCheck={false} value={edited||''} onChange={e=>{setEdited(e.target.value);setFeedback('');}}/></label>}
        <div className={styles.actions}><button type="button" disabled={!output} onClick={copy}>Copy {activeFormat.toUpperCase()}</button>{downloadUrl?<a href={downloadUrl} download={`specmatic.${activeFormat}`} onClick={()=>setFeedback(`Download started for the ${mode==='edited'?'edited file':'guided starter'}.`)}>Download specmatic.{activeFormat}</a>:<button type="button" disabled>Download specmatic.{activeFormat}</button>}</div>
        <p className={styles.feedback} role="status">{feedback}</p>
        {checked && <div className={styles.checks}><strong>{checked.diagnostics.length?`${checked.diagnostics.length} items to review`:'Browser structure checks passed'}</strong><p className={styles.hint}>{checked.schemaCheck?.state==='skipped'?checked.schemaCheck.reason:'This checks the V3 snapshot and local reference existence. It does not fetch contracts or establish runtime validity.'}</p>{checked.diagnostics.length>0&&<ul>{checked.diagnostics.slice(0,8).map((d,i)=><li key={i}><code>{d.path}</code> — {d.message}</li>)}</ul>}<Link target="_blank" rel="noopener noreferrer" to="/references/configuration/inspect">Open the inspector in a new tab →</Link><p className={styles.hint}>Copy the selected file first, then paste it into the inspector.</p></div>}
      </div>
    </div>
    <div className={styles.next}><h2>4. Save and run</h2><p>These commands use the <code>specmatic/enterprise</code> Docker image. Follow the <Link target="_blank" rel="noopener noreferrer" to="/references/configuration/local-openapi#docker-setup">Docker, host-networking and license setup</Link> first.</p><p>The default <code>books.yaml</code> is a sample API specification. <Link target="_blank" rel="noopener noreferrer" to="/references/configuration/local-openapi#mock-an-api">Save the sample books.yaml</Link> alongside your configuration before running these commands, or replace its path with your own specification. Downloading the configuration does not download the specification.</p><p>Save only the file you intend to use in your working folder. If both <code>specmatic.yaml</code> and <code>specmatic.json</code> exist, remove ambiguity by selecting your intended file explicitly as shown in the <Link target="_blank" rel="noopener noreferrer" to="/references/configuration/local-openapi">recipes</Link>.</p>{mocking&&<><p>Start the mock in a terminal:</p><CodeBlock language="shell">{require('../../../docs/references/configuration/includes/local-openapi/run-mock.sh?raw').trimEnd()}</CodeBlock></>}{testing&&<><p>{mocking?'Configure your application’s dependency client to call the mock listener, then start your application. Run the test in another terminal:':'Start your application at the test base URL, then run:'}</p><CodeBlock language="shell">{require('../../../docs/references/configuration/includes/local-openapi/run-test.sh?raw').trimEnd()}</CodeBlock></>}<p>These commands correspond to the selected starter task. If manual edits change its roles or targets, update the run instructions accordingly. Inspect a real response or the test report; a browser check cannot prove your service behaves correctly.</p><p><Link target="_blank" rel="noopener noreferrer" to="/references/configuration/local-openapi">Complete local demo, validation commands and expected results →</Link> · <Link target="_blank" rel="noopener noreferrer" to="/references/configuration/contract-management">Git/web paths and private Git guidance →</Link></p></div>
  </section>;
}
