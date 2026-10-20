import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import com.fasterxml.jackson.databind.ObjectMapper;
import kafka.server.KafkaConfig;
import kafka.server.KafkaServer;
import org.apache.curator.test.TestingServer;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Time;
import scala.Option;

class KafkaService {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Provide response event and delay in milliseconds");
        long delay = Long.parseLong(args[1]);
        if (delay < 0) throw new IllegalArgumentException("Delay must not be negative");
        Path data = Files.createTempDirectory("config-kafka-demo-");
        TestingServer zooKeeper = new TestingServer();
        Properties brokerProps = new Properties();
        brokerProps.setProperty("broker.id", "0");
        brokerProps.setProperty("listeners", "PLAINTEXT://127.0.0.1:19096");
        brokerProps.setProperty("advertised.listeners", "PLAINTEXT://localhost:19096");
        brokerProps.setProperty("log.dirs", data.toString());
        brokerProps.setProperty("zookeeper.connect", zooKeeper.getConnectString());
        brokerProps.setProperty("offsets.topic.replication.factor", "1");
        KafkaServer broker = new KafkaServer(new KafkaConfig(brokerProps), Time.SYSTEM, Option.empty(), false);
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            broker.shutdown(Duration.ofSeconds(5));
            try {
                zooKeeper.close();
                try (var files = Files.walk(data)) {
                    for (Path file : files.sorted(Comparator.reverseOrder()).toList()) Files.deleteIfExists(file);
                }
            } catch (Exception failure) { failure.printStackTrace(); }
        }));
        broker.startup();
        Properties consume = new Properties();
        consume.setProperty("bootstrap.servers", "localhost:19096");
        consume.setProperty("group.id", "demo-service-" + UUID.randomUUID());
        consume.setProperty("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        consume.setProperty("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        consume.setProperty("auto.offset.reset", "earliest");
        Properties produce = new Properties();
        produce.setProperty("bootstrap.servers", "localhost:19096");
        produce.setProperty("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        produce.setProperty("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        ObjectMapper json = new ObjectMapper();
        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(consume);
             KafkaProducer<String, String> producer = new KafkaProducer<>(produce)) {
            consumer.subscribe(List.of("ping"));
            long deadline = System.nanoTime() + Duration.ofSeconds(30).toNanos();
            while (consumer.assignment().isEmpty() && System.nanoTime() < deadline) consumer.poll(Duration.ofMillis(100));
            if (consumer.assignment().isEmpty()) throw new AssertionError("Service subscriber did not become ready");
            System.out.println("Demo service ready on localhost:19096");
            while (true) {
                for (var request : consumer.poll(Duration.ofMillis(100))) {
                    if (!json.readTree(request.value()).equals(json.readTree("{\"event\":\"ping\"}")))
                        throw new AssertionError("Unexpected request: " + request.value());
                    Thread.sleep(delay);
                    producer.send(new ProducerRecord<>("pong", json.createObjectNode().put("event", args[0]).toString())).get(10, TimeUnit.SECONDS);
                    System.out.println("Demo replied with event: " + args[0]);
                }
            }
        }
    }
}
