docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONFIG_FILE_PATH=no-record.yaml \
  specmatic/enterprise proxy | tee no-record.log
