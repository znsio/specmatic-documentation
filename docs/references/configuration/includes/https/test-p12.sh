cp certificates/client.pfx certificates/client.p12
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env TLS_PASSWORD \
  --env CONFIG_FILE_PATH=test-p12.yaml \
  specmatic/enterprise test
