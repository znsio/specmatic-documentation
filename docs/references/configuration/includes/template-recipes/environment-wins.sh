export DOC_TEMPLATE_FORMAT=yaml
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env DOC_TEMPLATE_FORMAT \
  --env JAVA_TOOL_OPTIONS='-DDOC_TEMPLATE_FORMAT=missing' \
  specmatic/enterprise mock
