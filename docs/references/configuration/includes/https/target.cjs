const fs = require('node:fs');
const https = require('node:https');
const options = {
  key: fs.readFileSync('certificates/server-key.pem'),
  cert: fs.readFileSync('certificates/server.pem'),
  ca: fs.readFileSync('certificates/client.pem'),
  requestCert: true,
  rejectUnauthorized: true,
};
https.createServer(options, (req, res) => {
  if (req.method !== 'GET' || req.url !== '/greeting') {res.writeHead(404);res.end();return;}
  const peer = req.socket.getPeerCertificate();
  fs.appendFileSync('target-requests.log', JSON.stringify({authorized:req.socket.authorized,client:peer.subject.CN})+'\n');
  res.writeHead(200, {'content-type':'application/json'});
  res.end(JSON.stringify({message:'hello TLS'}));
}).listen(19121, '127.0.0.1', () => console.log('Independent mTLS target ready on https://127.0.0.1:19121'));
