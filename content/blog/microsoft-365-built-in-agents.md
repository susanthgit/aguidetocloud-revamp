---
title: "Microsoft 365's Built-in Agents: The Complete Guide"
list_title: "Built-in Microsoft 365 Agents"
hub_id: "ai-agents"
description: "The agents Microsoft ships inside Microsoft 365 — Facilitator, Planner, SharePoint and more: what each one does, where it lives, and how to turn it on."
date: 2026-06-23
lastmod: 2026-06-23
draft: false
card_tag: "Agents"
tag_class: "ai"
layout: "notebook"
stamp: "built-in agents"
intro_note: "↗ the agents Microsoft ships inside Microsoft 365 — what each one does, which app it lives in, and how to switch it on, in plain English"
images: ["images/og/blog/microsoft-365-built-in-agents.jpg"]
og_headline: "Microsoft 365's Built-in Agents"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - agents
  - facilitator
  - planner
  - sharepoint
  - ai
faq:
  - question: "What is a built-in agent in Microsoft 365?"
    answer: "It's an agent Microsoft builds, ships, and maintains as part of Microsoft 365 — you don't build it yourself. Facilitator in Teams, the Planner Agent, the SharePoint and Knowledge agents, Researcher and Analyst in Copilot Chat are all examples. They arrive with the product, are governed from the Microsoft 365 admin center, and for most people are unlocked by a Microsoft 365 Copilot licence rather than a separate purchase."
  - question: "How are built-in agents different from agents I build?"
    answer: "Built-in (first-party) agents are made by Microsoft and turn up inside the apps you already use. Agents you build are ones you create with Agent Builder or Copilot Studio for your own scenarios. This guide is about the ones Microsoft ships; building your own is covered in our agent-builder guides, linked at the end."
  - question: "Do I need a Microsoft 365 Copilot licence to use them?"
    answer: "For most of them, yes. A Microsoft 365 Copilot licence is what unlocks Facilitator, the Planner Agent, Channel Agent, Interpreter, Researcher and Analyst. SharePoint agents are the main exception — an admin can set up a pay-as-you-go billing path so unlicensed users can use them too. A few features (like generating a Planner plan from a goal) need a premium Planner plan on top."
  - question: "Where do I manage Microsoft 365 agents?"
    answer: "The Microsoft 365 admin center is the main control plane — go to Agents, where the Registry lists every agent and Agent settings controls what's allowed. Some agents are also managed in their own admin center: Teams agents (Facilitator, Channel Agent, Interpreter) in the Teams admin center, SharePoint agents in the SharePoint admin center. Microsoft Agent 365 (generally available since May 2026) adds a single layer to observe, govern and secure all of them."
  - question: "Which built-in agents are generally available, and which are in preview?"
    answer: "Generally available: SharePoint agents, Interpreter, Researcher, Analyst, and the Planner Agent. Partly available: Facilitator — its core note-taking, agenda and Q&A are GA, while task tracking and document drafting are in public preview. In preview: the Channel Agent and the SharePoint Knowledge Agent. The Community Agent in Viva Engage is newer and Microsoft's public documentation is still thin, so confirm its status before you rely on it."
  - question: "Are the built-in agents available in government clouds (GCC, GCCH, DoD)?"
    answer: "It varies by agent. Microsoft's service description notes that Teams meeting Copilot features like Facilitator, and the Planner Agent, are not yet available in GCC, GCC High or DoD, whereas SharePoint agents have their own (different) government-cloud status. If you run a government tenant, check the service-description row for the specific agent before planning a rollout."
  - question: "Do built-in agents cost extra on top of the Copilot seat?"
    answer: "As far as Microsoft's public documentation shows, the built-in agents are included with the Microsoft 365 Copilot licence rather than metered per message. The clear exception is SharePoint agents used through the pay-as-you-go path, which are billed per query. Usage-based work like Copilot Cowork is metered separately in Copilot Credits. When in doubt, confirm with your licensing contact before you budget."
sitemap:
  priority: 0.8
