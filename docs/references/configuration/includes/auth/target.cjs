const fs=require('node:fs');
const http=require('node:http');
const expected={bearer:'Bearer demo-bearer',oauth:'Bearer demo-oauth',oidc:'Bearer demo-oidc',basic:'Basic ZG9jczpkZW1v',header:'demo-header',query:'demo-query'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:19130');const route=url.pathname.slice(1);
 if(req.method!=='GET'||!(route in expected||route==='public')){res.writeHead(404);res.end();return;}
 const credential=route==='header'?req.headers['x-api-key']:route==='query'?url.searchParams.get('api_key'):req.headers.authorization;
 const accepted=route==='public'?credential===undefined:credential===expected[route];
 fs.appendFileSync('requests.log',JSON.stringify({route,credential:credential??null,accepted})+'\n');
 res.writeHead(accepted?200:401,{'content-type':'application/json'});
 res.end(JSON.stringify(accepted?{message:'hello auth'}:{error:'Unauthorized'}));
}).listen(19130,'127.0.0.1',()=>console.log('Auth target ready on http://127.0.0.1:19130'));
