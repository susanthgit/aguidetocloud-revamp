---
title: "Confluent Certified Developer for Apache Kafka (CCDAK) — Free Study Guide"
description: "Confluent Certified Developer for Apache Kafka (CCDAK): free 250-question practice exam + study guide covering Kafka fundamentals (topics, partitions, offsets, replication, ISR, acks, retention, and compaction), producer and consumer development, delivery semantics and transactional exactly-once, serialization and Schema Registry compatibility, Kafka Streams, Kafka Connect, application testing with the TopologyTestDriver, and observability with JMX metrics and consumer lag."
type: "cert-tracker"
layout: "single"
exam_code: "CCDAK"
exam_title: "Confluent Certified Developer for Apache Kafka"
exam_level: "associate"
exam_status: "active"
exam_category: "Confluent"
vendor: "confluent"
manual: false
guided_slug: "confluent-ccdak"
---
## About the Confluent Certified Developer for Apache Kafka (CCDAK) Exam

> Build event-streaming applications on Apache Kafka — design topics and keys, tune producers and consumers, choose the right delivery guarantee, evolve schemas safely, and process and move data with Kafka Streams and Kafka Connect

The CCDAK (Confluent Certified Developer for Apache Kafka) is a developer-focused certification that validates the applied skills of engineers who build producer, consumer, Kafka Streams, and Kafka Connect applications on Apache Kafka. It covers Apache Kafka fundamentals (the event/record model, topics, partitions, offsets, and keys; per-partition ordering; replication, ISR, acks, and min.insync.replicas durability; retention, log compaction, and tombstones; and the KRaft metadata quorum); application development (producer tuning with acks, idempotence, batching, compression, and the sticky partitioner; consumer groups, rebalances, heartbeats, offsets, and commit semantics; at-least-once, idempotent, and transactional exactly-once delivery with read_committed; and serialization plus Schema Registry compatibility modes); Kafka Streams (topologies, KStream vs KTable vs GlobalKTable, stateful operations, windowing, joins, and exactly_once_v2); Kafka Connect (source and sink connectors, standalone vs distributed mode, converters, Single Message Transforms, error tolerance and dead-letter queues, and the Connect REST API); application testing (the TopologyTestDriver, TestInputTopic and TestOutputTopic, and transactional and schema-compatibility tests); and application observability (JMX client metrics, consumer-group lag, and troubleshooting). Original practice questions. Not affiliated with, endorsed by, or sourced from Confluent certification exams.

## Who Should Take This Exam?

The CCDAK is designed for **software developers, data engineers, and platform engineers who build and operate applications on Apache Kafka** — producers, consumers, Kafka Streams apps, and Kafka Connect pipelines. Confluent recommends 6-12 months of hands-on Kafka application-development experience. It is a strong step for practitioners who want to prove real event-streaming skills — designing topics and choosing keys for ordering and parallelism, tuning producer and consumer configuration for durability and throughput, reasoning about at-least-once versus transactional exactly-once delivery, evolving Avro, Protobuf, and JSON Schema types through Schema Registry compatibility modes, and building stream-processing and data-integration pipelines with Kafka Streams and Kafka Connect. It pairs well with data-platform and data-engineering certifications for engineers building real-time pipelines on the cloud.

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | CCDAK |
| **Title** | Confluent Certified Developer for Apache Kafka |
| **Product Version** | Current Apache Kafka 4.x / Confluent Platform |
| **Duration** | 90 minutes |
| **Questions** | ~55-60 |
| **Pass Score** | Pass / fail (Confluent does not publish a numeric cut score) |
| **Cost** | $150 USD |
| **Provider** | Confluent (online proctored) |
| **Validity** | 2 years |
| **Question Types** | Multiple choice, Multiple response, Matching, Build-list / ordering |

## Exam Domains & Weights

The CCDAK exam is organized into **6 published objective areas**. The weights below are the official section weights from the Confluent exam guide (Confluent prints weights totaling 99% while labeling the outline 100%); the practice-question counts distribute 250 questions across the areas, with the smaller Application Testing area given extra practice depth.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Apache Kafka Fundamentals | 23% | 58 |
| Apache Kafka Application Development | 28% | 67 |
| Apache Kafka Streams | 12% | 30 |
| Kafka Connect | 15% | 38 |
| Application Testing | 8% | 24 |
| Application Observability | 13% | 33 |
| **Total** | **~100%** | **250** |

