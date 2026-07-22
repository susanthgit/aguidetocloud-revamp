---
title: "What Are Copilot Credits? Rates & Costs Explained"
list_title: "What Are Copilot Credits? Rates & Costs"
hub_id: "copilot-pricing"
description: "What are Copilot Credits? Microsoft's metered currency for agent work — what a credit costs, the per-action rate card, and what's zero-rated."
date: 2026-06-16
lastmod: 2026-06-16
card_tag: "Copilot"
tag_class: "ai"
layout: "notebook"
stamp: "credits explained"
intro_note: "← so what *is* a Copilot Credit? the meter, minus the jargon"
images: ["images/og/blog/copilot-credits-explained.jpg"]
og_headline: "What Are Copilot Credits?"
og_glyph: "list"
tags:
  - copilot
  - pricing
  - copilot-credits
  - copilot-studio
  - ai-agents
faq:
  - question: "What are Copilot Credits?"
    answer: "Copilot Credits are Microsoft's metered currency for agent work — the unit consumed when an agent answers a question, takes an action, or grounds on your organisation's data. They're a consumption meter, not a subscription: separate from Copilot Pro, Microsoft 365 Premium, and the per-user Microsoft 365 Copilot licence. You buy them pay-as-you-go or prepaid, and a lot of internal licensed usage is zero-rated."
  - question: "How much does a Copilot Credit cost?"
    answer: "Pay-as-you-go is $0.01 per Copilot Credit (US list, June 2026), billed monthly through an Azure subscription. If usage is steady, a prepaid capacity pack is commonly listed at $200 for 25,000 credits per month — about $0.008 a credit if you use them all. Larger rollouts can pre-purchase Copilot Credit Commit Units (CCCUs). Prices vary by region and agreement, so confirm Microsoft's live figure."
  - question: "What replaced Copilot messages?"
    answer: "Copilot Credits did. On 1 September 2025 Microsoft changed the common currency for agents from messages to Copilot Credits. The prepaid pack quantity and the pay-as-you-go rate didn't change — what changed is the name and how usage is counted, moving from a flat per-message count to feature-based rates where different actions cost different amounts."
  - question: "Is one Copilot Credit the same as one message?"
    answer: "No. Messages were the old packaging term Copilot Studio used before 1 September 2025. Credits are feature-based, so a single user turn can cost 1, 2, 5, 10 or more credits depending on what the agent does — a classic answer is 1 credit, but grounding on your tenant data is 10. Don't budget one credit per chat."
  - question: "What actions use Copilot Credits?"
    answer: "Consumption is feature-based, so one user turn can draw several credits. Published rates: a classic answer is 1 credit, a generative answer 2, an agent action 5, and Microsoft Graph tenant grounding 10. Voice, AI tools, content processing, agent flows and reasoning models have their own rates. The full denomination table is below."
  - question: "Are Copilot Credits the same as a Microsoft 365 Copilot licence?"
    answer: "No. The $30/user/month Microsoft 365 Copilot licence is a per-user subscription for human-facing Copilot. Copilot Credits are a separate consumption meter for agent work. Holding a Microsoft 365 Copilot licence does zero-rate a lot of internal, employee-facing agent usage within fair-use limits — but the credits and the licence are two different things on your bill."
  - question: "Do Copilot Credits expire or roll over?"
    answer: "Prepaid capacity packs are monthly — they replenish each month, and unused prepaid credits do not roll over to the next month. Pay-as-you-go has no monthly cap and nothing to lose, because you're billed only for the credits you actually use at $0.01 each. Pre-purchased CCCUs are a one-year prepaid commitment bought up front."
  - question: "Are Copilot Credits included with Microsoft 365 Copilot?"
    answer: "Not as a credit allowance — a Microsoft 365 Copilot licence doesn't come with a monthly bucket of credits. But a lot of usage is zero-rated: for licensed users, employee-facing agents inside Microsoft 365 Copilot, Teams or SharePoint run without paid credits, within fair-use limits (classic and generative answers, agent actions and Microsoft Graph grounding). You still pay credits for external or customer-facing agents, unlicensed users, and standalone channels."
  - question: "Are Copilot Credits the same as Azure OpenAI tokens?"
    answer: "No. Tokens measure raw model input and output at the API level. Copilot Credits are Microsoft's product-level billing meter for Copilot agent actions — answering, grounding, taking an action, running a flow. A single credit-charged action may use many tokens underneath, but you're billed in credits, not tokens, for Copilot Studio and Copilot agent usage."
  - question: "How do I see my Copilot Credit usage?"
    answer: "The main view is the Power Platform admin centre, under Licensing then Copilot Studio — it shows prepaid capacity, pay-as-you-go credits, consumption by product and environment, and billed versus non-billable credits. For Microsoft 365 Copilot Chat agents you pick the Copilot Chat environment. Some Copilot Chat billing setup also lives in the Microsoft 365 admin centre."
  - question: "What happens if I run out of Copilot Credits?"
    answer: "It depends how your tenant is set up. On a prepaid capacity pack alone, usage can be limited once the monthly pack is exhausted. If you also enable pay-as-you-go, overage is billed at $0.01 per credit through Azure so the agent keeps working. Admins can set monthly consumption limits per agent and alerts to avoid surprises."
  - question: "Can I use my GitHub Copilot credits for Copilot or Cowork?"
    answer: "No. GitHub Copilot is billed through GitHub and meters its AI usage in GitHub AI Credits, separate from Microsoft's Copilot Credits. Neither can be spent on Copilot agents or Cowork. The one prepaid plan that can cover both worlds is the Microsoft Agent Pre-Purchase Plan — see our guide to the Copilot and GitHub pre-purchase plans for the full breakdown."
