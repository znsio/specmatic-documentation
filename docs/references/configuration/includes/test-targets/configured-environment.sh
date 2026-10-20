docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env testBaseURL=http://127.0.0.1:9102 \
  --env CONFIG_FILE_PATH=configured.yaml \
  specmatic/enterprise test
