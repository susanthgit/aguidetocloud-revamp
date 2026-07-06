---
title: "JNCIA-Design: Juniper associate network design exam — Free Study Guide"
description: "JNCIA-Design (JN0-1103): the Juniper Networks Certified Associate - Design exam. 250-question practice exam + complete study guide covering network design requirements and Juniper product roles, zero trust and SASE, HA and redundancy, campus LAN and wireless design, WAN and SD-WAN, and data center EVPN-VXLAN IP fabric design."
type: "cert-tracker"
layout: "single"
exam_code: "JNCIA-DESIGN"
exam_title: "Juniper Networks Certified Associate - Design (JNCIA-Design)"
exam_level: "associate"
exam_status: "active"
exam_category: "Juniper"
vendor: "juniper"
manual: false
guided_slug: "juniper-jncia-design"
faq_intro: "The JNCIA-Design questions I get most — usually from network engineers, pre-sales solution engineers, and architects who are moving from 'configuring the box' to 'designing the network' and want to know what the associate design exam actually tests."
faq:
  - question: "What does JNCIA-Design actually cover?"
    answer: "The current JNCIA-Design (JN0-1103) is Juniper's foundational network-design exam. Six areas: gathering customer design requirements and the roles Juniper routers, switches, security, and wireless solutions play; securing the network (defense-in-depth, zero trust, and SASE as design concepts); network management and reliability (high-availability design, link and device redundancy, ESI-LAG multihoming, Virtual Chassis, and where automation fits); campus and branch LAN design (wired plus a full wireless/RF design section); campus and branch WAN and SD-WAN design; and data center design, including EVPN-VXLAN IP fabrics. It is about design decisions and tradeoffs, not configuration syntax."
  - question: "Is JNCIA-Design a hands-on configuration exam, or a concepts exam?"
    answer: "It is a concepts-and-decisions exam, not a configuration exam. You will not be asked to type Junos CLI. Instead you pick the right design approach for a requirement: which product role fits, 2-tier collapsed-core versus 3-tier versus a campus fabric, when to use ESI-LAG for multihoming, eBGP versus OSPF for an IP-fabric underlay, or where zero trust and SASE belong. If you can reason about tradeoffs and best practices you are in the right headspace — deep protocol internals live in the JNCIS and JNCIP exams, not here."
  - question: "What is the exam format, and how hard is it?"
    answer: "It is an associate-level exam: 65 multiple-choice questions in 90 minutes at Pearson VUE, no lab, and no hard prerequisite. It suits people with roughly 6 to 12 months of general networking exposure who are starting to think about design. Expect scenario questions — a designer choosing an architecture, a redundancy mechanism, or a product role for a stated constraint — rather than memorization trivia. Plan on roughly 4 to 8 weeks of part-time study."
  - question: "How much does JNCIA-Design cost, and how long is it valid?"
    answer: "USD $200 via Pearson VUE. Juniper often runs free or discounted voucher promotions through the [Juniper Open Learning portal](https://learning.juniper.net/) — create a free account, take the free on-demand JNCIA-Design course, and watch for promo emails. The certification is valid for 3 years and is renewed by passing the current version again or by moving up the Juniper certification ladder."
  - question: "Does Juniper publish domain weights, and who is this exam for?"
    answer: "Juniper lists the six objective areas but does not publish official percentage weights for JN0-1103, so the weights in this guide are study guidance based on objective breadth — every area can appear on the exam. It sits at the Associate level of the Juniper ladder and pairs naturally with JNCIA-Junos if you want the platform foundation alongside the design foundation. It is a strong fit for pre-sales solution engineers, network designers, and anyone who writes or responds to network design proposals."
---
## About the JNCIA-DESIGN Exam

> Associate-level Juniper network design certification (exam JN0-1103) - customer network design requirements and Juniper product roles, securing the network (zero trust and SASE), network management and reliability (HA, redundancy, automation), campus and branch LAN design (wired and wireless), campus and branch WAN and SD-WAN design, and data center IP fabric design

