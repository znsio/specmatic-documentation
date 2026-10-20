docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env SOAP_SPEC_DIRECTORY="/usr/src/app" \
  specmatic/enterprise config validate --input mock.yaml
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env SOAP_SPEC_DIRECTORY="/usr/src/app" \
  specmatic/enterprise config validate --input test.yaml
