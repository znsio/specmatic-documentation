docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env BOOKS_TARGET=http://127.0.0.1:9102 \
  --env CONFIG_FILE_PATH=templated.yaml \
  specmatic/enterprise test
