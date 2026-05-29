---
title: "Microsoft 365 Copilot May 2026 Updates — 53 New Features"
description: "All 53 Microsoft 365 Copilot updates for May 2026 — federated connectors, GPT-5.5, Plan mode, video recap in Teams, voice chat, DLP for prompts."
date: 2026-05-29
lastmod: 2026-05-29
youtube_id: ""
card_tag: "What's New in Copilot"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-may-2026-updates.jpg"]
og_headline: "What's New in Copilot — May 2026"
og_glyph: "calendar"
tags:
  - microsoft-365
  - copilot
  - news
faq:
  - question: "What's new in Microsoft 365 Copilot in May 2026?"
    answer: "May 2026 brings 53 updates including federated Copilot connectors (with Canva, HubSpot, Linear, LSEG, Moody's and Notion via MCP), GPT-5.5 Instant in Copilot Chat, Plan mode and Python in Copilot for Excel, a wave of Copilot Notebooks updates (PowerPoint/Word/Excel generation, Mind maps, web link references), a refreshed mobile app, Teams call delegation, and consecutive interpretation in Teams Interpreter."
  - question: "What are federated Copilot connectors?"
    answer: "Federated Copilot connectors are a new class of connector built on the Model Context Protocol (MCP) that query third-party systems live at the moment of the prompt — so responses reflect the latest data instead of an indexed snapshot. The first wave includes Canva, HubSpot, Intercom, Linear, LSEG, Moody's, Notion, and Google Calendar / Contacts. Available in Copilot Chat and the Researcher agent."
  - question: "What is GPT-5.5 Instant in Microsoft 365 Copilot?"
    answer: "GPT-5.5 Instant is OpenAI's latest fast model, available in Copilot Chat under the model selector as 'GPT-5.5 Quick response' and in Copilot Studio as 'GPT-5.5 Chat'. It builds on GPT-5.3 Instant with better image analysis, better STEM reasoning, fewer follow-up questions, and less verbosity. Microsoft 365 Copilot licensed users get priority access."
  - question: "What is Plan mode in Copilot for Excel?"
    answer: "Plan mode lets Copilot outline a clear, step-by-step approach before changing a workbook. You see exactly what Copilot intends to do, what data it will use, and you can adjust the plan before edits are applied — useful for multi-step or high-impact changes."
  - question: "What's new in Copilot Notebooks in May 2026?"
    answer: "Copilot Notebooks gets a major wave: generate PowerPoint presentations, Word documents and Excel spreadsheets directly from notebook content; add external web links as references; edit Copilot Pages through chat; Mind maps for visual exploration; Teams meetings as references; and multimodal capture (audio, images, typed notes) in the OneNote mobile app on iOS."
layout: "notebook"
stamp: "monthly recap"
intro_note: "← what changed this month, in plain English"
founder_note: |
  Every month I read every Message Center post, every blog entry, every Tech Community thread, and condense it into the version I wish someone had handed me. If 40 things changed and only three matter for you, I would rather you know which three.
---

May 2026 has a lot of practical Copilot changes — **53 updates** focused around connectors, notebooks, Excel and mobile. **Federated connectors built on MCP** bring live, real-time data into Copilot from partners like Canva, HubSpot, Linear, LSEG, Moody's and Notion. **GPT-5.5 Instant** lands in Copilot Chat. **Copilot Notebooks** picks up generation for PowerPoint, Word and Excel (in Frontier preview). **Plan mode in Excel** and **Python in Copilot for Excel** finally make spreadsheet edits transparent before they apply. And the mobile app gets a chat-first redesign with liquid glass styling.

📅 **2026 monthly recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · May (you are here)

---

## If you only have 2 minutes — May's 3 picks

If 40 changes feels like too much, these are the three I'd start with:

