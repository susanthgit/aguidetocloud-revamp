---
title: "Is Copilot Studio Free? Pricing, Credits & PAYG Explained"
list_title: "Is Copilot Studio Free? Pricing & Credits Explained"
hub_id: "copilot-pricing"
description: "Is Copilot Studio free? What it costs in 2026 — the trial, what's included with Microsoft 365 Copilot, and Copilot Credits (pay-as-you-go vs prepaid)."
date: 2026-06-16
lastmod: 2026-06-16
card_tag: "AI Agents"
tag_class: "ai"
images: ["images/og/blog/copilot-studio-pricing.jpg"]
og_headline: "Is Copilot Studio Free?"
og_glyph: "compare"
tags:
  - copilot
  - copilot-studio
  - pricing
  - ai-agents
faq:
  - question: "Is Copilot Studio free?"
    answer: "Partly. You can build and test agents for free — there's a Copilot Studio trial, and the in-context Agent Builder is included for Microsoft 365 Copilot licensed users. What costs money is publishing and running agents at scale: that's billed in Copilot Credits, either pay-as-you-go ($0.01 per credit on Azure) or prepaid ($200 per 25,000 credits a month). So: free to try and build, paid once real usage consumes credits."
  - question: "Do Microsoft 365 Copilot users get Copilot Studio for free?"
    answer: "For employee-facing agents, largely yes. Microsoft zero-rates Copilot Studio usage for authenticated Microsoft 365 Copilot licensed users when the agent runs in Microsoft 365 Copilot, Teams or SharePoint — including classic and generative answers and Microsoft Graph grounding — subject to fair-use limits. It's NOT free for external/customer-facing agents, unlicensed users, or standalone channels; those consume paid Copilot Credits."
  - question: "How much does it cost to run a Copilot Studio agent?"
    answer: "It depends on usage, because billing is feature-based, not per-message. Agents draw Copilot Credits: a classic answer is 1 credit, a generative answer 2, an agent action 5, and Microsoft Graph tenant grounding 10. You pay either $0.01 per credit pay-as-you-go (via an Azure subscription) or $200 for a 25,000-credit prepaid pack per month. Estimate monthly cost as: users × interactions × credits per interaction × credit price."
  - question: "What is a Copilot Credit?"
    answer: "Copilot Credits are the billing unit Microsoft moved Copilot Studio to on 1 September 2025 (they replaced the old per-message billing — the pack quantities and rates didn't change, just the name and the way usage is counted). Different actions consume different amounts: a classic answer is 1 credit, a generative answer 2, an agent action 5, tenant graph grounding 10, and so on. One user turn can burn several credit types."
  - question: "Do unused Copilot Studio credits roll over?"
    answer: "No. Prepaid Copilot Credit capacity is monthly — unused credits don't carry into the next month, and if you exhaust the pack, usage can be limited. Pay-as-you-go has no monthly cap but no discount either: you're billed for the actual credits used at $0.01 each. So right-size your prepaid packs, or stay on pay-as-you-go while usage is still unpredictable."
  - question: "What's the difference between Agent Builder and Copilot Studio for cost?"
    answer: "Microsoft 365 Copilot Agent Builder is the lightweight, in-context builder included for Microsoft 365 Copilot licensed users — great for internal Microsoft 365 agents at no extra charge. Standalone Copilot Studio is what you need (and pay for) when you publish to external channels, let unlicensed users access the agent, or want pay-as-you-go / prepaid capacity. Rule of thumb: internal + licensed = Agent Builder; external or at-scale = Copilot Studio."
sitemap:
  priority: 0.8
