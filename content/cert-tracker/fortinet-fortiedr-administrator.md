---
title: "Fortinet NSE 6 - FortiEDR 7.0 Administrator (NSE6_EDR_AD-7.0) — Free Study Guide"
description: "Fortinet NSE 6 - FortiEDR 7.0 Administrator (NSE6_EDR_AD-7.0): free 250-question practice exam + study guide covering FortiEDR architecture (Central Manager, Core, Aggregator, Collectors, and the Fortinet Cloud Service), deployment and collector groups, the Execution, Exfiltration, Ransomware, and Device Control security policies, Simulation vs Prevention mode, Communication Control, automated-response Playbooks, event classification and incident handling, Forensics and Threat Hunting, Security Fabric and FortiXDR integration, and troubleshooting."
type: "cert-tracker"
layout: "single"
exam_code: "NSE6_EDR_AD-7.0"
exam_title: "Fortinet NSE 6 - FortiEDR 7.0 Administrator"
exam_level: "professional"
exam_status: "active"
exam_category: "Fortinet"
vendor: "fortinet"
manual: false
guided_slug: "fortinet-fortiedr-administrator"
---
## About the NSE 6 - FortiEDR 7.0 Administrator Exam

> Deploy and operate FortiEDR to protect endpoints end to end — install collectors, configure the security policies and Playbooks, classify and investigate security events with Forensics and Threat Hunting, integrate with the Security Fabric and FortiXDR, and troubleshoot the platform

The NSE6_EDR_AD-7.0 (Fortinet NSE 6 - FortiEDR 7.0 Administrator) is a professional-level Fortinet exam that validates the applied skills of a security administrator, SOC analyst, or endpoint engineer operating FortiEDR — Fortinet's endpoint protection and detection-and-response platform (originally the acquired enSilo product) that combines next-generation antivirus, real-time post-execution protection, automated incident response, and threat hunting across Windows, macOS, and Linux endpoints. It covers system architecture, deployment, and administration (the Central Manager, Core, Aggregator, Collector, and Fortinet Cloud Service components; on-premises versus cloud deployment; collector groups and installation; console users, RBAC roles, multi-tenancy, and the REST API); security policies, Communication Control, and Playbooks (Execution Prevention, Exfiltration Prevention, Ransomware Prevention, Device Control, Application Control, Mobile Devices, and the eXtended Detection Policy; Simulation versus Prevention mode and Block versus Log rule actions; application communication control; exceptions; and automated-response Playbooks); events, incident response, Forensics, and Threat Hunting (event classification, incident handling, attack-chain Forensics and memory retrieval, and scheduled threat-hunting queries); Security Fabric, FortiXDR, and automation integrations (FortiGate, FortiSandbox, FortiSIEM, and NAC connectors, endpoint isolation and network containment, and REST-API automation); and troubleshooting and operational analysis. Original practice questions. Not affiliated with, endorsed by, or sourced from Fortinet certification exams.

## Who Should Take This Exam?

The NSE 6 - FortiEDR 7.0 Administrator is designed for **security administrators, SOC analysts, and endpoint engineers responsible for deploying, operating, investigating with, and troubleshooting FortiEDR** in an organization. Fortinet recommends roughly three years of endpoint-security experience plus network-security and NGAV or endpoint-management-server experience. It is a strong step for practitioners who want to prove applied endpoint-detection-and-response skills — installing and grouping collectors, tuning the security policies from Simulation into Prevention, building automated-response Playbooks, triaging and classifying security events, running attack-chain Forensics and threat hunts, and integrating FortiEDR into the Fortinet Security Fabric and FortiXDR. It complements the FortiDLP endpoint data-loss-prevention exam in the same NSE 6 tier and the Security Operations and FortiNDR Cloud detection exams.

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Series** | NSE6_EDR_AD-7.0 |
| **Title** | Fortinet NSE 6 - FortiEDR 7.0 Administrator |
| **Product Version** | FortiEDR 7.0 |
| **Duration** | 70 minutes |
| **Questions** | 30-35 |
| **Pass Score** | Pass / fail (a score report is available from your Pearson VUE account; Fortinet does not publish a numeric cut score) |
| **Cost** | $200 USD |
| **Provider** | Pearson VUE |
| **Validity** | 2 years |
| **Question Types** | Multiple choice, Drag and drop |

## Exam Domains & Weights

