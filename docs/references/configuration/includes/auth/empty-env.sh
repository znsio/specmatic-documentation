docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env BearerAuth='' \
  --env SPECMATIC_OAUTH2_TOKEN=demo-bearer \
  --env CONFIG_FILE_PATH=blank-token.yaml \
  specmatic/enterprise test
