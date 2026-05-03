---
title: "Azure Storage Decision Tree"
description: "Visual decision tree for picking the right Azure storage service — Blob, Files, Disks, Tables, Queues — plus access tiers and redundancy options."
intro: "Five storage services, three access tiers, four redundancy options. Here's how to pick without overpaying."
category: "certifications"
format: "decision-tree"
renderer: "static"
data_file: "azure_storage_decision"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/azure-storage-decision.jpg
faq:
  - question: "When should I pick Blob Hot vs Cool vs Cold vs Archive?"
    answer: "Hot — accessed frequently (< 30 days), highest storage cost, lowest access cost. Cool — accessed monthly (30+ days), lower storage, higher access cost; minimum 30-day storage commit. Cold — accessed rarely (90+ days), even lower storage, even higher access cost; 90-day commit. Archive — accessed yearly or for compliance, cheapest storage, hours of rehydration time before access; 180-day commit. Use Lifecycle Management to auto-tier."
  - question: "Azure Files vs Azure Blob — what's the difference?"
    answer: "Azure Files is an SMB or NFS file share — apps mount it like a network drive (`\\\\storage.file.core.windows.net\\share`), supports POSIX-like file operations, hierarchy of folders. Azure Blob is object storage — apps PUT/GET via REST API, flat namespace (or HNS for Data Lake Gen2), optimised for massive scale and cheap. If you need to mount a drive from a VM or replace a file server, use Files. If you're storing log files, images, backups, or building a data lake, use Blob."
  - question: "ZRS vs GRS — when do I pay for which?"
    answer: "ZRS (Zone-Redundant Storage) replicates synchronously across 3 availability zones in ONE region — survives a single zone failure, low recovery time. GRS (Geo-Redundant Storage) replicates asynchronously to a paired region — survives a regional disaster but with potential data loss (RPO ~15 min) and read-only failover. Pick ZRS for high availability within a region (most apps); GRS when regulators or DR requirements demand cross-region copy. GZRS combines both — most expensive, most resilient."
  - question: "What's Azure Storage Explorer for?"
    answer: "A free desktop app (Windows/Mac/Linux) for browsing storage accounts visually — upload/download blobs, manage queues, edit table rows, set ACLs, generate SAS URLs. Powered by AzCopy under the hood. Essential admin tool: faster than the portal for one-off operations and unlike portal it works on huge files. Bookmark this for AZ-104 study."
---
