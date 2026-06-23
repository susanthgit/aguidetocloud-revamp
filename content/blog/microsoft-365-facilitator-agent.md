---
title: "The Microsoft 365 Facilitator Agent in Teams"
list_title: "Facilitator Agent (Teams meetings)"
hub_id: "ai-agents"
description: "How the Microsoft 365 Facilitator agent runs your Teams meetings — shared notes, an agenda timer, Q&A, task tracking and a recap. Setup and limits."
date: 2026-06-23
lastmod: 2026-06-23
draft: false
card_tag: "Agents"
tag_class: "ai"
layout: "notebook"
stamp: "facilitator"
intro_note: "← the meeting agent that takes shared notes, runs the agenda, answers questions and writes the recap — what it does, how to switch it on, and where it stops"
images: ["images/og/blog/microsoft-365-facilitator-agent.jpg"]
og_headline: "The Facilitator Agent in Teams"
og_glyph: "calendar"
tags:
  - microsoft-365
  - copilot
  - teams
  - facilitator
  - meetings
  - ai
faq:
  - question: "What is the Facilitator agent in Microsoft Teams?"
    answer: "Facilitator is a built-in Microsoft 365 agent that joins a scheduled Teams meeting as a visible participant. It writes shared, real-time notes, pulls the agenda out of the invite and runs a timer for each topic, answers questions in the meeting chat, and posts a recap of decisions and open questions at the end. Unlike Copilot in Teams, which is private to the person asking, everything Facilitator does is visible to the whole meeting."
  - question: "Does Facilitator work in Teams chats, or only in meetings?"
    answer: "Scheduled meetings only. Facilitator does not work in 1:1 chats, group chats, channel meetings, instant 'Meet now' meetings, or Teams calls. A support article titled around 'chats' refers to the meeting chat panel inside a meeting, not standalone conversations — so if you want Facilitator, schedule the meeting on the calendar."
  - question: "Do I need a licence to use Facilitator?"
    answer: "To prompt Facilitator — add it, set the agenda, ask it questions — you need a Microsoft 365 Copilot licence, on top of an eligible Microsoft 365 base plan and a Teams licence. Participants without a Copilot licence can still read its notes and answers; they just can't instruct it. Microsoft's public docs show no separate per-message charge — it's included with the Copilot seat, subject to capacity."
  - question: "How do I turn Facilitator on?"
    answer: "It's allowed by default in most tenants. Two prerequisites matter: Loop experiences in Teams must be turned on, and the meeting needs Copilot/Facilitator allowed in its options. A meeting organiser or presenter on desktop or web can switch it on or off mid-meeting from More actions, or enable it at scheduling time under Options. Admins allow or block it in the Teams admin center under Manage apps."
  - question: "Can Facilitator create tasks and draft documents?"
    answer: "Yes, but those two are in public preview as of mid-2026. Facilitator can create a task in Microsoft Planner from the meeting discussion, and draft a document with Word or a Loop component. Its core features — real-time notes, the agenda timer, in-meeting Q&A, and the recap — are generally available."
  - question: "Where are Facilitator's notes stored?"
    answer: "The AI-generated notes are saved as a .loop file in a folder called Meetings, in the OneDrive of whoever turned Facilitator on — that's the initiator, who can be a presenter rather than the meeting organiser. They're treated like meeting transcript data. Sensitivity labels aren't inherited automatically — you apply them manually in Loop or OneDrive if you need them."
  - question: "Is Facilitator available in government clouds?"
    answer: "Not yet. Per Microsoft's Microsoft 365 Copilot service description, Teams meeting Copilot features — which include Facilitator — are not yet available in GCC, GCC High or DoD environments."
  - question: "What languages does Facilitator support?"
    answer: "Nearly 40, including English, Spanish, French, German, Italian, Japanese, Portuguese, Chinese (Simplified and Traditional), Korean, Dutch, Arabic and more. Only one meeting language is supported per session, so in a multilingual meeting it captures the portion spoken in the selected language. (Note: Arabic is supported here in Facilitator, but the Planner Agent excludes Arabic and Hebrew — the language lists differ per agent.)"
sitemap:
  priority: 0.8
