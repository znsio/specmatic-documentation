test ! -e after.yaml &&
  docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  specmatic/enterprise config upgrade --input before.yaml --output after.yaml
