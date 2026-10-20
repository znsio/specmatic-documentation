docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=test-matched.yaml \
  specmatic/enterprise test --testBaseURL http://127.0.0.1:9103
