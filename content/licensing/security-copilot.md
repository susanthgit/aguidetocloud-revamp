---
title: "Microsoft Security Copilot — Guide & Pricing (2026)"
description: "Security Copilot for Microsoft 365 E5 and E7: included monthly capacity, phased activation, paid SCUs, and which costs remain separate."
type: "licensing"
layout: "single"
plan_name: "Microsoft Security Copilot"
plan_id: "security-copilot"
price_display: "Included capacity or paid usage"
price_note: "Eligible Microsoft 365 E5/E7 inclusion; standalone capacity also available"
tagline: "AI for security teams — investigate threats, hunt risks, generate reports"
plan_category: "Copilot & AI"
badge: ""
ms_official: "https://www.microsoft.com/en-us/security/pricing/microsoft-security-copilot"
m365maps: ""
last_verified: "October 2026"
faq:
  - q: "Is Security Copilot included in M365 E5?"
    a: "Yes. Eligible Microsoft 365 E5 and E7 customers receive shared monthly Security Copilot capacity through a phased rollout: 400 SCUs per 1,000 paid user licences, up to 10,000 SCUs per month. This scales below 1,000 licences, with no minimum licence count. Check your tenant notification and activation status; inclusion is not unlimited usage."
  - q: "How does Security Copilot pricing work?"
    a: "Eligible, activated E5/E7 tenants use an included monthly SCU pool, which resets each month without rollover. For customers without qualifying licences, provisioned capacity is billed by the hour and overage capacity by actual consumption. Check Microsoft's Security Copilot pricing page for current paid rates."
  - q: "Do I need Microsoft Sentinel?"
    a: "No. Security Copilot can work with other supported products you have licensed. Eligible E5/E7 customers who also use Sentinel can apply their included SCUs to Security Copilot scenarios in Sentinel, but Sentinel data lake compute and storage costs are not included."
---

## What Is Security Copilot?

Security Copilot helps security and IT teams investigate incidents, understand device and identity risks, and review recommended actions. It is available through a standalone portal and supported experiences in Defender, Entra, Intune, Purview, and Sentinel. What it can access depends on your licensed products, configured integrations, and permissions.

## How Pricing Works

Security Copilot measures compute in **Security Compute Units (SCUs)**. There are two different ways to obtain capacity:

| Capacity model | Detail |
|-----------|--------|
| **Microsoft 365 E5/E7 inclusion** | Shared monthly capacity for eligible, activated tenants: 400 SCUs per 1,000 paid user licences, capped at 10,000 SCUs per month |
| **Below 1,000 licences** | Capacity scales with the paid licence count; there is no minimum licence count |
| **Unused included capacity** | Resets monthly; unused SCUs do not roll over |
| **Paid provisioned capacity** | Available without qualifying E5/E7 licences; a minimum of one SCU, billed by the hour for provisioned capacity, not just the amount consumed |
| **Paid overage capacity** | Additional capacity above paid provisioned capacity, billed by actual consumption within the configured overage limit |

