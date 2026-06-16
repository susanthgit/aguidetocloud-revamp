---
title: "Copilot Messages vs Copilot Credits — What Changed?"
list_title: "Copilot Messages vs Credits — What Changed?"
hub_id: "copilot-pricing"
description: "Copilot Studio 'messages' became Copilot Credits on 1 Sept 2025 — and the way usage is counted changed too. What changed, what didn't, and what to do."
date: 2026-06-16
lastmod: 2026-06-16
card_tag: "Copilot"
tag_class: "ai"
images: ["images/og/blog/copilot-messages-vs-copilot-credits.jpg"]
og_headline: "Copilot Messages vs Credits"
og_glyph: "compare"
tags:
  - copilot
  - copilot-studio
  - pricing
  - copilot-credits
  - ai-agents
faq:
  - question: "What happened to Copilot Studio messages?"
    answer: "They became Copilot Credits on 1 September 2025. Microsoft changed the common currency for Copilot Studio agents from messages to Copilot Credits. Your prepaid packs carried over at the same quantity and the pay-as-you-go rate didn't change — but the way usage is counted moved to feature-based credits, so one message no longer equals one credit."
  - question: "Did Copilot Credits replace Copilot messages?"
    answer: "Yes. On 1 September 2025 Microsoft changed the common currency for Copilot Studio agents from messages to Copilot Credits. It wasn't only a rename — the way usage is counted also changed, from message-based counting to feature-based rates where different actions cost different amounts. The word 'messages' still appears in some older docs and admin URLs, but the live billing unit is Copilot Credits."
  - question: "When did Copilot messages change to Copilot Credits?"
    answer: "1 September 2025. That's the date Microsoft moved the common currency for agents from messages to Copilot Credits. Anything dated before then that talks about 'messages' is using the old term; anything current uses Copilot Credits, even if a page URL or label still says 'messages'."
  - question: "Do my old Copilot Studio message packs still work?"
    answer: "Yes. Microsoft's note on the change is explicit that there was no change in the quantity per prepaid pack or to the pay-as-you-go rate. So a prepaid pack that was 25,000 messages a month continued as 25,000 Copilot Credits a month at the same price. Microsoft documents the move as a terminology-and-metering change, not a repurchase or reconfiguration event."
  - question: "Is one Copilot Credit the same as one message?"
    answer: "No — and this is the part that causes the most confusion. Under the old model, usage was roughly counted per message. Now it's feature-based: a simple answer is about 1 credit, but a richer answer that also grounds on your data or takes an action costs more, and a single interaction can spend several credits at once. So don't assume one old message equals one credit — see the rate card for the per-action amounts."
  - question: "Why do some Microsoft pages still say 'messages'?"
    answer: "Because Microsoft hasn't retired the word everywhere. Some current Learn URLs and admin labels still contain 'messages' — for example the Power Platform admin page at .../manage-copilot-studio-messages-capacity is now titled 'Manage Copilot Studio credits and capacity'. If you see 'messages' in an older URL, label or doc, read the surrounding content: today it almost always means Copilot Credits capacity."
  - question: "How do I convert my old message estimates to credits?"
    answer: "Don't convert one-to-one. There's no official 'one message = N credits' formula, because credits are feature-based. Microsoft's guidance is to re-estimate based on what the agent actually does — classic vs generative answers, actions, Microsoft Graph grounding, voice, AI tools and flows — using the Copilot Studio agent usage estimator rather than your old message counts."
  - question: "Do I need to change anything in my tenant because of the rename?"
    answer: "Not because of the rename itself. Microsoft documents the change as a terminology-and-metering shift, not a repurchase or reconfiguration event — your prepaid pack quantity and pay-as-you-go rate didn't change. The smart move is lighter: revisit any budgets you built around 'messages', re-estimate in credits, and check your caps and alerts so feature-based consumption doesn't surprise you."
  - question: "Where do I see my Copilot Credit usage now?"
    answer: "In the Power Platform admin centre: go to Licensing, then under Products select Copilot Studio, and use the Summary and Environments tabs. The consumption grid shows which agents are using capacity, the feature consumed, and billed versus non-billable credits — even though the underlying Learn URL still says 'messages capacity'."
sitemap:
  priority: 0.7
founder_note: |
  If you've run Copilot Studio for a while, you might have noticed the word on your usage page change. *"Messages"* became *"Copilot Credits"* — and a lot of people assumed it was just a rename.

  Your entitlement carried over — packs and prices didn't change. But it isn't *only* a rename: how each interaction is counted changed too, and that's the part that matters for your budget. This is the short, practical version — what changed on 1 September 2025, what stayed exactly the same, and the one assumption you should drop. If you want the full credits explainer — rates, pricing, what's included — I'll point you to it. This page is just about the *switch*. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Pricing & Tiers](/blog/microsoft-copilot-pricing-tiers-explained/) series.** This page covers the *messages → Copilot Credits* transition. For current rates and pricing, see the [Copilot Credits guide](/blog/copilot-credits-explained/) and confirm figures in [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing). **Last verified: 16 June 2026.**

</div>

**The short version:** On **1 September 2025**, Microsoft changed the Copilot Studio usage currency from **messages** to **Copilot Credits**. Your **prepaid packs and the pay-as-you-go rate didn't change** — a 25,000-message pack simply became a 25,000-credit pack. What **did** change is the *counting*: usage is now **feature-based**, so "one message = one credit" is no longer a safe assumption. The rename itself didn't create a new charge or make you re-buy anything — but feature-based counting can change how fast you use up capacity.

