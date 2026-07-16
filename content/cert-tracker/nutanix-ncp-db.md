---
title: "Nutanix NCP-DB (6.10) — Study Guide & Practice Exam"
description: "Nutanix Certified Professional - Database Automation (NCP-DB 6.10) study guide and 250-question practice exam. Exam domains, Nutanix Database Service (NDB), provisioning, patching, Time Machine protection, and administration — with a full exam simulation."
type: "cert-tracker"
layout: "single"
exam_code: "NUTANIX-NCP-DB"
exam_title: "Nutanix Certified Professional - Database Automation"
exam_level: "professional"
exam_status: "active"
exam_category: "Nutanix"
vendor: "nutanix"
manual: false
guided_slug: "nutanix-ncp-db"
---
## About the Nutanix NCP-DB Exam

> Master the Nutanix Certified Professional - Database Automation (NCP-DB 6.10) exam — deploying, configuring, operating, protecting, monitoring, and administering Nutanix Database Service (NDB), and automating the full database lifecycle across Oracle, SQL Server, MySQL, MariaDB, PostgreSQL, EDB, and MongoDB the Nutanix-native way.

The complete practice exam for the Nutanix Certified Professional - Database Automation (NCP-DB 6.10) certification, built on current Nutanix Database Service (NDB) running on AOS. Covers describing NDB concepts (the NDB Server control plane, the per-cluster NDB Agent, registered database-server VMs, the software, compute, network, and database-parameter profiles, Time Machine, SLA retention, clones, and DAM, plus the value of automated provisioning, one-click patching, and copy-data-management across the supported engines); deploying and configuring an NDB solution (deploying the control plane onto a Nutanix cluster, network, DNS, and NTP requirements, initial administrator and directory configuration, and NDB High Availability with additional API server VMs behind HAProxy); operating and maintaining an NDB environment (registering database-server VMs and databases versus provisioning new databases from profiles, engine-specific provisioning such as SQL Server explicit IP and custom drive letters, MySQL GUI HA clusters, and MongoDB sharded clusters with Ops Manager, testing and publishing database patches, applying Linux OS patches, upgrading databases, and troubleshooting failed operations); protecting NDB-managed databases using Time Machine (SLA retention policies, cloning from a snapshot or a point in time, refreshing clones on a schedule, restoring source databases, applying database-protection policies, and creating Data Access Management policies for cross-cluster data access); monitoring alerts and storage usage; and administering an NDB environment (managing profiles, performing NDB software upgrades, adding Nutanix clusters, managing networks and IP address management, managing role-based access controls, and using the NDB REST API and CLI) — every question an original real-world Nutanix database-automation scenario with full explanations.

## Who Should Take This Exam?

The NCP-DB certification is designed for **database administrators, database platform and automation engineers, and infrastructure engineers** who deliver self-service databases on Nutanix. It validates practical, day-to-day skills across the Nutanix Database Service (NDB) lifecycle — from deploying the control plane and provisioning databases through patching, upgrades, Time Machine protection, monitoring, and administration on the Nutanix Cloud Platform.

**Prerequisites:** None required (Nutanix recommends database administration experience with NDB and the Nutanix Database Management and Automation course)

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | NCP-DB 6.10 |
| **Title** | Nutanix Certified Professional - Database Automation |
| **Duration** | 120 minutes |
| **Questions** | 75 |
| **Pass Score** | Scaled score — confirm at registration |
| **Cost** | $199 USD |
| **Provider** | Pearson VUE (test center or OnVUE online-proctored) |
| **Validity** | 2 years |
| **Prerequisites** | None (NDMA course + database experience recommended) |
| **Question Types** | Multiple choice, Multiple response |
| **Official Page** | [View on Nutanix →](https://www.nutanix.com/support-services/training-certification/certifications) |

## Exam Domains & Weights

The NCP-DB exam is organised into **6 official sections**. Nutanix does not publish per-section percentages, so the weights below reflect each section's breadth in our 250-question practice exam — use them to plan study time.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Describe NDB Concepts | 10% | 25 |
| Deploy and Configure an NDB Solution | 15% | 38 |
| Monitor Alerts and Storage Usage | 10% | 24 |
| Operate and Maintain an NDB Environment | 22% | 55 |
| Protect NDB-managed Databases Using Time Machine | 21% | 53 |
| Administer an NDB Environment | 22% | 55 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Keep the NDB constructs distinct. The four **profiles** each standardise one thing — software (OS + database image), compute (vCPU/cores/memory), network (VLAN/IP), and database-parameter (engine config); out-of-the-box profiles are for testing, production uses custom ones. Know the difference between **register** (bring an existing database-server VM or database under management) and **provision** (create a brand-new database from profiles). For protection, everything runs through **Time Machine** — an SLA retention policy drives snapshot frequency and retention, a clone is created from a snapshot or a point in time, a refresh updates a clone, a restore recovers the source database, and a DAM (Data Access Management) policy controls where Time Machine data is accessible across clusters — never a generic VM snapshot or an AOS Protection Domain. Remember NCP-DB 6.10 is the certification version while the product is NDB 2.10, and SAP HANA is not on the current supported-engine list.

## Practice Exam — 250 Questions

Prepare for the NCP-DB with our **250-question practice exam** covering all 6 exam sections. Every question includes detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Nutanix Certification Path

The **NCP-DB (Database Automation)** is a Nutanix professional specialisation focused on Nutanix Database Service (NDB) — automating the database lifecycle. It pairs well with the core **NCP-MCI (Multicloud Infrastructure)** credential: take NCP-MCI to validate broad cluster-operations skills, then add NCP-DB to prove depth in database provisioning, patching, and copy-data-management. Both sit under the wider Nutanix Certified Professional and Master (NCM) tracks alongside NCP-US (Unified Storage).

## Study Tips

1. **Master Time Machine** — SLA retention, clones, clone refresh, source-database restore, and DAM policies are the single most-tested area; know which one each scenario needs
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Get hands-on** — deploy NDB, register a database-server VM, provision a database from profiles, and take a clone from a point in time to internalise the workflow
4. **Know register versus provision, and the four profile types** — these distinctions decide many questions
5. **Check the official page** — [official exam details](https://www.nutanix.com/support-services/training-certification/certifications) always have the latest objectives
