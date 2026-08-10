---
title: "Microsoft Copilot Studio — Guide & Pricing (2026)"
description: "Microsoft Copilot Studio — build custom AI agents billed in Copilot Credits: $200 per 25,000 credits/month, or pay-as-you-go at $0.01/credit. Verified August 2026."
type: "licensing"
layout: "single"
plan_name: "Microsoft Copilot Studio"
plan_id: "copilot-studio"
price: 200
price_note: "$200 / 25,000 Copilot Credits per month (or PAYG $0.01/credit)"
tagline: "Build custom AI agents and copilots with generative AI"
plan_category: "Power Platform"
badge: ""
ms_official: "https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio/pricing"
m365maps: ""
last_verified: "August 2026"
faq:
  - q: "Is Copilot Studio per user or per tenant?"
    a: "Per tenant — a $200/month prepaid pack covers your whole organisation and includes 25,000 Copilot Credits/month (these were called 'messages' until Microsoft renamed the unit to Copilot Credits on 1 September 2025). You can also go pay-as-you-go at $0.01 per credit via an Azure subscription, with no prepaid commitment."
  - q: "What can I build with Copilot Studio?"
    a: "Custom chatbots, AI agents grounded on your data, automated workflows triggered by conversation, multi-channel bots (Teams, website, email). Uses generative AI with enterprise data grounding."
---

## Who Is Copilot Studio For?

Copilot Studio is for **IT teams and makers building custom AI chatbots and agents** — HR bots, IT helpdesk agents, customer service bots, and knowledge assistants.

**Key capabilities:**
- 🤖 Build custom copilots with generative AI (GPT-powered)
- 📁 Ground on your data — SharePoint, websites, Dataverse, custom APIs
- ⚡ Integrate with Power Automate for workflow actions
- 💬 Deploy to Teams, websites, email, and more
- 🔐 Enterprise security — data stays in your tenant

| Feature | Detail |
|---------|--------|
| Pricing | $200/tenant/month (prepaid) or pay-as-you-go |
| Copilot Credits included | 25,000/month with the prepaid pack |
| Pay-as-you-go | $0.01 per Copilot Credit (via Azure) |
| Billing model | Feature-based Copilot Credits (formerly "messages", renamed 1 Sep 2025) |
| AI models | Current frontier models (GPT + Anthropic Claude), enterprise-grade |
| Channels | Teams, web, email, custom |

## How Copilot Studio Is Billed — Copilot Credits

Since **1 September 2025**, Copilot Studio usage is metered in **Copilot Credits** (the old "messages" unit — pack sizes and rates were unchanged, just renamed). Consumption is **feature-based**, so one interaction can cost several credits:

| Action | Copilot Credits |
|--------|:---------------:|
| Classic answer | 1 |
| Generative answer | 2 |
| Agent action | 5 |
| Tenant graph grounding (Microsoft 365 data) | 10 |

**Two ways to pay:** a **prepaid pack** ($200 / 25,000 credits per month, no rollover) or **pay-as-you-go** ($0.01/credit via an Azure subscription). Larger rollouts can pre-purchase **Copilot Credit Commit Units (CCCUs)**.

**Zero-rated for Microsoft 365 Copilot users:** employee-facing agents used by **licensed** Microsoft 365 Copilot users **inside** Copilot, Teams or SharePoint don't consume paid credits (within fair-use limits). External / customer-facing agents, unlicensed users, standalone channels and autonomous runs **do**. ⚠️ **Computer use (CUA) is the exception** — it's billed even for licensed users.

→ Full detail: [Copilot Credits explained](/blog/copilot-credits-explained/) · [Is Copilot Studio free?](/blog/copilot-studio-pricing/)

## Harnesses (New in 2026)

Every Copilot Studio agent now runs on a **harness** — and the one you choose changes billing:

- **Standard harness** — rule-based agents and agent flows. Free to build and test; credits once you publish and run at scale (everything above describes this harness).
- **GitHub Copilot harness** *(GA 3 August 2026)* — reasoning-heavy, multi-step agents. **Usage-based billing from the moment you start building** — creating, previewing, testing and evaluating all consume credits, unlike the standard harness which only bills after publish.
- **Copilot chat harness** — extends Microsoft 365 Copilot Chat with your knowledge; consumption-based or included in the Microsoft 365 Copilot licence.

→ More: [Choose a harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview) · [GitHub Copilot harness billing](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/billing-credit-overview)

## Frequently Asked Questions

**1. Is Copilot Studio included in M365 E7?**

E7 includes Copilot and Copilot Studio agent builder capabilities. The standalone $200/tenant licence is for organisations on E3/E5 who want to build custom agents.

**2. How many agents can I create?**

Unlimited agents. The 25,000-Copilot-Credit prepaid allowance (or your pay-as-you-go spend) is pooled across all agents in your tenant.
