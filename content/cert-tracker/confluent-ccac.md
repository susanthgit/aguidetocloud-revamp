---
title: "Confluent Certified Cloud Operator (CCAC) — Free Study Guide"
description: "Confluent Certified Cloud Operator (CCAC): free 250-question practice exam + study guide covering the Confluent Cloud resource model and cluster types (Basic, Standard, Enterprise, Dedicated, Freight; CKUs vs eCKUs), RBAC and scoped API keys, networking (PrivateLink, peering, Transit Gateway), Cluster Linking and disaster recovery, Stream Governance and Schema Registry, managed connectors and serverless Flink, and observability, client quotas, and cost with the Metrics API."
type: "cert-tracker"
layout: "single"
exam_code: "CCAC"
exam_title: "Confluent Certified Cloud Operator"
exam_level: "professional"
exam_status: "active"
exam_category: "Confluent"
vendor: "confluent"
manual: false
guided_slug: "confluent-ccac"
---
## About the Confluent Certified Cloud Operator (CCAC) Exam

> Operate Confluent Cloud in production — choose the right cluster type and capacity, secure access with RBAC and scoped API keys, design private networking, replicate and fail over with Cluster Linking, govern data with Stream Governance, and monitor throughput, quotas, and cost

The CCAC (Confluent Certified Cloud Operator) is an operations-focused certification that validates the skills of platform engineers, SREs, and cloud operators who run multi-cloud and global Apache Kafka workloads on Confluent Cloud. It covers the Confluent Cloud resource model and cluster lifecycle (choosing Basic, Standard, Enterprise, Dedicated, and Freight clusters by networking, SLA, throughput, and cost; Dedicated CKUs versus elastic eCKUs; the organization, environment, cluster, and topic hierarchy; and the Cloud Console, Confluent CLI, REST APIs, and Terraform); identity, access control, and Cloud security (RBAC role bindings across organization, environment, cluster, Schema Registry, topic, and consumer-group scopes; user and service-account identities; scoped and global API keys; and TLS, OAuth, and mTLS authentication); networking and multi-cloud connectivity (public networking, VPC and VNet peering, PrivateLink and Private Service Connect, and Transit Gateway — with directionality, CIDR overlap, transitive routing, and the immutable networking-type rule); Cluster Linking, geo-replication, migration, and disaster recovery (managed links, read-only mirror topics, consumer-offset and ACL sync, promotion and failover, and link limits); Stream Governance, Schema Registry, and data governance (Essentials versus Advanced packages, Stream Catalog and Stream Lineage, and schema compatibility); managed integrations and stream processing operations (fully managed and custom connectors, and serverless Confluent Cloud for Apache Flink); and observability, quotas, reliability, and cost operations (the Metrics API and MetricsViewer role, principal-based client quotas, and billing dimensions). Original practice questions. Not affiliated with, endorsed by, or sourced from Confluent certification exams.

## Who Should Take This Exam?

The CCAC is designed for **platform engineers, cloud operations engineers, SREs, and security or FinOps owners who run and manage Confluent Cloud** — not developers writing Kafka client code. It validates the ability to make operational decisions on a managed streaming platform: selecting the right cluster type and capacity model, applying least-privilege RBAC and scoping API keys correctly, designing private networking for Kafka, connectors, and Cluster Linking, planning geo-replication and disaster recovery with mirror topics and promotion, governing schemas across teams, operating fully managed connectors and serverless Flink, and controlling throughput and cost with client quotas and the Metrics API. It is a strong step for practitioners who own a Confluent Cloud environment and want to prove real cloud-operations skills. It pairs naturally with the CCDAK developer exam and with cloud data-platform certifications.

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | CCAC |
| **Title** | Confluent Certified Cloud Operator |
| **Product Scope** | Current Confluent Cloud service and features |
| **Duration** | 90 minutes |
| **Questions** | Not officially published |
| **Pass Score** | Pass / fail (Confluent does not publish a numeric cut score) |
| **Cost** | Confirm current price at Confluent registration |
| **Provider** | Confluent (Honorlock online proctored) |
| **Validity** | 2 years |
| **Question Types** | Multiple choice, Matching, List / build-order |

## Exam Domains & Weights

The CCAC exam covers **7 Confluent Cloud operations areas**. Confluent does not publish numeric section weights for CCAC, so the weights below are our **breadth-based estimates** used to distribute 250 practice questions across the areas; the topics themselves are grounded in Confluent's published CCAC scope and Confluent Cloud documentation.

