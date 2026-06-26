---
title: "Splunk Cloud Certified Admin (SPLK-1005) — Study Guide & Practice Exam"
description: "Free Splunk Cloud Certified Admin (SPLK-1005) study guide and 250-question practice exam. Master Splunk Cloud administration — the Cloud Platform topology and admin-vs-Splunk responsibility split, index management and configuration-file precedence with btool, roles and LDAP/AD/SAML authentication, Cloud-vetted and private apps, getting data in with forwarders and the Deployment Server, monitor/network/scripted/HEC inputs, the parsing phase with line breaking and timestamps, and index-time data transformation with props.conf, transforms.conf, and SEDCMD."
type: "cert-tracker"
layout: "single"
exam_code: "SPLUNK-CLOUD-ADMIN"
exam_title: "Splunk Cloud Certified Admin"
exam_level: "advanced"
exam_status: "active"
exam_category: "Splunk"
vendor: "splunk"
manual: false
guided_slug: "splunk-cloud-admin"
---
## About the SPLUNK-CLOUD-ADMIN Exam

> Master the Splunk Cloud Certified Admin exam (SPLK-1005) — the Splunk Cloud Platform topology and the admin-vs-Splunk responsibility split, index management and configuration-file precedence with btool, user roles and LDAP/AD/SAML authentication, installing Cloud-vetted and private apps, getting data into Splunk Cloud with universal and heavy forwarders and the Deployment Server, monitor, network, scripted, Windows and HTTP Event Collector (HEC) inputs, fine-tuning inputs and the parsing phase (line breaking and timestamps with Data Preview), manipulating raw data with props.conf, transforms.conf and SEDCMD, and working with Splunk Cloud Support.

The complete practice exam for the Splunk Cloud Certified Admin certification (SPLK-1005, Professional-Level). Covers the Splunk Cloud Platform overview and topology, the differences between Splunk Cloud and Splunk Enterprise and between Self-Service and Managed Cloud, and working with Splunk Cloud Support; index management (creating and deleting Cloud indexes, retention, monitoring indexing through the Cloud Monitoring Console) and Splunk configuration files (directory structure, default-vs-local layering, context precedence, btool, and index-time vs search-time processing); user authentication and authorization with default and custom roles and LDAP, Active Directory, and SAML/SSO, plus installing Cloud-vetted and private apps; getting data into Splunk Cloud with universal and heavy forwarders, the Cloud forwarder credentials package and outputs.conf, and the Deployment Server, deployment apps, and server classes for Forwarder Management; monitor inputs (file and directory monitoring with allowlist/denylist, crcSalt and the fishbucket), network inputs (TCP/UDP), scripted inputs, Windows inputs, and the HTTP Event Collector (HEC); fine-tuning inputs and the parsing phase, including event line breaking (LINE_BREAKER vs SHOULD_LINEMERGE), timestamp and time-zone extraction (TIME_PREFIX, TIME_FORMAT, MAX_TIMESTAMP_LOOKAHEAD), and Data Preview; and manipulating raw data with props.conf and transforms.conf for index-time field extraction, metadata and index routing, nullQueue filtering, and SEDCMD masking — every question a real-world Splunk Cloud admin scenario with full explanations, hints, exam tips, and why-wrong rationales.

## Who Should Take This Exam?

The Splunk Cloud Certified Admin certification (SPLK-1005) is designed for **Splunk administrators who operate Splunk Cloud Platform** — the managed-SaaS edition of Splunk. It validates the Cloud-specific admin workflow: the Cloud Platform topology and the split between what the customer admin manages (through Splunk Web and the Admin Config Service, ACS) and what Splunk operates; index management and configuration-file precedence (and `btool`); users and roles plus LDAP, Active Directory, and SAML/SSO authentication; installing Cloud-vetted and private apps; getting data in with universal and heavy forwarders and the Deployment Server; the full range of inputs (monitor, network, scripted, Windows, and the HTTP Event Collector); the parsing pipeline (line breaking, timestamps, and Data Preview); and index-time data manipulation with `props.conf`, `transforms.conf`, and `SEDCMD`. It builds on the Splunk Core Certified Power User credential and is the Cloud counterpart to the Splunk Enterprise Certified Admin.

**Prerequisites:** Splunk Core Certified Power User

**Typical study time:** 6-10 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | SPLUNK-CLOUD-ADMIN |
| **Title** | Splunk Cloud Certified Admin |
| **Duration** | 75 minutes |
| **Questions** | 60 |
| **Pass Score** | Scaled score (pass/fail) |
| **Cost** | $130 USD |
| **Provider** | Splunk (Pearson VUE, online proctored) |
| **Prerequisites** | Splunk Core Certified Power User |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Splunk →](https://www.splunk.com/en_us/training/certification-track/splunk-cloud-certified-admin.html) |

## Exam Domains & Weights

The SPLUNK-CLOUD-ADMIN exam covers **8 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Splunk Cloud Platform Overview and Working with Support | 10% | 25 |
| Index Management and Configuration Files | 10% | 25 |
| User Authentication, Authorization, and App Management | 10% | 25 |
| Getting Data In and Forwarder Management | 20% | 50 |
| Monitor Inputs | 15% | 38 |
| Network and Other Inputs | 10% | 25 |
| Fine-tuning Inputs and the Parsing Phase | 15% | 37 |
| Manipulating Raw Data | 10% | 25 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Getting Data In and Forwarder Management** is the heaviest area at 20% — master the universal-vs-heavy forwarder split, the Splunk Cloud forwarder credentials package (the Splunk-provided app that points `outputs.conf` at the Cloud receiver with SSL), and the Deployment Server with `serverclass.conf` and deployment apps. The two 15% domains reward hands-on input work: **Monitor Inputs** (`monitor://` stanzas, allowlist/denylist, `crcSalt` and the fishbucket) and **Fine-tuning Inputs and the Parsing Phase** (the input-phase vs parse-phase boundary, `LINE_BREAKER` vs `SHOULD_LINEMERGE`, and timestamp extraction with `TIME_PREFIX`/`TIME_FORMAT`/`MAX_TIMESTAMP_LOOKAHEAD`). Don't overlook the Cloud-specific basics in the 10% domains — the managed-service boundary (no indexer shell, the ACS API, the Cloud Monitoring Console), configuration-file precedence (which is **context-dependent** — global/index-time context resolves app directories in forward ASCII order, app/user/search-time context in reverse), and index-time transforms with `props.conf`/`transforms.conf`/`SEDCMD`.

## Practice Exam — 250 Questions

Prepare for the SPLUNK-CLOUD-ADMIN with our **250-question practice exam** covering all 8 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Splunk Certification Path

Start with the Splunk Core Certified User, then the Splunk Core Certified Power User (SPL, knowledge objects, data models, and the CIM), and advance to the Splunk Enterprise Certified Admin and specialty tracks.

## Related Splunk Certifications

If you're studying for the SPLUNK-CLOUD-ADMIN, you might also be interested in these Splunk certifications:

- **[SPLUNK-CORE-POWER-USER: Splunk Core Certified Power User](/cert-tracker/splunk-core-power-user/)** — 250 practice questions
- **[SPLUNK-ENTERPRISE-ADMIN: Splunk Enterprise Certified Admin](/cert-tracker/splunk-enterprise-admin/)** — 250 practice questions

## Study Tips

1. **Start with the heaviest domain** — focus your time where the exam focuses its questions
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
5. **Check the official page** — [official exam details](https://www.splunk.com/en_us/training/certification-track/splunk-cloud-certified-admin.html) always have the latest objectives