founder_note: |
  Almost every week now, a new agent shows up somewhere inside Microsoft 365 — one in Teams, one in Planner, one in SharePoint — and the first questions are always the same: what is this thing, do I have to switch it on, and is it going to cost me anything?

  So here's the map I wish existed. Every agent Microsoft ships inside Microsoft 365 — what each one actually does, which app it lives in, how to turn it on, and what it needs — in plain English. The agents you build yourself are a separate story (I've linked those guides at the end). Previews move fast, so I'll keep this one current. — Sush
---

<div class="living-doc-banner">

🔄 **A living guide to the agents Microsoft *ships* inside Microsoft 365** — as opposed to the ones you build yourself. New agents arrive often and previews change; confirm specifics in [Microsoft Learn — AI agents in Teams](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview) and the [Microsoft 365 Copilot service description](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-copilot). **Last verified: 23 June 2026.**

</div>

**The short version:** Microsoft 365 now comes with a growing set of **built-in agents** — small, focused AI helpers that Microsoft builds and drops straight into the apps you already use. Facilitator runs your Teams meetings. The Planner Agent builds and works task plans. Agents in SharePoint answer questions about your files. There's one in Teams channels, one in Viva Engage, and more in Copilot Chat. This is the guide to all of them: what each does, where it lives, how to switch it on, and what it needs.

