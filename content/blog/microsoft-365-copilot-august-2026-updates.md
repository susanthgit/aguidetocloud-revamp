---
title: "What's New in Microsoft 365 Copilot: August 2026"
list_title: "M365 Copilot - August 2026: 58 Updates"
hub_id: "whats-new"
description: "August 2026 Microsoft 365 Copilot updates: 26 current updates across Excel, PowerPoint, Notebooks, Teams and admin, plus 32 labelled catch-up items."
date: 2026-08-19 # Placeholder only. Confirm the real launch date after 18 August.
lastmod: 2026-08-19 # Placeholder only.
draft: true
youtube_id: ""
card_tag: "What's New"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-august-2026-updates.jpg"]
og_headline: "August Copilot Update - 58 Changes"
og_glyph: "calendar"
tags:
  - microsoft-365
  - copilot
  - news
faq:
  - question: "What's new in Microsoft 365 Copilot in August 2026?"
    answer: "Twenty-six current updates. The ones Microsoft states are rolling out in August are an Excel theme design skill, Power BI grounding in Excel, Copilot in Excel working in cloud-saved workbooks with AutoSave off, assigning tasks from PowerPoint comments, and Markdown support in Copilot Notebooks. The rest rolled out in July or June and cover Copilot Chat, Cowork, Word, PowerPoint, Teams, SharePoint and the admin centre. Section 22 is the exception: Microsoft announced domain exclusion for web grounding in July and rolled it back on 4 August 2026, so it is included as a withdrawn announcement rather than a rollout."
  - question: "Why does this issue also contain 32 older items?"
    answer: "Because I missed them. A strict comparison against Microsoft's official June roundup found 29 capabilities my June and July recaps had not materially covered, plus one Cost Management item I had only covered partially and two items I had listed only as watch items that have since launched. They appear as sections 27 to 58 with the rollout timing Microsoft stated, clearly labelled as a late catch-up rather than relabelled as August news."
  - question: "Which August items need admin attention?"
    answer: "Three. Recreate spending alerts on existing Cost Management policies so they pick up the improvements. Look at the Purview DLP policy, in Public Preview, that stops Copilot using emails from external senders as grounding data. And open the Agent Access Insights heatmap to see which sites your agents are reaching into. One thing to un-plan: domain exclusion for web grounding was announced in July and rolled back by Microsoft on 4 August 2026."
  - question: "What changed in Cost Management?"
    answer: "Three things. Spending alerts improved, but admins should recreate alerts on existing spending policies to get the benefit. Policy logic is clearer: a user covered by more than one policy stays on the one with the highest per-user limit and is not moved when they reach it. And a user who hits a limit mid-task can finish it - Microsoft's stated intent is that the overage is not charged and does not appear as consumed credits in the Cost Management dashboards, though Learn describes the nonbilling as being at Microsoft's sole discretion."
  - question: "Where did these updates come from?"
    answer: "Microsoft's official July 2026 Copilot roundup, published on 31 July 2026, plus the June roundup for the catch-up section. Every numbered section links to its official source. Microsoft's own August roundup had not published when this went out, so anything it adds will roll into the September issue."
layout: "notebook"
stamp: "monthly recap"
intro_note: "← what changed this month, in plain English"
founder_note: |
  Microsoft's own August roundup had not published when I wrote this, so I stopped waiting for it. What is below is everything I could verify from the July roundup and the official sources it points at, with each item keeping the month Microsoft actually stated.

  The second half is the awkward part. A strict comparison showed 32 things my June and July recaps had missed. I would rather show that gap plainly, with the real dates on it, than quietly pretend those features launched in August.
---

**The short version - what's new in Microsoft 365 Copilot for August 2026:** Excel got a theme design skill, Power BI grounding and support for workbooks with AutoSave turned off. PowerPoint can assign tasks from comments. Copilot Notebooks accept Markdown. The Copilot mobile app started sending push notifications, Claude Fable 5 arrived in Cowork in Preview, Cowork tasks can now be triggered by an event rather than a schedule, and admins picked up an Agent 365 Dashboard plus three changes to Cost Management that need action. One announced admin control, domain exclusion for web grounding, was rolled back by Microsoft on 4 August.

Sections **1 to 26** are the current updates. Sections **27 to 58** are a clearly-labelled **late catch-up** of items I missed from June — real dates kept, nothing relabelled as August. If you want the method behind that split, [how this issue was put together](#how-this-issue-was-put-together) is at the end.

**2026 monthly recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/) · August (you are here)

<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Screenshot note: images below come from my demo tenant or official Microsoft product imagery. Your tenant may look different because features roll out at different times and the interface changes often.</em></p>

---

## If you only have 2 minutes

Four things explain most of this month:

1. **Excel had the biggest month.** A theme design skill that formats a whole sheet in one pass, a brand kit skill that applies your organisation's approved colours and fonts, grounding in Power BI reports that respects row-level security, and support for cloud-saved workbooks with AutoSave switched off.
2. **Copilot started reaching out.** The mobile app now sends push notifications like *Your Day at a Glance*, which is the first time Copilot tells you when it is worth opening rather than waiting to be asked.
3. **Documents got their admin work done for them.** Word can build and maintain a table of contents, headers, footers and footnotes. PowerPoint can write, reply to and resolve comments, and will soon assign them as tasks.
4. **The admin layer got sharper edges.** An Agent 365 Dashboard, a heatmap of which sites your agents are reaching into, and three Cost Management changes - one of which needs you to recreate your existing alerts. Domain exclusion for web grounding was also announced, then rolled back on 4 August - so that one is a heads-up, not a task.

**Also worth a look:** Claude Fable 5 (Preview) in Cowork for long-running work, a Meeting recaps app in Teams, and a heatmap showing which sites agents are accessing.

---

## Admin Checklist - August 2026

Start with these three. They are the items where doing nothing has a cost:

