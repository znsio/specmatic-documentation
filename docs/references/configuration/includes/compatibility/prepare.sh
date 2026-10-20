if [[ -e contracts-demo ]]; then
  echo 'Use a fresh demo directory: contracts-demo already exists.' >&2
  exit 1
fi
mkdir contracts-demo
cd contracts-demo
git init -b main
git config --local user.name 'Configuration Demo'
git config --local user.email 'demo@example.invalid'
git config --local commit.gpgsign false
cp ../original.yaml contract.yaml
cp ../original.yaml other.yaml
git add contract.yaml other.yaml
git commit -m 'Original contracts'
git switch -c change
cp ../compatible.yaml contract.yaml
cp ../breaking.yaml other.yaml
git add contract.yaml other.yaml
git commit -m 'Optional query parameter and separate breaking change'
echo 'Compatibility demo ready: main baseline, change branch'
