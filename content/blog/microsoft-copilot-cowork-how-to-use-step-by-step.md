---
title: "Microsoft Copilot Cowork — Step-by-Step How-To Guide"
list_title: "Cowork: How to use it step by step"
description: "Microsoft Copilot Cowork step-by-step tutorial — 7 lessons covering opening it, outcome prompts, plan review, approval checkpoints, troubleshooting."
date: 2026-06-15
lastmod: 2026-06-15
draft: false
card_tag: "Cowork"
tag_class: "ai"
images: ["images/og/blog/microsoft-copilot-cowork-how-to-use-step-by-step.jpg"]
og_headline: "Cowork: step-by-step how-to"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - cowork
  - how-to
  - ai
hub_id: "cowork"
layout: "notebook"
stamp: "how-to"
intro_note: "↗ the practical walkthrough — find Cowork in your tenant, write a good prompt, review the plan, approve checkpoints, troubleshoot when it goes sideways"
sitemap:
  priority: 0.8
founder_note: |
  The first ten minutes with Cowork are the most important. Get the mental model right and everything else clicks. This page is the walkthrough I wish someone had handed me when I first tried it — and the tips I now share when colleagues ask "how do I start?"
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Screenshots from my tenant land as I capture each step — check back for visual updates. **Last verified: 15 June 2026 · pre-GA structure.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is and the agentic harness. This spoke is the step-by-step how-to reference.*

---

## TL;DR

- **Where to find Cowork** — Agent Store inside Microsoft 365 Copilot Chat
- **How to start a task** — describe an outcome, not a process
- **What to expect** — Cowork shows you a plan first, then runs it with checkpoints
- **How to stay in control** — pause, redirect, or stop at any time

---

## Step 1 — Open Cowork

Cowork lives at its own URL inside Microsoft 365 Copilot — open **`m365.cloud.microsoft/agents/cowork`** directly in your browser. It's a dedicated surface, not a tile inside another app.

The landing page is built around two things: an input box that says **"Start a task…"** (not "Send a message") and a left side rail with your task history. The core controls in the rail are **New task**, **Search**, **Scheduled**, and **Customize**.

Before you type anything, two helper sections sit on the landing page:

- **Needs your attention** — Cowork tasks already in flight that want your input (an approval, a clarification, a decision)
- **Try these next** — suggested workflows like *Organize my inbox*, *Arrange my week*, *Prep for a meeting* — good for first-time exploration

<!-- SCREENSHOT (Sush to capture clean — current capture had a side-slider rendering issue): 00-hero-cowork-main-window.png — full Cowork landing showing the dedicated surface, side rail, greeting, input, and helper sections -->

> 💡 **Mental model shift:** Cowork's input says *"Start a task…"* on purpose. Where Copilot Chat is a conversation, Cowork is a delegation. You're handing off work, not chatting through it.

---

## Step 2 — Write a good prompt (outcome-first, not process-first)

This is the single biggest mindset shift. Most people start by listing steps. Cowork works best when you describe what you want done.

**Process prompt (works less well):**
> "Open my inbox, find emails from the Contoso team, copy the budget numbers into a spreadsheet, then make a chart."

**Outcome prompt (works much better):**
> "Prep me for tomorrow's Contoso quarterly review."

Why? Cowork's planner is good at decomposing outcomes into steps. Pre-decomposed prompts skip the part Cowork is designed to do.

---

## Step 3 — Review the plan Cowork generates

<!-- SCREENSHOT: plan view with numbered steps and "Approve" / "Modify" buttons — Sush to capture from tenant -->

When Cowork has read your prompt, it shows you a plan before running. You can approve as-is, modify a step, or reject and re-prompt.

---

## Step 4 — Approval checkpoints

Cowork pauses at sensitive actions to ask permission. What triggers a checkpoint, how to approve, how to redirect mid-task.

---

## Step 5 — Stop or redirect mid-task

How to pause Cowork in flight, redirect to a different goal, or stop entirely. The "I can stop it at any time" promise is real and matters.

---

## Step 6 — Troubleshooting

Common things that go wrong on first use, and how to recover:

- Cowork doesn't show up in the Agent Store → likely a licence or tenant config issue
- A skill fails partway through → why, and how to retry
- Cowork "loops" or runs longer than expected → how to spot it and what to do
- Cowork accesses the wrong file → why this happens and how to redirect

---

## Step 7 — Tips from real use

- **Start small.** Pick a low-stakes outcome for your first task.
- **Trust the plan.** Don't over-edit Cowork's plan on first run — see what it does.
- **Use checkpoints aggressively.** Approve each step the first few times. Loosen later.
- **Build a prompt library.** Save the prompts that work — [my Cowork prompts collection](/prompts/copilot-cowork/) is one starting point.

---

## Other Cowork spokes

- [Cowork: Prompts to try](/blog/microsoft-copilot-cowork-prompts-to-try/)
- [Cowork: Use cases by role](/blog/microsoft-copilot-cowork-use-cases-by-role/)
- [Cowork: Pricing and cost management](/blog/microsoft-copilot-cowork-pricing-cost-management/)
- [Cowork: Skills and plugins](/blog/microsoft-copilot-cowork-skills-and-plugins/)
- [Cowork: Admin enablement and governance](/blog/microsoft-copilot-cowork-admin-and-governance/)
