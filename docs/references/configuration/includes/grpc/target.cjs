// A demo for this one unary RPC, not a general gRPC server.
const http2 = require('node:http2');
const assert = require('node:assert/strict');
const port = Number(process.env.DEMO_GRPC_PORT || 9100);
const delay = Number(process.env.DEMO_GRPC_DELAY_MS || 0);
assert.ok(Number.isFinite(delay) && delay >= 0, 'demo delay must be a nonnegative number');
const server = http2.createServer();
server.on('stream', (stream, headers) => {
  const chunks = [];
  stream.on('data', chunk => chunks.push(chunk));
  stream.on('end', () => {
    const frame = Buffer.concat(chunks);
    assert.equal(headers[':path'], '/docs.Greeter/SayHello');
    assert.equal(frame[0], 0, 'demo accepts an uncompressed request');
    assert.equal(frame.readUInt32BE(1), frame.length - 5);
    const message = frame.subarray(5);
    assert.equal(message[0], 10, 'name is string field 1');
    assert.ok(message[1] < 128, 'demo accepts a short name');
    assert.equal(message.length, message[1] + 2);
    const name = message.subarray(2).toString('utf8');
    console.log(JSON.stringify({port, method:headers[':path'], name}));
    const text = Buffer.from(`Hello ${name}!`);
    assert.ok(text.length < 128, 'demo returns a short message');
    const response = Buffer.concat([Buffer.from([10, text.length]), text]);
    const envelope = Buffer.alloc(5);
    envelope.writeUInt32BE(response.length, 1);
    setTimeout(() => {
      if (stream.destroyed) return; // A deadline may have cancelled the request.
      stream.respond({':status':200, 'content-type':'application/grpc'}, {waitForTrailers:true});
      stream.on('wantTrailers', () => stream.sendTrailers({'grpc-status':'0'}));
      stream.end(Buffer.concat([envelope, response]));
    }, delay);
  });
});
server.listen(port, '127.0.0.1', () => console.log(`gRPC demo ready on 127.0.0.1:${port}`));
