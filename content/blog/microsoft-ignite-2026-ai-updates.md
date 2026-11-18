---
title: "Microsoft Ignite 2026: AI Updates, Explained"
list_title: "Microsoft Ignite 2026 — AI, Copilot and Agents"
hub_id: "whats-new"
description: "Microsoft Ignite 2026 AI updates explained: Copilot, Agent 365, FinOps, Microsoft IQ, Foundry and Windows, with release stages and official demos."
date: 2026-11-18
lastmod: 2026-11-18
draft: false
card_tag: "What's New"
tag_class: "ai"
images: ["images/og/blog/microsoft-ignite-2026-ai-updates.jpg"]
og_headline: "Ignite 2026 — AI, Explained"
og_glyph: "calendar"
tags:
  - microsoft-ignite
  - copilot
  - copilot-studio
  - microsoft-foundry
  - agents
  - security
  - ai
  - news
faq:
  - question: "What are the main AI announcements at Microsoft Ignite 2026?"
    answer: "The opening announcements connect Copilot and Office, Microsoft IQ business context, Foundry agent improvement, Agent 365 governance, AI cost management and Windows hybrid AI. Home is rolling out; Office in Copilot is GA. Business Analytics is Frontier, with separate licensing and estimated-value boundaries. Today is a Frontier private preview and Copilot Code GA is planned for December."
  - question: "When is Microsoft Ignite 2026, and what does this recap cover?"
    answer: "Microsoft Ignite runs 17–20 November 2026 in San Francisco and online. This article covers public AI announcements checked through 18 November 2026 at 14:17 NZDT, equivalent to 01:17 UTC. It is an opening-announcements snapshot, not a completed four-day event recap."
  - question: "Are Copilot Code, Today and Autopilot generally available?"
    answer: "Not all three. At this cutoff, Copilot Code is in Frontier with GA planned for December. Today is a Frontier private preview. Autopilot is beginning its Frontier rollout. None of those labels means every Microsoft 365 Copilot customer already has access."
  - question: "Does Microsoft IQ mean every integration is generally available or included?"
    answer: "No. Microsoft IQ connects Work IQ, Fabric IQ, Foundry IQ and Web IQ, but the availability, licensing and consumption rules of individual integrations still apply. For example, Work IQ ERP grounding and some governance controls are preview, as is the Fabric database integration with Copilot Managed Runtime."
  - question: "Are the images and demos tenant tests?"
    answer: "No. The product screenshots, animations and videos in this article come from Microsoft's official announcements. They illustrate Microsoft's announced experiences, not tests performed in my tenant. Examples in the text are hypothetical."
layout: "notebook"
stamp: "ignite 2026 · opening announcements"
intro_note: "↗ what changed, who it helps, and what is actually available"
founder_note: |
  The useful question after a keynote is not “How many things were announced?” It is “Which part changes the work I do?”

  My read of Ignite so far: Microsoft is joining up the places where people ask for work, the context agents need, and the controls IT needs around them. That is more useful than another list of model names. But the release labels matter. A feature in a keynote can still be a private preview, a December release or a rollout that has only just started.

  I’ve put my seven favourites first. After that, I’ll go through Copilot, Copilot Studio, Agent 365 and AI cost management, then the rest. Foundry and Fabric are at the end.
sitemap:
  priority: 0.7
---

