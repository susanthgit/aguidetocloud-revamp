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

This is the step most people skim — and it's the one that saves you the most time. Before Cowork touches anything, it shows you a **plan**: a numbered list of the steps it intends to take, and which apps or skills it'll use at each one (e.g. *"1. Search Outlook and Teams for Contoso → 2. Pull the latest proposal from SharePoint → 3. Draft a briefing in Word"*).

You have three options:

- **Approve as-is** — the plan looks right, let it run.
- **Modify a step** — change, reorder, or remove a step before it runs ("skip the Teams search, just use email").
- **Reject and re-prompt** — the plan misunderstood you. Re-word your outcome and try again.

The plan is your **early-warning system**. It's far cheaper to fix a wrong assumption here — before any work happens — than to unpick the output afterwards. On your first few runs, read it properly: it's the clearest window into how Cowork interpreted what you asked for.

---

## Step 4 — Approval checkpoints

Cowork runs on its own for the low-risk steps, but it **pauses at sensitive actions** to ask permission first. This is the safety rail that makes delegating comfortable.

**What triggers a checkpoint** — anything hard to undo or that leaves your hands:

- Sending or replying to email
- Scheduling, cancelling, or rescheduling meetings
- Sharing or posting files
- Posting to a Teams channel
- Anything customer- or externally-facing

**What it looks like:** Cowork stops, shows you exactly what it's about to do (the draft email, the meeting change), and waits. Sometimes it asks a clarifying question first — *"I found an NDA in the shared folder — include contract details?"*

**Your moves at a checkpoint:**

- **Approve** — looks good, go ahead.
- **Edit, then approve** — fix the draft first, then let it send.
- **Decline** — don't do this step; Cowork moves on or asks what you'd prefer.

> 💡 Treat the checkpoint as a *real* review, not a reflex click — especially for anything that leaves your tenant. (For how admins use checkpoints as a governance control, see the [Admin & governance spoke](/blog/microsoft-copilot-cowork-admin-and-governance/).)

---

## Step 5 — Stop or redirect mid-task

The "I can stop it at any time" promise is real, and it's worth knowing how — it's what lets you hand off work without feeling like you've lost the wheel.

- **Pause / stop** — hit stop and Cowork halts immediately. Nothing that needed a checkpoint will have gone out, so a stop is always safe.
- **Redirect** — you don't have to start over. Just tell it what changed: *"Actually, focus on the financial data, not the customer emails,"* and it adjusts the rest of the run.
- **Abandon** — end the task entirely. Any drafts or partial work it already produced stay behind for you to keep or bin — nothing is forced through.

You're never locked into a runaway task. If a plan looked right but the execution drifts, stop it, tweak your wording, and run again — that loop is the normal way to work with Cowork, not a sign of failure.

---

## Step 6 — Troubleshooting

The most common first-run snags, and how to recover:

- **Cowork doesn't show up** → almost always a licence or tenant-config issue, not a bug. Check you have a Microsoft 365 Copilot licence and that your admin has enabled Cowork (Frontier opt-in + Anthropic on). Full checklist in the [Admin & governance spoke](/blog/microsoft-copilot-cowork-admin-and-governance/).
- **A step fails partway through** → Cowork usually tells you which step and why (a file it couldn't reach, a permission it doesn't have). Re-run just that step, or adjust the prompt to point it at something it can access.
- **It runs longer than expected** → big, vague outcomes spawn long plans. If it feels like it's going in circles, stop it and narrow the ask ("just the email, not the deck too").
- **It accesses the wrong file** → usually two files with similar names, or messy SharePoint permissions surfacing something unexpected. Redirect it to the right file by name, and flag the permissions issue to your admin.
- **The output isn't quite right** → remember Step 3. Nine times out of ten a weak result traces back to an outcome that was too vague — sharpen the prompt and the plan improves.

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
