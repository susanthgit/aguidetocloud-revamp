---
title: "Microsoft Copilot Cowork — New 2026 Pricing Guide"
list_title: "Cowork: Pricing and cost management"
description: "Microsoft Copilot Cowork pricing guide in plain English — the new 2-part hybrid model, decision framework, and worked cost-management examples."
date: 2026-06-15
lastmod: 2026-06-15
draft: false
card_tag: "Cowork"
tag_class: "ai"
images: ["images/og/blog/microsoft-copilot-cowork-pricing-cost-management.jpg"]
og_headline: "Cowork: pricing explained"
og_glyph: "compare"
tags:
  - microsoft-365
  - copilot
  - cowork
  - pricing
  - ai
hub_id: "cowork"
layout: "notebook"
stamp: "pricing guide"
intro_note: "↗ the hybrid pricing model in plain English — when per-seat works, when consumption kicks in, and how to model cost before you commit"
sitemap:
  priority: 0.8
founder_note: |
  Pricing is where most Cowork conversations land for me with customers. The new model is a real shift — Microsoft is moving from per-user-only to per-user PLUS usage-based consumption. This page is the version I keep linking to when finance teams ask "what will this actually cost us?"
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Pricing details land at GA on 17 June 2026 NZST — this page updates with exact rates and worked examples then. **Last verified: 15 June 2026 · pre-GA structure.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is, how it works, and the honest take. This spoke is the pricing and cost-management reference.*

---

## TL;DR

<!-- TODO Atlas/Sush: confirm every bullet against official Microsoft GA sources before this ships. Structure pre-staged 16 Jun; figures land at GA. -->

- Cowork uses a **hybrid pricing model** — a Copilot entry-point seat plus usage-based consumption for Cowork's heavier multi-step work
- Consumption is billed in **Copilot Credits**, available **pay-as-you-go** or **prepurchased**
- Cost is driven by **4 factors**: the **model** used, the **tools** invoked, the **runtime** of the task, and the **context** pulled in
- A built-in **FinOps Experience** gives admins visibility, budgets, and controls over credit consumption
- Decision framework: light users may stay near the entry seat; heavy users move into consumption territory

---

## What changed at GA

<!-- PRE-GA STUB — fill from official Microsoft GA blog + Microsoft Learn after 17 Jun NZST. Source todos: ga-pricing-4-factors, ga-copilot-credits, ga-finops-experience. -->

This section gets the headline pricing announcement from Microsoft on GA day — the entry-seat price, the credit model, and how the Frontier-preview access path transitions to GA.

---

## The two parts of the new model

### Part 1 — The Copilot entry point (per-seat)

The baseline seat that gives a user access to Cowork. What's included, who it's for, what it costs — confirmed at GA.

### Part 2 — Consumption (Copilot Credits)

The usage-based layer for Cowork's heavier work, billed in Copilot Credits and driven by the 4 factors below.

---

## What drives the cost — the 4 factors

> 🚧 **Structure pre-staged 16 Jun 2026 · figures land at GA.** The cost model below is scaffolded from the GA announcement structure. Exact rates, units, and any free allotments are filled in from official Microsoft sources on GA day — nothing here is a real number yet.

Cowork consumption pricing is driven by **four factors**. Understanding these four is the key to estimating and controlling cost:

| # | Factor | What it means | What raises it |
|---|---|---|---|
| 1 | **Model** | Which AI model Cowork uses for a task | Higher-capability models cost more per unit of work than lighter ones |
| 2 | **Tools** | The skills and tools a task invokes (document creation, search, plugins) | More tool calls in a task = more consumption |
| 3 | **Runtime** | How long a task runs — Cowork tasks can run for minutes or hours | Longer-running, multi-step tasks consume more |
| 4 | **Context** | How much context the task pulls in (emails, files, meetings, data) | Larger context windows / more data grounding = more consumption |

<!-- TODO Atlas/Sush GA-day: verify these 4 factor names against the official Microsoft GA blog + Microsoft Learn. Pre-call shorthand was Model / Tools / Runtime / Context — confirm Microsoft's public naming matches before this ships. Add per-factor rate detail once published. Source = ga-pricing-4-factors todo. -->

The practical implication: a quick single-skill task on a light model with little context is cheap. A long-running, multi-skill task on a high-capability model that grounds across your whole mailbox is the expensive end of the spectrum. Most real-world tasks sit in between.

---

## Copilot Credits — how consumption is billed

> 🚧 **Structure pre-staged 16 Jun 2026 · figures land at GA.**

Cowork consumption is billed through **Copilot Credits**. There are two ways to buy them:

### Pay-as-you-go (PAYG)

<!-- TODO Atlas/Sush GA-day: verify the PAYG model from official Microsoft sources. What's the credit unit? Is there a monthly free allotment per licensed user? How does PAYG get enabled (Azure subscription link)? Source = ga-copilot-credits todo. -->

You consume credits as tasks run, billed in arrears. Best for teams with unpredictable or spiky usage who don't want to commit upfront.

### Prepurchased credits

<!-- TODO Atlas/Sush GA-day: verify the prepurchase/commitment model. Volume discount tiers? Expiry on prepurchased credits? How they're bought (admin centre / EA / MCA)? -->

You buy a block of credits upfront, typically at a better effective rate. Best for teams with steady, predictable Cowork usage who want budget certainty.