sitemap:
  priority: 0.8
founder_note: |
  Ever since agents became the headline, one word keeps coming up in pricing conversations: *credits*. People see "Copilot Credits" on a slide or an invoice and quietly wonder — is this a new subscription? Did my $30 licence just change? Am I about to get a surprise bill?

  So here's the plain-English version. Copilot Credits are a **meter** — the way Microsoft counts agent work, the same way your power bill counts kilowatt-hours. They're not a plan, they're not your per-user licence, and a lot of everyday use doesn't touch them at all. I'll show you what a credit is, what each action costs, what's included for free, and how to keep the meter from running away from you. Prices are the published US list rates as of June 2026 — always confirm the live figure before you budget. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Pricing & Tiers](/blog/microsoft-copilot-pricing-tiers-explained/) series.** Prices are published US list rates, current as of June 2026; actual pricing varies by currency, region and agreement, and Microsoft's figures are estimates, not quotes. Confirm on the [Copilot Studio pricing page](https://www.microsoft.com/en-us/microsoft-365-copilot/pricing/copilot-studio) and in [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing). **Last verified: 16 June 2026.**

</div>

**The short version:** Copilot Credits are Microsoft's **metered currency for agent work** — the unit consumed when an agent answers, takes an action, or grounds on your data. They're **not** a Copilot plan or licence. You buy them **pay-as-you-go ($0.01/credit)** or in **prepaid packs**, and a lot of internal, licensed Microsoft 365 Copilot usage is **zero-rated**.

<!-- 📸 Screenshot placeholder: Power Platform admin centre → Licensing → Copilot Studio (credit consumption view) — Sush to capture -->

---

> 🧩 **Quick disambiguation — three things people mix up:**
> - **Copilot Credits** = the *meter* for agent work (this page).
> - **Copilot Pro / Microsoft 365 Premium / Microsoft 365 Copilot** = per-*user subscriptions* for human-facing Copilot.
> - **Azure OpenAI tokens** = raw *model usage* at the API level.
>
> Credits are none of the other two. If you're trying to pick a *plan*, start at the [pricing hub](/blog/microsoft-copilot-pricing-tiers-explained/) instead.

---

## What is a Copilot Credit? {#what}

A **Copilot Credit** is a unit of consumption. When a Copilot agent does something — answers a question, runs an action, grounds an answer on your tenant's data — Microsoft measures that work in credits and draws them down from capacity your admin has set up.

The key idea: **it's a meter, not a seat.** A per-user licence (like Microsoft 365 Copilot at $30/user/month) is a flat subscription for a *person*. Credits are *usage-based* — they only move when an agent actually does work. Think electricity: the connection is your subscription; the kilowatt-hours are the credits.

