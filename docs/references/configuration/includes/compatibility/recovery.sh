cp breaking.yaml contracts-demo/contract.yaml
git -C contracts-demo add contract.yaml
git -C contracts-demo diff --cached --quiet || git -C contracts-demo commit -m 'Breaking response change'
cp compatible.yaml contracts-demo/contract.yaml
git -C contracts-demo add contract.yaml
git -C contracts-demo commit -m 'Restore response type'
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  specmatic/enterprise backward-compatibility-check
