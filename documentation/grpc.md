---
layout: default
title: gRPC
parent: Documentation
nav_order: 19
---
# Overview
This document will help you start two gRPC services, as:
* Provider (Stub)
* Consumer (Test)

# Setup the specification
Create a file named `specmatic.yaml` with below content.

```yaml
#specmatic.yaml
sources:
  - provider: git
    repository: https://github.com/znsio/specmatic-order-contracts
    test:
      - io/specmatic/examples/store/grpc/order_bff.proto
    stub:
      - io/specmatic/examples/store/grpc/order_api/order.proto
      - io/specmatic/examples/store/grpc/order_api/product.proto
```

This file instructs Specmatic to pull the following from the specified git repo :

**For Test (Consumer)**
* [Protocol buffer specification file named `order_bff.proto`](https://github.com/znsio/specmatic-order-contracts/blob/main/io/specmatic/examples/store/grpc/order_bff.proto)

**For Stub (Providers)** 
* [Protocol buffer specification file named `order.proto`](https://github.com/znsio/specmatic-order-contracts/blob/main/io/specmatic/examples/store/grpc/order_api/order.proto)
* [Protocol buffer specification file named `product.proto`](https://github.com/znsio/specmatic-order-contracts/blob/main/io/specmatic/examples/store/grpc/order_api/product.proto)


# Starting gRPC server via Command line

Now we can run below command to spin a Provider gRPC server and Consumer gRPC test. Please note the volume mapping to pass the specmatic.yaml to the Specmatic gRPC docker image and also the port mappings.

## Start the gRPC provider (Domain service)

```shell
docker run -p 9000:9000 -v "$PWD/specmatic.yaml:/usr/src/app/specmatic.yaml" znsio/specmatic-grpc-trial stub
```

This will launch a downstream gRPC service (provider), based on the specification you have provided or the sample that has been listed above.

## 

## Start the gRPC test (Consumer)

```shell
docker run -v "$PWD/specmatic.yaml:/usr/src/app/specmatic.yaml" znsio/specmatic-grpc-trial test --port={your-apps-port} --host={your-apps-host}
```

Based on the gRPC specification provided above, this will start a test to validate the service running at the provided host:port

## Sample project to see full usage

[Order BFF gRPC Application](https://github.com/znsio/specmatic-order-bff-grpc-go)



