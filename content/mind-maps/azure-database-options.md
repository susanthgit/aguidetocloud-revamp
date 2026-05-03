---
title: "Azure Database Options — Pick Yours (DP-900 / DP-300)"
description: "Visual decision tree for picking the right Azure database — SQL Database, SQL Managed Instance, Postgres / MySQL Flexible, Cosmos DB (5 APIs), Synapse, Microsoft Fabric. Mapped to DP-900, DP-300, DP-203, AZ-204 exams."
intro: "Eleven Azure database services. Five Cosmos APIs. Three exams test this. Here's the decision tree."
category: "certifications"
format: "decision-tree"
renderer: "static"
data_file: "azure_database_options"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/azure-database-options.jpg
faq:
  - question: "SQL Database vs Managed Instance vs SQL on VM — which?"
    answer: "Azure SQL Database — PaaS, single database, simplest to operate, Microsoft handles updates/backups, ~99% T-SQL compatible. SQL Managed Instance — also PaaS, full SQL Server instance feature parity (SQL Agent, cross-database queries, CLR, linked servers), best for lift-and-shift of complex on-prem databases. SQL on VM — IaaS, you manage the OS + SQL, full control, best for legacy versions or compliance requirements that need OS-level access. Default to SQL Database; escalate to MI when you need SQL Agent or cross-DB; SQL on VM is last resort."
  - question: "Cosmos DB has 5 APIs — when do I pick which?"
    answer: "NoSQL (default API) — best new development, native to Cosmos, lowest latency, all features. MongoDB API — migrating from MongoDB or want Mongo drivers/tools. Cassandra API — migrating from Cassandra. Gremlin — graph data (relationships, fraud detection). Table — cheap key-value, similar to Storage Tables but with global distribution and SLA. Most new projects pick NoSQL API unless they specifically need to migrate or query a graph."
  - question: "Synapse vs Microsoft Fabric — what's the difference?"
    answer: "Synapse Analytics is the older unified data + analytics platform — dedicated SQL pools, serverless SQL, Spark notebooks. Still actively supported but Microsoft is positioning Fabric as its successor for new projects. Microsoft Fabric (announced 2023, GA 2024) is a SaaS analytics platform that bundles OneLake (storage), Data Engineering, Data Science, Data Warehouse, and Power BI under one billing model + workspace. New analytics projects: default to Fabric. Existing Synapse: stay until you need to modernise."
  - question: "Postgres Flexible vs Single Server — which one?"
    answer: "Always Flexible Server. Single Server is in deprecation and Microsoft has been migrating customers off it. Flexible Server gives you maintenance windows, zone redundancy, server parameters, and better performance. The 'Flexible' / 'Single' naming is a hangover that's already retired in marketing materials but still appears in some legacy docs."
---
