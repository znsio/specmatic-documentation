docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=short-timeout.yaml \
  specmatic/enterprise test --timeout-in-ms 4000