{{< margin >}}A credit isn't "one message". Consumption is feature-based — a single question that grounds on your data and takes an action can spend several credits at once.{{< /margin >}}

---

## What replaced "messages"? {#history}

Copilot Credits have a short history worth knowing, because the older term still floats around:

- **Before 1 September 2025** — agent usage in Copilot Studio was counted in **messages**, sold in prepaid packs or pay-as-you-go.
- **On 1 September 2025** — Microsoft changed the common currency from **messages to Copilot Credits**. Crucially, the **prepaid pack quantity and the pay-as-you-go rate didn't change** — what changed is the *name* and the *way usage is counted*: from a flat per-message tally to **feature-based rates**, where different actions cost different amounts.
- **Through 2026** — Microsoft's agent and Work IQ documentation positions Copilot Credits as the **consumption meter for agent work across its AI services** — Copilot Studio, Microsoft 365 Copilot Chat agents, and agents calling Microsoft's Work IQ APIs. Per-user Copilot stays for *people*; **agent work is measured in credits** — even though a lot of internal, licensed usage is zero-rated.

So if you see "messages" in an old doc or an existing capacity pack, read it as Copilot Credits. → **Migrating from old message packs, dashboards or budgets?** See [Copilot Messages vs Copilot Credits — What Changed?](/blog/copilot-messages-vs-copilot-credits/). For how this fits the wider 2026 agent shift, see [Microsoft Build 2026 Recap — Copilot Credits](/blog/microsoft-build-2026-recap/#3-copilot-credits--the-consumption-meter-has-a-name).

---

## Where Copilot Credits are used {#where}

Credits are Microsoft's **cross-surface** agent currency — they're not only a Copilot Studio thing. The first rows below are the **paid** cases; the **zero-rated** row near the bottom is the big exception for licensed internal use:

| Surface | Copilot Credits consumed? |
|---|---|
| **Copilot Studio** agents published and used at scale | **Yes** |
| **Microsoft 365 Copilot Chat** pay-as-you-go agents | **Yes** |
| **SharePoint** agents (outside the zero-rated case) | **Yes** |
| **Autonomous / scheduled / triggered** agent runs | **Yes** |
| Some first-party **Dynamics 365** agents | **Yes** |
| Employee-facing agents used by **licensed Microsoft 365 Copilot** users **inside** Microsoft 365 Copilot / Teams / SharePoint | **Zero-rated** (fair-use limits) |
| Per-user Copilot for **people** (Free, Microsoft 365 Premium, Microsoft 365 Copilot chat) | **No** — that's a subscription, not credits |

The mental model: **people using Copilot = subscriptions; agents doing work = credits** — with internal, licensed, in-Microsoft-365 agent use mostly zero-rated.

---

## How much does a Copilot Credit cost? {#cost}

There are three ways to pay for credits. Microsoft labels them **pay-as-you-go**, **prepaid capacity packs**, and the **pre-purchase plan**:

| Way to buy | What it is | Headline rate (US, Jun 2026) | Best for |
|---|---|---|---|
| **Pay-as-you-go** | Actual credits used, billed monthly via an **Azure subscription** | **$0.01 per credit** | Pilots, variable or low volume, no commitment |
| **Prepaid capacity pack** | A monthly block of credits (replenishes each month; **no rollover**) | **$200 per 25,000 credits / month** (≈$0.008/credit if fully used) | Steady, predictable usage |
| **Pre-purchase plan (CCCUs)** | One-year prepaid **Copilot Credit Commit Units**, via Azure reservations | Volume / agreement pricing | Larger, committed rollouts |

⚠️ **Prepaid credits don't roll over** — unused credits in a month are lost, and usage can be limited once a pack is exhausted (unless you also enable pay-as-you-go for overage). Pay-as-you-go has no cap, but no volume discount either.

{{< margin >}}Rule of thumb: a $200 pack beats pay-as-you-go once you use **more than 20,000 credits a month** (20,000 × $0.01 = $200). Past 25,000, compare a second pack against pay-as-you-go overage.{{< /margin >}}

---

## What actions consume credits — the rate card {#rate-card}

This is the part people most want, and it's why "one chat = one credit" is the wrong mental model. **Consumption is feature-based.** Watch the *denominator* too — some rates are per response, some per 10 responses, per page, per minute, or per 1,000 tokens. Published rates (US, June 2026):

| Action | Copilot Credits |
|---|---|
| Classic answer | 1 |
| Generative answer | 2 |
| Agent action *(incl. Computer-Using Agents)* | 5 |
| Tenant graph grounding (Microsoft 365 data) | 10 |
| Agent flow actions | 13 per 100 actions |
| AI tools (basic / standard / premium) | 1 / 15 / 100 per 10 responses |
| Reasoning ("deep reasoning") models | feature rate + 10 / 1,000 tokens (premium AI tools) |
| Content processing | 8 per page |
| Voice — classic / GenAI / premium GenAI | 10 / 35 / 75 per minute |

A single user turn can stack several of these. Ask an agent a question that grounds on your tenant data *and* takes an action, and you've spent roughly **2 + 10 + 5 = 17 credits** on one turn — about 17 cents pay-as-you-go.

A rate shown "per 1,000 tokens" or "per minute" is still billed in **Copilot Credits** — it's a credit denomination, not a separate Azure OpenAI token bill.

{{< margin >}}The big spenders to watch: tenant graph grounding (10), voice (up to 75/min), premium AI tools (100 per 10 responses) and reasoning models. Classic and generative answers are the cheap part.{{< /margin >}}

> 🏗️ If you're specifically pricing a **Copilot Studio** build — the free-vs-paid boundary, the licensing options, and a worked monthly estimate — that's its own guide: **[Is Copilot Studio Free? Pricing & Credits Explained](/blog/copilot-studio-pricing/)**. This page is the credit *rate card* those costs are built from.

---

## What does NOT consume credits {#not}

Just as important as what costs credits is what doesn't:

- **Per-user subscriptions.** Free Copilot, Microsoft 365 Premium and the human-facing Microsoft 365 Copilot experience are flat subscriptions — using Copilot as a person doesn't burn credits.
- **Building and testing.** The Copilot Studio trial and in-context Agent Builder let you create and try agents — basic building and testing generally doesn't require paid consumption; publishing and real usage is where credits start.
- **Internal, licensed, in-Microsoft-365 agent use.** A lot of employee-facing usage is **zero-rated** for **Microsoft 365 Copilot licensed** users — the [decision table below](#does-microsoft-365-copilot-include-copilot-credits) shows exactly when.

⚠️ "Zero-rated" isn't quite "unlimited free credits" — it's *included within fair-use limits* for that specific employee-facing scenario.

### Does Microsoft 365 Copilot include Copilot Credits? {#does-microsoft-365-copilot-include-copilot-credits}

A common question, so here's the direct answer: **no — a Microsoft 365 Copilot licence doesn't come with a monthly allowance of Copilot Credits.** What it gives you is **zero-rated** usage for the right scenarios, not a credit balance you can spend anywhere.

**Included (zero-rated) when *all* of these are true:**
- The user has a **Microsoft 365 Copilot licence**
- The agent is **employee-facing / internal**
- It runs **inside Microsoft 365 Copilot, Teams or SharePoint**
- Usage stays within **fair-use limits**

**You still buy credits for:**
- **External / customer-facing** agents
- **Unlicensed** users (no Microsoft 365 Copilot licence)
- **Standalone channels** — public web, phone, messaging apps
- **Autonomous, scheduled or triggered** runs, and any usage **outside the licensed, employee-facing Microsoft 365 boundary**

**The decision line:** if it's internal **and** licensed **and** on a Microsoft 365 surface **and** within fair-use limits, you probably don't need to buy credits. If any part of that sentence is false, budget for credits.

| Scenario | Credits needed? |
|---|---|
| Licensed employees using an internal HR agent inside Teams | **No** — zero-rated (fair-use) |
| That same agent opened to **customers** on your public website | **Yes** |
| **Unlicensed** staff using an internal agent | **Yes** |
| An **autonomous or scheduled** agent run — even for internal operations | **Yes** — autonomous agent actions consume credits |

---

## How to estimate and control credit spend {#control}

### Estimate it first (credit math only)

This is the **credit** side of the bill. For a full Copilot Studio build estimate — channels, connectors, licensing — use the [Copilot Studio pricing guide](/blog/copilot-studio-pricing/).

> **Monthly credits ≈ users × interactions per user × credits per interaction**
> then **× $0.01** (pay-as-you-go) or compare against **$200 / 25,000-credit** packs.

Worked example *(a paid scenario — say a customer-facing agent, or unlicensed users)*: 200 users × 20 interactions/month × ~8 credits each ≈ **32,000 credits/month**. Three ways that lands:

- **Pay-as-you-go:** 32,000 × $0.01 = **$320**
- **One prepaid pack + overage:** $200 (25,000) + 7,000 × $0.01 = **$270** *(if you've enabled pay-as-you-go for overage)*
- **Two prepaid packs:** **$400** for 50,000 credits — headroom, but unused credits don't carry over

*(If those were licensed employees using the agent inside Microsoft 365 Copilot, much of this would be zero-rated.)* Use Microsoft's [agent usage estimator](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-usage-estimator) to model your own mix.

### Keep it predictable

Consumption billing is **off by default** — turning it on is also where you set the guardrails:

- **Activate deliberately.** A tenant admin enables credits in the **Microsoft 365 admin centre** (for Copilot Chat agents) or links an environment to an Azure subscription with a **billing policy** in the **Power Platform admin centre** (for Copilot Studio). That activation step is where you set the rules of the road.
- **Use credit policies.** You can run up to **10 Copilot credit policies** per tenant, scoping which agents and services can spend, and (for Copilot Chat) running prepaid-only without Azure pay-as-you-go.
- **Cap per agent.** Admins can set **monthly consumption limits on individual agents**, plus alert emails as usage approaches a threshold.
- **Monitor usage.** For Copilot Studio, the **Power Platform admin centre → Licensing → Copilot Studio** view shows prepaid capacity, pay-as-you-go credits, consumption by product and environment, and billed versus non-billable credits. For Microsoft 365 pay-as-you-go, billing also surfaces in the **Microsoft 365 admin centre** and **Azure Cost Management**.
- **Separate dev / test / production** environments so experiments don't draw down production capacity.

---

## Prerequisites & adjacent costs {#prereqs}

Before you switch on paid usage:

- **Pay-as-you-go needs an Azure subscription** — linked to a Power Platform environment via a billing policy.
- **The "free" Copilot Studio user licence** (for makers) requires your tenant to have a **prepaid Copilot Credit pack** in place first — so the licence is free, but running still consumes credits.
- **Adjacent services bill separately.** Premium connectors, Dataverse, Power Automate and any Azure resources your agent calls have their **own** charges, distinct from Copilot Credits.

---

## Where to go next

- **[Microsoft Copilot Pricing & Tiers Explained](/blog/microsoft-copilot-pricing-tiers-explained/)** — the hub: every Copilot plan on one page
- **[Proving Copilot ROI — The Field Guide](/blog/copilot-roi-field-guide/)** — credits are the cost; this is how you prove the return, with the [ROI Calculator](/roi-calculator/)
- **[Is Copilot Studio Free? Pricing & Credits Explained](/blog/copilot-studio-pricing/)** — what a Copilot Studio build actually costs
- **[Copilot Pro vs Microsoft 365 Copilot](/blog/copilot-pro-vs-microsoft-365-copilot/)** — personal vs work (the subscriptions, not the meter)
- **[Microsoft Build 2026 Recap](/blog/microsoft-build-2026-recap/#3-copilot-credits--the-consumption-meter-has-a-name)** — how Copilot Credits fit the wider 2026 agent shift
- **[Token Calculator](/token-calculator/)** — model the cost of AI usage
- **[Microsoft 365 Copilot Cost Management & Billing](/blog/microsoft-365-copilot-cost-management/)** — how usage is billed and controlled: the admin Cost Management dashboard, spending policies, P3, and the P1/P2/P3 myth
- **[Copilot & GitHub Pre-Purchase Plans (P3) Explained](/blog/microsoft-copilot-github-pre-purchase-plans-p3/)** — the four pre-purchase plans, and whether GitHub credits can pay for Cowork
