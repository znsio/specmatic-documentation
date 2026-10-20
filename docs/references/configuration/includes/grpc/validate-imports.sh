docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=test-import.yaml \
  specmatic/enterprise validate --spec-file imported-greeter.proto
