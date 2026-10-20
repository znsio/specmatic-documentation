docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=bad-auth.yaml \
  specmatic/enterprise mcp test --bearer-token docs-demo
