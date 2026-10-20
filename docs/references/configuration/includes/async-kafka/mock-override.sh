docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=mock-override.yaml \
  --env API_SERVER_PORT=19999 \
  specmatic/enterprise mock