> 🧭 **Jump to:** [What's a "built-in" agent?](#what) · [The full lineup](#lineup) · [In Teams](#teams) · [In Planner](#planner) · [In SharePoint](#sharepoint) · [In Viva Engage](#viva) · [In Copilot Chat](#chat) · [How to turn them on](#enable) · [What they cost](#cost) · [Which agent for which job](#which) · [Sources](#sources) · [The rest of this guide](#cluster)

---

## TL;DR

- A **built-in agent** is one Microsoft makes and ships inside Microsoft 365 — you don't build it. It just turns up in Teams, Planner, SharePoint, Viva or Copilot Chat.
- The headline ones: **Facilitator** (Teams meetings), the **Planner Agent** (Microsoft Planner, formerly "Project Manager agent"), **agents in SharePoint** and the **Knowledge Agent**, the **Channel Agent** (Teams channels), the **Community Agent** (Viva Engage), plus **Interpreter**, **Researcher** and **Analyst**.
- For most of them, a **Microsoft 365 Copilot licence** is the on-switch. SharePoint agents can also run on a **pay-as-you-go** path for unlicensed users.
- You govern them from the **Microsoft 365 admin center → Agents** (Registry and Agent settings), with **Teams** and **SharePoint** admin centers for their own agents, and **Microsoft Agent 365** as the single observe-govern-secure layer.
- **Generally available:** SharePoint agents, Interpreter, Researcher, Analyst, Planner Agent. **Preview / partial:** Facilitator (core GA, tasks + drafting in preview), Channel Agent, Knowledge Agent. **Thin docs:** Community Agent — confirm before relying on it.
- **Government-cloud availability varies by agent** — Facilitator and Planner aren't in GCC/GCCH/DoD; SharePoint agents differ.

> ⚡ **In a hurry?** Skim **[the full lineup table](#lineup)**, then jump to the surface you care about — [Teams](#teams), [Planner](#planner) or [SharePoint](#sharepoint).

---

## What's a "built-in" agent — and how is it different from one you build? {#what}

There are two kinds of agent in the Microsoft 365 world, and it's worth being clear which one you're looking at.

- **Agents Microsoft ships (built-in / first-party).** Microsoft builds them, names them, and turns them on inside the apps. You don't design them — you allow them, licence them, and use them. That's everything on this page.
- **Agents you build.** You create these for your own scenarios with **Agent Builder** (no-code, inside the Copilot app) or **Copilot Studio** (for richer, connected, autonomous agents). Microsoft's own words: *"Microsoft and its partners offer a variety of prebuilt agents. You can also build your own using both low-code and pro-code tools."*

> 📎 **If you're here to build your own agent**, start with [Microsoft 365 Agent Builder, explained](/blog/m365-agent-builder-explained/) and [Agent Builder vs Copilot Studio vs Foundry](/blog/agent-builder-vs-copilot-studio-vs-foundry/). This guide stays on the agents Microsoft *gives* you.

The Microsoft 365 admin center sorts every agent in your tenant into four buckets — **Microsoft agents**, **partner-built**, **published by your org**, and **shared by a creator**. The built-in agents in this guide are the first bucket: *"agents built and maintained by Microsoft."*

---

## The full lineup {#lineup}

Here's the built-in agents worth knowing — what each does in one line, where it lives, what unlocks it, and where it sits on the road to general availability (as of June 2026). The well-established ones link to a deeper section below; the newest few (Community Agent, Employee Self-Service, Skills agent) are in for completeness, with the honest note that Microsoft's public documentation on them is still thin — so confirm before you plan around them.

| Agent | What it does | Lives in | Unlocked by | Status |
|---|---|---|---|---|
| **[Facilitator](#teams)** | Takes shared notes, runs the agenda, answers questions in a meeting | Teams meetings | M365 Copilot | Core GA; tasks + drafting in preview |
| **[Planner Agent](#planner)** *(was Project Manager)* | Builds task plans, works tasks assigned to it, writes status reports | Microsoft Planner | M365 Copilot (premium Planner adds goal→plan) | GA |
| **[Channel Agent](#teams)** | A per-channel expert that answers from the channel's messages and files | Teams channels | M365 Copilot | Preview |
| **Interpreter** | Real-time voice interpretation across 9 languages in meetings | Teams meetings | M365 Copilot | GA |
| **[Knowledge Agent](#sharepoint)** | Tidies a SharePoint library — auto-tags, sets rules, builds views | SharePoint | M365 Copilot | Preview |
| **[SharePoint agents](#sharepoint)** | Answer questions grounded in a site's files, per your permissions | SharePoint sites | M365 Copilot **or** pay-as-you-go | GA |
| **Researcher** | Deep, source-cited research across your work data and the web | Copilot Chat | M365 Copilot | GA |
| **Analyst** | Advanced data analysis — runs Python over your data | Copilot Chat | M365 Copilot | GA |
| **[Community Agent](#viva)** | A community expert that answers and posts verified answers | Viva Engage | M365 Copilot* | Newer — docs thin |
| **Employee Self-Service** | Answers HR and IT policy questions | Copilot Chat | M365 Copilot | Preview |
| **Skills agent** | Finds people by skills across the organisation | Copilot app | M365 Copilot | Rolling out |

<span style="font-size:0.85em;">*Community Agent licensing is not fully documented publicly yet — treat the licence column as "appears to need M365 Copilot" and confirm.*</span>

The next sections walk the ones with the most to show, grouped by the app they live in. The three with their own deep guides — Facilitator, Planner and the SharePoint Knowledge Agent — get a short summary here and a link to the full walkthrough.

---

## In Microsoft Teams {#teams}

Teams is where the most agents live, because so much work happens in meetings and channels.

### Facilitator — your meeting's note-taker and timekeeper

**Facilitator** joins a **scheduled Teams meeting** as a visible teammate. Unlike Copilot in Teams — which is private to whoever asks it — Facilitator's prompts and answers are visible to *everyone* in the meeting. It writes shared, real-time notes, pulls the agenda out of the invite, runs a timer for each topic, answers questions in the meeting chat, and posts a tidy recap at the end.

A couple of things worth knowing up front: it works in **scheduled meetings only** (not 1:1 chats, group chats, channel meetings, "Meet now", or calls), it needs **Loop experiences** turned on, and prompting it needs a **Microsoft 365 Copilot** licence — though unlicensed people can read everything it writes.

> 📎 **Full walkthrough:** [The Microsoft 365 Facilitator Agent in Teams](/blog/microsoft-365-facilitator-agent/) — turning it on, the agenda timer, in-meeting Q&A, task tracking and recaps, with screenshots of each.

### Channel Agent — a standing expert for a Teams channel *(preview)*

The **Channel Agent** is a dedicated agent that lives inside one Teams channel and takes on its name and icon. It draws on the channel's **messages**, its **SharePoint files**, and **meeting transcripts** to answer questions, so a new joiner can `@mention` it and ask "what did we decide about the launch date?" instead of scrolling for an hour.

You add and find agents from the channel's **Agents and bots** panel. Each channel can have **one** Channel Agent.

<p><img src="/images/blog/microsoft-365-channel-agent/01-channel-agent.webp" alt="A Microsoft Teams channel called CoreFiber-Launch with the Agents and bots panel open on the right, showing a gallery of agents including the CoreFiber-Launch channel agent, Designer, Forms, Power Apps and Power BI, plus a list to add more agents and bots." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The **Agents and bots** panel inside a Teams channel. The channel's own agent (here, "CoreFiber-Launch") sits alongside other apps you can add.*

Once it's there, you talk to it in the channel like any teammate. Ask it to compare notes, summarise a thread, or pull the open action items, and it answers from the channel's own content.

<p><img src="/images/blog/microsoft-365-channel-agent/02-channel-summary.webp" alt="A Teams channel conversation where a user asks the CoreFiber-Launch Agent to compare their launch features to what is in market and produce a concise summary, and the agent replies in a side panel with an AI-generated summary listing Similarities and Differences." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Asking the Channel Agent for a concise market comparison. It answers from the channel's messages and files, with the response in a side panel.*

The Channel Agent is in **public preview**. It's **allowed by default**, and new channels get one automatically unless an admin turns that off (Teams admin center → Teams apps → **Agent settings**). It needs a **Microsoft 365 Copilot** licence to interact with — people without one can read its answers but can't ask it questions — and it supports around two dozen languages, with English the strongest.

### Interpreter — real-time voice interpretation

Worth a mention while we're in Teams: **Interpreter** is a generally available agent that does **real-time spoken interpretation** in meetings across nine languages (Chinese, English, French, German, Italian, Japanese, Korean, Portuguese and Spanish), included up to 20 hours per user per month with a Copilot licence. It can even match your own voice — and Microsoft says no voice samples are stored.

---

## In Microsoft Planner {#planner}

### The Planner Agent *(formerly "Project Manager agent")*

If you've seen this called the **Project Manager agent**, that's the same thing — Microsoft has **renamed it the Planner Agent**, and it's now **generally available** in both basic and premium Planner plans.

It does three useful jobs. It **builds a task list from a goal** (premium plans), it **works tasks you assign to it** and hands back the result in the task, and it **writes status reports** you can share. You can also just **chat with it** about a plan.

> 📎 **Full walkthrough:** [The Planner Agent (Project Manager agent), explained](/blog/microsoft-365-project-manager-agent/) — generating a plan from a goal, grounding it in your files, assigning it work, and producing a status report, step by step.

The neat part is how this links back to Teams: Facilitator can **create a task during a meeting**, and it lands in Planner where the Planner Agent can pick it up — two built-in agents handing work to each other.

---

## In SharePoint {#sharepoint}

SharePoint actually has **two** agent stories, and it's easy to mix them up, so let's keep them separate.

### Agents in SharePoint — ask your files a question *(GA)*

Every SharePoint site ships with a **ready-made agent** that answers questions grounded in that site's pages and documents — and it only ever answers based on what *you* personally have permission to see. People with edit rights can also build **custom agents** scoped to specific files or libraries, and share them into Teams. These **SharePoint agents** are **generally available** and can run either on a **Microsoft 365 Copilot** licence or a **pay-as-you-go** billing path an admin sets up for unlicensed users.

### The Knowledge Agent — tidy the library itself *(preview)*

Newer, and different: the **Knowledge Agent (preview)** doesn't answer questions *about* your files — it **organises the library**. It reads your documents, suggests metadata columns and fills them in, sets up rules ("when a ZavaCore Fiber file is added, email me"), and builds grouped, curated views. Think of it as a librarian for the document library rather than a search box.

> 📎 **Full walkthrough:** [The SharePoint Knowledge Agent, explained](/blog/microsoft-365-knowledge-agent/) — auto-tagging metadata, setting up rules, and building curated views, with screenshots — plus how it differs from the question-answering SharePoint agents.

---

## In Viva Engage {#viva}

### The Community Agent

Viva Engage communities can have a **Community Agent** — an agent that acts like a knowledgeable community member, answering questions from the community's own discussions, files and SharePoint library, and (with the right setting) posting **verified answers** that an admin or expert has approved first.

<p><img src="/images/blog/microsoft-365-communities-agent/01-communities-setup.webp" alt="A Set up your agent page for a Viva Engage Community agent named Product Sales Support, showing it set to Active, a Require review before posting toggle turned On, a description of what the community agent does, and a Knowledge section to add SharePoint sources." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Setting up a Community Agent in Viva Engage. Note the **Require review before posting** control and the option to add SharePoint sources as knowledge.*

When someone asks a question in the community, the agent can draft an answer grounded in those sources; once an expert verifies it, it's marked as a **verified answer** for everyone who finds the thread later.

<p><img src="/images/blog/microsoft-365-communities-agent/02-communities-verified.webp" alt="A Viva Engage community called Product Sales Support with 1,516 members, showing a member's question about ZavaCore Fiber smart apparel answered by the Product Sales Support agent with a Verified answer badge, marked as verified by a named expert." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*A question in a Viva Engage community answered by the Community Agent and marked as a **verified answer** by a named expert.*

> ⚠️ **Honest caveat:** Microsoft's public documentation for the Community Agent is still thin — the broader [Copilot in Viva Engage](https://learn.microsoft.com/en-us/viva/engage/configure-microsoft-365-copilot-in-viva-engage) experience is well documented, but this specific community agent isn't yet. Treat its exact status and licensing as "appears to need a Microsoft 365 Copilot licence" and confirm with Microsoft before you plan around it.

---

## In Copilot Chat {#chat}

Three more built-in agents live in the Microsoft 365 Copilot app and Copilot Chat rather than in a single app:

- **Researcher** — runs deep, multi-step research across your work data *and* the web, and hands back a **source-cited report**. Generally available.
- **Analyst** — does serious data analysis, including **writing and running Python** over data you give it, with its reasoning shown. Generally available.
- **Employee Self-Service** and the **Skills agent** — answer HR/IT policy questions and help find people by skill, respectively; newer and still rolling out.

Researcher and Analyst come with a monthly query allowance on a Copilot licence — the exact figure has shifted during preview, so check the current Microsoft 365 Copilot docs before quoting it. One admin nuance worth flagging: these two sit in the core Copilot chat experience and are managed separately from the standard agent settings.

---

## How to turn them on — governance in one place {#enable}

For most of these agents, the **on-switch is the licence**: assign a Microsoft 365 Copilot licence and the agent becomes available. Beyond that, here's where you actually control them.

| Control plane | What you do there |
|---|---|
| **Microsoft 365 admin center → Agents** | The main one. The **Registry** lists every agent in the tenant; **Agent settings** controls allowed types, sharing, and user access. You can bulk-install Microsoft's first-party agents here. |
| **Teams admin center** | Teams agents — Facilitator, Channel Agent, Interpreter. Allow/block under **Manage apps**; auto-creation and meeting policy settings live here too. |
| **SharePoint admin center** | SharePoint agents — access controls and the **pay-as-you-go billing** setup. |
| **Microsoft Agent 365** | The newer single layer (GA May 2026) to **observe, govern and secure** every agent in one place, whoever built it. **Needs its own per-user licence** — it isn't bundled with M365 Copilot. |

> ✅ **Two quick prerequisites people miss:** the Teams meeting agents (Facilitator, Channel Agent) need **Loop experiences in Teams** turned on; and **government-cloud availability varies by agent** — the Teams meeting agents and the Planner Agent aren't in GCC, GCC High or DoD, while SharePoint agents have their own (different) GCC/DoD status. Check the service-description row for the specific agent if that's you.

For the full governance picture — registry, policies, security templates and Agent 365 — see [Agent 365: the security & governance guide](/blog/agent-365-security-governance-complete-guide/).

---

## What they cost {#cost}

The honest answer: for the built-in agents, **the Microsoft 365 Copilot licence is the cost**, as far as Microsoft's public documentation shows. They're included with the seat rather than metered per message. Two things to keep in your head:

- **SharePoint agents** have a separate **pay-as-you-go** path (for unlicensed users) that *is* billed per query — roughly 2 "messages" for a generative answer and 10 for a wider tenant-graph-grounded one, so a single complex prompt that does both can total around 12. Copilot-licensed users aren't charged.
- **Premium Planner features** (turning a goal into a full plan) need a **Planner Plan 1 / Project Plan 3 or 5** on top of the Copilot licence.
- Separately, **usage-based work like Copilot Cowork** is metered in **Copilot Credits** — that's a different billing model with its own [cost-management guide](/blog/microsoft-365-copilot-cost-management/).

Where the public docs don't spell out metering for a specific agent, we've said so rather than guessed. Confirm anything billing-critical with your Microsoft licensing contact.

---

## Which agent for which job {#which}

| If you want to… | Reach for… |
|---|---|
| Keep a meeting on time with shared notes | **Facilitator** |
| Turn a project goal into a worked task plan | **Planner Agent** |
| Let a new teammate "ask the channel" | **Channel Agent** |
| Answer questions from a site's documents | **SharePoint agents** |
| Tidy and tag a messy document library | **Knowledge Agent** |
| Run a verified Q&A space for a big community | **Community Agent** |
| Get a cited research report | **Researcher** |
| Crunch numbers and run Python on your data | **Analyst** |
| Interpret a meeting across languages live | **Interpreter** |

---

## Official Microsoft sources {#sources}

The public, primary references behind this page:

- [AI tools and agents in Microsoft Teams (overview)](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview)
- [Facilitator in Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/facilitator-teams)
- [Set up the Channel Agent for Teams](https://learn.microsoft.com/en-us/microsoftteams/set-up-channel-agent-teams)
- [Interpreter agent in Teams](https://learn.microsoft.com/en-us/microsoftteams/interpreter-agent-teams)
- [Access the Planner Agent](https://support.microsoft.com/en-us/office/access-project-manager-agent-86bf60a1-239d-4c37-b7b6-9a4111e1cc02)
- [Get started with agents in SharePoint](https://learn.microsoft.com/en-us/sharepoint/get-started-sharepoint-agents)
- [Microsoft 365 Copilot in Viva Engage](https://learn.microsoft.com/en-us/viva/engage/configure-microsoft-365-copilot-in-viva-engage)
- [Agent registry in the Microsoft 365 admin center](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry)
- [Microsoft Agent 365 overview](https://learn.microsoft.com/en-us/microsoft-agent-365/overview)
- [Microsoft 365 Copilot service description](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-copilot) — feature and government-cloud availability

---

## The rest of this guide {#cluster}

This overview is the hub. The deep walkthroughs:

- **[The Microsoft 365 Facilitator Agent in Teams](/blog/microsoft-365-facilitator-agent/)** — meetings: notes, agenda, Q&A, tasks, recaps
- **[The Planner Agent (Project Manager agent)](/blog/microsoft-365-project-manager-agent/)** — plans from goals, status reports, grounding in your files
- **[The SharePoint Knowledge Agent](/blog/microsoft-365-knowledge-agent/)** — auto-tagging, rules and curated views

And if you'd rather **build** an agent than use a built-in one:

- **[Microsoft 365 Agent Builder, explained](/blog/m365-agent-builder-explained/)** — the no-code way to make your own
- **[Agent Builder vs Copilot Studio vs Foundry](/blog/agent-builder-vs-copilot-studio-vs-foundry/)** — which tool for which job
- **[Agent 365: security & governance](/blog/agent-365-security-governance-complete-guide/)** — observe, govern and secure every agent
- **[What's new at Microsoft Build 2026](/blog/microsoft-build-2026-recap/)** — where all this is heading