founder_note: |
  I run a lot of meetings, and the part I always dropped was the notes — you're either *in* the conversation or you're scribing it, never both. Facilitator is the first thing that genuinely took that off my plate: it sits in the meeting where everyone can see it, keeps us to the agenda, answers the "wait, what did we decide?" questions, and hands back a recap nobody had to type.

  Here's exactly what it does, how to switch it on, and — just as honestly — the places it doesn't reach yet. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) guide.** Facilitator's core features (notes, agenda, Q&A, recap) are **generally available**; task tracking and document drafting are in **public preview**. **Last verified: 23 June 2026.**

</div>

*The hub for this series — [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) — maps every agent Microsoft ships. This spoke is the detailed walkthrough of Facilitator.*

<p><img src="/images/blog/microsoft-365-facilitator-agent/01-facilitator-meeting.webp" alt="A Microsoft Teams meeting with four participant tiles and an agenda tracker across the top showing Roadmap update, Product readiness and Launch campaign. The meeting chat panel on the right shows a note that Facilitator has been turned on and is taking notes, followed by a Facilitator message introducing itself and listing the agenda from the meeting notes." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Facilitator, switched on in a Teams meeting. It introduces itself in the meeting chat and posts the agenda it found — visible to everyone, not just one person.*

---

## TL;DR

- **Facilitator** is a built-in agent that joins a **scheduled Teams meeting** as a *visible* teammate — its notes and answers are seen by everyone.
- It does five things: **shared real-time notes**, **agenda + timer**, **in-meeting Q&A**, **task tracking** (preview), **document drafting** (preview), and a **recap** at the end.
- **Meetings only** — not 1:1 chats, group chats, channel meetings, "Meet now", or calls.
- **On-switch:** a **Microsoft 365 Copilot** licence to prompt it (reading is free), plus **Loop experiences** turned on. Allowed by default; an organiser can toggle it per meeting.
- **Notes** are saved as a **`.loop` file** in the OneDrive of whoever turned Facilitator on. **Nearly 40 languages**, one per meeting.
- **Not in government clouds** (GCC, GCC High, DoD) yet.

> 🧭 **Jump to:** [What it is](#what) · [Where it works](#where) · [Turn it on](#enable) · [The agenda & timer](#agenda) · [Ask it questions](#qa) · [Track tasks](#tasks) · [Draft a document](#draft) · [Teams Rooms](#rooms) · [The recap](#recap) · [Troubleshooting](#troubleshooting) · [Limits](#limits) · [Sources](#sources)

---

## What Facilitator actually is {#what}

Most AI in a meeting is *yours* — you ask Copilot something privately and only you see the answer. **Facilitator is the opposite: it belongs to the whole room.** Everyone sees what it's asked and what it replies, because its job isn't to assist one person — it's to run the meeting on behalf of all of you.

That single design choice is what makes it useful. The notes are co-owned. The agenda is shared. When someone asks "what did we land on?", the answer lands in front of everyone, not in one private side-panel.

It interacts through `@Facilitator` mentions in the meeting chat — you can tell it to add a topic, start a timer, create a task, and so on.

---

## Where it works — and where it doesn't {#where}

This is the limit people trip over most, so it's worth being blunt:

| Works in | Does **not** work in |
|---|---|
| Scheduled Teams meetings (desktop, web, mobile) | 1:1 chats |
| Teams Rooms | Group chats |
| | Channel meetings |
| | Instant "Meet now" meetings |
| | Teams calls |
| | External / federated meetings |

If Facilitator isn't showing up, the first question is almost always: **was this a scheduled meeting?** If it was a quick "Meet now", that's why.

---

## How to turn it on {#enable}

For an organiser, the steps are short:

1. **Have a Microsoft 365 Copilot licence.** That's what lets you prompt Facilitator. (Unlicensed attendees can read its output but can't instruct it.)
2. **Make sure Loop experiences are on.** Facilitator's notes are built on **Loop** (Microsoft's live-document feature), so the tenant needs Loop experiences in Teams switched on — an admin setting in the Teams admin center.
3. **Allow it in the meeting.** When scheduling, under **Options → Copilot and other AI**, make sure Copilot/Facilitator is allowed. You can also flip it on or off **during** the meeting from **More actions → Turn on/off Facilitator** (organiser or presenter, desktop/web).

On the admin side, Facilitator is **allowed by default**. Admins manage it in the **Teams admin center → Teams apps → Manage apps → search "Facilitator" → Allow/Block**, with app permission policies for finer control.

