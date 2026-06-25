---
title: "Splunk Enterprise Certified Admin — Study Guide & Practice Exam"
description: "Free Splunk Enterprise Certified Admin (SPLK-1003) study guide and 250-question practice exam. Master Splunk administration — components and licensing, configuration-file layering and precedence with btool, indexes and bucket lifecycle and retention, users and roles and LDAP/SAML/MFA authentication, forwarders and outputs.conf, the deployment server and Forwarder Management, distributed search, monitor/network/scripted/HEC inputs, and index-time parsing with props.conf, transforms.conf, and SEDCMD."
type: "cert-tracker"
layout: "single"
exam_code: "SPLUNK-ENTERPRISE-ADMIN"
exam_title: "Splunk Enterprise Certified Admin"
exam_level: "advanced"
exam_status: "active"
exam_category: "Splunk"
vendor: "splunk"
manual: false
guided_slug: "splunk-enterprise-admin"
---
## About the SPLUNK-ENTERPRISE-ADMIN Exam

> Master the Splunk Enterprise Certified Admin exam (SPLK-1003) — Splunk components and license management, configuration-file layering and precedence with btool, index and bucket management with data retention, users and roles and LDAP/SAML/MFA authentication, getting data in with forwarders and outputs.conf, the deployment server and forwarder management, distributed search, monitor/network/scripted/agentless inputs, and parsing and transforming raw data with props.conf, transforms.conf, and SEDCMD.

The complete practice exam for the Splunk Enterprise Certified Admin certification (SPLK-1003, Professional-Level). Covers Splunk processing and management components and the Enterprise/Free/Forwarder license model and license violations; the configuration directory structure with default-vs-local layering, context precedence, and btool; index and bucket lifecycle (hot/warm/cold/frozen/thawed), indexes.conf retention options, the fishbucket, and data-integrity checks; default roles and custom roles with index/search restrictions plus LDAP, SAML/SSO, and multifactor authentication; getting data in with universal and heavy forwarders, the three indexing phases, and outputs.conf load balancing; the deployment server, deployment apps, server classes, and Forwarder Management; distributed search with search heads, search peers, knowledge-bundle replication, and search head clustering; monitor, network (TCP/UDP), scripted, WMI, and HTTP Event Collector inputs; and parsing-phase line breaking and timestamp handling plus index-time transformations with props.conf, transforms.conf, SEDCMD, sourcetype/host overrides, index routing, and nullQueue filtering — every question a real-world admin scenario with full explanations, hints, exam tips, and why-wrong rationales.

## Who Should Take This Exam?

The Splunk Enterprise Certified Admin certification (SPLK-1003) is designed for **Splunk administrators** who install, configure, and operate Splunk Enterprise in production. It validates hands-on command of the admin workflow — licensing and components, configuration-file layering and precedence (and `btool`), index and bucket management with retention, users and roles plus LDAP/SAML/MFA authentication, getting data in with universal and heavy forwarders, the deployment server and Forwarder Management, distributed search and search head clustering, the full range of inputs (monitor, network, scripted, WMI, and HTTP Event Collector), and index-time parsing and data transformation. It builds directly on the Splunk Core Certified Power User credential and is the gateway to the Architect and Cloud Administration tracks.

**Prerequisites:** Splunk Core Certified Power User

**Typical study time:** 6-10 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | SPLK-1003 |
| **Title** | Splunk Enterprise Certified Admin |
| **Duration** | 60 minutes |
| **Questions** | 56 |
| **Pass Score** | Scaled score (pass/fail) |
| **Cost** | $130 USD |
| **Provider** | Splunk (Pearson VUE) |
| **Prerequisites** | Splunk Core Certified Power User |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Splunk →](https://www.splunk.com/en_us/training/certification-track/splunk-enterprise-certified-admin.html) |

## Exam Domains & Weights

The SPLUNK-ENTERPRISE-ADMIN exam covers **9 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Splunk Admin Basics & License Management | 10% | 25 |
| Configuration Files, Layering & Precedence | 5% | 13 |
| Splunk Indexes, Buckets & Retention | 10% | 25 |
| Users, Roles & Authentication | 10% | 25 |
| Getting Data In & Forwarder Configuration | 15% | 38 |
| Forwarder Management & Deployment Server | 10% | 25 |
| Distributed Search | 10% | 25 |
| Input Types: Monitor, Network, Scripted & Agentless | 15% | 37 |
| Parsing & Transforming Raw Data | 15% | 37 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Three domains tie for the heaviest weight at 15% — **Getting Data In & Forwarder Configuration**, **Input Types**, and **Parsing & Transforming Raw Data** — so master `inputs.conf` and `outputs.conf` load balancing, the universal-vs-heavy forwarder split, and the index-time `props.conf`/`transforms.conf` pipeline (line breaking, timestamps, `SEDCMD`, sourcetype/host overrides, and routing to `nullQueue`). The 10% domains reward hands-on config: `indexes.conf` bucket lifecycle and retention, the deployment server and `serverclass.conf`, distributed search and knowledge-bundle replication, and role-based search restrictions. **Configuration Files, Layering & Precedence** is the smallest domain (5%), but `btool` and the default-vs-local precedence order underpin every other topic — don't skip it.

## Practice Exam — 250 Questions

Prepare for the SPLUNK-ENTERPRISE-ADMIN with our **250-question practice exam** covering all 9 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Splunk Certification Path

Start with the Splunk Core Certified User, then the Splunk Core Certified Power User (SPL, knowledge objects, data models, and the CIM), and advance to the Splunk Enterprise Certified Admin and specialty tracks.

## Related Splunk Certifications

If you're studying for the SPLUNK-ENTERPRISE-ADMIN, you might also be interested in these Splunk certifications:

- **[SPLUNK-CORE-POWER-USER: Splunk Core Certified Power User](/cert-tracker/splunk-core-power-user/)** — 250 practice questions

## Study Tips

1. **Start with the heaviest domain** — focus your time where the exam focuses its questions
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
5. **Check the official page** — [official exam details](https://www.splunk.com/en_us/training/certification-track/splunk-enterprise-certified-admin.html) always have the latest objectives
