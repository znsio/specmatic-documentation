const http=require('node:http');
for(const port of [9000,9100,9102]) {
  http.createServer((request,response)=>{
    const path=new URL(request.url,'http://localhost').pathname;
    if(path==='/books/1')console.log(JSON.stringify({port,path}));
    if(request.method!=='GET' || path!=='/books/1'){response.writeHead(404);response.end();return;}
    response.writeHead(200,{'Content-Type':'application/json'});
    response.end(JSON.stringify({id:1,title:'Specmatic Handbook'}));
  }).listen(port,'127.0.0.1',()=>console.log(`Books target ready on ${port}`));
}
