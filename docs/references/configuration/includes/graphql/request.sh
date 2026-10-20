curl --fail-with-body --silent --show-error http://127.0.0.1:9101/graphql \
  --header 'Content-Type: application/json' \
  --header 'X-Example: catalog_examples' \
  --data-binary @request.json \
  --write-out '\nHTTP %{http_code}\n'
