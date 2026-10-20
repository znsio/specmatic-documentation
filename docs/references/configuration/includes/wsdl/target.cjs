const http = require('node:http');
const fs = require('node:fs');
for (const port of [9100, 9102]) {
  http.createServer((request, response) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      console.log(JSON.stringify({port, method:request.method, path:request.url, action:request.headers.soapaction, body}));
      response.setHeader('Content-Type','text/xml');
      if (request.method === 'POST' && request.url === '/soap' && body.includes('<SimpleRequest>')) {
        response.end(fs.readFileSync('response.xml'));
      } else { response.statusCode = 404; response.end(''); }
    });
  }).listen(port, '127.0.0.1', () => console.log(`SOAP target ready on ${port}`));
}
