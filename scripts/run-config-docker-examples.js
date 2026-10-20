// Run the published Docker commands; track container IDs solely for test cleanup.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync,spawnSync}=require('node:child_process');
const assert=require('node:assert/strict');
const image='specmatic/enterprise';
const folders=process.argv.slice(2);
assert.ok(folders.length,'Supply configuration example folders.');
const docker=execFileSync('which',['docker'],{encoding:'utf8'}).trim();
const execute=(args,options={})=>execFileSync(docker,args,{encoding:'utf8',...options});
console.log(execute(['run','--rm',image,'--version']).trim());
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'docs-docker-'));
const records=path.join(temporary,'containers');fs.mkdirSync(records);
const jar=path.join(temporary,'enterprise.jar');
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
function cleanContainers(){
  for(const file of fs.readdirSync(records)){
    const location=path.join(records,file),id=fs.readFileSync(location,'utf8').trim();
    if(id)try{execute(['rm','--force',id],{stdio:'ignore'});}catch{}
    fs.rmSync(location,{force:true});
  }
}
try{
  // Independent Kafka client fixtures need the same image's Java classes.
  const container=execute(['create',image]).trim();
  try{execute(['cp',container+':/usr/local/share/enterprise-snapshots/enterprise-snapshots.jar',jar]);}
  finally{execute(['rm',container],{stdio:'ignore'});}
  fs.writeFileSync(path.join(temporary,'docker'),`#!/usr/bin/env bash
if [[ "$1" != run ]]; then exec ${quote(docker)} "$@"; fi
shift
record=$(mktemp "$DOC_DOCKER_CONTAINER_RECORDS/container.XXXXXX")
rm "$record"
cleanup() {
  if [[ -s "$record" ]]; then ${quote(docker)} rm --force "$(cat "$record")" >/dev/null 2>&1 || true; fi
  rm -f "$record"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT
${quote(docker)} run --cidfile "$record" "$@" &
client=$!
status=0
wait "$client" || status=$?
exit "$status"
`,{mode:0o755});
  const failed=[];
  for(const folder of folders){
    const result=spawnSync(process.execPath,[path.join(__dirname,'check-doc-examples.js'),folder],{stdio:'inherit',env:{...process.env,PATH:temporary+path.delimiter+process.env.PATH,DOC_DOCKER_CONTAINER_RECORDS:records,DOC_EXAMPLE_JAR:jar,SPECMATIC_ENTERPRISE_JAR:jar,SPECMATIC_EDITION:'enterprise'}});
    cleanContainers();
    if(result.status!==0)failed.push(folder);
  }
  assert.deepEqual(failed,[],'Docker example folders failed');
}finally{cleanContainers();fs.rmSync(temporary,{recursive:true,force:true});}
