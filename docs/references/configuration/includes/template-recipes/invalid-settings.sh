docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env DOC_TEMPLATE_SETTINGS=broken \
  specmatic/enterprise config validate --input specmatic.yaml
