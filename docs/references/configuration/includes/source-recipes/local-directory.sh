docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=local-directory.yaml \
  specmatic/enterprise mock
