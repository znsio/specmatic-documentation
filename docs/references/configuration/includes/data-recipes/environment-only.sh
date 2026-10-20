docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env EXAMPLE_DIRECTORIES=./examples/environment \
  --env CONFIG_FILE_PATH=extra-only.yaml \
  specmatic/enterprise mock