1. **Recreate spending alerts on existing Cost Management policies.** The alerts improved, and Microsoft's guidance is to recreate alerts on existing policies. Microsoft does not spell out what happens to one you leave alone, so if a notification matters to you, recreate it rather than assume.
2. **Look at the Purview DLP control for external email.** In Public Preview, it stops Copilot using emails from external senders as grounding data. External email is the one input to your tenant that someone outside it writes. It has no numbered section here because [June's recap](/blog/microsoft-365-copilot-june-2026-updates/) already covered it - but it is still the admin item most worth acting on.
3. **Open the Agent Access Insights heatmap.** It gets you closer to the question everyone actually asks about agents - which sites are they reaching into, and how often?

Then, when you have time:

4. **Check whether Claude Fable 5 should be on.** It is in Preview and off by default in Cowork, so it will not appear for users unless you enable it - and enabling it accepts Anthropic's data retention terms.
5. **Open the Agent 365 Dashboard.** You will find it in Copilot Analytics in the Viva Insights web app, not the Microsoft 365 admin center. Agents accumulate quietly; this is where you notice.
6. **Un-plan domain exclusion.** If July's announcement made it into a rollout plan or a governance document, take it out - Microsoft rolled the feature back on 4 August 2026.

The catch-up checks from the June roundup are further down, with sections 27 to 58.

---

## Quick Jump

**Current updates (1-26)**

- **Excel:** [Theme design](#1-excel-gets-a-theme-design-skill) · [Power BI grounding](#2-excel-can-ground-its-analysis-in-power-bi-data) · [AutoSave off](#3-copilot-in-excel-works-in-more-cloud-saved-workbooks) · [Brand kit](#12-excel-can-format-a-workbook-with-your-brand-kit)
- **PowerPoint and Word:** [Assign tasks](#4-powerpoint-can-assign-tasks-inside-comments) · [Comments](#13-powerpoint-can-write-reply-to-and-resolve-comments) · [iPad multi-step](#14-copilot-in-powerpoint-on-ios-and-ipad-can-plan-multi-step-work) · [Word drafting workflows](#11-word-can-build-tables-of-contents-headers-footers-and-footnotes)
- **Chat, Cowork, Notebooks and mobile:** [Markdown, TXT and RTF](#5-copilot-notebooks-accept-markdown-txt-and-rtf-files) · [Office agents in chat](#6-add-the-word-excel-and-powerpoint-agents-straight-into-a-chat) · [Push notifications](#7-the-copilot-mobile-app-sends-push-notifications) · [Claude Fable 5 (Preview)](#8-claude-fable-5-preview-arrives-in-cowork) · [Event-triggered tasks](#9-cowork-tasks-can-be-triggered-by-an-event-not-just-a-schedule) · [Search answers](#10-copilot-search-answers-got-shorter-with-a-clearer-way-to-continue)
- **Teams, SharePoint and sources:** [Meeting recaps app](#15-teams-gets-a-dedicated-meeting-recaps-app) · [Agent access heatmap](#16-a-heatmap-showing-which-sites-agents-are-accessing) · [News audio](#17-sharepoint-news-pages-can-be-listened-to) · [Manage your sources](#18-add-and-manage-your-own-sources-and-point-a-prompt-at-one) · [DoD connectors](#19-copilot-connectors-reach-dod-tenants) · [Industry connectors](#20-more-copilot-connectors-aimed-at-specific-industries) · [Document from a form](#21-power-automate-can-generate-a-document-from-a-sharepoint-form)
- **Admin:** [Domain exclusion (rolled back)](#22-domain-exclusion-for-web-grounding-was-announced-then-rolled-back) · [Agent 365 Dashboard](#23-an-agent-365-dashboard-lands-in-copilot-analytics) · [Connectors usage](#24-a-usage-report-for-copilot-connectors) · [Chat usage in GCC](#25-the-copilot-chat-usage-report-reaches-gcc-gcc-high-and-dod) · [Cost Management](#26-cost-management-better-alerts-clearer-policy-logic-kinder-overages)

**Late catch-up from the June roundup (27-58)**

- **Cowork:** [Model choice](#27-cowork-can-choose-the-model-for-the-job) · [Plugin catalogue](#28-coworks-plugin-catalogue-expanded) · [Skill authoring](#29-coworks-customize-tab-gained-skill-authoring) · [Visuals](#30-cowork-can-create-and-edit-visuals) · [Brand templates](#31-cowork-can-use-your-organisational-powerpoint-templates) · [Edge browser](#32-cowork-can-work-through-the-edge-browser) · [Notifications](#33-cowork-sends-approval-and-completion-notifications)
- **Chat, Notebooks and Outlook:** [Power BI](#34-copilot-chat-can-ground-answers-in-power-bi) · [Regenerate](#35-regenerate-lets-you-retry-or-switch-model) · [Notebooks](#36-copilot-notebooks-expanded-to-chat-users) · [Outlook emails in Notebooks](#37-outlook-emails-can-be-added-to-a-copilot-notebook) · [Classic Outlook settings](#38-classic-outlook-gained-direct-copilot-settings)
- **Word:** [Model choice](#39-word-added-anthropic-model-choice-for-editing) · [Catchup](#40-copilot-catchup-shows-what-changed-in-a-document) · [Create images](#41-word-can-generate-an-image-for-the-document) · [iPhone and iPad](#42-agentic-editing-reached-word-on-iphone-and-ipad) · [Chat history](#43-word-preserves-copilot-chat-history) · [Comment edits](#44-word-can-apply-edits-requested-in-comments)
- **PowerPoint and Excel:** [Brand Kit Picker](#45-powerpoint-gained-an-admin-approved-brand-kit-picker) · [PowerPoint skills](#46-powerpoint-skills-make-repeatable-deck-work-reusable) · [Library and folder references](#47-powerpoint-referencing-sharepoint-libraries-and-onedrive-folders) · [Excel skills](#48-excel-skills-package-repeatable-workflows) · [Personalization](#49-excel-personalization-remembers-how-you-work) · [`.Rules`](#50-a-rules-sheet-keeps-workbook-specific-standards)
- **Agents and admin:** [Researcher](#51-researcher-lets-users-choose-models-and-modes) · [Planner Agent](#52-planner-agent-adds-task-cards-and-plan-management) · [Cost Management](#53-the-cost-management-dashboard-covers-the-full-spend-workflow) · [Team credit spend](#54-a-team-level-view-of-copilot-credit-spend) · [Agent metrics](#55-agent-metrics-support-custom-adoption-reporting) · [Hybrid Organizational Messages](#56-organizational-messages-reached-hybrid-joined-devices) · [Vision controls](#57-admins-can-control-copilot-vision-screen-and-camera-sharing) · [Purview for Cowork](#58-microsoft-purview-controls-now-cover-cowork)
- **Still pending:** [Three to watch](#on-the-horizon---three-to-watch)

---

## Current August updates

**Sections 1 to 5 carry August timing.** Section 5 is split across two months — TXT and RTF landed in July, Markdown lands in August — so read that one carefully. Everything from section 6 onwards rolled out in July or June.

**Section 22 is the odd one out.** Microsoft announced it in July and then withdrew it in August. It is here because you may have read the announcement, not because it is something you can use.

## 1. Excel gets a theme design skill

*For: Copilot in Excel · Rolling out August 2026*

Excel picked up a **theme design skill**. You call it with `@theme-design` and ask Copilot to design or polish a sheet. It applies a coordinated colour palette, styles the charts and structures the layout so the important numbers stand out.

The point is that it does the whole look in one pass, rather than you formatting cell by cell. Raw data goes in, a readable report comes out.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Most spreadsheets that get shared are ugly not because people don't care, but because formatting is slow and boring. Handing that to Copilot means the analysis gets read instead of skipped.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-12-excel-theme-design-esg.webp" alt="Official Microsoft image of Copilot in Excel applying a theme design skill to a workbook, showing a coordinated colour palette across a table and charts." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 2. Excel can ground its analysis in Power BI data

*For: Copilot in Excel · Rolling out August 2026*

You can attach a **Power BI report** from the work content selector, then ask Copilot to analyse performance, spot trends, and build summaries or supporting calculations straight in the Excel grid.

The detail that matters: Copilot works against the underlying report data and **respects existing row-level security**. You are not exporting a copy and hoping the permissions travel with it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The old pattern was export to CSV, paste into Excel, then reconcile it by hand a week later when the numbers moved. This removes the export step, which is also the step where governance usually falls over.</p>
</blockquote>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 3. Copilot in Excel works in more cloud-saved workbooks

*For: Copilot in Excel · Windows and Mac · Rolling out August 2026*

Copilot in Excel now works in more cloud-saved workbooks, **including files where AutoSave is turned off**. Previously AutoSave had to be on, which quietly locked people out of Copilot in workbooks that were otherwise supported.

If AutoSave is off and the workbook has unsaved changes, Excel prompts you to turn it on before Copilot starts editing, to protect the work you have not saved. You can carry on without turning it on if you want to.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is a small change that removes a genuinely confusing dead end. Plenty of people deliberately keep AutoSave off on financial models, and had no idea that was the reason Copilot appeared to be missing.</p>
</blockquote>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 4. PowerPoint can assign tasks inside comments

*For: Copilot in PowerPoint · Rolling out August 2026*

Copilot in PowerPoint can turn feedback into **assigned follow-ups** and pull the right people into a comment thread. You ask it to convert a comment into a task and notify whoever needs to act.

Microsoft's wording is that users will "soon" be able to do this, with the rollout stated for August, so treat it as arriving rather than already in your tenant.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Deck feedback usually dies in the comment pane. Turning a comment into an owned task is the difference between "someone should fix slide 12" and slide 12 actually getting fixed.</p>
</blockquote>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 5. Copilot Notebooks accept Markdown, TXT and RTF files

*For: Copilot Notebooks · TXT and RTF rolled out July 2026 · Markdown rolling out August 2026*

Notebooks can now take **Markdown (.md), TXT (.txt) and RTF (.rtf)** files as references, alongside the file types they already supported. That covers software documentation, video transcripts and rich-text notes.

Worth reading the timing carefully, because Microsoft split it: **TXT and RTF rolled out in July, and Markdown support rolls out in August.**

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Markdown is where a lot of technical truth actually lives — READMEs, runbooks, exported notes. Until now that content had to be converted before Copilot could reason over it.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-09-notebook-md-txt-rtf.webp" alt="Official Microsoft image of a Copilot Notebook showing Markdown, TXT and RTF files added as notebook references." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 6. Add the Word, Excel and PowerPoint agents straight into a chat

*For: Microsoft 365 Copilot Chat · Rolled out July 2026*

You can now pull the **Word, Excel and PowerPoint agents** directly into a Copilot Chat prompt. Open Copilot, `@mention` the agent, and it joins the chat.

That means you can create a document, a spreadsheet or a deck without leaving the Copilot app.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> It collapses the "where do I start?" problem. You no longer have to decide whether a piece of work is a Word job or an Excel job before you begin — you just describe it and bring the right agent in.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-02-word-agent-mention.webp" alt="Official Microsoft image of a Copilot Chat prompt where the Word agent has been added by @mentioning it." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 7. The Copilot mobile app sends push notifications

*For: Microsoft 365 Copilot mobile app · iOS and Android · Microsoft 365 Copilot licence required · Rolled out July 2026*

The Copilot mobile app can now send **push notifications** so you can catch up without opening Outlook, Teams and everything else in turn. You get prompts like *Your Day at a Glance* and *Items waiting for you*.

Open the notification and the app is already showing the answer to that prompt, rather than an empty chat box.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the first time the Copilot <em>mobile app</em> reaches out rather than waiting to be opened. Copilot could already act unprompted - scheduled prompts run to a timetable, and Cowork sends approval and completion notifications - but this puts that on the device you actually carry.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-05-push-day-at-a-glance.webp" alt="Official Microsoft image of a Your Day at a Glance push notification from the Microsoft 365 Copilot mobile app." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 560339](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560339) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 8. Claude Fable 5 (Preview) arrives in Cowork

*For: Copilot Cowork · Preview · Off by default · Rolled out June 2026 · Timing disputed, see below*

{{< margin >}}Cowork runs work for hours, not seconds. That is why the model choice matters more here than in a chat box.{{< /margin >}}

**Anthropic's Claude Fable 5** is available in Copilot Cowork, in **Preview**, as an option for longer, more complex work. Anthropic positions it for ambitious, long-running projects — sustained reasoning, deeper context handling, and the ability to plan, execute and check its own work across multi-stage tasks.

Two details that are easy to miss. It is **off by default**, so it will not simply appear for your users — an admin has to opt the tenant in. And when you do, prompts and responses sent to the model are handled under **Anthropic's terms, including their data retention**, not Microsoft's.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The interesting part is not another name in the model list. It is that Cowork is being pointed at work that runs for hours rather than seconds, where the model has to keep its footing without someone supervising every step. The opt-in is not a formality — it is a decision about where your prompts go.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-03-model-picker.webp" alt="Official Microsoft image of the Copilot Cowork model picker, showing Claude Fable 5 (Preview) listed as a selectable model alongside the other available options." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📎 Two of our resources go deeper: the **[Copilot Cowork complete guide →](/blog/microsoft-copilot-cowork-complete-guide/)** for how it works, and our **[Cowork cost calculator →](/cowork-cost-calculator/)** to estimate what a long-running task might cost.

<blockquote class="callout callout-warn">
<p><strong>Which month?</strong> Microsoft's own sources disagree. The <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new">Cowork change log</a> places Fable 5 under <strong>June 2026</strong>, while the July roundup lists it as a <strong>July</strong> rollout. I have gone with June because that is the product team's own change log, but I cannot tell you the two agree.</p>
</blockquote>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332) · [Cowork change log](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

## 9. Cowork tasks can be triggered by an event, not just a schedule

*For: Copilot Cowork · Frontier · Rolled out July 2026*

Cowork tasks used to run when you asked, or on a schedule. Now they can run when **something happens**. You describe the trigger in plain language - a message from a particular **sender**, an **@mention**, a **keyword or topic**, or a named **event** - and Cowork watches for it across **Teams chats and channels, Outlook email and meetings**.

The example in Microsoft's own image is the giveaway: you write the task, and Cowork comes back with a **"Set up trigger?"** card rather than making you build the automation yourself.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A scheduled task runs whether or not there is anything to do. An event-triggered one runs because there is. That is the difference between an agent that adds noise to your day and one that only speaks when something actually happened.</p>
</blockquote>

<blockquote class="callout callout-warn">
<p><strong>Frontier, for now.</strong> Microsoft describes this as rolling out in July to <strong>Frontier</strong> - the early-access programme - not to every tenant. If you cannot find it, that is probably why.</p>
</blockquote>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 10. Copilot Search answers got shorter, with a clearer way to continue

*For: Copilot Search · Rolled out July 2026*

Copilot answers inside the **Copilot Search** module now give **more concise responses**, and they show more prominently that you can carry the conversation on in Copilot Chat in the sidebar.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Search answers were often too long to skim and too short to be the final word, so people bounced. Making them tighter and putting an obvious "keep going" path next to them fixes both ends of that.</p>
</blockquote>

📖 [M365 Roadmap 562354](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562354) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 11. Word can build tables of contents, headers, footers and footnotes

*For: Copilot in Word · Rolled out July 2026*

Copilot in Word picked up **drafting workflows**. It can insert and update a **table of contents** so it stays right as the document grows, and it can manage **headers, footers, page numbers, dates and footnotes**.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the unglamorous half of document work that eats an afternoon before something goes to a customer. It is also the half people get wrong most often, because it is fiddly and manual.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-10-word-table-of-contents.webp" alt="Official Microsoft image of Copilot in Word inserting and updating a table of contents in a document." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 12. Excel can format a workbook with your brand kit

*For: Copilot in Excel · Rolled out July 2026*

The **brand kit skill** lets Copilot in Excel format a workbook using your organisation's Brand Kit from the Microsoft 365 brand center. It applies approved colours, fonts and logo to tables and charts, so a report follows the branding guidelines without anyone formatting it by hand.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Brand guidelines usually lose to deadlines. Making the on-brand version the fastest version is the only approach that actually holds.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-11-excel-brand-kit.webp" alt="Official Microsoft image of Copilot in Excel applying an organisation's brand kit colours, fonts and logo to a workbook's tables and charts." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 13. PowerPoint can write, reply to and resolve comments

*For: Copilot in PowerPoint · Rolled out July 2026*

Copilot in PowerPoint can now **write a new comment, reply to existing feedback, and resolve finished comment threads** from inside the presentation.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Review threads on a big deck get long and repetitive. Letting Copilot clear the settled ones keeps the pane focused on what is genuinely unresolved.</p>
</blockquote>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 14. Copilot in PowerPoint on iOS and iPad can plan multi-step work

*For: Copilot in PowerPoint · iOS and iPad · Rolled out July 2026*

Copilot in PowerPoint on **iOS and iPad** gained the capabilities the desktop already had. It can now handle **multi-step requests** rather than one instruction at a time, ground its work in the **slide you are currently on** or a **file you attach**, and keep **working in the background** while you do something else.

To be clear about what this is: Copilot was already on PowerPoint mobile. What changed in July is how much it can do there.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Reviewing a deck on the way to the meeting is a real habit. The gap was that mobile Copilot could answer questions but not really do work. Multi-step planning is what closes that gap.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-14-ppt-ipad.webp" alt="Official Microsoft image of Copilot in PowerPoint on iPad, showing the Copilot pane offering Allow Editing and Chat Only modes over an open presentation." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 15. Teams gets a dedicated Meeting recaps app

*For: Microsoft Teams · Rolled out July 2026*

There is now a **Meeting recaps app** in Teams that brings your recaps into one place, instead of you hunting back through the calendar meeting by meeting.

Two limits worth knowing. It covers the **previous 30 days**, not your whole history. And it only shows meetings that were **recorded or transcribed** — a meeting with neither has no recap to list. It is on **desktop and web** first, with mobile to follow.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Recaps were already good. The problem was finding them. A single home for them turns a nice feature into something people actually use a week later.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-16-teams-recaps-app.webp" alt="Official Microsoft image of the Meeting recaps app in Microsoft Teams listing recaps from recent meetings in one place." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 564614](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=564614) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 16. A heatmap showing which sites agents are accessing

*For: SharePoint and OneDrive · Agent Access Insights · Rolled out July 2026*

**Agent Access Insights** now includes a **heatmap** of agent activity across **SharePoint sites and OneDrive accounts**. You can see how requests are distributed, which sites are busiest, and where activity is concentrated - Microsoft documents a site-level view with up to 20 agents listed per site, not a file-by-file read list.

Getting to it needs a **SharePoint admin**, plus either **SharePoint Advanced Management** or Microsoft 365 Copilot licensing.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The honest question every organisation has about agents is "what are they actually touching?" This is the first view that answers it with data rather than assurances.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-17-sharepoint-access-heatmap.webp" alt="Official Microsoft image of the Agent Access Insights heatmap in SharePoint showing agent access patterns across site content." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 565027](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=565027) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 17. SharePoint news pages can be listened to

*For: SharePoint app for Teams (Viva Connections) · Rolled out June 2026*

SharePoint news pages can generate an **AI audio summary** you can listen to instead of reading. This is in the **SharePoint app for Teams** — the Viva Connections experience — rather than everywhere a news page appears.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Internal comms compete with everything else in someone's day. Audio catches the commute and the walk between meetings, which is time reading never gets.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-18-sharepoint-news-audio.webp" alt="Official Microsoft image of a SharePoint news page offering an AI-generated audio summary." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 562018](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562018) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 18. Add and manage your own sources, and point a prompt at one

*For: Microsoft 365 Copilot · Rolled out July 2026*

Copilot now lets you **manage your own sources** directly, and **scope a specific prompt to a single connector**. So you can tell Copilot to answer only from, say, your ticketing system rather than everything it can reach.

One clarification, because the wording invites the wrong reading: users are not deploying arbitrary connectors. An **admin enables** the connector for the tenant; the user then **authenticates to it** and chooses when to point a prompt at it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Most bad Copilot answers are not the model being wrong — they are the model reading the wrong thing. Being able to say "only look here" is the simplest quality control there is.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-04-copilot-search-sources-annotated.webp" alt="Official Microsoft image of the Copilot sources rail, where third-party connectors appear alongside SharePoint as selectable sources for a prompt." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup, with my annotation added. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 19. Copilot connectors reach DoD tenants

*For: Microsoft 365 Copilot · DoD cloud · Rolled out June 2026*

Copilot connectors — including **Jira and Confluence** — became available for **DoD** tenants, extending the same third-party grounding that commercial tenants already had.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Sovereign and government clouds usually trail commercial by a long way. Each connector that crosses over closes a real gap for teams who have been watching features they cannot use.</p>
</blockquote>

📖 [M365 Roadmap 512428](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=512428) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 20. More Copilot connectors, aimed at specific industries

*For: Microsoft 365 Copilot · Copilot connectors · Rolled out July 2026*

Microsoft expanded the **Copilot connectors catalogue** with a set of clearly industry-shaped sources. Financial services picks up **Daloopa, FactSet, Fitch, Morningstar, PitchBook and S&P Global**. Broader business research picks up **Dice, Forrester and HG Insights**. Manufacturing and supply chain picks up **Infor Nexus and Sight Machine**.

These are connectors, not plugins - they bring an external body of knowledge into Copilot's **grounding**, so answers can cite it the same way they cite a SharePoint document.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Generic Copilot is only ever as good as the tenant it can see. A research analyst asking about a company does not want an answer synthesised from internal email - they want the source their industry already pays for. This is Microsoft filling in the sources that make Copilot useful in a specific job rather than in general.</p>
</blockquote>

📖 [Copilot connectors overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/overview) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 21. Power Automate can generate a document from a SharePoint form

*For: Power Automate + SharePoint · Public Preview · Rolled out June 2026*

A new Power Automate action, **Generate document from form (Preview)**, builds a document from a **template** by mapping form inputs to predefined fields in that template. You fill in the form, the flow produces the finished document.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Most organisations have a handful of documents that are 90 per cent boilerplate and 10 per cent variables - contracts, statements of work, onboarding packs, change requests. Those are usually produced by someone copying last month's version and hoping they caught every name. Mapping the variables to a form is the unglamorous fix that removes a whole class of embarrassing errors.</p>
</blockquote>

<blockquote class="callout callout-warn">
<p><strong>Status disagreement.</strong> The roadmap entry still reads <em>In development</em> while Microsoft's roundup describes it as having rolled out in June. Treat the preview label as the reliable part.</p>
</blockquote>

📖 [M365 Roadmap 561026](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=561026) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 22. Domain exclusion for web grounding was announced, then rolled back

*For: Microsoft 365 admin center · Admin control · Announced July 2026 · **Withdrawn 4 August 2026***

{{< margin >}}Announced in an official roundup, withdrawn a fortnight later. Here the news is the reversal.{{< /margin >}}

Microsoft announced that admins could **exclude specific domains** from web grounding, so Copilot would not use those sites when searching the web to answer a question. The announcement stated support for **up to 1,000 domains**.

On **4 August 2026**, Microsoft rolled the feature back. Their update says the capability "has been rolled back at this time" and that they are "actively evaluating next steps".

<blockquote class="callout callout-warn">
<p><strong>Do not plan around this.</strong> If you read the July roundup and added domain exclusion to a rollout plan or a governance document, take it back out. There is no replacement control yet, and Microsoft has not given a return date. Web grounding is back to being broadly on or off.</p>
</blockquote>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the honest shape of a fast-moving product. A feature can be announced in an official roundup and withdrawn a fortnight later. It is worth checking that an announced admin control actually exists in your tenant before you build policy on top of it.</p>
</blockquote>

📖 [M365 Roadmap 503144](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=503144) · [Update: Domain Exclusion for Microsoft 365 Copilot](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/update-domain-exclusion-for-microsoft-365-copilot/4543648) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 23. An Agent 365 Dashboard lands in Copilot Analytics

*For: Copilot Analytics in the Viva Insights web app · Generally available July 2026*

The **Agent 365 Dashboard** gives eligible leaders and analysts a consolidated view of agent activity across the tenant.

Where to find it matters here, because the name sends people the wrong way: it is in **Copilot Analytics inside the Viva Insights web app**, not a report in the Microsoft 365 admin center. The access bar is higher than "an admin can open it" - Microsoft documents **Agent 365 licensing, at least 50 assigned Microsoft 365 Copilot licences, and actual agent activity** before the view populates.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Agents multiply quietly. A single dashboard is how you notice that before it becomes a governance conversation you did not choose to have.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-21-agent365-dashboard.webp" alt="Official Microsoft image of the Agent 365 Dashboard in Copilot Analytics, showing a consolidated view of agent activity across the tenant." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 567667](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567667) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 24. A usage report for Copilot connectors

*For: Microsoft 365 admin center · Public Preview · Rolled out June 2026*

A **Copilot connectors usage report** is available in **Public Preview**, showing how connectors are being used across the tenant.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Connectors are easy to add and easy to forget. Usage data tells you which ones earned their place and which are just extra surface area.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-22-connectors-usage-report.webp" alt="Official Microsoft image of the Copilot connectors usage report in the Microsoft 365 admin center." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 519571](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=519571) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 25. The Copilot Chat usage report reaches GCC, GCC High and DoD

*For: Microsoft 365 admin center · GCC, GCC High, DoD · Rolled out July 2026*

The **Microsoft 365 Copilot Chat usage report** is now available in **GCC, GCC High and DoD** tenants, so government customers get the same adoption reporting commercial tenants have.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Adoption reporting is how these programmes get funded and defended. Not having it was a genuine handicap for government admins.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-23-chat-usage-report.webp" alt="Official Microsoft image of the Microsoft 365 Copilot Chat usage report in the admin center." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 567121](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567121) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 26. Cost Management: better alerts, clearer policy logic, kinder overages

*For: Microsoft 365 admin center · Cost Management · Rolled out July 2026*

Three changes landed in Cost Management, and one of them needs an admin to actually do something.

- **Improved spending alerts.** Alerts got better - and Microsoft's guidance is that **admins should recreate alerts on existing spending policies** where they rely on those notifications. Microsoft does not spell out what happens to an alert you leave alone, so if a notification matters to you, recreate it rather than assume.
- **Clearer policy logic.** If a user falls under more than one spending policy, they stay on the one with the **highest per-user limit**, and they are not moved to a different policy when they hit that limit.
- **Kinder overage handling.** A user who reaches their limit part-way through a task can finish that task. Microsoft's stated intent is that the overage is **not charged**, and that it does not appear as consumed credits in the Cost Management dashboards. Read the fine print on that one: Learn describes the nonbilling as being at **Microsoft's sole discretion**, and the not-shown-as-consumed promise is scoped to those dashboards.

The policy logic point is the one that trips people up: a spending policy sets a limit, it does not allocate or reserve a pool of credits for those users.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Cost controls only work if they are predictable. Knowing exactly which policy applies, and that a limit will not kill a job mid-run, is what lets an admin set a limit and stop worrying about it.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-24-cost-management-annotated.webp" alt="Official Microsoft image of the Cost Management area in the Microsoft 365 admin center showing spending policies and alerts." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup, with my annotation added. UI and availability may vary by tenant and rollout.</em></p>

📎 We go deeper on the numbers in our **[Copilot cost management guide →](/blog/microsoft-365-copilot-cost-management/)** and **[Copilot credits explained →](/blog/copilot-credits-explained/)**.

📖 [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## Late catch-up from Microsoft's June roundup

Microsoft's [official June roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) contained a different layer of app-by-app detail from the items I had prioritised in June and July. The 32 items below were either absent from my recap pair, only partially covered, or sat on my watch list until Microsoft confirmed they had shipped.

The timing labels come from that article, and where a later Microsoft source has since corrected or confirmed a date, the later date wins and is shown on the section. **Rolled out in June** means June, not August. **Frontier** means the feature was described for that early-access programme. A few of these have since shipped in July or August, and those say so.

<p style="font-size:0.88rem;opacity:0.78;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Catch-up note: 27-58 are here for completeness, but they are not August announcements - they are items from Microsoft's June roundup that my June and July recaps missed. Each section carries the most current rollout date I could verify, which for a few of them is July or August.</em></p>

## 27. Cowork can choose the model for the job

*For: Copilot Cowork · Rolled out June 2026 · Late catch-up*

Cowork gained **automatic model choice**. It could use **OpenAI GPT 5.5** for deeper research and citation-heavy work, or supported **Anthropic models** for visual tasks such as PowerPoint and graphics.

The useful part is not another model picker. Cowork can decide which model fits the task without asking the user to understand every model first. The user still defines the outcome; Cowork chooses the engine behind the work.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Model choice becomes much more useful when it is invisible. People can ask for the work they need instead of learning which model is best at research, visuals or multi-step reasoning.</p>
</blockquote>

<blockquote class="callout callout-warn">
<p><strong>Since then:</strong> <strong>Auto</strong> is now Cowork's default rather than a "Frontier" option, and Microsoft's documentation applies the Frontier label to <strong>GPT 5.5</strong>, not to Auto. The screenshot below shows the June-era model list — the current list is longer.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-25-cowork-model-choice.webp" alt="Official Microsoft image of the Copilot Cowork Work IQ model menu, listing Auto, GPT 5.5, Claude Opus 4.8, Claude Sonnet 4.6 and Cowork 1." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 28. Cowork's plugin catalogue expanded

*For: Copilot Cowork · Rolled out June 2026 · Late catch-up*

Cowork's plugin catalogue expanded into more of the systems people already use. Microsoft's roundup named **enosix arnold for Copilot Cowork, Harvey, LSEG, Miro, monday.com, Moodys Credit MCP, Morningstar, S&P Global Energy and AI Meeting Notes TeamsMaestro**, with **Databricks** available through sideloading.

**Fabric IQ** and named **Dynamics 365** plugins — Customer Service, ERP and Sales — were also supported. That means a Cowork task can draw on more business context without asking the user to manually gather and paste everything into the prompt.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Cowork is only as useful as the systems it can reach. Every plugin on that list is a place your work already lives, and a question you no longer have to answer by copying and pasting.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-26-cowork-plugins.webp" alt="Official Microsoft image of the Cowork Customize Plugins page, showing installed Dynamics 365 ERP Apps and plugin cards for Adobe, Canva, Box, Miro, Harvey and monday.com." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 29. Cowork's Customize tab gained skill authoring

*For: Copilot Cowork · Customize · Timing disputed, see below · Late catch-up*

The same **Customize** surface has a second tab. **Skills** is where the reusable instructions live, and it gained authoring controls: **Create new** for writing a skill in place, and **Upload skill** for bringing in a `.md`, `.zip` or `.skill` file. Each skill has an owner and can be shared, so a working method can move from one person's habit into something the whole team can call.

<blockquote class="callout callout-warn">
<p><strong>Timing note:</strong> Microsoft's own sources disagree on this one. The July roundup presents skill authoring as a July addition, while the current Cowork support documentation places the guided skill builder and skill uploads in June. I have left it here in the catch-up section and flagged the conflict rather than quietly pick a date.</p>
</blockquote>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Plugins widen what Cowork can reach. Skills are what make a good process repeatable — the difference between one person who knows the trick and a team that can just call it.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-09-cowork-customize-skills-annotated.webp" alt="Cowork Customize screen on the Skills tab, with the Add menu open showing Create new and Upload skill, above a list of the user's own skills." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The Skills tab on the same Customize surface, with my annotations. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)

## 30. Cowork can create and edit visuals

*For: Copilot Cowork · Rolled out June 2026 · Late catch-up*

Cowork could create and edit **deck graphics, document illustrations and email imagery** inside the task itself. Microsoft's June article described the experience as powered by **OpenAI's ChatGPT Images 2.0**.

That keeps the visual step inside the same flow as the research, writing and file creation. Instead of stopping to find another tool, the user can ask Cowork to create the image the deliverable needs.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A finished deliverable usually needs more than text. Letting Cowork make the supporting visual closes one more gap between a good draft and something ready to send.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-27-cowork-visual-creation.webp" alt="Official Microsoft image of a Cowork prompt asking for a product mock-up and a colourful generated textile image returned underneath." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 31. Cowork can use your organisational PowerPoint templates

*For: Copilot Cowork + organisational asset library · Rolled out June 2026 · Late catch-up*

Cowork could use **branded PowerPoint templates from an organisation's asset library**. Generated presentations could begin with the approved colours, fonts, logos and layouts instead of needing a manual brand-clean-up pass afterward.

This is separate from image generation. One capability creates the visual content; the other makes sure the final deck looks like it belongs to the organisation that asked for it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A deck is not finished if someone still has to rebuild it in the company template. Starting inside the approved brand system saves time and makes the output easier to trust.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-28-cowork-branded-template.webp" alt="Official Microsoft image of a completed Cowork task beside a branded Zava PowerPoint deck preview with an Edit in PowerPoint button." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 32. Cowork can work through the Edge browser

*For: Copilot Cowork · Frontier · Rolled out June 2026 · Late catch-up*

Cowork gained the ability to use **Microsoft Edge** across business systems, websites and intranet sites. That lets a task continue into browser-based tools instead of stopping when the next step sits outside Microsoft 365.

The official image also shows an approval boundary: when the browser needs a sign-in, Cowork pauses and asks the user to continue. Browser access does not mean invisible access to every system.

**One update since June.** Microsoft's July roundup describes browser automation more broadly rather than as an Edge-and-Frontier-only capability, so this appears to have widened after the June announcement. I have kept the June framing here because that is what Microsoft stated at the time.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A lot of real work ends in a browser-only system. Reaching that last mile is what turns "prepare the expense report" into "the receipts are ready in the expense tool."</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-29-cowork-edge-browser.webp" alt="Official Microsoft image of a Cowork expense-report task showing an Edge-branded Action needed in the browser sign-in approval card." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 33. Cowork sends approval and completion notifications

*For: Copilot Cowork on iOS and Android · Rolled out June 2026 · Late catch-up*

Cowork could send push notifications when a long-running task needed **approval**, needed more **input**, or had **completed**. The user no longer had to keep the task open and watch it work.

The notification becomes the hand-off point. Cowork can continue in the background, then bring the person back only when a decision or result is ready.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Long-running work is only useful if people can safely look away. Notifications let Cowork fit around the workday instead of asking the user to babysit the agent.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-30-cowork-notification.webp" alt="Official Microsoft image of an iPhone lock screen showing a Copilot Task complete notification for competitive-analysis slides." loading="lazy" style="width:340px;max-width:100%;height:auto;box-sizing:border-box;display:block;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) auto;" /></p>
<p style="font-size:0.88rem;opacity:0.78;text-align:center;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 34. Copilot Chat can ground answers in Power BI

*For: Microsoft 365 Copilot Chat + Power BI through Work IQ · Frontier · Rolled out June 2026 · Late catch-up*

Microsoft's June roundup said Copilot could reason over **Power BI enterprise data** and return grounded answers from **Power BI reports and semantic models**. Eligible Frontier users with Microsoft 365 Copilot Premium and permission/licensed access to the relevant Power BI reports and semantic models could ask a natural-language question without first building a query or exporting the data.

This keeps the answer inside Copilot while the underlying BI model remains governed. The semantic model still supplies the business definitions; Copilot gives the user a simpler way to ask the question.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A well-built semantic model already contains the organisation's agreed version of revenue, margin, customer and product. Bringing that governed meaning into Copilot is much safer than asking people to reason from a pasted spreadsheet.</p>
</blockquote>

📖 [M365 Roadmap 567891](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567891) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Microsoft Fabric IQ in Microsoft 365 Copilot](https://learn.microsoft.com/en-us/fabric/iq/connectors/microsoft-365-copilot-overview)

## 35. Regenerate lets you retry or switch model

*For: Microsoft 365 Copilot Chat · Rolled out June 2026 · Late catch-up*

The latest Copilot response gained a **Regenerate** path with simple actions such as **Try Again** and **Switch Model**. Users could explore another answer without copying the prompt into a new chat or rebuilding the context from scratch.

The model switch is especially useful when the first response is structurally fine but the task needs a different kind of reasoning. The conversation stays in place while the user changes the engine behind the next attempt.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The first answer is not always the best answer. A one-click retry keeps the useful context and makes iteration feel like part of the workflow instead of a failure.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 36. Copilot Notebooks expanded to Chat users

*For: Copilot Notebooks + Copilot Chat users · Rolled out June 2026 · Late catch-up*

Copilot Notebooks expanded beyond people with a paid Microsoft 365 Copilot licence to **Copilot Chat users**. More people could gather project references in one place and work from the same notebook context.

The June article called out tools such as **mind maps** and **study guides** alongside the shared reference workspace. This is access expansion rather than a new Notebook concept: the important change is who can use it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Shared context only works when the wider team can reach it. Expanding Notebooks to Chat users makes the project workspace useful beyond the smaller licensed group.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 37. Outlook emails can be added to a Copilot Notebook

*For: Copilot Notebooks · Rolled out July 2026 · Late catch-up*

You can add **Outlook emails as references inside a Copilot Notebook**, alongside the files, pages and links you already collect there. The notebook then grounds its answers in those conversations - the decisions, the caveats, the constraint somebody mentioned once and never wrote down anywhere else.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A lot of the reasoning behind a piece of work never reaches the document. It stays in the thread. Pulling the thread into the same notebook as the deliverable means Copilot is reading the argument, not just the conclusion.</p>
</blockquote>

<blockquote class="callout callout-ref">
<p><strong>This moved up from my horizon list.</strong> I had this as a watch item because I could not confirm it had shipped. Its roadmap entry now reads <em>Launched</em>, so it gets a proper section.</p>
</blockquote>

📖 [M365 Roadmap 564910](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=564910) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 38. Classic Outlook gained direct Copilot settings

*For: Classic Outlook for Windows · Rolling out July 2026 · Late catch-up*

Classic Outlook for Windows gained a direct place to find and adjust **Copilot settings**. Users no longer had to leave Outlook or depend on a separate route to manage the Copilot experience.

Microsoft's public June roundup described the rollout but did not include a feature-specific screenshot of the settings surface. I am leaving this section text-only rather than using a generic Classic Outlook image that shows a different feature.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Classic Outlook still carries a huge amount of day-to-day work. Giving those users the same obvious settings path removes one more difference between the classic and newer clients.</p>
</blockquote>

📖 [M365 Roadmap 561491](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=561491) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 39. Word added Anthropic model choice for editing

*For: Copilot in Word (Web) · Announced June 2026 · Generally available 11 August 2026 · Late catch-up*

Word added **model choice** for document editing, including supported **Anthropic models**. Users could choose a model before asking Copilot to rewrite, summarise, restructure or refine the document.

The feature is about control over the editing approach, not just access to another model name. If the first model is not finding the right tone or structure, the user can change the model without moving the document into another tool.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Writing quality is subjective. Model choice gives the person holding the document another way to find the right voice and structure without starting the editing session again.</p>
</blockquote>

<blockquote class="callout callout-warn">
<p><strong>Timing correction:</strong> Microsoft announced this in the June roundup, but the <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes">release notes</a> place general availability in the <strong>11 August 2026</strong> batch, <strong>for Word on the web</strong>. If you read the June announcement as "available now", that was early.</p>
</blockquote>

📖 [M365 Roadmap 558440](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558440) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

## 40. Copilot Catchup shows what changed in a document

*For: Copilot in Word · Rolled out June 2026 · Late catch-up*

**Copilot Catchup** appeared as a document content card that summarised what had changed since the user last opened the file. Instead of reading the whole document again, the user could begin with a focused update.

That is especially useful in shared documents where several people edit between reviews. Catchup answers the first question most people have when they return: *what changed while I was away?*

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The expensive part of collaborative writing is often reloading the context. A concise change summary gets the reviewer back to the decision much faster.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-36-word-catchup.webp" alt="Official Microsoft image of a Word document with a Catch up control, a document summary card and a Copilot option to catch the user up on the document." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 489825](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=489825) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 41. Word can generate an image for the document

*For: Copilot in Word · Rolled out June 2026 · Late catch-up*

Copilot could **generate an image for a Word document** — the official example asks for a KPI dashboard visual and shows the result placed under the matching heading.

The workflow has a step worth knowing about. In the walkthrough Microsoft published, image generation is not part of **Edit with Copilot**. You leave the editing flow, ask Copilot Chat for the image, then insert it into the document using the **+** control. The generation and the placement are two deliberate actions, not one.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> An illustration is only useful when it lands in the right place. Generating it inside Word still beats a round trip through a separate image tool — just do not expect the editing pane to do it for you.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Copilot in Word help](https://support.microsoft.com/en-us/copilot-word)

## 42. Agentic editing reached Word on iPhone and iPad

*For: Copilot in Word on iOS · Rolled out June 2026 · Late catch-up*

Word's agentic Copilot editing reached **iPhone and iPad**, so users could draft, add and refine document content from iOS. The core editing flow no longer depended on returning to a desktop first.

Microsoft later published a Word for iPad example showing a user reviewing and applying Copilot edits directly in the document. The image below is iPad-specific; the June roundup described the broader iOS rollout.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Mobile editing is usually where small changes wait until later. Bringing the Copilot edit-and-apply loop to iOS lets the document move while the reviewer is away from the desk.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Co-create documents with Copilot in Word for iPad](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/co-create-documents-with-copilot-in-word-for-ipad/4534191)

## 43. Word preserves Copilot Chat history

*For: Copilot Chat into Word · Rolled out June 2026 · Late catch-up*

Word could preserve the **Copilot Chat conversation history** when the user moved from chat into the app. A multi-step document task could continue without losing the instructions, decisions and earlier responses that shaped it.

Microsoft's June roundup described the continuity but did not publish an exact screenshot of the hand-off. This section stays text-only rather than using a generic Word Copilot image that cannot prove conversation history was preserved.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The conversation often contains the real brief. Keeping it attached to the document avoids the frustrating reset where the user has to explain the task again.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 44. Word can apply edits requested in comments

*For: Copilot in Word + document comments · Rolled out June 2026 · Late catch-up*

Copilot could reason over feedback written in **document comments** and apply the requested changes to the document. The user did not have to work through every comment manually and translate each one into an edit.

This is more specific than general Edit with Copilot. The source of the instruction is the review comment already attached to the document, which keeps the revision tied to the feedback that triggered it.

It sits alongside the rest of Word's review tooling. Copilot's edits can be made with **Track Changes** on, so each one arrives as a reviewable revision rather than a silent rewrite, and it can help **manage the comments themselves** — summarising a thread, drafting a reply, or resolving a comment once the edit is made.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Comments are where collaborative documents slow down. Turning a clear review comment into the corresponding edit shortens the loop between feedback and the next version — and keeping it inside Track Changes means nobody has to take the result on trust.</p>
</blockquote>

Microsoft has published general Word editing screenshots, but I found no official image that visibly proves a comment was the instruction source. Under-representation is better than a misleading screenshot.

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 45. PowerPoint gained an admin-approved Brand Kit Picker

*For: Copilot in PowerPoint + organisational brand assets · Rolled out June 2026 · Late catch-up*

The **Brand Kit Picker** let users choose an **admin-approved brand kit** while building a presentation with Copilot. The deck could begin with the organisation's approved visual identity instead of using a generic theme.

This is the user-facing control that connects Copilot to the brand system administrators have already prepared. It gives the person creating the deck a clear choice without asking them to understand where the template is stored.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Brand compliance is easiest when the approved choice appears at the moment the deck is created. The picker makes the right starting point obvious instead of relying on a clean-up checklist later.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 46. PowerPoint skills make repeatable deck work reusable

*For: Copilot in PowerPoint · Rolling out August 2026 · Late catch-up*

PowerPoint gained **Copilot skills** for repeatable presentation tasks. Instead of recreating the same long instruction for every deck, a team could save the working method as a skill and call it again.

Microsoft's support experience shows custom skill files appearing from a user's **OneDrive skills folder**, with controls to open the folder and refresh the available set. That gives the reusable instruction a simple home rather than hiding it inside an old chat.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The best presentation prompt is rarely a one-off. Skills let a team preserve the way it reviews, restructures or formats a deck so the next person does not have to rediscover it.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/official-13-ppt-custom-skills.webp" alt="Official Microsoft image of the Manage skills pane in Copilot for PowerPoint, showing custom skills named audience-adapter and storytelling-coach with their toggles switched on." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the July roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Microsoft's July 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332) · [Copilot in PowerPoint skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills)

## 47. PowerPoint referencing SharePoint libraries and OneDrive folders

*For: Copilot in PowerPoint · Announced June 2026 · Official status conflicting · Late catch-up*

When creating a presentation, Copilot should be able to reference a **SharePoint library** or a **OneDrive folder**, not only one individual file. The deck would be grounded in the collection of material the user pointed to.

That matters when the source is a project folder or team library rather than a carefully prepared brief. Copilot can work from the existing content set instead of making the user select and attach every file one by one.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Real projects live in folders, not perfect source documents. Folder and library references reduce the manual work of assembling the context before PowerPoint can begin.</p>
</blockquote>

<blockquote class="callout callout-warn">
<p><strong>Microsoft's own sources disagree, so treat this as unconfirmed.</strong> The <a href="https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&amp;searchterms=555894">roadmap entry (555894)</a> reads "You can now" and gives general availability as June 2026, while simultaneously carrying an <em>In development</em> status - and its two siblings do the same. No current support page I can find confirms folder or library references have shipped. So I am not going to tell you it has.</p>
</blockquote>

I found no official screenshot that visibly proves the selected source is a SharePoint library or OneDrive folder, so this section stays text-only.

📖 [Roadmap 555894](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555894) · [555895](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555895) · [555897](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555897) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Copilot in PowerPoint skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills)

## 48. Excel skills package repeatable workflows

*For: Copilot in Excel · Prebuilt skills GA on Web, Windows and Mac · Custom skills Insiders-only in June · Late catch-up*

Excel gained **skills** for recurring analysis, modelling and reporting work. A skill packages the instructions Copilot should follow so the workflow can be called again without rebuilding the full prompt.

The official interface shows skill groups such as **Custom skills**, **Finance** and **Formatting** that can be enabled when needed. Skills can hold both general working methods and specialised team instructions.

Two different availability stories sit behind that one screen, and they are worth separating. **Prebuilt skills** were generally available on **Web, Windows and Mac**. **Custom skills** were still **Insiders-only on Windows and Mac** in June, with general availability planned for the following month.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Repetition is where spreadsheet work becomes expensive. A reusable skill turns the trusted process into something the whole team can invoke, not a prompt only one person remembers.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 49. Excel Personalization remembers how you work

*For: Copilot in Excel · Rolled out June 2026 · Late catch-up*

Excel **Personalization** let users save standing preferences for how Copilot should work across workbooks. Examples include currency formats, date formats, naming conventions, formulas, PivotTables and report styles.

These are personal working preferences rather than rules attached to one file. Once saved, Copilot can apply the same choices without making the user repeat them in every prompt.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Small preferences create a lot of rework when they are ignored. Remembering them makes Copilot feel more consistent and lets the user spend the prompt on the analysis instead of formatting instructions.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 50. A `.Rules` sheet keeps workbook-specific standards

*For: Copilot in Excel + a specific workbook · Rolled out June 2026 · Late catch-up*

{{< margin >}}Personalization follows the person. A `.Rules` sheet follows the file.{{< /margin >}}

A workbook could hold its own guidance in a **`.Rules` sheet**. The sheet can describe structure, formatting, naming, formula conventions and examples that Copilot should follow when editing that file.

Unlike Personalization, these rules travel with the workbook. Everyone using Copilot in that file gets the same local standards, even when their personal preferences differ.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Some rules belong to the person; others belong to the workbook. Keeping file-specific standards inside the file makes consistency a shared property rather than tribal knowledge.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 51. Researcher lets users choose models and modes

*For: Researcher agent in Microsoft 365 Copilot · Rolled out June 2026 · Late catch-up*

For eligible users, Researcher added model and mode choices directly in the Copilot conversation. Microsoft's support experience shows **Auto/Critique**, **Model Council**, **GPT** and **Claude** paths; Claude requires admin-enabled Anthropic access, and the new Auto and Model Council features require Frontier.

Auto uses GPT responses refined by Claude; Model Council combines GPT and Claude deep reasoning; the GPT and Claude choices let the user select one provider's deep-reasoning path directly.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Research tasks vary. Sometimes the user wants automatic orchestration; sometimes they want one model or a multi-model critique. Putting the choice inside Researcher keeps that decision close to the task.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Use model choice in the Researcher agent](https://support.microsoft.com/en-us/office/use-model-choice-in-the-researcher-agent)

## 52. Planner Agent adds task cards and plan management

*For: Planner Agent in Microsoft 365 Copilot · Rolled out June 2026 · Late catch-up*

Planner Agent could return **interactive task cards** and help people prioritise work across Planner plans. From natural language, users could create or update tasks and ask the agent to build a structured plan with **goals and buckets**.

The official example shows a draft campaign plan with dated tasks and a **Save plan** action. The conversation is not only describing the plan; it is preparing Planner work the user can review and save.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A plan becomes useful when the work is structured, dated and ready to assign. Planner Agent shortens the distance between discussing the project and having a real plan to manage.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-48-planner-agent.webp" alt="Official Microsoft image of Planner Agent showing a draft marketing plan with goals, dated task cards, task controls and Save plan." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [M365 Roadmap 516576](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=516576) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 53. The Cost Management Dashboard covers the full spend workflow

*For: Microsoft 365 admin center + usage-based Copilot experiences · Rolled out June 2026 · Late catch-up*

I had covered Cowork's usage billing and spending limits, but not the complete **Cost Management Dashboard** workflow. Administrators could create group **spending policies** and limits, monitor **Copilot Credits** consumption, and work across both **prepaid credits and pay-as-you-go billing**.

Two details are easy to get wrong. A spending policy controls **who can spend and how much** — it does **not** allocate or reserve credits for that group. And prepaid and pay-as-you-go are not an either/or choice: **prepaid capacity is consumed first**, and once it is exhausted, usage continues through pay-as-you-go.

The same surface includes reporting, budgets, alerts and hard caps. The overview shows total credits, prepaid and pay-as-you-go use, active users, requests for increases and policies nearing their limits.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Consumption billing needs more than a monthly total. The dashboard gives admins the controls to decide who can spend, how much they can spend and what happens before the budget is exceeded.</p>
</blockquote>

<p><img src="/images/blog/copilot-august-2026/june-49-cost-management.webp" alt="Official Microsoft image of the Microsoft 365 admin center Cost management overview showing total Copilot Credits used, prepaid capacity pack credits, pay-as-you-go credits, active users, and top actions for credit requests and policies near their spending limit." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the June roundup. UI and availability may vary by tenant and rollout.</em></p>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 54. A team-level view of Copilot credit spend

*For: Viva Insights · Copilot Analytics · Rolled out July 2026 · Late catch-up*

Copilot Analytics in **Viva Insights** gained a view of **AI spend - Copilot credit usage - at group and team level**, rather than only tenant-wide totals. The services in scope are **Cowork and the Work IQ API**, and it appears both as a dashboard and in Advanced insights.

Access is narrower than "any admin": Microsoft scopes the dashboard experience to **managers with at least five direct reports**, alongside Insights Analysts and Global Administrators.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A single tenant-wide credit number tells you almost nothing useful. It cannot tell you whether spend is concentrated in one team doing something genuinely valuable or spread thinly across people experimenting once and never returning. Breaking it down by team is what turns a bill into a decision.</p>
</blockquote>

<blockquote class="callout callout-ref">
<p><strong>This moved up from my horizon list, and corrects an error.</strong> I previously wrote that I could not find a matching roadmap entry for it. That was wrong - it is roadmap 566302, and it now reads <em>Launched</em>.</p>
</blockquote>

📖 [M365 Roadmap 566302](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=566302) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 55. Agent metrics support custom adoption reporting

*For: Viva Insights Analysts · Public preview stated for July 2026 · Broader availability stated for September 2026 · Late catch-up*

Microsoft said **agent metrics for custom reporting** would be available to Insights Analysts. They could combine granular agent usage with organisational context and build reports beyond the predefined dashboards.

The official workbench shows a custom Agent query with metrics such as **agent responses generated**, **Copilot Credits used for agents** and returning-agent-user measures over selected time periods.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A fixed dashboard answers the common question. Custom agent metrics let analysts test the question their organisation actually has: which agents are returning value, where adoption is sticking and what usage costs.</p>
</blockquote>

📖 [M365 Roadmap 562412](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562412) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 56. Organizational Messages reached hybrid-joined devices

*For: Microsoft 365 admin center + Microsoft Entra hybrid-joined devices · Rolled out June 2026 · Late catch-up*

**Organizational Messages** added support for devices joined to both on-premises Active Directory and Microsoft Entra ID. Admins could extend targeted in-product communications to more users in hybrid identity environments.

Microsoft Learn confirms that hybrid-joined devices are supported, but the public screenshot is a general Organizational Messages landing page rather than evidence of this exact device-support change. I am keeping the section text-only.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Adoption messages only work when they reach the actual device estate. Hybrid support closes a practical gap for organisations that have not moved every Windows device to cloud-only join.</p>
</blockquote>

📖 [M365 Roadmap 503564](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=503564) · [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) · [Organizational Messages in Microsoft 365](https://learn.microsoft.com/en-us/microsoft-365/admin/misc/organizational-messages-microsoft-365?view=o365-worldwide)

## 57. Admins can control Copilot Vision screen and camera sharing

*For: Microsoft 365 Copilot admin controls · Rolled out June 2026 · Late catch-up*

Admins gained control over whether users can share their **screen** or **camera** with Copilot Vision, rather than treating Vision as one all-or-nothing switch.

The panel in Microsoft's June article shows **All users** and **No users** choices for screens and cameras, plus guidance to use policy management when the control needs to apply to a specific group.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Screen and camera input can expose very different kinds of context. Being able to scope Vision lets an organisation decide where it fits their data policy instead of making one blunt decision for every scenario.</p>
</blockquote>

<blockquote class="callout callout-warn">
<p><strong>Check this one against your own tenant.</strong> Microsoft's current documentation describes a single combined <strong>Screen and camera sharing</strong> setting under Copilot actions, on by default - not the two independently scoped controls the June article implied. I have not been able to reconcile the two, so treat the granularity as unconfirmed. <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-page#vision-in-microsoft-365-copilot">Current Learn documentation</a>.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

## 58. Microsoft Purview controls now cover Cowork

*For: Microsoft Purview + Copilot Cowork · Rolled out June 2026 · Late catch-up*

Microsoft Purview coverage extended to **Cowork interactions**. The June roundup listed sensitivity-label inheritance and display, audit logging, DSPM Activity Explorer, Insider Risk, eDiscovery, Data Lifecycle Management and Communication Compliance.

The official image shows Cowork interaction records inside **DSPM Activity Explorer**, with a selected AI Interaction and detailed user, app and response information on the right.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Cowork may act for longer and touch more systems than a normal chat. Extending the same Purview tools gives security and compliance teams a familiar way to see, investigate and govern those interactions.</p>
</blockquote>

📖 [Microsoft's June 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)

---

## On the horizon - three to watch

Three items from Microsoft's June roundup are not in the catch-up list above. They are not there because I did not miss them — I had already mentioned each one as a future or watchlist item rather than skipping it. All three still carry an **In development** status on Microsoft's roadmap, which is why they are here rather than numbered above. Here is what Microsoft's June article said about each:

- **Dataverse grounding in Copilot Chat** - public preview in June, general availability in September. [Roadmap 560539](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560539)
- **Deep citations** - described as a June rollout. My July recap still had it on the horizon list, so the two do not agree. [Roadmap 523223](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=523223)
- **Suggested edits in Copilot Pages** - described as a June rollout. [Roadmap 562351](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562351)

**Two items left this list.** *Outlook emails as Notebook references* and the *team-level Copilot Credits dashboard* both now read **Launched** on the roadmap, so they have moved up into proper numbered sections above. That is the intended path for everything on this list.

I would rather list these as things to watch than give them a status I cannot currently stand behind. As each one is confirmed, it will get a proper numbered section in a later issue.

---

## How this issue was put together

Microsoft's own August roundup had not published when this went out. Rather than wait for it, sections **1 to 26** cover everything I could verify from Microsoft's [official July roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332), published on **31 July 2026**, and the sources it links to. Each one keeps the month Microsoft stated, so you can tell what is landing now from what landed earlier. Anything Microsoft's August roundup adds will go into the September issue.

Sections **27 to 58** are a **late catch-up**. A strict comparison against Microsoft's [official June roundup](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572) found **29 capabilities I had not materially covered**, plus **one Cost Management item I had only covered partially** and **two items I had listed only as things to watch** that have since launched. They are catch-up items from June's announcements, not August news, and none of them are relabelled as August. A few have since shipped in July or August, and where that is true the section carries the later date. The three items listed just above appeared only in my horizon section, so they are tracked there rather than numbered here.

**About the roadmap numbers.** Where I could match a section to a Microsoft 365 Roadmap entry, the number is linked at the end of that section. Treat it as a pointer to Microsoft's own record, not as proof of what is live in your tenant — roadmap status lags reality in both directions. Section 22 is the clearest example: its roadmap entry still reads *Launched* even though Microsoft withdrew the feature on 4 August 2026.

---

## Official Microsoft resources

- [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)
- [Microsoft 365 Roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap)
- [Microsoft 365 Copilot Blog board](https://techcommunity.microsoft.com/category/microsoft365copilot/blog/microsoft365copilotblog)
- [What's New in Microsoft 365 Copilot - July 2026](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--july-2026/4538332)
- [What's New in Microsoft 365 Copilot - June 2026](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)
- [Update: Domain Exclusion for Microsoft 365 Copilot](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/update-domain-exclusion-for-microsoft-365-copilot/4543648)

---

## Keep reading

- **Past recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/)
- **Go deeper:** [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/) · [Copilot Cowork complete guide](/blog/microsoft-copilot-cowork-complete-guide/) · [Work IQ API](/blog/microsoft-work-iq-api-day-1-ga/) · [Copilot vs Agents vs Copilot Studio](/blog/copilot-vs-agents-vs-copilot-studio/) · [Agent Builder explained](/blog/m365-agent-builder-explained/)
