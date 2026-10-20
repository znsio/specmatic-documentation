const http = require('node:http');
const fs = require('node:fs');
const server = http.createServer((request,response)=>{
  fs.appendFileSync('target-calls.jsonl',JSON.stringify({path:request.url,method:request.method})+'\n');
  const reply=()=>{
    response.setHeader('Content-Type','application/json');
    response.setHeader('X-Trace','demo-trace');
    response.setHeader('X-Keep','retained');
    response.end(JSON.stringify({message:'hello proxy'}));
  };
  if (request.url === '/slow') setTimeout(reply,200); else reply();
});
server.listen(19110,'127.0.0.1',()=>console.log('Target ready on http://127.0.0.1:19110'));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
