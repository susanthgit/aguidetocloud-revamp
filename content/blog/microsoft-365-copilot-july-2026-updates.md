---
title: "What's New in Microsoft 365 Copilot: July 2026"
list_title: "M365 Copilot — July Recap: 40+ Updates"
hub_id: "whats-new"
description: "July 2026 Copilot: two new AI models, Notebooks that build Word, Excel and PowerPoint, and Outlook Chat over your whole inbox — in plain English."
date: 2026-07-20
lastmod: 2026-07-24
youtube_id: ""
card_tag: "What's New"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-july-2026-updates.jpg"]
og_headline: "What's New in Copilot — July 2026"
og_glyph: "calendar"
tags:
  - microsoft-365
  - copilot
  - news
faq:
  - question: "What's new in Microsoft 365 Copilot in July 2026?"
    answer: "July 2026 was a big month for models and agents. Two new frontier models — OpenAI's GPT-5.6 and Anthropic's Claude Sonnet 5 — arrived in Copilot. Copilot Notebooks can now turn your notes into a Word document, an Excel spreadsheet or a PowerPoint deck, and draw a mind map of what's inside; PowerPoint gained an Agent Mode that builds a deck grounded in your own files, meetings and emails through Work IQ; and Copilot Chat in Outlook expanded from a single email thread to reasoning over your whole inbox and calendar. Alongside those came watermarks for AI-generated video and audio, sensitivity-label inheritance, a new image model in PowerPoint, and — for smaller organisations — new Microsoft 365 Business plans with Copilot built in."
  - question: "Can Copilot Notebooks create a PowerPoint or Word document?"
    answer: "Yes. As of July 2026, a Copilot Notebook can generate a PowerPoint presentation, a Word document or an Excel spreadsheet directly from the content and references you've gathered in it. Copilot uses the notebook's context to draft a structured, editable file that opens in the matching app. You'll find it under 'Quick create' (or 'Create') in the notebook's left pane. Notebooks also gained mind maps, and are now available in OneNote on the web and on iPhone and iPad."
  - question: "Did Copilot Chat in Outlook get more powerful in July 2026?"
    answer: "Yes. Copilot Chat in Outlook expanded from reasoning over a single email thread to reasoning over your entire inbox, calendar, meetings and other Microsoft 365 data you already have access to — without the paid Microsoft 365 Copilot add-on. You can ask it to find and summarise information across your mailbox, surface action items and follow-ups, and help manage your calendar."
  - question: "What are AI content watermarks in Microsoft 365 Copilot?"
    answer: "From July 2026, organisations can add a visual or audio watermark to video and audio that users generate or alter with AI in Microsoft 365. It's controlled by a Cloud Policy setting ('Include a watermark when content from Microsoft 365 is generated or altered by AI'), off unless an admin enables it. Images are handled separately — individual users can turn on image watermarks under Settings & Privacy › Privacy › Data options in their Microsoft account."
  - question: "How much do the new Microsoft 365 Business with Copilot plans cost?"
    answer: "As of 1 July 2026, two permanent 'with Copilot' bundles are generally available for small and medium businesses (1 to 300 seats): Microsoft 365 Business Standard with Copilot at USD $23.50 per user per month, and Business Premium with Copilot at USD $32 per user per month (annual subscription, annual billing). The plain Business Basic, Standard and Premium plans stay available on their own if you would rather add Copilot separately. The standalone Microsoft 365 Copilot Business add-on keeps its promotional USD $18 per user per month price (list price USD $21) for organisations with up to 300 seats through 31 December 2026. Existing pricing holds until renewal; Microsoft says packaging changes receive at least 30 days' notice in Message Center."
  - question: "Which July 2026 Copilot updates need admin action?"
    answer: "Several. Review which models your tenant exposes: GPT-5.6 may be selected automatically where available, but OpenAI-operated models are tenant-controlled and become enabled for eligible commercial tenants on 24 July unless admins select 'No users'; Claude Sonnet 5 access is also admin-managed and varies by tenant and region. Re-check Copilot Cowork spending limits now that Cowork is consumption-billed. Decide whether to turn on watermarks for AI-generated video and audio. If you run Copilot Studio or Microsoft Foundry agents, confirm Agent 365 licensing and redefine any real-time protection rules that previously used Block mode. To drive adoption, publish a company-wide prompt collection and review Federated Connectors."
layout: "notebook"
stamp: "monthly recap"
intro_note: "← what changed this month, in plain English"
founder_note: |
  Every month I read every release note, every blog and every Tech Community thread, and boil it down to the version I wish someone had handed me.

  July was the month Copilot quietly stopped waiting to be asked. A notebook can now build the deck. PowerPoint can go find your files, meetings and emails and draft the slides. Outlook Chat can reason across your whole inbox instead of one thread. None of it is loud — it just shows up in the apps you already use. So the theme this month is less "look what's new" and more "look what it'll do for you now."
---

**The short version — what's new in Microsoft 365 Copilot for July 2026:** this was a month where Copilot started doing more of the work. **Copilot Notebooks** can now turn your notes into a **Word document, an Excel spreadsheet or a PowerPoint deck** — and draw a **mind map** of what's inside. **PowerPoint** gained an **Agent Mode** that builds a deck grounded in your own **files, meetings and emails** through **Work IQ**. And **Copilot Chat in Outlook** grew up from a single email thread to reasoning across your **whole inbox and calendar**.

The rest — **watermarks for AI-generated video and audio**, **sensitivity labels** that carry into Copilot-generated files, a new **image model** in PowerPoint, and a wave of **agent, admin and governance** updates — is below, each in plain English with what it actually means for you.

📅 **2026 monthly recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · July (you are here)

<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Screenshot note: images below come from my demo tenant or official Microsoft product imagery. Your tenant may look different because features roll out at different times and the interface changes often.</em></p>

---

## If you only have 2 minutes — July's picks

Three to start with:

1. **[Two new frontier models](#1-two-new-frontier-models--gpt-56-and-claude-sonnet-5--land-in-copilot)** — **GPT-5.6** and **Claude Sonnet 5** both arrived in Copilot this month. The model behind Copilot just got an upgrade (twice).
2. **[Notebooks that build your files](#2-copilot-notebooks-can-now-build-a-word-doc-excel-sheet-or-powerpoint-deck)** — a Copilot Notebook can now turn your notes into a **Word doc, Excel sheet or PowerPoint deck**. The messy-thinking space becomes the first draft.
3. **[Outlook Chat across your whole inbox](#3-copilot-chat-in-outlook-now-reads-your-whole-inbox-not-just-one-thread)** — Copilot Chat in Outlook grew up from one email thread to your **whole inbox and calendar** — without the paid Copilot add-on.

**Two more that punch above their weight this month:** [Microsoft Scout's first big upgrade](#5-microsoft-scout-grows-up-with-model-choice-and-approval-first-controls) and [Copilot in SharePoint that builds the report for you](#6-copilot-in-sharepoint-builds-the-report-not-just-finds-it).

---

## Admin Checklist — July 2026

Six things worth doing this month, in priority order:

1. **Know the new Business-with-Copilot SKUs.** If you buy for a smaller org, two new bundles are GA (**Business Standard with Copilot USD $23.50**, **Business Premium with Copilot USD $32**; annual subscription, annual billing, 1–300 seats). Existing pricing holds until renewal; Microsoft says packaging changes receive at least **30 days' notice in Message Center**.
2. **Mind the Cowork meter.** Cowork is **consumption-billed**. Tenants with at least one user in Frontier from **30 March–16 June** who used Cowork during that period had a grace period; for those tenants, billing began on **1 July**. Re-check your **spending limits** at tenant, group and user level, and your Copilot Credit budget.
3. **Review model access before training users.** **GPT-5.6** may be selected automatically where available, but OpenAI-operated models are tenant-controlled: eligible commercial tenants are enabled for all users from **24 July** unless admins select **No users** under Copilot → Settings → AI providers operating as Microsoft subprocessors. **Claude Sonnet 5** access is also admin-managed and varies by tenant and region.
4. **Set your AI-content and data policy.** Decide whether to turn on **watermarks for AI-generated video and audio** (Cloud Policy), and confirm you're happy with **sensitivity labels now carrying into Copilot-generated files**.
5. **Check your agent-security licensing.** If you run **Copilot Studio** or **Microsoft Foundry** agents, their security (discovery, posture, threat detection) now needs a **Microsoft Agent 365**-eligible licence — without it, those protections switched off on **1 July**.
6. **Drive adoption from the admin centre.** Publish a **company-wide prompt collection** in the Copilot Prompt Gallery, and review your **Federated Connectors** (now managed under Copilot → Connectors).

---

## Quick Jump

**The big headlines:** [New models — GPT-5.6 & Claude Sonnet 5](#1-two-new-frontier-models--gpt-56-and-claude-sonnet-5--land-in-copilot) · [Outlook Chat over your whole inbox](#3-copilot-chat-in-outlook-now-reads-your-whole-inbox-not-just-one-thread) · [Notebooks build Word/Excel/PowerPoint](#2-copilot-notebooks-can-now-build-a-word-doc-excel-sheet-or-powerpoint-deck) · [PowerPoint Agent Mode + Work IQ](#4-powerpoint-agent-mode-builds-your-deck-from-your-own-work-work-iq) · [Watermarks for AI content](#26-watermarks-for-ai-generated-video-and-audio)

**More highlights:** [Mind maps in Notebooks](#12-mind-maps-in-copilot-notebooks) · [Capture conversations on your phone](#13-capture-conversations-on-your-phone--audio-photos-and-notes-in-one-go) · [Sensitivity labels carry over](#28-copilot-generated-files-inherit-sensitivity-labels) · [New image model in PowerPoint](#7-a-new-microsoft-image-model-in-powerpoint) · [Open files inside Copilot Chat](#14-open-word-excel-powerpoint-and-pdf-files-right-inside-copilot-chat)

**The rest:** [Teams meeting → deck](#8-turn-a-teams-meeting-or-chat-into-a-powerpoint-deck) · [Reuse an existing deck](#9-reuse-the-content-and-style-of-an-existing-deck) · [Brand kit for visuals in Chat](#10-apply-your-brand-kit-and-style-to-visuals-in-copilot-chat) · [Build a brand kit from guidelines](#11-build-a-brand-kit-from-your-brand-guidelines) · [Search people by department](#15-copilot-search-now-finds-people-by-department) · [Word Audio Overview voice Q&A](#16-word-audio-overview-ask-questions-out-loud-while-you-listen) · [Launch Copilot on iPhone](#31-launch-copilot-on-your-iphone-with-the-action-button-or-siri) · [Company-wide prompts](#23-publish-company-wide-prompts-in-the-copilot-prompt-gallery) · [Dashboard counts everyone](#29-the-copilot-dashboard-now-counts-everyone-licensed-or-not) · [Copilot in Business SKUs](#27-copilot-now-comes-built-into-new-microsoft-365-business-skus) · [Viva Glint Copilot Highlights](#30-viva-glint-plain-english-survey-insights-with-copilot-highlights) · [Copilot in SharePoint](#6-copilot-in-sharepoint-builds-the-report-not-just-finds-it) · [Microsoft Scout upgrade](#5-microsoft-scout-grows-up-with-model-choice-and-approval-first-controls) · [MCP agents in Office + Catalyst](#20-mcp-agents-now-work-inside-office-apps-and-catalyst) · [Scheduled prompts for agents](#17-scheduled-prompts-for-agents) · [Agent tasks in the taskbar](#21-long-running-agent-tasks-show-progress-in-the-windows-taskbar) · [Submit agents to the Agent Store](#18-submit-your-own-agents-to-the-agent-store) · [Share agents to Teams](#19-share-an-agent-straight-to-a-teams-team) · [Sales Agent GA](#22-sales-agent-reached-general-availability) · [Federated Connectors](#25-federated-copilot-connectors-now-managed-in-the-admin-centre) · [Agent 365 security](#24-agent-security-moves-under-microsoft-agent-365)

**Going deeper:** [Agents & Copilot Studio](#agents--copilot-studio--july-at-a-glance) · [Admin, governance & security](#admin-governance--security--july-at-a-glance) · [On the horizon](#on-the-horizon--in-development-for-august-and-september-2026)

## 1. Two new frontier models — GPT-5.6 and Claude Sonnet 5 — land in Copilot

*For: GPT-5.6 in Word, Excel, PowerPoint, Chat and Cowork · Claude Sonnet 5 in PowerPoint and Cowork · Rolling out · availability varies by region and tenant*

Two brand-new frontier models arrived in Microsoft 365 Copilot this month:

- **OpenAI's GPT-5.6** *(from 9 July)* — rolling out across **Word, Excel, PowerPoint, Copilot Chat and Cowork**. OpenAI and Microsoft tuned it together for knowledge work, and it's now the **preferred model** for Copilot — so Copilot may pick it automatically where the model is available.
- **Anthropic's Claude Sonnet 5** *(from 2 July)* — a new frontier model rolling out in **Copilot Cowork and Copilot in PowerPoint**, built for **multi-step work** across documents, spreadsheets and slides.

Availability varies by region and tenant. **OpenAI-operated models are tenant-controlled**: eligible commercial tenants become enabled for all users from **24 July 2026** unless admins select **No users** under **Copilot → Settings → AI providers operating as Microsoft subprocessors**. **Claude Sonnet 5 access is also admin-managed** and varies by region. Users can choose GPT-5.6 directly where model selection is available.

{{< margin >}}Two new frontier models in one month — pick the one that fits the task.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The model doing the thinking quietly sets the ceiling on quality, and July brought two new ones at once — each suited to different work. That's the real win of model choice: two new models in one month, each strong at the multi-step jobs that used to need babysitting — so you can pick the one that fits the task.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/official-01-gpt56-banner.webp" alt="Official Microsoft screenshot: the Microsoft 365 Copilot Cowork model picker, showing GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.5 (Frontier), Claude Sonnet 5, Claude Opus 4.8 and Claude Fable 5 (Preview) as model options." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [GPT-5.6 in Microsoft 365 Copilot](https://techcommunity.microsoft.com/blog/Microsoft365CopilotBlog/available-today-openai%E2%80%99s-gpt-5-6-in-microsoft-365-copilot/4533152) · [Claude Sonnet 5 in Microsoft 365 Copilot](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/available-today-anthropic%E2%80%99s-claude-sonnet-5-in-microsoft-365-copilot/4532188)

## 2. Copilot Notebooks can now build a Word doc, Excel sheet or PowerPoint deck

*For: Copilot Notebooks · Windows, Web*

This is the one to watch. A **Copilot Notebook** gathers your notes, files and references in one place — and now it can turn that context straight into a finished, editable file:

- **A PowerPoint deck** — a structured slide deck grounded in the notebook's content, ready to refine in PowerPoint *([Roadmap 558938](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558938))*.
- **A Word document** — a drafted, structured document you open and finish in Word *([Roadmap 558934](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558934))*.
- **An Excel spreadsheet** — a structured sheet built from the notebook's content and references *([Roadmap 559480](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559480))*.

You'll find these under **Create → Quick create with Copilot** when you open the notebook in **OneNote**. In the **Microsoft 365 Copilot app**, the same notebook keeps your **chats, creations and references** together — so you can add sources and see everything Copilot has built for you.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A notebook is where the messy thinking happens — the research, the links, the half-formed notes. The gap has always been the manual slog of turning that into something you can send. Closing that gap, and keeping the source references intact, is what makes a notebook feel less like a scratchpad and more like the first draft of the actual deliverable.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-02-notebook-create-menu.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the Create menu of a Copilot Notebook opened in OneNote (notebook 'Retail store of the future'), listing 'Quick create with Copilot' options — Audio overview, Mind map, Study guide, Infographic, Boards, and (red-boxed) Spreadsheet, Document and Presentation, which are the Excel, Word and PowerPoint outputs." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-02b-notebook-creations.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the same notebook in the Microsoft 365 Copilot app on the red-boxed 'Creations' tab, showing the files it has generated — a 'Retail Reboot' document created minutes ago and a 'Study Guide: Summary' — next to the Chats and References tabs." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Roadmap 558938](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558938) · [558934](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558934) · [559480](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559480)

## 3. Copilot Chat in Outlook now reads your whole inbox, not just one thread

*For: Copilot Chat in Outlook (no Copilot licence needed) · Rolling out · Android, Windows, iOS, Mac, Web*

Until now, Copilot Chat in **Outlook** could only reason over the **email thread in front of you**. This month it expands to reason over your **whole inbox, your calendar, your meetings and the other Microsoft 365 data you already have access to** — and it does this **without a Microsoft 365 Copilot licence**.

That means you can ask things like:

- *"What are the latest updates from my manager about Project X?"* — and it looks across your mailbox, not just the open message.
- *"What have I said I'd do this week?"* — pulling action items and follow-ups from across email and meetings.
- *"Where are the gaps in my calendar on Thursday?"* — helping you manage your time, and take action right there in Outlook.

{{< margin >}}This is Copilot Chat without the paid add-on — reasoning across your inbox and calendar, not one thread.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> This is the single biggest quality-of-life jump in July, and it lands in the <em>free</em> Copilot Chat. Most of what you need Copilot to reason over doesn't live in the message you happen to have open — it's scattered across last week's threads and your calendar. Letting it see your whole inbox is the difference between "summarise this email" and "catch me up on this project."</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-03-outlook-inbox.webp" alt="Screenshot of Copilot Chat in Outlook for a user without a Microsoft 365 Copilot licence: asked to 'summarise the latest update about the office move across my whole inbox and list any action items', Copilot replies that it 'found references to several emails related to an office move in your mailbox search results' (red-boxed), cites several mail threads, and returns a structured update plus an Action Items table." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 531910](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=531910) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 4. PowerPoint Agent Mode builds your deck from your own work (Work IQ)

*For: Copilot in PowerPoint (Agent Mode) · Windows*

With **Agent Mode** in Copilot in PowerPoint, you can now build a presentation based on your **Work IQ** — so instead of you hunting down the right files, meetings and emails, Copilot goes and gathers the relevant material and composes the slides. It only touches content you're already allowed to see. Open PowerPoint, choose **Edit with Copilot**, and create a presentation based on your Work IQ.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The hardest part of a deck usually isn't the slides — it's assembling everything the slides are supposed to be about. Letting Copilot pull from your files, meetings and emails through Work IQ means the first draft already reflects your actual work, not a blank template. That's the difference between "help me format this" and "help me start."</p>
</blockquote>

<!-- 📸 SCREENSHOT: 06-ppt-agent-mode-workiq.webp — PowerPoint Agent Mode creating a deck grounded in Work IQ -->

<p><img src="/images/blog/copilot-july-2026/lab-06-ppt-agentmode.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the 'Edit with Copilot' pane in PowerPoint with the prompt 'Create a presentation about our office move plan using my recent files, meetings and emails' — building a deck grounded in the user's own work through Work IQ." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-06b-ppt-result.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the finished result — Copilot in PowerPoint has built a 7-slide 'Communication & Action Plan' office-relocation deck, noting it was 'built from your Office Move Plan file and the intern action-plan email' after reasoning in 13 steps." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 555874](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555874)

## 5. Microsoft Scout grows up with model choice and approval-first controls

*For: Microsoft Scout (Frontier preview) · Windows, Mac*

June introduced **[Microsoft Scout](/blog/microsoft-scout-complete-guide/)** — Microsoft's first always-on personal agent. In the Frontier build I tested in July (**v0.23.331**), I saw its first substantial upgrade:

- **Live model switching** — change the model **per message**, so you trade speed for depth without restarting. You can also set the **context-window size** (up to *Max*) and a default **reasoning effort**.
- **Deeper Microsoft 365 reach** — new built-in tools for **Microsoft To Do** (tasks, lists, subtasks), **presence**, and **Teams channels**.
- **Co-Create, expanded** — the editor now handles **CSV, TSV, Mermaid diagrams and Excalidraw sketches** as well as prose, with inline Markdown comments — so Scout can build a flowchart or a structured dataset, not only a document.
- **Better MCP handling** — when a **Model Context Protocol** tool runs, Scout now shows the full command and its arguments, and asks you clearly when it needs your input.
- **Approval-first safety** — by default, Scout **asks you first** before anything sensitive (**sending an email, posting to Teams, changing your calendar, or a privileged action**).
- **Tidier day-to-day** — filter chats by type, pin and reorder them, mark as unread, one searchable **Settings** modal, and a **reset-to-defaults** for permissions.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> June was Scout's "hello". July is where it becomes something you'd actually leave running — you choose the brain per task, it reaches more of your real work, and it can't do anything risky without a nod from you. That last part is the line between a helpful demo and an agent you trust.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-05-scout-model-picker.webp" alt="Screenshot of Microsoft Scout (Frontier): the model picker open on the home screen, letting you switch model per message — Claude Sonnet 5, Claude Opus 4.8 and 4.7, GPT-5.5 and GPT-5.4 (red-boxed), each with its own reasoning-effort setting (Low to Max) — plus a context-window size of up to Max (936K)." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-05b-scout-approval.webp" alt="Screenshot of Microsoft Scout (Frontier): asked to add a calendar block, Scout pauses before acting and shows a 'Create Meeting' approval card for a 'Copilot approval demo' event with Allow, Allow for session, Allow everywhere and Deny buttons (red-boxed) — its approval-first safety in action." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:calc(-1 * var(--space-2)) 0 var(--space-4);"><em>The build number and detailed changes above are from my hands-on Frontier build. Microsoft's public Learn page covers Scout more broadly rather than publishing a build-by-build changelog.</em></p>

📖 [Microsoft Scout (Frontier) overview](https://learn.microsoft.com/en-us/microsoft-scout/overview) · [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/)

## 6. Copilot in SharePoint builds the report, not just finds it

*For: Copilot in SharePoint · Web · Rolling out*

SharePoint's Copilot got a big July update that turns your **sites, libraries and lists** into finished work, not just search results:

- **Create Word, Excel and PowerPoint files** straight from SharePoint content — "make a status report from this folder" and Copilot drafts the file.
- **Build an interactive HTML report** — a browser dashboard with charts, filters and KPIs, generated from your SharePoint data for a quick leadership read-out.
- **`/Skills`** — type `/Skills` to surface the reusable **skills** available on a site, with built-in skills to help you create your own.
- **Manage files by chatting** — reorganise folders, move files, and set up sharing or approvals in plain language.
- **Trust built in** — compact **citations**, visible **sensitivity labels** in chat, model information, and a **per-site control to show or hide the Copilot button** on a site.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> SharePoint is where the content already lives. July is where Copilot starts turning that content into the deliverable — a report, a dashboard, a tidier library — from the same chat pane, with the citations and labels to keep it trustworthy.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-sharepoint-report.webp" alt="Screenshot of Copilot in SharePoint: from the prompt 'Build an interactive report from this library' (red-boxed), Copilot generated a 'Documents Library Interactive Report' — an interactive HTML dashboard with filters (type, folder, sensitivity, retention), KPI cards (9 files, 4 file types) and bar charts of files by type and folder — while the Copilot pane confirms it 'Created and opened the report'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-sharepoint-skills.webp" alt="Screenshot of Copilot in SharePoint: typing '/Skills' in the chat box surfaces a 'See all skills available' option alongside recent files, letting you discover the reusable skills on a site." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [What's new in Copilot in SharePoint (July 2026)](https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-july-2026/4535420)

## 7. A new Microsoft image model in PowerPoint

*For: Copilot in PowerPoint · Windows, Mac, Web*

Copilot in **PowerPoint** picked up a new **Microsoft image model** in July for generating visuals right on your slide. Microsoft's release notes name it **MAI-Image-2-Efficient**, optimized for speed and efficiency. In my tenant, the picker currently labels Microsoft's option **MAI Image 2.5 Flash**, alongside **Flux.2 Flex** and **GPT-Image**. Microsoft hasn't publicly mapped those two MAI names, so I'm treating **MAI Image 2.5 Flash** as the current UI label rather than claiming the names are identical. The useful part is the picker itself: choose the model before you generate, replace or iterate on a visual without leaving PowerPoint.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Early in a deck you're not looking for the perfect image — you're looking for a fast one, so you can keep moving. A model built for quick iteration fits how slides actually get made: rough it in, see it on the slide, refine later.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-12-ppt-image-model.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the PowerPoint model picker cropped to its Image generation section, with a red box around the current Microsoft UI label 'MAI Image 2.5 Flash'." loading="lazy" style="width:520px;max-width:100%;height:auto;box-sizing:border-box;display:block;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) auto;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-12b-ppt-image-result.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: Copilot in PowerPoint has generated a modern open-plan office photo and placed it on the 'Our objectives' slide — restacking the three commitment cards down the left into a full-height photo panel — after reasoning in 22 steps." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 8. Turn a Teams meeting or chat into a PowerPoint deck

*For: Copilot in PowerPoint (Agent Mode) · Windows, Web, Mac*

Building on Agent Mode, you can now **reference a Teams meeting or chat** when you create a presentation. Enter a prompt that mentions the relevant meeting or chat, and Copilot generates a deck from that content — no manual summarising or copying notes across.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> So many decisions and details live in a meeting recap or a chat thread and then never make it into the deck that's supposed to capture them. Pointing PowerPoint straight at a Teams conversation closes that loop, and it's a genuinely faster way to turn "what we agreed" into "here's the slides."</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-07b-ppt-prompt.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the Copilot in PowerPoint prompt box with the request 'create a deck from my Teams meeting about the office move using the style of this presentation', where the Teams meeting reference is highlighted with a red box to show how you point PowerPoint at a Teams conversation." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-07-ppt-teams.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: Copilot in PowerPoint reasoning through a request — 'Gathering content: I'm pulling meeting details about the office move and matching the new slides to the existing presentation's style' — as it builds a deck from a Teams meeting." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Roadmap 555883](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555883) · [555884](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555884) · [555885](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555885)

## 9. Reuse the content and style of an existing deck

*For: Copilot in PowerPoint · Windows, Web, Mac*

Copilot in PowerPoint can now **reference an existing presentation** when you're creating or editing one. You can **reuse the text and content** from an old deck to build a new one, or **apply the look, theme and formatting** of one presentation to another — all while respecting the original file's permissions. Choose **Reference file** in Copilot and pick the deck you want to draw from.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Almost nobody starts a deck from nothing — they start from last quarter's version, or the team's "good" template. Letting Copilot reuse the content and style of a deck you already trust means less copy-paste, more consistency, and a much shorter path from "adapt this for a new audience" to done.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-08-ppt-reuse.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the Edit with Copilot pane in PowerPoint with an existing deck (Presentation 30.pptx) referenced, and the prompt 'create a deck from my Teams meeting about the office move using the style of this presentation' — reusing an existing deck's style." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Roadmap 555887](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555887) · [555889](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555889) · [555892](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555892)

## 10. Apply your brand kit and style to visuals in Copilot Chat

*For: Copilot Chat (with a Microsoft 365 Copilot licence) · Windows, Mac, Web*

When you generate a visual in **Copilot Chat** — a poster, an infographic, an image — you can now pick the **style and format** and apply your **organisation's brand kit** in a click, instead of uploading assets or describing the look by hand. Add the image capability from the **+** menu, choose a style, then apply your brand kit before you generate.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> On-brand visuals usually mean a round-trip to a designer or a folder of logo files. Building the brand kit into the moment you generate the image means people produce on-brand work because it's the easy path — not because someone checked it afterwards.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-brandkit-picker-chat.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: generating an image in Copilot Chat with the 'Use a brand kit' picker open (red-boxed), letting you apply your organisation's brand kit — Microsoft, Adventure Works Cycle, Xbox, Zava and more — to the visual in one click before you generate." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-13-chat-image.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: Copilot Chat generating a professional, on-brand infographic titled 'Office Move Plan' from a text prompt, complete with a move timeline, benefits and next steps." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 11. Build a brand kit from your brand guidelines

*For: Microsoft 365 Copilot app · Web*

Setting up a **brand kit** used to be a manual job. Now you can **upload your brand guidelines document** and Copilot generates the brand kit for you — colours, styles and all — which you can then review and tweak.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Most teams already have a brand guidelines PDF sitting somewhere. Turning that straight into a working brand kit removes the fiddly setup step that stops people bothering — which is exactly why on-brand output gets easier everywhere Copilot uses the kit (see the visual styling above).</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-brandkit-from-guidelines.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the Manage Brand Kits experience for a new brand kit, with a banner headed 'Your brand guidelines become AI Magic' and the steps (red-boxed) 'Upload PDFs of your brand guidelines', 'AI auto-extracts fonts, colors, logos, and tone — ready to use in seconds' and 'Preview your brand in slides, banners and docs', plus an 'Upload brand guidelines' button and sections for Logos, Templates, Fonts, Colours and Images." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 12. Mind maps in Copilot Notebooks

*For: Copilot Notebooks (OneNote and the Copilot app) · Windows, Web*

Alongside the create options, a notebook can now draw an **interactive mind map** of what's inside it — a visual map of the key topics, themes and how they connect. You can **click a node** for a short summary, or ask about it in **Notebook chat** to go deeper. It's available across **OneNote** and the **Microsoft 365 Copilot app**.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Linear notes hide the shape of a topic. A mind map shows you the connections at a glance, which is exactly what you want when you're trying to understand a body of research rather than read it line by line — and being able to click a node and ask "tell me more" turns a static diagram into a way to explore.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-notebook-mindmap.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: an interactive mind map titled 'Retail Reboot' drawn from a Copilot Notebook in OneNote, branching from a central node into topics like Customer Experience, Customer segments (Generation Z, Millennials, Families, Professionals), Store optimization (inventory visibility, workflow efficiency, navigation systems) and Operations & Rollout with an implementation roadmap." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 559029](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559029)

## 13. Capture conversations on your phone — audio, photos and notes in one go

*For: Copilot Notebooks in OneNote on iPhone · Microsoft 365 Copilot licence + commercial work/school account · More endpoints coming*

**Multimodal Capture** in Copilot Notebooks lets you **transcribe audio, take photos and type notes in a single session** on your iPhone — and Copilot turns all of it into a **structured Copilot Page** saved to the notebook you choose. It's built for in-person moments: a hallway conversation, a whiteboard session, your own scribbled notes. Open **OneNote › Copilot Notebooks**, then tap **Capture**.

Capture requires a **Microsoft 365 Copilot licence**, a **commercial work or school account**, and an active **SharePoint or OneDrive licence** for Copilot Notebooks. It's rolling out in phases, starting in **OneNote on iPhone**, so you may not see it yet. Capture on Windows for offline or third-party meetings is currently limited to **Office Insiders Beta**.

And more broadly, Copilot Notebooks landed in more places this month: **OneNote on the web** *([Roadmap 511797](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=511797))* and **OneNote on iPhone and iPad** *([Roadmap 511794](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=511794))*.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The richest context often happens away from the keyboard — a hallway chat, a whiteboard, a workshop. Being able to capture the audio, the photos and your notes together, and have Copilot stitch them into one structured page, means that context actually makes it back into your work instead of being lost to a blurry photo you never look at again.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/official-13-notebook-capture.webp" alt="Official Microsoft image showing Copilot Notebooks Capture on iPhone: the Capture entry point, a live session combining typed notes, audio and a camera button, and a generated speaker-separated transcript." loading="lazy" style="width:900px;max-width:100%;height:auto;box-sizing:border-box;display:block;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) auto;" /></p>

<p style="text-align:center;font-size:0.85rem;opacity:0.7;margin:calc(-1 * var(--space-2)) 0 var(--space-4);"><em>Full disclosure: Capture hadn't rolled out to my demo tenant yet, so this is Microsoft's own image — not one of mine.</em></p>

📖 [M365 Roadmap 559095](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559095) · [Capture conversations and ideas on the go](https://support.microsoft.com/Microsoft-365-Copilot/capture-conversations-copilot-notebooks)

## 14. Open Word, Excel, PowerPoint and PDF files right inside Copilot Chat

*For: Copilot Chat · Windows, Mac, Web*

When Copilot cites a document, clicking it used to bounce you out to a new tab. Now **Word, Excel, PowerPoint and PDF files open directly inside Copilot Chat**, so you can read the source alongside the conversation. (This one's for the web and desktop Chat — not the mobile app, and not Copilot in Edge, Word, Excel or PowerPoint.)

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Every jump out to a new tab is a small break in concentration, and they add up. Keeping the cited document and the chat side by side means you can check the source and keep working without losing your place — a quiet win if you live in Copilot.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-14-open-file-in-chat.webp" alt="Screenshot of Copilot Chat: after asking 'Summarise the Office Move Plan and list the key dates', the cited Office_Move_Plan PDF opens in a read-only reading pane directly inside Chat (red-boxed) — the answer on the left, the source document on the right — instead of bouncing out to a new browser tab." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 548641](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=548641)

## 15. Copilot Search now finds people by department

*For: Copilot Search · Web*

**Copilot Search** can now match on a person's **department** — so you can look up **everyone in a given department**, or find the right person by where they sit in the org, when you search the people source directly.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> "Who's on the security team?" is a question you ask constantly and answer slowly. Letting search match on department turns a bit of org-chart archaeology into one query — handy any time you need to find the right group rather than a name you already know.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-15-search-people-dept.webp" alt="Screenshot of Copilot Search: the query 'people in HR department' (red-boxed) returns a Copilot answer that identifies the person in that department — 'Emily Davis — HR Manager (previously Talent Acquisition Specialist)' (red-boxed) — with citations to the Contoso Restructure plan and the HR Team, and a Sources panel spanning All Results, M365 Copilot, Other Sites, Outlook Mail and SharePoint." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 508527](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=508527)

## 16. Word Audio Overview: ask questions out loud while you listen

*For: Copilot in Word · Web*

Word's **Audio Overview** lets you listen to a document like a podcast — but until now it was one-way. With **real-time voice interactions**, you can **ask a question out loud while it's playing** and get an answer instantly, without stopping the audio or switching apps.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Listening is great for absorbing a document on the move, right up until you have a question and have to stop, go find the answer, and lose your flow. Being able to just ask, mid-listen, turns passive playback into something closer to a conversation with the document.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/official-16-word-audio-overview.webp" alt="Official Microsoft image: Copilot in Word has created an Audio Overview — 'I've created an audio overview based on the main themes in this document. Click below to listen and feel free to ask me any questions you may have' — with an audio player (The Evolution of Zava's SmartSneaker, 00:05 / 05:30, playback controls) and a 'Chat with Copilot' box with a microphone for asking questions out loud while it plays." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="text-align:center;font-size:0.85rem;opacity:0.7;margin:calc(-1 * var(--space-2)) 0 var(--space-4);"><em>Full disclosure: this Audio Overview voice feature hadn't rolled out to my demo tenant yet, so the screenshot above is Microsoft's own — not one of mine.</em></p>

📖 [M365 Roadmap 523206](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=523206)

## 17. Scheduled prompts for agents

*For: Copilot app · Windows, Mac, Web*

You can now set a **recurring prompt** to declarative agents like **Analyst** or **Idea Coach** — "every Monday, summarise my week" — so routine check-ins run **on a schedule** instead of you kicking them off by hand.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The best assistant is the one you don't have to remember to ask. Scheduling turns a useful agent into a habit that runs itself.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-17-scheduled-prompt-dialog.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the 'Create a schedule' dialog for a recurring agent prompt — the prompt 'Run the daily morning briefing' tied to the 'Sush's Daily Email Digest' agent, set to repeat every day at 2:00 PM until 3 June 2026, with a day-of-week picker and a 'Receive an email when responses are ready' option." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 531759](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=531759)

## 18. Submit your own agents to the Agent Store

*For: Agent Builder + Microsoft 365 admin centre · Windows, Web*

Agents built in **[Agent Builder](/blog/m365-agent-builder-explained/)** can now be **submitted for admin review and approval**, then published under **"Built by your org"** in the **Agent Store** for everyone to find — a governed way to share the good ones across the whole organisation.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Every org ends up with a few genuinely useful home-made agents. A review-and-publish flow turns those one-offs into something the whole company can find and trust.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-18-submit-to-org.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: in Agent Builder, the '…' menu for the 'Sush's Daily Email Digest' agent is open with the 'Submit to your org catalog' option highlighted (red-boxed) — the way you submit a home-made agent for admin review." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-18b-built-by-your-org.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the 'Submit your agent to your org catalog' dialog, explaining that admins can add your agent to the Agent Store in the 'Built by your org' section, choose who can install it, and that this is separate from sharing a direct link — with a note to make sure the agent complies with company standards before submitting." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 557173](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557173)

## 19. Share an agent straight to a Teams team

*For: Copilot Studio · Web*

From **Copilot Studio**, you can now **share an agent directly to a Teams team** — with a notification to the team's main channel and an **easy install link** — instead of chasing people over email to try it.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Adoption dies in the gap between "an agent exists" and "my team knows about it." Sharing into Teams with an install link closes that gap.</p>
</blockquote>

<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:calc(-1 * var(--space-2)) 0 var(--space-4);"><em>Heads up: sharing an agent <strong>directly to a Teams team</strong> — searching for the team and posting an install link to its main channel — is generally available on Microsoft's roadmap (557947, March 2026), but it was still rolling out to my tenant when I captured this. Right now my Share dialog only shares to people and groups (with a copy-link); when the update lands, this same dialog will let you pick a Teams team and notify its channel.</em></p>

<p><img src="/images/blog/copilot-july-2026/lab-19-channels-teams.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the Copilot Studio publish/channels dialog for a 'test' agent, with 'Teams + Microsoft 365' selected so the agent is available in Copilot and Teams chats — including a preview with 'See agent in Microsoft 365' and 'See agent in Teams'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-19-share-dialog.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the current Copilot Studio sharing dialog in this tenant, which still offers people, groups, organisation access and a copy-link rather than the Teams-team picker described above." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 557947](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557947)

## 20. MCP agents now work inside Office apps and Catalyst

*For: Copilot extensibility · Word, Excel, PowerPoint, Outlook, Catalyst · Web*

{{< margin >}}Editor’s pick · Agents{{< /margin >}}

Agents built with the **Model Context Protocol (MCP)** are now available **directly inside Word, Excel, PowerPoint, Outlook and Catalyst** on the web — so you can call on a custom or partner agent right where you're working, without switching to a separate chat window.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> An agent is only useful where the work happens. Putting MCP agents inside the apps you're already in means less tab-hopping — you ask the agent in the document, not somewhere else.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-20-word-at-agents.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: typing '@' in the Copilot box inside Word (red-boxed) brings up an in-app agent picker (red-boxed) listing agents you can call without leaving the document — Analyst, Prompt Coach, a Daily Email Digest agent, Planner Agent and a SharePoint list agent." loading="lazy" style="width:400px;max-width:100%;height:auto;box-sizing:border-box;display:block;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) auto;" /></p>

<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:calc(-1 * var(--space-2)) 0 var(--space-4);"><em>This is the in-app <code>@</code>-agent picker inside Word — the same surface MCP agents use. The agents shown here are declarative agents; an MCP-built agent appears in this same list, callable right inside the document without opening a separate chat.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 21. Long-running agent tasks show progress in the Windows taskbar

*For: Copilot app · Windows*

When an agent is doing **long-running, autonomous work**, you can now see its **status and progress right in the Windows taskbar** — no need to open the Copilot app to check. Click through when you want the detail.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Long-running agent work takes time. A glanceable status in the taskbar means you can set it going and get on with something else, instead of babysitting a window.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-21-taskbar-states.webp" alt="Illustration from a Microsoft 365 Copilot tenant: the Copilot agent's icon in the Windows taskbar in two states side by side — 'Running' with a live cyan gradient underline, and 'Complete' with a green checkmark badge." loading="lazy" style="width:480px;max-width:100%;height:auto;box-sizing:border-box;display:block;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) auto;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-21-toast.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: a Windows notification from Microsoft 365 Copilot reading 'Researcher is complete — Your task is complete: Daily Briefing Preparation Guide' with a Review button." loading="lazy" style="width:440px;max-width:100%;height:auto;box-sizing:border-box;display:block;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) auto;" /></p>

<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:calc(-1 * var(--space-2)) 0 var(--space-4);"><em>The whole point: set the agent going, get on with your work, and glance at the taskbar — a live gradient while it runs, a green tick when it's done, and a notification to review the result.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 22. Sales Agent reached general availability

*For: Sales teams · Dynamics 365 Sales or Salesforce CRM · Generally available*

The **Sales Agent** brings **customer and deal intelligence into the flow of work**, connected to **Dynamics 365 Sales or Salesforce CRM**, with more enhancements already in development — richer meeting prep, auto-linking meetings to CRM records, and multi-channel outreach.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Sellers live in email, Teams and their CRM. An agent that pulls deal context into where they already work saves the constant tab-switching that eats into selling time.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-22-sales-card.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the Sales agent's card in the Agent Store — 'Sales, by Microsoft Corporation', with an Add button and a 'What you can do with Sales' list including (red-boxed) 'Get customer and deal info from Dynamics 365 or Salesforce CRM using natural language', preparing for meetings, drafting sales emails, and AI-generated insights." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-22-sales-ui.webp" alt="Screenshot from a Microsoft 365 Copilot tenant: the Sales agent interface — an 'Ask Sales' box with a Sources option, an Upcoming / Past meetings toggle, and a 'Connect to your CRM to get sales insights' prompt with a 'Select sources' button." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Sales Agent GA announcement](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/sales-agent-is-now-generally-available-bringing-customer-and-deal-intelligence-i/4532629)

---

## Agents & Copilot Studio — July at a glance

The big agent stories now have their own sections above. A couple of smaller items to round things out — and if you're weighing your options, our **[Copilot vs Agents vs Copilot Studio](/blog/copilot-vs-agents-vs-copilot-studio/)** guide breaks down what to use when:

- **Event-driven tasks in Copilot Cowork** — beyond scheduled prompts, **Cowork** can now start a task **when something happens** — a matching email arrives, or you're **@mentioned** in Teams. You describe what to watch for, Cowork proposes the automation, and you confirm. It sits next to scheduled prompts on the **Scheduled** page. *([What's new in Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new))*
- **Customise the Employee Self-Service agent landing page** — admins can brand the ESS agent's landing page with accent colours, categorised prompts and quick links to HR and IT resources.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why this matters:</strong> The pattern this month is governance and reach. Agents you can review, approve, publish, schedule and share — inside the apps people already use — is what turns a clever one-off into something an organisation can actually run and trust.</p>
</blockquote>

---

## 23. Publish company-wide prompts in the Copilot Prompt Gallery

*For: Admins · Windows, Web*

{{< margin >}}Editor’s pick · Admin{{< /margin >}}

Admins can now build **collections of prompts** tailored to how their organisation actually works and **publish them tenant-wide** through the **Copilot Prompt Gallery** — so everyone gets prompts that match their real tasks and terminology, not just the defaults.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The number one thing that helps people get value from Copilot is a good prompt to start from. Curating prompts that fit your organisation and pushing them to everyone is one of the most useful adoption moves an admin can make — it lowers the "what do I even type?" barrier for the whole tenant.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-23-published-prompts.webp" alt="Screenshot from the Microsoft 365 admin centre: the Copilot 'Prompts for Contoso' page with a published company-wide prompt — 'Email Actions' — shown in a table with its Description, Department (All Employees), Display prompt (Weekly email actions), Apps (Copilot web, Copilot work), Submitted by (MOD Administrator), Source (Tenant) and Date, plus Create prompt, Export and Import actions." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-july-2026/lab-23-create-prompt.webp" alt="Screenshot from the Microsoft 365 admin centre: the 'Create prompt' page, with a live preview of the prompt card and the form filled in — Title 'Email Actions', a Description, a Display Prompt 'Weekly email actions', and the full prompt text asking Copilot to build a weekly table of email action items." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 486695](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=486695)

## 24. Agent security moves under Microsoft Agent 365

*For: Copilot Studio + Foundry agents · Microsoft Defender · Effective 1 July 2026*

From **1 July**, the security for **Copilot Studio** and **Microsoft Foundry** agents — discovery, posture, threat detection and real-time protection — requires a **[Microsoft Agent 365](/blog/agent-365-security-governance-complete-guide/)**-eligible licence. Tenants without one **lose** those capabilities in **Microsoft Defender**. Update hunting queries as the AI-agent inventory moves from `AIAgentsInfo` to `AgentsInfo`; if you already use Agent 365 real-time protection rules in **Block** mode, redefine them under the new policy experience because block enforcement stops at cutover.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> As agents multiply, so does the attack surface. Bringing agent security under Agent 365 gives one place to see and protect your Copilot Studio and Foundry agents — but it's now a licensing dependency, so if you haven't sorted your licensing yet, it's the first thing to check.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-25-defender-agents.webp" alt="Screenshot from Microsoft Defender: the 'AI Agents (preview)' page under Assets, with a banner (red-boxed) reading 'You're getting deeper visibility and a more secure agent ecosystem with Microsoft Agent 365 in Defender', an Agents insights summary (324 total monitored agents, 0 at high risk, 0 critical), and an inventory table of agents — Wokelo, Syrto, Gerald, Garden, Tavily, Career Coach — with Platform, Publish status, Risk level, Risk indicators and MCP servers columns." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Transition guide: agent security to Agent 365](https://learn.microsoft.com/en-us/defender-xdr/security-for-ai/transition-agent-security-to-agent-365)

## 25. Federated Copilot Connectors, now managed in the admin centre

*For: Microsoft 365 admin centre · Web · Generally available*

Deploy and manage **MCP-based Federated Connectors** directly from **Microsoft 365 admin centre → Copilot → Connectors**. These reach **external data sources at runtime** using **user-level authentication** — so there's **no indexing**, and existing source permissions are preserved. Microsoft currently lists support in **Microsoft 365 Copilot Chat, Copilot in Excel and Researcher**.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Federated connectors let Copilot answer from systems you never ingested — and doing it with user-level auth means people only ever see what they already had permission to see.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-26-connectors.webp" alt="Screenshot from the Microsoft 365 admin centre: the Copilot Connectors page (Your Connections), with the Type filter open on 'MCP' (red-boxed) — showing MCP-based Federated Connectors such as DrugData, FdaSafety, RxNorm, MedlinePlus, Pulse by PassBy, Fitch Solutions and PubMed, each with a connection state of Admin Preview or Ready." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [Federated connectors overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/federated-connectors-overview)

## 26. Watermarks for AI-generated video and audio

*For: Admin-controlled (Cloud Policy) · Android, Windows, iOS, Mac, Web*

To make it clearer what's been made or changed by AI, Microsoft 365 can now add a **visual or audio watermark** to **video and audio** that people generate or alter with AI. It's governed by a **Cloud Policy** setting — *"Include a watermark when content from Microsoft 365 is generated or altered by AI"* — and it's **off unless an admin turns it on**. Images are separate: individual users can enable image watermarks under **Settings & Privacy › Privacy › Data options** in their Microsoft account.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> As AI-generated media gets easier to make, being able to say clearly "this was made with AI" is becoming part of doing it responsibly. Putting the control in Cloud Policy means organisations can set the standard once, centrally — a small feature with a big role in trust and provenance.</p>
</blockquote>

<p><img src="/images/blog/copilot-july-2026/lab-27-watermark-policy.webp" alt="Screenshot from the Microsoft 365 Apps admin center: a Cloud Policy configuration in Policy Management, with the policy 'Include a watermark when content from Microsoft 365 is generated or altered by AI' (red-boxed) — covering Windows, Mac, iOS, Android and Office on the web — and its Configuration setting dropdown (red-boxed) set to Enabled, with Not configured and Disabled as the other options." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 547831](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=547831)

