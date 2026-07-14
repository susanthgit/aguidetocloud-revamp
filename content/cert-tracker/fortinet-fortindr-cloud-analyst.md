---
title: "Fortinet NSE 6 - FortiNDR Cloud 26 Analyst (NSE6_NDR_AN-26) — Free Study Guide"
description: "Fortinet NSE 6 - FortiNDR Cloud 26 Analyst (NSE6_NDR_AN-26): free 250-question practice exam + study guide covering FortiNDR Cloud architecture and sensors, protocol events and IQL (Intelligence Query Language) searches, detection analysis and tuning, and investigations, integrations and TTP-based threat hunting."
type: "cert-tracker"
layout: "single"
exam_code: "NSE6_NDR_AN-26"
exam_title: "Fortinet NSE 6 - FortiNDR Cloud 26 Analyst"
exam_level: "professional"
exam_status: "active"
exam_category: "Fortinet"
vendor: "fortinet"
manual: false
guided_slug: "fortinet-fortindr-cloud-analyst"
---
## About the NSE 6 - FortiNDR Cloud 26 Analyst Exam

> Use FortiNDR Cloud 26 to detect, search, analyze and hunt network threats — read the sensor metadata, write IQL queries, triage detections, and run investigations across your traffic

The NSE6_NDR_AN-26 (Fortinet NSE 6 - FortiNDR Cloud 26 Analyst) is a professional-level Fortinet exam that validates the applied skills of a SOC or network-detection analyst working in FortiNDR Cloud 26 — Fortinet's cloud-native network detection and response (NDR) platform, formerly known as ThreatINSIGHT. It covers the FortiNDR Cloud SaaS architecture, agentless sensors and metadata pipeline; building IQL (Intelligence Query Language) searches over Flow, DNS, HTTP, SSL, SMB and DCE/RPC event metadata with comparison operators, entity searches, regex, IN, LIKE and the exclude operator; analyzing detections by detector detail, severity and confidence and creating and tuning custom detectors; and running investigations with OSINT, VirusTotal, timelines and packet capture, integrating FortiEDR host isolation and the FortiNDR Cloud API, and performing TTP-based and ransomware threat hunting. Original practice questions. Not affiliated with, endorsed by, or sourced from Fortinet certification exams.

## Who Should Take This Exam?

The NSE 6 - FortiNDR Cloud 26 Analyst is designed for **security analysts, SOC analysts, and threat hunters responsible for detecting and investigating network threats with FortiNDR Cloud**. Fortinet recommends a minimum of **6 months of practical FortiNDR Cloud (or equivalent NDR) experience**. It is a strong step for analysts who want to prove hands-on network-detection-and-response skills — reading network metadata, writing IQL queries, and running end-to-end investigations — and it complements the expert-level NSE 7 - Security Operations Architect exam.

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Series** | NSE6_NDR_AN-26 |
| **Title** | Fortinet NSE 6 - FortiNDR Cloud 26 Analyst |
| **Product Version** | FortiNDR Cloud 26 |
| **Duration** | 70 minutes |
| **Questions** | 30-40 |
| **Pass Score** | Pass / fail (a score report is available from Pearson VUE; Fortinet does not publish a numeric cut score) |
| **Cost** | $200 USD |
| **Provider** | Pearson VUE |
| **Validity** | 2 years |
| **Question Types** | Multiple choice, Multiple select |

## Exam Domains & Weights

The NSE 6 - FortiNDR Cloud 26 Analyst exam covers **4 objective areas**. Fortinet publishes weight ranges for each area; the weights below sit within those ranges and are used to plan study time and practice-question depth.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Architecture and System Settings | 20% | 50 |
| Events and Queries | 30% | 75 |
| Detection | 20% | 50 |
| Investigations and Integrations | 30% | 75 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** This is an *analyst* exam — the focus is using FortiNDR Cloud, not designing the network. Get fluent in **IQL (Intelligence Query Language)**: it uses comparison operators (**=**, **==**, **IN**, **LIKE** with **%**/**_** wildcards, **MATCHES** for regex, and the **exclude** operator), dotted fields such as **src.ip**, **dst.ip** and **dst.port**, event-type filters like **event_type = 'flow'**, and event-type-qualified fields like **dns:query.domain** and **http:host**. Know the **protocol events** (Flow, DNS, HTTP, SSL, SMB, DCE/RPC) and what each one's metadata reveals — and remember FortiNDR Cloud is **metadata-first**: full packets are not retained; a **PCAP** exists only when a **packet-capture task** on a sensor matches traffic. On the response side, separate a **detection** from a lower-level **behavioral observation**, know the official **resolution states** (True Positive: Mitigated, True Positive: No Action, False Positive), and remember **FortiEDR** performs host isolation while the **FortiNDR Cloud API** and connector forward detections into the **Fortinet Security Fabric** and to SIEM/SOAR.

## Practice Exam — 250 Questions

Prepare for the NSE 6 - FortiNDR Cloud 26 Analyst with our **250-question practice exam** covering all 4 objective areas. Every question is an original SOC analyst-level scenario built around FortiNDR Cloud 26 with detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Fortinet Certification Path

Fortinet certifications run from Associate through Professional and Solution Specialist up to Expert. The NSE 6 - FortiNDR Cloud 26 Analyst is a professional-tier exam in the Security Operations solution area, focused on network detection and response. It pairs naturally with the FortiSIEM analyst and Security Operations architect exams, and Fortinet recommends the FortiNDR Cloud analyst training plus hands-on experience with FortiNDR Cloud 26.

## Related Fortinet Certifications

If you're studying for the NSE 6 - FortiNDR Cloud 26 Analyst, you might also be interested in these Fortinet certifications:

- **[NSE6-FSM: Fortinet NSE 6 - FortiSIEM 7.4 Analyst](/cert-tracker/fortinet-fsm-analyst/)** — the SOC analyst exam on FortiSIEM 7.4 search, rules, incidents and UEBA — practice exam
- **[NSE7-SOC: Fortinet NSE 7 - Security Operations 7.6 Architect](/cert-tracker/fortinet-fcss-security-operations/)** — the expert-level SOC architect exam on FortiSIEM and FortiSOAR — practice exam
- **[NSE7-CDS: Fortinet NSE 7 - Public Cloud Security 7.6.4 Architect](/cert-tracker/fortinet-nse7-public-cloud-security/)** — securing AWS and Azure workloads with FortiGate-VM and FortiCNAPP — practice exam

## Study Tips

1. **Think like an analyst, not an architect** — for every task, ask "how do I *detect, search, or investigate* this in FortiNDR Cloud?" (sensors + IQL + detections + investigations), not "how do I design the network?"
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Master IQL** — comparison operators, dotted fields (src.ip/dst.ip/dst.port), event_type filters, event-type-qualified fields (dns:query.domain, http:host), regex with MATCHES, wildcard LIKE, IN lists, and the exclude operator; know entity search vs event search
4. **Know the protocol events** — Flow, DNS, HTTP, SSL/TLS, SMB and DCE/RPC, the key fields of each, and the threats each surfaces (DNS tunneling, HTTP beaconing, JA3 fingerprints, SMB lateral movement) — and that FortiNDR Cloud is metadata-first with task-based packet capture
5. **Separate detection from investigation from response** — detector severity/confidence and behavioral observations, the official resolution states, custom-detector tuning to cut false positives, and where OSINT, VirusTotal, the FortiNDR Cloud connector, FortiEDR host isolation and the API fit the workflow
6. **Simulate exam conditions** — use the timed exam mode to practice reasoning about IQL search logic and detection triage under pressure
