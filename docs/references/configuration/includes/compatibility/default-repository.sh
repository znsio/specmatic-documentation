cd contracts-demo
docker run --rm --network host \
  -v ./:/usr/src/app -v ../:/usr/src \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=../no-repository.yaml \
  --env GIT_CONFIG_COUNT=1 \
  --env GIT_CONFIG_KEY_0=safe.directory \
  --env GIT_CONFIG_VALUE_0="/usr/src/app" \
  specmatic/enterprise backward-compatibility-check
cd ..
