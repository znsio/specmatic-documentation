export TLS_PASSWORD=docs-demo-pass
mkdir certificates
openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
  -keyout certificates/server-key.pem -out certificates/server.pem \
  -subj '/CN=localhost' -addext 'subjectAltName=IP:127.0.0.1,DNS:localhost'
openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
  -keyout certificates/client-key.pem -out certificates/client.pem \
  -subj '/CN=docs-client'
openssl pkcs12 -export -name demo-server \
  -inkey certificates/server-key.pem -in certificates/server.pem \
  -out certificates/server.pfx -passout env:TLS_PASSWORD
openssl pkcs12 -export -name demo-client \
  -inkey certificates/client-key.pem -in certificates/client.pem \
  -out certificates/client.pfx -passout env:TLS_PASSWORD
printf 'Demo certificates created.\n'