> 💡 **Study tip:** This is a *developer* exam — every question is about building a Kafka client application, not administering a cluster (ksqlDB, RBAC, and Kubernetes/CFK are out of scope). Get the **durability chain** straight first: `acks=all` waits for **all current in-sync replicas (ISR)**, and `min.insync.replicas` is a **topic/broker** setting (not a producer property) that fails an `acks=all` write with `NotEnoughReplicas` when the ISR drops below it — the classic safe combo is replication factor 3 with `min.insync.replicas=2` and `acks=all`. Know the **delivery-semantics ladder**: idempotence (`enable.idempotence=true`, which needs `acks=all`, retries, and `max.in.flight.requests.per.connection <= 5`) only de-duplicates **producer retries**, while end-to-end exactly-once needs **transactions** plus a downstream `isolation.level=read_committed` consumer. Keep the **partitioner** right — a keyed record hashes to a partition, a null-key record uses the **sticky** batch-aware partitioner (not round-robin), and adding partitions never redistributes existing data. Do not reverse **Schema Registry compatibility**: the default `BACKWARD` means a **new** schema can read data written with the **previous** one (consumer-first rollout), while `FORWARD` supports a producer-first rollout, and `*_TRANSITIVE` checks all prior versions. For **Kafka Streams**, distinguish **KStream** (events), **KTable** (latest value per key; null = tombstone), and **GlobalKTable** (fully replicated, no co-partitioning), and use `exactly_once_v2` for EOS. For **Kafka Connect**, remember converters are not client serializers, SMTs are single-record transforms, a dead-letter queue is a **sink** feature, and a distributed REST call can return **409** during a rebalance. Finally, current Kafka is **KRaft**, not ZooKeeper — use `--bootstrap-server`.

## Practice Exam — 250 Questions

Prepare for the CCDAK with our **250-question practice exam** covering all 6 objective areas. Every question is an original developer scenario built around current Apache Kafka 4.x with detailed explanations and maps to the official exam objectives.

**What you get:**

- ✅ 250 exam-style questions across all 6 domains
- ✅ Detailed explanations for every question — learn *why* each answer is right
- ✅ Timed exam mode and untimed practice mode
- ✅ Progress tracking and per-domain scoring
- ✅ Works on desktop and mobile — study anywhere
- ✅ 20 free questions — no account needed

## Confluent Certification Path

Confluent's Apache Kafka certifications are developer- and operations-focused. The CCDAK (Certified Developer for Apache Kafka) proves you can build Kafka applications; the CCAAK (Certified Administrator for Apache Kafka) proves you can operate and manage Kafka clusters; and the Confluent Cloud Certified Operator (CCAC) proves you can run streaming workloads on Confluent Cloud. Start with CCDAK to build the producer/consumer, delivery-semantics, serialization, Streams, and Connect foundation the rest of the track relies on.

## Related Certifications

If you're studying for the CCDAK, you might also be interested in these data and streaming certifications:

- **[Databricks Certified Data Engineer Associate](/cert-tracker/databricks-de-associate/)** — the data-engineering exam on building batch and streaming pipelines on the lakehouse, a natural downstream consumer of Kafka event streams — practice exam
- **[SnowPro Core (COF-C03)](/cert-tracker/snowpro-core/)** — the Snowflake data-platform exam covering ingestion (including streaming via Snowpipe) and data modeling that Kafka often feeds — practice exam
- **[Google Cloud Professional Data Engineer](/cert-tracker/gcp-data-engineer/)** — the GCP exam on designing streaming and batch data pipelines, a strong cloud-data complement to Kafka application development — practice exam

## Study Tips

1. **Think like a developer** — for every task, ask "which Kafka API, config, or abstraction does this?" (producer vs consumer vs Streams vs Connect; acks vs min.insync.replicas; idempotence vs transactions; KStream vs KTable), not just "what is Kafka?"
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Master delivery semantics** — know exactly what idempotence guarantees (no duplicate producer writes) versus what transactions add (atomic read-process-write with `read_committed`), and the required producer config for each
4. **Get durability cold** — replication factor, ISR, `acks=0/1/all`, and `min.insync.replicas` interact; be able to explain why RF=3 + `min.insync.replicas=2` + `acks=all` tolerates one broker down and when a write is rejected with `NotEnoughReplicas`
5. **Nail Schema Registry compatibility** — BACKWARD (consumer-first), FORWARD (producer-first), FULL, and their transitive variants, and remember Avro, Protobuf, and JSON Schema compatibility rules differ
6. **Separate the Streams abstractions** — KStream (events), KTable (changelog/latest value per key, null = tombstone), and GlobalKTable (replicated, avoids co-partitioning); know tumbling, hopping, sliding, and session windows and `exactly_once_v2`
7. **Know Kafka Connect conceptually** — source vs sink, standalone vs distributed, converters vs serializers, chainable SMTs, `errors.tolerance` and sink-side dead-letter queues, and connector/task states (a connector can be RUNNING while a task is FAILED)
8. **Simulate exam conditions** — use the timed exam mode to practise reasoning about configuration tradeoffs, delivery guarantees, schema evolution, and troubleshooting under pressure
