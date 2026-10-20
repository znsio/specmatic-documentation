const http = require('node:http');
const fs = require('node:fs');
const port = Number(process.env.PORT || 19100);
const inputSchema = {type:'object',properties:{text:{type:'string'}},required:['text'],additionalProperties:false};
const tools = ['echo','broken'].map(name => ({name,description:`Local demo ${name}`,inputSchema,outputSchema:inputSchema}));
const server = http.createServer(async (req, res) => {
  res.setHeader('content-type','application/json');
  if (req.method !== 'POST' || req.url !== '/mcp') {res.writeHead(404);res.end('{}');return;}
  if (req.headers.authorization !== 'Bearer docs-demo') {res.writeHead(401);res.end(JSON.stringify({jsonrpc:'2.0',id:null,error:{code:-32001,message:'Demo token required'}}));return;}
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 1000000) {res.writeHead(413);res.end('{}');return;}
  }
  let rpc;
  try {rpc = JSON.parse(text);} catch {res.writeHead(400);res.end('{}');return;}
  const reply = result => res.end(JSON.stringify({jsonrpc:'2.0',id:rpc.id,result}));
  if (rpc.method === 'initialize') {reply({protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'local-docs-demo',version:'1.0'}});return;}
  if (rpc.method === 'notifications/initialized') {res.writeHead(202);res.end();return;}
  if (rpc.method === 'tools/list') {reply({tools});return;}
  if (rpc.method === 'tools/call') {
    const {name,arguments:args} = rpc.params || {};
    fs.appendFileSync('calls.jsonl',JSON.stringify({name,arguments:args})+'\n');
    const invalid = !tools.some(tool=>tool.name===name) || !args || typeof args.text !== 'string' || Object.keys(args).some(key=>key!=='text');
    const isError = invalid || name === 'broken';
    reply({content:[{type:'text',text:isError?'Demo tool error':args.text}],structuredContent:isError?{}:{text:args.text},isError});return;
  }
  res.end(JSON.stringify({jsonrpc:'2.0',id:rpc.id,error:{code:-32601,message:'Unknown method'}}));
});
server.listen(port,'127.0.0.1',()=>console.log(`Demo MCP server ready on http://127.0.0.1:${port}/mcp`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
