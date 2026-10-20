# Start the backend mock and a demo gateway that calls it, then test the gateway.
mock_container="specmatic-books-backend-$$"
docker run --rm --network host \
  --name "$mock_container" \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  specmatic/enterprise mock > mock.log 2>&1 &
mock_pid=$!
trap 'docker rm --force "$mock_container" >/dev/null 2>&1 || true; kill ${demo_pid:+"$demo_pid"} 2>/dev/null || true' EXIT
for attempt in {1..100}; do
  if node verify-service.cjs 9101 2>/dev/null; then break; fi
  kill -0 "$mock_pid" 2>/dev/null || { cat mock.log; exit 1; }
  sleep 0.2
done
node verify-service.cjs 9101
DEMO_DEPENDENCY_URL=http://127.0.0.1:9101 node demo-service.cjs > demo.log 2>&1 &
demo_pid=$!
for attempt in {1..100}; do
  [[ -f demo-ready.txt ]] && break
  kill -0 "$demo_pid" 2>/dev/null || { cat demo.log; exit 1; }
  sleep 0.1
done
[[ -f demo-ready.txt ]] || { cat demo.log; exit 1; }
docker run --rm --network host \
  -v ./:/usr/src/app \
  -v "$HOME/.specmatic:/root/.specmatic" \
  specmatic/enterprise test
