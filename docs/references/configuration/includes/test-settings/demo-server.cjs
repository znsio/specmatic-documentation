const http = require('node:http');
http.createServer((request, response) => {
  const id = /^\/books\/([12])$/.exec(request.url || '')?.[1];
  if (request.method !== 'GET' || !id) { response.writeHead(404); response.end(); return; }
  setTimeout(() => {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify({id: Number(id), title: id === '1' ? 'Specmatic Handbook' : 'Second Book'}));
  }, 300);
}).listen(9100, '127.0.0.1', () => {
  console.log('Demo Books API is ready at http://127.0.0.1:9100');
});
