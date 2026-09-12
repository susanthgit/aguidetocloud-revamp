---
title: "Cisco SCOR 350-701"
description: "Short version: you were right, it was 250, not 200. Our page said 200, which was our own stale copy. And no, they were not updated for v2.0. They are now…"
date: 2026-09-03T07:30:42.000Z
lastmod: 2026-09-06T20:15:35.000Z
slug: "cisco-scor-350-701"
ask_number: 45
ask_category: "Question"
ask_asker: "Sweety Advani"
ask_discussion_url: "https://github.com/susanthgit/aguidetocloud-feedback/discussions/45"
ask_question: "Are those Questions 250, on the latest v2 that Cisco announced on 26th August 2026? Are they updated?"
ask_answer_count: 2
ask_answer_plain: "Short version: you were right, it was 250, not 200. Our page said 200, which was our own stale copy. And no, they were not updated for v2.0. They are now, and the bank is 300. Thanks for pushing on this. It turned into a proper piece of work. On the count. You counted correctly. The bank held 250 while our page still said 200, because that line had not been updated since the bank grew. Fixed, and the page now says 300. On the dates. Close, slightly off. 26 August 2026 was the last day to test on v1.1. 27 August was the first day on v2.0. Cisco announced the change back in February and ran a live session on 13 August. On whether they were updated. They were not. The bank was written to the v1.1 blueprint, and v2.0 is a bigger change than a version bump. Cisco's own wording: \"If you've been studying against v1.1 material, treat SCOR v2.0 as new content rather than a refresh.\" Two changes mattered for us. Cisco deleted the Content Security domain, and added Secure Service Edge at 10%, which we had nothing on at all. Network Security also rose from 20% to 25%, and Endpoint Protection from 10% to 15%. So we wrote 50 new questions against the official v2.0 objectives: - 25 on Secure Service Edge, covering SSE and SASE, Cisco Secure Access internet and private access, data loss prevention and AI guardrails, and reading Investigate scores - 15 on Network Security, aimed at what v2.0 added: Security Cloud Control, CIS benchmarks, and VPN tunnel troubleshooting on Secure Firewall - 10 on Endpoint Protection, including the new Email Threat Defense objective The bank is now 300, and the domain weights on the page match the real v2.0 exam: | Domain | v2.0 weight | Practice Qs | |---|---|---| | Security Concepts | 20% | 59 | | Network Security | 25% | 64 | | Cloud Security | 15% | 38 | | Secure Service Edge (new) | 10% | 25 | | Endpoint Protection and Detection | 15% | 38 | | Network Access, Visibility, and Enforcement | 15% | 38 | | Content Security (v1.1 only, not tested in v2.0) | not tested | 38 | | Total | | 300 | On the old Content Security questions. We kept them. Cisco removed that domain so they are not on the current exam, and they are labelled that way, but deleting 38 working questions seemed worse than keeping them as background. Much of that material now lives inside Secure Service Edge and email threat defence anyway. One more thing: Cisco's own SCOR practice exam is not out yet either. Their published timeline puts it late 2026. Thanks again for asking. This is exactly the kind of thing that is easy to miss from the inside. Hi Elf2211, thanks for this. You're right: domain names and percentages tell you how the exam is split, but not what you're actually learning. The SCOR cert-tracker page currently gives the weights and practice-question counts. It doesn't have separate, detailed lessons for each domain. Here's a plain-English breakdown of the six v2.0 domains: 1. Security Concepts — 20% This is the foundation: how attacks work and why particular defences help. It covers threats such as phishing and AI prompt injection, along with software vulnerabilities. You also learn protective technologies and concepts: encryption and certificates, VPN types and zero trust. Think: what is the risk, and which kind of protection addresses it? 2. Network Security — 25% This is about protecting traffic and the equipment carrying it. You configure and troubleshoot firewalls, intrusion prevention, VPNs, network separation and secure device administration. Cisco Security Cloud Control and device-hardening guidance are included too. Think: why is this VPN failing, or which firewall rule should allow this traffic? 3. Cloud Security — 15% This is about securing applications, data and workloads hosted in the cloud. It includes the split of responsibilities between you and the cloud provider, cloud security tools, collecting logs in Splunk, and building security into software development. Think: the provider runs the platform, but what must we still secure ourselves? 4. Secure Service Edge — 10% This is cloud-delivered protection for access to the internet and private applications. You study SSE versus SASE, Cisco Secure Access, preventing sensitive data from leaving, AI guardrails, and interpreting Investigate scores. Think: how do we protect someone working remotely while they browse the web or access an internal app? 5. Endpoint Protection and Detection — 15% This focuses on devices such as laptops and servers: knowing what is connected, checking its security condition, preventing malware and understanding detection events. Cisco Secure Endpoint, Secure Client and malware analysis feature here. Email Threat Defense is also part of this domain in v2.0. Think: what is happening on this device, and is it adequately protected? 6. Network Access, Visibility, and Enforcement — 15% This brings together who or what can connect, the conditions for access, and what you can see happening afterwards. It includes Cisco ISE, 802.1X, devi"
sitemap:
  priority: 0.6
  changefreq: "monthly"
---
<!-- generated by scripts/sync-ask.mjs — do not edit by hand -->

## The question

