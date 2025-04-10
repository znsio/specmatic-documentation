---
layout: default
title: Kafka Stubbing
parent: Documentation
nav_exclude: true
---

# Kafka Stubbing

> The `specmatic-kafka` module described in this document is available in the [Pro plan](https://specmatic.io/pricing/) or higher. Please get in touch with us through the `Contact Us` form at [specmatic.io](https://specmatic.io) if you'd like to try it out.

## Introduction to Kafka stubbing

Apache Kafka is an open-source distributed event streaming platform used by thousands of companies for high-performance
data pipelines, streaming analytics, data integration, and mission-critical applications.

### Pre-requisite Setup

Add the specification file (which will be used to stub kafka) in the src/test/resources directory. See a sample specification here:

```yaml
asyncapi: 2.0.0
info:
  title: Kafka Queue Example
  version: '1.0.0'
servers:
  activemq:
    url: tcp://localhost:61616
    protocol: amqp
channels:
  taskQueueObject:
    publish:
      operationId: publishObjectMessage
      message:
        payload:
          $ref: "#/components/messages/Task"
    bindings:
      amqp:
        is: queue
components:
  messages:
    Task:
      name: Task
      title: A Task to be processed
      summary: Inform about a new user task in the system
      contentType: application/json
      payload:
        type: object
        properties:
          id:
            type: integer
          name:
            type: string
```

#### Note the following:

* Protocol for now should be amqp (line 8)
* The block on line 10 is an example of how the queue is declared. The key name is the queue name.
* The payload (line 14) should define the structure of a message on the queue.
* The payload specification format is the same as how the structure is declared in an OpenAPI specification.
* The AMQP Bindings on lines 16-18 should be declared in all queues (we will use AMQP bindings to declare Kafka queues).

## **There are 2 ways to stub out Kafka:-**

### I) Self-managed Kafka instance

Use this when the `kafka-clients` package in the project has the same major version as Specmatic's Kafka (`kafka_2.13`
2.8.0).
Also in this approach specmatic will automatically pick the kafka yaml from the specified file path.(
src/test/resources/kafka.yaml)
In this approach, Specmatic manages an in-memory instance of Kafka that the system-under-test can send messages to.

1. Add the specmatic Kafka dependency to `pom.xml`:
    ```xml
        <dependency>
            <groupId>io.specmatic</groupId>
            <artifactId>specmatic-kafka</artifactId>
            <version>0.3.0</version>
        </dependency>
    ```
2. Use the following code in `@BeforeAll` to start up the Kafka stub:
    ```java
    // kafkaMock is a static variable
    kafkaMock =
        KafkaMock.fromAsyncAPIFiles(
            listOf("src/test/resources/kafka.yaml"),
            9092,
            2171,
            "./kafka-logs");

    kafkaMock.start();
    ```
3. In the `@AfterAll` method, use the following code to stop the mock.
    ```java
    kafkaMock.close();
    ```

### II) External Kafka instance

Use this when the `kafka-clients` package in the project has a *different* major version from Specmatic's
Kafka (`kafka_2.13` 2.8.0). Specmatic may not be able to start its own Kafka service due to this library conflict.

Use the code below to start up a Kafka server, and let Specmatic mock subscribe to it to verify interactions with it.

1. Add the following to `pom.xml` (the version should match that of `kafka-clients` version which would already be in
   the projects' pom or parent pom)

    ```xml
    <dependency>
       <groupId>io.specmatic</groupId>
       <artifactId>specmatic-kafka</artifactId>
       <version>0.6.0</version>
   </dependency>
    ```
   when facing issues with kafka version in the setting up externalKafkaServer then you can explicitly provide kafka
   version as 2.8.0 in properties in pom.xml as

   ```xml
   <kafka.version>2.8.0</kafka.version>
   ```

2. Define the following as global variables for the class ContractTests.java:

   ```java
   private static KafkaMock kafkaMock = null;
   private static TestingServer zkServer = null;
   private static KafkaServer externalKafkaServer = null;
   private static ConfigurableApplicationContext context = null;
   ```
3. Use the following code in `@BeforeAll` apart from the generic System.setProperty() methods to start up the Kafka
   stub:

   ```java
   // Start the Kafka mock instance.
   
   List<String> fileList= new ArrayList<>();
   fileList.add("src/test/resources/kafka_stub.yaml");
   
   kafkaMock = KafkaMock.fromAsyncAPIFiles(fileList,9092,2181,"./kafka-logs");
   
   // Without this, the Kafka server may not start
   kafkaMock.cleanupLogDir();
   
   // Start Zookeeper
   zkServer = kafkaMock.startZooKeeper();
   
   // Start a new Kafka server using the Kafka dependency already added to the pom
   externalKafkaServer = new KafkaServer(
        kafkaMock.getKafkaConfigInstance(), 
        Time.SYSTEM, 
        Option.empty(), 
        scala.collection.JavaConverters.asScalaBuffer(new ArrayList<KafkaMetricsReporter>()).toList());
   
   externalKafkaServer.startup();
   
   // subscribe the KafkaMock instance to all the topics
   kafkaMock.subscribe();
   ```
   #### Note
   The above example is for kafka version 2.7.1; for kafka 2.8.0 use:
   ```java
   externalKafkaServer = new KafkaServer(
        kafkaMock.getKafkaConfigInstance(), 
        Time.SYSTEM, 
        Option.empty(), 
        true);
   ```

4. In the `@AfterAll` method, add the following code:

   ```java
   if (context != null) context.close();
   if (externalKafkaServer != null) externalKafkaServer.shutdown();
   if (zkServer != null) zkServer.close();
   ```