---
title: "Copilot & GitHub Pre-Purchase Plans (P3) Explained"
list_title: "Pre-Purchase Plans (P3): Copilot vs GitHub"
hub_id: "copilot-pricing"
description: "Microsoft and GitHub Pre-Purchase Plans (P3) in plain English — which plan covers Copilot, Cowork or GitHub, and whether GitHub credits work for Cowork."
date: 2026-06-26
lastmod: 2026-06-26
card_tag: "Copilot"
tag_class: "ai"
layout: "notebook"
stamp: "pre-purchase plans"
intro_note: "← four plans, one nickname 'P3' — which one actually covers Copilot, Cowork or GitHub"
images: ["images/og/blog/microsoft-copilot-github-pre-purchase-plans-p3.jpg"]
og_headline: "Pre-Purchase Plans (P3) Explained"
og_glyph: "compare"
tags:
  - copilot
  - pricing
  - github-copilot
  - cowork
  - copilot-studio
  - ai
sitemap:
  priority: 0.8
founder_note: |
  This one started with a question from a colleague — one of our account execs asked me, "we already pay for GitHub Copilot, can those credits cover Cowork too?" Simple question. It sent me down a proper rabbit hole, because the honest answer is no — the GitHub credits themselves can't — but there *is* one prepaid plan that covers both, and it took some digging to untangle why. The confusing part is that several different plans all answer to the name "P3", so it's easy to assume they're one pot of money. They're not. This is the plain-English map I wish I'd had when the question landed. — Sush
faq:
  - question: "Can I use my existing GitHub Copilot credits for Cowork?"
    answer: "No. GitHub Copilot is billed through GitHub and meters its AI usage in GitHub AI Credits, and the GitHub pre-purchase plans only cover GitHub usage. Microsoft 365 Copilot Cowork runs on Copilot Credits, set up in the Microsoft 365 admin centre. The two are separate products on separate meters, so GitHub AI Credits cannot be spent on Cowork."
  - question: "Is there one prepaid plan that covers both GitHub Copilot and Cowork?"
    answer: "Yes — the Microsoft Agent Pre-Purchase Plan. It is a single Azure pre-purchase that covers select services across Microsoft Foundry, Microsoft Copilot Studio, Microsoft Fabric, GitHub, and Copilot (including Cowork). It is the only one of the four pre-purchase plans that spans both the Copilot and GitHub sides."
  - question: "How many different P3 pre-purchase plans are there?"
    answer: "Four matter for Copilot, Cowork and GitHub, and they share the 'P3' nickname: the Microsoft Agent Pre-Purchase Plan, the Copilot Credit Pre-Purchase Plan, the GitHub Pre-Purchase Plan, and the GitHub AI Credit Pre-Purchase Plan. Each is bought as an Azure reservation, and each only pays for its own set of products."
  - question: "What is the difference between the Copilot Credit P3 and the Microsoft Agent Pre-Purchase Plan?"
    answer: "The Copilot Credit Pre-Purchase Plan only pays for Copilot Credit usage — Copilot Studio agents, Dynamics 365 first-party agents, and Copilot, including Cowork. The Microsoft Agent Pre-Purchase Plan is broader: it also covers Microsoft Foundry, Microsoft Fabric, and GitHub. If you only use Copilot, either works for Cowork; if you also want GitHub or Foundry on one commitment, the Agent plan is the one that spans them."
  - question: "Does Cowork use Copilot Credits?"
    answer: "Yes. Cowork is the Microsoft 365 Copilot agent that carries out tasks for you, and its usage is metered in Copilot Credits. You can pay for those credits pay-as-you-go through an Azure subscription, or prepay them — either with the Copilot Credit Pre-Purchase Plan or the Microsoft Agent Pre-Purchase Plan."
  - question: "Do GitHub AI Credits and Copilot Credits mix?"
    answer: "No. GitHub AI Credits are GitHub's currency for AI usage on the GitHub platform, and Copilot Credits are Microsoft's currency for agent work in Microsoft 365 and Copilot Studio. They are separate currencies on separate meters and are not interchangeable. The only place the two worlds meet is the Microsoft Agent Pre-Purchase Plan, which can fund both."
  - question: "Where do I buy these pre-purchase plans?"
    answer: "All four are bought as Azure reservations, so you need an Azure subscription and the Owner or Reservation Purchaser role (or the Reserved Instances policy on an Enterprise Agreement, or the partner flow for CSP). Cowork's Copilot Credits are then set up and managed in the Microsoft 365 admin centre."
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Pricing & Tiers](/blog/microsoft-copilot-pricing-tiers-explained/) series.** Pre-purchase plans and their scopes are new and still expanding — figures and product coverage change. Always confirm the live detail on [Microsoft Learn](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/agent-pre-purchase) before you commit. **Last verified: 26 June 2026.**

