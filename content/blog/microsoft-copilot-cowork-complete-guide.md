---
title: "Microsoft Copilot Cowork — The Complete Guide to AI That Actually Does the Work"
description: "Everything you need to know about Copilot Cowork — Microsoft's biggest AI leap since 2023. Simple explanation, real-world scenarios for every role, how it differs from regular Copilot, what an agentic harness is, Frontier access, and how it compares to Claude Cowork."
date: 2026-04-22
lastmod: 2026-04-22
card_tag: "Copilot"
tag_class: "ai"
sitemap:
  priority: 0.9
faq:
  - question: "What is Microsoft Copilot Cowork?"
    answer: "Copilot Cowork is a new AI agent inside Microsoft 365 that doesn't just answer your questions — it actually does the work. You describe an outcome (like 'prep me for tomorrow's client meeting'), and Cowork autonomously plans the steps, executes them across Outlook, Teams, Word, Excel, and SharePoint, and checks in with you before doing anything sensitive."
  - question: "How is Copilot Cowork different from regular Microsoft 365 Copilot?"
    answer: "Regular Copilot is reactive — you ask, it answers, one app at a time. Cowork is proactive and cross-app — you describe a goal, it builds a plan, executes across multiple apps simultaneously, runs in the background for minutes or hours, and checks in at decision points. Think assistant vs colleague."
  - question: "What is an agentic harness?"
    answer: "An agentic harness is the orchestration framework that makes Cowork possible. It coordinates multiple specialist AI agents, provides shared context (via Work IQ), enforces enterprise governance (Entra ID, audit trails, DLP), and ensures human-in-the-loop checkpoints for sensitive actions."
  - question: "How do I get Copilot Cowork?"
    answer: "Copilot Cowork is currently available through the Microsoft Frontier program. Your IT admin needs to enrol the tenant in Frontier via the M365 Admin Center (Copilot > Settings > Frontier), enable Anthropic as a subprocessor, and then make the Cowork agent available to users or groups."
  - question: "Is Copilot Cowork free?"
    answer: "No. You need a Microsoft 365 Copilot licence (the $30/user/month add-on) and your tenant must be enrolled in the Frontier program. Cowork is also included in the upcoming Microsoft 365 E7 plan at $99/user/month."
  - question: "What is the Microsoft Frontier program?"
    answer: "Frontier is Microsoft's early access program for cutting-edge Copilot features. Global Admins can opt in via the M365 Admin Center. It gives your organisation access to features like Cowork before they reach general availability."
  - question: "Can Copilot Cowork send emails without my permission?"
    answer: "No. Cowork requires your explicit approval before taking sensitive actions like sending emails, scheduling meetings, or sharing files. It always checks in at critical decision points — you stay in control."
  - question: "How is Copilot Cowork different from Claude Cowork?"
    answer: "Copilot Cowork runs in the cloud inside your M365 tenant with full enterprise governance (Entra ID, Purview DLP, audit trails). Claude Cowork is desktop-first with local file access and third-party connectors, plus enterprise admin controls on higher tiers. Copilot Cowork is built for managed enterprise environments; Claude Cowork is built for individual power users and mixed-tool setups."
  - question: "What AI model does Copilot Cowork use?"
    answer: "Copilot Cowork uses Microsoft's multi-model approach, which includes Anthropic's Claude for agentic reasoning in supported experiences. Your admin controls which AI providers are enabled for your tenant."
  - question: "Does Copilot Cowork work with my existing data permissions?"
    answer: "Yes. Cowork operates within your existing Microsoft 365 permissions. It can only access data that you already have access to — it doesn't bypass SharePoint permissions, Conditional Access policies, or DLP rules."
  - question: "Will Copilot Cowork replace my job?"
    answer: "No. Cowork is brilliant at coordination, preparation, and routine multi-step tasks. It's not designed for strategy, relationship building, creative thinking, or judgment calls. It handles the busywork so you can focus on work that actually needs a human brain."
images: ["images/og/blog/microsoft-copilot-cowork-complete-guide.jpg"]
tags:
  - microsoft-365
  - copilot
  - ai
  - productivity
---

<div class="living-doc-banner">

This is a living document. The AI landscape moves fast — features ship, names change, and what's in preview today might be GA tomorrow. If you spot anything out of date or inaccurate, please [send me feedback](/feedback/) and I'll update it. Last verified: April 2026.

