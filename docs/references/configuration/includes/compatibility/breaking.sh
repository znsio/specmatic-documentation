cp breaking.yaml contracts-demo/contract.yaml
git -C contracts-demo add contract.yaml
git -C contracts-demo commit -m 'Change response message to integer'
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  specmatic/enterprise backward-compatibility-check
