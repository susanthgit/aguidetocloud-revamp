---
title: "Confluent Kafka Administrator (CCAAK) Study Guide"
description: "Prepare for CCAAK with self-managed Kafka administration topics. Try 20 questions free; unlock 250 original MCQs for US$9 for one year."
type: "cert-tracker"
layout: "single"
exam_code: "CCAAK"
exam_title: "Confluent Certified Administrator for Apache Kafka"
exam_level: "professional"
exam_status: "active"
exam_category: "Confluent"
vendor: "confluent"
manual: false
guided_slug: "confluent-ccaak"
---

## About the CCAAK Exam

CCAAK validates the skills needed to configure, deploy, monitor and support Apache Kafka clusters. The emphasis is administration: how brokers, replicas, storage, security and Connect workers behave under operational constraints.

This is not the Confluent Cloud operator track. A self-managed administrator controls broker configuration and deployment; a cloud operator works with the managed service's resources and controls. Shared Kafka concepts matter in both, but the tasks differ.

**Before you buy:** this bank contains 250 original single-answer multiple-choice learning questions. Confluent's exam also includes matching and list-order questions; those interactions are not simulated here. This is independent preparation, not recalled exam content, an official Confluent product or a guarantee of passing.

## Who Should Take This Exam?

Kafka administrators, platform engineers and SREs who are responsible for cluster reliability, access controls, capacity and recovery. Practise reading configuration and metrics together, rather than memorising a setting without its consequences.

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| Exam | Confluent Certified Administrator for Apache Kafka (CCAAK) |
| Duration | 90 minutes |
| Question types | Multiple choice, matching and list-order |
| Delivery | Online proctored through Confluent |
| Validity | Two years |
| Question count and numeric pass score | Confirm the current exam guide and registration information |
| Exam price | Confirm the current price at Confluent registration |

Use [Confluent's certification catalogue](https://www.confluent.io/certification/) and the [CCAAK registration page](https://training.confluent.io/learn/courses/1032/confluent-certified-administrator-for-apache-kafka-r) for current exam information.

## Exam Domains & Weights

The published domain percentages total **101%**. We preserve those values rather than silently changing the vendor's blueprint. The practice counts below are our whole-question allocation of 250 items.

| Domain | Published weight | Practice questions |
|--------|------------------|--------------------|
| Kafka Fundamentals | 15% | 37 |
| Kafka Security | 15% | 37 |
| Deployment Architecture | 12% | 30 |
| Kafka Connect | 12% | 30 |
| Cluster Configuration | 22% | 54 |
| Observability | 10% | 25 |
| Troubleshooting | 15% | 37 |
| Total | 101% | 250 |

Check the [official administrator preparation guide](https://training.confluent.io/learn/courses/1071/confluent-certified-administrator-exam-preparation-guide) alongside this allocation.

## Study Approach

1. Trace a record through partition leadership, replication, acknowledgement and consumption. Separate retention from consumer progress.
2. Treat authentication, authorisation and transport encryption as different controls. Check which listener and principal a request actually uses.
3. Identify the deployment mode and version before applying controller or broker instructions. Do not mix ZooKeeper-era procedures with KRaft procedures.
4. Understand distributed Connect workers, task assignment, converters and internal topics. A running worker does not prove that every task is healthy.
5. Change configuration with a reason, an observation to check and a rollback plan. Topic overrides and broker settings are not interchangeable.
6. Correlate signals before acting: replica health, request latency, consumer lag, storage and controller availability explain different failures.
7. Practise recovery decisions in a disposable environment. Destructive offset or storage operations need a clearly understood consequence.

## Practice Exam

Try the **20-question free preview** before buying. Full access costs **US$9 for one year** and includes 250 original questions across seven domains, explanations, wrong-choice rationales and timed or untimed practice.

The question bank teaches administrative reasoning. It does not replace experience operating a Kafka cluster or reproduce every interaction in the official exam.

## Related Certifications

- [Confluent Certified Developer for Apache Kafka (CCDAK)](/cert-tracker/confluent-ccdak/) covers the application-development side of Kafka.
- [Confluent Certified Cloud Operator (CCAC)](/cert-tracker/confluent-ccac/) focuses on operating Confluent Cloud.

## Official Resources

- [Confluent certification catalogue](https://www.confluent.io/certification/)
- [CCAAK preparation guide](https://training.confluent.io/learn/courses/1071/confluent-certified-administrator-exam-preparation-guide)
- [Confluent Platform documentation](https://docs.confluent.io/platform/current/overview.html)

Confluent and Apache Kafka are their owners' trademarks. This independent study material is not affiliated with or endorsed by Confluent or the Apache Software Foundation.
