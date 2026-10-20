docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=configured.yaml \
  specmatic/enterprise test --host 127.0.0.1 --port 9102
