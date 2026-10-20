docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=mock.yaml \
  specmatic/enterprise validate --spec-file greeter.proto
