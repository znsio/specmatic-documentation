const http = require('node:http');
http.createServer((request, response) => {
  console.log(JSON.stringify({method: request.method, path: request.url, port: 9100}));
  response.setHeader('Content-Type', 'application/json');
  if (request.method === 'GET' && request.url === '/books/1') {
    response.end(JSON.stringify({id: 1, title: 'Specmatic Handbook'}));
  } else { response.statusCode = 404; response.end('{}'); }
}).listen(9100, '127.0.0.1', () => console.log('Migration target ready on 9100'));
