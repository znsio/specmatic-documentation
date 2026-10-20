const http=require('node:http');
const fs=require('node:fs');
http.createServer((request,response)=>{
  console.log(JSON.stringify({method:request.method,path:request.url}));
  if(request.method!=='GET' || request.url!=='/contracts/books.yaml'){response.writeHead(404);response.end();return;}
  response.writeHead(200,{'Content-Type':'application/yaml'});
  response.end(fs.readFileSync('contracts/books.yaml'));
}).listen(9200,'127.0.0.1',()=>console.log('Contract source ready on 9200'));
