---
title: "Auditing Microsoft 365 Copilot: What's Logged, Where to Find It, and How Long It's Kept"
list_title: "Auditing Microsoft 365 Copilot — A Practical Guide"
description: "A plain-English guide to auditing Microsoft 365 Copilot: what a Copilot interaction records, where to find it in Microsoft Purview, how supported apps and agents show up, who can read prompts, and how long records are kept."
date: 2026-08-11
lastmod: 2026-08-11
hub_id: "it-admins"
card_tag: "Security"
tag_class: "security"
layout: "notebook"
stamp: "field notes"
intro_note: "↗ for the admin or CISO asking \"can we actually see what Copilot does?\""
founder_note: |
  "Can we actually see what Copilot did?" is one of the questions I get asked most — usually by a security or compliance lead, a little nervously, right before or after a rollout.

  The short answer is yes, with a few important boundaries — and the controls live in Microsoft Purview, not the place most admins look first. So I sat down, read through the current Microsoft documentation, and wrote it up in one place.

  This is that guide. It's long because the topic is, but each section stands on its own — jump to what you need.
faq_render: false  # manual FAQ in body; frontmatter faq powers the schema
faq:
  - question: "Does Microsoft 365 Copilot log what users ask it?"
    answer: "Yes, when auditing is on. Supported Microsoft 365 Copilot interactions are written to the Microsoft Purview audit log as CopilotInteraction records. The record identifies who interacted, when, which app or agent was involved, the prompt and response messages, and the resources Copilot referenced (with their sensitivity labels). The actual prompt and response text is retrieved separately by authorised Purview experiences and needs additional permissions. Auditing is on by default for Microsoft 365 E3 and E5, and it lives in Microsoft Purview, not the Microsoft 365 admin center."
  - question: "Where do I find Copilot audit logs?"
    answer: "In the Microsoft Purview portal (purview.microsoft.com), not the Microsoft 365 admin center. Three related workflows help — they aren't one shared datastore: Audit searches the audit events (filter the CopilotInteraction record type or 'Copilot activities'); DSPM for AI presents the same AI activity as a dashboard (Activity explorer → AI activities); and eDiscovery separately searches the mailbox-backed prompt and response items, and can delete them for legal cases or data-spillage cleanup."
  - question: "Can my manager or employer read my Copilot prompts?"
    answer: "Being a manager doesn't itself grant access. The audit trail records that an interaction happened, but viewing the actual prompt and response text requires additional, specific Microsoft Purview permissions. A manager — or anyone else — could read that content only if your organisation separately grants those permissions for authorised compliance or investigation work. It isn't open to every admin, and it isn't tied to someone's job title."
  - question: "Are Copilot agents audited too?"
    answer: "Yes. Interactions with agents — including declarative agents and custom-engine agents built in Microsoft Copilot Studio — are logged, and the audit record includes AgentId, AgentName, and AgentVersion (for example, an AgentId like CopilotStudio.Declarative.<guid>). For Microsoft Agent 365, Microsoft's guidance is that you 'audit an agent instance as you would a user', covering human-to-agent, agent-to-human, agent-to-tool, and agent-to-agent interactions."
  - question: "Which apps generate Copilot audit records?"
    answer: "The audit record's AppHost field identifies the surface: Microsoft 365 Copilot Chat (shown as BizChat), the Bing/Windows/Edge sidebar experience (Bing), office.com (Office), and the individual apps — Word, Excel, PowerPoint, OneNote, and others such as Bookings and Copilot in Azure. Note that some values (BizChat especially) can represent several clients — Teams, the Microsoft 365 app, or the web — so AppHost identifies the host category rather than always pinpointing the exact client."
  - question: "How long are Copilot audit records kept?"
    answer: "It depends on your compliance licence, not on Copilot. Microsoft 365 E3 retains audit data for 180 days. E5 or the E5 Compliance add-on retains it for about a year and adds advanced eDiscovery and longer, customisable retention. Auditing of non-Microsoft AI apps (like ChatGPT or Gemini) uses pay-as-you-go billing and is retained for 180 days."
  - question: "Do I have to turn Copilot auditing on?"
    answer: "There's no separate 'Copilot logging' switch — it rides on Microsoft Purview Audit. If auditing is on, supported Copilot interactions are captured. Auditing is on by default for Microsoft 365 E3 and E5. On Microsoft 365 Business plans it may be off, in which case you enable it once in the Purview Audit solution (the 'Start recording user and admin activity' banner)."
  - question: "Can Purview audit non-Microsoft AI apps like ChatGPT or Gemini?"
    answer: "Yes, to a degree. Alongside Microsoft Copilots, Purview can capture interactions with connected/registered AI apps and with unmanaged third-party AI apps such as ChatGPT, Google Gemini, and DeepSeek — the latter detected through browser activity via Microsoft Defender for Cloud Apps. These use the AIAppInteraction and ConnectedAIAppInteraction record types and pay-as-you-go billing with 180-day retention."
  - question: "Where are Microsoft 365 Copilot prompts and responses stored?"
    answer: "In a hidden folder inside the user's own Exchange Online mailbox — the same substrate that stores Teams messages. Microsoft's documentation says data from generative AI messages is stored in a hidden folder in the mailbox of the user who runs the AI app; it isn't meant to be opened directly by users or admins, but compliance tools like eDiscovery can search it. Each Copilot turn is stored as an individual message-class item (for example IPM.SkypeTeams.Message.Copilot.BizChat)."
  - question: "Can Copilot interaction data be deleted, and does clearing my history remove it?"
    answer: "Copilot data can be deleted three ways, all generally available: automatically when a retention policy for the 'Microsoft Copilot experiences' location expires; by the user clearing their own history in the My Account portal (myaccount.microsoft.com); or by an admin using the eDiscovery search-and-delete workflow via Microsoft Graph. But a user clearing history does not wipe the compliance copy: deleted items move to a hidden SubstrateHolds folder, and if a retention policy, Litigation Hold, or eDiscovery hold applies, permanent deletion is suspended and the content stays discoverable — even in an inactive mailbox after the person leaves."