The included monthly pool is **not** hourly provisioned capacity. Do not multiply an included SCU allocation by an hourly price. For current paid rates, use the [official Security Copilot pricing page](https://www.microsoft.com/en-us/security/pricing/microsoft-security-copilot).

### Capacity examples

Microsoft gives these examples for the included model:

| Paid E5/E7 user licences | Included monthly capacity |
|---|---|
| 400 | 160 SCUs |
| 4,000 | 1,600 SCUs |

These are shared tenant allocations, not a separate allowance for each analyst. Track actual consumption in the Security Copilot usage dashboard.

Microsoft's inclusion FAQ describes future throttling and a paid option beyond the monthly allocation, with 30 days' advance notice. It does **not** establish that this option is already enabled in every tenant. Check the [current inclusion FAQ and your tenant notification](https://learn.microsoft.com/en-us/copilot/security/security-copilot-inclusion#usage-and-billing) before planning around it.

## Security Copilot + M365 E5

This is the question people ask most: **how does Security Copilot fit if I already have M365 E5?**

The short version:

- Eligible **Microsoft 365 E5 and E7 customers receive included monthly capacity** at no additional cost.
- Rollout started on **November 18, 2025**, for existing Security Copilot customers with E5, then expanded in phases. Eligibility does not prove your tenant is already activated.
- Once an eligible tenant is notified and enabled, the included capacity is **automatically provisioned**. No separate Azure setup or manual SCU provisioning is needed for that inclusion.
- Review the preselected data-processing settings, access roles, and integrations. Agents still require your organisation to set them up and deploy them.

### What E5 unlocks for Security Copilot

| E5 component | What Security Copilot gets from it |
|---|---|
| **Defender XDR** (endpoint, email, identity, cloud apps) | Cross-workload incident investigation |
| **Entra ID P2** | User risk signals, conditional access context |
| **Purview** | Insider risk and DLP signal correlation |
| **Microsoft Intune** | Device compliance and management context |

Included capacity does not replace product permissions or grant access to data your organisation has not licensed or configured.

### What inclusion does NOT cover

- **Sentinel data lake compute and storage** remain separate costs. If you also use Sentinel, your included SCUs can cover Security Copilot scenarios in it.
- **Azure Logic Apps charges**, partner-agent licences purchased through Security Store, and prerequisites outside E5/E7 are not included.
- Microsoft's FAQ also excludes the **non-agentic Data Security Investigations experience in Purview**. Check the relevant workload's licensing before enabling it.
- Partner-built agents' **SCU costs** are included until further notice, but that does not include the partner's licence charge.

### The clean buying picture for E5 customers

| You have | You need to add for Security Copilot |
|---|---|
| **Eligible M365 E5 or E7** | Check activation; use the included monthly pool after enablement |
| **Eligible E5/E7 + Sentinel** | Use included SCUs for Security Copilot scenarios; budget separately for Sentinel workload costs |
| **No qualifying E5/E7 licence** | Arrange paid SCU capacity and the licences needed for the products you will connect |
| **Already provisioned paid capacity** | Do not delete existing capacity just because you qualify; Microsoft says to retain it to ensure continued access |

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
| Eligible E5/E7 customer | Check activation and start with a focused use case in your existing security or endpoint tools |
| Customer without qualifying E5/E7 licences | Compare paid capacity with the actual workloads and integrations you need |
| Sentinel customer without qualifying E5/E7 licences | Paid Security Copilot remains available; Sentinel alone does not qualify for inclusion |
| Team considering automated agents | Decide who reviews recommendations and which actions the agent is authorised to perform |

## Frequently Asked Questions

**1. Do I need M365 E5 to use Security Copilot?**

No. Customers without qualifying E5/E7 licences can use paid capacity. Eligible E5/E7 customers instead receive included monthly capacity after tenant activation. Connect only the products and data sources you are licensed and authorised to use.

**2. Is this the same as M365 Copilot?**

No. Microsoft 365 Copilot supports productivity work in apps such as Word, Excel, and Outlook. Security Copilot supports security and IT operations. Its SCU capacity and inclusion rules are different.

**3. How do I provision SCUs?**

For eligible, activated E5/E7 tenants, included capacity is provisioned automatically without separate Azure setup. Customers using the paid model provision capacity through Azure. See Microsoft's [capacity model guide](https://learn.microsoft.com/en-us/copilot/security/security-compute-units-capacity). Existing customers should not delete previously provisioned capacity merely because they qualify for inclusion.

**4. Can I try it before committing?**

Eligible E5/E7 customers can begin with their included capacity once activated. For customers outside that inclusion, check the [official pricing page](https://www.microsoft.com/en-us/security/pricing/microsoft-security-copilot) for current offers and paid terms; do not assume a trial is available.

**5. Does it work outside Microsoft's security stack?**

Yes, supported plugins and partner agents can connect other tools. Their availability, permissions, partner licences, and associated service charges still apply; included SCUs do not make every connected service free.

## Official Microsoft references

- [Security Copilot pricing and availability](https://www.microsoft.com/en-us/security/pricing/microsoft-security-copilot)
- [Microsoft Learn — E5/E7 inclusion, eligibility, and exclusions](https://learn.microsoft.com/en-us/copilot/security/security-copilot-inclusion)
- [Microsoft Learn — SCUs and capacity models](https://learn.microsoft.com/en-us/copilot/security/security-compute-units-capacity)
- [Microsoft Learn — Manage SCU usage](https://learn.microsoft.com/en-us/copilot/security/manage-usage)
- [Microsoft Learn — Authentication and data handling](https://learn.microsoft.com/en-us/copilot/security/authentication)
- [Microsoft Learn — Plugins and extensibility](https://learn.microsoft.com/en-us/copilot/security/plugin-microsoft)