Are those Questions 250, on the latest v2 that Cisco announced on 26th August 2026? Are they updated?

## The answer

**Short version:** you were right, it was 250, not 200. Our page said 200, which was our own stale copy. And no, they were not updated for v2.0. They are now, and the bank is 300.

Thanks for pushing on this. It turned into a proper piece of work.

**On the count.** You counted correctly. The bank held 250 while our page still said 200, because that line had not been updated since the bank grew. Fixed, and the page now says 300.

**On the dates.** Close, slightly off. 26 August 2026 was the last day to test on v1.1. 27 August was the first day on v2.0. Cisco announced the change back in February and ran a live session on 13 August.

**On whether they were updated.** They were not. The bank was written to the v1.1 blueprint, and v2.0 is a bigger change than a version bump. Cisco's own wording: "If you've been studying against v1.1 material, treat SCOR v2.0 as new content rather than a refresh."

Two changes mattered for us. Cisco deleted the Content Security domain, and added Secure Service Edge at 10%, which we had nothing on at all. Network Security also rose from 20% to 25%, and Endpoint Protection from 10% to 15%.

So we wrote 50 new questions against the official v2.0 objectives:

- 25 on **Secure Service Edge**, covering SSE and SASE, Cisco Secure Access internet and private access, data loss prevention and AI guardrails, and reading Investigate scores
- 15 on **Network Security**, aimed at what v2.0 added: Security Cloud Control, CIS benchmarks, and VPN tunnel troubleshooting on Secure Firewall
- 10 on **Endpoint Protection**, including the new Email Threat Defense objective

The bank is now 300, and the domain weights on the page match the real v2.0 exam:

| Domain | v2.0 weight | Practice Qs |
|---|---|---|
| Security Concepts | 20% | 59 |
| Network Security | 25% | 64 |
| Cloud Security | 15% | 38 |
| Secure Service Edge *(new)* | 10% | 25 |
| Endpoint Protection and Detection | 15% | 38 |
| Network Access, Visibility, and Enforcement | 15% | 38 |
| Content Security *(v1.1 only, not tested in v2.0)* | not tested | 38 |
| **Total** | | **300** |

**On the old Content Security questions.** We kept them. Cisco removed that domain so they are not on the current exam, and they are labelled that way, but deleting 38 working questions seemed worse than keeping them as background. Much of that material now lives inside Secure Service Edge and email threat defence anyway.

One more thing: Cisco's own SCOR practice exam is not out yet either. Their published timeline puts it late 2026.

Thanks again for asking. This is exactly the kind of thing that is easy to miss from the inside.

Hi Elf2211, thanks for this. You're right: domain names and percentages tell you how the exam is split, but not what you're actually learning.

The [SCOR cert-tracker page](https://www.aguidetocloud.com/cert-tracker/cisco-scor/#exam-domains--weights) currently gives the weights and practice-question counts. It doesn't have separate, detailed lessons for each domain. Here's a plain-English breakdown of the six v2.0 domains:

**1. Security Concepts — 20%**

This is the foundation: how attacks work and why particular defences help. It covers threats such as phishing and AI prompt injection, along with software vulnerabilities. You also learn protective technologies and concepts: encryption and certificates, VPN types and zero trust. Think: *what is the risk, and which kind of protection addresses it?*

**2. Network Security — 25%**

This is about protecting traffic and the equipment carrying it. You configure and troubleshoot firewalls, intrusion prevention, VPNs, network separation and secure device administration. Cisco Security Cloud Control and device-hardening guidance are included too. Think: *why is this VPN failing, or which firewall rule should allow this traffic?*

**3. Cloud Security — 15%**

This is about securing applications, data and workloads hosted in the cloud. It includes the split of responsibilities between you and the cloud provider, cloud security tools, collecting logs in Splunk, and building security into software development. Think: *the provider runs the platform, but what must we still secure ourselves?*

**4. Secure Service Edge — 10%**

This is cloud-delivered protection for access to the internet and private applications. You study SSE versus SASE, Cisco Secure Access, preventing sensitive data from leaving, AI guardrails, and interpreting Investigate scores. Think: *how do we protect someone working remotely while they browse the web or access an internal app?*

**5. Endpoint Protection and Detection — 15%**

This focuses on devices such as laptops and servers: knowing what is connected, checking its security condition, preventing malware and understanding detection events. Cisco Secure Endpoint, Secure Client and malware analysis feature here. Email Threat Defense is also part of this domain in v2.0. Think: *what is happening on this device, and is it adequately protected?*

**6. Network Access, Visibility, and Enforcement — 15%**

This brings together who or what can connect, the conditions for access, and what you can see happening afterwards. It includes Cisco ISE, 802.1X, device compliance, Duo, signs of data being taken out, and security monitoring with Splunk and Cisco XDR. Think: *should this user and device be allowed in, and how would we spot suspicious activity?*

For the individual subtopics, [Cisco's official v2.0 exam blueprint (PDF)](https://learningcontent.cisco.com/documents/marketing/exam-topics/350-701-SCOR-v2.0.pdf) is the checklist behind this breakdown.

One distinction worth keeping in mind: **Content Security is no longer a separate v2.0 domain, but email security has not disappeared** — Email Threat Defense is included in domain 5.
