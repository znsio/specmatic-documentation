docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env API_TOKEN=demo-bearer \
  --env CONFIG_FILE_PATH=template.yaml \
  specmatic/enterprise test
