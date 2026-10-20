grpcurl -plaintext -proto greeter.proto -d '{"name":"docs"}' \
  127.0.0.1:9101 docs.Greeter/SayHello