| Domain | Est. Weight | Practice Qs |
|--------|-------------|-------------|
| Confluent Cloud resource model, cluster selection & lifecycle | 18% | 45 |
| Identity, access control & Cloud security | 18% | 45 |
| Networking & multi-cloud connectivity | 17% | 43 |
| Cluster Linking, geo-replication, migration & DR | 17% | 42 |
| Stream Governance, Schema Registry & data governance | 12% | 30 |
| Managed integrations & stream processing operations | 10% | 25 |
| Observability, quotas, reliability & cost operations | 8% | 20 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** This is a *Cloud operator* exam — every question is about running a managed Confluent Cloud environment, not administering self-managed brokers (you never run `kafka-storage`, tune broker disks, or pick KRaft controller voters). Get the **cluster-type matrix** cold: Basic (dev), Standard (public-network production), Enterprise (private-network production), Dedicated (dedicated capacity, **manual** CKU scaling), and Freight (cost-optimized, relaxed latency) — and remember only **Enterprise, Dedicated, and Freight** can be a **Cluster Linking destination** (Basic and Standard are source-only), and **CKU** is fixed Dedicated capacity while **eCKU** autoscales the other types. Know the **API-key scopes**: the **Metrics API needs a Cloud-resource-management-scoped key plus the MetricsViewer role** — a Kafka-cluster key fails — and a **global** key consumes Kafka API-key quota on every Dedicated/Enterprise/Freight cluster. Keep **networking** straight — a cluster's public/private type is **immutable after provisioning**, VPC/VNet **peering** is bidirectional but allows **no overlapping CIDRs and no transitive routing**, **PrivateLink/PSC** is unidirectional and **does** allow overlapping CIDRs, and **Transit Gateway** supports transitive routing. For **Cluster Linking**, mirror topics are **read-only until promotion/failover**, there are **no transactions/EOS** on them, ACL sync is **whole-cluster and same-org only**, and a destination defaults to **ten links**. For **governance**, Essentials is the default and **Advanced cannot be downgraded**, and Schema Registry lives in the **first cluster's region (immutable)**. For **quotas**, they apply to a **principal (service account), not an API key**, only on **Enterprise/Freight/Dedicated**, and set a **maximum, not a floor**. Finally, **Flink is serverless** (no runtime/state management, same-region only) and storage is billed on **post-replication (~3x)** volume.

## Practice Exam — 250 Questions

Prepare for the CCAC with our **250-question practice exam** covering all 7 Confluent Cloud operations areas. Every question is an original operations scenario built around current Confluent Cloud with detailed explanations that map to the real operator decisions the exam tests.

**What you get:**

- ✅ 250 exam-style questions across all 7 domains
- ✅ Detailed explanations for every question — learn *why* each answer is right
- ✅ Timed exam mode and untimed practice mode
- ✅ Progress tracking and per-domain scoring
- ✅ Works on desktop and mobile — study anywhere
- ✅ 20 free questions — no account needed

## Confluent Certification Path

Confluent's Apache Kafka certifications span development and operations. The CCDAK (Certified Developer for Apache Kafka) proves you can build Kafka applications; the Confluent Cloud Certified Operator (CCAC) proves you can run and manage streaming workloads on Confluent Cloud — cluster capacity, RBAC, networking, Cluster Linking, governance, connectors, Flink, and cost. If you build on Kafka, start with CCDAK for the producer/consumer and delivery-semantics foundation; if you operate the platform, CCAC is the cloud-operations credential that proves you can run it in production.

## Related Certifications

If you're studying for the CCAC, you might also be interested in these cloud and data certifications:

- **[Confluent Certified Developer for Apache Kafka (CCDAK)](/cert-tracker/confluent-ccdak/)** — the developer side of the Confluent track, covering the producer, consumer, Streams, and Connect application skills that run on the clusters a CCAC operator manages — practice exam
- **[Databricks Certified Data Engineer Associate](/cert-tracker/databricks-de-associate/)** — the data-engineering exam on building batch and streaming pipelines on the lakehouse, a natural downstream consumer of Confluent Cloud streams — practice exam
- **[AWS Certified Solutions Architect Associate](/cert-tracker/aws-saa/)** — the cloud-architecture exam covering VPCs, PrivateLink, Transit Gateway, and IAM that underpin Confluent Cloud networking and security decisions — practice exam

## Study Tips

1. **Think like an operator** — for every task, ask "which Confluent Cloud resource, role, or setting does this?" (which cluster type; which API-key scope; which networking option; which RBAC role at which scope), not "how do I write a Kafka app?"
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Master the cluster-type matrix** — memorize Basic/Standard/Enterprise/Dedicated/Freight by networking, scaling model (CKU vs eCKU), and feature gating (client quotas, Cluster Linking destination, private networking), because many questions turn on picking the right type for a stated requirement
4. **Get API-key scopes right** — Kafka-cluster vs Schema-Registry vs Flink vs Cloud-resource-management vs global; know that the Metrics API needs a Cloud-resource-management key + MetricsViewer, and that a global key draws quota on every supported cluster
5. **Nail networking** — public vs peering vs PrivateLink/PSC vs Transit Gateway, their directionality and CIDR-overlap/transitive-routing rules, and the hard rule that a cluster's networking type cannot change after provisioning
6. **Understand Cluster Linking for DR** — read-only mirror topics, promotion/failover to make a destination writable, consumer-offset and whole-cluster same-org ACL sync, no transactions on mirror topics, and the default ten-links-per-destination limit
7. **Separate governance facts** — Essentials (default) vs Advanced (no downgrade), Schema Registry region immutability, and BACKWARD (consumer-first) vs FORWARD (producer-first) compatibility direction
8. **Simulate exam conditions** — use the timed exam mode to practise reasoning about cluster selection, access scoping, network design, replication topology, and cost tradeoffs under pressure
