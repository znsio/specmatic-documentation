const http = require('node:http');
const fs = require('node:fs');
const book = {id: 1, title: 'Specmatic Handbook'};
const dependency = process.env.DEMO_DEPENDENCY_URL;
const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' || request.url !== '/books/1') {
    response.writeHead(404); response.end(); return;
  }
  try {
    const upstream = dependency ? await fetch(`${dependency}/books/1`, {signal: AbortSignal.timeout(5000)}) : null;
    response.writeHead(upstream?.status || 200, {'Content-Type': 'application/json'});
    response.end(upstream ? await upstream.text() : JSON.stringify(book));
  } catch {
    response.writeHead(502); response.end();
  }
});
server.listen(9100, '127.0.0.1', () => {
  fs.writeFileSync('demo-ready.txt', 'ready');
  console.log('Demo Books API is ready at http://127.0.0.1:9100');
});