1. **[Federated MCP Connectors](#1-federated-copilot-connectors-with-mcp)** — Microsoft's new federated connectors let Copilot query external systems (Canva, HubSpot, Linear, LSEG, Moody's, Notion) **live at prompt time**, instead of working off a pre-indexed snapshot. Most strategic change this month.
2. **[Plan Mode in Excel](#13-plan-mode-for-copilot-in-excel)** — Copilot shows you what it's about to do *before* it touches your workbook. The kind of guardrail serious analysts have wanted for a long time.
3. **[Copilot Call Delegation in Teams](#23-copilot-call-delegation-in-microsoft-teams)** — Copilot answers your incoming Teams calls, gathers context from callers, and offers to book a follow-up. One of the clearest assistant-style features this month.

---

## Admin Checklist — May 2026

Five admin checks worth doing this month, in priority order:

1. **Stage federated connectors before users discover them.** Microsoft's new MCP-based federated connectors (Canva, HubSpot, Linear, LSEG, Moody's, Notion, plus Google Calendar/Contacts) are **enabled by default** in your tenant. **Action:** Microsoft 365 admin centre → Copilot → Connectors → **Your connections** → review available connectors, then stage rollout to specific Microsoft Entra ID groups before broad availability. Use PowerShell to bulk-disable and selectively re-enable if governance requires it.

2. **Brief security on the new Edge DLP redirect.** Edge v.148 now offers a "send to M365 Copilot instead" prompt when Purview DLP blocks a sensitive query to an external AI site. **Action:** Confirm your Purview DLP policies for generative AI are tuned correctly — the redirect only works if DLP is actually catching things.

3. **Pilot Plan mode in Excel with one analyst** before broad comms. Decide whether to recommend it as the default workflow for multi-step changes. Then update your Copilot training materials.

4. **Update your AI usage policy for Call Delegation.** Decide which staff should enable Copilot to answer Teams calls on their behalf. *My governance note:* review carefully if your team handles regulated calls (legal, advisory, medical, financial) — your industry rules, not Microsoft's, should set the boundary.

5. **Sign up for Frontier if you want earliest access to the Notebooks preview.** Generation of PowerPoint, Word and Excel from notebooks, plus Mind maps and Teams meetings as references, ships first via the Frontier program. Check your roadmap and admin centre for the GA rollout timing — most items have a May GA target in the Microsoft 365 roadmap.

---

## Quick Jump

**The Big Headlines:** [Federated MCP Connectors](#1-federated-copilot-connectors-with-mcp) · [GPT-5.5 Instant](#2-gpt-55-instant-in-microsoft-365-copilot) · [Mobile App Refresh](#3-microsoft-365-copilot-mobile-app--chat-first-redesign) · [Branded Footer](#4-branded-footer-in-the-microsoft-365-copilot-app) · [Voice Chat](#41-voice-chat-in-microsoft-365-copilot)

**Copilot Notebooks & Pages Wave:** [Generate PowerPoint](#5-create-powerpoint-presentations-from-copilot-notebooks) · [Generate Word](#6-create-word-documents-from-copilot-notebooks) · [Generate Excel](#7-create-excel-spreadsheets-from-copilot-notebooks) · [Mind Maps](#8-mind-maps-in-copilot-notebooks) · [Web Links as References](#9-web-link-as-a-reference-in-copilot-notebooks) · [Edit Pages with Chat](#10-edit-copilot-pages-with-chat-in-notebooks) · [Teams Meetings as References](#11-teams-meetings-in-copilot-notebooks) · [Multimodal Capture in OneNote iOS](#12-multimodal-capture-in-copilot-notebooks-onenote-iphone) · [Copilot in Pages — Write/Code/Create](#49-copilot-in-pages--write-code-and-create)

**Excel & PowerPoint:** [Plan Mode in Excel](#13-plan-mode-for-copilot-in-excel) · [Python in Copilot Excel](#14-python-when-editing-with-copilot-in-excel) · [Image Model Choice in PowerPoint](#15-create-and-edit-images-with-the-model-of-your-choice-in-powerpoint) · [Smarter Visual Understanding](#16-copilot-chat--smarter-visual-understanding-embedded-images) · [Public Web Grounding](#17-public-website-grounding-for-copilot-in-powerpoint) · [PPT Web Home Create](#43-create-with-copilot-from-the-powerpoint-web-home) · [Executive Summary Slide](#44-executive-summary-slide-in-powerpoint)

**Word:** [Claude in Copilot for Word](#18-claude-model-for-copilot-in-word)

**Outlook:** [Draft Coaching](#19-draft-coaching-feedback-in-outlook) · [Conversational Email Drafting](#20-draft-edit-and-format-emails-conversationally) · [First Draft in Canvas](#21-first-draft-in-the-canvas-for-copilot-in-outlook) · [Account Selector in Side Pane](#22-account-selector-in-the-outlook-copilot-side-pane) · [List Email Attachments](#42-list-email-attachments-in-copilot)

**Teams & Meetings:** [Call Delegation](#23-copilot-call-delegation-in-microsoft-teams) · [Consecutive Interpretation](#24-consecutive-interpretation-in-teams-interpreter) · [Sharing Recap Access](#25-share-recap-access-in-microsoft-teams) · [Delete Meeting-Generated Content](#26-delete-meeting-generated-content-in-recap) · [Video Recap](#45-video-recap-in-teams)

**Mobile & Edge:** [Voice Notes in Mobile](#27-capture-voice-notes-in-the-microsoft-365-copilot-mobile-app) · [Edge Copilot New Tab Page](#28-microsoft-edge--copilot-new-tab-page) · [Edge DLP Redirect](#29-microsoft-edge-v148--redirect-to-m365-copilot-when-dlp-blocks-a-prompt) · [Edge Work Browsing History](#30-microsoft-edge--send-work-browsing-history-to-copilot) · [Outlook Mobile Voice Triage](#51-triage-your-inbox-by-voice-in-outlook-mobile)

**Agents:** [Submit Agents to Store via Builder](#31-submit-agents-to-agent-store-from-agent-builder) · [Agent Lifecycle Automation](#32-admin-rules-for-agent-lifecycle-automation) · [Scheduled Prompts for Agents](#33-scheduled-prompts-for-agents) · [SharePoint Agents in Teams Chat](#34-chat-one-on-one-with-sharepoint-agents-in-teams) · [Share Agents to a Teams team](#50-share-agents-to-a-microsoft-teams-team)

**OneDrive, SharePoint, Forms & Video:** [Ready-to-Use Prompts in OneDrive](#35-ready-to-use-prompts-in-onedrive-file-preview) · [AI Video Drafts with Animations](#36-ai-generated-video-drafts-with-text-animations) · [Live FAQ in SharePoint](#46-create-a-live-faq-in-sharepoint) · [Charts on SharePoint with AI](#47-create-charts-on-sharepoint-pages-with-ai) · [Surveys Agent in Forms](#48-surveys-agent-in-microsoft-forms)

**Admin, Governance & Insights:** [Power User Insights](#37-power-user-insights-in-copilot-dashboard) · [Export by Day](#38-copilot-dashboard--export-by-day) · [Prepaid Capacity Packs Only](#39-microsoft-365-admin-center--prepaid-capacity-pack-billing) · [Purview DSPM](#40-new-microsoft-purview-data-security-posture-management-experience) · [Purview DLP for Copilot prompts](#52-purview-dlp-for-m365-copilot--safeguard-prompts) · [AI Content Watermarks](#53-watermarks-for-ai-generated-content)

---

## 1. Federated Copilot Connectors (with MCP)

*For: All users (admin configures connectors) · Generally available in admin center, user experience rolling out*

This is the headline of the month. **Federated Copilot connectors** are a new class of connector built on the **Model Context Protocol (MCP)** — instead of indexing data into your tenant ahead of time, they **query the source system live, at the moment of the prompt**. *([MCP governance guide →](/blog/agent-365-security-governance-complete-guide/))* Responses reflect the latest data, every result includes a citation back to the source record, and access is securely governed via OAuth 2.0 using each user's own identity and permissions.

The first wave of out-of-the-box federated connectors built by Microsoft in partnership with leading SaaS and data providers:

| Partner | What you can ask |
|---------|------------------|
| **Canva** | "Show me 2024's top-performing holiday designs from Canva, along with the formats that delivered the highest engagement." |
| **Google (Calendar & Contacts)** | "List all my calendar events for next week, then determine which ones are overlapping." |
| **HubSpot** | "From HubSpot, show me my open deals with a value over $10K where there's no logged activity in the past 7 days." |
| **Intercom** | Surface support conversations and customer health signals. |
| **Linear** | Project tracking and issue data for engineering and product teams. |
| **LSEG (London Stock Exchange Group)** | Real-time and end-of-day pricing for equities, fixed income, FX, and commodities. |
| **Moody's** | Entity profiles, ownership structures, credit ratings, and Moody's research documents. |
| **Notion** | Query Notion pages, databases, and workspace content directly in Copilot. |

{{< margin >}}The headline change this month — Copilot can now reach beyond Microsoft 365 in real time.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The old Copilot Connectors indexed data into Microsoft Graph — useful, but always one crawl behind. Federated connectors flip the model: Copilot asks the source system at query time, so when a treasury analyst asks for today's interest rate curve, or a sales manager checks an open pipeline, the answer reflects what the source system shows right now. And because it uses OAuth with your own identity, you only see what you're already permitted to see — perfect for sensitive scenarios in finance, healthcare and legal.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/01-federated-connectors-researcher.webp" alt="Microsoft 365 Copilot Researcher agent showing a sales-pipeline analysis. The agent surfaces structured insights pulled from a federated connector — open deals, last-activity dates, and pipeline status — with inline citations back to the source CRM record." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/copilot-may-2026/01-federated-connectors-sources-picker.webp" alt="Microsoft 365 Copilot Chat composer with the Sources picker open below the prompt box. The picker lists the available federated connectors — Canva, HubSpot, Linear, LSEG, Moody's, Notion and more — each with a Connect button to authenticate using your own credentials." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **Microsoft 365 Copilot Chat**, open **Sources** below the prompt box or in chat settings, browse the available connectors, and authenticate with your own credentials. Once connected, the source appears as **Connected** and you can query it immediately. Also available from the **Sources** menu inside the **Researcher** agent.

**Admin controls:** Manage them in **Microsoft 365 admin center → Copilot → Connectors → Your connections**. Admins can enable/disable per tenant, stage rollout to specific Microsoft Entra ID groups, and use PowerShell to disable all default federated connectors and selectively re-enable them.

<p><img src="/images/blog/copilot-may-2026/01-federated-connectors-moodys-connect.webp" alt="Authentication flow for connecting Microsoft 365 Copilot to the Moody's federated connector — the user signs in with their own Moody's credentials so subsequent queries respect their existing permissions in the source system." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**You can also build your own.** Custom federated connectors for internal and line-of-business systems can be built using the same MCP standard and deployed by admins.

📖 [Official announcement — Federated Copilot connectors](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/federated-copilot-connectors---bringing-real-time-enterprise-data-within-microso/4515993)

> ⓘ **Heads-up for finance teams:** Federated connectors to **LSEG** and **Moody's in Excel** are noted as **coming soon** — today the connectors are available in Microsoft 365 Copilot Chat and the Researcher agent on web and desktop.

## 2. GPT-5.5 Instant in Microsoft 365 Copilot

*For: All Copilot Chat users · Available now (rolling out)*

OpenAI's **GPT-5.5 Instant** is now available in Microsoft 365 Copilot and Microsoft Copilot Studio. Building on GPT-5.3 Instant, it improves the quality of everyday work tasks, with better image analysis, better STEM reasoning, less verbosity, and fewer unnecessary follow-up questions. *([Model choice brief →](/blog/microsoft-365-copilot-prompting-2026-whats-new/))*

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Most Copilot use is "everyday work" — summarise this email, fix this paragraph, explain this chart. GPT-5.5 Instant is tuned exactly for that flow — fewer "did you mean…" loops, more useful answers on the first try. Microsoft 365 Copilot licensed users get priority access, while users on free Copilot Chat get standard access. The same model is available to agent makers in Copilot Studio.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/02-gpt55-model-selector.webp" alt="Microsoft 365 Copilot Chat model selector open, showing GPT-5.5 Quick response listed under GPT as the new fast-model option for everyday work tasks." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **Copilot Chat**, open the **model selector** — GPT-5.5 Instant appears as **"GPT-5.5 Quick response"** under GPT. In **Copilot Studio**, it appears as **"GPT-5.5 Chat"** in early-release-cycle environments.

📖 [Official announcement — GPT-5.5 Instant in M365 Copilot](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/available-today-gpt-5-5-instant-in-microsoft-365-copilot/4517084)

## 3. Microsoft 365 Copilot Mobile App — Chat-First Redesign

*For: All users · Rolling out in May*

The **Microsoft 365 Copilot mobile app** gets a refreshed, chat-first design with cleaner navigation, support for **text formatting in prompts**, and a new layout that makes chat responses easier to **view, copy, reopen and reference through citations**. The app picks up a **liquid glass styling** and a new visualisation for voice conversations.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Most mobile Copilot use is one-handed and quick — between meetings, in transit, at the kitchen bench. A redesign that puts chat at the centre, makes citations easier to tap, and adds a proper voice visual changes the feel from "scaled-down desktop app" to "made for thumbs". It is the version of the mobile app that finally matches how people actually use it.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/03-mobile-app-refresh.webp" alt="Microsoft 365 Copilot mobile app showing the refreshed chat-first layout — cleaner navigation, text formatting controls in the prompt composer, and the new liquid glass styling for the voice-conversation visualiser." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** Open the **Microsoft 365 Copilot** app on iOS or Android — the new design rolls out in May.

📖 [M365 Roadmap 559310](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559310)

## 4. Branded Footer in the Microsoft 365 Copilot App

*For: IT admins · Rolling out in May*

Admins can now display their **organisation-approved logo** in the Microsoft 365 Copilot Chat footer, with a fixed **"Approved by"** label. The logo is the one already set in Microsoft 365 admin centre theming.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Users have been asking "is this the official, sanctioned version of Copilot?" since rollout began — particularly in environments where multiple AI tools are floating around. A visible, admin-approved branding cue inside Copilot Chat is a small detail that reassures users they're in the right tool, without needing another email or pop-up.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/04-branded-footer-approved-by.webp" alt="Microsoft 365 Copilot Chat footer showing an organisation-approved branding cue — the admin-uploaded logo with a fixed Approved by label, helping users confirm they're inside the work-managed Copilot environment rather than a consumer or shadow AI tool." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 555852](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555852)

---

## 5. Create PowerPoint Presentations from Copilot Notebooks

*For: Frontier program preview users · Rolling out in May*

**Copilot Notebooks** can now generate **PowerPoint presentations** directly from the content and references stored in a notebook. *([Notebook generation guide →](/blog/microsoft-365-copilot-prompting-2026-whats-new/))* Choose the **primary focus, level of detail, slide deck length, and design theme** from example templates, and the PowerPoint agent produces a structured, editable deck preloaded with visuals — ready to refine in PowerPoint.

{{< margin >}}The Notebooks wave is initially rolling out via the Frontier early-access program.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The interesting part is the workflow, not the slides. You gather sources into a notebook — meeting content, SharePoint docs, web links — and then ask Copilot to turn that grounded knowledge into a deck. No copy-paste, no "let me find that document again". The notebook becomes the research workspace; the deck is the output. Same model applies to Word and Excel below.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/05-notebooks-ppt-generation.webp" alt="Copilot Notebook generating a PowerPoint presentation — the Notebook on the left lists references and Created content; the slide preview on the right shows generated slides ready to open in PowerPoint, with a chat panel on the far right confirming the deck is complete." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** Open a **Copilot Notebook** (Frontier preview) → ask Copilot to create a PowerPoint presentation → pick template, length, and focus.

📖 [M365 Roadmap 558938](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558938)

## 6. Create Word Documents from Copilot Notebooks

*For: Frontier program preview users · Rolling out in May*

In **Copilot Notebooks**, generate **Word documents** — reports, summaries, proposals — directly from the content and references gathered in the notebook. Specify the document type, main topic, audience and themes, and Copilot drafts a first version you can open and edit in Word.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Reports usually start with the painful first draft. Notebooks-to-Word skips that by drafting from material you have already curated — the references you trust, the notes you have taken — instead of from a cold prompt. The Word document arrives already grounded in your sources.</p>
</blockquote>

**How to find it:** Inside a **Copilot Notebook**, ask Copilot to create a Word document and customise type, topic, audience and theme.

📖 [M365 Roadmap 558934](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558934)

## 7. Create Excel Spreadsheets from Copilot Notebooks

*For: Frontier program preview users · Rolling out in May*

Same pattern — but for Excel. **Copilot Notebooks** can now generate **Excel spreadsheets** from notebook content, so structured data buried in your references gets turned into a workbook you can analyse.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A lot of useful data lives in tables inside PDFs, web pages and meeting notes — but only as text. Notebooks-to-Excel pulls that structure out into a real workbook. Less "rebuild this table manually", more "open it in Excel and analyse".</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/07-notebooks-excel-generation.webp" alt="Generating an Excel spreadsheet from Copilot Notebook content — Copilot creates a structured workbook based on the notebook's references and notes, which then opens in Excel for editing." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 559480](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559480)

## 8. Mind Maps in Copilot Notebooks

*For: Frontier program preview users · Rolling out in May*

**Mind maps in Copilot Notebooks** provide an interactive, grounded view of key topics and the relationships across a notebook's content. *([Notebook prompt guide →](/blog/microsoft-365-copilot-prompting-2026-whats-new/))* Explore nodes, open summaries for specific areas, and use Copilot to drill deeper into what you see on the map.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> When a notebook starts holding 10 or 20 sources, the "what's actually in here?" question gets harder. Mind maps give you a visual scaffold of the territory — what the major themes are, how they connect, where to dig further. It is the way humans actually navigate knowledge.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/08-notebooks-mind-maps.webp" alt="Mind map view in a Copilot Notebook showing a Three-Phase Launch Strategy — central node branches to Pre-Launch, Launch and Post-Launch sub-trees that expand into Social teasers, Influencer partners, Press releases, Tech publications, Environmental media, Press coverage and Benefit blogs." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 559029](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559029)

## 9. Web Link as a Reference in Copilot Notebooks

*For: Frontier program preview users · Rolling out in May*

Paste a **URL as a reference in Copilot Notebooks** and Copilot uses that web link's content to inform notebook chat and outputs — expanding sources beyond internal content.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Until now, notebooks lived inside the walls of your tenant. Adding external web pages as first-class references closes the gap between internal context (the strategy doc) and external context (the regulator's announcement, the competitor's press release, the standards body's page). Both inform the same workspace.</p>
</blockquote>

**How to find it:** Add a reference to a notebook → paste a **URL** as the source.

📖 [M365 Roadmap 516040](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=516040)

## 10. Edit Copilot Pages with Chat in Notebooks

*For: Frontier program preview users · Rolling out in May*

**Copilot Notebooks** now supports **creating and editing Copilot Pages through chat** — describe the change in natural language and Copilot updates the page in place.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> The learning curve on Copilot Pages was real — users could read them but found editing intimidating. Chat-driven editing removes that — say what you want changed, and the page updates. Lower curve, more adoption, less "I'll just put it in a Word doc instead".</p>
</blockquote>

📖 [Official April announcement — Copilot Notebooks wave](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--april-2026/4510935)

## 11. Teams Meetings in Copilot Notebooks

*For: Frontier program preview users · Rolling out in May*

Add **Microsoft Teams meetings as references in a Copilot Notebook** — connect **transcripts, notes, chats, and shared content** from past meetings so Copilot can reason over them alongside your other sources.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A huge amount of an organisation's "real" knowledge is locked inside meeting transcripts and notes nobody re-reads. Making meetings citable references inside a notebook unlocks that — "what did we agree about Q3 pricing in that call last Tuesday?" is suddenly an answerable question.</p>
</blockquote>

📖 [M365 Roadmap 560706](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560706)

## 12. Multimodal Capture in Copilot Notebooks (OneNote iPhone)

*For: Frontier program preview users on iPhone · Rolling out in May*

**Multimodal capture in Copilot Notebooks** in the **OneNote mobile app on iOS** lets you capture **audio transcription, images, and typed notes in a single session** — ideal for offline moments like in-person meetings or whiteboard discussions. Copilot then turns the capture into a structured Copilot Page saved into a selected notebook.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The classroom-style "scribble + whiteboard photo + voice memo" workflow has been a pain point for years on mobile — usually scattered across three apps. Capturing all three in one OneNote session, then having Copilot turn them into a clean page, is the most natural mobile-Copilot use case yet.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/12-notebooks-multimodal-onenote.webp" alt="Two iPhone screens side-by-side: the OneNote Copilot Notebooks 'Capture what matters on the go' intro modal on the left (Try Now / Not Now); an active multimodal capture session on the right with voice transcription showing Speaker 1 and Speaker 2 timestamps, recording timer 00:01:90, and camera / pause / end controls." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** Open **OneNote** on **iPhone** → start a multimodal capture session inside a Copilot Notebook.

📖 [M365 Roadmap 559095](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559095)

---

## 13. Plan Mode for Copilot in Excel

*For: All Copilot Excel users · Rolling out in May*

**Plan mode for Copilot in Excel** outlines a clear, step-by-step approach **before anything in the workbook is updated**. *([Excel guardrails brief →](/blog/microsoft-365-copilot-prompting-2026-whats-new/))* Review which data Copilot will touch, which capabilities it intends to use, and adjust the plan as needed — so edits stay intentional, transparent, and aligned with your goals.

{{< margin >}}If you have ever clicked "yes" on an AI suggestion and then watched it eat your spreadsheet — this is for you.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Excel changes are notoriously irreversible — formulas chain, references break, a wrong "fix" can ripple through dependents. Plan mode is essentially "show me the plan before you apply it". You see what is about to change, what data is involved, and you can stop or adjust before any damage. This is what serious analysts have wanted since day one.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/13-excel-plan-mode.webp" alt="Excel workbook with sales and rating data on the left, and a Copilot panel on the right showing Plan mode in action — 'Reasoned in 2 steps' followed by 'Here's my plan before I make any changes to your workbook' with a step-by-step bullet list (create a Dashboard worksheet, PivotTable, clustered column chart for sales by category, bar chart for ratings, summary section with key metrics) and a green Proceed button. 'Plan' dropdown visible at the bottom of the composer." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **Excel** with Copilot open, select **Plan** from the menu above the prompt box.

📖 [M365 Roadmap 560338](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560338)

## 14. Python When Editing with Copilot in Excel

*For: All Copilot Excel users · Rolling out in May*

You can now use **Python when editing with Copilot in Excel** to take on more advanced data analysis without leaving the workbook. Copilot can apply Python-powered techniques as it edits — transforming data, generating visualisations, and completing multi-step tasks. Ask Copilot to use Python in your prompt, or Copilot invokes it automatically when needed.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Excel's native formula language has limits — once you need real data transformation, pivot logic, statistical analysis or charting that goes beyond the built-ins, you used to leave Excel. Python in Copilot keeps you inside the workbook while picking up pandas-class capability for the heavy lifting. It is the biggest analyst-productivity upgrade Excel has shipped this year.</p>
</blockquote>

**How to find it:** Inside Excel, ask Copilot to use Python in your prompt — or let Copilot invoke it when the task warrants it.

📖 [Official April announcement — Plan mode + Python in Copilot for Excel](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--april-2026/4510935)

## 15. Create and Edit Images with the Model of Your Choice in PowerPoint

*For: PowerPoint users · Rolled out in April, expanding in May*

In **Copilot for PowerPoint** you can now choose which **image model** to use when creating or editing images. The current roadmap lists **OpenAI's GPT Image**, **Black Forest Labs' Flux**, **Microsoft's MAI-Image**, and more — with an **Auto** option that picks the best fit for your request.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Different models have different strengths — some are sharper at photo-real, some better at illustration, some better at minimal vector-style work. Letting users pick puts decisions back where they belong: with the person who knows the brand and the audience. Combined with admin controls, this also means image generation can be aligned to internal style and governance expectations.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/15-powerpoint-image-models.webp" alt="Copilot in PowerPoint image-generation dialog with a model picker — choose between OpenAI's GPT-Image, Black Forest Labs' Flux, Microsoft's MAI-Image, or an Auto option that picks the best fit for the request." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **PowerPoint** when Copilot generates or edits an image, choose the image model from the options.

📖 [M365 Roadmap 559478](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559478)

## 16. Copilot Chat — Smarter Visual Understanding (Embedded Images)

*For: All Copilot Chat users · Rolling out in May*

**Copilot Chat** can now leverage **embedded images** in documents (Word, PowerPoint, PDFs, OneNote and more) to give richer, more accurate answers — so a question about a diagram, screenshot, or chart inside a file is grounded in the actual visual, not just the surrounding text.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A surprising amount of real work knowledge lives inside images — architecture diagrams in slides, screenshots in support docs, charts pasted into PDFs. Until now, Copilot would mostly skip past those. Reading embedded visuals as part of grounding closes one of the biggest "but it missed the obvious thing" gaps users have raised.</p>
</blockquote>

📖 [M365 Roadmap 560540](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560540)

## 17. Public Website Grounding for Copilot in PowerPoint

*For: PowerPoint users · Rolled out in April, expanding in May*

**Copilot in PowerPoint** can now use **public webpages as source material** when building a deck. Add a web reference, and Copilot pulls in the relevant context, generates an initial outline, and produces slides you can refine.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Decks that need an external context — a regulator's announcement, a competitor's product page, a standards body's update — usually start with copy-paste. Public web grounding skips that step. The slide gets the real context, and your deck stays up-to-date with the cited source.</p>
</blockquote>

📖 [Official April announcement — Public website grounding in PowerPoint](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--april-2026/4510935)

---

## 18. Claude Model for Copilot in Word

*For: Word users · Microsoft says rolled out in April; roadmap shows GA May*

**Copilot in Word** now includes a **Claude (Anthropic) model option** for drafting and editing. Pick Claude alongside the OpenAI options where your organisation allows it. Microsoft's April recap says this rolled out in April, while Roadmap 558440 still shows In development with a May GA — expect a staggered rollout across rings.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Different LLMs have noticeably different writing styles — Claude tends to produce longer-form, more deliberate prose; GPT models are tighter and more directive. For legal, policy and long-form work where voice matters, model choice is finally a real lever inside Word, not just inside Copilot Chat.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/18-word-claude-model.webp" alt="Copilot side panel open on a Word document titled 'ZavaCore Fiber Product Roadmap: v2 & v3' — the Model dropdown is expanded showing Auto with a check mark and a Claude submenu listing Claude Opus 4.6 and Claude Sonnet 4.6, plus Settings, Quick Help, Scheduled prompts and other panel options." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **Word** when drafting or editing with Copilot, select **Claude** in the model dropdown (where enabled by your admin).

📖 [M365 Roadmap 558440](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558440)

---

## 19. Draft Coaching Feedback in Outlook

*For: Outlook users · Rolling out in May*

**Copilot in Outlook** can now provide **coaching feedback in chat** as you draft, edit and format emails — pointing out clarity, tone and structure issues before you hit send.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Most email mistakes are not factual — they are tonal. The thanks-as-passive-aggression, the buried ask, the over-long opener. Coaching in the moment, before send, is what a senior colleague used to do over your shoulder. Now it happens in chat alongside the draft.</p>
</blockquote>

📖 [M365 Roadmap 559418](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559418)

## 20. Draft, Edit and Format Emails Conversationally

*For: Outlook users · Rolling out in May*

In **Outlook**, draft, edit and format emails **conversationally with Copilot** — describe the change, and Copilot updates the message in place. Iteration replaces regeneration.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The old pattern was "generate, copy out, paste in, edit by hand". The new pattern is "say what to change, watch it change". Faster on small edits, much less destructive on long emails where regenerating would lose work you wanted to keep.</p>
</blockquote>

📖 [M365 Roadmap 552595](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=552595)

## 21. First Draft in the Canvas for Copilot in Outlook

*For: Outlook users · Available now (rolled out to new Outlook)*

**Copilot in Outlook** now writes a **first draft directly in the canvas** and can then iterate with the user to keep improving it — asking clarifying questions about goal, audience and tone as you go.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> One-shot generation is good for speed, bad for nuance. First-draft-in-canvas turns email drafting into a short conversation — Copilot writes, asks a clarifying question, adjusts in place. Every change stays visible in Outlook, no copy-paste or formatting surprises.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/21-outlook-first-draft-canvas.webp" alt="Copilot in new Outlook writing a first draft directly in the email canvas — Copilot iterates with the user via clarifying questions about goal, audience, and tone, with every change visible in place." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** Start a new email in **new Outlook** → use **Copilot** to draft — the draft appears directly in the canvas with iteration prompts.

📖 [Official April announcement — First draft in canvas in Outlook](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--april-2026/4510935)

## 22. Account Selector in the Outlook Copilot Side Pane

*For: New Outlook Calendar users with multiple Copilot-enabled accounts · Rolling out in May*

The **Copilot side pane in Outlook Calendar** (new Outlook) gets an **account dropdown** for users with more than one Copilot-enabled account — switch which mailbox Copilot is working against without leaving the side pane.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Plenty of users have a primary mailbox plus a shared inbox, or a primary plus a secondary tenant. Until now, getting Copilot to look at the right one in Calendar meant opening a different Outlook window. The selector turns that into a single click.</p>
</blockquote>

📖 [M365 Roadmap 559991](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559991)

---

## 23. Copilot Call Delegation in Microsoft Teams

*For: Teams users · Rolling out in May*

**Copilot call delegation** lets Copilot handle incoming **Microsoft Teams calls on your behalf**. Once enabled in Teams Calls settings, Copilot answers, gathers context from callers, helps you decide whether to pick up, and can set up follow-up appointments via **Microsoft Bookings**.

{{< margin >}}This is one of the more concrete assistant-style features shipping this year — a real receptionist function inside Teams.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A surprising amount of work-day friction is interruption from calls you would not have answered if you knew who they were. Call delegation turns "phone rings during deep work" into "Copilot tells you who is calling, what they want, and offers to book a follow-up". For sales, customer success and execs, this is the most concrete way Copilot starts feeling like a real assistant.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/23-teams-call-delegation.webp" alt="Microsoft Teams Calls UI mid-screening: a 'Started screening with Call Delegation' banner at the top, an active incoming call from +1 (509) 670-0594 in the Ongoing list (managed with Call Delegation), and a Details panel on the right showing Live screening 02:26 with the assistant transcript — 'Hello, I am Daniela's assistant, how can I help you today?' followed by the caller's reply — plus a Pick up button so the user can join the call once they know who it is." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to enable:** Open **Microsoft Teams → Settings → Calls** and turn on **Copilot call delegation**.

📖 [Official April announcement — Call delegation and consecutive interpretation](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--april-2026/4510935)

## 24. Consecutive Interpretation in Teams Interpreter

*For: Teams meeting attendees · Rolled out to Public Preview in April, expanding in May*

**Consecutive interpretation** is a new mode in **Microsoft Teams Interpreter** — translation begins **after each speaker finishes**, creating a turn-based flow that more closely matches how people naturally communicate in two-language meetings. Interpreter also appears on the meeting stage for everyone to see and hear.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Real-time simultaneous translation works well in one-to-many scenarios — a keynote with translation in your ear. But two-way back-and-forth meetings work better with turn-based interpretation, the way human interpreters actually do it. This is Teams catching up to the way bilingual meetings should feel.</p>
</blockquote>

📖 [M365 Roadmap 557180](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557180)

## 25. Share Recap Access in Microsoft Teams

*For: Teams meeting organisers · Rolling out in May*

Meeting organisers can now **share recap access** — granting people who were not in the meeting access to the AI-generated recap (transcript, summary, action items).

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The most common request after any important meeting is "can you send me the notes?". Sharing recap access turns that one-off favour into a default capability — the right people get the right access without a manual copy-paste of the summary into an email.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/25-teams-share-recap.webp" alt="Microsoft Teams Share this recap dialog — the meeting organiser can specify people who weren't in the meeting, and grant them access to the recording, transcript, AI summary and notes at the moment the recap link is shared." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 559606](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559606)

## 26. Delete Meeting-Generated Content in Recap

*For: Teams meeting organisers · Rolling out in May*

Organisers can now **delete meeting-generated content** (recaps, transcripts, AI notes) from individual Teams meetings — useful for sensitive conversations or when content was generated inadvertently.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> "Can we delete that recap?" used to be a service ticket. Giving organisers direct control over their own meeting-generated content reduces the admin burden and gives users the right level of agency over content created from their meetings — important for sensitive discussions like HR, M&amp;A, or performance reviews.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/26-teams-delete-recap-content.webp" alt="Microsoft Teams meeting recap with the new Delete recap content option in the More (...) menu — organisers can permanently delete recordings, transcripts, AI summaries and notes from the recap. Shared files remain in their original storage locations." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 557170](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557170)

---

## 27. Capture Voice Notes in the Microsoft 365 Copilot Mobile App

*For: Microsoft 365 Copilot licensed mobile users · Rolling out in May*

The **Microsoft 365 Copilot mobile app** now lets you **capture voice notes** directly — tap, talk, and Copilot transcribes and organises the note.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Half of the best ideas happen while walking from one meeting to the next — and most of them die in transit because typing is too slow. Voice notes in the Copilot app turn that wasted minute into captured thinking, automatically transcribed and ready to act on.</p>
</blockquote>

**How to find it:** Open the **M365 Copilot** app on iOS or Android → tap the voice-capture entry point.

📖 [M365 Roadmap 498640](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=498640)

## 28. Microsoft Edge — Copilot New Tab Page

*For: Edge users · Rolling out in May*

**Microsoft Edge** introduces a **Copilot-centred new tab page** with a single combined search/chat box, Copilot-suggested actions, curated work content, and personalised news and activities.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The new tab is the most-used surface in any browser. Centring it around a Copilot-aware search/chat box (rather than a plain search bar) nudges users towards plain-language asks and brings work content to the front of the browser instead of buried in tabs.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/28-edge-copilot-new-tab-page.webp" alt="Microsoft Edge for Business new tab page — a single combined Copilot search/chat composer at the top, with Copilot-suggested action tiles, curated work content cards, and personalised news/activities filling the page." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 558256](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558256)

## 29. Microsoft Edge v.148 — Redirect to M365 Copilot When DLP Blocks a Prompt

*For: Organisations with Purview DLP for generative AI · Launched in May*

In **Microsoft Edge v.148**, when **Purview DLP** blocks a user from sending a sensitive prompt to an external generative AI site, Edge now offers a UI option to **redirect that same prompt to Microsoft 365 Copilot** — keeping the user productive while keeping the sensitive data inside the tenant boundary.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> "Just block it" is bad change management — users find a workaround. This pattern is much better: at the moment the DLP rule fires, the browser actively offers the safe alternative ("you can ask Copilot instead") with the same prompt pre-filled. Compliance held, user not blocked, support tickets reduced.</p>
</blockquote>

📖 [M365 Roadmap 560341](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560341)

## 30. Microsoft Edge — Send Work Browsing History to Copilot

*For: Edge enterprise users · Launched in May*

**Microsoft Edge** can now send **work-related browsing history to Copilot** for more relevant work results when searching — with appropriate enterprise data protection.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> "What was that thing I read yesterday?" is one of the most common search-failure cases. Letting Copilot reason over your recent work browsing — within enterprise data protection — turns Copilot search from "what's on the web?" into "what have I been working on?". Big productivity win for research-heavy roles.</p>
</blockquote>

📖 [M365 Roadmap 537283](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=537283)

---

## 31. Submit Agents to Agent Store from Agent Builder

*For: Agent makers and IT admins · Rolling out in May*

**Agent Builder** now lets makers **submit agents for administrator review and approval** before they are published to the organisation's **Agent Store** catalog. Once approved, agents appear under **"Built by your org"** in the Agent Store.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Internal agent distribution has been the missing piece — anyone could build, but getting an agent into real users' hands required manual sharing. A proper submit-and-review flow turns that into a managed pipeline: makers build, admins approve, users discover and install. Same model as an internal app store, applied to agents.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/31-submit-agents-agent-store.webp" alt="Agent Builder dialog for submitting a custom agent to the organisation's Agent Store catalog for administrator review and approval — once approved, the agent appears under Built by your org." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **Agent Builder**, submit your agent for review → admins approve via the **Agent Store** catalog in the M365 admin center.

📖 [M365 Roadmap 557173](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557173)

## 32. Admin Rules for Agent Lifecycle Automation

*For: IT admins · Launched in May*

Admins can now **bulk-manage the Copilot agent estate** from the Microsoft 365 admin centre — **bulk-install** Microsoft-built (first-party) agents across users, **bulk-reassign ownerless agents** to managers for proper governance, and apply on-demand lifecycle cleanup actions without per-agent clicking. Rule-based automation (auto-block risky agents, auto-delete inactive agents, auto-reassign based on conditions) is on the roadmap as a phased follow-up — bulk on-demand is GA today.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Agent sprawl is real. Organisations that have been building agents for a year now have dozens of them, and a chunk of those are unused, risky, or have no clear owner. Lifecycle rules turn cleanup from "manual audit project" into "policy-driven housekeeping" — much easier to keep clean over time.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/32-agent-lifecycle-bulk-reassign.webp" alt="Microsoft 365 admin center bulk agent lifecycle actions — admins can bulk-reassign ownerless Copilot agents to their original owner's manager, install first-party agents to users en masse, and apply lifecycle policies across the agent estate. (Rule-based automation is shipping in phases; bulk on-demand is GA now.)" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 481518](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=481518)

## 33. Scheduled Prompts for Agents

*For: Agent users · Rolling out in May*

You can now configure **scheduled prompts for agents** — a prompt that runs on a recurring schedule (daily, weekly, monthly) and delivers its output proactively.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> A lot of "agent" value is just consistency — the same useful prompt run every Monday morning would unlock 80% of what people want. Scheduled prompts make that possible without needing to remember to run them. Weekly inbox summary, Monday-morning pipeline check, end-of-month report digest — all on autopilot.</p>
</blockquote>

📖 [M365 Roadmap 531759](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=531759)

## 34. Chat One-on-One with SharePoint Agents in Teams

*For: SharePoint and Teams users · Rolling out in May*

**SharePoint agents** can now be **chatted with one-on-one in Microsoft Teams** — so a SharePoint site that has an agent for its content can be queried directly from your Teams chat list, like chatting with any other contact.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Most users find SharePoint agents from inside SharePoint — but that is the wrong front door for daily use. Surfacing those agents inside Teams 1:1 chat means "ask the HR policies agent something" becomes as casual as messaging a colleague. Closer to where the question actually arises.</p>
</blockquote>

📖 [M365 Roadmap 481825](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=481825)

---

## 35. Ready-to-Use Prompts in OneDrive File Preview

*For: All OneDrive users · Launched in April*

The **OneDrive file preview** now shows **discoverable Copilot actions** — ready-to-use prompts next to the Copilot button (summarise, generate FAQs, extract action items) so users can act on a file the moment they open it. Also available in **SharePoint**.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The biggest barrier to Copilot adoption is not capability — it is "what do I even ask?". Surfacing 3-4 useful, file-specific prompts at the point of preview removes that hesitation. Adoption goes up because users don't need to imagine what is possible; the prompts show them.</p>
</blockquote>

📖 [M365 Roadmap 559481](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559481)

## 36. AI-Generated Video Drafts with Text Animations

*For: Clipchamp + Copilot video users · Rolling out in May*

**AI-generated video drafts** in **Microsoft Clipchamp with Copilot** now include **text animations and new layout options** — so video drafts feel more polished out of the box.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Video creation in Copilot is most useful for short internal content — training, announcements, recaps. Adding text animations and varied layouts means the "first draft" is closer to publishable, with less post-edit work needed before it is shareable.</p>
</blockquote>

📖 [M365 Roadmap 557560](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557560)

---

## 37. Power User Insights in Copilot Dashboard

*For: IT admins and Copilot champions · Rolling out in May*

The **Copilot Dashboard Adoption tab** now includes **Power user insights** — classifying users as **power, habitual, novice, or non-Copilot** based on usage frequency and consistency, so champions and enablement teams can target the right cohorts.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Generic adoption numbers don't tell you what to do next. Knowing who your power users are turns them into internal champions — their patterns become training material. Knowing who your novices are turns them into a targeted enablement cohort. The same total-licence count, but a much sharper picture of who needs what.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/37-copilot-dashboard-power-users.webp" alt="Updated Adoption tab in the Copilot Dashboard with the new Power user insights view — users classified as power, habitual, novice, or non-Copilot based on usage frequency and consistency, so enablement teams can target the right cohorts." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** Go to **Viva Insights → Copilot Dashboard → Adoption** tab.

📖 [M365 Roadmap 560705](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560705)

## 38. Copilot Dashboard — Export by Day

*For: IT admins · Rolling out to Public Preview in May (worldwide GA in August)*

Admins can now **export by day** in the **Copilot Dashboard** — download de-identified Copilot usage metrics aggregated by user and day for the **most recent 28 days** — for faster, more data-driven licence-assignment and intervention decisions.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Monthly aggregates hide trends. Day-level data lets you spot the start of a usage drop, the impact of a training campaign, or the difference between people who tried Copilot once and people who use it daily — which directly informs licence-allocation and intervention decisions.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/38-copilot-dashboard-export-by-day.webp" alt="Copilot Dashboard export-by-day option — admins download de-identified Copilot usage metrics aggregated by user and day for the most recent 28 days, for faster data-driven licence-assignment and intervention decisions." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 547749](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=547749)

## 39. Microsoft 365 Admin Center — Prepaid Capacity Pack Billing

*For: IT admins · Available now*

The **Microsoft 365 admin center** now supports using **prepaid capacity pack credits as the only billing method** for supported Copilot pay-as-you-go experiences. Create capacity pack policies that ensure users covered by the policy draw exclusively from available prepaid credits — keeping spend predictable.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Pay-as-you-go billing is great for flexibility, scary for finance teams that want fixed spend. Forcing covered users to draw only from prepaid credits gives finance a hard ceiling — no surprise invoices, no overages — while still letting consumption-based features work as intended.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/39-prepaid-capacity-pack-policies.webp" alt="Microsoft 365 admin center Billing view showing prepaid capacity pack policies listed by department — admins can ensure users covered by a policy draw exclusively from available prepaid credits, keeping spend predictable." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **Microsoft 365 admin center → Billing**, create a **capacity pack policy**.

📖 [M365 Roadmap 557175](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557175)

## 40. New Microsoft Purview Data Security Posture Management Experience

*For: Compliance and security admins · Rolling out in May*

A **new Microsoft Purview Data Security Posture Management (DSPM)** experience — a redesigned view across data-security signals, recommendations, and risk surfaces — gives security teams a clearer picture of where their data is and where it is at risk.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Data security posture used to mean cross-referencing five separate Purview surfaces. The new DSPM experience pulls them into a single posture view — risky data, sensitive data, AI-related exposure — so security leaders can answer "what's the state of our data risk this week?" in one click. Critical for any organisation rolling out Copilot at scale.</p>
</blockquote>

📖 [M365 Roadmap 532728](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=532728)

---

## 41. Voice Chat in Microsoft 365 Copilot

*For: All Copilot Chat users · Available now*

**Voice in Microsoft 365 Copilot** brings a hands-free, conversational way to talk to Copilot — on desktop and mobile. Speak directly to Copilot to search for information, catch up between meetings, brainstorm out loud, and switch languages mid-sentence. Voice mode also works in **Copilot in Word and PowerPoint**.

{{< margin >}}One of those features that quietly changes the rhythm of using Copilot.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Typing-first AI assistants always have a friction floor — you have to stop, switch surface, type the prompt. Voice removes the floor. Brainstorming becomes "think out loud, Copilot follows along". The biggest win is the contexts where typing was never going to happen — walking between meetings, hands occupied, dictating notes from a whiteboard photo.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/42-voice-chat.webp" alt="Microsoft 365 Copilot composer with the voice mode icon highlighted on the right side of the message box — a single tap starts a hands-free voice conversation with Copilot." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** Click the **voice icon** next to the microphone in the Copilot composer.

📖 [M365 Roadmap 481138](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=481138)

## 42. List Email Attachments in Copilot

*For: All Copilot users · Available now*

**Copilot can now list the file attachments** you've received or sent over email — ask *"show me the file attachments I've sent to [person]"* or *"find attachments from this thread"* and Copilot returns a structured list with sender, date, and one-click access.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The most common search-failure case in Outlook is "I sent her that document last month, where did it go?". Most users don't remember whether they emailed it, shared it via OneDrive, or attached it in Teams. A focused "show me the attachments" view turns five-minute searches into ten-second answers.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/43-list-email-attachments.webp" alt="Copilot Chat response to 'Show me the file attachments I've emailed to William Beringer' — a structured list of recent attachments sent, with sender context, dates, and clickable file names." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 497909](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=497909)

## 43. Create with Copilot from the PowerPoint Web Home

*For: PowerPoint web app users · Available now*

The **Create with Copilot** button now appears right on the PowerPoint web app home page — start a new deck from a prompt without opening a blank file first. Removes one click and a context-switch from the "I need a deck" flow.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Adoption is friction-sensitive. Putting Copilot at the front door of PowerPoint instead of behind a "New blank presentation → click Copilot" path turns "I'll come back to that later" into "I'll try one prompt right now". Small UX move, big behavioural ripple.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/44-ppt-web-home-create.webp" alt="PowerPoint web app home page with a prominent orange 'Create with Copilot' button alongside 'Create blank presentation' and 'Upload a file' — the new front-door CTA for Copilot-driven deck creation." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 560537](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560537)

## 44. Executive Summary Slide in PowerPoint

*For: PowerPoint users · Available now*

**Generate an executive summary slide** for your existing deck — Copilot reads the presentation and produces a single polished slide that highlights the key points in exec-ready language. Useful when a 60-slide quarterly deck needs to start with a one-slide TL;DR for leadership.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> The TL;DR slide is the most-read slide in any long deck and usually the last one written (or the one nobody writes). Auto-generating it from the rest of the deck means it stays in sync as the deck evolves — and removes the "we need a one-pager" anxiety from every pre-leadership review.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/47-ppt-executive-summary.webp" alt="Copilot side panel in PowerPoint with the prompt 'create an executive summary slide' entered, surrounded by suggested editing actions like 'Summarise this presentation' and 'Add a table with data'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** In **PowerPoint** with editing enabled, open the Copilot side panel and ask Copilot to **create an executive summary slide**.

📖 [M365 Roadmap 555875](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555875)

## 45. Video Recap in Teams

*For: Teams meeting attendees with Copilot license · Available now*

**Intelligent recap** now includes **video recap** — narrated highlight clips from your recorded Teams meetings, showing the key moments instead of the full hour. A "watchable" recap, not just a "readable" one.

{{< margin >}}The first version of recap that catches people up in 90 seconds instead of 30 minutes.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Reading a transcript is dense; watching a full meeting is a waste; reading bullet-point notes loses tone. Video recap is the missing middle — a short narrated clip that shows you who said what at the moments that mattered. For everyone who's ever clicked "Join recording" and immediately wished they could fast-forward to the bit they actually needed.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/46-teams-video-recap.webp" alt="Teams meeting recap page for a 'Client experience review' showing the video player with the agenda slide visible and four participants in the side rail — narrated highlights generated automatically from the recording." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 558540](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558540)

## 46. Create a Live FAQ in SharePoint

*For: SharePoint content owners · Available now*

A new **AI-powered FAQ web part for SharePoint** — content owners can curate a living FAQ with Copilot's help, grounded in connected references. The "Human-in-the-Loop" approach means Copilot drafts, the owner reviews and approves — keeping quality high without manual upkeep.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Every intranet has a FAQ page nobody trusts because it's three years stale. Living FAQs that draft themselves from current source documents — with human review before publish — solve the maintenance burden that killed the last decade of FAQ pages.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/45-sharepoint-live-faq.webp" alt="SharePoint page edit view with the new AI-powered FAQ web part — 'Generate a ready-to-use FAQ set instantly — AI will craft them from your chosen references' — alongside the reference picker showing files, meetings and SharePoint pages." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**How to find it:** Edit a SharePoint page → **Add a web part** → **AI** → **FAQ**.

📖 [M365 Roadmap 482198](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=482198)

## 47. Create Charts on SharePoint Pages with AI

*For: SharePoint page authors · Rolling out in May*

A new **Chart web part for SharePoint** powered by AI — describe the chart you want in plain English ("monthly support ticket volume by team") and Copilot creates an interactive chart embedded in the page. No data wrangling, no chart-tool round-trip.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> SharePoint pages have always been text-heavy because charts required leaving the editor and importing from Excel or Power BI. A native AI chart web part means content authors can illustrate any point without breaking flow — and the chart updates live as the underlying data changes.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/51-sharepoint-charts-ai.webp" alt="SharePoint Toolbox panel with the new AI Chart web part highlighted (dashed red outline) alongside Agent link and FAQ — three new AI-powered web parts available to drag into a SharePoint page." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 660076](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=660076)

## 48. Surveys Agent in Microsoft Forms

*For: Microsoft Forms users · Rolling out in May*

**Copilot lands in Microsoft Forms** — including the new **Surveys Agent** that helps you draft the survey, suggest improvements to question wording, draft and send invitations, and analyse the results when responses come in. End-to-end survey workflow inside Forms instead of three different tools.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Survey design is harder than it looks — biased questions, leading wording, the wrong response scale. A Surveys Agent in the moment, plus invitation drafting and result analysis, turns survey-running from a multi-day project into an afternoon. Pretty meaningful for HR, customer feedback, internal pulse checks.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/50-forms-surveys-agent.webp" alt="Microsoft Forms with the 'Draft with Copilot' dialog open — a composer asking 'Describe what survey you'd like to create, including its purpose, audience, and the insights you hope to gain' with a Generate button below." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 553136](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=553136)

## 49. Copilot in Pages — Write, Code and Create

*For: Copilot Chat users · Rolling out in May*

Copilot Chat's **tools menu** now includes **"Create content or code"** — a one-click path to start co-creating in a Copilot Page (text, structured content, or code) alongside Copilot, then share it with others when ready. Pages becomes a first-class output, not a hidden surface.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Most users find Copilot Pages through the side door (a previous chat needed a longer canvas). Surfacing it as a first-action option in the chat tools menu turns Pages from "where Copilot occasionally lands" into "where I deliberately go to co-create". Bigger shift than it sounds.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/49-copilot-in-pages.webp" alt="Copilot Chat composer with the + tools menu expanded — showing Add work content, Upload, Take screenshot, Add capabilities, Chat with an agent, Change data sources — and a submenu listing Research a topic, Analyse data, Create a document, Create a workbook, Create a presentation, Create a visual, Create content or code." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 509109](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=509109)

## 50. Share Agents to a Microsoft Teams Team

*For: Agent makers · Available now*

When sharing a custom agent, you can now **share directly with a Microsoft Teams team** — search for the team in the share dialog and send a notification to the main channel announcing the agent's availability. Removes the friction of "I built a useful agent, now how do I tell everyone?".

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Agent adoption inside teams has been bottlenecked at distribution. Building the agent is the easy part; getting the team to discover and install it is where momentum dies. Native Teams-team-as-share-target with channel notification closes that loop — agent maker hits Share, team gets a heads-up in their main channel, members install in one click.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/48-share-agents-teams.webp" alt="Agent sharing dialog for 'Policy Advisor' — radio options for 'Anyone in your organization', 'Specific users in your organization' (selected, with people/team picker), or 'Only you', plus a Copy Link option below for sending the share link directly." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 557947](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557947)

## 51. Triage Your Inbox by Voice in Outlook Mobile

*For: Outlook mobile users · Rolling out in May*

The **Outlook mobile app** gets a **Copilot voice experience** — say *"summarise my recent unread"* and Copilot reads it back, then take action (flag, pin, archive, mark as read) by voice. Interrupt or redirect Copilot mid-flow when something catches your attention.

{{< margin >}}Inbox triage between meetings, while the laptop is closed.{{< /margin >}}

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters:</strong> Mobile inbox use has always been "scroll, tap, scroll, archive". Voice-driven triage turns the same five minutes between meetings into a more productive catch-up — and unlocks inbox use for people who can't or don't want to keep typing on a phone. Big for execs, big for accessibility.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/52-outlook-mobile-voice.webp" alt="Outlook mobile inbox on iPhone with the Copilot bottom sheet open — quick action chips for 'Voice catch-up' and 'Triage my inbox' visible alongside a composer with the microphone and voice-conversation icons." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 516575](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=516575)

## 52. Purview DLP for M365 Copilot — Safeguard Prompts

*For: Purview DLP admins · Available now*

**Purview DLP for Microsoft 365 Copilot** can now safeguard **prompts containing sensitive data** — in real time, blocking Copilot (including pre-built agents) from responding when the prompt itself contains sensitive content, or from using that content for grounding. Closes the loop on the other side of [#29 Edge DLP redirect](#29-microsoft-edge-v148--redirect-to-m365-copilot-when-dlp-blocks-a-prompt) — once a prompt lands inside Copilot, prompt-level DLP makes sure the sensitive content doesn't leak via the response.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> DLP for Copilot used to mean "controls on the output". This expansion is "controls on the input". For regulated industries (healthcare, finance, legal) where the question itself reveals confidential context, prompt-level DLP is the missing third leg of the Copilot governance stool — alongside output controls and Purview audit.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/53-dlp-copilot-prompts.webp" alt="Microsoft Purview Data Loss Prevention page showing the 'Safeguard sensitive data in Microsoft 365 Copilot interactions' policy creation flow — sensitive information types selected (All Full Names, All Credential Types, All Medical Terms) with actions to 'Restrict Copilot from processing content' for user prompts and web searches." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 51945](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=51945)

## 53. Watermarks for AI-Generated Content

*For: M365 Copilot tenants · Available now*

**Watermarks for AI-generated content** — admins can now enable a small Copilot icon watermark on AI-generated images, audio, and video produced inside M365 Copilot. Helps recipients (internal or external) recognise AI-generated content at a glance, supporting transparency policies.

<blockquote class="callout callout-tip">
<p>💡 <strong>Why it matters for admins:</strong> Many organisations are starting to require disclosure when AI-generated content is shared — for IP reasons, for audit reasons, for downstream-trust reasons. A built-in watermark removes the "did they remember to label it?" risk by making the marker automatic and consistent. Particularly relevant for marketing, comms, and external-facing creative work.</p>
</blockquote>

<p><img src="/images/blog/copilot-may-2026/54-ai-content-watermarks.webp" alt="An AI-generated image of an empty modern conference room with a large window view of a city skyline — a small Copilot icon watermark sits subtly in the bottom-right corner, signalling the image was produced by Copilot." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

📖 [M365 Roadmap 547831](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=547831)


---

## Image credits

Screenshots embedded in this article are sourced from Microsoft's own public publications, with thanks to Microsoft's Tech Community blog team and the public Message Center archive:

- Most in-product UI screenshots — [What's New in Microsoft 365 Copilot · April 2026 recap](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--april-2026/4510935) (Microsoft 365 Copilot Blog, 30 April 2026)
- Federated MCP Connectors (#1) — [Federated Copilot connectors -- bringing real-time enterprise data within Microsoft 365 Copilot](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/federated-copilot-connectors---bringing-real-time-enterprise-data-within-microso/4515993) (Microsoft 365 Copilot Blog, 5 May 2026)
- GPT-5.5 Quick response in the model selector (#2) -- [Available today: GPT-5.5 Instant in Microsoft 365 Copilot](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/available-today-gpt-5-5-instant-in-microsoft-365-copilot/4517084) (Microsoft 365 Copilot Blog, 7 May 2026)
- Microsoft Edge Copilot New Tab Page (#28) — [New in Edge for Business: AI for work, safe from day one](https://blogs.windows.com/msedgedev/2026/05/20/new-in-edge-for-business-ai-for-work-safe-from-day-one/) (Microsoft Edge Blog, 20 May 2026)
- Branded footer (#4), Excel from Notebooks (#7), Share recap access (#25), Delete recap content (#26), Bulk agent lifecycle (#32) — Microsoft 365 Message Center posts ([MC1238432](https://mc.merill.net/message/MC1238432), [MC1262567](https://mc.merill.net/message/MC1262567), [MC1289724](https://mc.merill.net/message/MC1289724), [MC1289725](https://mc.merill.net/message/MC1289725), [MC1308854](https://mc.merill.net/message/MC1308854)). Mirrored via [merill/mc](https://github.com/merill/mc) (open-source archive of public Microsoft Graph Service Announcements).

Features that shipped only in May (19 of the 53) do not have a public Microsoft screenshot yet -- when Microsoft publishes the May recap, this article will be refreshed.

---

## 📚 Official Microsoft Resources

- [What's New in Microsoft 365 Copilot — Tech Community](https://techcommunity.microsoft.com/category/microsoft365copilot/blog/microsoft365copilotblog)
- [Federated Copilot connectors — announcement (May 5, 2026)](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/federated-copilot-connectors---bringing-real-time-enterprise-data-within-microso/4515993)
- [GPT-5.5 Instant in M365 Copilot — announcement (May 7, 2026)](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/available-today-gpt-5-5-instant-in-microsoft-365-copilot/4517084)
- [Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview)
- [Microsoft 365 roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap)
- [Microsoft 365 Copilot adoption guide](https://adoption.microsoft.com/en-us/copilot/)
- [What's new in Microsoft 365](https://learn.microsoft.com/en-us/microsoft-365/admin/whats-new-in-preview)

## 🔗 Related Content on This Site

- [January 2026 Copilot Updates](/blog/microsoft-365-copilot-january-2026-updates/)
- [February 2026 Copilot Updates](/blog/microsoft-365-copilot-february-2026-updates/)
- [March 2026 Copilot Updates](/blog/microsoft-365-copilot-march-2026-updates/)
- [April 2026 Copilot Updates](/blog/microsoft-365-copilot-april-2026-updates/)
- [M365 Copilot Full Tutorial](/ai-hub/microsoft-365-copilot-full-tutorial-word-excel-teams-outlook-more-beginners-guid/)
- [Master All 6 Copilot Agents](/ai-hub/master-all-6-new-microsoft-365-copilot-agents-boost-your-productivity-in-one-vid/)
- [Browse all AI tutorials](/ai-hub/)
- [Daily AI News](/ai-news/)
- [Live M365 Roadmap tracker](/m365-roadmap/)

---

## 💡 Want More?

- 📺 [Subscribe to A Guide to Cloud & AI on YouTube](https://www.youtube.com/susanthsutheesh) for new tutorials every week
- 📰 Check out the [AI News page](/ai-news/) for the latest AI headlines
- ☕ [Download free resources](https://ko-fi.com/aguidetocloud/shop)

---

*This article accompanies a video tutorial on the [A Guide to Cloud & AI](https://www.youtube.com/susanthsutheesh) YouTube channel.*