images: ["images/og/blog/auditing-microsoft-365-copilot.jpg"]
og_headline: "Auditing Copilot, end to end"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - purview
  - security
  - governance
sitemap:
  priority: 0.9
---

"Can we actually see what Copilot did?" is a question I hear often from security and compliance teams. The short answer: **yes — for supported experiences, when auditing is on** (it's on by default for E3/E5). The catch: the controls live in **Microsoft Purview**, not the Microsoft 365 admin center where most people look first.

Here's what I could piece together from the current Microsoft documentation — what's logged in a single Copilot interaction, where to find it, how agents and apps show up, who's actually allowed to read prompts, and how long audit records are kept.

**Quick links:** [TL;DR](#tldr) · [The big picture](#the-big-picture) · [What's in one record](#whats-captured-in-a-single-interaction) · [Where to look](#where-to-look-in-purview) · [Apps & agents](#how-apps-and-agents-show-up) · [Beyond audit](#beyond-audit-the-other-purview-tools) · [Where the data lives](#where-the-data-lives-and-can-you-delete-it) · [Before you search](#before-you-search) · [Privacy](#privacy-who-can-actually-read-prompts) · [Troubleshooting](#troubleshooting-why-you-see-nothing) · [FAQ](#common-questions)

## TL;DR

- Supported Copilot interactions are logged to the **Microsoft Purview audit log** as **`CopilotInteraction`** records by Audit (Standard) — when auditing is on (on by default for E3/E5).
- {{< hi >}}It lives in **Microsoft Purview** (`purview.microsoft.com`), not the Microsoft 365 admin center.{{< /hi >}}
- The record *identifies* a lot — the **prompt and response** messages, the **files and sites** Copilot used (with sensitivity labels), the **app** and any **agent**, and whether it used the **web**. The prompt/response *text* is stored separately and needs extra permissions to read.
- Three related Purview workflows help — not one datastore: **Audit** searches the events, **DSPM for AI** shows a dashboard, and **eDiscovery** searches — and can delete — the mailbox-backed content.
- **Agents are audited too**, and Purview can also audit supported **non-Microsoft AI** apps (ChatGPT, Gemini) once the required collection is set up.
- **Reading prompt/response text needs extra Purview permissions** — being a manager, or a general admin, doesn't grant it by itself.
- Retention follows your licence: **E3 = 180 days**, **E5 ≈ 1 year**.

<div class="living-doc-banner">

🔄 **This is a living document.** Copilot's governance surface moves quickly, so names and portals change. Everything here is based on current Microsoft Learn documentation. Where a capability is still in **preview**, I've said so. If you spot anything that's moved on, [tell me](/feedback/) and I'll update it. **Last checked: August 2026.**

</div>

## The big picture

Here's the mental model I use. A single Copilot interaction isn't just "a chat message" — it's a rich record that can surface across several Microsoft Purview tools, each answering a different question.

<p><img src="/images/blog/auditing-microsoft-365-copilot/00-hero-audit-map.webp" alt="Diagram: one Copilot interaction (prompt, response, files used, web query, agent or app) flows into five Microsoft Purview surfaces — Purview Audit, DSPM for AI, eDiscovery, Communication Compliance, and Retention and holds." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

{{< margin >}}I'm a Copilot Solution Engineer at Microsoft NZ. This is the write-up I wish I'd had the first time a CISO asked me to walk them through Copilot's audit trail.{{< /margin >}}

The rest of this guide walks each of those boxes.

## What's captured in a single interaction

When a user interacts with Copilot, Purview writes a `CopilotInteraction` audit record. The record includes more than a timestamp — these are the fields I found most useful:

- **The prompt and the response.** The `Messages` field identifies the prompt and response messages by `ID`, marks each with `IsPrompt`, and can carry a `JailbreakDetected` flag when a prompt looks like a jailbreak attempt. (The message *text* isn't stored in this record — it's retrieved separately, behind the permission gate covered below.)
- **The files and sites Copilot used.** `AccessedResources` lists every resource Copilot touched to answer — file, email, meeting — including its **`SensitivityLabelId`**, the `Action` (read/create/modify), whether a policy blocked it (`PolicyDetails`, `Status`), and `XPIADetected` (a flag for potentially malicious instructions — a cross-prompt-injection attempt — detected in that content).
- **Where the user was.** `Contexts` records the file, Teams chat, or meeting the interaction happened in.
- **The app.** `AppHost` tells you the surface (more on that below).
- **The agent.** `AgentId`, `AgentName`, and `AgentVersion` when an agent was involved.
- **Web + plugins.** `AISystemPlugin` — for example an `Id` of `BingWebSearch` — tells you web grounding was used. The exact generated query isn't in this field; it's surfaced separately in supported Purview experiences.
- **DLP signals.** `DLPEvaluationDeferred` is a bitmask showing which data-loss-prevention evaluations couldn't complete immediately and were deferred for later — `Prompt`, `Response`, `Grounding`, or `WebGrounding`.
- **Model & record classification.** `ModelTransparencyDetails` identifies the model provider, and `Operation` / `RecordType` / `Workload` distinguish first-party Copilot (`CopilotInteraction` / `Copilot`) from connected apps (`ConnectedAIAppInteraction`) and unmanaged third-party AI (`AIAppInteraction`).

You can see the raw shape of this in the audit log itself. Here's a single record opened up, and its expandable `CopilotEventData`:

<p><img src="/images/blog/auditing-microsoft-365-copilot/03-purview-copilot-record.webp" alt="The details panel for a single CopilotInteraction audit record, showing date, activity, app identity, and record type." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*One Copilot interaction, opened in the audit log. (Lab demo data — identifiers redacted.)*

<p><img src="/images/blog/auditing-microsoft-365-copilot/04-purview-copilot-eventdata.webp" alt="The CopilotEventData JSON inside a Copilot audit record, showing AppHost, AccessedResources, and message fields, with user and URL details redacted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Inside `CopilotEventData` — the app, the resources Copilot accessed, and the message data. (Lab demo data — user and URLs redacted.)*

## Where to look in Purview

Three surfaces. They can each investigate the same interaction, but they play different roles — **Audit** searches the audit events, **DSPM for AI** presents AI activity, and **eDiscovery** searches the stored prompt and response items (which live in user mailboxes, under their own retention).

### 1. Purview Audit — search the audit trail

This is the searchable Microsoft Purview audit log — the record that an interaction happened. Go to **Purview → Audit → Search**, filter by the **`CopilotInteraction`** record type (or the **Copilot activities** group), set a date range, and run it.

<p><img src="/images/blog/auditing-microsoft-365-copilot/01-purview-audit-home.webp" alt="The Microsoft Purview portal with the Audit solution open, showing the Search page and the left-hand navigation." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Microsoft Purview → Audit. This is the home of Copilot's audit records — not the Microsoft 365 admin center. (Lab demo data.)*

<p><img src="/images/blog/auditing-microsoft-365-copilot/02-purview-audit-results.webp" alt="Microsoft Purview Audit search results showing CopilotInteraction rows, with the user and IP columns redacted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Audit results filtered to `CopilotInteraction`. (Lab demo data — user and IP columns redacted.)*

Prefer the command line? You can pull the same records with **`Search-UnifiedAuditLog`** in Exchange Online PowerShell and export them for analysis.

### 2. DSPM for AI — the friendly dashboard

If reading raw records isn't your idea of fun, Purview's **DSPM** gives you the same story as a dashboard. Depending on your tenant you'll open **DSPM** or **DSPM for AI (classic)** → **Activity explorer → AI activities**, with filters for **web search**, **agents**, **app**, and **sensitivity**.

<p><img src="/images/blog/auditing-microsoft-365-copilot/dspm-01-activity-explorer.webp" alt="Microsoft Purview DSPM for AI Activity explorer on the AI activities tab, with the Web searched and Agents involved filters highlighted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*DSPM for AI → Activity explorer. Note the **Web searched** and **Agents involved** filters. (Lab demo data.)*

Open a single AI interaction and you get a clean, readable view of the app, the plugins it used, the user's risk level — and, if you're permitted, the prompt and response themselves:

<p><img src="/images/blog/auditing-microsoft-365-copilot/dspm-03-interaction-detail.webp" alt="A single AI interaction in DSPM for AI showing activity details, user risk, app details, and the BingWebSearch plugin, with Client IP redacted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*A single interaction. The **BingWebSearch** plugin tells you this answer used the web. (Lab demo data — Client IP redacted.)*

<p><img src="/images/blog/auditing-microsoft-365-copilot/dspm-04-interaction-prompt-response.webp" alt="The interaction details in DSPM for AI showing the captured prompt, the response, and the files Copilot accessed, with the SharePoint URL redacted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*DSPM can display the prompt, the response, and the files Copilot used to viewers who have the required permissions. Note the "permissions to view prompts and responses" link. (Lab demo data — SharePoint URL redacted.)*

Open a whole app rather than a single interaction, and DSPM rolls the same data up — including the **sensitivity labels** and **file types** Copilot referenced over the last 30 days. It's a quick way to spot when Copilot is reaching into sensitive content.

<p><img src="/images/blog/auditing-microsoft-365-copilot/dspm-06-referenced-content.webp" alt="The per-app Referenced content view in DSPM for AI, showing top referenced sensitivity labels (General/All Employees, Not labeled) and referenced file types (Word, PDF, PowerPoint, Excel) for the last 30 days." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The per-app "Referenced content" rollup — the sensitivity labels and file types Copilot touched. (Lab demo data.)*

### 3. eDiscovery — for legal and investigations

For legal hold and investigations, **Purview → eDiscovery** can search Copilot interactions — and, when you need to, delete them (for example to clean up a data-spillage event). It's a proper workflow with its own storage, roles and hold behaviour, so I've given it [its own section below](#where-the-data-lives-and-can-you-delete-it).

## How apps and agents show up

One detail I found genuinely useful: it isn't only "Copilot Chat" that's logged — supported apps and agents show up too. Here's a real activity list from a lab tenant:

<p><img src="/images/blog/auditing-microsoft-365-copilot/dspm-02-activity-list.webp" alt="DSPM for AI activity list of 109 items across multiple apps and agents — Bizchat, Word, Copilot Studio, and a Word Drafting Agent — with the user participant column redacted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*One list, many surfaces: Business Chat, Word, Copilot Studio — and named **agents** like a Word Drafting Agent. (Lab demo data — user column redacted.)*

Want the bird's-eye view instead? **DSPM → Discover → Apps and agents** lists the AI apps and agents Purview has found, each with a protection status — first-party Copilots, the agents your team builds, *and* third-party tools, all in one place.

<p><img src="/images/blog/auditing-microsoft-365-copilot/dspm-05-apps-and-agents.webp" alt="DSPM Apps and agents inventory grouped into Microsoft Copilot Studio, Copilot experiences and agents (Microsoft 365 Copilot, Copilot in Fabric, Security Copilot, several named MicrosoftAgents), and Enterprise AI apps (ChatGPT Enterprise) — all showing Monitored." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*In this configured lab tenant the inventory shows Microsoft Copilots, custom agents, and ChatGPT Enterprise as **Monitored** — third-party coverage depends on the required connector or browser collection plus pay-as-you-go setup. (Lab demo data.)*

**Which app?** `AppHost` identifies the host *category*, but not always the exact client — `BizChat` and `Bing`, for instance, can each map to several clients:

| `AppHost` value | What it means |
|---|---|
| `BizChat` | Microsoft 365 Copilot Chat (Teams, the app, or microsoft365.com/copilot) |
| `Bing` | Business Chat via the Bing/Windows/Edge sidebar or copilot.cloud.microsoft.com |
| `Office` | Copilot via office.com / microsoft365.com |
| `Word`, `Excel`, `PowerPoint`, `OneNote` | Copilot inside that specific app |
| `Bookings`, `Copilot in Azure`, others | Other hosted Copilot experiences |

**Which agent?** When an agent is involved, the record carries `AgentId`, `AgentName`, and `AgentVersion`. Copilot Studio agents show identifiers like `CopilotStudio.Declarative.<guid>` or `CopilotStudio.CustomEngine.<guid>`. For **Microsoft Agent 365**, Microsoft's guidance is simply: *"audit an agent instance as you would a user"* — covering human-to-agent, agent-to-human, agent-to-tool, and agent-to-agent interactions.

**Which Copilot?** The `AppIdentity` field distinguishes first-party Copilots (`Copilot.MicrosoftCopilot.Microsoft365Copilot`, `Copilot.Security.SecurityCopilot`, `Copilot.Fabric.CopilotforPowerBI`), Copilot Studio apps, and third-party apps — so Copilot in Fabric or Security Copilot are audited too, not only Microsoft 365 Copilot.

### It's not only Microsoft's AI

Purview groups AI apps into three buckets, and can audit across all of them:

- **Copilot experiences & agents** — Microsoft 365 Copilot, Security Copilot, Copilot in Fabric, Copilot Studio.
- **Enterprise AI apps** — Microsoft Foundry, Entra-registered apps, **ChatGPT Enterprise**, **Anthropic Claude (Enterprise)**.
- **Other AI apps** — third-party tools detected through browser activity (via Microsoft Defender for Cloud Apps), such as **ChatGPT**, **Google Gemini**, consumer Copilot, and **DeepSeek**.

Those non-Microsoft interactions land under the `ConnectedAIAppInteraction` and `AIAppInteraction` record types, billed pay-as-you-go with 180-day retention. The unmanaged apps in particular rely on browser-activity detection through Microsoft Defender for Cloud Apps, so this isn't automatic — it needs the right connector or collection set up first. With those prerequisites in place, Purview can extend the same auditing to supported non-Microsoft AI apps in scope.

## Beyond audit: the other Purview tools

Auditing is the front door, but Microsoft 365 Copilot interactions are supported across a whole set of Purview solutions (they don't all use one datastore). Each is supported for Copilot:

| Purview capability | What it does for Copilot |
|---|---|
| **Audit** | Searchable audit records for supported interactions (this guide's focus) |
| **DSPM for AI** | Dashboards, insights, and one-click policies for AI activity |
| **eDiscovery** | Search — and delete — Copilot data for legal cases and spillage cleanup |
| **Communication Compliance** | Flag risky or non-compliant prompts and responses |
| **Data Loss Prevention** | Evaluate prompts, responses, and grounding content against DLP policy |
| **Insider Risk Management** | Factor Copilot use into a user's risk score |
| **Data Lifecycle Management** | Retain or delete Copilot interactions on a schedule |
| **Sensitivity labels & classification** | Carry label context into the audit record |
| **Compliance Manager** | Map AI use to regulatory controls |

One detail worth calling out: **admin activity is audited too.** Changes to Copilot settings, plugins, and promptbooks (operations like `UpdateTenantSettings`, `CreatePlugin`, `EnablePromptBook`) are logged alongside user interactions — handy for change tracking and investigations.

## Where the data lives — and can you delete it?

If you're in legal, compliance or security, the audit trail is only half the question. The other half is: *where does the actual prompt-and-response content sit, who can pull it, and can we remove it?* Here's the honest picture.

**Where it's stored.** Every Copilot prompt and response is kept in a **hidden folder in the user's own Exchange Online mailbox** — the same substrate that holds Teams messages. In Microsoft's words: *"Data from generative AI messages is stored in a hidden folder in the mailbox of the user who runs the AI app."* That folder isn't meant for users or admins to open directly; it exists so compliance tools can reach it. Each turn is stored as an individual message-class item (for example `IPM.SkypeTeams.Message.Copilot.BizChat`).

**What eDiscovery shows.** In **Purview → eDiscovery**, you create a case, search the user's mailbox, and add a condition — *Type → Copilot activity*, or a specific item class. Copilot turns come back looking like little emails: a **prompt** item (from the user, to the Copilot app identity) and a **response** item (from the Copilot app, back to the user), including the citations to whatever grounded the answer. You can preview, review and export them (as PST, individual messages, or via Microsoft Graph) — much like mail.

**Can it be deleted? Yes — three ways, all generally available:**

- **On a schedule** — a retention policy for the *Microsoft Copilot experiences* location expires the data automatically. (That's a newer, separate location — Copilot used to share the *Teams chats* one.)
- **By the user** — people can clear their own Copilot history from the *My Account* portal (`myaccount.microsoft.com`).
- **By an admin** — the eDiscovery **search-and-delete** workflow (built for data-spillage cleanup) removes matching items via Microsoft Graph, up to 10 per mailbox at a time.

{{< margin >}}A small correction to an earlier version of this post: I'd called that admin delete "preview". It's since gone GA — fixed here. Living document and all that.{{< /margin >}}

**But holds win.** Deleting isn't always gone-for-good. Removed Copilot items move to a hidden **SubstrateHolds** folder and wait there for a timer job to purge them (roughly 1–7 days) — *unless* a retention policy, **Litigation Hold** or **eDiscovery hold** is in force, in which case permanent deletion is suspended and the content stays discoverable. Even when someone leaves and their account is deleted, held Copilot data moves to an **inactive mailbox** and remains searchable. {{< hi >}}So a user "clearing their history" does not wipe the compliance copy.{{< /hi >}}

**Who can actually get to it.** Reading and exporting Copilot content in eDiscovery needs real eDiscovery roles, not a general admin hat: the **eDiscovery Manager** role group to create a case and search, **Reviewer / Preview** rights to read content in a review set, and the **Search And Purge** role (in Organization Management or Data Investigator by default) to delete. It's a small, deliberate set of people.

**One licensing note.** Content search, hold and export of Copilot interactions is available from **Microsoft 365 E3 + the Copilot add-on** upward; the richer *premium* eDiscovery search for Copilot needs **E5 + Copilot** (or the Purview add-ons). The Copilot add-on is the key that unlocks the Copilot-specific rows.

## Before you search

A short checklist so your first search actually returns something:

- **Auditing must be on.** It's on by default for Microsoft 365 **E3 and E5**. On **Business** plans it may be off — open **Purview → Audit** and select **Start recording user and admin activity** if you see that banner. (PowerShell equivalent: `Set-AdminAuditLogConfig -UnifiedAuditLogIngestionEnabled $true`.)
- **The user needs access to the relevant Copilot experience** and must have generated activity in your date range — otherwise there's no record to find.
- **You need the right role** — the **Audit Logs** role to search the audit log, and additional roles to read prompt/response content (see below).
- **Retention follows your licence** — E3 keeps 180 days; E5 / E5 Compliance keeps about a year with more options.
- **Give it a little time** — new activity can take a while to appear.

## Privacy: who can actually read prompts?

This is the question employees quietly worry about, and it deserves a straight answer.

{{< hi >}}The fact that an interaction happened is in the audit trail — but reading the actual prompt and response *text* needs additional, specific Microsoft Purview permissions.{{< /hi >}} Those permissions exist for auditing, eDiscovery, and compliance work, and being someone's manager doesn't by itself provide them. You can see the guardrail in the product: the interaction view links out to "permissions to view prompts and responses."

So a fair summary for your users: *your Copilot activity is logged for compliance; the prompt and response content is stored separately and can be read only by people with the required Purview permissions — and being your manager isn't one of them.*

## Troubleshooting: why you see nothing

If a search comes back empty, it's usually one of these:

- **If only the web-query results are empty:** Copilot only writes a web query when it actually used the public web — many prompts won't have one.
- **If the whole search is empty**, work through these: auditing may be off (common on Business plans — turn it on, then wait); the user may not have used the relevant Copilot experience in your date range; the date range may be too narrow; or the data may simply not have propagated yet.
- **DSPM for AI needs time** — allow at least 24 hours for new DSPM policies and reports to collect data.

## A reply you can copy

If someone asks you the short version:

> Supported Copilot interactions are logged in **Microsoft Purview** (not the M365 admin center), as long as Purview Audit is on — which it is by default on E3/E5. The `CopilotInteraction` record identifies the prompt and response messages, the files/sites Copilot used, the app, and any agent; the actual prompt/response *text* is retrieved separately and needs extra Purview permissions. Read the records in **Purview → Audit** (filter `CopilotInteraction`), or in **DSPM for AI → Activity explorer** for a friendlier view. Agents are covered too, and supported non-Microsoft AI apps can be audited once set up. Retention is 180 days on E3, about a year on E5.

## Common questions

**How can I prove logging works — a quick smoke test?**
Generate one test interaction, then in **Purview → Audit** search by that user, a narrow date range, and Copilot activities. Open the event and check `Messages`, `AppHost`, and any `AccessedResources`. If they're there, logging is working.

**Does "supported" mean it's included in my licence?**
Not necessarily. "Supported" means a capability *works* for Copilot interactions; whether you *have* it depends on your licence. Basic audit comes with E3; advanced eDiscovery, longer retention, DLP for prompts, and Insider Risk generally need E5 or the E5 Compliance add-on.

**Are the audit record and the prompt/response content kept and deleted together?**
No — they're separate. The audit *event* follows audit retention (E3 180 days, E5 ≈ 1 year). The prompt/response *content* is mailbox-backed and follows its own retention and hold policies — that's what eDiscovery searches.

**Where is the actual prompt/response content stored?**
In a hidden folder in the user's own Exchange Online mailbox — the same place Teams messages live. It's not meant to be opened directly, but compliance tools like eDiscovery can search it.

**If a user clears their Copilot history, is it gone?**
Not from a compliance point of view. It moves to a hidden SubstrateHolds folder, and while any retention policy, Litigation Hold or eDiscovery hold applies, it stays preserved and discoverable — even in an inactive mailbox after the person leaves.

**Can my manager read my prompts?**
Not by default. Reading prompt/response content needs specific Microsoft Purview permissions, meant for auditing and compliance — being a manager doesn't itself grant them.

**What about ChatGPT or Gemini?**
Purview can audit connected and unmanaged third-party AI apps too (ChatGPT, Gemini, DeepSeek — the unmanaged ones detected via Defender for Cloud Apps), with 180-day pay-as-you-go retention. It isn't automatic — it needs the right connector or collection first.

---

### Related reading

- [Copilot Control System — the complete guide](/blog/microsoft-365-copilot-control-system-complete-guide/) — which admin portal owns which control.
- [SharePoint oversharing controls for Copilot](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/) — what Copilot can and can't surface.
- [Copilot deployment best practices — the checklist](/blog/microsoft-365-copilot-deployment-best-practices-ultimate-checklist/) — where auditing fits in a rollout.

### Sources

- [Audit logs for Copilot and AI applications](https://learn.microsoft.com/en-us/purview/audit-copilot) — the record schema, `AppHost`, `AgentId`, `AccessedResources`, record types.
- [Microsoft Purview data security and compliance protections for Copilot and generative AI apps](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview) — the AI app categories.
- [Use Microsoft Purview to manage data security & compliance for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/purview/ai-m365-copilot) — the capabilities-supported table.
- [Use Microsoft Purview to manage data security & compliance for Microsoft Agent 365](https://learn.microsoft.com/en-us/purview/ai-agent-365) — auditing agents.
- [Data Security Posture Management (DSPM) for AI](https://learn.microsoft.com/en-us/purview/dspm-for-ai)
- [Audit log activities — Copilot activities](https://learn.microsoft.com/en-us/purview/audit-log-activities)
- [Search for and delete AI application data in eDiscovery](https://learn.microsoft.com/en-us/purview/edisc-search-copilot-data) — where Copilot data is stored, and how to search or delete it.
- [Learn about retention for Microsoft Copilot](https://learn.microsoft.com/en-us/purview/retention-policies-copilot) — storage, holds, and the SubstrateHolds lifecycle.
- [Turn auditing on or off](https://learn.microsoft.com/en-us/purview/audit-log-enable-disable)
- [Data, privacy, and security for web search in Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access)

<div class="living-doc-banner">

Spotted something that's moved on? [Tell me here](/feedback/) — I keep the IT-admin posts current because these are the questions I get asked in the field.

</div>
