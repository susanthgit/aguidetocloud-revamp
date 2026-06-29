---
title: "MongoDB Associate DBA (C100DBA) — Study Guide & Practice Exam"
description: "Free MongoDB Associate Database Administrator study guide and 250-question practice exam. MongoDB Associate DBA certification (C100DBA) — exam objectives, domains and weights, study resources, and exam simulation covering mongod/mongos server administration, replication and replica sets, sharded clusters, security and RBAC, backup and recovery, and monitoring."
type: "cert-tracker"
layout: "single"
exam_code: "MONGODB-ASSOCIATE-DBA"
exam_title: "MongoDB Associate Database Administrator"
exam_level: "associate"
exam_status: "active"
exam_category: "MongoDB"
vendor: "mongodb"
manual: false
guided_slug: "mongodb-associate-dba"
---
## About the MongoDB Associate DBA Exam

> Master the MongoDB Associate Database Administrator certification (C100DBA) — mongod and mongos server administration, the WiredTiger storage engine, replica sets and replication, sharded clusters and shard-key design, security and RBAC, backup and point-in-time recovery, and monitoring.

The complete practice exam for the MongoDB Associate Database Administrator certification (C100DBA). Covers server administration (`mongod`/`mongos` configuration, the WiredTiger storage engine with cache/compression/journaling, `mongosh` and admin commands, the Database Tools, feature-compatibility version), replication (replica-set architecture, `rs.initiate`/`reconfig`, member priority and votes, arbiters and hidden/delayed members, the oplog and initial sync, elections, read preferences and write concerns, rollback and lag), sharding (shards, config servers and `mongos`, shard-key selection, ranged vs hashed, chunks and the balancer, zones, `sh.status`, troubleshooting hotspots), security (SCRAM/x.509/LDAP/Kerberos authentication, built-in and custom RBAC roles, TLS, encryption at rest and field-level encryption, auditing), backup and recovery (`mongodump`/`mongorestore`, snapshots, Atlas/Ops Manager backup, oplog PITR), and monitoring (`serverStatus`/`currentOp`, `mongostat`/`mongotop`, the profiler, Atlas/Cloud Manager alerts) — every question a real-world scenario with full explanations.

## Who Should Take This Exam?

The MongoDB Associate DBA certification is designed for **database administrators, system administrators, DevOps engineers, and site reliability engineers** who deploy, secure, and operate MongoDB. It validates practical, hands-on knowledge of configuring `mongod`/`mongos`, running replica sets and sharded clusters, securing deployments with authentication and RBAC, backing up and restoring data, and monitoring health and performance — the day-to-day skills an operator uses to keep MongoDB available and fast.

**Prerequisites:** None (about 6 months of MongoDB administration experience is recommended)

**Typical study time:** 4-6 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | MongoDB Associate DBA (C100DBA) |
| **Title** | MongoDB Associate Database Administrator |
| **Duration** | 75 minutes |
| **Questions** | 62 |
| **Pass Score** | ~65% (pass/fail; cut not publicly published) |
| **Cost** | $150 USD |
| **Provider** | MongoDB University (online proctored) |
| **Validity** | 3 years |
| **Prerequisites** | None (~6 months administration experience recommended) |
| **Question Types** | Multiple choice, Multiple select |
| **Official Page** | [View on MongoDB University →](https://learn.mongodb.com/pages/mongodb-associate-database-administrator-exam) |

## Exam Domains & Weights

The MongoDB Associate DBA exam covers **6 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Server Administration | 25% | 62 |
| Replication | 20% | 50 |
| Sharding | 20% | 50 |
| Security | 15% | 38 |
| Backup and Recovery | 10% | 25 |
| Monitoring | 10% | 25 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Server Administration and the two distribution domains (Replication + Sharding) together make up two-thirds of the exam, so prioritise them. Know `mongod.conf` keys and WiredTiger behaviour (cache sizing, snappy/zlib/zstd compression, journaling, checkpoints), replica-set elections and the difference between read preferences and write concerns (`w:1` vs `w:majority`, `j:true`), and shard-key selection (high cardinality, non-monotonic) plus how chunks and the balancer distribute data. Security (15%) is about authentication mechanisms (SCRAM, x.509, LDAP, Kerberos), least-privilege RBAC, and TLS. Backup and Monitoring are smaller but reward hands-on practice with `mongodump`/`mongorestore`, PITR, `mongostat`/`mongotop`, and the database profiler.

## Practice Exam — 250 Questions

Prepare for the MongoDB Associate DBA with our **250-question practice exam** covering all 6 exam domains. Every question includes detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## MongoDB Certification Path

If you build applications on MongoDB, start with the **MongoDB Associate Developer**; if you deploy and operate MongoDB, the **MongoDB Associate Database Administrator** is your credential. Both are role-based associate certifications built on the same document-model and Atlas foundations, so the developer and DBA tracks complement each other.

## Study Tips

1. **Prioritise replication and sharding** — together they are 40% of the exam; understand elections, member roles, oplog/lag, shard-key design, chunks, and the balancer
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Get hands-on with `mongosh` and Atlas** — stand up a replica set and a sharded cluster, then break and recover them to internalise the operations
4. **Know `w:majority` vs `j:true`** — write concern controls how many members acknowledge; `j:true` waits for the on-disk journal — they solve different durability problems
5. **Review explanations** — don't just check if you got it right; read why each answer is correct
6. **Check the official page** — [official exam details](https://learn.mongodb.com/pages/mongodb-associate-database-administrator-exam) always have the latest objectives
