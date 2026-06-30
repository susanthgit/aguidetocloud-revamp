---
title: "ENAUTO: Implementing Cisco Enterprise Network Automation Solutions (300-435) — Free Study Guide"
description: "ENAUTO 300-435 (v2.0): the Cisco CCNP Enterprise / CCNP Automation concentration for enterprise network automation. Free 250-question practice exam + study guide covering YANG/NETCONF/RESTCONF foundations; device-level automation with Python (Netmiko, ncclient, napalm), Ansible, Day-0 ZTP/PnP and on-box EEM/Guest Shell; controller automation of Catalyst Center, Catalyst SD-WAN Manager and the Meraki Dashboard API with advanced Jinja2; operations with pyATS, Cisco Modeling Labs, telemetry and AIOps; and AI in automation including FastMCP."
type: "cert-tracker"
layout: "single"
exam_code: "ENAUTO"
exam_title: "Implementing Cisco Enterprise Network Automation Solutions (300-435)"
exam_level: "professional"
exam_status: "active"
exam_category: "Cisco"
vendor: "cisco"
manual: false
guided_slug: "cisco-enauto"
---
## About the ENAUTO Exam

> Automate enterprise networks end to end — at the device, at the controller, and with AI

The 300-435 ENAUTO (Implementing Cisco Enterprise Network Automation Solutions, exam topics **v2.0**) is a **CCNP concentration exam** — pair it with the ENCOR 350-401 core for **CCNP Enterprise**, or with the AUTOCOR 350-901 core for **CCNP Automation**. Passing also earns the **Cisco Certified Specialist - Enterprise Automation and Programmability** credential. It validates your ability to automate enterprise networks across two layers: programming devices directly with Python (Netmiko, ncclient, napalm, RESTCONF), Ansible, Day-0 ZTP/PnP, and on-box EEM/Guest Shell/Python; and automating Cisco's controllers — the **Catalyst Center** (formerly DNA Center) Intent API, the **Catalyst SD-WAN Manager** (formerly vManage) REST API, and the **Meraki Dashboard API** — with advanced Jinja2. It also covers the YANG/NETCONF/RESTCONF foundation, operations (platform-API validation, Cisco Modeling Labs, pyATS, model-driven telemetry, AIOps), and the new **AI in Automation** domain — AI-assisted coding, AI security risk, and building an MCP server with Python FastMCP. Original practice questions. Not affiliated with, endorsed by, or sourced from Cisco Systems certification exams.

## Who Should Take This Exam?

ENAUTO is designed for **network engineers, NetDevOps and automation engineers, and platform/SRE staff who automate Cisco enterprise networks** — campus, branch, SD-WAN, and cloud-managed estates. It suits candidates pursuing CCNP Enterprise or CCNP Automation. Cisco recommends 3-5 years of enterprise networking experience plus hands-on time with Python, Ansible, Jinja2, and Cisco programmability (NETCONF/RESTCONF/YANG, Catalyst Center, Catalyst SD-WAN Manager, Meraki Dashboard API, pyATS).

**Typical study time:** 8-12 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | 300-435 ENAUTO |
| **Title** | Implementing Cisco Enterprise Network Automation Solutions |
| **Version** | v2.0 (effective 3 Feb 2026) |
| **Duration** | 90 minutes |
| **Questions** | ~55-65 |
| **Pass Score** | Variable by form (Cisco does not publish a fixed cut score) |
| **Cost** | $300 USD |
| **Provider** | Pearson VUE |
| **Validity** | 3 years |
| **Question Types** | Multiple choice, Drag-and-drop, Simulation |

## Exam Domains & Weights

The ENAUTO exam covers **5 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Network Automation Foundation | 10% | 25 |
| Device-Level Network Automation | 25% | 62 |
| Controller-Based Network Automation | 30% | 75 |
| Operations | 20% | 50 |
| AI in Automation | 15% | 38 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Controller-Based Network Automation** is the heaviest domain at 30% — be fluent in the auth flow and a real request for each controller: Catalyst Center (token to `X-Auth-Token`, `/dna/intent/api/v1/...`, task polling), Catalyst SD-WAN Manager (`/j_security_check` session + `X-XSRF-TOKEN`, `/dataservice/...`), and Meraki (`X-Cisco-Meraki-API-Key`, org → network → device, 429 + Retry-After). Add **Device-Level** (25%) and together that is 55% of the exam. The new **AI in Automation** domain (15%) is fresh in v2.0 — know AI-assisted-code risk (data privacy, IP, validating output) and how to build an MCP server with Python FastMCP.

## Practice Exam — 250 Questions

Prepare for the ENAUTO with our **250-question practice exam** covering all 5 exam domains. Every question is an original real-world enterprise-automation scenario with detailed explanations and maps to the official exam topics (v2.0, current Cisco terminology — Catalyst Center, Catalyst SD-WAN Manager, Meraki Dashboard API, pyATS, RESTCONF/YANG, FastMCP).

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Cisco Certification Path

ENAUTO is a **concentration** exam. For **CCNP Enterprise**, pass the **ENCOR 350-401** core plus one concentration (ENAUTO is the automation/programmability choice). For **CCNP Automation**, pass the **AUTOCOR 350-901** core plus one concentration — **300-435 ENAUTO** (Enterprise) or **300-635 DCNAUTO** (Data Center). Cisco's track runs: Associate → Professional (CCNP) → Expert (CCIE).

## Related Cisco Certifications

If you're studying for the ENAUTO, you might also be interested in these Cisco certifications:

- **[AUTOCOR: Cisco Certified Automation Core (350-901)](/cert-tracker/cisco-autocor/)** — the CCNP Automation core that ENAUTO pairs with — 250 practice questions
- **[ENCOR: Cisco CCNP ENCOR (350-401)](/cert-tracker/cisco-encor/)** — the CCNP Enterprise core that ENAUTO pairs with — 250 practice questions
- **[ENSDWI: Implementing Cisco Catalyst SD-WAN Solutions (300-415)](/cert-tracker/cisco-ensdwi/)** — the SD-WAN concentration — 250 practice questions
- **[DEVASC: Cisco DevNet Associate (200-901)](/cert-tracker/cisco-devasc/)** — the automation-fundamentals associate exam — 250 practice questions
- **[CCNA: Cisco Certified Network Associate (200-301)](/cert-tracker/cisco-ccna/)** — 250 practice questions

## Study Tips

1. **Start with Controller-Based (30%) and Device-Level (25%)** — together they are over half the exam
2. **Know each controller's auth + one real call cold** — Catalyst Center token/`X-Auth-Token`, SD-WAN Manager `/j_security_check` + `X-XSRF-TOKEN`, Meraki `X-Cisco-Meraki-API-Key` + 429/Retry-After
3. **Use our practice exam** — try the 20 free questions first to gauge your readiness
4. **Review explanations** — don't just check if you got it right; read why each answer is correct
5. **Build muscle memory on the tools** — Netmiko/ncclient calls, an Ansible `cisco.*` module, a Jinja2 template with loops/filters, a RESTCONF verb, and a pyATS `learn`/`diff` are tested as applied skills, not trivia
6. **Use current names** — Catalyst Center (not DNA Center), Catalyst SD-WAN Manager (not vManage), Cisco Modeling Labs (not VIRL)
7. **Simulate exam conditions** — use the timed exam mode to practice under pressure