## 27. Copilot now comes built into new Microsoft 365 Business SKUs

*For: Small & medium business (1–300 seats) · Generally available — 1 July 2026*

A packaging change worth knowing if you buy Microsoft 365 for a smaller organisation. On **1 July**, two **"with Copilot" bundles** became generally available:

- **Microsoft 365 Business Standard with Copilot — USD $23.50/user/month**
- **Microsoft 365 Business Premium with Copilot — USD $32/user/month**

*(USD, annual subscription, annual billing.)* They sit **alongside** the existing plans — **Business Basic, Standard and Premium stay available on their own** if you'd rather add Copilot separately. The standalone **Microsoft 365 Copilot Business** add-on keeps its promotional **USD $18/user/month** (list price USD $21) through **31 December 2026**, and there's a new bundle — **Business Basic + Copilot Business at USD $21/user/month** — also running through 31 December 2026.

If you're already a customer, your current pricing holds until renewal. Microsoft says the **packaging changes** receive at least **30 days' notice in Message Center** before they reach your tenant.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Pricing is the least glamorous update and the one that lands on the invoice. For smaller organisations the takeaway is simple: Copilot is now a <strong>permanent, first-class way to buy Microsoft 365</strong>, not a promo — with the plain plans still there if you'd rather buy Copilot à la carte.</p>
</blockquote>