</div>

**The short version:** "P3" isn't one plan — it's a nickname shared by **four** different pre-purchase plans, each bought as an Azure reservation, and each one only pays for its own set of products. Your existing **GitHub Copilot credits — GitHub AI Credits — can't pay for Cowork**. But there's one plan — the **Microsoft Agent Pre-Purchase Plan** — that can prepay for **both** GitHub Copilot **and** Cowork at once.

---

> 🧩 **In a hurry?** Your GitHub Copilot credits → **can't** be used for Cowork. Want one prepaid plan that covers **both**? The **Microsoft Agent Pre-Purchase Plan**. Everything below is the *why*.

---

> 🧭 **Jump to:** [The one-line answer](#answer) · [There isn't one "P3"](#many) · [Which plan covers what](#coverage) · [Can GitHub credits pay for Cowork?](#github-cowork) · [The one plan that covers both](#agent) · [Which P3 should you buy?](#which) · [How credits get used up](#order) · [Glossary](#glossary) · [Sources](#sources)

---

## The one-line answer {#answer}

Two questions come up again and again. Here are both, up front:

| Question | Answer |
|---|---|
| Can a customer's existing **GitHub Copilot** credits pay for **Cowork**? | **No.** GitHub Copilot's usage runs on GitHub AI Credits — GitHub-only. |
| Is there **one** prepaid plan that covers **both** GitHub Copilot **and** Cowork? | **Yes** — the **Microsoft Agent Pre-Purchase Plan**. |

Everything below is the why.

---

## Wait — there isn't one "P3" {#many}

If you've read our [Cost Management guide](/blog/microsoft-365-copilot-cost-management/), you'll know that in the **Copilot Credits** world, "P3" means the **Copilot Credit Pre-Purchase Plan** — and there's no "P1" or "P2" ladder beneath it. That's all still true.

What's changed is that Microsoft now sells **several** pre-purchase plans, across different product families, and they all wear the same "P3" / *Pre-Purchase Plan* badge because they all work the same way: commit to an amount up front as an **Azure reservation**, get a volume discount, and draw it down over a one-year term.

For Copilot, Cowork and GitHub budgeting, **four** of them matter:

| Pre-Purchase Plan (P3) | What it pays for |
|---|---|
| **Microsoft Agent Pre-Purchase Plan** | Select services across **Microsoft Foundry, Copilot Studio, Microsoft Fabric, GitHub, and Copilot** (including Cowork) |
| **Copilot Credit Pre-Purchase Plan** | **Copilot Credit usage only** — Copilot Studio agents, Dynamics 365 first-party agents, and Copilot (including Cowork) |
| **GitHub Pre-Purchase Plan** | **GitHub usage** — the things you pay for on GitHub, including GitHub Copilot |
| **GitHub AI Credit Pre-Purchase Plan** | **GitHub AI Credits only** — the AI usage meter on the GitHub platform |

{{< margin >}}They look alike on purpose — same Azure reservation, same "pay up front, then use it down" idea. The difference that matters is **scope**: each plan only pays for its own group of products.{{< /margin >}}

---

## Which plan covers what {#coverage}

Here's the same four plans against the things people actually want to fund. Notice that only the **Microsoft Agent Pre-Purchase Plan** has a "Yes" in both the Cowork column and the GitHub column:

| Plan | Cowork | GitHub Copilot | Copilot Studio | Foundry | Fabric |
|---|---|---|---|---|---|
| **Microsoft Agent Pre-Purchase Plan** | Yes | Yes | Yes | Yes | Yes |
| **Copilot Credit Pre-Purchase Plan** | Yes | No | Yes | No | No |
| **GitHub Pre-Purchase Plan** | No | Yes | No | No | No |
| **GitHub AI Credit Pre-Purchase Plan** | No | AI usage only | No | No | No |

*Two notes on the table: the Agent plan's public wording is "GitHub costs" — GitHub Copilot is one of the GitHub products it covers. And the GitHub AI Credit plan covers GitHub AI Credits (the AI usage meter), not base GitHub Copilot seat licences.*

The mental model: **the Copilot plans pay for Copilot work, the GitHub plans pay for GitHub work, and the Agent plan is the bridge that spans both.**

---

## So can I use GitHub Copilot credits for Cowork? {#github-cowork}

No — and it helps to see why, because it's a product boundary, not a setting you can flip.

- **Cowork** runs on **Copilot Credits**, set up and managed in the **Microsoft 365 admin centre**. You pay for them pay-as-you-go through an Azure subscription, or prepay them with the Copilot Credit or Agent pre-purchase plans.
- **GitHub Copilot** is billed through **GitHub** — per-seat licences plus AI usage metered in **GitHub AI Credits** (1 AI credit = $0.01). Its pre-purchase plans (the GitHub Pre-Purchase Plan and the GitHub AI Credit Pre-Purchase Plan) only pay for GitHub usage.

So a balance of GitHub AI Credits has no path to Cowork. Different products, different meters, different admin surfaces.

> 📎 **The line to give a customer:** *"Your GitHub Copilot billing — seats and GitHub AI Credits — stays on the GitHub side, so it can't be spent on Cowork. Cowork runs on Copilot Credits in the Microsoft 365 admin centre. If you want one prepaid commitment that covers both, that's the Microsoft Agent Pre-Purchase Plan."*

---

## The one plan that covers both {#agent}

The **Microsoft Agent Pre-Purchase Plan** is the unified option. Microsoft describes it as a single pre-purchase that covers *"select services across Microsoft Foundry, Microsoft Copilot Studio, Microsoft Fabric, and GitHub"* — and the Copilot Studio coverage explicitly includes **Copilot Credit-enabled services: Copilot Studio agents, Dynamics 365 first-party agents, and Copilot.** Since **Cowork burns Copilot Credits**, it sits inside that coverage.

In plain terms: if a customer wants **one** annual commitment that can pay for **GitHub Copilot, Cowork, Copilot Studio agents, Foundry and Fabric** together, the Agent plan is the one that does it. If they only ever touch Copilot and Cowork, the narrower **Copilot Credit Pre-Purchase Plan** also works.

{{< margin >}}Both the Copilot Credit plan and the Agent plan can fund Cowork. The Agent plan is just broader — it reaches the GitHub and Foundry worlds too.{{< /margin >}}

---

## Which P3 should you buy? {#which}

A quick way to choose:

| What you want to prepay for | The plan to look at |
|---|---|
| **Copilot and Cowork only** | Copilot Credit Pre-Purchase Plan (or the Agent plan, if you'd rather keep one commitment) |
| **GitHub only** (Copilot, Actions, Codespaces, etc.) | GitHub Pre-Purchase Plan |
| **GitHub AI usage only** | GitHub AI Credit Pre-Purchase Plan |
| **Both Copilot/Cowork and GitHub** (and maybe Foundry or Fabric) | **Microsoft Agent Pre-Purchase Plan** — the one that spans them |

⚠️ Pre-purchase plans are **annual commitments** drawn down over a one-year term, and discounts may not stack with other agreements you hold. Size them against a real forecast — model Cowork specifically with the **[Cowork Cost Calculator](/cowork-cost-calculator/)** — and confirm tier pricing, renewal, and commitment treatment with your Microsoft licensing contact before you commit.

---

## How the credits get used up {#order}

If a customer holds more than one way to pay, Microsoft draws them down in a fixed order so spend stays predictable. For **Cowork and Copilot Credits in the Microsoft 365 admin centre**, Microsoft's published order is:

> **Capacity packs → prepaid (P3) credits → pay-as-you-go.**

Prepaid credits are always used **before** pay-as-you-go billing kicks in, which is the whole point of prepaying — you spend the committed pool first, then any overage falls through to pay-as-you-go. For the full picture of policies, caps and the Cost Management dashboard, see our [Copilot Cost Management & Billing](/blog/microsoft-365-copilot-cost-management/) guide.

And if a billing subscription holds **both** an Agent P3 and a Copilot Credit P3, Microsoft applies the **Agent P3 first**, billing any overage only once those credits are used up.

---

## A quick glossary {#glossary}

| Term | Plain meaning |
|---|---|
| **Pre-Purchase Plan / P3** | An annual prepaid commitment bought as an Azure reservation, discounted by volume. Four are relevant here, across Copilot, Agent, and GitHub. |
| **Copilot Credits** | Microsoft's metered currency for agent work in Microsoft 365 and Copilot Studio — what Cowork runs on. |
| **GitHub AI Credits** | GitHub's own currency for AI usage on the GitHub platform — separate from Copilot Credits. |
| **ACU** | Agent Commit Unit — the unit inside the Microsoft Agent Pre-Purchase Plan (Microsoft's surfaces show it as "Agent CUs"; basically a $1 token). |
| **CCCU** | Copilot Credit Commit Unit — the unit inside the Copilot Credit Pre-Purchase Plan; 1 CCCU is roughly $1 of usage. |

---

## Official Microsoft sources {#sources}

- [Microsoft Agent Pre-Purchase Plan](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/agent-pre-purchase) — the unified plan that spans Foundry, Copilot Studio, Fabric, GitHub, and Copilot
- [Copilot Credit Pre-Purchase Plan (P3)](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/copilot-credit-p3) — CCCUs, tiers, Azure reservation
- [GitHub Pre-Purchase Plan](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/github-pre-purchase) — prepay for GitHub usage
- [GitHub AI Credit Pre-Purchase Plan](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/github-ai-credits-pre-purchase-plan) — prepay for GitHub AI Credits
- [Usage-based billing and cost management for Copilot Credits](https://learn.microsoft.com/en-us/microsoft-365/copilot/usage-based-billing-overview-copilot-credits) — how Cowork is billed in Copilot Credits
- [Managing AI experiences enabled by usage-based billing](https://learn.microsoft.com/en-us/microsoft-365/copilot/usage-based-billing-manage-copilot-credits) — how Cowork credits (incl. Agent P3 and Copilot Credit P3) are drawn down
- [GitHub billing — usage-based billing for organizations & enterprises](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises) — how GitHub Copilot is metered in GitHub AI Credits

---

## Where to go next {#next}

- **[Microsoft Copilot Pricing & Tiers Explained](/blog/microsoft-copilot-pricing-tiers-explained/)** — the hub: every Copilot plan on one page
- **[What Are Copilot Credits? Rates & Costs Explained](/blog/copilot-credits-explained/)** — the meter behind agent work, minus the jargon
- **[Copilot Cost Management & Billing](/blog/microsoft-365-copilot-cost-management/)** — spending policies, the dashboard, and the P1/P2/P3 myth
- **[Microsoft Copilot Cowork — Pricing Guide](/blog/microsoft-copilot-cowork-pricing-cost-management/)** — the two-part Cowork model (seat + credits)
- **[Cowork Cost Calculator](/cowork-cost-calculator/)** — model your own credit spend before you commit
