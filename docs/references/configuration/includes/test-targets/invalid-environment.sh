docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env testBaseURL=not-a-url \
  --env CONFIG_FILE_PATH=configured.yaml \
  specmatic/enterprise test
