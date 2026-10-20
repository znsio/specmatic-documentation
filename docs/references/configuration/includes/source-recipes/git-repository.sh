docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  --env CONTRACTS_REPOSITORY="file:///usr/src/app/source-repository" \
  --env CONFIG_FILE_PATH=git-repository.yaml \
  specmatic/enterprise mock
