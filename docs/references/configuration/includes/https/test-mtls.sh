docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env TLS_PASSWORD \
  --env CONFIG_FILE_PATH=test-mtls.yaml \
  specmatic/enterprise test
