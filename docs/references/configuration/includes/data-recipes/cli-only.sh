docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=extra-only.yaml \
  specmatic/enterprise mock --examples ./examples/environment