</div>

Remember when Copilot first launched back in 2023? You could ask it to summarise an email, draft a paragraph in Word, or make a chart in Excel. It was genuinely impressive. But every time you wanted to do something across multiple apps — like "prep me for a meeting using info from my emails, Teams chats, and SharePoint files" — you had to prompt each app separately, copy-paste between them, and stitch it all together yourself.

Copilot Cowork changes that. Completely.

Instead of being an assistant that waits for your instructions, Cowork is more like a colleague who takes ownership of a task. You describe what you need. It figures out the steps, works across all your M365 apps, and checks in with you before doing anything risky.

This guide explains everything — in plain language, with real scenarios, and honest opinions on what's great and what's not quite there yet.

**Quick links:** [🚀 6 Prompts to Try Today](#6-high-impact-cowork-prompts-you-can-use-today) · [What is Cowork?](#what-is-copilot-cowork) · [Regular Copilot vs Cowork](#how-is-this-different-from-regular-copilot) · [Scenarios by role](#real-scenarios--what-can-cowork-actually-do) · [What's an Agentic Harness?](#what-is-an-agentic-harness--and-why-does-copilot-cowork-need-one) · [How to get it](#how-to-get-microsoft-copilot-cowork) · [Cowork vs Claude Cowork](#copilot-cowork-vs-claude-cowork) · [FAQ](#frequently-asked-questions)

---

## TL;DR

- **Copilot Cowork** = AI that doesn't just answer questions — it does the work across your entire M365 suite
- **Three waves of Copilot:** Assistant (2023) → Agent Builder (2025) → **Cowork (2026)**
- **How it works:** Describe an outcome → Cowork builds a plan → executes across apps → checks in with you
- **Enterprise-safe:** Entra ID permissions, Purview DLP, full audit trail, human-in-the-loop
- **Available now** via the [Frontier program](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview#frontier) — currently rolling out in select markets, starting with US English
- **Requires:** Microsoft 365 Copilot licence + Frontier enrollment + Anthropic enabled
- **Not the same as Claude Cowork** — Copilot Cowork runs in your tenant (cloud), Claude runs on your desktop (local)

---

## What is Copilot Cowork?

Let me give you the simplest possible explanation.

Think about how you work with a really good colleague. You don't say "open my inbox, find emails from Sarah about the budget, copy the numbers, open Excel, paste them in, make a chart, then open PowerPoint and insert it." You just say: **"Hey, can you put together the budget slides for Friday's meeting?"**

That's Copilot Cowork. You describe the outcome. It figures out the steps.

Here's a real example:

<div class="prompt-cards">

> "Prep me for tomorrow's quarterly review with Contoso."

</div>

<div class="cowork-scenario">

> **Cowork responds:**
> 1. Searches your emails and Teams chats with Contoso contacts
> 2. Pulls the latest proposal from SharePoint
> 3. Finds the meeting recording from last quarter's review
> 4. Drafts a briefing document in Word with key talking points
> 5. **Checks in:** "I found an NDA in the shared folder — should I include contract details in the briefing?"
> 6. After your approval, sends the briefing to your team

</div>

One prompt. Multiple apps. Real work done. And it asked before doing anything sensitive.

### What Does Cowork Actually Look Like?

When you open Copilot (in Teams, Outlook, or the web app), you'll find Cowork in the **Agent Store** — it appears as an agent you can add to your Copilot experience. Once added, you interact with it through the same chat interface you already know.

The difference is what happens after you send a message. Instead of an instant reply, Cowork shows you a **plan** — a list of steps it's going to take. You can review the plan, adjust it, or let it run. As it works, you'll see progress updates, and it'll pause at checkpoints to ask for your input.

It feels less like chatting with a bot and more like delegating to a very organised team member who keeps you in the loop.

📖 [Official announcement: Copilot Cowork — A new way of getting work done](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/copilot-cowork-a-new-way-of-getting-work-done/)

---

## 6 High-Impact Cowork Prompts You Can Use Today

Now that you know what Cowork is, here's the fun part — trying it yourself. These prompts are based on real workflows that people actually do every week. Copy them, swap the **[placeholders]** for your own details, and watch Cowork do the work. Each one is designed to show Cowork's multi-step, cross-app power — the thing that makes it fundamentally different from regular Copilot.

**💡 Pro tip:** The best Cowork prompts describe an **outcome**, not a process. Tell it what you need, not how to get there.

### 1. ☀️ Morning Triage & Priority Setter

*Best for: Everyone. Start your day in 60 seconds instead of 20 minutes of inbox scrolling.*

<div class="prompt-cards">

> Good morning! Give me a full briefing for today:
> 1. What meetings do I have today — list them with times and who's attending
> 2. What are my most important unread emails from overnight — flag anything that needs a response before my first meeting
> 3. Any urgent or time-sensitive Teams messages I haven't responded to
> 4. Based on all of this, recommend the 3 things I should prioritise this morning
>
> Then draft quick reply emails for the top 2 urgent items — keep them professional, friendly, and under 3 sentences each. Show me for approval.

</div>

<div class="cowork-scenario">

> **What Cowork does:** Reads your calendar, scans unread emails, checks Teams messages, prioritises your morning, and drafts replies — all before your first coffee is cold. Five skills working together: Daily Briefing → Calendar → Email → Teams → Communications.

</div>

### 2. 🎯 Meeting Prep Autopilot

*Best for: Anyone with customer meetings, stakeholder reviews, or project check-ins.*

<div class="prompt-cards">

> I have a meeting with **[customer/stakeholder name]** about **[topic, e.g. "quarterly review", "project kickoff", "budget approval"]** coming up this week. Look at my calendar to find the meeting, then search my recent emails and Teams chats for any context about **[customer/stakeholder name]** or this topic. Find the most relevant presentation or document I've used recently on this topic from my OneDrive or SharePoint. Create a 1-page Word briefing with: the meeting objective, key attendees, 3 talking points based on what I've discussed with them before, and a link to the deck. Then draft an email to the attendees confirming the session and attaching the briefing.

</div>

<div class="cowork-scenario">

> **What Cowork does:** Finds the meeting on your calendar, digs through your email and Teams history with that person, locates the right files in SharePoint, creates a briefing document, and drafts a confirmation email — all from one prompt. Skills: Calendar → Enterprise Search → Word → Email.

</div>

### 3. 📬 Post-Session Follow-Up Machine

*Best for: Trainers, presenters, sales reps — anyone who runs sessions and needs to follow up afterwards.*

<div class="prompt-cards">

> I just finished a **[session type, e.g. "training session", "client demo", "team workshop"]**. Look at my most recent meeting that ended in the last 2 hours. Find the recording, any slides or documents that were shared during or before that meeting, and summarise the key topics covered based on the meeting transcript. Then draft a follow-up email to all attendees with:
> - A thank you and 2-sentence summary of what we covered
> - Links to the recording and slides
> - A "Questions?" section inviting them to reply
>
> Send it from my Outlook — show me for review before sending.

</div>

<div class="cowork-scenario">

> **What Cowork does:** Finds the meeting you just finished, locates the recording and shared materials, reads the transcript for key points, and drafts a complete follow-up email with everything linked — ready for you to review and send. Skills: Meetings → Enterprise Search → Email.

</div>

### 4. 📊 Weekly Team Update Generator

*Best for: Team leads, project managers, and anyone whose manager asks "what did you work on this week?"*

<div class="prompt-cards">

> It's the end of the week. Review my calendar, sent emails, and Teams messages from this week. Create a structured weekly update that includes:
> 1. Key meetings I attended and what was discussed (1 line each)
> 2. Any customer or partner interactions
> 3. Content I created or shared (decks, docs, links)
> 4. Open follow-ups I still need to action
> 5. What's coming next week based on my calendar
>
> Format it as a professional but concise Teams-friendly post, then post it to the **[team channel name, e.g. "Project Alpha", "NZ Sales Team"]** channel for my approval.

</div>

<div class="cowork-scenario">

> **What Cowork does:** Reviews your entire week across Calendar, Email, and Teams, creates a structured summary, and posts it to your team channel — with your approval before it goes live. The weekly update that nobody has time to write, written in 2 minutes. Skills: Calendar → Email → Enterprise Search → Communications.

</div>

### 5. 📚 Knowledge Pack Builder

*Best for: Subject matter experts, consultants, presales — anyone who repeatedly answers the same complex questions.*

<div class="prompt-cards">

> A **[recipient role, e.g. "customer CISO", "project sponsor", "new team member"]** has asked me about **[topic, e.g. "Copilot governance and security controls", "our data migration approach", "onboarding process"]**. Search my OneDrive, SharePoint, and recent emails for any documents, presentations, or materials I've shared or worked on about this topic. Also do a deep research on the latest information from Microsoft Learn about **[topic]**.
>
> Create a polished 2-page Word document titled **"[Document title, e.g. 'M365 Copilot Governance Quick Guide']"** that covers the key areas a **[recipient role]** needs to know. Then draft an email to **[recipient name]** attaching this document with a brief "here's what you asked for" message. Show me everything for review.

</div>

<div class="cowork-scenario">

> **What Cowork does:** Combines your internal knowledge (SharePoint files, past emails) with fresh external research (Microsoft Learn), creates a polished document, and drafts a delivery email — turning a 2-hour research task into a 5-minute approval. Skills: Enterprise Search → Deep Research → Word → Email.

</div>

### 6. 🏢 Customer Deliverable From Email Brief

*Best for: Anyone who receives a brief or request via email and needs to deliver something back — slides, reports, proposals.*

<div class="prompt-cards">

> I need to prepare a **[deliverable type, e.g. "slide deck", "report", "proposal"]** for an upcoming session with **[customer/team name]**.
>
> **Step 1 — Find the brief:** Search my emails for a message from **[contact name]** at **[company name]** about **[topic, e.g. "executive training session", "quarterly review", "project kickoff"]**. Extract every topic and agenda item they listed.
>
> **Step 2 — Gather my materials:** Search my OneDrive and SharePoint for any existing decks, documents, or materials I've used on this topic recently.
>
> **Step 3 — Research:** Do a deep research on the latest information about **[topic]** from Microsoft Learn and the web.
>
> **Step 4 — Build the deliverable:** Using the brief as the structure and my materials plus research as content, create a clean, professional PowerPoint presentation covering every item from the brief. Keep it **[audience]-friendly** — no jargon, focus on outcomes. Each slide should answer "why should a busy **[audience role]** care about this?" Make it work as both a presentation AND a standalone cheat sheet they can reference later.
>
> **Step 5 — Draft the reply:** Draft an email to **[contact name]** attaching the deck, confirming I've covered all their agenda items, and asking if there's anything to adjust. Show me everything for review before sending.

</div>

<div class="cowork-scenario">

> **What Cowork does:** This is the ultimate showcase. Cowork reads a customer's email, extracts their requirements, searches your existing materials, researches the latest information, builds a complete slide deck structured around their brief, and drafts a delivery email — all from one prompt. What normally takes 2-3 hours, done in minutes. Skills: Email → Enterprise Search → Deep Research → PowerPoint → Email.

</div>

---

**🎤 If you're demoing Cowork to others**, start with Prompt 1 (Morning Triage) — it's universal and gets instant reactions. Then show Prompt 6 (Customer Deliverable) to demonstrate the full multi-step power. The gap between "regular Copilot" and "Cowork" clicks immediately when people see it execute across 5 apps from a single instruction.

---

## How is This Different from Regular Copilot?

This is the question everyone asks, and it's a great one. Here's the honest comparison:

| | **Regular M365 Copilot** | **Copilot Cowork** |
|---|---|---|
| **How you use it** | You prompt, it responds | You describe an outcome, it executes |
| **Scope** | One app at a time | Across ALL your M365 apps |
| **Behaviour** | Reactive — waits for you | Proactive — plans and acts |
| **Duration** | Instant response | Can run for minutes, hours, even days |
| **Background work** | ❌ No | ✅ Yes — works while you do other things |
| **Multi-step** | One question, one answer | Plans → executes → checks in → delivers |
| **Example** | "Summarise this email" | "Prep me for the board meeting on Friday" |

### The Café Analogy ☕

Think of regular Copilot like a self-service café. You walk up to the counter, order a coffee, and it's made for you. One order at a time. You want a sandwich too? Walk back to the counter, place another order.

Copilot Cowork is like hiring a café manager. You say "set up the morning catering for 50 people" and they handle everything — ordering supplies, coordinating staff, setting up tables, and checking with you before changing the menu. Same café, completely different experience.

📖 [Powering Frontier transformation with Copilot and agents](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/powering-frontier-transformation-with-copilot-and-agents/)

---

## The Three Waves of Copilot

To understand where Cowork fits, it helps to see the bigger picture. Copilot hasn't stood still since 2023 — it's been evolving in waves:

| Wave | Year | What Copilot Does |
|------|------|------------------|
| **Wave 1** | 2023 | **Assistant** — You ask, it answers. One app at a time. "Summarise this email." |
| **Wave 2** | 2025 | **Agent Builder** — You build custom agents in [Copilot Studio](https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio). They follow scripts you define. |
| **Wave 3** | 2026 | **Cowork** — You describe an outcome. Copilot plans, executes across all apps, and checks in with you. |

Each wave didn't replace the previous one — it added a new layer. You can still use Wave 1 Copilot (and you should for quick tasks). Cowork is for the bigger, multi-step stuff.

---

## Real Scenarios — What Can Cowork Actually Do?

Here's where it gets exciting. Let me walk you through what Cowork can do for different roles. These aren't hypothetical — they're based on the capabilities available in the Frontier preview today.

### 🧑‍💻 IT Admin

<span class="cowork-persona it">IT Administration</span>

<div class="prompt-cards">

> "Check if our MFA adoption is on track and draft a status update for the security team."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Pull your [Entra ID sign-in reports](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins) and MFA registration data
> - Check your Teams channel for recent security discussions
> - Draft a status email with the numbers and trends
> - **Check in** before sending to the security distribution list

</div>

<div class="prompt-cards">

> "Find all the tickets from this week about VPN issues and create a summary for the Friday ops review."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Search your inbox and Teams for VPN-related messages
> - Pull relevant documents from SharePoint
> - Create a Word document with a summary and trends
> - Add it to the meeting invite as an attachment

</div>

### 💼 Sales

<span class="cowork-persona sales">Sales & Account Management</span>

<div class="prompt-cards">

> "I have a call with Northwave in 2 hours. Get me up to speed."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find all recent emails and Teams chats with Northwave contacts
> - Pull the latest proposal and pricing documents from SharePoint
> - Check if there were any recent support tickets
> - Draft a 1-page briefing with key talking points
> - **Check in:** "Last email from Northwave mentioned budget concerns — should I highlight the ROI section?"

</div>

<div class="prompt-cards">

> "Create a follow-up email from today's demo with the key points we discussed."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find the meeting recording and transcript from today
> - Extract the key discussion points and action items
> - Draft a professional follow-up email
> - **Check in** before sending

</div>

### 👥 HR

<span class="cowork-persona hr">Human Resources</span>

<div class="prompt-cards">

> "A new hire starts Monday. Make sure everything's ready."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Check the onboarding checklist in SharePoint
> - Verify IT equipment has been ordered (search emails)
> - Draft a welcome email with first-week schedule
> - Create a Teams channel for the new hire's team
> - **Check in** before sending anything

</div>

<div class="prompt-cards">

> "Compile feedback from the last round of performance reviews into themes."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find performance review documents in SharePoint
> - Analyse common themes across all reviews
> - Create a summary document in Word with anonymised trends
> - Flag any sensitive content before sharing

</div>

### 💰 Finance

<span class="cowork-persona finance">Finance & Operations</span>

<div class="prompt-cards">

> "Pull together the Q2 budget variance report."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find the approved Q2 budget in SharePoint
> - Pull actual spend data from shared Excel files
> - Calculate variances and highlight significant items
> - Draft a variance report in Word
> - **Check in:** "Marketing is 23% over budget — should I flag this separately?"

</div>

<div class="prompt-cards">

> "Reconcile the travel expenses submitted this month and flag anything over policy."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find expense submissions in your inbox and shared folders
> - Cross-reference with your travel policy document in SharePoint
> - Create an Excel summary with flagged items
> - **Check in:** "Three claims exceed the $500 limit — should I send them back to the submitters?"

</div>

### 📢 Marketing

<span class="cowork-persona marketing">Marketing & Communications</span>

<div class="prompt-cards">

> "Draft social media posts for next week's product launch."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find the product launch brief in SharePoint
> - Check the brand guidelines document
> - Draft 5 social posts with different angles
> - Create a scheduling overview in Excel
> - **Check in** for tone and messaging approval

</div>

<div class="prompt-cards">

> "Summarise what our competitors announced this week and create talking points for the team."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Search your inbox and Teams for competitor mentions
> - Pull any shared competitive analysis docs from SharePoint
> - Create a summary document with key themes
> - Draft talking points your team can use in customer conversations

</div>

### 🏢 Executive

<span class="cowork-persona exec">Leadership & Executive</span>

<div class="prompt-cards">

> "Clear my afternoon for deep work."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Review your calendar for this afternoon
> - Identify which meetings can be rescheduled
> - Draft polite decline/reschedule messages
> - Block focus time on your calendar
> - **Check in:** "Your 3pm with the CFO looks important — keep it?"

</div>

<div class="prompt-cards">

> "What should I know before the board meeting on Thursday?"

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find all board-related documents shared in the past month
> - Pull action items from the last board meeting
> - Check for any flagged items from your direct reports
> - Create a comprehensive briefing document
> - Include relevant financial summaries from Excel files

</div>

---

## What is an Agentic Harness — and Why Does Copilot Cowork Need One?

If you saw Satya Nadella's keynote recently, you might have heard the term **"agentic harness."** It sounds complicated, but it's actually a really simple concept.

Here's the easy version:

An **agentic harness** is the thing that makes Cowork safe and useful instead of chaotic and dangerous.

Think about it this way. If you gave an AI full access to your email, calendar, files, and Teams — with no rules — that would be terrifying. It could send emails to your CEO, delete files, or reschedule your entire week without asking.

The **agentic harness** is everything that prevents that:

| Component | What It Does | Why You Care |
|-----------|-------------|-------------|
| **Orchestration** | Breaks your goal into steps and delegates to specialist agents | One AI doesn't do everything — specialists handle what they're best at |
| **Context (Work IQ)** | Shared memory across all agents — your emails, files, calendar, org chart | Agents understand YOUR work, not just generic knowledge |
| **Governance** | Entra ID, [Purview DLP](https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp), audit trails | Agents follow the same rules as your employees |
| **Human checkpoints** | Pauses and asks before sensitive actions | You always stay in control |
| **Multi-model** | Can use GPT-4, Claude, or other models | Best model for each task, not one-size-fits-all |

That's it. The "agentic harness" is just the **framework that keeps AI agents productive, safe, and accountable**. It's the difference between giving someone a set of power tools with safety goggles, instruction manuals, and supervision versus just handing them a chainsaw and walking away.

📖 [Manage Cowork for your organisation](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/30/copilot-cowork-now-available-in-frontier/)

---

## How to Get Microsoft Copilot Cowork

Yes, you can get it now — but with a few caveats.

Copilot Cowork is currently available through the **[Microsoft Frontier program](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview#frontier)**. This is Microsoft's early access program for cutting-edge features. It's rolling out in **select markets starting with US English** — more regions and languages are coming.

### Why Can't I See Cowork?

If you open Copilot and don't see Cowork, it's one of these reasons:

1. **Your org hasn't enrolled in Frontier** — it's an opt-in, not automatic
2. **Your admin hasn't enabled Anthropic** as a subprocessor (Cowork uses Claude under the hood)
3. **You don't have a Copilot licence** — you need the paid M365 Copilot add-on ($30/user/month)
4. **Your admin may have restricted access** to specific groups
5. **Your region or language isn't supported yet** — currently US English first

### How to Get Access (Admin Steps)

If you're an IT admin, here's how to turn it on:

1. **Enrol in Frontier:** Go to [M365 Admin Center](https://admin.microsoft.com) → Copilot → Settings → Frontier → Opt in
2. **Enable Anthropic:** Copilot → Settings → AI providers → Enable Anthropic (required — off by default in EU tenants)
3. **Cowork becomes available:** Once Frontier is enabled, licensed users can find and install Cowork from the **Agent Store** inside Copilot — no separate deployment needed
4. **Control access (optional):** If you want to restrict who can use Cowork, go to Copilot → Agents → All Agents → Find "Cowork" → Set availability for specific groups
5. **Communicate:** Let your users know it's available and what to expect

> ⚠️ **Before you enable it broadly:** Review your [SharePoint permissions](https://learn.microsoft.com/en-us/sharepoint/modern-experience-sharing-permissions) and [information governance](https://learn.microsoft.com/en-us/purview/information-governance-solution). Cowork can access anything the user can access — so if your permissions are messy, Cowork will surface that mess. Start with a pilot group.

### Licensing

| Route | Price | What You Get |
|-------|-------|-------------|
| **M365 Copilot add-on** (on E3 or E5) + Frontier | $30/user/month + opt-in | Cowork via Frontier preview |
| **[Microsoft 365 E7](/blog/microsoft-365-e7-frontier-suite-everything-you-need-to-know/)** (Frontier Suite) | $99/user/month | Cowork + Agent 365 + Entra Suite + everything in E5 |

> 📝 **Good to know:** Cowork is currently browser and desktop only (no mobile yet). It's English-only at launch. Features may change before general availability.

📖 [Copilot Cowork: Now available in Frontier](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/30/copilot-cowork-now-available-in-frontier/)

---

## Copilot Cowork vs Claude Cowork

OK, I know you're going to ask this one — so let's get into it.

Anthropic (the company behind Claude) also launched their own "Cowork" product. And here's where it gets confusing: Copilot Cowork actually uses Claude's AI model under the hood, through Microsoft's partnership with Anthropic. So they share the same brain, but everything else is different. Let me untangle it.

### The Key Difference: Where It Runs

| | **Copilot Cowork** | **Claude Cowork** |
|---|---|---|
| **Runs where** | ☁️ Cloud — inside your M365 tenant | 💻 Desktop-first — on your local machine |
| **Managed by** | Your IT admin (Entra ID, policies) | Individual user (Team/Enterprise admin controls also available) |
| **Accesses** | All your M365 data (email, Teams, SharePoint, etc.) | Local files + growing library of third-party MCP connectors |
| **Governance** | Full enterprise stack (Purview DLP, audit, Conditional Access) | Local sandbox, RBAC, with enterprise governance on higher tiers |
| **Best for** | Enterprise teams working inside Microsoft 365 | Individual power users, mixed-tool environments |
| **AI Model** | Multi-model (including Anthropic Claude) | Claude only |
| **Price** | $30/mo (Copilot licence) or $99/mo (E7) | $20/mo (Pro), $100/mo (Max), Enterprise custom |

### The Honest Take

**If your organisation is all-in on Microsoft 365** — Copilot Cowork is the clear choice. It understands your organisational context (who reports to whom, which projects are active, what meetings happened), operates within your compliance framework, and your IT team can govern it.

**If you're an individual** who works across many tools (Google Workspace, Notion, Slack, Salesforce) — Claude Cowork might serve you better because it connects to more non-Microsoft apps through [MCP connectors](https://modelcontextprotocol.io/).

**If you're wondering why Microsoft uses Anthropic's model** — it's a partnership. Microsoft provides the enterprise platform and data governance; Anthropic provides the agentic AI reasoning. Copilot uses Microsoft's multi-model approach, which includes Anthropic models in supported experiences. Think of it like a car: Anthropic builds the engine, Microsoft builds the cockpit, safety systems, and the road.

📖 [Microsoft + Anthropic partnership](https://blogs.microsoft.com/blog/2024/09/23/microsoft-makes-new-investment-in-anthropic/)

---

## What if Cowork Gets It Wrong?

This is the question people are afraid to ask but absolutely should. No AI is perfect, and Cowork will sometimes misunderstand what you want.

Here's what happens:

- **You can stop it at any time.** If you see the plan going sideways, hit pause. Cowork stops immediately.
- **You can redirect mid-task.** Say "actually, focus on the financial data, not the customer emails" and it adjusts.
- **Nothing critical happens without your approval.** Sending emails, scheduling meetings, sharing files — all require a checkpoint. If Cowork drafts a terrible email, you just don't approve it.
- **It learns from your feedback.** If you redirect or reject something, Cowork adjusts its approach for the rest of the task.

The honest truth? Cowork is brilliant at 80% of coordination work and occasionally off-target on the other 20%. But because of the checkpoint system, the worst case is usually "it wasted a few minutes on the wrong approach" — not "it sent an embarrassing email to the CEO."

---

## What Cowork Can't Do (Yet)

Let's keep it real:

- ❌ **Can't access external systems** — only M365 apps (no Salesforce, Jira, SAP — yet)
- ❌ **English only** at launch — more languages coming
- ❌ **No offline mode** — it's cloud-based, needs internet
- ❌ **Won't replace deep expertise** — it's great at coordination tasks, not strategic thinking
- ❌ **Permissions amplifier** — if your SharePoint permissions are messy, Cowork will surface that mess to users who shouldn't see it

These are solvable problems, and Microsoft is actively working on all of them. But it's worth knowing before you promise the world to your leadership.

---

## Frequently Asked Questions

### What is Microsoft Copilot Cowork?

Copilot Cowork is a new AI agent inside Microsoft 365 that doesn't just answer your questions — it actually does the work. You describe an outcome (like "prep me for tomorrow's client meeting"), and Cowork autonomously plans the steps, executes them across Outlook, Teams, Word, Excel, and SharePoint, and checks in with you before doing anything sensitive.

📖 [Official Copilot Cowork overview](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/copilot-cowork-a-new-way-of-getting-work-done/)

### How is Copilot Cowork different from regular Microsoft 365 Copilot?

Regular Copilot is reactive — you ask, it answers, one app at a time. Cowork is proactive and cross-app — you describe a goal, it builds a plan, executes across multiple apps simultaneously, runs in the background for minutes or hours, and checks in at decision points. Think assistant vs colleague.

### What is an agentic harness?

An agentic harness is the orchestration framework that makes Cowork possible. It coordinates multiple specialist AI agents, provides shared context (via [Work IQ](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview)), enforces enterprise governance (Entra ID, audit trails, DLP), and ensures human-in-the-loop checkpoints for sensitive actions.

### How do I get Copilot Cowork?

Your IT admin needs to enrol the tenant in the [Microsoft Frontier program](https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview#frontier) via the M365 Admin Center (Copilot → Settings → Frontier) and enable Anthropic as a subprocessor. Once enabled, licensed users can find and install Cowork from the Agent Store inside Copilot.

📖 [Manage Cowork for your organisation](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/30/copilot-cowork-now-available-in-frontier/)

### Is Copilot Cowork free?

No. You need a Microsoft 365 Copilot licence (the $30/user/month add-on) and your tenant must be enrolled in the Frontier program. Cowork is also included in the upcoming [Microsoft 365 E7](/blog/microsoft-365-e7-frontier-suite-everything-you-need-to-know/) plan at $99/user/month.

### Can Copilot Cowork send emails without my permission?

No. Cowork requires your explicit approval before taking sensitive actions like sending emails, scheduling meetings, or sharing files. It always checks in at critical decision points — you stay in control.

### How is Copilot Cowork different from Claude Cowork?

Copilot Cowork runs in the cloud inside your M365 tenant with full enterprise governance (Entra ID, [Purview DLP](https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp), audit trails). Claude Cowork runs locally on your desktop with sandboxed file access and connects to third-party tools via [MCP connectors](https://modelcontextprotocol.io/). Copilot Cowork is built for managed enterprise environments; Claude Cowork is built for individual power users.

### What AI model does Copilot Cowork use?

Copilot Cowork uses Microsoft's multi-model approach, which includes Anthropic's Claude for agentic reasoning in supported experiences. Your admin controls which AI providers are enabled for your tenant.

### Does Copilot Cowork work with my existing data permissions?

Yes. Cowork operates within your existing Microsoft 365 permissions. It can only access data that you already have access to — it doesn't bypass SharePoint permissions, [Conditional Access](https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview) policies, or DLP rules. This is why cleaning up permissions BEFORE enabling Cowork is so important.

### Will Copilot Cowork replace my job?

No. Cowork is brilliant at coordination, preparation, and routine multi-step tasks. It's terrible at strategy, relationship building, creative thinking, and judgment calls. It's a colleague that handles the busywork so you can focus on the work that actually needs a human brain.

---

## Related Articles

- [Microsoft 365 E7 (Frontier Suite) — Everything You Need to Know](/blog/microsoft-365-e7-frontier-suite-everything-you-need-to-know/)
- [Microsoft 365 Copilot Chat April 2026 Changes — What Every IT Admin Needs to Know](/blog/microsoft-365-copilot-chat-april-2026-changes-what-admins-need-to-know/)
- [20 Microsoft 365 Copilot Features You Should Be Using Right Now](/blog/20-copilot-features-you-should-be-using/)
- [Agent Builder vs Copilot Studio vs Foundry — Which One Should You Use?](/blog/agent-builder-vs-copilot-studio-vs-foundry/)
- [Microsoft 365 Copilot March 2026 Updates](/blog/microsoft-365-copilot-march-2026-updates/)

---

> **Disclaimer:** The views and opinions expressed in this article are my own and do not represent the official positions of Microsoft. All pricing mentioned is in USD and was sourced from official Microsoft pricing pages at the time of writing — pricing, features, and availability are subject to change. Copilot Cowork is currently in Frontier preview and features may change before general availability. Always refer to [official Microsoft documentation](https://learn.microsoft.com) for the most up-to-date information.
