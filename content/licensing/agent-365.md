---
title: "Microsoft Agent 365 — Pricing & Licensing Guide (2026)"
description: "Microsoft Agent 365 is $15/user/month — the governance layer for AI agents. Licensed per user, not per agent. Prerequisites and how it compares with E7."
type: "licensing"
layout: "single"
plan_name: "Microsoft Agent 365"
plan_id: "agent-365"
price: 15
price_note: "Add-on (needs a qualifying base licence — see below)"
tagline: "The control plane for AI agents — govern them like employees"
plan_category: "Copilot & AI"
badge: "New"
ms_official: "https://www.microsoft.com/en-us/microsoft-agent-365"
m365maps: ""
last_verified: "August 2026"
faq:
  - q: "How much does Microsoft Agent 365 cost?"
    a: "Agent 365 is $15 per user per month as an add-on. It is also included at no extra cost in Microsoft 365 E7 ($99/user/month). It went generally available on 1 May 2026."
  - q: "Is Agent 365 licensed per user or per agent?"
    a: "Per user. One Agent 365 licence covers every agent that person owns, sponsors, manages, or interacts with. There is no per-agent governance fee, so deploying more agents does not increase your Agent 365 bill."
  - q: "What do I need before I can buy Agent 365?"
    a: "Since 1 June 2026 you need a qualifying base licence, and what qualifies depends on your customer type. Enterprises need Microsoft 365 E5, or Microsoft 365 E3 (or Office 365 E3 plus EMS E3) together with both the Defender and Purview suites. Frontline workers need F1 or F3 plus the frontline Defender and Purview suites. Smaller businesses need Microsoft 365 Business Premium, and Microsoft's FAQ adds the Defender and Purview suites for SMB on top to unlock the full functionality. Education needs A5 for Faculty, or A3 for Faculty plus the education Defender and Purview suites. These prerequisites were only formalised on 1 June 2026, so older guidance may not mention them."
  - q: "Does Microsoft 365 Copilot include Agent 365?"
    a: "No. The $30 Copilot licence does not include Agent 365. They solve different problems — Copilot is the assistant people use, Agent 365 is how you govern the agents. Only Microsoft 365 E7 bundles both."
  - q: "Do the agents themselves need licences?"
    a: "No. Agents are covered under the licensed user's Agent 365 or E7 seat. Note that Microsoft's multiplexing rules still apply — anyone who indirectly benefits from Microsoft 365 through an agent or bot still needs their own licence."
---

## What Agent 365 Actually Is

This one gets misread constantly, so let's be clear up front: **Agent 365 is not a pack of AI agents.** You don't buy it to get agents.

Agent 365 is the **control plane** — the layer that lets you see, secure, and manage the agents already running in your tenant. If Copilot is the assistant your people use, Agent 365 is how you stop the agents from becoming a shadow IT problem.

> **💡 Plain English:** Think of it as HR and IT for your agents. Every agent gets an identity, an owner, a lifecycle, and a paper trail — the same things you'd expect for a new employee.

## What You Get

| Capability | What It Does |
|-----------|-------------|
| **Agent registry** | A single inventory of every agent in your tenant — who built it, who sponsors it, what it can reach |
| **Entra Agent ID** | Each agent gets a real identity, so access can be granted and revoked like any account |
| **Lifecycle management** | Provision, review, and retire agents instead of letting them accumulate quietly |
| **Purview coverage** | DLP policies apply to agents, not just people |
| **Defender coverage** | Threat detection for agent behaviour |
| **Admin Center dashboards** | Usage, cost, and task metrics — the receipts when someone asks what the spend bought |

## The Licensing Model — Per User, Not Per Agent

This is the part worth understanding before you budget:

**One Agent 365 licence covers every agent that person owns, sponsors, manages, or interacts with.**

So if one of your engineers runs fifteen agents, that's still one Agent 365 licence. Deploying more agents doesn't grow this line item. You licence the *humans accountable for* agents, not the agents.

## Prerequisites

Agent 365 sits on top of a security stack — it doesn't replace one. You need one of:

| Base | Fits |
|------|------|
| **Microsoft 365 E5** | Enterprise |
| **Microsoft 365 E3** (or Office 365 E3 + EMS E3) **plus the Defender and Purview suites** | Enterprise not on E5 |
| **F1 or F3 plus the frontline Defender and Purview suites** | [Frontline workers](/licensing/microsoft-365-f5-security-compliance/) |
| **Microsoft 365 Business Premium** | Small and mid-sized businesses |
| **A5 for Faculty**, or **A3 for Faculty plus the education Defender and Purview suites** | Education |

## Agent 365 Standalone vs M365 E7

If you're already heading toward the full stack, check the maths before buying piecemeal:

| Path | Monthly Cost |
|------|:-----------:|
| E5 ($60) + Copilot ($30) + Agent 365 ($15) | **$105/user** |
| [Microsoft 365 E7](/licensing/microsoft-365-e7/) | **$99/user** |

E7 also folds in the Entra Suite on top of that. If you want all three pieces anyway, E7 is usually the cheaper route — buying them separately mostly makes sense when you only need one.

> **⚠️ Worth checking:** [Microsoft 365 Copilot](/licensing/microsoft-365-copilot/) at $30 does **not** include Agent 365. They're often assumed to be the same purchase, and they aren't.

## Going Deeper

I've written up the security and governance side properly — what the registry actually looks like in practice, how sponsorship works, and where it overlaps with the Copilot Control System:

- [Agent 365 — the complete security and governance guide](/blog/agent-365-security-governance-complete-guide/)
- [Microsoft 365 E7 — everything you need to know](/blog/microsoft-365-e7-frontier-suite-everything-you-need-to-know/)

## Frequently Asked Questions


**1. How much does Microsoft Agent 365 cost?**

Agent 365 is $15 per user per month as an add-on. It is also included at no extra cost in [Microsoft 365 E7](/licensing/microsoft-365-e7/) ($99/user/month). It went generally available on 1 May 2026.



**2. Is Agent 365 licensed per user or per agent?**

Per user. One Agent 365 licence covers every agent that person owns, sponsors, manages, or interacts with. There is no per-agent governance fee, so deploying more agents does not increase your Agent 365 bill.



**3. What do I need before I can buy Agent 365?**

Since 1 June 2026 you need a qualifying base licence, and what qualifies depends on your customer type. Enterprises need Microsoft 365 E5, or Microsoft 365 E3 (or Office 365 E3 plus EMS E3) together with both the Defender and Purview suites. Frontline workers need F1 or F3 plus the frontline Defender and Purview suites. Smaller businesses need Microsoft 365 Business Premium, and Microsoft's FAQ adds the Defender and Purview suites for SMB on top to unlock the full functionality. Education needs A5 for Faculty, or A3 for Faculty plus the education Defender and Purview suites. These prerequisites were only formalised on 1 June 2026, so older guidance may not mention them.



**4. Does Microsoft 365 Copilot include Agent 365?**

No. The $30 [Copilot](/licensing/microsoft-365-copilot/) licence does not include Agent 365. They solve different problems — Copilot is the assistant people use, Agent 365 is how you govern the agents. Only [Microsoft 365 E7](/licensing/microsoft-365-e7/) bundles both.



**5. Do the agents themselves need licences?**

No. Agents are covered under the licensed user's Agent 365 or E7 seat. Note that Microsoft's multiplexing rules still apply — anyone who indirectly benefits from Microsoft 365 through an agent or bot still needs their own licence.
