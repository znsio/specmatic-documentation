docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env BearerAuth=demo-bearer \
  --env CONFIG_FILE_PATH=wrong-name.yaml \
  specmatic/enterprise test
