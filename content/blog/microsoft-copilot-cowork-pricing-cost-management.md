---
title: "Microsoft Copilot Cowork — New 2026 Pricing Guide"
list_title: "Cowork: Pricing and cost management"
description: "Microsoft Copilot Cowork pricing in plain English — the new two-part model (Copilot seat + Copilot Credits), what drives cost, and how to manage it."
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

- Cowork uses a **two-part pricing model** — a **Microsoft 365 Copilot seat** per user, **plus usage-based consumption** for Cowork's heavier multi-step work.
- Consumption is billed in **Copilot Credits**, available **pay-as-you-go** or **prepurchased** — the same usage-based model Microsoft introduced with the [Work IQ APIs](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/announcing-the-new-work-iq-apis/).
- What a task consumes depends on **the model it uses, the tools it calls, and the context it pulls in** — light tasks are cheap; long, multi-step tasks on a heavy model cost more.
- A built-in **cost-management (FinOps) experience** in the admin centre gives admins usage visibility, billing setup, and spending limits.
- **Exact seat price, credit rates, and any free allotments land at GA** — this page updates with the real Microsoft figures then.

---

## The two parts of the model

Cowork's cost has two layers. Getting the difference clear is the key to estimating it.

### Part 1 — The Microsoft 365 Copilot seat (per user)

The baseline licence that gives a user access to Cowork: a **Microsoft 365 Copilot seat** on top of an eligible Microsoft 365 plan. This is the predictable, per-user part of the bill — the same Copilot licence that powers Chat and the in-app Copilot experiences.

### Part 2 — Consumption (Copilot Credits)

Cowork's agentic work — planning and running multi-step tasks across your apps — draws on a **usage-based** layer billed in **Copilot Credits**. This is the part that flexes with how much your team actually delegates to Cowork. You buy credits two ways:

- **Pay-as-you-go** — you consume credits as tasks run, billed in arrears. Best for spiky or unpredictable usage with no upfront commitment.
- **Prepurchased** — you buy a block of credits upfront, typically at a better effective rate. Best for steady, predictable usage and budget certainty.

> 🚧 **Exact credit unit, rates, free allotments, and the entry-seat price land at GA.** Nothing on this page is a real number yet — it updates with official Microsoft figures on GA day.

---

## What drives consumption

A few things determine how many credits a task draws, and the pattern is intuitive:

| What | Effect on cost |
|---|---|
| **The model** a task uses | Higher-capability models cost more per unit of work than lighter ones |
| **The tools / skills** a task calls | More tool calls — document creation, search, plugins — means more consumption |
| **The context** a task pulls in | More data grounding (emails, files, meetings) means more consumption |
| **How much the task does** | Longer, multi-step tasks naturally consume more than a quick single-skill task |

> Microsoft's public Work IQ pricing describes a **fixed component for tools** and a **variable component for chat and context**. The exact factor names, units, and rates for Cowork are confirmed against official Microsoft sources at GA.

The practical takeaway: a quick single-skill task on a light model with little context is cheap. A long-running, multi-skill task on a high-capability model grounded across your whole mailbox is the expensive end. Most real tasks sit in between — which is why the cost controls below matter.

---

## Managing the cost — the FinOps experience

Microsoft provides a **cost-management (FinOps) experience** in the Microsoft 365 admin centre for the Copilot Credits model. Per Microsoft's public Work IQ announcement, admins can:

- **Review credit usage** — who's consuming, on what, how much
- **Configure billing** — choose prepaid or pay-as-you-go
- **Set spending limits** — caps for tenants, groups, and users
- **Monitor requests** — keep an eye on consumption across agents and services

> 🚧 The exact dashboard location, the full set of controls, and tenant screenshots land here after GA.

---

## When per-seat is enough vs when consumption kicks in

A rough decision framework based on typical Cowork use:

| Pattern | Likely shape of the bill |
|---|---|
| Light use (a few tasks per week per user) | Mostly the per-seat layer |
| Heavy use (multiple long-running tasks daily) | Per-seat + meaningful consumption |
| Mixed team (a few heavy users, mostly light) | Per-seat + consumption, with admin caps to contain the heavy users |

Once GA rates are public, this page adds a **worked example** mapping a typical week of tasks to a real credit cost.

---

## Frequently asked questions

**Is Cowork covered by my Microsoft 365 Copilot licence?**
The Copilot seat is the entry point, but Cowork's heavier agentic work also draws on the consumption layer (Copilot Credits). The exact split is confirmed at GA.

**Can I cap what my team spends?**
Yes — the cost-management experience lets admins set spending limits per tenant, group, and user.

**Pay-as-you-go or prepurchase — which should I pick?**
PAYG suits spiky, unpredictable usage; prepurchase suits steady usage and gives budget certainty (usually at a better effective rate).

*(More questions get added here as real customer ones come in post-GA.)*

---

## Other Cowork spokes

- [Cowork: How to use it step by step](/blog/microsoft-copilot-cowork-how-to-use-step-by-step/)
- [Cowork: Use cases by role](/blog/microsoft-copilot-cowork-use-cases-by-role/)
- [Cowork: Prompts to try](/blog/microsoft-copilot-cowork-prompts-to-try/)
- [Cowork: Skills and plugins](/blog/microsoft-copilot-cowork-skills-and-plugins/)
- [Cowork: Admin enablement and governance](/blog/microsoft-copilot-cowork-admin-and-governance/)
