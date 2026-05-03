---
title: "Defender for Cloud — Multi-Cloud Security Posture"
description: "Visual map of Microsoft Defender for Cloud — the CSPM + CWPP product that protects Azure, AWS, GCP, and on-prem workloads. Foundational free tier, premium CSPM, per-workload Defender plans."
intro: "Defender for Cloud is two things: CSPM (posture management — what's misconfigured?) and CWPP (workload protection — what's under attack?). Plus it's multi-cloud."
category: "security"
format: "architecture"
renderer: "static"
data_file: "defender_for_cloud"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/defender-for-cloud.jpg
faq:
  - question: "What's the difference between Defender XDR and Defender for Cloud?"
    answer: "Defender XDR (formerly Microsoft 365 Defender) protects M365 workloads: endpoints, identity, email, cloud apps. Defender for Cloud protects AZURE workloads (and AWS/GCP via connectors): VMs, storage, databases, containers, app service. Different products, different portals (security.microsoft.com vs portal.azure.com → Defender for Cloud), overlapping concepts. Most orgs need both. Sentinel sits ABOVE both as the SIEM."
  - question: "Defender CSPM vs the free Foundational CSPM — what do I get?"
    answer: "Foundational (free, on by default for all Azure subscriptions) — Secure Score, recommendations, regulatory compliance dashboards, asset inventory. Defender CSPM (paid, ~$5/resource/month) adds — attack path analysis (graph traversal showing how an attacker would chain misconfigurations to reach crown jewels), Cloud Security Graph (queryable), data-aware posture (knows where sensitive data lives), and AI workload posture. The premium tier is most valuable for orgs with hundreds of misconfigurations — attack paths help you prioritise the 5% that matter."
  - question: "Does Defender for Cloud actually work for AWS and GCP?"
    answer: "Yes — first-class AWS and GCP connectors (not just lift-and-shift). It scans AWS accounts via IAM role + GCP projects via service account. Recommendations cover AWS-native services (S3 misconfig, IAM weakness, SecurityHub findings) and GCP equivalents. Multi-cloud has been Microsoft's focus since 2023 — they rebranded the whole product to position it as cloud-agnostic. Caveat: AWS-native or GCP-native CSPM tools (Wiz, Lacework, Prisma) often go deeper on those clouds; Defender is competitive but not always category-leading outside Azure."
  - question: "Defender plans are per-workload — which do I actually need?"
    answer: "Defender for Servers Plan 2 — covers VMs/Arc-onboarded servers, includes Defender for Endpoint integration. Most-deployed plan. Defender for Storage — anomaly detection on blob/file activity (data exfiltration, ransomware behaviour). Worth it for sensitive data accounts. Defender for SQL — vulnerability scanning + threat detection on SQL DB and SQL on VM. Defender for Containers — AKS hardening, image scanning, runtime threat detection. Defender for AI Services — new in 2025. Don't enable everything blindly — enable per workload type you actually use, in production-importance order."
---
