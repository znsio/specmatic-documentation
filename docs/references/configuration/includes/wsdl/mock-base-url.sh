docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env SOAP_SPEC_DIRECTORY="/usr/src/app" \
  --env CONFIG_FILE_PATH=mock-base-url.yaml \
  specmatic/enterprise mock
