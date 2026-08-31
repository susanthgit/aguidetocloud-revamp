---
title: "MySQL 8.0 Database Administrator (1Z0-908) — Study Guide & Practice Exam"
description: "MySQL 8.0 Database Administrator (1Z0-908) study guide and 250-question practice exam. The seven exam domains and weights — Architecture; Server Installation and Configuration; Security; Monitoring and Maintenance; Query Optimization; Backups and Recovery; and High Availability Techniques — plus exam objectives, study resources, and a timed exam simulation. Free 20-question preview."
type: "cert-tracker"
layout: "single"
exam_code: "MYSQL-8-DATABASE-ADMINISTRATOR"
exam_title: "MySQL 8.0 Database Administrator"
exam_level: "advanced"
exam_status: "active"
exam_category: "Oracle"
vendor: "oracle"
manual: false
guided_slug: "mysql-8-database-administrator"
faq_intro: "The questions database administrators usually ask before preparing for Oracle's MySQL 8.0 Database Administrator exam."
faq:
  - question: "What does MySQL 8.0 Database Administrator 1Z0-908 cover?"
    answer: "The exam covers seven scored domains: Architecture (MySQL and InnoDB internals, the redo and undo logs, the doublewrite buffer, buffer and cache sizing, and the MySQL 8.0 transactional data dictionary) at 11%; Server Installation and Configuration (installation layout, startup and shutdown, in-place and logical upgrades, option files and option precedence, and SET PERSIST) at 15%; Security (accounts and roles, caching_sha2_password and the other authentication plugins, privileges, TLS, validate_password, data-at-rest encryption and the keyring, and MySQL Enterprise Firewall) at 21%; Monitoring and Maintenance (the error, general, slow query and binary logs, MySQL Enterprise Audit and Monitor, and diagnosing metadata locks, row locks and deadlocks through performance_schema and sys) at 13%; Query Optimization (how the optimizer builds a plan, EXPLAIN and EXPLAIN ANALYZE, index design, and statistics maintenance) at 8%; Backups and Recovery (logical, physical and raw backups, MySQL Enterprise Backup, mysqldump and mysqlpump, and point-in-time recovery with mysqlbinlog) at 13%; and High Availability Techniques (asynchronous and GTID-based replication, multisource replication, replication troubleshooting, Group Replication, InnoDB Cluster, MySQL Shell and MySQL Router) at 19%."
  - question: "Is 1Z0-908 a lab exam?"
    answer: "No. Oracle lists 1Z0-908 as a multiple-choice exam of roughly 73 questions in 120 minutes with a 62% passing score. The official exam page presents it as a proctored certification exam rather than a hands-on performance lab. Confirm the current question count, duration and passing score on Oracle's exam page before you book, because Oracle revises these figures periodically."
  - question: "Do I need another Oracle certification first?"
    answer: "No formal prerequisite is listed. Oracle recommends hands-on experience administering MySQL 8.0 in production — installing and upgrading servers, managing accounts and privileges, taking and restoring backups, and operating replication — before attempting the exam."
  - question: "Which domain should I study first?"
    answer: "Security carries the most weight at 21%, so it repays the most study time. It is also the broadest domain, spanning account and role creation, the authentication plugins including caching_sha2_password, least-privilege grants, TLS-encrypted connections, password validation policy, data-at-rest encryption and the keyring, and MySQL Enterprise Firewall. High Availability Techniques is a close second at 19%."
  - question: "How long is the certification valid?"
    answer: "Oracle's published position is that MySQL certifications do not expire. Oracle's recertification rules do change over time, so check the current Oracle Recertification policy on the official certification page before you plan any renewal."
---
## About the MySQL 8.0 Database Administrator Exam

> Master the Oracle Certified Professional: MySQL 8.0 Database Administrator exam (1Z0-908) — MySQL and InnoDB architecture, buffer pools, redo and undo logs and the transactional data dictionary; installation, startup, upgrades and option-file precedence; accounts, roles, authentication plugins, TLS, encryption and MySQL Enterprise Firewall; the error, general, slow-query and audit logs plus performance_schema and sys; query optimization with EXPLAIN, indexes and optimizer statistics; logical, physical and binary-log backups with mysqldump, mysqlpump and MySQL Enterprise Backup; and high availability with asynchronous replication, GTIDs, Group Replication, InnoDB Cluster, MySQL Shell and MySQL Router.

