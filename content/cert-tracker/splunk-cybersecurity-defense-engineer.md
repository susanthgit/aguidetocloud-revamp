---
title: "Splunk Certified Cybersecurity Defense Engineer — Study Guide & Practice Exam"
description: "Splunk Certified Cybersecurity Defense Engineer (SPLK-5002) study guide and 250-question practice exam. Master detection engineering in Splunk Enterprise Security, correlation searches and ES 8 detections, Risk-Based Alerting, CIM data normalization, notable-event and finding generation, the detection lifecycle, threat-intelligence management, REST APIs, and Splunk SOAR playbook automation."
type: "cert-tracker"
layout: "single"
exam_code: "SPLUNK-CYBERSECURITY-DEFENSE-ENGINEER"
exam_title: "Splunk Certified Cybersecurity Defense Engineer"
exam_level: "professional"
exam_status: "active"
exam_category: "Splunk"
vendor: "splunk"
manual: false
guided_slug: "splunk-cybersecurity-defense-engineer"
---
## About the Splunk Certified Cybersecurity Defense Engineer Exam

> Master the Splunk Certified Cybersecurity Defense Engineer exam (SPLK-5002) — detection engineering in Splunk Enterprise Security, authoring and tuning correlation searches and ES 8 detections, Risk-Based Alerting (risk modifiers, the risk index, risk incident rules), CIM data normalization and acceleration, notable-event and finding generation, the detection lifecycle and detection-as-code, threat-intelligence management, REST APIs, and Splunk SOAR playbook automation.

The complete practice exam for the Splunk Certified Cybersecurity Defense Engineer (SPLK-5002) certification. This professional, engineer-tier exam validates the ability to **build, tune, deploy, and measure** security detections and automations in Splunk Enterprise Security and Splunk SOAR. It covers data engineering for detections (event review, performant indexing, data models and tsidx acceleration, and CIM normalization with Technical Add-ons), detection engineering (authoring and tuning correlation searches / ES 8 detections, incorporating Asset and Identity and threat-intelligence context, engineering risk-based modifiers and risk incident rules, generating effective notable events and findings, and running a dev-test-prod detection lifecycle with version control), building security processes and programs (threat-intelligence development, MITRE ATT&CK-driven detection prioritization, and standard operating procedures), automation and efficiency (orchestrating SOPs, optimizing case management, the splunkd and Splunk SOAR REST APIs, and building Splunk SOAR playbooks with blocks, assets, and human-in-the-loop prompts), and auditing and reporting (SOC metrics like MTTD/MTTR and detection coverage, scheduled reports, and program-analytics dashboards) — every question a real-world detection-engineering scenario with full explanations, hints, exam tips, and why-wrong rationales.

## Who Should Take This Exam?

The Splunk Certified Cybersecurity Defense Engineer certification is designed for **SOC detection engineers, security-content developers, and SOAR automation engineers** who build and maintain the detections and automations a SOC runs on. It validates working command of data normalization and CIM engineering, correlation-search and ES 8 detection authoring and tuning, Risk-Based Alerting engineering, notable-event and finding generation, the detection lifecycle and detection-as-code, threat-intelligence management, REST APIs, and Splunk SOAR playbook automation. It is the natural next step after the Splunk Certified Cybersecurity Defense Analyst: where the analyst investigates the output of detections, the engineer builds, tunes, and automates them. Splunk Power User-level knowledge plus hands-on experience with Splunk Enterprise Security and Splunk SOAR is strongly recommended before you sit it.

**Prerequisites:** None required (Splunk Power User level and Splunk Enterprise Security + Splunk SOAR familiarity recommended)

