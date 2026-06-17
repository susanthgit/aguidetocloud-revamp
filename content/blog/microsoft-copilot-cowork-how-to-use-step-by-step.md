---
title: "Microsoft Copilot Cowork — Step-by-Step How-To Guide"
list_title: "Cowork: How to use it step by step"
description: "Microsoft Copilot Cowork step-by-step tutorial — 7 lessons covering opening it, outcome prompts, plan review, approval checkpoints, troubleshooting."
date: 2026-06-15
lastmod: 2026-06-17
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

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Copilot Cowork is **generally available** as of 16 June 2026 — now walked through with real screenshots from my tenant. **Last verified: 17 June 2026 · GA day.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is and the agentic harness. This spoke is the step-by-step how-to reference.*

---

## TL;DR

- **Where to find Cowork** — at **m365.cloud.microsoft** (browser) or the Microsoft 365 Copilot desktop/mobile app — select Cowork, or find it under **All agents**
- **How to start a task** — describe an outcome, not a process
- **What to expect** — Cowork works through the steps in front of you, pausing for your approval at sensitive actions
- **How to stay in control** — pause, redirect, or stop at any time

---

## Step 1 — Open Cowork

Cowork lives inside Microsoft 365 Copilot — open **`m365.cloud.microsoft`** in your browser (or use the Microsoft 365 Copilot desktop or mobile app) and switch from **Chat** to **Cowork** using the toggle next to the chat box. If you don't see it yet, look under **All agents**. It opens into its own full task workspace, not just a chat box.

The landing page is built around two things: an input box that says **"Start a task…"** (not "Send a message") and a left side rail with your task history. The core controls in the rail are **New task**, **Search**, **Scheduled**, and **Customize**.

Before you type anything, two helper sections sit on the landing page:

- **Needs your attention** — Cowork tasks already in flight that want your input (an approval, a clarification, a decision)
- **Try these next** — suggested workflows like *Organize my inbox*, *Arrange my week*, *Prep for a meeting* — good for first-time exploration

<p><img src="/images/blog/cowork/howto-01-home.webp" alt="Microsoft 365 Copilot Cowork home — a dedicated task workspace with a Start a task input box, a left rail (New task, My tasks, Scheduled, Customize), a Needs your input section, and Try these next suggestion cards, with the model picker set to Auto." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The Cowork home — note it says **Start a task**, not "send a message", plus the **Try these next** cards and the **Auto** model picker. (Demo capture; one internal file name is blocked.)*

<p><img src="/images/blog/cowork/howto-02-task-ideas.webp" alt="Cowork Task ideas gallery showing suggested tasks grouped by topic — Triage, Research, Create, Meetings, Automate — including OOO handover pack, Newsletter brief, Calendar audit, Unread email triage, Stakeholder check-in, Morning briefing, and End of day wrap-up." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The built-in **Task ideas** gallery — a quick way to see the kinds of work Cowork is built for, grouped by topic.*

> 💡 **Mental model shift:** Cowork's input says *"Start a task…"* on purpose. Where Copilot Chat is a conversation, Cowork is a delegation. You're handing off work, not chatting through it.

---

## Step 2 — Write a good prompt (outcome-first, not process-first)

This is the single biggest mindset shift. Most people start by listing steps. Cowork works best when you describe what you want done.

**Process prompt (works less well):**
> "Open my inbox, find emails from the Contoso team, copy the budget numbers into a spreadsheet, then make a chart."

**Outcome prompt (works much better):**
> "Prep me for tomorrow's Contoso quarterly review."

Why? Cowork's planner is good at decomposing outcomes into steps. Pre-decomposed prompts skip the part Cowork is designed to do.

<p><img src="/images/blog/cowork/howto-03-prompt.webp" alt="Cowork input box with an outcome-style task typed in: Help me organize my week. Please review my Outlook calendar." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*An outcome-first prompt in the **Start a task** box — describe the result you want, not the steps.*

---

## Step 3 — Follow along as Cowork works through the steps

<p><img src="/images/blog/cowork/howto-04-thinking.webp" alt="Cowork thought-process view showing its reasoning as it plans the task — recognizing the request to organize the week, invoking the Calendar Management skill, and gathering context like identity, timezone, and org details in parallel." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Cowork's **thought process** — it reads the outcome, picks the right skill (here, Calendar Management), and gathers context before it acts.*

