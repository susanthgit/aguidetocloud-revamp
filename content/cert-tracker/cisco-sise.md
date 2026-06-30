---
title: "SISE: Implementing and Configuring Cisco ISE (300-715) — Free Study Guide"
description: "SISE 300-715: Implementing and Configuring Cisco Identity Services Engine (ISE). Free 250-question practice exam + study guide covering ISE architecture and deployment, 802.1X and MAB policy enforcement, TrustSec, web auth and guest services, profiling, BYOD, endpoint posture and compliance, and TACACS+ device administration."
type: "cert-tracker"
layout: "single"
exam_code: "SISE"
exam_title: "Cisco CCNP SISE (300-715)"
exam_level: "professional"
exam_status: "active"
exam_category: "Cisco"
vendor: "cisco"
manual: false
guided_slug: "cisco-sise"
---
## About the SISE Exam

> Master Cisco Identity Services Engine (ISE) — secure network access, profiling, guest, BYOD, posture, and device administration

The 300-715 SISE (Implementing and Configuring Cisco Identity Services Engine) is a CCNP Security concentration exam. It validates your ability to deploy, configure, and operate Cisco ISE for secure network access: node personas and distributed deployment, 802.1X and MAC Authentication Bypass with IBNS 2.0, Cisco TrustSec and Security Group Tags, policy sets and authorization, Central Web Authentication and guest and sponsor services, endpoint profiling and probes, BYOD onboarding with the internal CA, endpoint posture and compliance, and TACACS+ device administration. Passing SISE earns the Cisco Certified Specialist - Security Identity Management Implementation badge and, with the SCOR 350-701 core, the CCNP Security certification. Original practice questions. Not affiliated with, endorsed by, or sourced from Cisco Systems certification exams.

## Who Should Take This Exam?

SISE is designed for **network security engineers, identity and access administrators, and architects who deploy and operate Cisco ISE**. Cisco recommends 3-5 years of security-solution implementation experience; hands-on time with 802.1X, ISE policy sets, profiling, and posture helps a lot.

**Typical study time:** 6-10 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | 300-715 SISE |
| **Title** | Implementing and Configuring Cisco Identity Services Engine |
| **Duration** | 90 minutes |
| **Questions** | ~55-65 |
| **Pass Score** | Variable by exam form (Cisco does not publish a fixed cut score) |
| **Cost** | $300 USD |
| **Provider** | Pearson VUE |
| **Validity** | 3 years |
| **Question Types** | Multiple choice, Drag-and-drop, Simulation |

## Exam Domains & Weights

The SISE exam covers **7 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Architecture and Deployment | 10% | 25 |
| Policy Enforcement | 25% | 62 |
| Web Auth and Guest Services | 15% | 38 |
| Profiler | 15% | 37 |
| BYOD | 15% | 38 |
| Endpoint Compliance | 10% | 25 |
| Network Access Device Administration | 10% | 25 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Policy Enforcement** carries 25% — the single biggest slice — so start there and make sure you can walk the full secure-access flow in order: the endpoint hits **802.1X or MAB**, ISE evaluates the **policy set** (authentication, then authorization), and the result (VLAN, dACL, SGT, or web redirect) is applied — with a **Change of Authorization (CoA)** re-applying access after web auth, profiling, or posture. The three **IBNS 2.0** modes (Monitor, Low-Impact, Closed) and the **CWA** redirect flow are tested across multiple domains.

## Practice Exam — 250 Questions

Prepare for the SISE with our **250-question practice exam** covering all 7 exam domains. Every question is an original real-world Cisco ISE scenario with detailed explanations and maps to the official exam topics (v1.2, current Cisco ISE 3.x terminology).

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Cisco Certification Path

Cisco certs follow: Entry (CCT) → Associate (CCNA) → Professional (CCNP) → Expert (CCIE). CCNP Security requires the **SCOR 350-701** core exam plus **one concentration** — SISE 300-715 is the Identity Services Engine (secure network access) concentration.

## Related Cisco Certifications

If you're studying for the SISE, you might also be interested in these Cisco certifications:

- **[SCOR: Cisco CCNP SCOR (350-701)](/cert-tracker/cisco-scor/)** — the CCNP Security core that pairs with SISE — 200 practice questions
- **[SNCF: Securing Networks with Cisco Firewalls (300-710)](/cert-tracker/cisco-sncf/)** — the Secure Firewall concentration — 250 practice questions
- **[CyberOps: Cisco Certified CyberOps Associate (200-201)](/cert-tracker/cisco-cyberops/)** — 200 practice questions
- **[ENCOR: Cisco CCNP ENCOR (350-401)](/cert-tracker/cisco-encor/)** — 250 practice questions
- **[CCNA: Cisco Certified Network Associate (200-301)](/cert-tracker/cisco-ccna/)** — 250 practice questions

## Study Tips

1. **Start with Policy Enforcement (25%)** — 802.1X, MAB, policy sets, and authorization are the backbone of the exam
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Master the access flow** — authentication, authorization, the authorization result, and the CoA that re-applies access after web auth, profiling, or posture is the most-tested sequence
5. **Simulate exam conditions** — use the timed exam mode to practice under pressure
