---
layout: default
title: GraphQL
parent: Documentation
nav_order: 18
---
# Starting GraphQL Stub Server from command line

Create a file named `specmatic.yaml` with below content.

```yaml
#specmatic.yaml
sources:
  - provider: git
    repository: https://github.com/znsio/specmatic-order-contracts.git
    consumes:
      - io/specmatic/examples/store/graphql/products_bff.graphqls
```

This file instructs Specmatic to pull the [GraphQL spec named `products_bff.graphqls`](https://github.com/znsio/specmatic-order-contracts/blob/main/io/specmatic/examples/store/graphql/products_bff.graphqls) from a Git repo.

Please refer to [Specmatic documentation](https://specmatic.in/documentation/) for more details about the above `specmatic.yaml` config file.

Now we can run below command to spin a GraphQL stub. Please note the volume mapping to pass the specmatic.yaml to the GraphQL Docker image and also the port mappings.

```shell
docker run -p 9000:9000 -v "$PWD/specmatic.yaml:/usr/src/app/specmatic.yaml" znsio/specmatic-graphql-trial virtualize --port=9000
```

To test the stub is up and running, run the following command in the terminal

```shell
curl -X POST -H
"Content-Type: application/json" \
-d '{"query": "{ user(id: \"1\") { id name email } }"}' \
http://your-graphql-endpoint.com/graphql
```

# Running Contract Tests Against a GraphQL-Based Service

Create a service which implements the GraphQL endpoints as per the [products_bff.graphqls](https://github.com/znsio/specmatic-order-contracts/blob/main/io/specmatic/examples/store/graphql/products_bff.graphqls) specification.

This service will use a GraphQL test to send requests to your service and upon receiving a reply the results will be printed to the console.

### Specmatic Configuration
Create a specmatic.yaml configuration file to specify the contract for the service:
```yaml
sources:
  - provider: git
    repository: https://github.com/znsio/specmatic-order-contracts.git
    test:
      - io/specmatic/examples/store/openapi/graphql_consumer_api_v1.yaml
```
This configuration informs Specmatic that the service provides the implementation as per the specification listed under the test key. This setup allows Specmatic to run tests against the service using the provided spec.

### Testing the Service
To test this service from the command line, follow the below steps.
1. **Start GraphQL providerr**: Launch a local instance of the GraphQL provider the desired host and port.
2. **Run the Service**: Start your service locally.
3. **Run Contract Tests**: Use the following command to run the contract tests against the service by replacing `host` and `port` with appropriate values:
```shell
docker run -v "$PWD/specmatic.yaml:/usr/src/app/specmatic.yaml" znsio/specmatic-graphql-trial test --host=<host> --port=<port>
```


To get a hands-on experience, refer to [these](https://specmatic.io/documentation/sample_projects.html#graphql) sample projects.