The NSE 6 - FortiEDR 7.0 Administrator exam covers **5 objective areas** drawn from the FortiEDR Administrator course. Fortinet does not publish percentage weights for this exam; the weights below are planning estimates based on the breadth of each area and are used to plan study time and practice-question depth.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| System, Architecture, Deployment, and Administration | 21.6% | 54 |
| Security Policies, Communication Control, and Playbooks | 24% | 60 |
| Events, Incident Response, Forensics, and Threat Hunting | 28% | 70 |
| Security Fabric, FortiXDR, and Automation Integrations | 12% | 30 |
| Troubleshooting and Operational Analysis | 14.4% | 36 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** This is an *administrator* exam — the focus is deploying, configuring, operating, and troubleshooting FortiEDR. First, get the **architecture and the enforcement flow** straight: the **Core** is the security-policy enforcer that authorizes or denies connection-establishment requests, the **Aggregator** proxies and scales collector communication, the **Central Manager** is the management console, the **Collector** is the endpoint agent, and the **Fortinet Cloud Service (FCS)** enriches and can reclassify events. Nail the **policy modes** — **Simulation (Notification Only)** logs and alerts but does **not** block (it is the default), while **Prevention** actively blocks; a *Block* rule only blocks in Prevention (in Simulation it creates a simulated-blocking event), and a *Log* rule never blocks. Know the **out-of-the-box policies** — Application Control, Device Control, Execution Prevention, Exfiltration Prevention, Mobile Devices, Ransomware Prevention, and the eXtended Detection Policy — and keep **Communication Control** (controls an application's external *communication*) separate from **Application Control** (blocks an application from *launching*). Learn the exact **event classifications** (Malicious, Suspicious, Inconclusive, PUP, Likely Safe, Safe) and remember that **Playbook** columns are Malicious, Suspicious, PUP, Inconclusive, and Likely Safe (not Safe), that remediation follows the **final FCS classification**, and that **Threat Hunting** queries collected *activity events* while **Forensics** investigates a single security event's attack chain. FortiEDR is the former **enSilo** platform, so it provides real-time post-execution protection — it can block malicious outbound communication even after a file has run.

## Practice Exam — 250 Questions

Prepare for the NSE 6 - FortiEDR 7.0 Administrator with our **250-question practice exam** covering all 5 objective areas. Every question is an original administrator-level scenario built around FortiEDR 7.0 with detailed explanations and maps to the official exam objectives.

**What you get:**

- ✅ 250 exam-style questions across all 5 domains
- ✅ Detailed explanations for every question — learn *why* each answer is right
- ✅ Timed exam mode and untimed practice mode
- ✅ Progress tracking and per-domain scoring
- ✅ Works on desktop and mobile — study anywhere
- ✅ 20 free questions — no account needed

## Fortinet Certification Path

Fortinet certifications run from Associate through Professional and Solution Specialist up to Expert. The NSE 6 - FortiEDR 7.0 Administrator is a professional-tier exam focused on endpoint detection and response. Fortinet recommends the FortiEDR Administrator training plus hands-on experience administering FortiEDR.

## Related Fortinet Certifications

If you're studying for the NSE 6 - FortiEDR 7.0 Administrator, you might also be interested in these Fortinet certifications:

- **[Security Operations: Fortinet NSE 7 - Security Operations](/cert-tracker/fortinet-fcss-security-operations/)** — the SOC exam on FortiSIEM and FortiSOAR that correlates and responds to the endpoint events FortiEDR raises — practice exam
- **[FortiNDR Cloud: Fortinet NSE 6 - FortiNDR Cloud Analyst](/cert-tracker/fortinet-fortindr-cloud-analyst/)** — the network detection and response exam that pairs with endpoint EDR for extended detection — practice exam
- **[FortiDLP: Fortinet NSE 6 - FortiDLP 26 Administrator](/cert-tracker/fortinet-fortidlp-administrator/)** — the cloud-native endpoint data-loss-prevention and insider-risk exam in the same NSE 6 tier — practice exam

## Study Tips

1. **Think like an administrator** — for every task, ask "which FortiEDR component, policy, mode, or subsystem does this?" (Core vs Aggregator vs Central Manager; Execution vs Exfiltration vs Ransomware vs Device Control; Simulation vs Prevention), not just "what is EDR?"
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Master the architecture and enforcement flow** — the Core makes the block/allow decision, the Collector enforces it at the endpoint, the Aggregator proxies collector traffic, the Central Manager is the console, and the Fortinet Cloud Service (FCS) enriches and can reclassify events
4. **Know the policies and modes cold** — the seven out-of-the-box policies (Application Control, Device Control, Execution Prevention, Exfiltration Prevention, Mobile Devices, Ransomware Prevention, eXtended Detection Policy), Simulation (Notification Only, the default) versus Prevention, and Block versus Log rule actions (a Block rule only blocks in Prevention)
5. **Separate the subsystems** — Communication Control governs an application's external communication while Application Control blocks it from launching; Threat Hunting queries collected activity events while Forensics investigates a single security event's attack chain; a Playbook automates the response
6. **Learn the events-to-response workflow** — the classifications (Malicious, Suspicious, Inconclusive, PUP, Likely Safe, Safe), incident handling, the Playbook action set (Notification, Investigation, Remediation, Custom), remediation based on the final FCS classification, and exceptions for false positives
7. **Simulate exam conditions** — use the timed exam mode to practise reasoning about component responsibilities, policy modes, event classification, investigation, and troubleshooting under pressure
