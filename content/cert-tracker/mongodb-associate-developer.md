---
title: "MongoDB Associate Developer (C100DEV) — Study Guide & Practice Exam"
description: "Free MongoDB Associate Developer study guide and 250-question practice exam. MongoDB Associate Developer certification (C100DEV) — exam objectives, domains and weights, study resources, and exam simulation covering the document model and BSON, CRUD and the MongoDB Query Language, the aggregation framework, indexes, data modeling, developer tooling, and the official language drivers."
type: "cert-tracker"
layout: "single"
exam_code: "MONGODB-ASSOCIATE-DEVELOPER"
exam_title: "MongoDB Associate Developer"
exam_level: "associate"
exam_status: "active"
exam_category: "MongoDB"
vendor: "mongodb"
manual: false
guided_slug: "mongodb-associate-developer"
---
## About the MongoDB Associate Developer Exam

> Master the MongoDB Associate Developer certification (C100DEV) — the document model and BSON, CRUD operations and the MongoDB Query Language, the aggregation framework, indexes and query performance, data modeling, developer tooling, and the official language drivers.

The complete practice exam for the MongoDB Associate Developer certification (C100DEV). Covers the MongoDB document model and BSON (databases, collections, documents, value types, the special `_id` field, the 16 MB document limit, and the flexible schema), CRUD operations (`insertOne`/`insertMany`, the MongoDB Query Language with equality, comparison, `$in`, `$elemMatch` and logical operators, projection, sorting/limiting/skipping, cursors and counting, replacement, `$set`, upsert, `updateMany` and `findAndModify` updates, `deleteOne`/`deleteMany`, and Atlas Search), the aggregation framework (`$match`, `$group`, `$lookup`, `$out`, `$project`, `$unwind` and accumulators), indexes (single-field, compound and multikey indexes, the ESR rule, explain plans, covered queries, selectivity and trade-offs), data modeling (embedding versus referencing, one-to-many and many-to-many patterns, and anti-patterns), developer tooling (the Atlas Data Explorer, `mongosh`, Compass, the Database Tools, MongoDB for VS Code and the Atlas CLI), and the official drivers (Node.js, Python, Java, C# and PHP — `MongoClient`, connection URIs, connection pooling, and driver CRUD and aggregation syntax) — every question a real-world scenario with full explanations.

## Who Should Take This Exam?

The MongoDB Associate Developer certification is designed for **application developers, backend and full-stack engineers, and software developers** who build applications on MongoDB using one of the official drivers. It validates practical, hands-on knowledge of the document model, the MongoDB Query Language, the aggregation framework, indexing, and connecting to MongoDB from application code — the day-to-day skills a developer uses to read, write, model, and query data.

**Prerequisites:** None (familiarity with one supported driver language — Node.js, Python, Java, C# or PHP — is recommended)

**Typical study time:** 3-6 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | MongoDB Associate Developer (C100DEV) |
| **Title** | MongoDB Associate Developer |
| **Duration** | 75 minutes |
| **Questions** | 53 |
| **Pass Score** | Scaled pass/fail (not publicly published) |
| **Cost** | $150 USD |
| **Provider** | MongoDB University (online proctored) |
| **Validity** | 3 years |
| **Prerequisites** | None (one driver language recommended) |
| **Question Types** | Multiple choice, Multiple select |
| **Official Page** | [View on MongoDB University →](https://learn.mongodb.com/pages/mongodb-associate-developer-exam) |

## Exam Domains & Weights

The MongoDB Associate Developer exam covers **6 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| CRUD Operations | 51% | 92 |
| Drivers | 18% | 46 |
| Indexes | 17% | 42 |
| MongoDB Overview and the Document Model | 8% | 24 |
| Data Modeling | 4% | 24 |
| Tools and Tooling | 2% | 22 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** CRUD is more than half the exam (51%), so make sure you can read a query or update and predict the exact result — the MongoDB Query Language operators (`$gt`, `$in`, `$elemMatch`, logical operators), projection rules, the difference between `updateOne` (needs update operators like `$set`) and `replaceOne` (full replacement), upsert behavior, and the aggregation stages `$match`/`$group`/`$lookup`/`$out` are all heavily tested. Drivers (18%) reward hands-on practice — know the `MongoClient` connection URI (`mongodb://` vs `mongodb+srv://`), connection pooling, and the exact CRUD method names in your language. Indexes (17%) is about choosing the right index for a query and reading an `explain()` plan (COLLSCAN vs IXSCAN). The small Overview, Data Modeling, and Tools domains are quick wins — know your BSON types, embedding-versus-referencing trade-offs, and which tool (`mongosh`, Compass, Atlas Data Explorer, the Database Tools) fits each task.

## Practice Exam — 250 Questions

Prepare for the MongoDB Associate Developer with our **250-question practice exam** covering all 6 exam domains. Every question includes detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## MongoDB Certification Path

Start with the **MongoDB Associate Developer** certification to validate your application-development skills, then broaden into the **MongoDB Associate Database Administrator** for operations and cluster management. Both are role-based associate credentials built on the same document-model and Atlas foundations.

## Study Tips

1. **Start with CRUD** — it is over half the exam; practice reading queries, updates, and aggregation pipelines and predicting the exact output
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Get hands-on with Atlas and `mongosh`** — a free Atlas cluster plus the Atlas Sample Dataset is the fastest way to internalise CRUD, indexes, and aggregation
4. **Know `updateOne` vs `replaceOne`** — `updateOne` requires update operators (`$set`, `$inc`, ...); a plain document without operators is rejected, and full replacement is `replaceOne`
5. **Review explanations** — don't just check if you got it right; read why each answer is correct
6. **Check the official page** — [official exam details](https://learn.mongodb.com/pages/mongodb-associate-developer-exam) always have the latest objectives
