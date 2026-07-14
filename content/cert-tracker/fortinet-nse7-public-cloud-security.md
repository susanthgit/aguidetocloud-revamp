---
title: "Fortinet NSE 7 - Public Cloud Security 7.6.4 Architect (NSE7_CDS_AR-7.6) — Free Study Guide"
description: "Fortinet NSE 7 - Public Cloud Security 7.6.4 Architect (NSE7_CDS_AR-7.6): free 250-question practice exam + study guide covering deploying FortiGate-VM, FortiWeb and FortiCNAPP to protect AWS and Azure, HA and autoscaling, infrastructure-as-code with Terraform, Ansible, Azure Bicep and AWS CloudFormation, cloud network monitoring, SDN connectors, and multi-cloud connectivity troubleshooting on FortiOS 7.6."
type: "cert-tracker"
layout: "single"
exam_code: "NSE7_CDS_AR-7.6"
exam_title: "Fortinet NSE 7 - Public Cloud Security 7.6.4 Architect"
exam_level: "expert"
exam_status: "active"
exam_category: "Fortinet"
vendor: "fortinet"
manual: false
guided_slug: "fortinet-nse7-public-cloud-security"
---
## About the NSE 7 - Public Cloud Security 7.6.4 Architect Exam

> Deploy, automate, monitor, and troubleshoot Fortinet security across AWS and Microsoft Azure — on FortiOS 7.6, FortiWeb 7.4, and FortiCNAPP

The NSE7_CDS_AR-7.6 (Fortinet NSE 7 - Public Cloud Security 7.6.4 Architect) is an expert-level Fortinet exam that validates your applied knowledge of integrating and administering Fortinet public cloud security solutions built from multiple Fortinet products. It covers deploying FortiGate-VM to protect IaaS (single instance, active-passive and active-active HA, and autoscaling in AWS Auto Scaling groups and Azure VMSS), protecting containers and cloud-native workloads with FortiWeb and FortiCNAPP, integrating with cloud-native tools through SDN and fabric connectors, automating deployments with Terraform, Ansible, Azure Bicep and AWS CloudFormation, monitoring AWS and Azure networks, and troubleshooting connectivity and SDN-connector issues end to end. Original practice questions. Not affiliated with, endorsed by, or sourced from Fortinet certification exams.

## Who Should Take This Exam?

The NSE 7 - Public Cloud Security 7.6.4 Architect is designed for **network and security professionals who are responsible for the integration and administration of an enterprise public cloud security infrastructure composed of multiple Fortinet solutions**. Fortinet recommends roughly 2 years of experience with Fortinet security solutions, 2 years with AWS, and 2 years with Microsoft Azure.

**Typical study time:** 6-10 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Series** | NSE7_CDS_AR-7.6 |
| **Title** | Fortinet NSE 7 - Public Cloud Security 7.6.4 Architect |
| **Product Version** | FortiOS 7.6, FortiWeb 7.4, FortiCNAPP |
| **Clouds** | AWS and Microsoft Azure |
| **Duration** | 75 minutes |
| **Questions** | 35-40 |
| **Pass Score** | Pass / fail (Fortinet does not publish a numeric cut score) |
| **Cost** | $400 USD |
| **Provider** | Pearson VUE |
| **Validity** | 2 years |
| **Question Types** | Multiple choice, Multiple select |

## Exam Domains & Weights

The NSE 7 - Public Cloud Security 7.6.4 Architect exam covers **4 domains**. Fortinet publishes the objective areas without official percentages, so the weights below are estimated evenly by objective breadth to help you plan study time.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Security solutions deployment | 25% | 62 |
| Automation tools (Infrastructure as Code) | 25% | 63 |
| Cloud infrastructure monitoring | 25% | 63 |
| Troubleshooting | 25% | 62 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** This is a *hands-on architect* exam — every domain expects you to reason across **both AWS and Azure**. Know the deployment differences cold: AWS uses **route tables + Source/Destination Check on the ENI + Gateway Load Balancer** while Azure uses **User Defined Routes + a Standard Load Balancer with the SDN-connector failover (API-driven route and IP move)**. For automation, be able to tell the **fortios / fortimanager Terraform providers** apart from the **fortinet.fortios / fortinet.fortimanager Ansible collections**, and know when Azure **Bicep** or AWS **CloudFormation** is the vendor-native choice. Above all, practice the troubleshooting flow: correlate a **`diagnose debug flow`** capture with the cloud provider's **route table, security group / NSG, and flow logs** to find the root cause.

## Practice Exam — 250 Questions

Prepare for the NSE 7 - Public Cloud Security 7.6.4 Architect with our **250-question practice exam** covering all 4 exam domains. Every question is an original architect-level scenario set in AWS and Azure with detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Fortinet Certification Path

Fortinet certifications run from Associate (FCA) through Professional (FCP) and Solution Specialist (FCSS) up to Expert (FCX). The NSE 7 - Public Cloud Security 7.6.4 Architect is an expert-level exam in the Cloud Security solution area; Fortinet recommends preparing with the FCP - FortiGate 7.6 Administrator exam plus the NSE 7 - Public Cloud Security 7.6.4 Architect course and hands-on labs, and having solid working experience with both AWS and Azure.

## Related Fortinet Certifications

If you're studying for the NSE 7 - Public Cloud Security 7.6.4 Architect, you might also be interested in these Fortinet certifications:

- **[FCSS-SDWAN: FCSS - SD-WAN 7.6 Architect](/cert-tracker/fortinet-fcss-sdwan/)** — the secure SD-WAN architect exam on FortiOS 7.6 — practice exam
- **[NSE7-EFW: Fortinet NSE 7 - Enterprise Firewall 7.6](/cert-tracker/fortinet-nse7-efw/)** — the FortiGate enterprise firewall expert exam — practice exam
- **[NSE4: Fortinet NSE 4 - FortiOS 7.6 Administrator](/cert-tracker/fortinet-nse4/)** — the FortiGate administration foundation — practice exam

## Study Tips

1. **Think in two clouds** — for every FortiGate feature, know how it lands in **both AWS and Azure** (route table vs UDR, Security Group vs NSG, Auto Scaling group vs VMSS, EIP move vs SDN-connector floating-IP move)
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Master the IaC four** — the fortios/fortimanager **Terraform** providers, the fortinet.fortios/fortimanager **Ansible** collections (httpapi + API token), Azure **Bicep**, and AWS **CloudFormation**, plus safe bootstrap and secrets handling (never bake a license or token into UserData)
4. **Know the SDN connector inside out** — the exact IAM role / managed identity / service principal permissions it needs, how dynamic address objects populate from tags, and why they fail
5. **Simulate exam conditions** — use the timed exam mode to practice reading `diagnose debug flow` output against cloud route tables under pressure