founder_note: |
  "Is Copilot Studio free?" is one of those questions where the honest answer is *"yes, and no, and it depends"* — which is exactly why people end up confused on Microsoft's pricing page.

  So here's the plain-English version. You can absolutely build and test for free. You start paying when real people use your agent at real volume — and Microsoft meters that in something called Copilot Credits. I'll show you what's free, what isn't, what a credit actually costs, and a simple way to estimate your monthly bill before you commit. Prices are the published US list rates as of June 2026 — they move, so always confirm on Microsoft's page. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Pricing & Tiers](/blog/microsoft-copilot-pricing-tiers-explained/) series.** Prices are published US list rates, current as of June 2026; actual pricing varies by currency, region and agreement, and Microsoft's figures are estimates, not quotes. Confirm on the [Copilot Studio pricing page](https://www.microsoft.com/en-us/microsoft-365-copilot/pricing/copilot-studio). **Last verified: 16 June 2026.**

</div>

**The short version:** **You can build and test Copilot Studio agents for free** — there's a trial, and the in-context Agent Builder is included with Microsoft 365 Copilot. **You start paying when you publish and run agents at scale**, billed in **Copilot Credits** — either **pay-as-you-go ($0.01/credit)** or **prepaid ($200 per 25,000 credits/month)**. For Microsoft 365 Copilot users, internal employee-facing agents are largely **zero-rated**.

<!-- 📸 Screenshot placeholder: Copilot Studio pricing page on microsoft.com (Sush to capture) -->

> 🏗️ Choosing *which* tool to build with (Agent Builder vs Copilot Studio vs Azure AI Foundry) is a different question — this guide is **only about Copilot Studio pricing**. For the build-tool comparison, see [Agent Builder vs Copilot Studio vs Foundry](/blog/agent-builder-vs-copilot-studio-vs-foundry/).

---

> 🧩 **Quick disambiguation:** *Copilot Credits* are **not** Copilot Pro, Microsoft 365 Premium, or Microsoft 365 Copilot — those are **user subscriptions**. Copilot Credits are the **runtime meter** for Copilot Studio agents. This page is about the credits.

## Free vs paid — the boundary at a glance {#boundary}

| Scenario | Pay Copilot Credits? |
|---|---|
| Building & testing in the Copilot Studio trial | No (you just can't *publish* on the trial) |
| Agent used by **authenticated, Microsoft 365 Copilot–licensed** users **inside** Microsoft 365 Copilot / Teams / SharePoint | Generally **included / zero-rated** (fair-use limits) |
| The same agent exposed **outside** those Microsoft 365 surfaces | **Yes** |
| **External / customer-facing / anonymous** users, or users **without** a Microsoft 365 Copilot licence | **Yes** |
| **Autonomous / scheduled / triggered** runs and agent actions | **Yes** |
| Premium connectors, Dataverse, Power Automate, Azure services the agent calls | Separate costs (not Copilot Credits) |

The phrase to remember: it's included **only when** usage is internal, authenticated, licensed, *and* on a Microsoft 365 Copilot surface. Anything past that, the meter runs.

---

## When do you actually start paying? {#when-you-pay}

This is the real question. Work down the list — the first "yes" tells you roughly where you stand:

1. **Just experimenting / building / testing?** → Free. The Copilot Studio trial lets you create and test agents (you just can't publish them under the trial).
2. **Agent used only by *licensed Microsoft 365 Copilot* users, inside Microsoft 365 (Copilot, Teams, SharePoint)?** → Largely **included / zero-rated**, within fair-use limits.
3. **Published more broadly — external/customer-facing, unlicensed users, or its own channel (web, phone, WhatsApp)?** → **Expect Copilot Credit consumption.** This is where costs appear.
4. **Usage predictable and steady?** → A **prepaid capacity pack** ($200 / 25,000 credits/month) is usually cheaper.
5. **Usage variable or pilot-stage?** → **Pay-as-you-go** ($0.01/credit via Azure) avoids committing.

{{< margin >}}The single biggest cost surprise: external or customer-facing agents. Internal, licensed, Microsoft-365-surface usage is the part Microsoft mostly zero-rates.{{< /margin >}}

---

## Is Copilot Studio free? {#is-it-free}

Three different "free" stories get muddled together — here's each one straight:

- **Free to build & test:** The **Copilot Studio trial** lets you create agents and try them in the test panel. The catch: you **can't publish** an agent on the trial.
- **Free for internal M365 Copilot agents:** If your users are **Microsoft 365 Copilot licensed**, employee-facing agents they use inside Microsoft 365 are **zero-rated** (more on the boundary below).
- **A "free" Copilot Studio licence — with a condition:** Microsoft offers a Copilot Studio user licence at no charge, but it requires your tenant to have a **prepaid Copilot Credit pack** in place first. So the *licence* is free; the *running* still consumes credits.

So "is it free?" → **free to try and build; you pay once real usage consumes credits.**

---

## The pricing models {#models}

Copilot Studio has three ways to pay (Microsoft labels them **Licence**, **Pre-purchase plan**, **Pay-as-you-go**):

| Model | What it is | Headline rate (US, Jun 2026) | Best for |
|---|---|---|---|
| **Pay-as-you-go** | Bills actual Copilot Credits used, monthly, via an **Azure subscription** | **$0.01 per Copilot Credit** | Variable / pilot usage, no commitment |
| **Prepaid capacity pack** | A monthly subscription block of credits | **$200 per 25,000 credits / month** (≈$0.008/credit if fully used) | Predictable, steady usage |
| **Pre-purchase plan** | Bulk **Copilot Credit Commit Units (CCCUs)** bought up front | Volume/agreement pricing | Larger, committed rollouts |

⚠️ **Prepaid credits don't roll over** — unused credits in a month are lost, and capacity can be enforced if you go over. Pay-as-you-go has no cap but no discount either.

**Which should you choose?** Use **pay-as-you-go** for pilots and unpredictable or low volume; **prepaid capacity** once usage is steady and consistently near or above 25,000 credits/month; and the **pre-purchase plan (CCCUs)** for larger committed rollouts your procurement prefers to handle up front.

<!-- 📸 Screenshot placeholder: Power Platform admin center → billing policy / pay-as-you-go setup (Sush to capture) -->

---

## What's a Copilot Credit? (and why it's not "one message") {#credits}

Since **1 September 2025**, Copilot Studio is metered in **Copilot Credits** — they replaced the old "messages" unit (the pack sizes and rates didn't change, just the name and how usage is counted). The important part: **consumption is feature-based**, so one user turn can burn several credits depending on what the agent does.

Published per-action rates (the headline ones):

| Action | Copilot Credits |
|---|---|
| Classic answer | 1 |
| Generative answer | 2 |
| Agent action | 5 |
| Tenant graph grounding (Microsoft 365 data) | 10 |

The full denomination table — voice, AI tools, content processing, agent flows and reasoning models — lives in the **[Copilot Credits rate card](/blog/copilot-credits-explained/#rate-card)**.

{{< margin >}}Don't budget "one chat = one credit." A single question that grounds on your tenant data and takes an action can be 2 + 5 + 10 credits.{{< /margin >}}

---

## What's included with Microsoft 365 Copilot {#included}

If you have **Microsoft 365 Copilot**, a lot of Copilot Studio usage is **zero-rated** — but the boundary matters:

**Included (no extra charge), within fair-use limits:**
- Agents used by **authenticated Microsoft 365 Copilot licensed users**
- Running inside **Microsoft 365 Copilot, Teams, or SharePoint**
- Including classic answers, generative answers, and Microsoft Graph tenant grounding

**Not included (consumes paid credits):**
- **External / customer-facing** agents
- **Unlicensed** users (no Microsoft 365 Copilot licence)
- Standalone / external **channels** (public web, phone, messaging apps)

So the mental model: **internal + licensed + Microsoft 365 surface = mostly free; everything past that = metered.**

→ Wondering specifically whether a **Microsoft 365 Copilot licence** covers credits? See [Does Microsoft 365 Copilot include Copilot Credits?](/blog/copilot-credits-explained/#does-microsoft-365-copilot-include-copilot-credits)

---

## What changes your cost? {#cost-drivers}

Copilot Studio cost is driven by *usage*, not a flat fee. The dials that move your bill:

- **How many people** use the agent
- **How often** they interact (conversations per user)
- **What the agent does** — generative answers, actions, and graph grounding cost more than classic answers
- **Internal vs external** audience (external = paid)
- **Autonomous / triggered** runs (agents acting on their own)
- **Adjacent services** — Power Automate flows, Dataverse, connectors and Azure resources can add their own costs

### A simple way to estimate

> **Monthly credits ≈ users × interactions per user × credits per interaction**
> then **× $0.01** (pay-as-you-go) or compare against **$200 / 25,000-credit** packs.

Worked example *(a **paid** scenario — say a customer-facing agent, or users without a Microsoft 365 Copilot licence)*: 200 users × 20 interactions/month × ~8 credits each ≈ **32,000 credits/month** → about **$320 pay-as-you-go**, or **two prepaid packs** ($400 for 50,000) if you want headroom. *(If those were licensed employees using the agent inside Microsoft 365 Copilot, much of this would be zero-rated instead.)* Always validate with Microsoft's usage reports once you're live — real credit burn depends on what your agents actually do.

---

## How to keep the bill predictable {#monitor}

- Watch **Copilot Studio analytics** and the **Power Platform admin centre** capacity reports.
- Use **Azure Cost Management** for pay-as-you-go spend.
- Keep **dev / test / production** in separate environments.
- Start on **pay-as-you-go** for a pilot, then move to prepaid once usage is predictable.
- Review the **high-credit actions** — generative answers, graph grounding, voice and autonomous triggers add up fastest.

---

## Prerequisites & adjacent costs {#prereqs}

Before you switch on paid usage, know the dependencies:

- **Pay-as-you-go needs an Azure subscription** — you link a Power Platform environment to it with a **billing policy** in the Power Platform admin centre.
- **Power Platform governance** matters — environments, data loss prevention, and admin controls should be set before a broad rollout.
- **Dataverse, connectors, Power Automate and Azure resources** your agent calls can create their **own** charges, separate from Copilot Credits.

---

## Where to go next

- **[Microsoft Copilot Pricing & Tiers Explained](/blog/microsoft-copilot-pricing-tiers-explained/)** — the hub: every Copilot plan on one page
- **[Agent Builder vs Copilot Studio vs Foundry](/blog/agent-builder-vs-copilot-studio-vs-foundry/)** — which build tool to choose (the capability comparison)
- **[Token Calculator](/token-calculator/)** — model the cost of AI usage