**Coverage checked through 18 November 2026, 14:17 NZDT / 01:17 UTC.** [Microsoft Ignite runs 17–20 November](https://news.microsoft.com/events/ignite/2026/book-of-news/), so this is the opening-announcements snapshot, not the finished event recap.

Source details and official media were rechecked later on **18 November**. Those later checks do not turn a planned release into an available feature or extend this into a recap of the remaining event days.

The [November Copilot issue](/blog/microsoft-365-copilot-november-2026-updates/) covered the changes since our previous issue. This event article goes wider: Copilot, business applications, Microsoft IQ, Foundry, Azure, security and Windows. Where a product was announced earlier, the important bit here is the **new capability or release-stage change**, not a second launch.

**My Ignite favourites:** [Today](#today) · [Copilot on Windows](#windows-local) · [Cowork apps](#cowork-apps) · [Cowork Auto effort](#cowork-auto) · [Autopilot](#autopilot) · [Office in Copilot](#office) · [Multi-tenant agent and spend management](#multi-tenant-ai).

Release stages below follow Microsoft's announcements, not observed tenant access. **GA does not mean rollout has finished everywhere; Frontier is Copilot's early-access programme, not general access.** Licensing, billing, region, administrator settings and supported hardware still apply.

## 1. Today prepares priorities and proposed next steps {#today}

*For: People trying to stay on top of mail, meetings and follow-ups.*

Today brings priorities from mail, calendar, Teams and meetings into Copilot and Outlook. It can prepare drafts and proposed actions for review, rather than waiting for a prompt each time.

A hypothetical morning might show a decision waiting on you, the relevant conversation and a draft reply. **Prepared is not the same as approved.** That review point is the part I would keep front and centre.

There are two billing distinctions: the daily **Today Brief** refresh is included with a Microsoft 365 Copilot licence; recurring **Today Feed** updates during the day require Copilot Credits.

**Why it matters:** I like this because the morning triage is often the work. If Today can put a decision, the source thread and a draft in front of me, I can spend my time deciding what to do. I still want the final say before anything goes out.

**Status:** **Frontier private preview**; Microsoft says the design may change.

📖 [Today experience](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945) · [Brief and Feed billing distinction in the Book of News](https://news.microsoft.com/events/ignite/2026/book-of-news/).

<details open>
<summary>View Microsoft's Today preview animation</summary>
<figure>
<img src="/images/blog/ignite-2026/today.gif" alt="Official Today preview animation showing priority cards, a schedule and a source conversation for a launch-storyboard decision." width="999" height="562" loading="lazy" decoding="async" />
<figcaption>Microsoft's preview design, not proof of tenant availability. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">Today in Home</a>.</figcaption>
</figure>
</details>

<!-- ignite-reviewed-video:today -->
<details open>
<summary>Watch official videos (1)</summary>

<p>Official video: <a href="https://medius.microsoft.com/Embed/video-nc/8f3c44a2-14e8-404e-9ea3-15aafd489c4d">Today Brief in Outlook</a>. Frontier private-preview design; Brief and Feed billing differ as explained above. <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226">Read the product announcement or documentation</a>.</p>
</details>

<span id="windows"></span>

## 2. Copilot on Windows gets local context and actions on Copilot+ PCs {#windows-local}

*For: Windows users and the admins piloting AI on their PCs.*

Microsoft is showing local file operations and read-only PC diagnostics, with more work routed between on-device and cloud models. People who opt in can also reach Copilot from the new Windows Search, rather than opening a separate app first.

For example, you might ask for files to be organized or for help understanding a PC problem. A read-only diagnostic scan is different from permission to change the machine.

**Why it matters:** This is the Windows change I’d try first. A messy Downloads folder is an easy test: can Copilot find the right files without making me hunt for them? I’d try that on a spare folder before asking it to move anything important.

**Status:** **Preview/coming soon**, with the Windows post specifying Copilot+ PCs for the local capabilities. Opt-in, policy and hardware requirements apply. The sources do not justify assuming every Windows PC has them today.

📖 [Windows announcement and local capability limits](https://blogs.windows.com/windowsexperience/2026/11/17/microsoft-ignite-2026-building-windows-for-the-next-era-of-work/).

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;">
<iframe src="https://www.youtube-nocookie.com/embed/R6WkUkvIcC8" title="Windows at Work: File management with Copilot and Windows Hybrid Intelligence" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>
</div>

*Official Windows demo: [File management with Copilot](https://www.youtube.com/watch?v=R6WkUkvIcC8).*

<!-- ignite-reviewed-video:windows-local -->
<details open>
<summary>Watch official videos (1)</summary>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/1TVVgqdlWOg" title="Demo: PC Troubleshooting with Copilot and Windows Hybrid Intelligence" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube.com/watch?v=1TVVgqdlWOg">Demo: PC Troubleshooting with Copilot and Windows Hybrid Intelligence</a>. Preview/coming-soon illustration with hardware and policy requirements, not a repair performed here. <a href="https://blogs.windows.com/windowsexperience/2026/11/17/microsoft-ignite-2026-building-windows-for-the-next-era-of-work/">Read the product announcement or documentation</a>.</p>
</details>

## 3. Build an app in Cowork that your team can keep using {#cowork-apps}

*For: Teams that keep rebuilding the same tracker, dashboard or simple internal tool.*

The new part at Ignite is general availability, not the first announcement. Describe the app you want in Cowork, or turn the result of a Cowork task into an app. You can review it, then publish and share it with colleagues. Published apps run in your tenant on Copilot Managed Runtime, where IT can see and manage them in the Microsoft 365 admin center. The [separate Fabric storage integration](#managed-runtime) is still in preview.

**Why it matters:** I’d start with a tracker someone rebuilds every Friday. A shared app gives the team one place to update it instead of another copy to reconcile. I’d name an owner and test sharing before making it the team’s default.

**Status:** Cowork app building is **GA**; Microsoft announced the managed runtime as **GA and beginning tenant rollout**.

📖 [Cowork app building at Ignite](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-copilot-cowork-at-ignite-2026/4572242) · [The runtime launch and Cowork sample app](https://techcommunity.microsoft.com/blog/copilot-managed-runtime-blog/copilot-managed-runtime-is-now-generally-available-with-additional-new-preview-f/4571846).

<p>Official video: <a href="https://medius.microsoft.com/Embed/video-nc/0678b5de-ee3a-42d3-a6cc-4dc832d5b869">Watch Microsoft's sample Cowork show-floor app</a>. It uses simulated event data; the demo’s Fabric storage is a separate preview.</p>

## 4. Cowork Auto adjusts effort and chooses models for each step {#cowork-auto}

*For: People delegating more complicated work to Cowork.*

Auto in Cowork uses Microsoft-Decision-1.1 to choose how much reasoning each step needs. You can still set the effort yourself. Microsoft describes dividing complicated work among subagents, selecting models for those parts, then bringing the results together.

For example, a comparison of several proposals may need more work than a short email draft. The aim is to avoid making the user choose a model and effort level for every step. That is a routing feature, not a promise that every answer is correct or cheaper.

There is a second handover: **proactive recommendations** use Work IQ signals from email, meetings and Teams to suggest a task worth delegating. These are Frontier, separate from the GA Chat-to-Cowork recommendation in Home. A suggestion to prepare for a meeting is not permission to send its follow-up.

Planner and Viva Engage plugins are also GA. Planner already appeared in our November issue; the change here is Microsoft's explicit GA confirmation, not its first announcement.

**Why it matters:** I don’t want to pick a model before I know how hard the job is. Auto can make that first call, while I keep manual control and check the evidence before using the result.

**Status:** Auto improvements and proactive recommendations **Frontier**; Planner/Viva Engage plugins **GA**. Cowork in GCC **begins rolling out in November**, not across every government cloud. Browser actions have their own licensing and stages [below](#edge).

📖 [Cowork's feature-by-feature Ignite announcement](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-copilot-cowork-at-ignite-2026/4572242).

<!-- ignite-reviewed-media:cowork-auto -->
<details open>
<summary>View official images and animations (3)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-002-cowork-auto.gif" alt="Cowork composer has an Auto Medium dropdown and Try these next recommendation cards for a report, replies and a PowerPoint pitch; this frame does not show browser automation." width="1200" height="705" loading="lazy" decoding="async" />
<figcaption>Cowork composer has an Auto Medium dropdown and Try these next recommendation cards for a report, replies and a PowerPoint pitch; this frame does not show browser automation. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-011-cowork-auto.png" alt="Cowork response lists parallel background tasks with different model labels, then an Excel workbook output card." width="2567" height="1685" loading="lazy" decoding="async" />
<figcaption>Cowork response lists parallel background tasks with different model labels, then an Excel workbook output card. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-copilot-cowork-at-ignite-2026/4572242">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-012-cowork-auto.gif" alt="Cowork composer shows a Try these next recommendation to prepare for a Contoso meeting and a Start task button." width="1128" height="696" loading="lazy" decoding="async" />
<figcaption>Cowork composer shows a Try these next recommendation to prepare for a Contoso meeting and a Start task button. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-copilot-cowork-at-ignite-2026/4572242">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 5. Autopilot moves from announcement into a Frontier rollout {#autopilot}

*For: People exploring ongoing delegated work, and the admins governing it.*

Autopilot is a proactive personal agent with its own identity, memory and tools. The change since our November issue's unresolved timing is Microsoft's Ignite confirmation that the **Frontier rollout is starting**, with access and activity tracking from Home.

For example, you could delegate a bounded follow-up process, then inspect what it did and where it needs input. My first question would be “What may it do without asking?” before “How much can it automate?”

Automations, separately GA, is the Home view for managing scheduled and ongoing Chat and Cowork tasks. It is not another name for Autopilot.

Microsoft's current FAQ lists Copilot and Agent 365 entitlements, a usage-based billing policy and administrator enablement after access is granted. Autopilot work consumes Copilot Credits.

**Why it matters:** The difference for me is continuity: an agent can keep a weekly follow-up moving after I close the chat. I’d start with one narrow job and check what it can do, what needs approval and how to stop it.

**Status:** Autopilot **rolling out in Frontier**, not universal availability.

📖 [Autopilot and Automations in Home](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945) · [Autopilot access and billing FAQ](https://www.microsoft.com/en-us/copilot/features/autopilot).

<figure>
<img src="/images/blog/ignite-2026/autopilot.png" alt="Microsoft's demonstration Autopilot named Atlas shows a readiness update and an instruction to arrange a meeting while leaving the rollout decision with the user." width="999" height="562" loading="lazy" decoding="async" />
<figcaption>Microsoft's Autopilot demonstration shows the user retaining the rollout decision. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">Home announcement</a>; not a tenant capture.</figcaption>
</figure>

## 6. Office files can be created and edited inside Copilot {#office}

*For: People making documents, spreadsheets and presentations.*

Office in Chat and Cowork is now GA. You can create editable Word, Excel and PowerPoint files inside the Copilot app, edit them directly or with prompts, and coauthor with colleagues. Files are saved in OneDrive.

Imagine asking for a supplier tracker, then editing the actual workbook with your team rather than copying a table out of chat. The benefit is the **working file**, not just a convincing-looking answer. You still need to check formulas, facts and sharing before relying on it.

**Why it matters:** This is the one I can explain without saying AI. You go from a conversation to a file you and your team can actually edit. I’d still check the workbook’s formulas before it becomes the version everyone uses.

**Status:** **GA**.

📖 [In-app creation, editing and coauthoring in Microsoft's Office announcement](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226).

The [SharePoint and OneDrive Ignite post](https://techcommunity.microsoft.com/blog/spblog/sharepoint-and-onedrive-at-microsoft-ignite-2026-putting-ai-powered-content-to-w/4535416) also highlights comparing spreadsheets, organizing folders, creating HTML reports and saving personal skills in OneDrive. Those capabilities were already announced on [20 October](https://techcommunity.microsoft.com/blog/onedriveblog/onedrive-just-got-a-major-upgrade-new-copilot-capabilities-simpler-sharing-and-s/4565995); they are not new Ignite launches. They make the same practical point: review the working files and their access, not just the answer in chat.

<details open>
<summary>View Microsoft's Office-in-Copilot animation</summary>
<figure>
<img src="/images/blog/ignite-2026/office.gif" alt="Official animation showing Copilot create a supplier-tracker workbook beside a conversation, with collaborators editing cells." width="999" height="562" loading="lazy" decoding="async" />
<figcaption>Official product animation from the <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">Home announcement</a>.</figcaption>
</figure>
</details>

<!-- ignite-reviewed-media:office -->
<details open>
<summary>View official images and animations (5)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-004-office.gif" alt="OneDrive Copilot panel displays an analysis request and a cited answer about traffic mix while the underlying file list is blurred." width="1066" height="600" loading="lazy" decoding="async" />
<figcaption>OneDrive Copilot panel displays an analysis request and a cited answer about traffic mix while the underlying file list is blurred. Announced 20 October, revisited at Ignite; not a new Ignite launch. Source: <a href="https://techcommunity.microsoft.com/blog/onedriveblog/onedrive-just-got-a-major-upgrade-new-copilot-capabilities-simpler-sharing-and-s/4565995">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-005-office.gif" alt="OneDrive Markdown editor displays How to Configure an AI Agent in a split source-code and rendered-document view." width="1066" height="600" loading="lazy" decoding="async" />
<figcaption>OneDrive Markdown editor displays How to Configure an AI Agent in a split source-code and rendered-document view. Announced 20 October, revisited at Ignite; not a new Ignite launch. Source: <a href="https://techcommunity.microsoft.com/blog/onedriveblog/onedrive-just-got-a-major-upgrade-new-copilot-capabilities-simpler-sharing-and-s/4565995">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-006-office.gif" alt="OneDrive HTML editor displays source code beside a rendered Solar System Explorer page showing Earth." width="854" height="480" loading="lazy" decoding="async" />
<figcaption>OneDrive HTML editor displays source code beside a rendered Solar System Explorer page showing Earth. Announced 20 October, revisited at Ignite; not a new Ignite launch. Source: <a href="https://techcommunity.microsoft.com/blog/onedriveblog/onedrive-just-got-a-major-upgrade-new-copilot-capabilities-simpler-sharing-and-s/4565995">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-007-office.jpg" alt="Excel workbook is open beside a Copilot conversation, with collaborator cell outlines and investment-appraisal formulas and assumptions in the grid." width="2488" height="1422" loading="lazy" decoding="async" />
<figcaption>Excel workbook is open beside a Copilot conversation, with collaborator cell outlines and investment-appraisal formulas and assumptions in the grid. Illustrative workbook figures, not measured savings or verified investment returns. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-008-office.png" alt="A PowerPoint sales-pitch presentation is open beside Copilot; the slide has charts and explicitly labels its numbers as illustrative figures." width="2222" height="1264" loading="lazy" decoding="async" />
<figcaption>A PowerPoint sales-pitch presentation is open beside Copilot; the slide has charts and explicitly labels its numbers as illustrative figures. Office editing example, not visual proof that a CRM plugin or writeback ran. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 7. Multi-tenant management brings agents and AI spend into one view {#multi-tenant-ai}

*For: Managed service providers and organisations with several Microsoft 365 tenants.*

The **All tenants** view in the Microsoft 365 admin center brings authorised tenants together. Tenant switching is GA. Cross-tenant agent management, AI cost management and desired-state configuration are public previews.

For example, a partner could compare agent availability across eligible customer tenants and reuse a spending-policy template instead of rebuilding it repeatedly. An enterprise could check configuration drift across subsidiaries. Central visibility does not remove tenant boundaries or grant access to another tenant.

Access depends on the appropriate **GDAP/delegated relationships**, roles and eligibility. Supported functionality also varies by licensing, geography and rollout.

**Why it matters:** If one subsidiary’s AI spend jumps, I’d rather start from one view and drill into that tenant than merge exports by hand. Shared visibility helps; the tenants and their permissions are still separate.

**Status:** Switching **GA**; agent, cost and configuration management **public preview**.

📖 [Multi-tenant capabilities, access model and availability](https://techcommunity.microsoft.com/blog/microsoft_365blog/multi-tenant-management-tenants-agents-and-ai-spend-in-one-place/4573372).

<!-- ignite-reviewed-media:multi-tenant-ai -->
<details open>
<summary>View official images and animations (5)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-077-multi-tenant-ai.png" alt="Admin center Your tenants dialog lists a governing tenant, governed demo tenants and pin controls over a multi-tenant dashboard." width="1908" height="883" loading="lazy" decoding="async" />
<figcaption>Admin center Your tenants dialog lists a governing tenant, governed demo tenants and pin controls over a multi-tenant dashboard. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft_365blog/multi-tenant-management-tenants-agents-and-ai-spend-in-one-place/4573372">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-078-multi-tenant-ai.png" alt="All tenants agents registry has agent-risk and ownerless filters and rows with published-tenant counts, users and sessions." width="1906" height="883" loading="lazy" decoding="async" />
<figcaption>All tenants agents registry has agent-risk and ownerless filters and rows with published-tenant counts, users and sessions. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft_365blog/multi-tenant-management-tenants-agents-and-ai-spend-in-one-place/4573372">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-079-multi-tenant-ai.png" alt="Sales Agent detail panel lists tenants with availability indicators and selected-tenant description, owner, deployment and security information." width="1912" height="886" loading="lazy" decoding="async" />
<figcaption>Sales Agent detail panel lists tenants with availability indicators and selected-tenant description, owner, deployment and security information. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft_365blog/multi-tenant-management-tenants-agents-and-ai-spend-in-one-place/4573372">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-080-multi-tenant-ai.png" alt="Multi-tenant configuration screen compares expected and actual Copilot settings, marks drifts and offers Fix Drifts; the page visibly says Preview." width="2833" height="1616" loading="lazy" decoding="async" />
<figcaption>Multi-tenant configuration screen compares expected and actual Copilot settings, marks drifts and offers Fix Drifts; the page visibly says Preview. Configuration management remains preview. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft_365blog/multi-tenant-management-tenants-agents-and-ai-spend-in-one-place/4573372">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-081-multi-tenant-ai.png" alt="All tenants Cost management Preview overview shows estimated spend, net value, policy limits, user limits and credit requests by tenant." width="750" height="348" loading="lazy" decoding="async" />
<figcaption>All tenants Cost management Preview overview shows estimated spend, net value, policy limits, user limits and credit requests by tenant. Multi-tenant cost-management preview; figures are illustrative. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft_365blog/multi-tenant-management-tenants-agents-and-ai-spend-in-one-place/4573372">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

<!-- ignite-reviewed-video:multi-tenant-ai -->
<details open>
<summary>Watch official videos (1)</summary>

<p>Official video: <a href="https://medius.microsoft.com/Embed/video-nc/43dcafae-9c6b-4f3d-8fb2-beb73199aa45">Multi-Tenant Management</a>. Multi-tenant feature stages above still apply. <a href="https://techcommunity.microsoft.com/blog/microsoft_365blog/multi-tenant-management-tenants-agents-and-ai-spend-in-one-place/4573372">Read the product announcement or documentation</a>.</p>
</details>


<span id="work"></span>

## 8. Home joins asking a question and delegating a task {#home}

*For: People using Microsoft Copilot for work.*

Home was announced in September, and our November issue already covered Home and combined history. Ignite confirms Chat and Cowork together at GA and adds the useful handover: Auto can recommend Cowork when a question becomes a larger task. **You choose whether to switch**, and relevant chat context goes with it.

For example, “What meetings do I have?” can stay a question. “Review next week's conflicts and propose a better schedule” is a task you might hand over. I like the distinction: ask for an answer, or delegate an outcome, without starting again in another conversation.

**Why it matters:** I’d use Chat for the quick answer and Cowork for the work that has to go somewhere. Carrying the context over means less re-explaining.

**Status:** Home is rolling out worldwide; Chat and Cowork together, including the recommendation handover, are **GA**.

📖 [Microsoft's Home announcement](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945).

<figure>
<img src="/images/blog/ignite-2026/chat-to-cowork.png" alt="Microsoft's Copilot recommendation card offers Stay in chat or Send to Cowork after a request to reorganize a calendar." width="999" height="562" loading="lazy" decoding="async" />
<figcaption>Microsoft's example of the choice to move a task to Cowork. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">Home announcement</a>; not a tenant capture.</figcaption>
</figure>

<!-- ignite-reviewed-media:home -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-001-home.gif" alt="Copilot home composer shows separate Chat and Cowork choices and shortcut chips for catch-up, projects, meeting prep and people search." width="1200" height="675" loading="lazy" decoding="async" />
<figcaption>Copilot home composer shows separate Chat and Cowork choices and shortcut chips for catch-up, projects, meeting prep and people search. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 9. Pages turn an answer into something your team can work on {#copilot-pages}

*For: People creating reports, briefs and interactive content with colleagues.*

Pages give Copilot's output a working canvas. Microsoft describes editable reports, dashboards and animations, with agents updating data in the background. You can collaborate directly or ask Copilot to refine the content.

Imagine turning research into a project brief, then updating it with your team rather than passing around separate chat responses. I would still check the sources and what is refreshing. A page that updates is not automatically a page that is right.

**Why it matters:** A brief your team can edit is easier to maintain than a chat answer copied into three places. I’d still assign someone to check what the Page refreshes.

**Status:** **Frontier Public**, not GA. This is the interactive Pages announcement, not a claim that every earlier Pages capability has just launched.

📖 [Pages in the Office Ignite announcement](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226).

<!-- ignite-reviewed-media:copilot-pages -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-010-copilot-pages.jpg" alt="Copilot displays an Onvexa Launch Hub page with collaborators, readiness and stock cards, navigation pills and a demand chart." width="3338" height="2240" loading="lazy" decoding="async" />
<figcaption>Copilot displays an Onvexa Launch Hub page with collaborators, readiness and stock cards, navigation pills and a demand chart. Interactive Pages example from the Office announcement, not a live dashboard tested here. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 10. OneNote can turn notes into an Office first draft {#onenote-office}

*For: People whose meeting notes need to become a document, spreadsheet or presentation.*

Copilot in OneNote can synthesize notes into Word, Excel and PowerPoint files. That is different from the Cowork notebook-reading support and Windows Capture covered in our November issue.

For example, after several planning meetings, you could ask for a project timeline in Excel or an FAQ in Word. The useful handover is from collected notes to an editable first draft. Check that the output preserves decisions, owners and dates rather than treating every note as an agreed action.

**Why it matters:** Turning the notebook into an editable first draft saves the retyping. It doesn’t turn tentative notes into agreed decisions.

**Status:** **Frontier Public**.

📖 [OneNote-to-Office creation in Microsoft's Office announcement](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226).

<!-- ignite-reviewed-media:onenote-office -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-009-onenote-office.png" alt="OneNote is blurred behind a Copilot panel asking for an executive summary; the progress list shows reading notes, mapping and creating a document." width="1366" height="854" loading="lazy" decoding="async" />
<figcaption>OneNote is blurred behind a Copilot panel asking for an executive summary; the progress list shows reading notes, mapping and creating a document. First-draft creation illustration, not a file created or checked here. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 11. Workspaces are for shared work; Projects keep your own context together {#workspaces}

*For: Teams with work that lasts longer than one chat.*

Copilot Workspaces evolve Notebooks into a shared place for context, people and working files. Suggested next steps, activity and live presence help a team see what changed and what remains open. This continues our November coverage: Workspaces remain Frontier, not GA, and the separate Office-in-Home announcement does not make every Workspace editing capability generally available.

Projects serve a related but different job: grouping your chats, Cowork tasks, instructions, sources and outputs. A launch team might share a Workspace, while you keep your own research conversations in a Project. Projects are not newly invented at Ignite; this shows how the pieces now fit in Home.

**Why it matters:** I’d put team decisions in a Workspace and keep my own research in a Project. The people who need the context decide which one fits.

**Status:** Workspaces in **Frontier**; Projects **GA**.

📖 [Workspaces and Projects explained by Microsoft](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945).

<figure>
<img src="/images/blog/ignite-2026/workspaces.png" alt="Official Fabrikam Launch Planning workspace showing a What's next card, activity, shared content and collaborator presence." width="999" height="562" loading="lazy" decoding="async" />
<figcaption>The shared Workspace view. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">Microsoft's Home announcement</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/projects.png" alt="Official Project Research screen with Recent, Outputs and Project context tabs and a list of related research conversations." width="999" height="562" loading="lazy" decoding="async" />
<figcaption>A Project groups related conversations and outputs; it is not the shared Workspace screen above. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/home-your-starting-place-for-work-in-the-microsoft-copilot-app/4573945">Microsoft's Home announcement</a>.</figcaption>
</figure>

<!-- ignite-reviewed-video:workspaces -->
<details open>
<summary>Watch official videos (1)</summary>

<p>Official video: <a href="https://medius.microsoft.com/Embed/video-nc/ae8b6624-a54c-488f-961e-5c07016592d3">Workspaces</a>. Frontier Workspace demonstration. <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/office-at-ignite-2026-from-apps-to-agentic-system-of-work/4572226">Read the product announcement or documentation</a>.</p>
</details>

## 12. Copilot Code has a December GA target {#copilot-code}

*For: People building internal trackers, dashboards and small applications.*

Copilot Code turns natural-language requirements into applications using the technology behind GitHub Copilot. Supported apps can be published through Copilot Managed Runtime.

A team might build a request tracker instead of passing a spreadsheet around. The important distinction is **building an app versus approving it for production**: access, data handling and maintenance still need an owner.

**Why it matters:** A team can sketch a tool close to the work it supports. I’d wait for the actual rollout before planning a production handover around Code.

**Status:** **Frontier** on Windows, web, iOS and Android; **GA planned for December**. The local sandbox is available on Windows and coming to macOS. Do not read the runtime's GA announcement as Code already being GA.

📖 [Copilot Code timing and platforms](https://news.microsoft.com/events/ignite/2026/book-of-news/).

## 13. Copilot Managed Runtime becomes the place to run those apps {#managed-runtime}

*For: Makers, developers and Microsoft 365 administrators.*

Copilot Managed Runtime supplies Microsoft-managed hosting, execution and lifecycle controls, regardless of which supported tool created the app. It is now GA and beginning its tenant rollout.

For a request tracker, the runtime hosts the application. An **optional Fabric database integration** stores its records. Those are different components and different release stages: that integration is **Frontier public preview**, with a Fabric licence and Copilot Credits billing required. Current Learn documentation limits the integration to a database backend; broader backend services are not all available through it today.

**Why it matters:** The hosting decision no longer has to dictate where you build. I’d check what the runtime governs and which storage option the app actually needs.

**Status:** Runtime **GA, rollout beginning**; Fabric integration **preview**.

📖 [Runtime launch](https://techcommunity.microsoft.com/blog/copilot-managed-runtime-blog/copilot-managed-runtime-is-now-generally-available-with-additional-new-preview-f/4571846) · [Fabric integration requirements and current limits](https://learn.microsoft.com/en-us/microsoft-365/copilot-managed-runtime/backend-integration/fabric-integration).

<p>Official Microsoft video: <a href="https://medius.microsoft.com/Embed/video-nc/e24fb5e0-b370-473b-b7a2-8847f356fdf0">Watch Copilot Managed Runtime architecture</a>. <a href="https://techcommunity.microsoft.com/blog/copilot-managed-runtime-blog/copilot-managed-runtime-is-now-generally-available-with-additional-new-preview-f/4571846">Read the product announcement</a>.</p>

<!-- ignite-reviewed-media:managed-runtime -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-014-managed-runtime.png" alt="App-data persistence prompt offers Fabric with Rayfin, SharePoint Lists, keeping data local, or describing another option." width="5752" height="2492" loading="lazy" decoding="async" />
<figcaption>App-data persistence prompt offers Fabric with Rayfin, SharePoint Lists, keeping data local, or describing another option. Fabric persistence is preview; it does not change the GA stage of core supported app deployment. Source: <a href="https://techcommunity.microsoft.com/blog/copilot-managed-runtime-blog/copilot-managed-runtime-is-now-generally-available-with-additional-new-preview-f/4571846">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

<!-- ignite-reviewed-video:managed-runtime -->
<details open>
<summary>Watch official video</summary>

<p>Official video: <a href="https://medius.microsoft.com/Embed/video-nc/ed46d25a-8c6b-4237-9f10-7a16c8b4bbc6">Copilot Managed Runtime: build anywhere</a>. Official product illustration; release stages above apply. <a href="https://techcommunity.microsoft.com/blog/copilot-managed-runtime-blog/copilot-managed-runtime-is-now-generally-available-with-additional-new-preview-f/4571846">Read the product announcement or documentation</a>.</p>

</details>

## 14. Teams agents can have their own identity and show their work {#teams-digital-teammates}

*For: Developers building agents that participate in Teams conversations.*

Agentic Users give suitable agents their own Entra identity, an accountable owner and attributed activity. Threaded replies separate tasks in one-to-one agent chats; plans and steps show progress; HTML widgets let people interact with results.

This is the **Teams SDK route**, not the December public-preview expansion of [Copilot Studio's Agent Account authoring experience](#copilot-studio).

Imagine a procurement agent presenting supplier options in a thread, showing what it checked and asking a person to decide. Its identity makes the contribution easier to distinguish from a colleague's message; it does not grant unrestricted access.

**Status:** Agentic Users, threaded replies, plans/steps and HTML widgets **public preview**. Group/channel streaming and extended Markdown are **available now**. Socket mode is **public preview for newly created development/test agents only**; production still needs an HTTPS endpoint.

📖 [Teams developer announcement and feature-level stages](https://devblogs.microsoft.com/microsoft365dev/new-capabilities-for-building-digital-teammates-in-microsoft-teams/).

<p><a href="https://devblogs.microsoft.com/microsoft365dev/wp-content/uploads/sites/73/2026/11/plan.html_.thread_zoomedit.2.mp4">Watch the official Microsoft Teams demonstration</a> using a fictional supplier scenario, not a tenant capture. <a href="https://devblogs.microsoft.com/microsoft365dev/new-capabilities-for-building-digital-teammates-in-microsoft-teams/">Read the Teams announcement</a>.</p>

<!-- ignite-reviewed-media:teams-digital-teammates -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-016-teams-digital-teammates.webp" alt="Supplier Analyst Teams profile is explicitly marked AI agent, with a demo email, organisation and reporting-manager area." width="372" height="493" loading="lazy" decoding="async" />
<figcaption>Supplier Analyst Teams profile is explicitly marked AI agent, with a demo email, organisation and reporting-manager area. Official demo persona, not a colleague or agent deployed in this tenant. Source: <a href="https://devblogs.microsoft.com/microsoft365dev/new-capabilities-for-building-digital-teammates-in-microsoft-teams/">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 15. Dynamics 365 plugins bring business tasks into Copilot {#dynamics-plugins}

*For: Sales, customer-service, finance and operations teams.*

The updated Sales plugin adds account planning, meeting preparation and deal insights. Customer Service and the ERP apps plugin are also GA. The ERP skills cover work such as requisitions, quotes and purchase orders.

Imagine preparing a supplier review with ERP records beside relevant correspondence, rather than manually gathering each piece. Existing application roles still matter.

For the ERP plugin, Learn specifies **Microsoft 365 Copilot, a qualifying finance-and-operations licence, Cowork enabled, Copilot Credits billing, Dataverse eligibility settings and a supported cloud ERP environment**. The Cowork client must be allowed to use the dynamic ERP MCP server. Regional Anthropic settings and sovereign-cloud limitations also apply. Admin deployment does not bypass these requirements.

**Status:** The three plugins **GA**; not an entitlement to every Dynamics feature.

📖 [Dynamics plugins and capabilities](https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/11/17/microsoft-ignite-2026-introducing-dynamics-365-in-copilot/) · [ERP prerequisites, supported versions and access controls](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/copilot/enable-copilot-cowork-erp).

<!-- ignite-reviewed-video:dynamics-plugins -->
<details open>
<summary>Watch official videos (1)</summary>

<p>Official video: <a href="https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/1307252-bizapps-0x1080-6439k">Dynamics 365 in Copilot: sales-skills overview</a>. Overview, not a Salesforce plugin demonstration or proof of a CRM writeback. <a href="https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/11/17/microsoft-ignite-2026-introducing-dynamics-365-in-copilot/">Read the product announcement or documentation</a>.</p>
</details>

## 16. Business plugins package how a job should be done {#business-context}

*For: Teams that need agents to follow shared business guidance.*

Tools expose an action. Skills describe a task. Business plugins package those capabilities, while the new managed guidance can tell an agent which instructions, context and authoritative sources to use for a scenario.

Imagine a procurement plugin that points to the approved policy and review process rather than leaving every employee to recreate the instructions. My take: the useful work is agreeing on that process before packaging it.

**Status:** Reusable building blocks have **GA** availability; the new managed, hierarchical business guidance is in **Frontier**.

📖 [Microsoft IQ business-plugin distinctions](https://azure.microsoft.com/en-us/blog/introducing-the-new-microsoft-iq-putting-your-organizations-intelligence-to-work-in-every-agent/).

## 17. Work IQ brings your organisation's own definitions into people questions {#workforce-intelligence}

*For: Leaders, HR teams and administrators responsible for organisational data.*

“How many people are in this team?” is not always a simple lookup. Contractors, reporting lines and your definition of headcount all matter. Work IQ's people and organisational context brings authoritative data, calculations and company-specific definitions into those questions.

The Workforce Intelligence plugin in Cowork adds organisational snapshots, skills analysis and reusable leadership dashboards. For example, a leader could explore skills across teams before proposing a training plan. This is organisational analysis, not a basis for treating an AI answer as an employee-performance assessment.

| Capability | Announced availability |
|---|---|
| Authoritative standard/custom people data, analytical reasoning and organisational skills insights | GA |
| Company-specific organisational context and its configuration in Workforce Insights Agent | Frontier |
| Workforce Intelligence plugin and its domain-specific skills | Frontier |

Microsoft labels the availability table **rollout through December**. Better answers still depend on the data and definitions your organisation supplies through Organizational Data Service and related configuration.

**Status:** **Mixed GA and Frontier**, as above.

📖 [People/org context, prerequisites and availability table](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/copilot-that-understands-your-organization-introducing-people-and-org-context-in/4573356).

<!-- ignite-reviewed-media:workforce-intelligence -->
<details open>
<summary>View official images and animations (3)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-022-workforce-intelligence.png" alt="Copilot answer separates regular employees, vendors and unrecorded worker types when answering an organisation headcount question, with an as-of date." width="1440" height="810" loading="lazy" decoding="async" />
<figcaption>Copilot answer separates regular employees, vendors and unrecorded worker types when answering an organisation headcount question, with an as-of date. Official organisation-data example, not our headcount data. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/copilot-that-understands-your-organization-introducing-people-and-org-context-in/4573356">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-023-workforce-intelligence.png" alt="Copilot answers an engineer-to-PM ratio question and explicitly states it counts regular employees under the organisation&#39;s default population rule." width="1440" height="810" loading="lazy" decoding="async" />
<figcaption>Copilot answers an engineer-to-PM ratio question and explicitly states it counts regular employees under the organisation&#39;s default population rule. Official organisation-data example, not our staffing ratio. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/copilot-that-understands-your-organization-introducing-people-and-org-context-in/4573356">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-024-workforce-intelligence.png" alt="Cowork presents an organisation-structure dashboard with team metrics, guideline checks and an org chart beside its explanation." width="1440" height="810" loading="lazy" decoding="async" />
<figcaption>Cowork presents an organisation-structure dashboard with team metrics, guideline checks and an org chart beside its explanation. Official demo dashboard, not our workforce telemetry. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/copilot-that-understands-your-organization-introducing-people-and-org-context-in/4573356">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 18. Work IQ adds richer context, actions and finer controls {#work-iq}

*For: Agent builders and administrators connecting work data.*

The Work IQ update combines richer retrieval, reusable context and tools that can act on work systems. The detailed product post distinguishes **preview ERP grounding, preview event listening and preview enterprise controls** from the generally available foundation.

For example, an agent might assemble context for a customer review, then request permission to update a supported record. Read and action permissions are distinct; a tenant-level ceiling and narrower agent policies are worth checking before enabling writes.

One concrete addition is **SharePoint tools**, announced on **3 November** and highlighted again at Ignite. The public preview exposes more than 60 operations, including lists, files, approvals and version history. An agent could create a working issue tracker rather than return instructions for making one. The preview needs tenant enablement, app consent and allowed paths; `WorkIQ.Read` covers reading, while actions also need `WorkIQ.Act`. Existing `WorkIQAgent.Ask` consent alone does not expose these SharePoint paths. Usage is billed in **Copilot Credits, independently of a Microsoft 365 Copilot seat**. [SharePoint tools, permissions and billing](https://techcommunity.microsoft.com/blog/spblog/introducing-sharepoint-tools-in-work-iq/4569917).

**Status:** Mixed **GA and preview**. For third-party platforms, the Work IQ product post says the ChatGPT Business/Enterprise plugin is available and the Anthropic plugin is **coming soon**. Use that narrower timing rather than assume both are available from the umbrella announcement. API usage also has consumption rules separate from a Copilot seat.

📖 [Work IQ feature-level announcement](https://techcommunity.microsoft.com/blog/microsoft_365blog/whats-new-in-work-iq-at-ignite-2026-agents-that-get-work-done/4572219) · [Work IQ access, policy and billing documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/work-iq/).

<figure>
<img src="/images/blog/ignite-2026/work-iq-1.png" alt="Microsoft diagram places Work IQ between Copilot, Cowork, Autopilot, Code and custom agents and organizational data, relationships, priorities and memory." width="900" height="300" loading="lazy" decoding="async" />
<figcaption>Microsoft's context-layer diagram, not a permissions guarantee. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft_365blog/whats-new-in-work-iq-at-ignite-2026-agents-that-get-work-done/4572219">Work IQ announcement</a>.</figcaption>
</figure>

<!-- ignite-reviewed-media:work-iq -->
<details open>
<summary>View official images and animations (3)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-017-work-iq.png" alt="SharePoint diagram connects Copilot, Cowork, Studio, Microsoft 365 apps and third-party agents through Work IQ to content capabilities and governance." width="1183" height="665" loading="lazy" decoding="async" />
<figcaption>SharePoint diagram connects Copilot, Cowork, Studio, Microsoft 365 apps and third-party agents through Work IQ to content capabilities and governance. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/introducing-sharepoint-tools-in-work-iq/4569917">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-018-work-iq.png" alt="Diagram routes Copilot agents and Your agents through Work IQ MCP endpoints, identity, policy and metering to SharePoint AI capabilities Understand and Act." width="678" height="482" loading="lazy" decoding="async" />
<figcaption>Diagram routes Copilot agents and Your agents through Work IQ MCP endpoints, identity, policy and metering to SharePoint AI capabilities Understand and Act. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/introducing-sharepoint-tools-in-work-iq/4569917">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-020-work-iq.png" alt="Work IQ API architecture diagram connects agents over A2A, MCP and REST to Chat, Context, Tools and Workspaces, then organisational-intelligence icons." width="1882" height="823" loading="lazy" decoding="async" />
<figcaption>Work IQ API architecture diagram connects agents over A2A, MCP and REST to Chat, Context, Tools and Workspaces, then organisational-intelligence icons. Source: <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/work-iq/">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 19. Edge separates browser actions, recorded skills and managed browsing {#edge}

*For: Browser administrators and teams automating web workflows.*

There are three different announcements here. **Cowork agentic browsing is GA**, allowing multistep web tasks from the side pane, new tab page or web. It requires a **Microsoft 365 Copilot licence and usage-based billing**.

**Skills recorder**, planned for **preview by year end**, turns a demonstrated workflow into a reusable Cowork skill. **Managed agent browsing**, separately in **preview with Microsoft 365 E5**, gives supported agents dedicated windows and identities under organisational policies. Do not read the GA browser-actions label as GA for the recorder or every third-party agent.

Imagine a repeatable internal web task. Recording it is only the first step; you would still check the allowed sites, actions and failure behaviour.

**Status:** **Mixed GA, preview and planned preview**, as above. Cowork hands sign-ins/payments back to the person and asks before sensitive actions. Extension safety **GA**; extension leak control, the Sentinel connector and Global Secure Access integration **preview**.

📖 [Edge's separate AI experiences and prerequisites](https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/) · [Security-integration stages](https://news.microsoft.com/events/ignite/2026/book-of-news/).

<!-- ignite-reviewed-video:edge -->
<details open>
<summary>Watch official videos (5)</summary>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/-oSn_uaNILs" title="Edge for Business demo: Cowork" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/-oSn_uaNILs">Edge for Business demo: Cowork</a>. GA browser actions; licence and usage-based billing requirements above apply. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/pEnuYGyqdUY" title="Edge for Business demo: Skills recorder" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/pEnuYGyqdUY">Edge for Business demo: Skills recorder</a>. Skills-recorder preview is planned by year end. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/0_R0vy13KTY" title="Edge for Business demo: Managed agent browsing experience" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/0_R0vy13KTY">Edge for Business demo: Managed agent browsing experience</a>. Managed agent browsing is preview with its own prerequisites. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/zVRkf_640QM" title="Edge for Business demo: Extension leak control" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/zVRkf_640QM">Edge for Business demo: Extension leak control</a>. Extension leak control is preview, separate from GA extension safety. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/Gj9wIWbvAcs" title="Edge for Business demo: Entra Global Secure Access" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/Gj9wIWbvAcs">Edge for Business demo: Entra Global Secure Access</a>. Global Secure Access integration is preview; no private connectivity was tested here. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>
</details>

## 20. Edge adds simpler ways to reshape pages and brief from tabs {#edge-everyday-ai}

*For: People working across browser tabs and internal web applications.*

| Experience | Practical use | Announced stage |
|---|---|---|
| Remix | Change a page's presentation locally without changing the underlying website | GA |
| Interactive brief | Turn information across tabs into a shareable interactive page | Preview by year end |
| Writing assistance with Work IQ | Draft in form fields using supported work context | Preview |
| Journeys, shown as “Get things done” | Suggest next steps from work and browsing context | Preview |

Imagine briefing a colleague from several open project tabs. The interactive brief is saved to OneDrive **as a snapshot**; it is not the same as Pages with background updates. Remix is also local presentation, not a way to repair the website for everyone.

**Status:** As shown above. Interactive briefs need a **Copilot licence and usage-based billing**. Work-grounded writing assistance and Journeys need a **Copilot licence**.

📖 [Everyday browser AI and capability-specific requirements](https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/).

<!-- ignite-reviewed-video:edge-everyday-ai -->
<details open>
<summary>Watch official videos (3)</summary>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/Yh4xwjzNicQ" title="Edge for Business demo: Remix" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/Yh4xwjzNicQ">Edge for Business demo: Remix</a>. Remix changes the local presentation, not the underlying website. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/OKISxyWcqE4" title="Edge for Business demo: Interactive brief" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/OKISxyWcqE4">Edge for Business demo: Interactive brief</a>. Preview planned by year end. Microsoft’s fictional demo content, not our internal material; the brief is a snapshot. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/nxx8UrxDpCQ" title="Edge for Business demo: Writing assistance" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/nxx8UrxDpCQ">Edge for Business demo: Writing assistance</a>. Preview; work-context licensing applies. <a href="https://blogs.windows.com/msedgedev/2026/11/17/edge-for-business-ignite-2026-innovations/">Read the product announcement or documentation</a>.</p>
</details>

## 21. Copilot Studio gains a clearer local-development path {#copilot-studio}

*For: People building agents and workflows in Copilot Studio.*

Local development of Copilot Studio agents and workflows, followed by CLI publication to the runtime, enters public preview. Code Agents are a different, early-access path requiring acceptance.

For example, a developer can work locally on a workflow while the organization retains a managed publication path. That does not turn every locally written agent into a supported production app.

The Microsoft Copilot harness in Studio is GA, but was already described before Ignite. Agent Accounts were covered as a private Frontier preview in our November issue; the **public-preview expansion is planned for December**.

**A memory boundary worth checking:** the current Agent Accounts preview uses shared memory even in one-to-one chats. Learn warns that summaries can appear in responses to people without access to the original material, and that users cannot opt out of shared memory during this preview. That is a reason to use approved test content and review the design before delegating a shared process.

**Why it matters:** A team can review changes before publishing from Studio. I’d start with a small project so the browser and local workflows stay easy to compare.

**Status:** Local agents/workflows **public preview**; Code Agents **early access**; Agent Accounts **December public-preview plan**.

📖 [Local development and Code Agents](https://techcommunity.microsoft.com/blog/copilot-managed-runtime-blog/copilot-managed-runtime-is-now-generally-available-with-additional-new-preview-f/4571846) · [Studio harness and Agent Accounts timing](https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/11/17/microsoft-ignite-2026-introducing-dynamics-365-in-copilot/) · [Current shared-memory limitations](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/authoring-agent-account#memory).

<!-- ignite-reviewed-media:copilot-studio -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-015-copilot-studio.png" alt="Small Cadence agent header has an Agent account button directly beneath the name." width="320" height="147" loading="lazy" decoding="async" />
<figcaption>Small Cadence agent header has an Agent account button directly beneath the name. Agent Accounts preview timing and prerequisites above still apply. Source: <a href="https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/authoring-agent-account">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 22. MCP Apps can put an interactive tool inside Studio chat {#studio-mcp-apps}

*For: Copilot Studio builders connecting tools that need more than a text response.*

Model Context Protocol (MCP) is a standard way for an agent to call a supported tool. Microsoft's guidance dated **16 November** describes MCP Apps: a server can return an interactive interface, such as a project-status panel, inside the conversation. Connecting a server alone is not enough; its tool must declare and supply the interface.

For example, an agent could show a supplier-comparison panel and let someone explore the results without opening another application. This is different from November's **Copilot Studio MCP server**, which lets another agent work with Studio. Here, Studio is displaying a tool's interface.

**Why it matters:** An interactive control can keep a simple task in the conversation. I’d test permissions and the fallback before relying on it.

**Status:** Supported in Microsoft 365 Copilot and **Copilot Studio preview chat**, **not Teams or web chat**. File downloads and end-to-end cancellation are not supported. Check the host's supported capabilities before designing around it; closing a panel is not proof that its operation stopped.

📖 [MCP Apps support and limitations](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/mcp-apps).

## 23. Windows 365 for Agents broadens computer-use options {#windows-agents}

*For: Builders automating legacy applications without suitable APIs.*

Windows 365 for Agents provides governed Cloud PCs for computer-use tasks and is now eligible for Copilot Credits. The Studio Standard harness path is available; other integrations arrive later.

For example, an agent might complete an approved task in an old application. A managed desktop does not remove the need for application permissions, action limits and supervision.

**Status:** Copilot harness tool **preview planned for December**; Foundry MCP integration **preview early in 2027**. On-premises access using agent identities **preview**; persistent agent Cloud PCs **Frontier preview**.

📖 [Windows 365 for Agents integration and timing](https://news.microsoft.com/events/ignite/2026/book-of-news/).

<span id="govern"></span>

## 24. Agent 365 expands governance beyond the agent itself {#agent-governance}

*For: Administrators responsible for agents, plugins, skills and tools.*

Think of Agent 365 as the front desk for the agent estate: who owns each agent, which tools it reaches, what it has done and where it needs attention.

| Part | Plain-English distinction |
|---|---|
| Registry | The inventory of agents and tools |
| Entra Agent ID | An agent's identity, separate from its inventory entry |
| Plugin or skill | A packaged ability or instructions for doing a job |
| MCP server/tool | A standard connection through which an agent can call a supported capability |

Plugin/skill governance and the **tools registry are GA**. Governance through supported gateways, discovery of local or previously unmanaged “shadow” agents, and Dynamic Agent Risk are **preview**. Gateway integrations have their own stages. Additional external catalogs and the action center for inactive or ownerless agents are **December private-preview plans**; registry GA does not make those features GA.

For example, approving an agent is not enough if it can later call an unreviewed tool. This is the part of the announcement I would bring to an architecture review: **what is approved, what can change, and who sees it?**

**Status:** **Mixed GA, preview and December plans**, as above. Basic Microsoft-agent management insights are GA without an Agent 365 licence, but full governance and third-party insights still have licensing requirements.

📖 [Agent 365 governance, risk and management-insight announcements](https://news.microsoft.com/events/ignite/2026/book-of-news/).

GitHub also announced streaming Copilot activity into Agent 365, including prompts, responses and tool calls, with additional risk information in Purview and Defender. This is for **GitHub Enterprise Cloud with Enterprise Managed Users**, configured through audit-log streaming. The announcement says it is available but does not give a separate GA/preview label. It is not a promise that every GitHub customer gets the integration automatically. [GitHub's Agent 365 monitoring requirements](https://github.blog/changelog/2026-11-17-monitor-github-copilot-activity-through-microsoft-agent-365/).

The licensing change is narrower than “Agent 365 is now free”: qualifying Microsoft 365 subscriptions get core usage/activity insights for Microsoft agents. Premium governance/security and non-Microsoft-agent insights still need the applicable **Agent 365 or ME7** entitlement. [Agent 365's registry, integrations and licensing detail](https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753).

<!-- ignite-reviewed-media:agent-governance -->
<details open>
<summary>View official images and animations (6)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-039-agent-governance.png" alt="Agents table with a Shadow AI tab; an OpenClaw instance details panel shows high dynamic agent risk, model and device fields." width="900" height="343" loading="lazy" decoding="async" />
<figcaption>Agents table with a Shadow AI tab; an OpenClaw instance details panel shows high dynamic agent risk, model and device fields. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-042-agent-governance.png" alt="Tools registry shows Plugins, Skills, MCP servers and Connectors categories, a third-party publisher filter and tool rows with availability statuses." width="900" height="444" loading="lazy" decoding="async" />
<figcaption>Tools registry shows Plugins, Skills, MCP servers and Connectors categories, a third-party publisher filter and tool rows with availability statuses. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-045-agent-governance.png" alt="All agents inventory beside a Comms agent Activity panel with invocation, exception and active-user metrics, a chart and per-user rows." width="900" height="480" loading="lazy" decoding="async" />
<figcaption>All agents inventory beside a Comms agent Activity panel with invocation, exception and active-user metrics, a chart and per-user rows. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-046-agent-governance.png" alt="Tools registry with Plugins selected, category counts, a Requests preview tab and plugin rows for Adobe, Ahrefs, meeting notes and Airtable." width="900" height="434" loading="lazy" decoding="async" />
<figcaption>Tools registry with Plugins selected, category counts, a Requests preview tab and plugin rows for Adobe, Ahrefs, meeting notes and Airtable. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-047-agent-governance.png" alt="Patent MCP server Activity panel shows calls, agents, exceptions, a calls-over-time line chart and a table of agents using the server." width="900" height="495" loading="lazy" decoding="async" />
<figcaption>Patent MCP server Activity panel shows calls, agents, exceptions, a calls-over-time line chart and a table of agents using the server. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-049-agent-governance.png" alt="Action center dashboard shows agent health, governance actions, recommended actions and a Needs your attention table with ownerless and inactive agent tasks." width="900" height="436" loading="lazy" decoding="async" />
<figcaption>Action center dashboard shows agent health, governance actions, recommended actions and a Needs your attention table with ownerless and inactive agent tasks. Action center is planned for private preview in December, not available GA at this cutoff. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 25. Connected platforms give third-party agents an Entra identity {#agent-connected-platforms}

*For: Organisations building agents across Microsoft and other platforms.*

Connected platforms bring supported agents into the same registry without requiring changes to their code. The Ignite additions extend **Microsoft Entra Agent ID** to more connected agents, with a guided setup wizard and secretless authentication for supported connections.

Microsoft lists platforms including Salesforce Agentforce, Amazon AgentCore, Google Vertex AI, Databricks and Snowflake, with support **rolling out through December**. Identity, activity detail and available controls vary by platform. An agent appearing in the registry is not proof that every control works identically everywhere. This is not the [Copilotforce sales integration](#salesforce); it is an identity/governance connection. [Local-agent identity](#identity) is another part of that story.

For example, an IT team could investigate the owner and access of a data-team agent alongside a Copilot Studio agent. Secretless connections use workload identity federation instead of stored long-lived credentials; they still require deliberate trust and permission configuration.

**Status:** **Preview additions and a rollout through December**.

📖 [Connected platforms, identity rollout and supported secretless connections](https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753).

<!-- ignite-reviewed-media:agent-connected-platforms -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-038-agent-connected-platforms.png" alt="Microsoft 365 admin center Add a connection wizard, with a Platform dropdown listing Amazon Bedrock, Anthropic Claude, Databricks, Google, OpenAI, Salesforce AgentForce and other platforms." width="900" height="447" loading="lazy" decoding="async" />
<figcaption>Microsoft 365 admin center Add a connection wizard, with a Platform dropdown listing Amazon Bedrock, Anthropic Claude, Databricks, Google, OpenAI, Salesforce AgentForce and other platforms. Connected-platform additions are preview through December; this is not universal federation support. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 26. Agent 365 brings investigations into your tools and Cowork {#agent-investigation}

*For: Administrators, developers and SRE teams investigating what an agent did.*

**Export Agent Activity** is announced as a way to continuously sync agent traces into your own Azure Monitor and Application Insights. Administrators can filter by agent or platform and choose whether prompts and responses are included.

That could let a support team follow a failed tool call in its existing dashboard. I would decide which conversation content belongs in those logs before enabling an export, then review workspace access and retention.

Separately, the **Agent 365 plugin for Cowork** lets administrators inspect the agent estate and request governance actions in plain language. Cowork pauses for approval before consequential actions. This is different from the IT-admin MCP server [below](#it-admin-mcp).

**Status:** Cowork administration plugin **preview**. Microsoft's post announces Export Agent Activity but does **not give it a separate GA/preview label**; do not treat it as confirmed GA. Agent Map use-case classification is also **preview**.

📖 [Trace export, Cowork plugin and Agent Map details](https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753).

<!-- ignite-reviewed-media:agent-investigation -->
<details open>
<summary>View official images and animations (3)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-041-agent-investigation.png" alt="Agent activity sync screen with an Audit blocked agents rule, export conditions, destination, region and trace-format settings." width="900" height="534" loading="lazy" decoding="async" />
<figcaption>Agent activity sync screen with an Audit blocked agents rule, export conditions, destination, region and trace-format settings. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-043-agent-investigation.png" alt="Agent map displays clustered accounting use cases, with circles for reporting, general ledger, financial statements and intercompany work containing agent icons." width="900" height="468" loading="lazy" decoding="async" />
<figcaption>Agent map displays clustered accounting use cases, with circles for reporting, general ledger, financial statements and intercompany work containing agent icons. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-048-agent-investigation.png" alt="Cropped Cowork agent-inventory result shows risk/status/action columns and the Agent 365 plugin in its workspace; browser tabs and URL are absent." width="900" height="406" loading="lazy" decoding="async" />
<figcaption>Cropped Cowork agent-inventory result shows risk/status/action columns and the Agent 365 plugin in its workspace; browser tabs and URL are absent. Cropped to remove browser/session chrome. Official plugin demo, not our investigation. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 27. SharePoint adds content-level agent controls and a recovery preview {#sharepoint-agent-governance}

*For: SharePoint administrators preparing content for agents and planning recovery.*

The SharePoint Admin Agent adds skills for permissions, lifecycle, storage, catalog and Multi-Geo work. The Ignite post also separates current controls from December plans and restricted previews:

| Capability | Announced stage |
|---|---|
| Admin Agent skills; site-level restricted app/agent access; permissions reports for groups and Autopilots | GA |
| Governance Hub for admins and Agent Access Heatmap | GA **planned for December 2026** |
| Restrict which people an agentic user can collaborate with | Public preview **planned for December 2026** |
| Governance reviews dashboard for site owners | Public preview |
| Agent Rewind, for recovering from unintended agent actions | Private preview |

For example, an administrator could first investigate which sites an agent can reach, narrow the permitted scope and test the recovery process with approved data. Rewind is a preview to evaluate, not a substitute for an established recovery plan or proof that every action is reversible.

**Status:** **Mixed GA, previews and December plans**, as shown above. The SharePoint Admin Agent needs **SharePoint Advanced Management** and the **SharePoint Advanced Management Administrator** role. Check the separate controls' prerequisites rather than assume the agent licence covers every service.

📖 [Ignite content-governance stages and Agent Rewind](https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034) · [Admin Agent prerequisites](https://learn.microsoft.com/en-us/sharepoint/content-governance-agent).

<!-- ignite-reviewed-media:sharepoint-agent-governance -->
<details open>
<summary>View official images and animations (7)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-056-sharepoint-agent-governance.gif" alt="SharePoint Admin Agent screen lists permissions, lifecycle and storage capabilities beside reported-issue cards; a Preview switch remains visible in this source illustration." width="1280" height="720" loading="lazy" decoding="async" />
<figcaption>SharePoint Admin Agent screen lists permissions, lifecycle and storage capabilities beside reported-issue cards; a Preview switch remains visible in this source illustration. Source UI retains a Preview switch; the announcement, not that illustration label, establishes the GA stage above. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-057-sharepoint-agent-governance.png" alt="SharePoint admin agent shows oversharing findings and a conversational response listing affected sites, sensitive-file counts and access patterns; the source UI retains a Preview switch." width="1919" height="943" loading="lazy" decoding="async" />
<figcaption>SharePoint admin agent shows oversharing findings and a conversational response listing affected sites, sensitive-file counts and access patterns; the source UI retains a Preview switch. Source UI retains a Preview switch; the announcement, not that illustration label, establishes the GA stage above. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-058-sharepoint-agent-governance.png" alt="Admin-center Default protection for autopilots policy panel shows a Restrict collaboration toggle and links to SharePoint/OneDrive protection settings." width="3810" height="1939" loading="lazy" decoding="async" />
<figcaption>Admin-center Default protection for autopilots policy panel shows a Restrict collaboration toggle and links to SharePoint/OneDrive protection settings. Agentic-user collaboration restriction is planned public preview in December. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-059-sharepoint-agent-governance.png" alt="SharePoint agent-governance settings panel lists four selected sites under Restrict all agentic users from accessing specific sites, with a saved-status message." width="7911" height="4421" loading="lazy" decoding="async" />
<figcaption>SharePoint agent-governance settings panel lists four selected sites under Restrict all agentic users from accessing specific sites, with a saved-status message. Agentic-user restriction example; December public-preview timing above applies. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-060-sharepoint-agent-governance.png" alt="SharePoint permission insights for Autopilots lists named demo autopilots and a site table with direct-access items, privacy, sensitivity and sharing columns." width="2719" height="1140" loading="lazy" decoding="async" />
<figcaption>SharePoint permission insights for Autopilots lists named demo autopilots and a site table with direct-access items, privacy, sensitivity and sharing columns. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-061-sharepoint-agent-governance.gif" alt="SharePoint group-permissions report setup shows two Contoso demo groups in an Add groups panel; the background says there are no reports yet." width="1280" height="720" loading="lazy" decoding="async" />
<figcaption>SharePoint group-permissions report setup shows two Contoso demo groups in an Add groups panel; the background says there are no reports yet. Source animation already contains callouts and an earlier illustrative reporting date; no extra callouts added. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-062-sharepoint-agent-governance.gif" alt="Microsoft 365 Governance Agent offers three suggested recovery windows before an agent&#39;s modifications, explains rollback trade-offs and has Select buttons; no recovery execution is shown." width="1280" height="720" loading="lazy" decoding="async" />
<figcaption>Microsoft 365 Governance Agent offers three suggested recovery windows before an agent&#39;s modifications, explains rollback trade-offs and has Select buttons; no recovery execution is shown. Agent Rewind private-preview demonstration, not a recovery performed here. Source: <a href="https://techcommunity.microsoft.com/blog/spblog/microsoft-365-copilot-and-ai-agent-readiness-and-resiliency-with-sharepoint-cont/4573034">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

<!-- ignite-reviewed-video:sharepoint-agent-governance -->
<details open>
<summary>Watch official videos (1)</summary>

<p>Official video: <a href="https://learn.microsoft.com/en-us/sharepoint/content-governance-agent#what-is-the-sharepoint-admin-agent">Overview of the SharePoint Admin Agent</a>. Product explainer; current announcement stages and prerequisites above apply. <a href="https://learn.microsoft.com/en-us/sharepoint/content-governance-agent">Read the product announcement or documentation</a>.</p>
</details>

## 28. FinOps starts with who can spend, on what and under which policy {#agent-value}

*For: IT, finance and business owners funding AI usage.*

FinOps is the routine of planning and checking technology spending with IT, finance and the people using the services. For AI, that means more than counting licences: usage-based tasks consume **Copilot Credits**, Microsoft's usage unit for supported services.

| Question | Where to look |
|---|---|
| Who can spend, and how much? | Cost Management spending policies |
| What was consumed? | Cost Management consumption reports; Business Analytics adds cost/use-case views |
| What might we spend next? | Business Analytics forecasts |
| What assistance might that work represent? | Business Analytics value estimates, checked against actual outcomes |

At Ignite, Microsoft previews a broader Agent 365 Cost Management experience across supported services, spend drivers and Fabric reporting, with forecasting and recommendations in Frontier this month. The underlying spending-policy system already existed before Ignite. The table below describes documented controls to review, **not seven newly launched features**.

| Control or check | What I would verify |
|---|---|
| Identity-based policy | Which users/groups and supported services it enables |
| Resource-based policy | Which supported environment or agent it covers |
| Monthly policy and per-user limits | The applicable limit and what happens when it is reached |
| Alerts | Who receives them; an alert is not itself a spending block |
| Cowork model template | Which models Cowork's automatic routing and model picker may use; this control is currently **Cowork-only** |
| Auto-apply new services | Whether newly supported services should inherit this policy; the documented default is on |
| Billing method | Which prepaid credit source or Azure billing connection applies |

For example, a pilot group could get access to specified services under an owned spending policy, rather than a tenant-wide enablement nobody is watching. Policies define access and limits; **they do not reserve a separate pot of credits** for each group. [Policy scope, model templates and defaults](https://learn.microsoft.com/en-us/copilot/implement/usage-based-billing-manage-copilot-credits).

**Do not describe these as an instantaneous hard cap.** Learn says a running task can finish after exceeding a per-user limit. Reporting is also delayed: the Overview tab refreshes every **four hours**, Consumption every **two hours**. Credits are the usage unit; the dashboard's currency cost is an estimate, not the invoice. [Enforcement exception, refresh cadence and cost estimates](https://learn.microsoft.com/en-us/copilot/implement/usage-based-billing-copilot-credits-monitor-spending).

**Status:** Existing documented billing controls plus Ignite **preview/Frontier additions**, not blanket GA for a new FinOps suite. Supported services and billing prerequisites differ.

📖 [Usage-based billing and service coverage](https://learn.microsoft.com/copilot/plan/usage-based-billing-overview-copilot-credits) · [Ignite Cost Management announcements](https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753).

<!-- ignite-reviewed-media:agent-value -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-055-agent-value.png" alt="Admin center Cost management Overview shows credit usage, active users, cost and value cards, credit requests, policies near their limits and users near limits." width="900" height="575" loading="lazy" decoding="async" />
<figcaption>Admin center Cost management Overview shows credit usage, active users, cost and value cards, credit requests, policies near their limits and users near limits. Reporting can lag; this is not a real-time spending meter or a final invoice. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

<!-- ignite-reviewed-video:agent-value -->
<details open>
<summary>Watch official videos (2)</summary>

<p>Official video: <a href="https://learn.microsoft.com/en-us/copilot/plan/usage-based-billing-overview-copilot-credits#watch-microsoft-copilot-cost-management">Microsoft Copilot Cost management</a>. The explainer focuses on Cowork and Work IQ; Ignite’s broader coverage is described separately above. <a href="https://learn.microsoft.com/en-us/copilot/plan/usage-based-billing-overview-copilot-credits">Read the product announcement or documentation</a>.</p>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/uA1ZaQpIh3Q" title="Optimize your AI spend with Microsoft Agent 365" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/uA1ZaQpIh3Q">Optimize your AI spend with Microsoft Agent 365</a>. Spending-policy demonstration, not the separate Business Analytics app or a final invoice. <a href="https://techcommunity.microsoft.com/blog/ai-finops-blog/introducing-microsoft-agent-365-business-analytics-turn-ai-investment-into-busin/4574149">Read the product announcement or documentation</a>.</p>
</details>

## 29. Business Analytics asks what AI is helping people accomplish {#agent-business-analytics}

*For: Business leaders, finance and IT comparing AI usage, cost and useful outcomes.*

**Agent 365 Business Analytics is a separate Frontier app**, not simply another tab in the credit-management dashboard. It connects service usage, spend, business use cases and estimated assistance.

| Capability | Announced timing |
|---|---|
| Cowork cost and value views | November 2026 |
| Broader agent cost/value views | December 2026 |
| Forecasts, what-if analysis, plain-language questions and sharing | November 2026 |
| Creating/updating spending policies within delegated access from Business Analytics | December 2026 |

There is an important launch prerequisite. The **dedicated product post and Learn require at least 50 assigned Microsoft 365 Copilot licences at launch**, with expansion to tenants with **one or more planned by mid-December**. The broader Agent 365 post says one; I would plan from the more specific launch guidance, not promise access to a one-licence tenant today. Connected non-Microsoft-service analytics need **Agent 365 and/or ME7**. Role, data-scope, billing and minimum-group-size settings also apply.

📖 [Business Analytics launch, timing and staged licensing](https://techcommunity.microsoft.com/blog/ai-finops-blog/introducing-microsoft-agent-365-business-analytics-turn-ai-investment-into-busin/4574149) · [Current access and prerequisite details](https://learn.microsoft.com/a365-business-analytics/introduction).

For Cowork, **assisted hours estimate equivalent human work**, using task frequency, completion, AI contribution and typical task time. An assumed hourly rate turns that into estimated value. Administrators can adjust some assumptions; changing those changes the result.

Imagine comparing the estimated assistance for proposal preparation with actual proposal quality and turnaround. That is a useful investigation. It is **not proof that salaries, working hours or costs fell by the amount on the dashboard**. Microsoft's documented Cowork methodology should not be silently applied to every other Copilot value metric. [Assisted-hours methodology and what it does not measure](https://learn.microsoft.com/a365-business-analytics/reference/ai-value).

**Status:** **Frontier rollout**, with the staged capabilities above.

<!-- ignite-reviewed-media:agent-business-analytics -->
<details open>
<summary>View official images and animations (3)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-013-agent-business-analytics.png" alt="Business Analytics Frontier Copilot Cowork screen shows use-case columns from domain to specific task, with sessions, cost, AI value and assisted-hours fields." width="2880" height="1920" loading="lazy" decoding="async" />
<figcaption>Business Analytics Frontier Copilot Cowork screen shows use-case columns from domain to specific task, with sessions, cost, AI value and assisted-hours fields. Frontier Business Analytics example. Assisted value is an estimate, not realised ROI. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-copilot-cowork-at-ignite-2026/4572242">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-051-agent-business-analytics.png" alt="Agent 365 Business Analytics Frontier Overview shows AI users, cost and budget, impact cards and projected-cost figures with organisation filters." width="900" height="586" loading="lazy" decoding="async" />
<figcaption>Agent 365 Business Analytics Frontier Overview shows AI users, cost and budget, impact cards and projected-cost figures with organisation filters. Frontier Business Analytics. Launch licence threshold and staged capabilities above apply. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-063-agent-business-analytics.png" alt="Business Analytics Cost breakdown Combined view shows coloured flows from Copilot Cowork, GitHub Copilot and Agents on the left to models on the right, with service/model filters." width="2879" height="1919" loading="lazy" decoding="async" />
<figcaption>Business Analytics Cost breakdown Combined view shows coloured flows from Copilot Cowork, GitHub Copilot and Agents on the left to models on the right, with service/model filters. Cost-flow illustration, not an invoice or proof of value. Source: <a href="https://techcommunity.microsoft.com/blog/ai-finops-blog/introducing-microsoft-agent-365-business-analytics-turn-ai-investment-into-busin/4574149">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 30. Forecasts and exports connect AI spending to a finance review {#agent-finops-reporting}

*For: Finance, reporting and data teams building a repeatable AI-spend review.*

Business Analytics adds cost forecasts, service/model breakdowns and what-if comparisons. Think of these as planning views, not controls: **changing a forecast scenario or a budget target used in reports does not change live access, model routing or an enforced spending policy**. The cost-forecast page also excludes Copilot subscription licence cost. [Forecast scope and the difference between scenarios and policies](https://learn.microsoft.com/a365-business-analytics/cost-forecast).

The Frontier export experience supports permitted datasets through CSV and supported Fabric/Power BI, data-warehouse and MCP connection options. Some options provide setup instructions, not an already completed connection. A Fabric Copy job, which moves the permitted data into Fabric, needs capacity, workspace permissions and the relevant export identifiers. I would check data access, refresh schedules and destination handling before using an export to assign costs to departments. [Export options and permissions](https://learn.microsoft.com/en-us/a365-business-analytics/advanced/export) · [Fabric Copy job prerequisites](https://learn.microsoft.com/en-us/a365-business-analytics/advanced/fabric-copy).

There is also a **Microsoft Graph beta Cost Management API** for credit usage and policies. It is credit-denominated, not an invoice or currency-pricing API; beta APIs are not supported for production applications.

📖 [Cost Management API contract and beta boundary](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/admin-settings/cost-management/overview).

**Status:** Business Analytics reporting/connections **Frontier**; Graph Cost Management API **beta**.

<!-- ignite-reviewed-media:agent-finops-reporting -->
<details open>
<summary>View official images and animations (9)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-054-agent-finops-reporting.png" alt="Business Analytics Cost and credits over time chart combines actual and striped forecast bars with a Customize your forecast panel and Spend cap scenario." width="900" height="428" loading="lazy" decoding="async" />
<figcaption>Business Analytics Cost and credits over time chart combines actual and striped forecast bars with a Customize your forecast panel and Spend cap scenario. What-if forecast only: this Spend cap scenario does not change a real policy or access. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-065-agent-finops-reporting.png" alt="Business Analytics forecast chart shows actual and projected monthly bars, a monthly budget target, and a Model mix scenario panel; a toast says Scenario applied: Model mix." width="2879" height="1919" loading="lazy" decoding="async" />
<figcaption>Business Analytics forecast chart shows actual and projected monthly bars, a monthly budget target, and a Model mix scenario panel; a toast says Scenario applied: Model mix. Model-mix what-if scenario; it does not change model routing or a spending policy. Source: <a href="https://techcommunity.microsoft.com/blog/ai-finops-blog/introducing-microsoft-agent-365-business-analytics-turn-ai-investment-into-busin/4574149">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-067-agent-finops-reporting.png" alt="Business Analytics cost page has active users, total and projected cost, an Add a budget card, then job-function, model and service cost drivers." width="1457" height="605" loading="lazy" decoding="async" />
<figcaption>Business Analytics cost page has active users, total and projected cost, an Add a budget card, then job-function, model and service cost drivers. Estimated/projected figures, excluding subscription licence cost as described above. Source: <a href="https://learn.microsoft.com/en-us/a365-business-analytics/cost-forecast">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-069-agent-finops-reporting.png" alt="Cost over time chart separates actual-usage and striped forecast bars, with Spend cap, Expand access, Model mix and Usage change what-if entry points." width="1518" height="589" loading="lazy" decoding="async" />
<figcaption>Cost over time chart separates actual-usage and striped forecast bars, with Spend cap, Expand access, Model mix and Usage change what-if entry points. Striped bars are forecasts. Scenario controls model a possibility rather than enforcing policy. Source: <a href="https://learn.microsoft.com/en-us/a365-business-analytics/cost-forecast">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-071-agent-finops-reporting.png" alt="Spending limits report shows a status doughnut and users/services/cost/limit rows, with Approaching limit and At limit badges." width="1496" height="669" loading="lazy" decoding="async" />
<figcaption>Spending limits report shows a status doughnut and users/services/cost/limit rows, with Approaching limit and At limit badges. A report of spending-limit status, not a policy editor or a guarantee of instantaneous enforcement. Source: <a href="https://learn.microsoft.com/en-us/a365-business-analytics/cost-forecast">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-072-agent-finops-reporting.png" alt="Business Analytics Export page has separate cards for M365 Copilot, Agent365, GitHub Copilot, Cowork and Consumption datasets." width="1569" height="374" loading="lazy" decoding="async" />
<figcaption>Business Analytics Export page has separate cards for M365 Copilot, Agent365, GitHub Copilot, Cowork and Consumption datasets. Export availability depends on dataset, role and configuration. Source: <a href="https://learn.microsoft.com/en-us/a365-business-analytics/advanced/export">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-073-agent-finops-reporting.png" alt="Export data dialog shows a WorkIQ API dataset, time range, grouping, employee scope, a disabled Include user identifiers checkbox, Connect data and Export data controls." width="639" height="822" loading="lazy" decoding="async" />
<figcaption>Export data dialog shows a WorkIQ API dataset, time range, grouping, employee scope, a disabled Include user identifiers checkbox, Connect data and Export data controls. Export options, including identifiers, depend on permission and configuration. Source: <a href="https://learn.microsoft.com/en-us/a365-business-analytics/advanced/export">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-074-agent-finops-reporting.png" alt="Export-history table lists dataset, time period, successful-status icons, download and connection actions for three sample exports." width="1440" height="280" loading="lazy" decoding="async" />
<figcaption>Export-history table lists dataset, time period, successful-status icons, download and connection actions for three sample exports. Official example export history, not data exported in this tenant. Source: <a href="https://learn.microsoft.com/en-us/a365-business-analytics/advanced/export">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-076-agent-finops-reporting.png" alt="Connect data panel has Fabric, Power BI, Data warehouse and MCP tabs; Data warehouse shows Copy job instructions with partition/query identifier fields." width="655" height="693" loading="lazy" decoding="async" />
<figcaption>Connect data panel has Fabric, Power BI, Data warehouse and MCP tabs; Data warehouse shows Copy job instructions with partition/query identifier fields. Fabric Copy job is Frontier; workspace/capacity IDs and permissions must be configured. Source: <a href="https://learn.microsoft.com/en-us/a365-business-analytics/advanced/fabric-copy">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 31. Copilotforce connects Salesforce with Copilot, Teams and Fabric {#salesforce}

*For: Organizations using Salesforce alongside Microsoft 365 and Fabric.*

**Copilotforce is the Microsoft–Salesforce partnership announced at Ignite**, not another name for Dynamics 365's Sales plugin or Microsoft's cross-CRM Copilot for sales. Its integrations bring Salesforce customer context together with Microsoft 365 work context.

Salesforce in Copilot offers **38+ prebuilt sales skills** through authenticated Salesforce MCP access. Work IQ adds relevant Teams, Outlook, SharePoint and OneDrive context. A seller could review a deal, prepare a meeting brief or draft a follow-up, then confirm a supported CRM update.

Salesforce also describes **Agentforce Coworker in Teams**. This is Salesforce's agent experience within the Sales Cloud in Teams pilot, not Microsoft Copilot Cowork under a different brand.

| Integration | Direction or purpose | Announced stage |
|---|---|---|
| Salesforce in Microsoft Copilot | Salesforce context, sales skills and supported actions | Public preview/beta |
| Sales Cloud in Teams, including Agentforce Coworker | CRM collaboration and supported updates inside Teams | Pilot; open beta planned later this year |
| Data Federation | Query supported Fabric OneLake data from Salesforce Data 360 | GA |
| Data 360 sharing/shortcut into OneLake | Make curated Salesforce data available for Fabric workloads | Public preview/beta |

The two data directions do **not** share one GA label. Supported CRM writebacks need **explicit user confirmation** and respect Salesforce validation rules. Check authenticated access, permissions, regional availability and the applicable agreements; zero-copy access is not unrestricted data access. The separate [Informatica collaboration](#informatica-context) concerns data context; [connected-platform governance](#agent-connected-platforms) concerns registering and managing agents.

**Status:** **Mixed public preview, pilot and GA**, as above.

📖 [Microsoft's joint Copilotforce announcement](https://news.microsoft.com/source/2026/11/17/microsoft-and-salesforce-announce-copilotforce-bringing-trusted-customer-context-and-action-into-microsoft-ai-experiences/) · [Salesforce's product detail and availability roadmap](https://www.salesforce.com/news/stories/copilotforce-announcement/).

## 32. Dynamics 365 Activate extends into ERP assessment {#activate}

*For: Organizations and partners planning CRM or ERP migrations.*

Activate for CRM is GA for the Salesforce-to-Dynamics path. The enterprise resource planning (ERP) expansion starts with SAP ECC discovery, requirements analysis, configuration and data migration in **private preview**.

For example, a project team could use discovery to identify customizations and dependencies before deciding what to move or redesign. The team's validation is part of the process; this is not a promise of a one-click migration.

**Status:** CRM **GA**; ERP capabilities rolling out **within private preview** over the coming weeks, not to all customers.

📖 [Dynamics 365 Activate release stages](https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/11/17/microsoft-ignite-2026-introducing-dynamics-365-in-copilot/).

## 33. Contact Center Intelligence reaches GA {#contact-center}

*For: Customer-service teams that are not replacing their contact-centre platform.*

Microsoft Contact Center Intelligence layers voice and digital agents onto existing contact-centre infrastructure. The Ignite announcement marks it generally available, following the earlier product introduction.

A service team might add an agent to a defined part of an existing customer journey rather than start with a platform replacement. Compatibility, escalation and the handover to a person would be the first things I would check for that journey.

**Status:** **GA**, according to the Dynamics Ignite announcement.

📖 [Contact Center Intelligence GA announcement](https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/11/17/microsoft-ignite-2026-introducing-dynamics-365-in-copilot/).

<span id="context"></span>

## 34. Microsoft IQ joins the context layers, not all the licences {#microsoft-iq}

*For: Anyone trying to understand how Microsoft's AI pieces fit.*

Microsoft IQ was already introduced in our [Build recap](/blog/microsoft-build-2026-recap/). Ignite extends its connections and reusable business guidance rather than inventing the umbrella again. Think of it as four kinds of context: **Work IQ** understands work and collaboration; **Fabric IQ** supplies business definitions and data; **Foundry IQ** brings organizational knowledge; **Web IQ** brings current external information.

For a supplier decision, those could mean the conversation, the approved spend metric, the policy documents and current external information. They solve different parts of the question.

**Status:** Microsoft describes the platform as **GA**. That does not make every integration GA, remove each service's requirements or mean all usage is included.

📖 [Microsoft IQ announcement](https://azure.microsoft.com/en-us/blog/introducing-the-new-microsoft-iq-putting-your-organizations-intelligence-to-work-in-every-agent/).

## 35. Informatica brings data definitions, quality and lineage into Microsoft AI {#informatica-context}

*For: Data teams and business users who need to know what a dataset means and where it came from.*

Separate from [Copilotforce's sales workflows](#salesforce), Salesforce's Informatica collaboration adds another layer of context: business definitions, data-quality indicators and lineage, the history of how data moved and changed. Its Copilot integration brings that information into natural-language questions. Foundry's expanded Headless MCP capabilities expose supported governance, identity and administration tools to builders without requiring Informatica's own user interface.

For example, before using a customer segment in an analysis, someone could investigate its definition, source and quality signals. I would use those signals to check the data, not treat a catalog entry as proof that the answer is correct.

Fabric scanning also expands to **notebooks and data pipelines**. The Foundry MCP foundation was already GA before Ignite; the news is the expanded capabilities, not a first launch of MCP.

**Status:** Informatica's announcement labels the Copilot integration, expanded Foundry integration and Fabric scanning **GA**. Applicable Informatica services, access configuration and commercial/regional terms still apply; this is not a feature included with every Copilot seat.

📖 [Informatica/Salesforce announcement and capability-level availability](https://www.salesforce.com/news/stories/informatica-trusted-enterprise-data-microsoft-collaboration/).

## 36. Web IQ opens current web grounding to Azure customers {#web-iq}

*For: Builders whose agents need information beyond their training and company data.*

Web IQ is broadly available to Azure customers. Its **Auto retrieval mode** combines web, news, images, video, places and weather retrieval. Auto Advanced can refine a query and retrieve again; Scopes lets organizations include or exclude web sources.

A travel-support agent, for example, might need current weather and place information rather than a model's old recollection. Fresh retrieval still needs source checking; it is not a guarantee that every retrieved page is right.

For health-related retrieval, **health-aware source ranking is GA**. It prioritizes sources for those scenarios; it is not clinical approval or a guarantee of correct medical advice. Microsoft also describes licensed-content grounding: a licence to use content and configuration of the grounding service remain separate requirements. [Health-aware ranking and source controls](https://blogs.bing.com/webiq/2026/11/web-iq-is-now-broadly-available-build-better-agents-that-keep-up-with-the-world/).

**Status:** Web IQ, Auto, Auto Advanced, Scopes, Places and Weather **GA**; Commerce **private preview**.

📖 [Web IQ availability and capabilities](https://blogs.bing.com/webiq/2026/11/web-iq-is-now-broadly-available-build-better-agents-that-keep-up-with-the-world/).

<!-- ignite-reviewed-media:web-iq -->
<details open>
<summary>View official images and animations (2)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-025-web-iq.gif" alt="Animated retrieval diagram frame connects AI Think to web, image and video retrieval inside a Web retrieval box." width="1600" height="650" loading="lazy" decoding="async" />
<figcaption>Animated retrieval diagram frame connects AI Think to web, image and video retrieval inside a Web retrieval box. Source: <a href="https://blogs.bing.com/webiq/2026/11/web-iq-is-now-broadly-available-build-better-agents-that-keep-up-with-the-world/">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-026-web-iq.png" alt="Web IQ diagram connects web, news, images, video, commerce, places, weather and licensed content, with a bring-your-own-licence footnote." width="692" height="454" loading="lazy" decoding="async" />
<figcaption>Web IQ diagram connects web, news, images, video, commerce, places, weather and licensed content, with a bring-your-own-licence footnote. Source: <a href="https://blogs.bing.com/webiq/2026/11/web-iq-is-now-broadly-available-build-better-agents-that-keep-up-with-the-world/">official product announcement or documentation</a>.</figcaption>
</figure>
</details>


## 37. New MAI models target specific jobs {#mai-models}

*For: Developers choosing coding, image, speech and security models.*

The MAI announcements span Code 2 and Code 2 Flash for coding, Image 2.7 and its Flash variant for image work, Realtime 1 for live speech, Cyber 2 Flash for code security, and transcription used by Dragon Copilot. These are not one model with one access policy.

For example, an image-editing workflow and a code-security scanner need different evaluations. I would compare each on the actual task, including failure handling, rather than pick from a single leaderboard.

| Model path | Availability at the cutoff |
|---|---|
| Code 2 / Code 2 Flash in GitHub Copilot | GA |
| Code 2 Flash in Foundry | Limited/private preview |
| Image 2.7 / Flash in Foundry | Public preview |
| Cyber 2 Flash | Preview through MDASH |
| Realtime 1 | Labs access; do not assume Foundry GA |
| Licensed Weights, for deploying and adapting models in your own Azure environment | Coming soon through Microsoft's Frontier Company engagement programme |

📖 [Microsoft AI model announcement](https://microsoft.ai/news/microsoft-ignite-2026/) · [Foundry model availability](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/from-model-choice-to-your-durable-advantage-build-ai-that-keeps-improving/4573609).

Foundry's wider model announcement is not limited to MAI. Model router expands model choice and adds AI Gateway integration; the sources give different pool counts, so the important check is which models your project's router supports. Video models from fal and Baseten's model-serving integration are **preview**. **Managed Compute is GA**, supplying dedicated, hourly GPU infrastructure managed by Foundry for supported open and custom models. That gives teams a choice between shared serverless access and dedicated capacity without managing the GPU cluster themselves. [Foundry routing, partner models and Managed Compute details](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/from-model-choice-to-your-durable-advantage-build-ai-that-keeps-improving/4573609) · [fal video-model preview stage](https://news.microsoft.com/events/ignite/2026/book-of-news/).

## 38. Decision-1.1 chooses a next step rather than writing a long answer {#decision-model}

*For: Builders routing tasks or classifying work.*

Microsoft-Decision-1.1 is a model for choosing among permitted options, with confidence signals and the ability to decline to choose when unsure. It adds image input and is available through Foundry, OpenRouter and Vercel.

Think of sorting an incoming request into “answer”, “research” or “ask a person”, rather than generating the final response itself. The application still has to enforce which actions are allowed.

**Status:** **GA**. Cowork's use of it has its own Frontier rollout.

📖 [Decision-1.1 announcement](https://commandline.microsoft.com/microsoft-decision-model-ga/).

## 39. Copilot SDK 2.0 updates the application-building foundation {#copilot-sdk}

*For: Developers embedding agent capabilities into applications.*

The SDK already featured in our Build recap. **Version 2.0** brings a native Rust runtime and the updated Copilot harness, with support across six programming languages and an emphasis on multi-tenant, high-scale applications. This is a version upgrade, not the SDK's first availability.

For example, a developer can put an agent inside an existing business application rather than send everyone to a separate chat interface. SDK availability does not remove that application's identity, tenancy or testing responsibilities.

**Status:** **GA**.

📖 [Copilot SDK 2.0 in the official Book of News](https://news.microsoft.com/events/ignite/2026/book-of-news/).

## 40. The GitHub Copilot app reaches Azure DevOps and existing browser sessions {#github-copilot-app}

*For: Development teams using Azure DevOps or GitHub Enterprise Server.*

The app's Azure DevOps integration can take a repository from a branch and code changes to a pull request. Optional agent merge can address CI failures and finish the request once the repository's checks and policies pass.

For example, a team could ask for a small fix in an Azure DevOps repository without moving that repository to GitHub. I would start with a bounded change and keep the existing review requirements.

**Status:** Azure DevOps integration and browser use **public preview**; GitHub Enterprise Server support **GA in app 1.2.0 or later**. Azure DevOps and GHES repositories do **not** support cloud sessions. Browser use is off by default, needs the extension in a Chromium-based browser and requires Computer Use and Browser Use to be enabled.

📖 [GitHub Copilot app Ignite releases](https://github.blog/changelog/2026-11-17-github-copilot-app-microsoft-ignite-releases/).

<!-- ignite-reviewed-video:github-copilot-app -->
<details open>
<summary>Watch official videos (2)</summary>

<p>Official video: <a href="https://github.com/user-attachments/assets/2f1f59ed-a889-46df-8a8d-720cec4a08f9%20">Work with Azure DevOps repositories in the GitHub Copilot app</a>. Preview. A proposed test fix is not a validated build. <a href="https://github.blog/changelog/2026-11-17-github-copilot-app-microsoft-ignite-releases/">Read the product announcement or documentation</a>.</p>

<p>Official video: <a href="https://github.com/user-attachments/assets/4fd64f98-4caf-4045-a64d-6d58ff37486f">Let Copilot work in your browser</a>. Preview. Browser interaction does not remove review and approval requirements. <a href="https://github.blog/changelog/2026-11-17-github-copilot-app-microsoft-ignite-releases/">Read the product announcement or documentation</a>.</p>
</details>

## 41. Entra sign-in gives Copilot CLI two different licensing paths {#github-cli-entra}

*For: Administrators and developers deciding how terminal-based Copilot access should work.*

Entra authentication can connect an eligible GitHub Enterprise Managed User account, use an eligible Microsoft 365 Copilot entitlement, or both. Those are different service and billing paths:

| Route | Requirements and boundary |
|---|---|
| GitHub Enterprise Managed User | OIDC-based EMU setup, a Copilot Business or Enterprise licence and the organization's Copilot CLI policy enabled. Uses GitHub inference and the GitHub plan. |
| Microsoft 365 Copilot | Organization in Frontier, a Microsoft 365 Copilot licence and usage-based billing. Uses Microsoft 365 inference and its model/access settings; no GitHub account is required for this route. |

For example, an administrator could evaluate the Microsoft 365 route without treating it as a free GitHub Copilot licence. The entitlement and the inference service are the important distinction.

**Status:** **Public preview on Windows and macOS**, with CLI **1.0.113 or later** required; Linux is planned later.

📖 [Entra sign-in, platforms and both entitlement paths](https://github.blog/changelog/2026-11-17-github-copilot-cli-adds-microsoft-entra-sign-in-as-a-preview/).

## 42. GitHub Copilot Evals tests whether a customization actually helps {#github-evals}

*For: People maintaining Copilot skills, custom agents and MCP tools.*

Evals lets you define a realistic task, state what a good result looks like and compare repeat runs after a change. It uses Vally as its evaluation engine. Each run needs approval.

For example, after changing a document-review skill, rerun the same checks to see whether it still finds the required issues. One good answer is not enough to establish that the change helped.

**Status:** **Public preview** for Copilot Individual, Business and Enterprise plans. Install the Evals extension or plugin in the supported VS Code, CLI or Copilot app experience; do not assume `/eval` is available without it.

📖 [GitHub Copilot Evals announcement and installation paths](https://github.blog/changelog/2026-11-17-github-copilot-evals-is-now-in-public-preview/).

<!-- ignite-reviewed-video:github-evals -->
<details open>
<summary>Watch official videos (1)</summary>

<p>Official video: <a href="https://github.com/user-attachments/assets/6e98f7df-128b-4932-b799-2a2c1372a9f9">GitHub Copilot Evals setup</a>. Public-preview setup example; no evaluation was run here. <a href="https://github.blog/changelog/2026-11-17-github-copilot-evals-is-now-in-public-preview/">Read the product announcement or documentation</a>.</p>
</details>

## 43. Copilot code review reaches Azure Repos and adds deeper checks {#github-code-review}

*For: Developers and reviewers using GitHub or Azure DevOps repositories.*

Copilot code review for **Azure Repos is GA**. This is a review service, separate from the Copilot app creating a pull request or Evals testing a custom agent.

The new review capabilities have their own stages: **adaptive effort**, **secret detection** and **cross-repository context** are public previews. Cross-repository context is limited to **public repositories**. Adaptive effort works within the configured maximum; it does not override an organisation's review settings.

For example, a team keeping its code in Azure DevOps could request an additional review before merging. I would use the findings as another set of checks, not as evidence that the change contains no bugs or exposed secrets.

**Status:** Azure Repos review **GA**; the additions above **public preview**. Azure Repos setup needs the appropriate admin and branch-policy configuration, with GitHub AI-credit usage billed to the linked Azure subscription.

📖 [Code review stages, scope and Azure Repos billing](https://github.blog/changelog/2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more/).

<!-- ignite-reviewed-media:github-code-review -->
<details open>
<summary>View official images and animations (4)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-030-github-code-review.png" alt="Pull-request Copilot review menu shows Adaptive Preview, Lite, Balanced and Max Preview effort choices." width="1104" height="1050" loading="lazy" decoding="async" />
<figcaption>Pull-request Copilot review menu shows Adaptive Preview, Lite, Balanced and Max Preview effort choices. Source: <a href="https://github.blog/changelog/2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more/">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-031-github-code-review.png" alt="Copilot code-review settings show Default review effort and Maximum review effort, with Adaptive selected and preview badges." width="2928" height="1598" loading="lazy" decoding="async" />
<figcaption>Copilot code-review settings show Default review effort and Maximum review effort, with Adaptive selected and preview badges. Source: <a href="https://github.blog/changelog/2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more/">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-032-github-code-review.png" alt="Copilot review comment flags an outdated function signature, cites another repository, proposes a replacement object and labels the finding High." width="2784" height="1125" loading="lazy" decoding="async" />
<figcaption>Copilot review comment flags an outdated function signature, cites another repository, proposes a replacement object and labels the finding High. Source: <a href="https://github.blog/changelog/2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more/">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-033-github-code-review.png" alt="Cropped review comment says Possible secret in code, recommends credential handling, and notes that detection does not verify whether a value is live. No example credential or source-code diff remains." width="2784" height="625" loading="lazy" decoding="async" />
<figcaption>Cropped review comment says Possible secret in code, recommends credential handling, and notes that detection does not verify whether a value is live. No example credential or source-code diff remains. Cropped to the review finding; credential-like example code is excluded. Source: <a href="https://github.blog/changelog/2026-11-17-copilot-code-review-adaptive-effort-secret-detection-and-more/">official product announcement or documentation</a>.</figcaption>
</figure>
</details>


<span id="secure"></span>

## 44. Entra adds agent identity, access and lifecycle controls {#identity}

*For: Identity and access administrators.*

New agent controls include identity for discovered local agents, policy plans and more targeted access. Some dynamic-permission and dynamic-control capabilities remain limited preview. Automated lifecycle management of agent identities is GA.

For example, an agent needs a human sponsor, an access boundary and a retirement path, not just a successful first sign-in. Think about all three before granting it a business process.

**Status:** **GA lifecycle management; mixed preview access controls**.

📖 [Detailed Entra announcement](https://techcommunity.microsoft.com/blog/microsoft-entra-blog/ai-is-changing-access-see-how-microsoft-entra-helps-you-stay-ahead-/4556456). For routing agent traffic into Global Secure Access, the product post says **preview** while the [Book of News says GA](https://news.microsoft.com/events/ignite/2026/book-of-news/); confirm that specific capability's stage before a production plan depends on it.

The wider security work also covers on-premises Exchange, SharePoint and Skype for Business Server, with availability varying by workload. Those foundations still matter when AI makes use of the information they hold. [On-premises security announcements](https://news.microsoft.com/events/ignite/2026/book-of-news/).

<!-- ignite-reviewed-media:identity -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-040-identity.png" alt="GitHub Copilot CLI instance details panel shows Medium risk, an Entra agent identifier and Windows workstation details beside the agents inventory." width="900" height="527" loading="lazy" decoding="async" />
<figcaption>GitHub Copilot CLI instance details panel shows Medium risk, an Entra agent identifier and Windows workstation details beside the agents inventory. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 45. The IT-admin MCP server connects an assistant to supported admin work {#it-admin-mcp}

*For: Identity and endpoint administrators evaluating administration through an AI assistant.*

**Microsoft MCP Server for IT Admins is GA**. It is a tool connection for administrators. The separate MCP firewall controls which tools agents may reach; Agent 365's Cowork plugin is another distinct experience.

An administrator could ask about supported Entra configuration, then review a proposed change. The current implementation guide distinguishes Entra read/manage operations from **read-only Intune support, excluding reporting**. Writes require explicit confirmation through a compatible MCP client; connecting a tool is not approval for every future change.

I would start with read-only checks and verify the supported operations and permissions before enabling writes. Do not infer support for every Microsoft 365 service from the server's name.

**Status:** Admin MCP server **GA**; MCP firewall **preview**, a separate network/tool-access control.

📖 [Entra's GA announcement](https://techcommunity.microsoft.com/blog/microsoft-entra-blog/ai-is-changing-access-see-how-microsoft-entra-helps-you-stay-ahead-/4556456) · [Current supported operations and confirmation requirements](https://github.com/microsoft/EnterpriseMCP).

<!-- ignite-reviewed-media:it-admin-mcp -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-050-it-admin-mcp.png" alt="Entra admin center MCP policies Edit rule screen shows a server condition, a tool selector, the tools/call method and a Block action; it is a network/tool-access policy screen, not an Intune containment screen." width="900" height="495" loading="lazy" decoding="async" />
<figcaption>Entra admin center MCP policies Edit rule screen shows a server condition, a tool selector, the tools/call method and a Block action; it is a network/tool-access policy screen, not an Intune containment screen. Separate Entra Global Secure Access MCP firewall preview, not Intune agent containment. Source: <a href="https://techcommunity.microsoft.com/blog/agent-365-blog/whats-new-in-microsoft-agent-365-ignite-2026/4571753">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 46. Purview separates today's labeling updates from January protection plans {#purview}

*For: Information-protection and data loss prevention (DLP) administrators.*

Microsoft is improving classification and planning protection based on sensitive information types, including material used to ground Copilot. The product announcement separates current improvements from the January wave:

| Capability | Announced stage |
|---|---|
| Auto-labeling scalability improvements | GA |
| Unified classification management and default library labels applied to data-at-rest | Public preview |
| Enhanced built-in sensitive information types | Available starting January 2027 |
| Recurring classification refresh, Copilot grounding protection and expanded local-agent DLP | Public preview in January 2027 |

For example, a policy could help restrict sensitive information used in an AI interaction even when a file has not already been manually labelled. It is a control to configure and validate, not a guarantee that all sensitive data is already protected.

The January plans are not controls to assume in this month's rollout. The product post says enhanced sensitive information types are “available starting January”; the wider Security post calls that classification wave GA in January.

📖 [Purview feature-level stages](https://techcommunity.microsoft.com/blog/microsoft-security-blog/secure-the-data-that-fuels-ai-with-microsoft-purview/4573266) · [January timing in the Security announcement](https://www.microsoft.com/en-us/security/blog/2026/11/17/security-for-the-agentic-era-powered-by-microsoft-perception/#secure-your-foundations).

<!-- ignite-reviewed-media:purview -->
<details open>
<summary>View official images and animations (5)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-082-purview.jpg" alt="Create a classifier dialog offers Exact data match, Trainable classifier, Sensitive info type and Document fingerprinting; some time estimates say TBD." width="846" height="703" loading="lazy" decoding="async" />
<figcaption>Create a classifier dialog offers Exact data match, Trainable classifier, Sensitive info type and Document fingerprinting; some time estimates say TBD. Unified-classification preview illustration; unfinished labels are part of the source artwork. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-security-blog/secure-the-data-that-fuels-ai-with-microsoft-purview/4573266">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-083-purview.jpg" alt="Purview auto-labeling creation dialog offers apply, remove or Auto-apply to default SPO only; the underlying policy list is dimmed." width="2434" height="1247" loading="lazy" decoding="async" />
<figcaption>Purview auto-labeling creation dialog offers apply, remove or Auto-apply to default SPO only; the underlying policy list is dimmed. Default library labels applied to data-at-rest are public preview. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-security-blog/secure-the-data-that-fuels-ai-with-microsoft-purview/4573266">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-084-purview.jpg" alt="Purview custom Copilot policy wizard shows a Block only action and sensitive-information-type conditions including ABA Routing Number." width="2020" height="1134" loading="lazy" decoding="async" />
<figcaption>Purview custom Copilot policy wizard shows a Block only action and sensitive-information-type conditions including ABA Routing Number. Copilot grounding protection is planned public preview in January 2027. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-security-blog/secure-the-data-that-fuels-ai-with-microsoft-purview/4573266">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-085-purview.jpg" alt="Copilot refuses to summarise a demo merger document because the organisation blocked processing some content types." width="1938" height="1086" loading="lazy" decoding="async" />
<figcaption>Copilot refuses to summarise a demo merger document because the organisation blocked processing some content types. January 2027 preview illustration, not a control validated here. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-security-blog/secure-the-data-that-fuels-ai-with-microsoft-purview/4573266">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-086-purview.png" alt="Cropped Windows demo shows an agent terminal stopping on a policy block and a Data Loss Prevention toast; browser address/session chrome is absent." width="1806" height="816" loading="lazy" decoding="async" />
<figcaption>Cropped Windows demo shows an agent terminal stopping on a policy block and a Data Loss Prevention toast; browser address/session chrome is absent. Cropped browser chrome. Microsoft’s synthetic demo of local-agent DLP planned for January preview. Source: <a href="https://techcommunity.microsoft.com/blog/microsoft-security-blog/secure-the-data-that-fuels-ai-with-microsoft-purview/4573266">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 47. Microsoft Perception coordinates security agents through playbooks {#perception}

*For: Security operations and exposure-management teams.*

Microsoft Perception, previously Project Perception, is GA. It brings together red agents that test, blue agents that investigate and green agents that remediate, with playbooks coordinating the work.

Imagine a suspicious alert becoming an investigation and a proposed response, rather than three manually assembled handovers. Your team still sets the guardrails and approves high-impact actions.

The **AI Transparency Initiative** is a standards effort, not a newly shipped enforcement control. **AI Readiness Initiatives in Perception are planned for preview in January 2027.** [Security foundations and transparency announcement](https://www.microsoft.com/en-us/security/blog/2026/11/17/security-for-the-agentic-era-powered-by-microsoft-perception/).

**Status:** Core Perception and several named agents **GA**; Web App Pen Test Agent **preview**; Risk Reduction Agent **public preview**; new integrations and playbooks have their own preview stages. GA for the platform is not GA for every playbook.

📖 [Microsoft Perception and individual agent stages](https://www.microsoft.com/en-us/security/blog/2026/11/17/security-for-the-agentic-era-powered-by-microsoft-perception/#delivering-agentic-security-at-microsoft-ignite).

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;">
<iframe src="https://www.youtube-nocookie.com/embed/mKE9tIwOlq4" title="Microsoft Security: Introducing Microsoft Perception" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>
</div>

*Official Microsoft Security video: [Introducing Microsoft Perception](https://www.youtube.com/watch?v=mKE9tIwOlq4). A Microsoft demonstration, not an investigation conducted here.*

<!-- ignite-reviewed-video:perception -->
<details open>
<summary>Watch official videos (2)</summary>

<p>Official video: <a href="https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/1307173-perceptionignite2026-0x1080-6439k">Microsoft Perception: playbook overview</a>. The platform and individual playbooks do not all share one release stage. <a href="https://www.microsoft.com/en-us/security/blog/2026/11/17/security-for-the-agentic-era-powered-by-microsoft-perception/">Read the product announcement or documentation</a>.</p>

<p>Official video: <a href="https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/1307173-demo2-0x1080-6439k">Microsoft Perception: Protect web app playbook</a>. Preview playbook demonstration, not a security test conducted here. <a href="https://www.microsoft.com/en-us/security/blog/2026/11/17/security-for-the-agentic-era-powered-by-microsoft-perception/">Read the product announcement or documentation</a>.</p>
</details>

## 48. Defender's integrated SOC and vulnerability shielding have different stages {#security-operations}

*For: Teams using Microsoft Defender and Sentinel.*

The Integrated Security Operations Center (ISOC) brings core security information and event management (SIEM), investigation and threat-protection experiences together. Vulnerability shielding is a separate preview for applying temporary protection while a permanent fix is prepared.

For example, a supported shielding action might reduce exposure during the gap before patching. **Temporary protection is not a substitute for the patch.**

**Status:** ISOC **core GA**; full SIEM breadth and the Book of News's included 90-day Defender-data retention offer **preview**. Vulnerability shielding and the new zero-day/emerging-threat intelligence experience are **preview**. Eligibility and ingestion terms still need checking.

📖 [ISOC, retention and threat-intelligence release stages](https://news.microsoft.com/events/ignite/2026/book-of-news/) · [How vulnerability shielding is intended to work](https://www.microsoft.com/en-us/security/blog/2026/11/17/security-for-the-agentic-era-powered-by-microsoft-perception/#secure-your-foundations).

## 49. MDASH extends the code-security preview {#mdash}

*For: Application-security teams evaluating automated code review.*

Codename MDASH expands its preview to larger repositories and additional security models, producing candidate vulnerability findings and proposed fixes that teams can review. Its findings can also guide the Web App Pen Test Agent.

For example, a team could use it to identify candidate vulnerabilities, then validate findings and review proposed fixes before merging. Neither a model's finding nor a benchmark is proof of an exploitable problem in your application.

**Status:** **Preview for eligible, accepted organizations**; signing up does not guarantee access. MAI Cyber model access here is not broad Foundry availability.

📖 [MDASH expansion and access conditions](https://www.microsoft.com/en-us/security/blog/2026/11/17/security-for-the-agentic-era-powered-by-microsoft-perception/#defend-with-agents).

## 50. Defender adds runtime protection for supported local AI agents {#local-agent-protection}

*For: Endpoint security teams allowing local coding and desktop agents.*

Defender extends protection to supported local agents on Windows, with agent-native integration for some products and network-based coverage for others. Audit and Block modes give administrators different rollout choices.

For example, a team could begin by observing a supported coding agent before deciding what to block. The coverage depends on the named agent and integration; “local agent protection” does not mean every tool or interaction is covered.

**Status:** **GA for Defender for Endpoint P2 customers**, with the supported-agent matrix applying.

📖 [Local-agent protection and coverage types](https://news.microsoft.com/events/ignite/2026/book-of-news/).

## 51. Endpoint controls are part of the AI rollout, not an afterthought {#endpoint-management}

*For: Windows, Intune and security administrators.*

The announcements extend policy and containment for supported local agents. New process-container controls are preview; learning and permissive modes are GA, helping teams understand normal behaviour before enforcing restrictions. Baseline protection aims to maintain critical device settings, while new experience controls give IT time to evaluate upcoming Windows experiences before introducing them.

For a pilot, I would first observe the agent's required communications, then narrow the policy. Turning on restrictions without that baseline can break legitimate work.

Intune's **software compliance policy is public preview**: mark Windows devices running specified unsanctioned agents noncompliant, then use Conditional Access to restrict company-resource access. That is a device-compliance decision, not a promise to detect every agent or a way to block just one action without affecting the device's access.

Microsoft also describes app protection for AI apps that integrate the **Intune SDK**, and rolling-out file/network policies for supported Microsoft Execution Containers. Check the actual app, platform and supported scenario before assuming the same protection applies everywhere. [Intune software compliance, app protection and containment](https://techcommunity.microsoft.com/blog/microsoftintuneblog/what%E2%80%99s-new-in-microsoft-intune-at-ignite/4570003).

**Status:** **Mixed GA and preview**. Windows baseline protection, broader app-update management and several new experience controls are **private preview**; declarative management **preview**. Windows Endpoint Security Platform is **GA**.

📖 [Windows isolation and Intune announcement details](https://news.microsoft.com/events/ignite/2026/book-of-news/).

<!-- ignite-reviewed-media:endpoint-management -->
<details open>
<summary>View official images and animations (2)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-088-endpoint-management.png" alt="Intune software-compliance policy lists restricted ChatGPT Desktop and a discovery rule using its package full name." width="1653" height="950" loading="lazy" decoding="async" />
<figcaption>Intune software-compliance policy lists restricted ChatGPT Desktop and a discovery rule using its package full name. Software compliance policy is public preview; it affects device compliance and Conditional Access. Source: <a href="https://techcommunity.microsoft.com/blog/microsoftintuneblog/what%e2%80%99s-new-in-microsoft-intune-at-ignite/4570003">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-089-endpoint-management.png" alt="Intune Agent containment Preview profile targets GitHub Copilot CLI and sets allowed or denied filesystem directories, network access and permissive-mode blocking." width="1920" height="1080" loading="lazy" decoding="async" />
<figcaption>Intune Agent containment Preview profile targets GitHub Copilot CLI and sets allowed or denied filesystem directories, network access and permissive-mode blocking. Containment preview for supported agents, not a guarantee of coverage for every tool. Source: <a href="https://techcommunity.microsoft.com/blog/microsoftintuneblog/what%e2%80%99s-new-in-microsoft-intune-at-ignite/4570003">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 52. Intune connects an investigation to a remediation plan {#intune-remediation}

*For: Endpoint teams investigating risk and deploying fixes.*

The **Vulnerability Remediation Agent** combines Defender vulnerability information with Intune device/app context to build and execute remediation playbooks. The separate **Perception experience in Intune** accepts a plain-language question, plans an investigation across supported sources and explains its steps with citations.

For example, an administrator could investigate an affected application, inspect the device scope and review a proposed deployment. Results can become custom reports or groups for follow-through. I would check the target group and rollout settings before allowing a remediation plan to reach production devices.

**Status:** Both experiences **limited public preview**. The Perception experience requires Intune customers to be onboarded to Perception; GA for the wider platform does not grant access to this preview.

📖 [Intune investigations, reporting and remediation stages](https://techcommunity.microsoft.com/blog/microsoftintuneblog/what%E2%80%99s-new-in-microsoft-intune-at-ignite/4570003).

<!-- ignite-reviewed-media:intune-remediation -->
<details open>
<summary>View official images and animations (3)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-090-intune-remediation.png" alt="Intune Perception displays a vulnerability remediation plan with application choice, supersedence, staged groups and an Approve plan and start remediation button; it is not evidence that deployment ran." width="936" height="498" loading="lazy" decoding="async" />
<figcaption>Intune Perception displays a vulnerability remediation plan with application choice, supersedence, staged groups and an Approve plan and start remediation button; it is not evidence that deployment ran. Limited public-preview plan with an approval button; no deployment was executed here. Source: <a href="https://techcommunity.microsoft.com/blog/microsoftintuneblog/what%e2%80%99s-new-in-microsoft-intune-at-ignite/4570003">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-091-intune-remediation.png" alt="Intune Perception explains a risky-user query and explicitly reports incomplete retrieval: its result is partial rather than a full count." width="936" height="538" loading="lazy" decoding="async" />
<figcaption>Intune Perception explains a risky-user query and explicitly reports incomplete retrieval: its result is partial rather than a full count. The demo response itself reports incomplete retrieval; it is not an exhaustive count. Source: <a href="https://techcommunity.microsoft.com/blog/microsoftintuneblog/what%e2%80%99s-new-in-microsoft-intune-at-ignite/4570003">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-092-intune-remediation.png" alt="Intune Perception custom report has a device-platform table and Windows-version column chart." width="1020" height="435" loading="lazy" decoding="async" />
<figcaption>Intune Perception custom report has a device-platform table and Windows-version column chart. Limited public-preview reporting example. Source: <a href="https://techcommunity.microsoft.com/blog/microsoftintuneblog/what%e2%80%99s-new-in-microsoft-intune-at-ignite/4570003">official product announcement or documentation</a>.</figcaption>
</figure>
</details>


## 53. GitHub Copilot Fusion can use supported local models {#windows-fusion}

*For: Developers with suitable Windows hardware.*

Hybrid routing can send coding work to local models on supported hardware, alongside cloud models. The Windows announcement names the GitHub Copilot app, CLI and VS Code.

A developer working on an appropriate machine could evaluate a local model for a bounded coding task. Local execution is a placement choice, not a blanket claim that the whole application has no cloud traffic.

**Status:** **Preview**, initially tied to named NVIDIA hardware and expanding AMD hardware support. This is separate from the broader MAI Code 2 model launch.

📖 [Windows hybrid developer announcement](https://blogs.windows.com/windowsexperience/2026/11/17/microsoft-ignite-2026-building-windows-for-the-next-era-of-work/).

## 54. A Cloud PC can run a compatible model, too {#cloud-pcs}

*For: IT and developers evaluating where model execution belongs.*

The Book of News marks compatible local-model execution on appropriately sized Windows 365 Cloud PCs GA, using Foundry Local. “Local” here means inside that Cloud PC, not necessarily on the physical laptop in front of you.

For example, a developer could use a sized Cloud PC for model evaluation without upgrading their laptop. Hardware sizing and model compatibility still determine whether the experiment is practical.

**Status:** Cloud PC model execution **GA**. Windows 365 admin assistant **preview**; Windows Server 2025 with AVD Hybrid **private preview**. Enhanced NVIDIA GPU streaming is a **separate early-2027 preview**, not the same GA claim.

📖 [Windows 365 and hybrid execution distinctions](https://news.microsoft.com/events/ignite/2026/book-of-news/).

## 55. Windows Server 2028 previews another AI execution location {#windows-server}

*For: Infrastructure teams considering on-premises inference.*

Windows Server 2028 enters preview, with work toward running inference across local server fleets. That extends the placement conversation from laptop and Cloud PC to infrastructure an organization manages directly.

Imagine a team evaluating inference close to a locally managed dataset instead of sending every request to hosted inference. It needs to validate the hardware, runtime, operating model and access controls, not just install a preview operating system.

**Status:** Server **public preview**; hybrid-intelligence capabilities **limited early access with hardware requirements**. Intune/Autopatch client-like management scenarios for Server 2028 are **private preview**.

📖 [Windows Server 2028 announcement](https://techcommunity.microsoft.com/blog/WindowsServerNewsandBestPractices/windows-server-2028-a-trusted-foundation-for-an-evolving-enterprise/4574112) · [Hybrid early-access limits and management stages](https://news.microsoft.com/events/ignite/2026/book-of-news/).

<span id="operate"></span>

## 56. Azure Copilot expands from advice into operational work {#azure-operations}

*For: Azure administrators, platform teams and site reliability engineers (SREs).*

The deployment agent is GA. Azure Copilot spaces and custom skills are public preview, helping teams supply reusable context and instructions. New SRE Agent enterprise controls are public preview; Monitor health models are GA.

For example, a platform team could define the context for an application once, then use it during an investigation. Azure Resource Manager's Model Context Protocol (MCP) server also gains write capabilities, making authorization and approval boundaries more important, not less. The linked announcement does not give that write addition a separate GA/preview label.

SRE Agent also expands collaboration through Teams, other agents and multicloud scenarios. For **Workload Center for SAP and Oracle**, the Book of News says **private preview** and the product post says **limited preview**. Neither establishes open access: check pilot eligibility. Those are different operational paths, not a reason to grant one agent unrestricted control over every environment. [Operational collaboration and workload-specific stages](https://techcommunity.microsoft.com/blog/azureinfrastructureblog/advancing-agentic-operations-on-azure-at-ignite-2026/4573831) · [Book of News preview label](https://news.microsoft.com/events/ignite/2026/book-of-news/).

**Status:** **Mixed GA and preview stages**.

📖 [Azure operations product announcement](https://techcommunity.microsoft.com/blog/azureinfrastructureblog/advancing-agentic-operations-on-azure-at-ignite-2026/4573831).

<!-- ignite-reviewed-media:azure-operations -->
<details open>
<summary>View official images and animations (1)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-034-azure-operations.png" alt="Agentic operations diagram stacks Experiences and tools, Intelligence engine and Resource estate across public, hybrid, multicloud, edge and IoT." width="1688" height="998" loading="lazy" decoding="async" />
<figcaption>Agentic operations diagram stacks Experiences and tools, Intelligence engine and Resource estate across public, hybrid, multicloud, edge and IoT. Source: <a href="https://techcommunity.microsoft.com/blog/azureinfrastructureblog/advancing-agentic-operations-on-azure-at-ignite-2026/4573831">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 57. Azure Catalyst connects application and data modernization {#azure-catalyst}

*For: Teams moving or modernizing existing workloads.*

Azure Catalyst joins assessment, planning and execution across applications and data, connecting Azure Migrate with GitHub Copilot modernization. Rulebooks and bring-your-own-model support are GA; many new workload-specific capabilities are preview.

Imagine assessing an application and its database together rather than producing two unrelated migration plans. That is a useful direction, but each target and migration path still needs its own validation.

One concrete addition is **AI-assisted Oracle application conversion**, alongside schema conversion and data migration to PostgreSQL. The `migrate-oracle-app` skill helps change application code; it does not make an application compatible merely because its database moved. I would review the generated changes and run the application's own tests. The new migration paths are **preview**, and the documented offline data-migration path has its own supported Oracle-version requirements. [Oracle schema, data and application-conversion details](https://techcommunity.microsoft.com/blog/adforpostgresql/complete-oracle-to-postgresql-migration-move-your-schema-data-and-application-co/4573626).

**Status:** Catalyst **GA**, with many extensions **public preview**. Do not turn the umbrella's label into GA for every SAP, Oracle, MongoDB, container or SQL workflow.

📖 [Catalyst capability matrix and announcement](https://techcommunity.microsoft.com/blog/appsonazureblog/azure-catalyst-one-connected-agent-led-modernization-experience-across-apps-data/4573988).

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;">
<iframe src="https://www.youtube-nocookie.com/embed/m_gxDepG7i4" title="Microsoft official Azure Catalyst modernization demonstration" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>
</div>

*Official video embedded in the [Azure Catalyst announcement](https://techcommunity.microsoft.com/blog/appsonazureblog/azure-catalyst-one-connected-agent-led-modernization-experience-across-apps-data/4573988).*

<!-- ignite-reviewed-media:azure-catalyst -->
<details open>
<summary>View official images and animations (2)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-035-azure-catalyst.png" alt="Oracle-to-PostgreSQL application assessment report lists architecture, migration impact, readiness and conversion criteria, with a sanitized-evidence notice." width="975" height="585" loading="lazy" decoding="async" />
<figcaption>Oracle-to-PostgreSQL application assessment report lists architecture, migration impact, readiness and conversion criteria, with a sanitized-evidence notice. Assessment output is not proof of a completed or validated migration. Source: <a href="https://techcommunity.microsoft.com/blog/adforpostgresql/complete-oracle-to-postgresql-migration-move-your-schema-data-and-application-co/4573626">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-036-azure-catalyst.png" alt="Oracle-to-PostgreSQL conversion report lists validation and test sections and explicitly says Runtime validation needed." width="975" height="585" loading="lazy" decoding="async" />
<figcaption>Oracle-to-PostgreSQL conversion report lists validation and test sections and explicitly says Runtime validation needed. The report itself says runtime validation is still needed. Source: <a href="https://techcommunity.microsoft.com/blog/adforpostgresql/complete-oracle-to-postgresql-migration-move-your-schema-data-and-application-co/4573626">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 58. The data announcements help agents retrieve and operate, not just chat {#ai-data}

*For: Database teams and builders of data-backed agents.*

The useful distinctions are at capability level:

| Change | What it helps with | Stage |
|---|---|---|
| Cosmos DB semantic reranker and Shell | Reorder retrieved results by meaning; query and manage data, including MCP workflows | GA |
| Cosmos DB AI-assisted data modeler | Suggest partitioning and container choices for review | Preview |
| Redis 8 and Azure Managed Redis agent kit | Context/memory patterns and Redis configuration guidance | Preview |
| Database Hub in Fabric | Discover and manage a database estate | GA |
| SQL and PostgreSQL database agents | Investigate health/performance and recommend or perform approved actions | Preview |
| Azure HorizonDB | A managed PostgreSQL-compatible database option | GA |
| Fabric HorizonDB | PostgreSQL within Fabric | Public preview |

A **local Azure SQL Database container** and local-to-cloud workflow are also **public preview**. Developers can try vector and embedding workflows locally, including `AI_GENERATE_EMBEDDINGS`, before moving a suitable application to Azure. Running the local container does not require an Azure subscription; cloud deployment and connected model usage have their own charges. Also keep **HorizonDB service GA** separate from its preview AI Functions, AI Pipelines and model-management additions. [Database product announcement and capability-level stages](https://techcommunity.microsoft.com/blog/AzureSQLBlog/whats-new-in-databases-at-microsoft-ignite-2026-ai-ready-data-for-apps-and-agent/4570764).

A database agent might explain a performance issue and propose a fix. I would want to see the approval and rollback path before permitting the action.

📖 [Official Azure data announcements](https://news.microsoft.com/events/ignite/2026/book-of-news/). The table separates existing service availability from each new AI feature.

<!-- ignite-reviewed-video:ai-data -->
<details open>
<summary>Watch official videos (1)</summary>

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;"><iframe src="https://www.youtube-nocookie.com/embed/6xNqWkvILMQ" title="Azure HorizonDB + VS Code: Your AI App Development Workspace" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>
<p>Official video: <a href="https://www.youtube-nocookie.com/embed/6xNqWkvILMQ">Azure HorizonDB + VS Code: Your AI App Development Workspace</a>. Official product illustration; release stages above apply. <a href="https://techcommunity.microsoft.com/blog/azuresqlblog/whats-new-in-databases-at-microsoft-ignite-2026-ai-ready-data-for-apps-and-agent/4570764">Read the product announcement or documentation</a>.</p>
</details>

## 59. Cosmos adds managed agent access, visual retrieval and memory tools {#cosmos-agent-memory}

*For: Builders whose agents need to find information and keep useful context between tasks.*

These are three different building blocks, not one “memory” switch:

| Building block | What it does | Announced stage |
|---|---|---|
| Managed Cosmos MCP Server | Gives supported agents managed access to schema discovery, retrieval and search tools | Public preview |
| Automatic embedding generation | Creates the vector representations used for retrieval | Public preview |
| Microsoft Embedding 1 | Represents text, images and document pages for multimodal retrieval | Available through Cosmos embedding service; Foundry coming soon |
| Agent Memory Toolkit | Python tools for conversation history, summaries, facts and cross-thread context | Preview |

For example, a maintenance assistant could retrieve a diagram from a scanned manual and keep reviewed follow-up context for another session. An embedding helps find the material; the memory toolkit manages retained context. Neither decides your retention policy or guarantees that an extracted fact is correct.

Cosmos service setup still applies even when you use generated vectors elsewhere. I would test what gets retained, how conflicting facts are reconciled and how to remove context before connecting real business data.

**Status:** **Mixed preview and service availability**, not Foundry GA for Embedding 1. The memory preview has no SLA.

📖 [Cosmos Ignite capabilities](https://devblogs.microsoft.com/cosmosdb/whats-new-azure-cosmos-db-ignite-2026/) · [Agent Memory Toolkit scope and preview terms](https://learn.microsoft.com/en-us/azure/cosmos-db/gen-ai/agent-memory-toolkit).

<!-- ignite-reviewed-media:cosmos-agent-memory -->
<details open>
<summary>View official images and animations (2)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-100-cosmos-agent-memory.png" alt="Cosmos design diagram runs from Workload through AI-assisted design and human Review into several database structures." width="643" height="322" loading="lazy" decoding="async" />
<figcaption>Cosmos design diagram runs from Workload through AI-assisted design and human Review into several database structures. Separate AI-assisted data-modeling diagram, not an Agent Memory Toolkit workflow. Source: <a href="https://devblogs.microsoft.com/cosmosdb/azure-cosmos-db-ai-agent-developer-tools/">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-101-cosmos-agent-memory.png" alt="Diagram connects an AI client to Managed MCP and then Azure Cosmos DB with bidirectional arrows." width="643" height="322" loading="lazy" decoding="async" />
<figcaption>Diagram connects an AI client to Managed MCP and then Azure Cosmos DB with bidirectional arrows. Separate managed-MCP architecture, not the memory-toolkit architecture. Source: <a href="https://devblogs.microsoft.com/cosmosdb/azure-cosmos-db-ai-agent-developer-tools/">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

## 60. Agent infrastructure extends from managed Foundry into AKS {#azure-infrastructure}

*For: Platform engineers who need more infrastructure control.*

Microsoft is previewing deployment of open-weight models and agents from Foundry into customer Azure Kubernetes Service (AKS) clusters. Agent Grid adds centralized interaction policies; Agent Sandbox for AKS adds VM-level isolation for agent-written code; Flex nodes extend clusters to customer servers.

For example, a team with specific region or infrastructure requirements could keep a familiar Foundry workflow while controlling more of the deployment. That extra control also brings more operational responsibility.

**Status:** These infrastructure paths **preview**. Cobalt 200 VMs are **GA**, but that does not make the surrounding preview stack GA.

📖 [Azure infrastructure announcements](https://azure.microsoft.com/en-us/blog/microsoft-ignite-2026-whats-new-in-azure-the-platform-purpose-built-for-ai/).

Confidential AI infrastructure also gets three **preview** paths: VR72 multi-GPU confidential computing for larger models, Azure Confidential Enclaves and AKS Kata confidential containers for narrower trusted execution boundaries, and Azure Confidential Clean Room for controlled multiparty analytics. For teams handling sensitive workloads, those are evaluation options with distinct threat models, not a blanket promise that a workload is confidential merely because it runs in Azure. [Confidential-computing announcement and stages](https://news.microsoft.com/events/ignite/2026/book-of-news/).

**Supporting changes, deliberately grouped here:** The Book of News also covers Chaos Studio Workspaces and the AKS extension (GA), DocumentDB developer/security additions, Azure SQL modernization and PostgreSQL migration options. Those can support AI applications, but are not all new AI features. The [full infrastructure and database detail](https://news.microsoft.com/events/ignite/2026/book-of-news/) keeps their separate release labels.

<span id="build"></span>

## 61. Foundry closes the loop between production evidence and improvement {#foundry-improvement}

*For: Teams running agents beyond a demonstration.*

Foundry's improvement loop is straightforward: establish a baseline, identify problems, optimize, then validate. Multi-turn evaluation and Insights are GA. New annotation, golden-dataset and optimizer extensions are preview.

For a support agent, a failed conversation can become a reviewed test case instead of disappearing into a log. The important boundary: a suggested improvement does not silently become the production version.

**Status:** Multi-turn evaluation, Insights and the base Agent Optimizer **GA**; new skill/cost optimization and insights-to-optimizer paths **preview**. Hosted-agent concurrency improvements and voice agents are GA; faster starts and the Copilot harness in Foundry are preview.

📖 [Foundry continuous-improvement announcement](https://azure.microsoft.com/en-us/blog/continuous-improvement-comes-to-microsoft-foundry/) · [Base Agent Optimizer GA announcement](https://news.microsoft.com/events/ignite/2026/book-of-news/).

The harness is the part that manages an agent's work across steps. This official demo goes deeper on that preview:

<div style="aspect-ratio:16/9;width:100%;margin:var(--space-4) 0;">
<iframe src="https://www.youtube-nocookie.com/embed/4vCbQMUVV-I" title="Microsoft Mechanics: Copilot harness in Microsoft Foundry" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>
</div>

*Official Microsoft Mechanics video: [Copilot harness in Foundry](https://www.youtube.com/watch?v=4vCbQMUVV-I), in preview.*

<!-- ignite-reviewed-media:foundry-improvement -->
<details open>
<summary>View official images and animations (3)</summary>

<figure>
<img src="/images/blog/ignite-2026/official-027-foundry-improvement.webp" alt="Foundry continuous-improvement infographic has an illustrative percentage curve above Establish, Identify, Optimize and Validate stages with separate GA/Preview badges." width="2048" height="1393" loading="lazy" decoding="async" />
<figcaption>Foundry continuous-improvement infographic has an illustrative percentage curve above Establish, Identify, Optimize and Validate stages with separate GA/Preview badges. Microsoft’s illustrative improvement curve is not a measured result or a guaranteed gain. Source: <a href="https://azure.microsoft.com/en-us/blog/continuous-improvement-comes-to-microsoft-foundry/">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-028-foundry-improvement.gif" alt="Foundry Reduce cost Preview optimizer setup offers Auto or Choose targets, with loan-officer agent version selected." width="1120" height="630" loading="lazy" decoding="async" />
<figcaption>Foundry Reduce cost Preview optimizer setup offers Auto or Choose targets, with loan-officer agent version selected. Official optimizer demo. Its scores, latency and cost deltas are not results measured here. Source: <a href="https://azure.microsoft.com/en-us/blog/continuous-improvement-comes-to-microsoft-foundry/">official product announcement or documentation</a>.</figcaption>
</figure>

<figure>
<img src="/images/blog/ignite-2026/official-029-foundry-improvement.png" alt="Foundry evaluator-creation screen offers Rubric, Prompt and Code, auto-generated rubric, quality dimensions and a pass-score threshold; this is evaluation rather than a training console." width="1600" height="900" loading="lazy" decoding="async" />
<figcaption>Foundry evaluator-creation screen offers Rubric, Prompt and Code, auto-generated rubric, quality dimensions and a pass-score threshold; this is evaluation rather than a training console. Evaluator setup, not the separate training console. Source: <a href="https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/from-model-choice-to-your-durable-advantage-build-ai-that-keeps-improving/4573609">official product announcement or documentation</a>.</figcaption>
</figure>
</details>

<!-- ignite-reviewed-video:foundry-improvement -->
<details open>
<summary>Watch official videos (1)</summary>

<p>Official video: <a href="https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/1307367-microsoftfoundry2-0x1080-6439k">Microsoft Foundry overview</a>. Official product illustration; release stages above apply. <a href="https://azure.microsoft.com/en-us/blog/continuous-improvement-comes-to-microsoft-foundry/">Read the product announcement or documentation</a>.</p>
</details>

## 62. Managed and Programmed Training offer different levels of control {#foundry-training}

*For: Teams with evidence that prompting and retrieval are not enough.*

Managed Training is the renamed managed fine-tuning path. Programmed Training gives developers Python-level control over training recipes on serverless GPUs.

For example, a team classifying specialist maintenance notes might compare a tuned smaller model with its existing baseline. The decision should come from its own held-out evaluation, not another customer's savings figure.

**Status:** New training capabilities **preview**; Programmed Training **public preview**. Model availability and access restrictions still apply.

📖 [Foundry training announcement](https://azure.microsoft.com/en-us/blog/continuous-improvement-comes-to-microsoft-foundry/) · [Programmed Training public-preview details](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/from-model-choice-to-your-durable-advantage-build-ai-that-keeps-improving/4573609).

## 63. Foundry IQ adds knowledge graphs and a new retriever {#foundry-iq}

*For: Builders grounding agents in documents and organizational knowledge.*

Knowledge graphs and Microsoft Retriever 1 enter public preview. The aim is to preserve useful relationships across information, not just retrieve isolated chunks of text.

For example, an engineering agent might need to connect a component, its specification and the procedure that applies to it. A better relationship map is useful only if the underlying material and access configuration are right.

**Status:** Graphs and Retriever 1 **public preview**; the indexed SharePoint source is **GA** with supported permissions. Serverless GA and the new managed resource preview are **December plans**, not current releases. OneLake item permissions and Purview-label enforcement are **preview**.

📖 [Foundry IQ product announcement](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/foundry-iq-introducing-knowledge-graphs-engineered-for-agents/4572683).

## 64. Fabric moves from answering about data to building data apps {#fabric-apps}

*For: BI teams, app builders and people working with governed business metrics.*

Fabric IQ brings semantic-model definitions and business context into more experiences. Rayfin, Fabric's connected application backend, and Fabric apps are GA, combining application backend capabilities with Fabric data and governance. Power BI Pro customers also get a **preview** path for building custom data apps from semantic models.

For example, a planning app could use the approved revenue definition and let authorized people submit changes, instead of treating a report as the end of the workflow.

Keep the subfeatures separate: semantic-model access in Copilot is GA; **Fabric IQ in Excel's Edit with Copilot is preview**; the Copilot Managed Runtime database integration is also preview. “Fabric apps GA” does not override either label.

The Microsoft IQ post also describes **embedding conversational experiences in Fabric apps as preview**. That is distinct from GA app deployment; builders should not carry the core-app label over to the embedded conversation.

Microsoft also announces Fabric IQ context for external assistants, including ChatGPT and Claude plugins, and ontology context for GitHub Copilot. An ontology describes the business entities and relationships behind the data, such as a customer, order and delivery. A developer could use that context when building an application instead of guessing how a metric is defined. Treat these as **announced preview integrations**, not evidence that every connector is already accessible. [Fabric IQ integration announcements](https://azure.microsoft.com/en-us/blog/introducing-the-new-microsoft-iq-putting-your-organizations-intelligence-to-work-in-every-agent/).

**Status:** **GA core apps, mixed integration stages**.

📖 [Fabric IQ, Rayfin, Fabric apps and Power BI announcements](https://news.microsoft.com/events/ignite/2026/book-of-news/) · [Runtime integration's database-only preview scope](https://learn.microsoft.com/en-us/microsoft-365/copilot-managed-runtime/backend-integration/fabric-integration).

<p id="admin-checks"><strong>Dates and admin checks</strong></p>

The practical next step is not to enable everything. Pick one useful workflow and check its actual release stage, licence, billing policy and approval boundary.

| When | What to check |
|---|---|
| **At this cutoff — 18 November 2026** | Check tenant rollout for Home, Office and Copilot Managed Runtime. Keep Frontier/private-preview pilots separate from production commitments. |
| **Before enabling a plugin or action** | Confirm the product licence, Copilot Credits policy, supported environment, application permissions and required regional settings. A visible plugin is not proof of usable access. |
| **Before enabling usage-based work** | Review [cost controls](#agent-value) and [Business Analytics prerequisites](#agent-business-analytics), assign budget owners and test the policy's supported enforcement. Estimated assistance is not proof of savings, and a delayed report is not a real-time spending meter. |
| **Before autonomous or computer-use work** | Name an owner, limit tools and destinations, define approvals, inspect logs and test how to stop or roll back the work. |
| **November rollout checks** | Check Cowork's GCC rollout separately from commercial availability. |
| **December / year-end 2026 plans** | Recheck Code GA, Studio Agent Accounts public preview, the Agent 365 action center private preview and broader **agent** cost/value views, Foundry IQ serverless, and the Copilot harness tool for Windows 365 for Agents. Business Analytics plans the one-or-more-licence expansion by **mid-December**. SharePoint plans GA for its admin Governance Hub and Agent Access Heatmap, and public preview for agentic-user collaboration restrictions. Edge plans skills-recorder and interactive-brief previews; Sales Cloud in Teams plans open beta later this year. Plans are not availability confirmations. |
| **January / early 2027 plans** | Recheck Purview's classification and DLP wave, Perception AI Readiness Initiatives, and the separate Foundry MCP / GPU-streaming Cloud PC previews. |

Those dates come from the feature references above and the [official Book of News](https://news.microsoft.com/events/ignite/2026/book-of-news/). They are not a promise that a feature will reach every tenant on the same day.

My take: start with a job small enough to inspect end to end. A better agent is useful. A better agent with the right context, a sensible spending limit and a clear approval boundary is something you can actually introduce at work.
