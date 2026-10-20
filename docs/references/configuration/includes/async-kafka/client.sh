: "${SPECMATIC_ENTERPRISE_JAR:?Set this to the downloaded Enterprise JAR path}"
java -cp "$SPECMATIC_ENTERPRISE_JAR" KafkaRoundTrip.java localhost:19092
