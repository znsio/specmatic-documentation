const http = require('node:http');
for (const port of [9100, 9102]) {
  http.createServer((request, response) => {
    let body = '';
    request.on('data', chunk => body += chunk);
    request.on('end', () => {
      console.log(JSON.stringify({port, method: request.method, path: request.url, example: request.headers['x-example'], body}));
      response.setHeader('Content-Type', 'application/json');
      if (request.method !== 'POST' || request.url !== '/graphql') {
        response.statusCode = 404; response.end('{}'); return;
      }
      response.end(JSON.stringify({data: {get: body.includes('book') ? 20 : 10}}));
    });
  }).listen(port, '127.0.0.1', () => console.log(`GraphQL target ready on ${port}`));
}
