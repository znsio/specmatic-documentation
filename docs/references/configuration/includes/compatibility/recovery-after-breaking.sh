cp breaking.yaml contracts-demo/contract.yaml
git -C contracts-demo add contract.yaml
git -C contracts-demo commit -m 'Breaking change before recovery'
bash recovery.sh
