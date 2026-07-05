---
title: "JNCIP-DC: Juniper professional exam — Free Study Guide"
description: "JNCIP-DC (JN0-683): the Juniper Networks Certified Professional, Data Center exam. Free 250-question practice exam plus a complete study guide covering EVPN-VXLAN IP fabrics, VXLAN, EVPN signaling, Data Center Interconnect, and multitenancy on Junos."
type: "cert-tracker"
layout: "single"
exam_code: "JNCIP-DC"
exam_title: "Juniper Networks Certified Professional Data Center (JNCIP-DC)"
exam_level: "advanced"
exam_status: "active"
exam_category: "Juniper"
vendor: "juniper"
manual: false
guided_slug: "juniper-jncip-dc"
---
## About the JNCIP-DC Exam

> Prove advanced EVPN-VXLAN data center fabrics on Junos (QFX and MX)

The **JNCIP-DC (exam JN0-683)** is the professional-level certification in Juniper's Data Center track, verified against **Junos OS 23.4**. It sits above JNCIS-DC and validates that you can design, configure, monitor, and troubleshoot a modern EVPN-VXLAN data center fabric — Layer 3 (Clos spine-leaf) IP fabrics, VXLAN, EVPN signaling and route types, Data Center Interconnect, and multitenancy with security. Our 250 original practice questions are character-driven Junos scenarios with detailed explanations and per-option rationale.

> Note: JN0-683 is the current JNCIP-DC exam code (it replaced the earlier JN0-682). It is a written, multiple-choice exam delivered at Pearson VUE — not a hands-on lab. This guide tracks the current JN0-683 blueprint on Junos OS 23.4.

## Who Should Take This Exam?

The JNCIP-DC is designed for **experienced data center networking professionals** who already hold or are ready for specialist-level Junos knowledge. Two or more years of hands-on Junos data center experience (IP fabrics and EVPN-VXLAN overlays) is recommended.

**Typical study time:** 8-12 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | JN0-683 |
| **Title** | Juniper Networks Certified Professional Data Center (JNCIP-DC) |
| **Duration** | 90 minutes |
| **Questions** | 65 |
| **Cost** | $400 USD |
| **Provider** | Pearson VUE |
| **Validity** | 3 years |
| **Junos Release** | 23.4 |
| **Question Types** | Multiple choice |

## Exam Domains & Practice-Question Coverage

The JNCIP-DC exam covers **6 official objective areas**. Juniper does not publish percentage weights for this exam, so the practice-question counts below reflect each area's topic breadth and hands-on depth.

| Domain | Practice Qs |
|--------|-------------|
| Data Center Deployment & Management (ZTP, DHCP relay, telemetry/JTI) | 28 |
| Layer 3 Fabrics (Clos spine-leaf, eBGP underlay, RDMA/RoCEv2 lossless CoS) | 48 |
| VXLAN (VTEP/VNI, encapsulation, control planes vs data plane) | 38 |
| EVPN-VXLAN Signaling (route types 1-5, MP-BGP, CRB vs ERB, symmetric IRB, multicast) | 62 |
| Data Center Interconnect (OTT vs gateway, Layer 2/Layer 3 stretch, stitching, Type-5 DCI) | 42 |
| Data Center Multitenancy & Security (MAC-VRF/IP-VRF, filter-based forwarding, group-based policy) | 32 |
| **Total** | **250** |

> 💡 **Study tip:** **EVPN-VXLAN Signaling** is by far the largest area — master the five EVPN route types (Type 2 MAC/IP, Type 3 inclusive-multicast/BUM, Type 5 IP-prefix are the most-tested), and be crystal-clear on **symmetric vs asymmetric IRB** (symmetric uses a shared per-VRF Layer 3 VNI, so a leaf need not host every Layer 2 VNI) and on **ERB vs CRB** gateway placement.

## Practice Exam — 250 Questions

Prepare for the JNCIP-DC with our **250-question practice exam** covering all 6 objective areas. Every question includes a realistic Junos data center scenario, a detailed explanation, and per-option rationale mapped to the exam blueprint.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Juniper Certification Path

Juniper follows: Associate (JNCIA) → Specialist (JNCIS) → Professional (JNCIP) → Expert (JNCIE). For the data center, the path is **JNCIA-Junos → JNCIS-DC → JNCIP-DC**.

## Related Juniper Certifications

If you're studying for the JNCIP-DC, you might also be interested in these Juniper certifications:

- **[JNCIA-JUNOS: Juniper Networks Certified Associate, Junos (JNCIA-Junos)](/cert-tracker/juniper-jncia-junos/)** — 250 practice questions
- **[JNCIP-ENT: Juniper Networks Certified Professional, Enterprise Routing and Switching (JNCIP-ENT)](/cert-tracker/juniper-jncip-ent/)** — 250 practice questions
- **[JNCIP-SEC: Juniper Networks Certified Professional, Security (JNCIP-SEC)](/cert-tracker/juniper-jncip-sec/)** — 250 practice questions

## Study Tips

1. **Draw the EVPN route types** — Type 1 (Ethernet A-D: aliasing + mass-withdraw), Type 2 (MAC/IP), Type 3 (inclusive multicast / BUM), Type 4 (Ethernet Segment / DF election), Type 5 (IP prefix). Knowing what each advertises is the single highest-yield skill.
2. **Symmetric vs asymmetric IRB** — symmetric routing uses a shared per-VRF Layer 3 (transit) VNI so only the destination VNI is needed at the egress leaf; asymmetric needs every VNI on the ingress leaf. This is the Junos-preferred model.
3. **Underlay before overlay** — be fluent in the eBGP IP fabric (unique AS per leaf, ECMP load balancing, BFD) and know when to reach for a lossless RDMA/RoCEv2 fabric (PFC + ECN + DCBX).
4. **Use our practice exam** — try the 20 free questions first to gauge your readiness.
5. **Simulate exam conditions** — use the timed exam mode to practice under pressure.
