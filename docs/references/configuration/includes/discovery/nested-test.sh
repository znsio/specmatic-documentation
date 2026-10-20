test -f config/test.yaml
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONTRACT_DIRECTORY="/usr/src/app/specs" \
  --env CONFIG_FILE_PATH=config/test.yaml \
  specmatic/enterprise test
