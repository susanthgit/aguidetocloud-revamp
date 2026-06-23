---
title: "The Planner Agent (formerly Project Manager Agent)"
list_title: "Planner Agent (Project Manager)"
hub_id: "ai-agents"
description: "The Microsoft Planner Agent — formerly the Project Manager agent — builds task plans from goals, works tasks you assign it, and writes status reports."
date: 2026-06-23
lastmod: 2026-06-23
draft: false
card_tag: "Agents"
tag_class: "ai"
layout: "notebook"
stamp: "planner agent"
intro_note: "← the agent inside Microsoft Planner that turns a goal into a task plan, works the tasks you hand it, and writes the status report — what it does and how to use it"
images: ["images/og/blog/microsoft-365-project-manager-agent.jpg"]
og_headline: "The Planner Agent, Explained"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - planner
  - project-manager-agent
  - planner-agent
  - ai
faq:
  - question: "Is the Planner Agent the same as the Project Manager agent?"
    answer: "Yes. Microsoft renamed the 'Project Manager agent' to the 'Planner Agent', and it is now generally available in both basic and premium Planner plans. You may still see the older 'Project Manager' name in some places in the product, and some older help pages still say 'public preview' — that text is out of date. They are the same agent."
  - question: "What does the Planner Agent do?"
    answer: "Three main jobs. It builds a task list from a high-level goal (premium plans), it works tasks you assign to it and returns the result inside the task, and it writes status reports for a plan. You can also just chat with it to ask questions, create or update tasks, and get insights about the plan."
  - question: "Do I need a licence for the Planner Agent?"
    answer: "You need a Microsoft 365 Copilot licence to interact with it — assign tasks to it, chat with it, generate status reports. People without a Copilot licence can still collaborate on the plan, they just can't use the agent. Generating a full plan from a goal is a premium feature that additionally needs a Planner Plan 1, or Planner and Project Plan 3 or 5."
  - question: "Is the Planner Agent generally available?"
    answer: "Yes — Microsoft's Planner Agent FAQ states it is generally available in both premium and basic plans. One caveat: the main Microsoft Planner FAQ still carries older text describing it as 'in public preview', which hasn't been updated. The agent-specific FAQ is the accurate source."
  - question: "How do I start using the Planner Agent?"
    answer: "In a shared plan, it's enabled by default for Microsoft 365 Copilot-licensed users. You'll find it via the floating action button in the bottom-right of the plan, and you activate it for a task by assigning that task to 'Planner Agent' (you're automatically added as a watcher). You can also chat with it from the same panel."
  - question: "Can the Planner Agent use my files?"
    answer: "Yes. You can add files to the plan as knowledge sources, and the agent uses them as context — both when generating a plan from a goal and when working individual tasks. Its longer outputs cite the sources it drew on, so you can check the grounding."
  - question: "What languages does the Planner Agent support?"
    answer: "It supports the full set of Microsoft 365 Copilot languages except Hebrew and Arabic — roughly 44 languages including English, Spanish, French, German, Italian, Japanese, Portuguese, Chinese (Simplified and Traditional), Korean and Dutch."
  - question: "Is the Planner Agent available in government clouds?"
    answer: "No — the Planner Agent isn't available in GCC, GCC High or DoD as of mid-2026. Government-cloud availability differs by agent, so check the service description for any specific agent you need."
sitemap:
  priority: 0.8
founder_note: |
  Planner always had the bones of a good project tool; what it lacked was someone to actually drive it. The Planner Agent is that someone — you give it a goal and it lays out the tasks, you hand it a job and it does it and shows its working, you need a status report and it writes one.

  Microsoft renamed this from the "Project Manager agent", so if you see both names floating around, they're the same thing. Here's how to actually put it to work. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) guide.** The Planner Agent (formerly the **Project Manager agent**) is **generally available** in both basic and premium Planner plans. **Last verified: 23 June 2026.**

</div>

