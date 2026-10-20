docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=wrong-target.yaml \
  specmatic/enterprise proxy --target http://127.0.0.1:19110
