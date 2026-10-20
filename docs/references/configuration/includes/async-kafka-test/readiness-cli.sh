docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=test-readiness.yaml \
  specmatic/enterprise test --subscriber-readiness-wait-time 3000
