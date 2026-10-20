test -f config/mock.yaml
cd config
docker run --rm --network host \
  -v ./:/usr/src/app -v ../:/usr/src \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=mock.yaml \
  specmatic/enterprise mock
