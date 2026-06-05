---
title: "Microsoft Security Copilot — Guide & Pricing (2026)"
description: "Microsoft Security Copilot — pay-per-use AI for security teams at $4 per Security Compute Unit per hour. How it works with M365 E5, pricing, and what it actually does."
type: "licensing"
layout: "single"
plan_name: "Microsoft Security Copilot"
plan_id: "security-copilot"
price: 4
price_note: "Per SCU/hour (pay-per-use)"
tagline: "AI for security teams — investigate threats, hunt risks, generate reports"
plan_category: "Copilot & AI"
badge: ""
ms_official: "https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot"
m365maps: ""
last_verified: "June 2026"
faq:
  - q: "Is Security Copilot included in M365 E5?"
    a: "No. Security Copilot is a standalone pay-per-use product billed separately at $4 per Security Compute Unit (SCU) per hour. M365 E5 is not a prerequisite, but E5 customers get the most value because E5 already provides the signal sources Security Copilot reasons over — Defender XDR, Entra ID P2, and Purview."
  - q: "How does Security Copilot pricing work?"
    a: "Security Copilot uses Security Compute Units (SCUs) billed at $4/SCU/hour. You provision SCU capacity in the Azure portal and pay for what you use. It's consumption-based, not per-user. 1 SCU running 24/7 for a month ≈ $2,920."
  - q: "Do I need Microsoft Sentinel?"
    a: "No, but Sentinel makes Security Copilot significantly more powerful. Without Sentinel you still get Defender XDR integration; with Sentinel you also get cross-source threat hunting across all your log sources."
---

## What Is Security Copilot?

Security Copilot is an **AI assistant for security operations teams**. It uses GPT-4 class models trained on Microsoft's threat intelligence to help analysts investigate incidents, hunt threats, and generate reports.

## How Pricing Works

Unlike most Microsoft licences, Security Copilot uses a **consumption model**:

| Component | Detail |
|-----------|--------|
| **Unit** | Security Compute Unit (SCU) |
| **Price** | $4 per SCU per hour |
| **Billing** | Provision capacity in Azure, pay for usage |
| **Minimum** | 1 SCU |
| **Per-user cost** | None — pricing is by compute, not by seat |

> **💡 Think of it like Azure:** You provision capacity (SCUs) and pay for what you use. A small SOC team might start with 1–3 SCUs; a large enterprise security team might use 10+.

### Real cost examples

| Scenario | SCU sizing | Monthly cost (24/7) |
|---|---|---|
| Small SOC team trialling it | 1 SCU | ≈ $2,920 |
| Mid-size team, business hours only (10h × 22d) | 2 SCUs | ≈ $1,760 |
| Mid-size team, always-on | 3 SCUs | ≈ $8,760 |
| Large enterprise SOC | 10 SCUs | ≈ $29,200 |

You can scale SCUs up or down at any time. Most teams start with 1 SCU and add capacity as adoption grows.

## Security Copilot + M365 E5

This is the question people ask most: **how does Security Copilot fit if I already have M365 E5?**

The short version:

- ❌ Security Copilot is **NOT bundled** with M365 E5 — you pay for it separately
- ✅ E5 customers are the **natural buyer** because E5 already provides the data Security Copilot needs

### What E5 unlocks for Security Copilot

| E5 component | What Security Copilot gets from it |
|---|---|
| **Defender XDR** (endpoint, email, identity, cloud apps) | Cross-workload incident investigation |
| **Entra ID P2** | User risk signals, conditional access context |
| **Purview** | Insider risk and DLP signal correlation |
| **Microsoft Intune** | Device compliance and management context |

Without those data sources Security Copilot is a thin shell — that's the real *"works best with E5"* reason.

### What E5 does NOT unlock

- **Microsoft Sentinel** is **not included in E5** — Sentinel is consumption-billed separately (per GB ingested + per GB retained)
- For full cross-source threat hunting, you still need Sentinel
- Sentinel-only customers (no E5) can still use Security Copilot — they just lose the Defender XDR integration

### The clean buying picture for E5 customers

| You have | You need to add for Security Copilot |
|---|---|
| **M365 E5** | Security Copilot SCUs only |
| **M365 E5 + Sentinel** | Security Copilot SCUs only (most common setup) |
| **M365 E3** | Defender add-ons + Security Copilot SCUs |
| **Sentinel only (no E5)** | Security Copilot SCUs (limited XDR integration) |

## What It Does

- **Incident investigation** — summarise complex security incidents in plain English
- **Threat hunting** — query across Defender, Sentinel, Intune, and Entra data with natural language
- **Report generation** — auto-generate incident reports for stakeholders
- **Script analysis** — analyse suspicious PowerShell, Python, or bash scripts
- **Vulnerability assessment** — prioritise CVEs based on your environment
- **External data plugins** — bring in your own threat intelligence feeds

## Who Should Buy This?

| Profile | Fit |
|---|---|
| E5 customer with a SOC team | ✅ Strong fit — your existing signals make it work day one |
| E3 customer running Defender add-ons | ✅ Works, but you'll get more from upgrading data sources first |
| Sentinel customer without E5 | ⚠️ Partial fit — you'll lose Defender XDR depth |
| Org with no SOC team or analyst | ❌ Skip — you need humans to act on what it surfaces |

## Frequently Asked Questions

**1. Do I need M365 E5 to use Security Copilot?**

No. Security Copilot is a standalone pay-per-use product. M365 E5 is not a prerequisite. But E5 customers get the most value because E5 already provides the Defender XDR, Entra ID P2, and Purview signals Security Copilot reasons over.

**2. Is this the same as M365 Copilot?**

No. M365 Copilot ($30/user) is for productivity (Word, Excel, Outlook). Security Copilot is for security operations teams and billed by compute usage, not per user.

**3. How do I provision SCUs?**

You provision SCU capacity in the Azure portal under Security Copilot. You pay through your Azure subscription. Microsoft's [Getting Started guide](https://learn.microsoft.com/en-us/copilot/security/get-started-security-copilot) walks through the setup.

**4. Can I try it before committing?**

Yes — Microsoft has run promotional free trial periods in the past. Check the [official pricing page](https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot) for current offers.

**5. Does it work outside Microsoft's security stack?**

Yes, via plugins. Security Copilot supports third-party plugins for ServiceNow, CrowdStrike, and other tools — though Microsoft-native integrations are deepest.

## Official Microsoft references

- [Security Copilot product page](https://www.microsoft.com/en-us/security/business/ai-machine-learning/microsoft-security-copilot)
- [Microsoft Learn — Security Copilot overview](https://learn.microsoft.com/en-us/copilot/security/microsoft-security-copilot)
- [Microsoft Learn — Getting started](https://learn.microsoft.com/en-us/copilot/security/get-started-security-copilot)
- [Microsoft Learn — Manage SCU usage](https://learn.microsoft.com/en-us/copilot/security/manage-usage)
- [Microsoft Learn — Authentication and data handling](https://learn.microsoft.com/en-us/copilot/security/authentication)
- [Microsoft Learn — Plugins and extensibility](https://learn.microsoft.com/en-us/copilot/security/plugin-microsoft)