*The hub for this series — [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) — maps every agent Microsoft ships. This spoke is the detailed walkthrough of the Planner Agent.*

<p><img src="/images/blog/microsoft-365-project-manager-agent/01-pma-board.webp" alt="A Microsoft Planner plan called AuraFit Launch Plan in Board view, with a banner explaining that Project Manager is an AI agent that can help you plan and execute projects. The board has columns for All incomplete tasks, Assign to Project Manager, Needs your input, and Ready for review, with several task cards." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The Planner Agent built into a plan. You hand it work by moving a task to the agent's column. (This demo shows the older "Project Manager" labelling; current Planner uses "Planner Agent", and some column names may differ from what's shown here.)*

---

## TL;DR

- The **Planner Agent** — Microsoft's new name for the **Project Manager agent** — lives inside **Microsoft Planner** and is **generally available**.
- It does three things: **build a task plan from a goal** (premium plans), **work tasks you assign it** and return the result in the task, and **write status reports**. You can also **chat** with it.
- **On-switch:** a **Microsoft 365 Copilot** licence. Generating a plan from a goal additionally needs a **premium Planner plan** (Plan 1 / Project Plan 3 or 5).
- It's **enabled by default** in shared plans; find it via the floating button and **assign a task to it** to put it to work.
- It can use **files you add to the plan** as grounding, and it **cites** what it used.
- **Not in government clouds**; supports the Copilot languages **except Hebrew and Arabic**.

