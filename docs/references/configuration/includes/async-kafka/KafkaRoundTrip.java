import java.time.Duration;
import java.util.List;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;

class KafkaRoundTrip {
    public static void main(String[] args) throws Exception {
        if (args.length != 1) throw new IllegalArgumentException("Provide bootstrap host:port");
        Properties consume = new Properties();
        consume.setProperty("bootstrap.servers", args[0]);
        consume.setProperty("group.id", "config-demo-" + UUID.randomUUID());
        consume.setProperty("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        consume.setProperty("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
        consume.setProperty("auto.offset.reset", "earliest");
        consume.setProperty("enable.auto.commit", "false");
        Properties produce = new Properties();
        produce.setProperty("bootstrap.servers", args[0]);
        produce.setProperty("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        produce.setProperty("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        produce.setProperty("max.block.ms", "10000");
        ObjectMapper json = new ObjectMapper();
        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(consume);
             KafkaProducer<String, String> producer = new KafkaProducer<>(produce)) {
            consumer.subscribe(List.of("pong"));
            long ready = System.nanoTime() + Duration.ofSeconds(15).toNanos();
            while (consumer.assignment().isEmpty() && System.nanoTime() < ready) consumer.poll(Duration.ofMillis(100));
            if (consumer.assignment().isEmpty()) throw new AssertionError("Reply subscriber did not become ready");
            producer.send(new ProducerRecord<>("ping", "{\"event\":\"ping\"}")).get(10, TimeUnit.SECONDS);
            long deadline = System.nanoTime() + Duration.ofSeconds(15).toNanos();
            while (System.nanoTime() < deadline) {
                for (var record : consumer.poll(Duration.ofMillis(100))) {
                    if (!json.readTree(record.value()).equals(json.readTree("{\"event\":\"pong\"}")))
                        throw new AssertionError("Unexpected reply: " + record.value());
                    System.out.println("Kafka reply verified: {\"event\":\"pong\"}");
                    return;
                }
            }
            throw new AssertionError("No reply within 15 seconds");
        }
    }
}
