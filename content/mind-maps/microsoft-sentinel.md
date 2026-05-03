---
title: "Microsoft Sentinel — Cloud SIEM + SOAR"
description: "Visual map of Microsoft Sentinel — what it is (SIEM + SOAR), data connectors, analytics rules, hunting, automation playbooks, and how it differs from Defender XDR."
intro: "Sentinel is the cloud SIEM that ingests logs from everywhere and correlates them. Defender XDR covers M365 only. Most SOCs run both."
category: "security"
format: "architecture"
renderer: "static"
data_file: "microsoft_sentinel"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/microsoft-sentinel.jpg
faq:
  - question: "Sentinel vs Defender XDR — when do I need which?"
    answer: "Defender XDR — pre-correlated, pre-built incidents across Microsoft 365 stack (Endpoint, Email, Identity, Cloud Apps). Free with E5/E5 Security licences. Right answer for an M365-only SOC. Sentinel — cloud SIEM that ingests EVERYTHING (M365, Azure, AWS, GCP, on-prem firewalls, third-party SaaS, network gear). Pay per GB ingested. Right answer for any org with a real SOC and non-Microsoft data sources. Most enterprises run both: XDR for native M365, Sentinel as the unified SIEM that pulls XDR's incidents in alongside everything else."
  - question: "How much does Sentinel cost?"
    answer: "Pricing is per GB of data ingested per day, with commitment-tier discounts (e.g. 100/200/500/1000+ GB/day). Microsoft 365 audit + Defender data is FREE to ingest into Sentinel. Custom logs, Azure Activity, network gear, third-party SaaS = paid. A typical mid-size SOC ingests 10-100 GB/day; large enterprises 500+ GB/day. Cost optimisation = filter junk before ingest, use Basic tier for low-value logs (cheaper, limited query), archive older data to cold storage."
  - question: "What's KQL and do I have to learn it?"
    answer: "Kusto Query Language — Microsoft's read-only SQL-like language for querying log data. Used by Sentinel, Defender XDR Advanced Hunting, Log Analytics, Azure Monitor. Yes, you have to learn it for any meaningful Sentinel work — it's how you write detection rules, hunting queries, workbook visualisations. Good news: KQL is well-documented, AI-assistance via Security Copilot helps draft queries, and basic operators (where / project / summarize / join) cover 80% of use cases. Plan a few weeks of practice for analysts."
  - question: "What are 'Fusion' detections?"
    answer: "Microsoft's ML-driven multi-stage attack correlation. Fusion looks across raw events from many connectors and builds high-confidence incidents from low-confidence individual signals — e.g. 'unusual sign-in + suspicious download + anomalous email forwarding' across three sources becomes ONE incident. Reduces alert fatigue dramatically and surfaces attacks that simple per-rule logic would miss. Enabled by default; you tune which scenario types to surface based on your environment."
---
