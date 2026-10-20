docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=shared.yaml \
  specmatic/enterprise mock
