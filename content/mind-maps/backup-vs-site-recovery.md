---
title: "Backup vs Site Recovery vs Soft Delete vs M365 Backup"
description: "Visual map disambiguating Azure Backup, Azure Site Recovery, storage Soft Delete, and Microsoft 365 Backup — which fixes which disaster, with RPO/RTO and fit-for-purpose guidance."
intro: "Four products that look like 'backup'. Each fixes a different disaster. Here's the map — and which one to reach for."
category: "certifications"
format: "comparison"
renderer: "static"
data_file: "backup_vs_site_recovery"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/backup-vs-site-recovery.jpg
faq:
  - question: "Backup vs Site Recovery — what's the actual difference?"
    answer: "Azure Backup keeps point-in-time COPIES of your data — files, VMs, databases — for restore in case of corruption or deletion. Recovery Point Objective (RPO) is hours to days. Azure Site Recovery REPLICATES whole VMs to a paired region continuously — for failover during a regional outage. RPO is seconds to minutes. Different problems: Backup = oops I deleted the database; ASR = the entire region is down. Most enterprises use both."
  - question: "Do I still need M365 Backup if I have retention policies and Recoverable Items?"
    answer: "Microsoft has historically argued 'Microsoft 365 has retention, you don't need backup'. That position changed in 2024 with the official M365 Backup product. Reality: retention policies + Recoverable Items handle most accidents (deleted email, deleted file) for a finite window. Beyond that — long-term retention, bulk restore, ransomware recovery, regulatory requirements — you DO need backup. M365 Backup is Microsoft's first-party offering; Veeam/Druva/AvePoint are mature third-party alternatives."
  - question: "What's storage Soft Delete and is it really a backup?"
    answer: "Soft delete is a recycle-bin feature for Azure Storage — when you delete a blob or file, it's marked deleted but kept for a configured retention period (7-365 days). Free with the storage account. NOT a substitute for Backup: it doesn't survive account deletion, doesn't help with corruption, no point-in-time restore, no cross-region copy. Treat soft delete as 'undelete', not 'backup'. But it's a free first line of defence against accidental delete."
  - question: "What about Backup Vault vs Recovery Services Vault?"
    answer: "Backup Vault is the modern resource for new workload types — Azure Files, Blob, AKS, SQL, etc. Recovery Services Vault is the legacy resource that still hosts VM backup, on-prem MABS/MARS, and ASR. Microsoft is gradually consolidating into Backup Vault but ASR + classic VM backup will live in Recovery Services Vault for the foreseeable future. For new workloads: use Backup Vault. For ASR or existing VM backups: Recovery Services Vault."
---