> ✅ **Good default:** leave it allowed, make sure Loop is on, and let organisers decide per meeting. There's nothing to configure in the agent itself — Facilitator can't be customised, only allowed or blocked.

---

## The agenda and the timer {#agenda}

Facilitator reads the agenda from the meeting invite or the notes Loop component and posts it so everyone's on the same page. From there you can shape it in plain language — add a topic, set a time, and it redistributes the remaining minutes so the timings still add up to the meeting length.

<p><img src="/images/blog/microsoft-365-facilitator-agent/02-facilitator-agenda-timing.webp" alt="The Teams meeting chat panel. A user has typed 'Facilitator add Success Metrics to the agenda and allocate 5 minutes to it', and Facilitator has replied with an updated agenda — Roadmap update 8 minutes, Product readiness 8 minutes, Launch campaign 9 minutes, Success Metrics 5 minutes — noting it distributed the time so the total matches the 30-minute meeting." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Ask it to add a topic and allocate time, and Facilitator re-balances the whole agenda so the minutes still add up to the meeting length.*

During the meeting it shows a countdown for each topic and nudges everyone at the midpoint and the wrap-up, so the conversation stays on time without anyone having to play timekeeper.

---

## Asking it questions mid-meeting {#qa}

Anyone licensed can ask Facilitator an open question in the chat, and it answers from meeting and web content — with citations you can check.

<p><img src="/images/blog/microsoft-365-facilitator-agent/03-facilitator-qa.webp" alt="The Teams meeting chat. A participant asked Facilitator 'What are the three fastest growing states in the USA?' and Facilitator answered 'Florida, Texas, and Utah' with three numbered citations, one of which is expanded to show its source title." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*An in-meeting question answered in the chat, with numbered citations — so the answer is checkable, not just asserted.*

Because the answer appears in the shared chat, the whole meeting benefits from it — useful for the "can someone quickly look that up?" moments that usually derail a discussion.

---

## Tracking tasks — into Planner {#tasks}

This is one of the **public preview** features, and it's where Facilitator stops being just a note-taker. Tell it to create a task and it makes one **in Microsoft Planner**, ready to assign and date.

<p><img src="/images/blog/microsoft-365-facilitator-agent/04-facilitator-tasks.webp" alt="The Teams meeting chat showing a recap-style list of next steps with citations, then a Facilitator message saying 'I've created a task in Planner. Would you like me to generate a draft?' with a Not started task card titled 'Create a strategy document' and an Assign to Facilitator button." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Facilitator creating a Planner task straight from the discussion. The task lands in Planner, where the [Planner Agent](/blog/microsoft-365-project-manager-agent/) can take it further.*

That hand-off is the quietly clever bit: a decision made out loud in a meeting becomes a tracked task in Planner without anyone switching apps.

---

## Drafting a document {#draft}

The other preview feature: ask Facilitator to draft something and it produces a real document — a launch plan, a brief — using Word or a Loop component.

<p><img src="/images/blog/microsoft-365-facilitator-agent/05-facilitator-document.webp" alt="A Word document titled 'Zavaweave Smart Clothing Product Launch Plan' with an Introduction, a Product Overview section, and a Core Features list — the draft Facilitator generated from the meeting discussion, with an AI summary banner across the top." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*A document drafted from the meeting — a starting point you can edit, not a finished artefact, but a real head start.*

---

## In a Teams Room {#rooms}

Facilitator isn't just for people dialling in from laptops. In a **Teams Room**, it shows up on the room display and console too, so the people physically in the room get the same shared notes, agenda and timers.

<p><img src="/images/blog/microsoft-365-facilitator-agent/06-facilitator-teams-room.webp" alt="A physical Teams Room with a wall-mounted display showing the Teams meeting and the Facilitator chat panel with decisions and open questions, plus a Teams Rooms console on the table showing the meeting details and a participant list that includes Facilitator." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Facilitator in a Teams Room — it appears for the people in the room on the display and the console, not just for remote participants.*

---

## The recap {#recap}

When the meeting ends, Facilitator posts a clean rundown — decisions, open questions, the agenda as it actually ran — and the AI notes live on in the meeting's **Recap / Notes** tab for anyone who missed it.

