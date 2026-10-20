docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env JAVA_TOOL_OPTIONS='-DDOC_TEMPLATE_FORMAT=yml' \
  specmatic/enterprise mock
