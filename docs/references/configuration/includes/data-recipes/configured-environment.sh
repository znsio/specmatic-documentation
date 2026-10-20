docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env EXAMPLE_DIRECTORIES=./examples/environment \
  --env CONFIG_FILE_PATH=service-data.yaml \
  specmatic/enterprise mock
