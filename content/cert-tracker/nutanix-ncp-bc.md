---
title: "Nutanix NCP-BC (7.5) - Study Guide & Practice Exam"
description: "Free NUTANIX-NCP-BC study guide. Try 20 questions free. Full practice exam access: US$9 for 1 year."
type: "cert-tracker"
layout: "single"
exam_code: "NUTANIX-NCP-BC"
exam_title: "Nutanix Certified Professional - Business Continuity"
exam_level: "professional"
exam_status: "active"
exam_category: "Nutanix"
vendor: "nutanix"
manual: false
guided_slug: "nutanix-ncp-bc"
---
## About the Nutanix NCP-BC Exam

> Master the Nutanix Certified Professional - Business Continuity (NCP-BC 7.5) exam for the NCP-BC 7 credential — interpreting business continuity requirements, configuring and hardening recovery, testing failover, running recovery operations, and troubleshooting BCDR failures through Prism Central.

The complete practice exam for the Nutanix Certified Professional - Business Continuity (NCP-BC 7.5) exam, which awards the **NCP-BC 7 credential**. It is pinned to **Nutanix Disaster Recovery pc.7.5** and **Prism Central pc.7.5**. The guide covers translating recovery point and recovery time requirements into schedules and replication choices; determining prerequisites, hardening a BCDR solution, and designing network and storage for recovery; configuring recovery plans with mappings, affinity, and staged boot ordering; testing failover and validating throughput and connectivity between sites; performing self-service restore, restoring from recovery points, executing recovery during an outage, completing post-failover cleanup, and migrating legacy protection domains to protection policies; and troubleshooting replication, recovery-plan, network, storage, and validation failures using observable evidence.

## Who Should Take This Exam?

The NCP-BC certification is designed for **system administrators, backup administrators, infrastructure and solutions architects, platform engineers, and IT operations professionals** who are responsible for uptime and data protection of critical workloads on Nutanix. It validates professional, day-to-day skills across BCDR requirement translation, recovery configuration and hardening, failover testing, recovery operations and cleanup, legacy-to-policy migration, and evidence-led troubleshooting.

**Prerequisites:** None required (Nutanix recommends hands-on experience operating Nutanix Disaster Recovery, plus the Nutanix Business Continuity Administration course)

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | NCP-BC 7.5 |
| **Credential** | NCP-BC 7 |
| **Title** | Nutanix Certified Professional - Business Continuity |
| **Products Tested** | Nutanix Disaster Recovery pc.7.5, Prism Central pc.7.5 |
| **Duration** | 120 minutes |
| **Questions** | 75 |
| **Pass Score** | 3000 on a scaled 1000-6000 range |
| **Cost** | $200 USD |
| **Provider** | Nutanix University (remote proctoring or in-person test center) |
| **Languages** | English, Japanese |
| **Validity** | 3 years |
| **Prerequisites** | None required (hands-on Nutanix DR experience and the NBCA course recommended) |
| **Question Types** | Multiple choice, Multiple response |
| **Official Page** | [View the official NCP-BC 7.5 exam blueprint →](https://www.nutanix.com/content/dam/nutanix/en/resources/datasheets/ds-ebg-ncp-bc.pdf) |

## Exam Domains & Weights

The NCP-BC exam is organised into **4 official sections**. **Nutanix publishes no per-section weights**, so the percentages and question counts below are internal allocations for our 250-question practice exam only — they are not official Nutanix exam weights.

| Domain | Practice Allocation | Practice Qs |
|--------|---------------------|-------------|
| Interpret and Configure BCDR Requirements | 32% | 80 |
| Test BCDR Solutions | 14% | 35 |
| Perform BCDR Tasks | 27% | 68 |
| Troubleshoot BCDR Failures | 27% | 67 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Pin every answer to the tested stack: **Nutanix Disaster Recovery pc.7.5 and Prism Central pc.7.5** — earlier and later product behavior differs. Use current names: **Nutanix Disaster Recovery** is the current product ("Leap" is legacy), and Prism Central **Protection Policies** plus **Recovery Plans** are the current model, with **Protection Domains** appearing mainly as the legacy source of a migration. Know what each replication mode can and cannot do: **asynchronous** for longer RPOs, **NearSync** for minutes, **synchronous** for near-zero data loss, and **Metro** for continuous availability — and know which features are incompatible with which mode, because that is where requirement questions are decided. Separate the **recovery point** (the data) from the **recovery plan** (the orchestration: mappings, boot order, staging, and IP handling). Remember that static IP mapping in a recovery plan depends on **Nutanix Guest Tools** being installed and functional in the guest. When troubleshooting, reason from observable evidence — replication status, recovery-plan validation output, entity and mapping state, and network or storage reachability — rather than assuming a single root cause.

## Practice Exam — 250 Questions

Prepare for the NCP-BC with our **250-question practice exam** covering all 4 official sections. Every question includes detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Nutanix Certification Path

The **NCP-BC 7 (Business Continuity)** credential is a Nutanix professional certification focused on business continuity and disaster recovery. It complements the core **NCP-MCI (Multicloud Infrastructure)** credential: NCP-MCI validates broad Nutanix platform operations, while NCP-BC proves deeper skill in translating continuity requirements into protection design, testing and executing recovery, cleaning up after failover, migrating legacy protection domains to protection policies, and troubleshooting BCDR failures.

## Study Tips

1. **Translate requirements before choosing technology** — turn an RPO and RTO into a schedule and a replication mode first, then check the prerequisites and limitations that mode imposes
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Get hands-on** — build a protection policy and recovery plan, run a test failover, validate the plan, perform a self-service restore, then practise post-failover cleanup and failback
4. **Know the legacy-to-current migration** — Protection Domains to Protection Policies and Recovery Plans is an explicit objective, not just background history
5. **Troubleshoot in layers** — entity protection, replication health, recovery-plan validation, mappings and guest tooling, then network and storage; a healthy replication link does not prove a recovery plan will boot
6. **Check the official blueprint** — [official NCP-BC 7.5 exam details](https://www.nutanix.com/content/dam/nutanix/en/resources/datasheets/ds-ebg-ncp-bc.pdf) always have the latest objectives