**Typical study time:** 6-10 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam** | SPLK-5002 |
| **Title** | Splunk Certified Cybersecurity Defense Engineer |
| **Duration** | 75 minutes |
| **Questions** | 60 |
| **Pass Score** | Pass / fail (Splunk does not publicly disclose the cut score) |
| **Cost** | $130 USD |
| **Provider** | Splunk (Pearson VUE) |
| **Prerequisites** | None required (Splunk Power User level and Splunk Enterprise Security + Splunk SOAR familiarity recommended) |
| **Question Types** | Multiple choice, Multiple response |
| **Official Page** | [View on Splunk →](https://www.splunk.com/en_us/training/certification-track/splunk-certified-cybersecurity-defense-engineer.html) |

## Exam Domains & Weights

The Splunk Certified Cybersecurity Defense Engineer exam covers **5 domains**. Focus your study time based on the weights below — Detection Engineering alone is 40% of the exam.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Detection Engineering | 40% | 100 |
| Building Effective Security Processes and Programs | 20% | 50 |
| Automation and Efficiency | 20% | 50 |
| Data Engineering | 10% | 25 |
| Auditing and Reporting on Security Programs | 10% | 25 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Detection Engineering is 40% of the exam — spend most of your time there. Be able to author and tune a **correlation search / ES 8 detection** end to end: the search SPL, scheduling and time window, trigger conditions, throttling and suppression, and false-positive tuning, and know that a correlation search is stored as a special saved search in **savedsearches.conf** (`correlationsearches.conf` has been deprecated since ES 4.6). Learn **Risk-Based Alerting** as an *engineer*: a **risk modifier** adds a score to a **risk object** and writes a **risk event** to the **risk index** via the Risk Analysis adaptive-response action, and a **risk incident rule** aggregates that risk into a **risk notable**. Automation and Efficiency (20%) is heavy on **Splunk SOAR** playbooks — know the block types (action, filter, decision, format, prompt, utility, code), active vs input playbooks, and the ES adaptive-response-vs-SOAR boundary — plus the splunkd and SOAR **REST APIs**. Round it out with **CIM** normalization (Technical Add-ons, tags, eventtypes, data-model acceleration) and program metrics (MTTD/MTTR, detection coverage).

## Practice Exam — 250 Questions

Prepare for the Splunk Certified Cybersecurity Defense Engineer with our **250-question practice exam** covering all 5 exam domains. Every question is a real-world detection-engineering scenario with detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Splunk Certification Path

Splunk's security track builds on its core searching credentials. Start with the **Splunk Core Certified User** and **Splunk Core Certified Power User** (SPL, knowledge objects, data models, and the CIM), then earn the **Splunk Certified Cybersecurity Defense Analyst** (SOC operations, Enterprise Security, and Risk-Based Alerting). This exam — the **Splunk Certified Cybersecurity Defense Engineer** — is the professional, engineer-tier credential that follows: it covers detection engineering, data normalization, the detection lifecycle, threat-intelligence management, REST APIs, and Splunk SOAR playbook automation. Where the analyst investigates detections, the engineer builds and automates them.

## Study Tips

1. **Build detections hands-on in Splunk Enterprise Security** — a free Splunk trial plus the Splunk Enterprise Security sandbox is the fastest way to internalise correlation searches, the risk framework, notable/finding generation, and adaptive response
2. **Master the correlation-search / detection anatomy** — SPL, schedule, trigger conditions, throttling, and savedsearches.conf; know how to tune a noisy detection down without losing true positives
3. **Learn Risk-Based Alerting as an engineer** — risk modifiers, risk factors, the risk index, risk objects, and risk incident rules; be precise with the vocabulary
4. **Know Splunk SOAR playbooks** — the block types, active vs input playbooks, apps/assets/connectors, and when to use ES adaptive response vs a SOAR playbook
5. **Use our practice exam** — try the 20 free questions first to gauge your readiness, then work the full 250
6. **Review explanations** — don't just check if you got it right; read why each answer is correct and why the traps fail
7. **Check the official page** — [official exam details](https://www.splunk.com/en_us/training/certification-track/splunk-certified-cybersecurity-defense-engineer.html) always have the latest objectives
