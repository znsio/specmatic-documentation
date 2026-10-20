docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=wrong-url.yaml \
  specmatic/enterprise mcp test --url http://127.0.0.1:19100/mcp
