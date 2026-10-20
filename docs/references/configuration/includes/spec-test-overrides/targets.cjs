const http=require('node:http');
for(const [port,route,title] of [[9100,'books','Specmatic Handbook'],[9102,'authors','Authors Handbook']]) {
  http.createServer((request,response)=>{
    const path=new URL(request.url,'http://localhost').pathname;
    if(/\/(books|authors)\/1$/.test(path))console.log(JSON.stringify({port,path}));
    const allowed=path===`/${route}/1` || (route==='authors' && path==='/v2/authors/1');
    if(!allowed || request.method!=='GET'){response.writeHead(404);response.end();return;}
    response.writeHead(200,{'Content-Type':'application/json'});
    response.end(JSON.stringify({id:1,title}));
  }).listen(port,'127.0.0.1',()=>console.log(`Target ${route} ready on ${port}`));
}
