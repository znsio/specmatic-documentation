docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env TLS_PASSWORD \
  --env CONFIG_FILE_PATH=mtls-mock.yaml \
  specmatic/enterprise mock