### How credits map to the 4 factors

<!-- TODO Atlas/Sush GA-day: once rates are public, add the worked mapping showing how a task's Model + Tools + Runtime + Context translate into a credit cost. This is the section customers will reference most. -->

The four cost factors above are what each task draws credits against. A worked example with real credit costs lands here on GA day.

---

## The FinOps Experience

> 🚧 **Structure pre-staged 16 Jun 2026 · details land at GA.**

Microsoft is introducing a **FinOps Experience** for Cowork — a cost-management surface for tracking, modelling, and controlling Copilot Credit consumption across your organisation.

<!-- TODO Atlas/Sush GA-day: verify the FinOps Experience from official Microsoft Learn / M365 admin docs. Where does it live (M365 admin centre? a dedicated cost dashboard?)? What can admins actually DO in it — budgets, alerts, per-user caps, per-department chargeback, forecasting? Screenshots from Sush's tenant once GA-enabled. Source = ga-finops-experience todo. Do NOT publish internal pre-call details — only what Microsoft makes public. -->

What we expect it to cover (to be confirmed against public docs at GA):

- **Usage visibility** — who's consuming credits, on what, how much
- **Budgets and alerts** — set spend thresholds, get warned before overrun
- **Cost modelling** — forecast consumption before you commit
- **Controls** — per-user or per-group caps to prevent runaway spend

Screenshots from a live tenant land here once the FinOps Experience is enabled post-GA.

---

## When per-seat is enough vs when consumption kicks in

A decision framework based on typical Cowork use patterns.

| Pattern | Likely model |
|---|---|
| Light Cowork use (a few tasks per week per user) | Entry seat may cover it |
| Heavy Cowork use (multiple long-running tasks daily) | Entry seat + consumption credits |
| Mixed team (some heavy users, mostly light) | Entry seat + consumption with admin caps via FinOps |

---

## How to estimate consumption for your org

A practical worked example template — once GA pricing lands, this becomes a real worked example mapping a typical week of tasks to the 4 factors and a credit cost.

---

## Cost-tracking dashboard

Where admins see Cowork usage and cost — the FinOps Experience (above) is the primary surface. Screenshots from Sush's tenant land here post-GA.

---

## Procurement and billing notes

How Cowork credits show up on your Microsoft bill, EA vs MCA differences, PAYG vs prepurchase mechanics.

---

## ⏳ Grace period and billing setup (16–30 June 2026)

> 🚧 **Structure pre-staged 16 Jun 2026 · exact rules confirmed at GA.** This is time-sensitive billing guidance — every date and rule below is verified against official Microsoft sources before it ships. Do not act on this section until it shows a "verified" date.

There's a **transition window** for organisations moving from the Frontier preview into the GA billing model.

<!-- TODO Atlas/Sush GA-day: HIGH STAKES — verify EVERY detail below against official Microsoft Learn / M365 admin centre / Message Center before publishing. Billing-guidance errors cause real customer financial confusion. Confirm: exact grace dates, who qualifies, what admins must do, what happens if they miss the deadline, how to get support. Source = ga-grace-period-billing todo (internal GA pre-call — NOT publishable until public). -->

| Question | What to confirm at GA |
|---|---|
| **How long is the grace period?** | Pre-call indicated **16 June → 30 June 2026** (two weeks). Confirm exact end date. |
| **Who qualifies?** | Pre-call indicated **organisations with active Cowork users in Frontier prior to 16 June**. Confirm the qualification rule. |
| **What must admins do?** | Pre-call indicated **set up and enable usage billing before 1 July**. Confirm the exact admin steps + where in the admin centre. |
| **What happens if you miss it?** | Confirm the consequence (does consumption pause, block, or fall back to a default?). |
| **Where to get help?** | Pre-call mentioned the account team. Confirm the official support path for customers. |

### Admin action checklist (to finalise at GA)

Once verified, this becomes a clear "do this by 1 July" checklist for IT admins:

1. ☐ Confirm whether your org qualifies (active Frontier Cowork usage before 16 June)
2. ☐ Set up usage billing in the admin centre *(exact location confirmed at GA)*
3. ☐ Enable Copilot Credits (PAYG or prepurchase) before 1 July
4. ☐ Set budgets / caps in the FinOps Experience if you want spend control from day one
5. ☐ Contact your account team or Microsoft support if anything is unclear

> ⚠️ **If your organisation used Cowork during the Frontier preview, don't ignore this window.** The grace period is the bridge from "free preview" to "metered GA" — missing the billing-enablement step could interrupt access. (Exact consequence confirmed at GA.)

---

## Frequently asked questions

<!-- PRE-GA STUB — populated post-GA from real customer questions -->

---

## Other Cowork spokes

- [Cowork: How to use it step by step](/blog/microsoft-copilot-cowork-how-to-use-step-by-step/)
- [Cowork: Use cases by role](/blog/microsoft-copilot-cowork-use-cases-by-role/)
- [Cowork: Prompts to try](/blog/microsoft-copilot-cowork-prompts-to-try/)
- [Cowork: Skills and plugins](/blog/microsoft-copilot-cowork-skills-and-plugins/)
- [Cowork: Admin enablement and governance](/blog/microsoft-copilot-cowork-admin-and-governance/)