<p><img src="/images/blog/microsoft-365-facilitator-agent/07-facilitator-recap.webp" alt="The Teams meeting chat after the meeting ended, showing 'Meeting ended: 27m 38s', a meeting recap card with Transcript and Attendance buttons, and a Facilitator message saying 'that's a wrap' with a recap card summarising Decisions, an Open question, and the Agenda." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The end-of-meeting recap — decisions and open questions, captured without anyone scribing.*

---

## Troubleshooting — why isn't Facilitator working? {#troubleshooting}

The most common "it's not doing anything" moments, and what's usually behind them:

| What you're seeing | The usual cause — and the fix |
|---|---|
| **Facilitator isn't there / I can't turn it on** | It only runs in **scheduled** meetings — not "Meet now", calls, or channel meetings. You also need a **Microsoft 365 Copilot** licence, **Loop experiences** turned on, and your admin to have it **allowed** (it is by default). Check those four and it comes back. |
| **It's on, but nothing's happening** | Facilitator needs a **recent, substantive amount of discussion** before it writes anything — Microsoft notes it may even show an error if there isn't enough yet. Give it a few minutes of real conversation. |
| **The notes are empty, or some people can't see them** | The notes live in a **Loop file** in OneDrive, so this is usually a Loop sharing/permission issue — and **external participants can't access the notes** at all. |
| **The notes are credited to a person, not Facilitator** | That's expected — Microsoft attributes the generated notes to a participant, not to the agent. |
| **Speakers aren't named correctly in a Teams Room** | Turn on **voice recognition** for the room. Without it, anything said in the room is attributed to the *room*, not the individual speakers. |
| **It captured an action but you still own the follow-up** | Facilitator captures decisions and actions, but you stay in control of who owns what — review them, assign owners yourself (or ask it to create the task in Planner), and acknowledge completed items in the meeting chat so its list stays current. |

> 📎 **The one-line mental model:** Facilitator works from the scheduled meeting — it tracks progress from the **Teams chat and transcript**, and answers from the meeting's notes and the web. Give it a real meeting with a Copilot licence and Loop turned on and it works; ask it about anything outside that meeting, and it can't help.

---

## Limits and good-to-knows {#limits}

A few honest edges to keep in mind:

- **Scheduled meetings only** — covered above, but it's the big one.
- **Meeting chat isn't its source.** You prompt Facilitator *in* the meeting chat, but per Microsoft's FAQ the chat messages themselves aren't used as grounding for its answers — it works from the meeting's notes and web content.
- **It can't be customised.** Admins allow or block it; there's no tuning its behaviour.
- **Encrypted / labelled meetings:** a meeting with a sensitivity label that encrypts content can stop Facilitator from reading the agenda.
- **Notes storage:** a **`.loop`** file in a "Meetings" folder in the OneDrive of **whoever turned Facilitator on** (the initiator — who may be a presenter, not the organiser); sensitivity labels aren't inherited automatically (apply them by hand in OneDrive or Loop if you need them), and the notes aren't currently collected as cloud attachments in Purview eDiscovery.
- **Languages:** **nearly 40**, but **one per meeting** — multilingual meetings only capture the selected language.
- **Government clouds:** not available in **GCC, GCC High or DoD** yet.

---

## Official Microsoft sources {#sources}

- [Facilitator in Microsoft Teams (admin setup, GA vs preview, limits)](https://learn.microsoft.com/en-us/microsoftteams/facilitator-teams)
- [Automate note-taking in Microsoft Teams meetings (end-user guide)](https://support.microsoft.com/en-us/office/automate-notetaking-in-microsoft-teams-meetings-37657f91-39b5-40eb-9421-45141e3ce9f6)
- [Facilitator FAQ — features, languages, limitations](https://support.microsoft.com/en-us/office/frequently-asked-questions-about-facilitator-in-microsoft-teams-f7317b78-fd53-4cfe-88f0-f0a0751a4150)
- [AI tools and agents in Microsoft Teams (overview)](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview)
- [Microsoft 365 Copilot service description (government-cloud availability)](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-copilot)

---

## The other built-in agents

- [Microsoft 365's Built-in Agents — the complete guide](/blog/microsoft-365-built-in-agents/) *(the hub)*
- [The Planner Agent (Project Manager agent)](/blog/microsoft-365-project-manager-agent/)
- [The SharePoint Knowledge Agent](/blog/microsoft-365-knowledge-agent/)
