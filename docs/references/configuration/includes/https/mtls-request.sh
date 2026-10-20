curl --http1.1 --fail --silent --show-error --cacert certificates/server.pem \
  --cert certificates/client.pem --key certificates/client-key.pem \
  https://127.0.0.1:19120/greeting