> 🧭 **Jump to:** [What it is & the rename](#what) · [How to access it](#access) · [A plan from a goal](#goals) · [Ground it in your files](#ground) · [Chat & assign work](#chat) · [Status reports](#reports) · [Licensing](#licensing) · [Troubleshooting](#troubleshooting) · [Limits](#limits) · [Sources](#sources)

---

## What it is — and the name change {#what}

The **Planner Agent** is a teammate that lives inside a Planner plan. In Microsoft's own words, it *"works alongside your team to help you get work done faster — it can execute tasks, act on feedback, and write status reports."*

First, the name. You'll see this called both **"Project Manager agent"** and **"Planner Agent"** — Microsoft **renamed** it to the Planner Agent, and that's the current name, but the product still shows "Project Manager" in a few spots (like the board column above) and some older help pages haven't caught up. Same agent, two names.

You work with it the way you'd work with a person: there's an **Assign to Project Manager** lane on the board, and moving a task there hands the agent the job.

---

## How to access it, step by step {#access}

Good news: there's almost nothing to "install." The Planner Agent is **on by default** in shared plans for anyone with a Microsoft 365 Copilot licence. Here's how you actually reach it.

**In a basic plan** (shared with a Microsoft 365 Group):

1. Create or open a basic plan shared with a group.
2. Open the agent from the **floating button in the bottom-right** of the plan. From there you can upload files as context under **Knowledge sources**.
3. **Assign a task to "Planner Agent"** to put it to work — you're added to the task too, so you can follow its progress.
4. Once the plan has **at least 10 tasks**, open the **Reports** tab to generate a status report.

**In a premium plan:** it's enabled by default — open any shared premium plan and assign a task, or use the **Goals** view to turn a goal into a plan (premium only).

> 📎 **Three places it shows up:** inside a **Planner** plan (the floating button), in the **Planner app in Teams**, and as the **Planner Agent in Microsoft 365 Copilot Chat** — a separate chat experience where you can ask about your tasks and plans across all your Planner work.

---

## Building a plan from a goal {#goals}

This is the feature people come for. On the **Goals** view (a premium Planner feature), you write a high-level goal and select **Generate tasks**, and the agent breaks it into a worked task list.

<p><img src="/images/blog/microsoft-365-project-manager-agent/03-pma-generate-tasks.webp" alt="The Planner Goals view with two goals. The top goal, 'Achieve a customer satisfaction score of 90% or higher', shows Connect tasks and Generate tasks buttons. A second goal about launching AuraFit is expanded into a list of ten generated tasks." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Write a goal, select **Generate tasks**, and the agent proposes the task breakdown.*

What you get back is a real, dated task list under the goal — owners, priorities and finish dates included — that you can then edit like any other Planner tasks.

<p><img src="/images/blog/microsoft-365-project-manager-agent/02-pma-task-grid.webp" alt="A Planner goal, 'Develop and launch AuraFit, an AI-powered wellness ring, with a target of 10,000 units sold in the first 3 months', expanded into a grid of ten tasks with columns for Task Name, Assigned to, Priority and Finish date, and an 'AI-generated content may be incorrect' note at the bottom." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The generated plan — ten tasks with owners, priorities and dates. It's a starting point you refine, and Planner flags it as AI-generated.*

> 📎 **Note:** task generation from a goal is a **premium** capability — you need a Planner Plan 1 or higher on top of your Copilot licence. The chat, task execution and status-report features work with just the Copilot licence.

---

## Grounding it in your files {#ground}

The agent is more useful when it knows your context. Add files to the plan as **knowledge sources**, and it uses them when it generates tasks or works a job.

<p><img src="/images/blog/microsoft-365-project-manager-agent/04-pma-knowledge-sources.webp" alt="The Planner Goals view with a file picker open, listing recent files to add as context — a Business Proposal grounding document, a Copilot Template, an R and D Presentation — with a note advising to select a file that isn't sensitive or confidential because it will be shared with plan members." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Adding files as grounding. The note is worth heeding: the file is shared with plan members, so don't attach anything confidential.*

When it produces a longer output, it shows the **sources** it drew on — so the result is checkable, not a black box.

<p><img src="/images/blog/microsoft-365-project-manager-agent/05-pma-grounded-output.webp" alt="A document the Planner Agent generated, showing a Future Trends section and a Conclusion and Recommendations section, followed by a References list of source URLs and the grounding document the agent used." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*A grounded output with a **References** list — the agent shows its working.*

---

## Chatting with it and assigning work {#chat}

Open the agent from the floating button and you get a chat panel with prompt starters — **create**, **understand**, **edit**, **ask** — for spinning up tasks, asking about progress, or adding subtasks.

<p><img src="/images/blog/microsoft-365-project-manager-agent/06-pma-chat.webp" alt="The Project Manager agent side panel, labelled Private, with prompt-starter cards for Create, Understand, Edit and Ask, a Chat history button, and suggestion chips like 'Create a goal to double social media interactions' and 'Create a task to schedule a kickoff meeting'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The agent's chat panel. The prompt starters are a quick way in if you're not sure what to ask.*

To put it to work on a specific task, **assign that task to "Planner Agent."** It reads the task in the context of the whole plan, does the job, and returns the result inside the task — and you're added as a watcher so you see when it's done.

<p><img src="/images/blog/microsoft-365-project-manager-agent/09-pma-task-output.webp" alt="A Planner task 'Conduct market research for AI-powered wellness rings' open in detail, marked Ready, with a banner noting the Project Manager agent is using the latest web content, then a 'Project Manager in Planner — Latest status' section with a Regenerate button and the agent's generated market-research report embedded inside the task." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*What you get back lands **inside the task** as a Loop page, with a **Regenerate** button — so you can give feedback and have it try again without ever leaving the task. (The banner notes the agent is using the latest web content, governed by an admin setting.)*

---

## Status reports {#reports}

Writing a status update is the chore the agent quietly removes. In the **Reports** tab you set a period and what it should cover, and it drafts the report for you.

<p><img src="/images/blog/microsoft-365-project-manager-agent/08-pma-report-config.webp" alt="A panel titled 'Start creating a status report with AI' with a Report period dropdown set to Last week and an optional field for what the report should cover, set to 'Create an update on high-priority items for the team', alongside an illustration to create your first status report with AI." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Setting up a status report — pick the period and, optionally, what to focus on.*

The result is a proper report — reporting period, an executive summary with an at-a-glance status, and a task-completion chart — that you can share, including as a SharePoint newsletter.

<p><img src="/images/blog/microsoft-365-project-manager-agent/07-pma-status-report.webp" alt="A generated status report in the Planner Reports tab, headed 'Your status report with Project Manager is ready', with Share as newsletter and Draft buttons, a reporting period, a project owner, an Executive Summary marked Status: On Track, and the start of a task-completion chart." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The finished status report — summary, status and a completion chart, ready to share. (Status reports need at least ten tasks in the plan.)*

---

## Licensing, in one place {#licensing}

| What you want to do | What you need |
|---|---|
| Chat with the agent, assign it tasks, get status reports | **Microsoft 365 Copilot** licence |
| Generate a full plan from a goal | Copilot licence **+** a premium Planner plan (Plan 1 / Project Plan 3 or 5) |
| Just collaborate on the plan (no agent) | A standard Planner / Microsoft 365 licence — but you can't interact with the agent |

There's no separate per-message charge in Microsoft's public docs — the agent is included with the Copilot seat. Not sure which Planner plan you're on? Your Microsoft 365 admin can check.

---

## Troubleshooting — common questions {#troubleshooting}

The questions that come up most, with plain answers:

| Question | Answer |
|---|---|
| **"Why can't I access or use the agent?"** | You need a **Microsoft 365 Copilot** licence. Without it you can still collaborate on the plan — you just can't interact with the agent. |
| **"Others can see the plan but can't use the agent — why?"** | Same reason: only people with a Copilot licence can assign tasks to it or chat with it. |
| **"It gave me instructions instead of doing the work."** | That's by design. For anything it can't carry out itself (a physical task, or work outside Planner), it hands you a plan of action rather than pretending to finish it. |
| **"Why aren't tasks generating from my goal?"** | Turning a goal into a task list is a **premium** feature — it needs a Planner Plan 1 (or Project Plan 3/5) on top of your Copilot licence. |
| **"Where does it actually live?"** | Three places: a Planner plan (floating button), the Planner app in Teams, and Copilot Chat — see [How to access it](#access). |
| **"Do I have to check its work?"** | Yes — it's built with a **human in the loop**. Planner flags AI output as possibly incorrect, so review before you share. |

---

## Limits and good-to-knows {#limits}

- **Status reports need ≥10 tasks** in the plan before the agent will write one.
- **Languages:** the Copilot language set **except Hebrew and Arabic**.
- **Government clouds:** not available in **GCC, GCC High or DoD**.
- **Stale docs warning:** the main Planner FAQ still says "public preview" in places — the agent is **GA**; trust the agent-specific FAQ.
- **AI output is a draft.** Planner labels generated content as possibly incorrect — review before you rely on it.

---

## Official Microsoft sources {#sources}

- [Access the Planner Agent (licensing, basic vs premium, board, reports, goals)](https://support.microsoft.com/en-us/planner/copilot/access-planner-agent)
- [Planner Agent FAQ (GA status, capabilities, languages)](https://support.microsoft.com/en-us/office/frequently-asked-questions-about-project-manager-agent-ab2bc39a-edec-4d4d-8e86-2cc927870096)
- [What is the Planner Agent in Copilot? (the Copilot Chat surface)](https://support.microsoft.com/en-us/planner/what-is-planner-agent-in-copilot)
- [Microsoft Planner plans and pricing](https://www.microsoft.com/en-us/microsoft-365/planner/microsoft-planner-plans-and-pricing)
- [Microsoft 365 Copilot service description (government-cloud availability)](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-copilot)

---

## The other built-in agents

- [Microsoft 365's Built-in Agents — the complete guide](/blog/microsoft-365-built-in-agents/) *(the hub)*
- [The Microsoft 365 Facilitator Agent in Teams](/blog/microsoft-365-facilitator-agent/)
- [The SharePoint Knowledge Agent](/blog/microsoft-365-knowledge-agent/)