<p><img src="/images/blog/cowork/howto-05-steps.webp" alt="Cowork workspace Steps panel listing a four-step plan — Gathering context, Scan calendar and classify events, Triage and present recommendations, Execute changes and update memory — with the Calendar Management skill listed under Skills and Plugins." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The **Steps** panel — Cowork's plan, laid out so you can follow along (and stop it if it heads the wrong way).*

Cowork doesn't disappear and hand back a finished result. It **breaks your request into steps and works through them one by one**, showing each step in the conversation (and in the side panel) as it goes — so you can follow along and see exactly how it interpreted your outcome.

This is the part most people skim, and it's the one that keeps you in control:

- **Watch the early steps.** They tell you how Cowork understood the request — if it's heading the wrong way, you'll spot it immediately.
- **Interrupt to steer.** At any point you can jump in with extra context or a correction ("use the latest proposal, not the March one") and Cowork adjusts.
- **Sensitive actions wait for you.** Cowork runs the low-risk steps on its own but pauses for approval before anything that sends or changes something — that's the next step.

It's far cheaper to redirect early — while Cowork is still gathering and drafting — than to unpick the output afterwards.

<p><img src="/images/blog/cowork/howto-06-output.webp" alt="Cowork output — a Calendar Summary for the week with an At a Glance table showing total calendar entries, meetings with other people, working-hours meeting time, early-morning sessions, after-hours sessions, conflicts to resolve, duplicate option pairs, and ghost events." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*And the result — a clean weekly **calendar summary** from that run. (Real outputs run longer; this is the top of it.)*

---

## Step 4 — Approval checkpoints

Cowork runs on its own for the low-risk steps, but it **pauses before any action that sends or changes something** to ask permission first. This is the safety rail that makes delegating comfortable.

**What triggers a checkpoint** — the actions that send or change something:

- **Send** an email (draft, reply, or forward)
- **Post** a message to a Teams channel or chat
- **Create** or change a meeting on your calendar
- **Create** a document or a SharePoint/OneDrive folder

Cowork tags medium- and high-risk actions with a risk indicator, and the approval button matches the action.

**What it looks like:** Cowork stops, shows you exactly what it's about to do (the draft email, the meeting), and waits. Sometimes it asks a clarifying question first — *"I found an NDA in the shared folder — include contract details?"*

<p><img src="/images/blog/cowork/howto-07-approval.webp" alt="Cowork approval card titled Send email with a To field, a Subject of Hello, a short body, a note that it was sent by Copilot Cowork, and Cancel and Send buttons. The recipient email address is redacted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The **approval card** — Cowork shows the exact email and waits. Nothing leaves until you click **Send**. (Recipient address redacted; it was a test to myself.)*

**Your moves at a checkpoint:**

- **Approve** — the button matches the action (**Send**, **Post**, **Create**).
- **Cancel** — stop the action; Cowork moves on or asks what you'd prefer.
- **Skip future prompts** — a dropdown lets you stop being asked for similar low-risk actions. Use it sparingly: it trades safety for speed.

<p><img src="/images/blog/cowork/howto-08-skip.webp" alt="The Send button dropdown in Cowork showing skip-future-prompt options — only to a specific redacted address, only to recipients in your own domain, and always allow Send email with attachments." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The **Don't ask again** dropdown, under the Send button — stop being prompted for similar low-risk sends. Convenient, but it trades safety for speed, so scope it tightly.*

> 💡 Treat each checkpoint as a *real* review, not a reflex click — especially for anything that leaves your tenant. (For how admins use checkpoints as a governance control, see the [Admin & governance spoke](/blog/microsoft-copilot-cowork-admin-and-governance/).)

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

- **Cowork doesn't show up** → almost always a licence or tenant-config issue, not a bug. Check you have a Microsoft 365 Copilot licence and that your admin has enabled Cowork (it's off by default) with usage billing set up. Full checklist in the [Admin & governance spoke](/blog/microsoft-copilot-cowork-admin-and-governance/).
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
