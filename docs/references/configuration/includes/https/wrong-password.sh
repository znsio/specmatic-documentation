docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env TLS_PASSWORD \
  --env CONFIG_FILE_PATH=wrong-password.yaml \
  specmatic/enterprise mock --httpsKeyStorePassword docs-demo-pass