The complete practice exam for the Oracle Certified Professional: MySQL 8.0 Database Administrator certification (exam 1Z0-908). Covers Architecture (client connection handling, how MySQL and InnoDB store data on disk, the redo and undo logs, the doublewrite buffer, the change buffer and adaptive hash index, buffer and cache sizing, and the MySQL 8.0 transactional data dictionary that replaced the .frm files), Server Installation and Configuration (installing and running the server and client programs, the files and folders created during installation, startup and shutdown, in-place and logical upgrades, option files and option-precedence rules, global and session system variables including SET PERSIST, and running multiple servers on one host), Security (creating accounts and roles, caching_sha2_password and the other authentication plugins, granting and revoking privileges under least privilege, recognising common security risks, TLS-encrypted connections, password policy and validate_password, hardening the host environment, preventing SQL injection, data-at-rest encryption and the keyring, and MySQL Enterprise Firewall), Monitoring and Maintenance (configuring and reading the error, general query, slow query and binary logs, monitoring processes and status variables, MySQL Enterprise Audit, MySQL Enterprise Monitor, tracking database growth for capacity planning, and diagnosing metadata locks, InnoDB row locks and deadlocks with performance_schema, sys and INFORMATION_SCHEMA), Query Optimization (how the optimizer builds a plan, reading EXPLAIN and EXPLAIN ANALYZE, choosing and designing indexes including covering and composite indexes, and maintaining index statistics and cardinality with ANALYZE TABLE), Backups and Recovery (logical versus physical versus raw backups, designing a backup strategy to an RTO and RPO, hot physical backups with MySQL Enterprise Backup, logical dumps with mysqldump and mysqlpump, cold raw file copies, backing up and replaying the binary log, and point-in-time recovery with mysqlbinlog), and High Availability Techniques (how replication delivers availability and read scale-out, configuring source and replica servers, the role of the binary and relay logs, GTID-based replication, multisource replication, the replication threads, monitoring and repairing replication lag and errors, Group Replication, and building and recovering an InnoDB Cluster with MySQL Shell's AdminAPI and MySQL Router) — every question a real operational decision a working MySQL DBA has to make, with full explanations grounded in the official MySQL 8.0 documentation.

## Who Should Take This Exam?

The certification is aimed at **database administrators, DevOps and platform engineers, and developers who run MySQL in production**. It suits people who already operate MySQL day to day and want their MySQL 8.0 knowledge validated end to end — from InnoDB internals, buffer pool sizing and the transactional data dictionary, through installation, upgrades and option-file precedence, accounts, roles, authentication plugins and TLS, to backup strategy, point-in-time recovery, replication troubleshooting and InnoDB Cluster.

**Prerequisites:** None (hands-on MySQL 8.0 database administration experience recommended)

**Typical study time:** 8-12 weeks of intensive study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | MYSQL-8-DATABASE-ADMINISTRATOR |
| **Title** | MySQL 8.0 Database Administrator |
| **Duration** | 120 minutes |
| **Questions** | 73 |
| **Pass Score** | 62% |
| **Cost** | $245 USD (verify at Oracle University registration) |
| **Provider** | Oracle University / Pearson VUE (online proctored) |
| **Validity** | MySQL certifications do not expire (verify the current Oracle Recertification policy) |
| **Prerequisites** | None (hands-on MySQL 8.0 database administration experience recommended) |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Oracle →](https://education.oracle.com/mysql-80-database-administrator/pexam_1Z0-908) |

## Exam Domains & Weights

The MYSQL-8-DATABASE-ADMINISTRATOR exam covers **7 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Architecture | 11% | 28 |
| Server Installation and Configuration | 15% | 37 |
| Security | 21% | 50 |
| Monitoring and Maintenance | 13% | 32 |
| Query Optimization | 8% | 24 |
| Backups and Recovery | 13% | 32 |
| High Availability Techniques | 19% | 47 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Security** carries the most weight (21%) — start there. **Query Optimization** has the least (8%), but don't skip it — exam questions can come from any domain.

## Practice Exam — 250 Questions

Prepare for the MYSQL-8-DATABASE-ADMINISTRATOR with our **250-question practice exam** covering all 7 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Oracle Certification Path

Start with OCI Foundations, then Architect Associate, and advance to Architect Professional and specialty tracks (Developer, Security, Networking, Data Science, Generative AI).

## Related Oracle Certifications

If you're studying for the MYSQL-8-DATABASE-ADMINISTRATOR, you might also be interested in these Oracle certifications:

- **[OCI-FOUNDATIONS: Cloud Infrastructure 2026 Foundations Associate](/cert-tracker/oci-foundations/)** — 250 practice questions
- **[OCI-AI-FOUNDATIONS: Cloud Infrastructure 2026 AI Foundations Associate](/cert-tracker/oci-ai-foundations/)** — 250 practice questions
- **[OCI-ARCHITECT-ASSOCIATE: Cloud Infrastructure 2026 Architect Associate](/cert-tracker/oci-architect-associate/)** — 250 practice questions
- **[OCI-DEVELOPER-PROFESSIONAL: Cloud Infrastructure 2026 Developer Professional](/cert-tracker/oci-developer-professional/)** — 250 practice questions
- **[OCI-DEVOPS-PROFESSIONAL: Cloud Infrastructure 2026 DevOps Professional](/cert-tracker/oci-devops-professional/)** — 250 practice questions

## Study Tips

1. **Start with the heaviest domain** — focus your time where the exam focuses its questions
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
5. **Check the official page** — [official exam details](https://education.oracle.com/mysql-80-database-administrator/pexam_1Z0-908) always have the latest objectives
