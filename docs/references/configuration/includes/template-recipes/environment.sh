export DOC_TEMPLATE_SETTINGS='{"strictMode":false,"hotReload":false}'
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env DOC_TEMPLATE_SETTINGS \
  specmatic/enterprise mock
