docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  specmatic/enterprise config validate --input specmatic.yaml
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  specmatic/enterprise config validate --input resilience.yaml
