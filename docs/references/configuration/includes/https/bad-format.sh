cp certificates/server.pfx certificates/server.p12
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env TLS_PASSWORD \
  --env CONFIG_FILE_PATH=bad-format.yaml \
  specmatic/enterprise mock