📎 We go deeper on the numbers in our **[Copilot cost management guide →](/blog/microsoft-365-copilot-cost-management/)** and **[Copilot credits explained →](/blog/copilot-credits-explained/)**.

📖 [Microsoft 365 Business plans and pricing](https://www.microsoft.com/en-us/microsoft-365/business/microsoft-365-plans-and-pricing) · [July 2026 Partner Center promo terms](https://learn.microsoft.com/en-us/partner-center/announcements/2026-july#fy27-promotions-for-microsoft-365-and-copilot) · [Introducing Microsoft 365 Business with Copilot (Microsoft 365 blog)](https://www.microsoft.com/en-us/microsoft-365/blog/2026/05/28/introducing-microsoft-365-business-with-copilot-the-new-standard-for-small-business/) · [2026 Microsoft 365 packaging & pricing updates (Microsoft Licensing)](https://www.microsoft.com/en-us/licensing/news/2026-M365-Packaging-Pricing-Updates)

## 28. Copilot-generated files inherit sensitivity labels

*For: All Microsoft 365 Copilot users · Android, Windows, iOS, Mac, Web*

When Copilot **generates a file**, it now looks at the content it drew from and applies the **highest sensitivity label** it found in that source data — automatically. If Copilot can't apply a label, it tells you clearly so you can add the right one before you share or store the file.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A generated document is only as safe as its label, and "I'll label it later" is how sensitive data leaks. Carrying the source's protection into anything Copilot creates means the guardrail is on by default — you don't have to remember, and you can't accidentally ship an unlabelled file built from labelled data.</p>
</blockquote>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 29. The Copilot dashboard now counts everyone, licensed or not

*For: Viva Insights / Copilot Dashboard · Web*

The **Copilot Dashboard** adoption page now shows a **unified view of all Copilot usage** — not just Microsoft 365 Copilot (licensed) users. A new **License filter** lets you switch between **All**, **M365 Copilot (licensed)** and **Copilot Chat (unlicensed)** so you can see the full picture of who's using Copilot across the org.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A lot of real Copilot usage happens in Copilot Chat without the paid add-on, and if your dashboard only counted licensed seats you were missing it. Seeing licensed and unlicensed adoption in one place gives admins an honest read on where Copilot is actually landing — and where a licence might be worth it.</p>
</blockquote>

📖 [M365 Roadmap 559475](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559475)

## 30. Viva Glint: plain-English survey insights with Copilot Highlights

*For: Copilot in Viva Glint · Web · Generally available*

Copilot in **Viva Glint** now writes **AI summaries of employee survey results** straight into Team Summary and Executive Summary reports — surfacing the notable score changes, benchmark comparisons and response-rate confidence so leaders can move from data to action faster. With general availability, **Copilot Highlights** also went **multilingual**, so global teams get the summary in their preferred language.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Survey results are only useful if someone actually reads and acts on them, and a wall of scores rarely gets that far. A plain-English summary of what changed and what stands out — in the reader's own language — is what turns a survey from a report into a decision.</p>
</blockquote>

📖 [M365 Roadmap 558111](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558111)

## 31. Launch Copilot on your iPhone with the Action button or Siri

*For: Microsoft 365 Copilot app · iOS*

Small but handy: you can now open the **Microsoft 365 Copilot app** on iOS by **long-pressing the Action button** or asking **Siri** — instead of hunting for the icon on your home screen. (Set it up once under **Settings › Action Button › Shortcut › Talk to M365 Copilot**.)

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The faster it is to start, the more likely you are to actually use it in the moment you need it. A physical button or a "Hey Siri" is about as low-friction as access gets — especially when your hands are full.</p>
</blockquote>

📖 [M365 Roadmap 485724](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=485724) · [Use Siri with the Microsoft 365 Copilot app](https://support.microsoft.com/Microsoft-365-Copilot/use-siri-with-the-microsoft-365-copilot-mobile-app)

---

## Admin, governance & security — July at a glance

A steady month for the connector and governance side (the bigger items — **Federated Connectors** and the **Agent 365 security move** — now have their own sections above):

- **Copilot Cowork is consumption-billed.** Tenants with at least one user in Frontier from **30 March–16 June** who used Cowork during that period had a grace period; for those tenants, billing began on **1 July** — a good moment to confirm your **spending limits** at the tenant, group and user level, and to brush up on [Copilot Credits](/blog/copilot-credits-explained/). *([Cowork GA announcement](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/16/copilot-cowork-is-now-generally-available/))*
- **Nested permissions for Confluence & ServiceNow** *([Roadmap 503587](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=503587))* — these connectors now evaluate **parent-level permissions** when deciding access to child items, so Copilot results respect your real permission hierarchy.
- **Edit ServiceNow connection permissions without recreating them** *([Roadmap 505438](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=505438))* — switch an existing ServiceNow Knowledge or Catalog connection between **Simple** and **Advanced** permission handling in place, instead of building a new connection.
- **SharePoint metadata makes queries sharper** *([Roadmap 516044](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=516044))* — when you scope a query to a SharePoint **library or folder** (by attaching it or pasting its URL), Copilot now uses the library's **column metadata** for more accurate, relevant results.
- **Sensitivity labels carry into generated files** — worth repeating from above (see [#28](#28-copilot-generated-files-inherit-sensitivity-labels)): anything Copilot generates inherits the **highest label** from its source data.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why this matters:</strong> As Copilot reaches more of your data — and more external systems — the controls have to keep pace. July's theme for IT is precision: connectors that respect the real permission tree, external data reached without indexing it, and labels that follow the content wherever Copilot takes it.</p>
</blockquote>

---

## On the horizon — in development for August and September 2026

A few roadmap items still in development when I checked on **23 July 2026**. They weren't all first announced in July; they're here because their current rollout dates matter now:

- **Deep citations in Copilot** — jump to the relevant part of a Word or PowerPoint source first, with meetings, web and PDF references following. **Preview August; GA September 2026.** *([Roadmap 523223](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=523223))*
- **Better search matches from scanned PDFs and text inside images** embedded in Word, Excel and PowerPoint files. **GA August 2026.** *([Roadmap 559613](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559613))*
- **Session and response sharing in Copilot** — share a full chat session or one response through a read-only link. **GA August 2026.** *([Roadmap 562353](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562353))*
- **Structured document generation with form-driven SharePoint templates** for contracts, agreements, proposals and HR documents. **GA September 2026.** *([Roadmap 545896](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=545896))*
- **Export row-level Copilot metrics from the Copilot Dashboard** for your own reporting and deeper analysis. **Preview now; GA August 2026.** *([Roadmap 500872](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=500872))*
- **Use Agent 365 agents as connected agents** in Copilot Chat, Agent Builder or Copilot Studio when they implement the Agent2Agent protocol. **GA August 2026.** *([Roadmap 567670](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567670))*
- **Planner capabilities in Copilot Cowork** — view and update plans, buckets, goals and tasks, then carry out the work across Microsoft 365 with your approval. **GA September 2026.** *([Roadmap 567315](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567315))*

---

## Official Microsoft resources

- [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) — the source for the July 1 and July 15 updates above
- [Microsoft 365 Roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap) — search any Roadmap ID cited above
- [Federated connectors overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/federated-connectors-overview)
- [Capture conversations and ideas in Copilot Notebooks](https://support.microsoft.com/Microsoft-365-Copilot/capture-conversations-copilot-notebooks)

---

## Keep reading

- 📅 **Past recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/)
- 🤖 **Go deeper:** [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/) · [Copilot Cowork complete guide](/blog/microsoft-copilot-cowork-complete-guide/) · [Work IQ API](/blog/microsoft-work-iq-api-day-1-ga/) · [Copilot vs Agents vs Copilot Studio](/blog/copilot-vs-agents-vs-copilot-studio/) · [Agent Builder explained](/blog/m365-agent-builder-explained/)