<!-- 📸 Screenshot placeholder: Power Platform admin centre showing "Manage Copilot Studio credits and capacity" (note the legacy "messages" in the URL) — Sush to capture -->

---

> 🧩 **Just want to know what a credit *is*?** This page is only about the **switch** from messages to credits. For what a Copilot Credit is, the full rate card, pay-as-you-go vs prepaid pricing, and what's zero-rated, read **[What Are Copilot Credits? Rates & Costs Explained](/blog/copilot-credits-explained/)**.

---

## What changed on 1 September 2025? {#what-changed}

Microsoft's wording is precise: *"the common currency for agents changed from messages to Copilot Credits."* Here's the before-and-after:

| | Before (messages) | After (Copilot Credits) |
|---|---|---|
| **Unit name** | Copilot Studio "messages" | Copilot Credits |
| **How usage is counted** | Roughly per message | **Feature-based** — per action type |
| **One interaction** | ≈ one message | Can be **several credits** (answer + grounding + action) |
| **Budgeting question** | "How many messages?" | "What does the agent *do* per interaction?" |

The headline shift: usage is now measured by the **time and effort** an agent spends — retrieving information, answering, and taking actions — so the same chat can cost a different number of credits depending on what it actually did.

---

## What did NOT change {#what-didnt}

This is the reassuring part, and it's why most tenants didn't feel the switch:

- **Your prepaid pack quantity.** Microsoft's note is explicit: *"there's no change in the quantity per prepaid pack or to the pay-as-you-go rate."* A **25,000-message** pack continued as **25,000 Copilot Credits** a month.
- **The pay-as-you-go rate.** Still billed through an Azure subscription at the same rate ($0.01 per credit today).
- **Your billing setup.** Billing policies, environment allocation and admin controls work the same way. It's a terminology-and-metering change, not a new purchase.
- **The goal.** It's still about controlling how much agent work your tenant consumes.

{{< margin >}}Bottom line: nobody had to re-buy anything because of the rename. The packs and prices carried over; only the *name* and the *counting* changed.{{< /margin >}}

---

## Is one old message one credit? {#one-to-one}

**No.** This is the single assumption to drop.

Under the old model, a simple interaction looked roughly like one message. Under Copilot Credits, the cost depends on **what the agent does**:

- A simple **classic answer** is still about **1 credit** — so simple cases feel familiar.
- But a question that gives a **generative answer** *and* grounds on your **tenant data** can be **2 + 10 = 12 credits** on a single turn.
- Add an **action**, **voice**, or **AI tools**, and one interaction climbs further.

So an old estimate of "we send ~50,000 messages a month" tells you very little about credits until you know what your agents actually do.

> 📊 **Don't reuse old message counts.** For the full per-action rate card and a way to estimate monthly spend in credits, see **[What Are Copilot Credits? Rates & Costs Explained](/blog/copilot-credits-explained/#rate-card)**.

---

## What admins should actually do {#admin-checklist}

The rename doesn't force any action — but it's a good prompt to tidy up:

1. **Revisit old "message" budgets.** Anything you sized in messages is now a rough guide at best.
2. **Re-estimate in credits.** Use Microsoft's [agent usage estimator](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-usage-estimator), based on what your agents do — not old message volumes.
3. **Spot the expensive features.** Some actions — grounding on tenant data, voice, AI tools — cost far more than a simple answer. The [rate card](/blog/copilot-credits-explained/#rate-card) has the amounts.
4. **Check paid vs zero-rated.** A lot of internal, licensed Microsoft 365 Copilot usage is zero-rated; the [Credits guide](/blog/copilot-credits-explained/#not) has the boundary.
5. **Set caps and alerts.** You can set monthly consumption limits per agent and alerts as usage approaches a threshold. (Prepaid overage enforcement kicks in around **125%** of capacity.)
6. **Update your own docs.** Swap "messages" for "Copilot Credits" in internal runbooks so your team isn't working from the old mental model.

---

## How to read old docs, dashboards & invoices {#legacy}

Because the older term still appears in some places, you'll still bump into "messages":

- **Admin pages.** The Power Platform admin article URL still reads `.../manage-copilot-studio-messages-capacity`, but the page is now titled **"Manage Copilot Studio credits and capacity."** Same place, current term.
- **Older blog posts and docs.** If it's dated before September 2025 and talks about "messages", mentally translate to Copilot Credits — and double-check rates against a current page.
- **The rule of thumb.** If you see "messages" in a label or link, check the surrounding content and the date. Today it almost always means **Copilot Credits capacity**.

---

## When you want the Credits page instead {#which-page}

> 🧭 This page is **only** about the messages → credits *transition*. If you're trying to understand **what a Copilot Credit is**, **what each action costs**, **pay-as-you-go vs prepaid pricing**, **what's zero-rated**, or **how to estimate your monthly spend**, the right page is **[What Are Copilot Credits? Rates & Costs Explained](/blog/copilot-credits-explained/)**.

---

## Where to go next

- **[What Are Copilot Credits? Rates & Costs Explained](/blog/copilot-credits-explained/)** — the full credits guide (rates, pricing, zero-rating)
- **[Is Copilot Studio Free? Pricing & Credits Explained](/blog/copilot-studio-pricing/)** — what a Copilot Studio build costs
- **[Microsoft Copilot Pricing & Tiers Explained](/blog/microsoft-copilot-pricing-tiers-explained/)** — the hub: every Copilot plan on one page
- **[Token Calculator](/token-calculator/)** — model the cost of AI usage
