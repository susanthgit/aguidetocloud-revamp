---
title: "Nutanix NCP-CI-AWS — Study Guide & Practice Exam"
description: "Nutanix Certified Professional - Cloud Integration - AWS (NCP-CI-AWS) study guide and 250-question practice exam. Exam domains, Nutanix Cloud Clusters (NC2) on AWS, cloud-account onboarding, EC2 bare-metal deployment, VPC and Flow Virtual Networking, hibernate/resume, and disaster recovery — with a full exam simulation."
type: "cert-tracker"
layout: "single"
exam_code: "NUTANIX-NCP-CI-AWS"
exam_title: "Nutanix Certified Professional - Cloud Integration - AWS"
exam_level: "professional"
exam_status: "active"
exam_category: "Nutanix"
vendor: "nutanix"
manual: false
guided_slug: "nutanix-ncp-ci-aws"
---
## About the Nutanix NCP-CI-AWS Exam

> Master the Nutanix Certified Professional - Cloud Integration - AWS (NCP-CI-AWS) exam — preparing the AWS cloud environment, onboarding an AWS cloud account, deploying and configuring Nutanix Cloud Clusters (NC2) on AWS EC2 bare-metal, and managing and monitoring clusters the Nutanix-native way across native AWS networking and Flow Virtual Networking.

The complete practice exam for the Nutanix Certified Professional - Cloud Integration - AWS (NCP-CI-AWS) certification, built on current Nutanix Cloud Clusters (NC2) on AWS. Covers preparing the AWS cloud environment (using My Nutanix and the NC2 console, adding the AWS cloud account, deploying the Nutanix CloudFormation stack that creates the cross-account IAM roles, and subscribing to NC2 through a trial, a subscription, or eligible existing licenses); determining implementation requirements (selecting supported EC2 bare-metal instance types, cluster node counts with a 28-node maximum and no two-node clusters, AWS service quotas, and region and Availability Zone capacity, including single and multiple Availability Zone deployment models); identifying networking requirements (VPC, management and user-VM subnets, CIDR planning without on-premises overlap, ENIs, route tables, and choosing AWS Direct Connect or Site-to-Site VPN); deploying an NC2 on AWS environment (the NC2 console deployment workflow and stages of AHV and AOS installation, CVM bring-up, and cluster creation, configuring cloud-provider networking and AWS security groups during deployment, and troubleshooting deployment failures from IAM and CloudFormation permission gaps, insufficient vCPU quotas, bare-metal capacity shortfalls, and CIDR overlaps); configuring an NC2 on AWS environment (native AWS networking and security groups versus Flow Virtual Networking overlay with a transit VPC, Flow Gateway, GENEVE transport, and NAT or no-NAT models, and troubleshooting connectivity issues); and managing an NC2 on AWS environment (expanding nodes, hibernate and resume with S3-backed cluster data preservation, LCM software upgrades, destructive termination and workload repatriation, monitoring cluster and AWS resource health, and protection and disaster recovery through Prism Central Nutanix DR, Cluster Protect, and Nutanix Move rather than an AWS-native backup service) — every question an original real-world Nutanix hybrid-cloud scenario with full explanations.

## Who Should Take This Exam?

The NCP-CI-AWS certification is designed for **cloud engineers, infrastructure and virtualization engineers, cloud and solutions architects, platform engineers, and IT operations engineers** who deploy and operate Nutanix Cloud Clusters (NC2) on AWS. It validates practical, day-to-day skills across the NC2-on-AWS lifecycle — from onboarding the AWS cloud account and planning EC2 bare-metal capacity and VPC networking through deploying clusters, configuring native AWS and Flow Virtual Networking, and managing hibernate/resume, upgrades, monitoring, and disaster recovery on the Nutanix Cloud Platform running in AWS.

**Prerequisites:** None required (Nutanix recommends hands-on experience with NC2 on AWS and the Nutanix Cloud Clusters on AWS Administration course)

**Typical study time:** 3-6 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | NCP-CI-AWS |
| **Title** | Nutanix Certified Professional - Cloud Integration - AWS |
| **Duration** | 120 minutes |
| **Questions** | 75 |
| **Pass Score** | Not published by Nutanix — confirm at registration |
| **Cost** | $200 USD |
| **Provider** | Pearson VUE / Nutanix University (test center or online-proctored) |
| **Validity** | 3 years |
| **Prerequisites** | None (NC2A-AWS course + NC2 experience recommended) |
| **Question Types** | Multiple choice, Multiple response |
| **Official Page** | [View on Nutanix →](https://www.nutanix.com/support-services/training-certification/certifications) |

## Exam Domains & Weights

The NCP-CI-AWS exam is organised into **4 official sections**. Nutanix does not publish per-section percentages, so the weights below reflect each section's breadth in our 250-question practice exam — use them to plan study time.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Prepare the AWS Cloud Environment | 30% | 75 |
| Deploying an NC2 on AWS Environment | 28% | 70 |
| Configuring an NC2 on AWS Environment | 22% | 55 |
| Managing an NC2 on AWS Environment | 20% | 50 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Keep the two networking models distinct. **Native AWS networking** uses VPCs, subnets (a management subnet and user-VM subnets), ENIs, route tables, and AWS **security groups** — these are AWS security groups, not Azure NSGs. **Flow Virtual Networking (FVN)** is an optional Nutanix overlay that adds a transit VPC, a Flow Gateway, and GENEVE transport, and it requires a Prism Central control plane — it is never the default. Know the four control planes: **My Nutanix** (account and entitlement), the **NC2 console** (cloud-cluster lifecycle and AWS cloud-account management), **Prism Central** (multicluster management, Nutanix DR orchestration, and the FVN control plane), and **Prism Element** (per-cluster local management). Remember that onboarding runs through a Nutanix **CloudFormation** stack that creates the cross-account IAM roles, that **two-node clusters are not supported** (max 28 nodes), that **hibernate/resume** preserves cluster data in an S3 bucket and is AWS-specific, that **termination is destructive and does not repatriate data**, and that protection and DR use **Nutanix DR, Cluster Protect, and Nutanix Move** — never an AWS-native backup service.

## Practice Exam — 250 Questions

Prepare for the NCP-CI-AWS with our **250-question practice exam** covering all 4 exam sections. Every question includes detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Nutanix Certification Path

The **NCP-CI-AWS (Cloud Integration - AWS)** is a Nutanix professional specialisation focused on running Nutanix Cloud Clusters (NC2) on AWS — the hybrid-cloud deployment plane. It pairs well with the core **NCP-MCI (Multicloud Infrastructure)** credential: take NCP-MCI to validate broad on-prem cluster-operations skills, then add NCP-CI-AWS to prove depth in deploying and operating NC2 on AWS. Both sit under the wider Nutanix Certified Professional and Master (NCM) tracks alongside NCP-US (Unified Storage) and NCP-DB (Database Automation).

## Study Tips

1. **Master the two networking models** — native AWS (VPC, subnets, security groups, route tables) versus Flow Virtual Networking overlay (transit VPC, Flow Gateway, GENEVE); knowing which one a scenario needs decides many questions
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Get hands-on** — onboard an AWS cloud account with the CloudFormation stack, deploy an NC2 cluster, and hibernate/resume it to internalise the S3-backed lifecycle
4. **Know the four control planes and the deploy-failure root causes** — My Nutanix vs NC2 console vs Prism Central vs Prism Element, and IAM/CloudFormation, quota, capacity, and CIDR failures
5. **Check the official page** — [official exam details](https://www.nutanix.com/support-services/training-certification/certifications) always have the latest objectives