250 original practice questions for the Juniper Networks Certified Associate - Design (JNCIA-Design, exam JN0-1103). Covers customer network design requirements (the Juniper life-cycle service approach, proposal boundaries, greenfield vs brownfield, top-down design, capacity planning, and the roles of Juniper routers, switches, security, WLAN, SDN, and management solutions), securing the network (defense-in-depth, data center and campus WAN security, zero-trust, and SASE), network management and reliability (high-resiliency design, link and device redundancy, ESI-LAG multihoming, Virtual Chassis, network automation benefits and Juniper automation products, APIs, and management strategies), campus and branch LAN design (LAN best practices, modular design, VLAN and access-control design, EVPN-VXLAN campus architecture, oversubscription, and full WLAN/RF design), campus and branch WAN design (transport types, WAN VPN, HA, and SD-WAN with Session Smart Routing and WAN Assurance), and data center network design (traffic patterns, Clos spine-and-leaf fabric, IP fabric underlay/overlay, routing-protocol selection, and IP fabric scaling). Each question is a realistic network-design scenario with a named designer, a detailed explanation, and per-option rationale.

## Who Should Take This Exam?

The JNCIA-Design is designed for **network engineers, pre-sales solution engineers, and aspiring network architects** who are moving from configuring devices to designing networks. There is no hard prerequisite; a general networking foundation (and ideally JNCIA-Junos) helps, but the exam tests design reasoning — product roles, architecture choices, redundancy, and tradeoffs — rather than hands-on configuration.

**Prerequisites:** None (JNCIA-Design is the associate entry point of the Juniper Design track)

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | JN0-1103 |
| **Title** | Juniper Networks Certified Associate - Design (JNCIA-Design) |
| **Duration** | 90 minutes |
| **Questions** | 65 |
| **Cost** | $200 USD |
| **Provider** | Pearson VUE |
| **Validity** | 3 years |
| **Prerequisites** | None (JNCIA-Design is the associate entry point of the Juniper Design track) |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Juniper →](https://www.juniper.net/us/en/training/certification/tracks/design/jncia-design.html) |

## Exam Domains & Weights

The JNCIA-DESIGN exam covers **6 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Customer Network Design Requirements | 18% | 44 |
| Securing the Network | 14% | 34 |
| Network Management or Reliability | 18% | 46 |
| Campus and Branch LAN Design | 20% | 50 |
| Campus and Branch WAN Design | 14% | 36 |
| Data Center Network Design | 16% | 40 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Campus and Branch LAN Design** carries the most weight (20%) — start there, and make sure the wireless/RF design half is solid, not just the wired side. Juniper does not publish official percentage weights for JN0-1103, so treat these as study guidance based on objective breadth: every one of the six areas can appear on the exam, so don't skip the lighter ones like Securing the Network or Campus and Branch WAN.

## Practice Exam — 250 Questions

Prepare for the JNCIA-DESIGN with our **250-question practice exam** covering all 6 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Juniper Certification Path

Juniper follows: Associate (JNCIA) → Specialist (JNCIS) → Professional (JNCIP) → Expert (JNCIE). Start with JNCIA-Junos.

## Related Juniper Certifications

If you're studying for the JNCIA-DESIGN, you might also be interested in these Juniper certifications:

- **[JNCIA-JUNOS: Juniper Networks Certified Associate, Junos (JNCIA-Junos)](/cert-tracker/juniper-jncia-junos/)** — 250 practice questions
- **[JNCIA-SEC: Juniper Networks Certified Associate - Security (JNCIA-SEC)](/cert-tracker/juniper-jncia-sec/)** — 250 practice questions
- **[JNCIA-CLOUD: Juniper Networks Certified Associate - Cloud (JNCIA-Cloud)](/cert-tracker/juniper-jncia-cloud/)** — 250 practice questions
- **[JNCIS-ENT: Juniper Networks Certified Specialist, Enterprise Routing and Switching (JNCIS-ENT)](/cert-tracker/juniper-jncis-ent/)** — 250 practice questions
- **[JNCIS-SEC: Juniper Networks Certified Specialist Security (JNCIS-SEC)](/cert-tracker/juniper-jncis-sec/)** — 250 practice questions

## Study Tips

1. **Start with the heaviest domain** — focus your time where the exam focuses its questions
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
5. **Check the official page** — [official exam details](https://www.juniper.net/us/en/training/certification/tracks/design/jncia-design.html) always have the latest objectives
