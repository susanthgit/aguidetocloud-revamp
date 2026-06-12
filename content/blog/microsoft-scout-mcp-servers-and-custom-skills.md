---
title: "Microsoft Scout — MCP Servers & Custom Skills"
description: "Add MCP servers and author custom SKILL.md skills for Microsoft Scout — bundled servers, runtime patterns, OAuth, markdown-not-code authoring."
date: 2026-06-12
lastmod: 2026-06-12
draft: false
card_tag: "Scout"
tag_class: "ai"
images: ["images/og/blog/microsoft-scout-mcp-servers-and-custom-skills.jpg"]
og_headline: "Scout MCP & Skills"
og_glyph: "compare"
tags:
  - microsoft-365
  - copilot
  - scout
  - mcp
  - skills
  - agents
hub_id: "scout"
list_title: "Scout: MCP servers & custom skills"
layout: "notebook"
stamp: "extension guide"
intro_note: "↗ how to extend Microsoft Scout — add MCP servers (local stdio, stdio with env, remote HTTP + OAuth), author your own SKILL.md skills using the markdown-not-code pattern."
sitemap:
  priority: 0.8
founder_note: |
  Scout's extension model — MCP servers and markdown SKILL.md files — is the part that makes it interesting to developers and power users. Months in, the markdown-not-code skill pattern still feels right. This spoke covers what's in the box, how to add more, and why the markdown convention has held up under real-world use.
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Scout — Complete Guide](/blog/microsoft-scout-complete-guide/) series.** This is the MCP-and-custom-skills spoke. The MCP catalog and skill conventions can change between releases — this page updates as Microsoft ships. **Last verified: 12 June 2026 · Scout version 0.23.0.20260608.1.**

</div>

*The hub for this series — [Microsoft Scout — The Complete Guide](/blog/microsoft-scout-complete-guide/) — covers what Scout is, how it differs from Copilot, what it costs, and the honest take. This spoke is the extension-and-customisation reference.*

---

Scout ships with seven bundled skills and two bundled MCP servers. Both lists are extensible. This spoke is the "how do I add my own" reference.

---

## MCP — the extension hub

MCP (Model Context Protocol) is the open standard that lets agents like Scout connect to external tools and data sources. If you're new to MCP, the [Work IQ Day 1 post](/blog/microsoft-work-iq-api-day-1-ga/) covers the basics — Scout uses the same protocol on the same plumbing.

What ships in the box:

| MCP server | What it provides | Source |
|---|---|---|
| `@microsoft/workiq` | Microsoft 365 context (email, calendar, Teams chats, OneDrive, SharePoint, contacts) via the Work IQ API | Bundled at install |
| `@playwright/mcp` | Browser automation — navigate pages, fill forms, click buttons, interact with web apps | Bundled at install |

What you can add:

- **Microsoft-published MCP servers** from the catalog — services Microsoft has reviewed and made available for one-click install in Scout
- **Community MCP servers** from public repositories (most are on GitHub) — installed as a local stdio process or a remote HTTP service
- **Your own custom MCP server** — anything that speaks the MCP protocol can be added; useful for internal-only data sources, custom workflows, or wrappers around APIs you already operate

---

## Where MCP servers live in Scout's UI — a visual walkthrough

If you're orienting in the Scout UI for the first time, MCP discovery, installation, and per-server permissions live in two different places. Here's the order most users walk:

### 1. Find the Extensions menu

Click the **ellipsis (three dots) icon** at the bottom-right of Scout's main window. A small popover surfaces Heartbeat · Activity · **Extensions** · Integrations · Settings:

<p><img src="/images/blog/scout-complete-guide/37a-scout-ellipsis-menu.png" alt="A small popover menu in Scout, anchored to the three-dot ellipsis icon at the bottom-right of the window. The menu shows five entries from top to bottom: Heartbeat, Activity, Extensions, Integrations, Settings. The user pill 'Susanth Sutheesh · Connected' is visible below the popover." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The ellipsis popover. The same menu also surfaces Heartbeat, Activity, Integrations, and Settings — covered in the [automations spoke](/blog/microsoft-scout-automations-memory-heartbeats/) and the [secure-config spoke](/blog/microsoft-scout-secure-configuration-25-settings/).*

### 2. Open Extensions → MCP Servers tab

Click **Extensions**. The Extensions panel opens with two tabs at the top — **Skills** and **MCP Servers**. Click MCP Servers:

<p><img src="/images/blog/scout-complete-guide/37-scout-extensions-mcp-servers-tab.png" alt="Microsoft Scout's Extensions panel with the 'MCP Servers' tab selected. The panel shows two sections. 'FEATURED MCP SERVERS' lists Azure DevOps by Microsoft with the description 'Access Azure DevOps, repos, work items, builds, pipelines, and wikis directly from the agent' and a 'Use' button. 'YOUR MCP SERVERS' has a '+ Add Server' button on the right and lists one connected MCP server named 'clawpilot-seismic-bridge' with the marker 'Connected'. The local file path below the server name has been redacted with a solid dark rectangle labelled '[file path redacted for privacy]'. A search icon is in the top right of the panel." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Extensions → MCP Servers. Two sections: **FEATURED MCP SERVERS** (Microsoft's curated catalog — Azure DevOps is the prominent featured pick today) and **YOUR MCP SERVERS** (anything you've added locally). The lone "Your" server in my install is `clawpilot-seismic-bridge` — yet another live breadcrumb of the Clawpilot lineage Scout's bones still carry.*

### 3. Add a server

Click **+ Add Server** in the YOUR MCP SERVERS section. The Add MCP Server dialog opens:

<p><img src="/images/blog/scout-complete-guide/64-scout-add-mcp-server-dialog.png" alt="Scout's 'Add MCP Server' modal dialog. A 'Server name' text field at the top is empty. Two type-tabs follow: 'Remote / Local URL' (selected, with a URL field showing the placeholder 'https://... or http://localhost:...' and a 'Bearer token (optional)' field) and 'Command' (unselected). An 'Advanced' section reveals a 'Tool-call timeout in seconds (optional, default ~60)' field. Cancel and Add buttons sit at the bottom right." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The Add MCP Server dialog. Two modes — **Remote / Local URL** (HTTP MCPs, with optional bearer token) or **Command** (local stdio MCPs, typically a Node/Python subprocess command). The Advanced section exposes the tool-call timeout (default about 60 seconds, useful to tune for long-running MCPs).*

### 4. Tighten per-MCP permissions

After adding a server, control which tools auto-approve and which need permission per-call from **Settings → Manage Permissions → MCP SERVERS**:

<p><img src="/images/blog/scout-complete-guide/65-scout-manage-permissions-per-mcp.png" alt="Scout's Manage Permissions panel, MCP SERVERS section. Three MCP servers are listed as collapsible rows. The first row is expanded: 'Browser Control' (22/23 tools enabled) with the description 'Enables Microsoft Scout to open and use a web browser on your behalf, including opening websites, clicking buttons, typing into forms, downloading files, and taking screenshots.' Its right-side toggle is on with the label 'auto-approves MCP tools'. Two sub-toggles below: 'Auto-approve without asking' (on, with description 'Runs every tool from this server without stopping to ask for your approval at each step') and 'Allow agent file uploads' (on, with description 'Attaches files from your computer to upload fields in the browser on your behalf, without asking you each time'). Two collapsed rows below: 'Azure DevOps' (0/90 tools enabled, toggle off) and 'clawpilot-seismic-bridge' (0/8 tools enabled, toggle off)." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Manage Permissions → MCP SERVERS. Each MCP exposes a tool count (e.g. **Browser Control** has 22 of 23 tools enabled). Per-MCP, you can flip the master `auto-approves MCP tools` toggle, then the granular sub-options like `Auto-approve without asking` and `Allow agent file uploads`. The two collapsed servers (Azure DevOps with 90 tools, and my `clawpilot-seismic-bridge` with 8) are both off — they have to be explicitly enabled before Scout will route to them.*

> **Sidebar — "Browser Control" is the friendly name for `@playwright/mcp`.** Microsoft has given the bundled Playwright MCP a user-facing label that's clearer than the package name. The same renaming pattern likely applies to other bundled MCPs as Microsoft adds them — worth noticing the gap between the package id in your settings/asar and the friendly name in this UI.

> **Security tip.** Toggling `Auto-approve without asking` on for an MCP is the difference between Scout requiring your approval for each tool call vs running every tool that MCP exposes silently. For an MCP whose tools include "write to file" or "send email," you almost always want this off. The [secure-config spoke](/blog/microsoft-scout-secure-configuration-25-settings/) (row 28) covers the broader auto-approve policy choice.

---

## Three MCP runtime patterns

Scout supports three runtime patterns for MCP servers:

1. **Local stdio** — Scout launches the MCP server as a subprocess on your machine and talks to it over standard input/output. The most common pattern for community-developed servers (the GitHub Copilot CLI's MCP catalog is full of these).
2. **Local stdio with environment** — same as above, with environment variables (typically secrets) injected at launch time. Used for MCPs that need API keys or tokens.
3. **Remote HTTP** — Scout calls a long-running HTTP endpoint. Used for Microsoft-hosted MCPs and for enterprise MCPs your org operates centrally. OAuth flows are supported for HTTP MCPs that need user-delegated auth.

Each MCP server has its own permission scope. Scout asks for your approval before granting an MCP server new capabilities (for example, the first time an MCP wants to write a file, you get a prompt). Per-server OAuth flows are surfaced through Scout's gateway-auth UI.

For tightening MCP permissions org-wide, see the [secure-config spoke rows 6, 7, 8](/blog/microsoft-scout-secure-configuration-25-settings/).

<!-- 📸 Screenshot 65 — MCP OAuth consent dialog (placeholder) -->

---

## Custom skills — markdown files, not code

Scout's skill model is borrowed from the OpenClaw open-source heritage, and it's deliberately low-ceremony: a skill is a markdown file plus optional supporting assets.

Each skill folder has:

- **`SKILL.md`** — frontmatter with `name` + `description`, then the body content (instructions to the language model on how to perform the skill)
- **Supporting files** — templates, scripts, reference data, examples (whatever the skill needs)

The language model picks the right skill for each request based on the description in the frontmatter. You don't write routing code; you write a clear description of what the skill does and when it should trigger.

A minimal SKILL.md looks like this:

```markdown
---
name: weekly-status-draft
description: "Generate a weekly customer status draft. Use when asked for a weekly status report, end-of-week summary, customer activity rollup, or anything that asks for the past week's work across portfolio accounts."
---

# Weekly Status Draft

When the user asks for a weekly status:

1. Pull the last 7 days of activity for the user's portfolio accounts
2. Group activity by account
3. For each account, surface: open opps, recent meetings, recent emails, ACR trend
4. Draft a one-paragraph status per account, in the user's voice
5. Output a single markdown document
```

That's it. Drop the file in your skills directory and Scout starts routing to it.

Here's a second one from my own skills folder — closer to how I actually use Scout day-to-day. It uses Work IQ to pull cross-source context and produces a single Markdown brief I can paste into Teams:

```markdown
---
name: morning-brief-msx-flavour
description: "Build a single-paragraph morning brief covering overnight email, urgent Teams messages, today's calendar, and any MSX customer activity that changed yesterday. Use when asked for a morning brief, daily standup prep, what-do-I-need-to-know-this-morning, or what-changed-overnight."
---

# Morning Brief (MSX flavour)

When the user asks for a morning brief, run in this order:

1. **Email triage** — last 24h inbox, group by sender, flag senders in the user's top-10-customer list
2. **Teams urgent** — any 1:1 or group chat with an @-mention of the user in the last 12h
3. **Calendar look-ahead** — today's events, flag any with no agenda or prep doc attached
4. **MSX customer activity** — any owned account where ACR moved, an opp changed stage, or a customer logged a support ticket in the last 24h
5. **Compose** — single paragraph, in the user's voice (terse, no preamble), Teams-paste-ready

Always end with one suggested action — the next 30 minutes' most useful task based on what was found.
```

That's roughly 20 lines of Markdown for a skill I actually use. When Scout's heartbeat fires at 09:00 weekdays, that skill is what produces the briefing I open the day with. No CLI, no compile, no version bumps — edit the file, save, the next heartbeat picks it up.

### What a real SKILL.md looks like in an editor

Here's the actual `SKILL.md` from Scout's bundled `docx` skill, open in a text editor:

![Scout SKILL.md file open in editor — shows frontmatter with name, description, license fields; body content redacted to respect Microsoft's proprietary skill code](/images/blog/scout-complete-guide/73-scout-skill-md-frontmatter.png "Scout SKILL.md frontmatter · name + description + license fields · body content redacted (Microsoft proprietary) · path: C:\\Users\\<user>\\.copilot\\skills\\docx\\SKILL.md")

What's worth noting:

- **Frontmatter at the top** — the `name` Scout uses to route to this skill, the `description` Scout reads to decide WHEN to route (this is the routing logic; no code), and an optional `license` field
- **`---` markers** open and close the frontmatter — the same YAML frontmatter pattern Hugo and Jekyll use
- **Body below `---`** — markdown instructions to the language model on how to perform the skill (redacted here because Microsoft's bundled skills are proprietary; your own SKILL.md body is free for you to share)

The two SKILL.md examples earlier in this section (the minimal `weekly-status-draft` and the `morning-brief-msx-flavour`) show what a YOUR-OWN-skill body looks like — free of any restrictions, edited in your favourite text editor, no toolkit required.

---

## Where skills live

Scout reads custom skills from two local skills directories. On Windows that's:

- **`%USERPROFILE%\.copilot\skills\`** — the path shared with Copilot CLI. If you author a skill here, both Scout and Copilot CLI can route to it. This is where most of mine live (carried across from my Clawpilot days).
- **`%USERPROFILE%\.copilot\m-skills\`** — Scout's own workspace/synced skills path that Microsoft Learn documents alongside the shared CLI path. Useful when you want a skill scoped to Scout only.

If a skill name lives in both paths, the Scout-specific `m-skills/` copy wins for Scout's routing. Most users put their custom skills in `~/.copilot/skills/` for portability across both surfaces.

For team-distributed skills, a few patterns I've seen:

- **Git-based sharing** — keep a team skills repo, each member clones it into their `.copilot/skills/` folder, pulls updates regularly
- **Microsoft Loop / SharePoint** — store skill markdown in a shared location, each user pulls into their local folder when they want a new one
- **Microsoft-published catalog** — Microsoft's roadmap mentions a future skill catalog for enterprise distribution; not yet GA

### What the skills folder actually looks like

Open File Explorer, paste `%USERPROFILE%\.copilot\skills` into the address bar, and you'll see your installed skills as plain folders:

![File Explorer showing the .copilot\\skills folder with 19 subfolders — bundled skills (docx, xlsx, pptx, loop, excalidraw, expense-report, web-artifacts-builder) plus user-added skills including CSA/DSSP coaching skills](/images/blog/scout-complete-guide/71-scout-skills-folder-listing.png "Scout skills folder · 19 subfolders visible · 7 Microsoft-bundled skills + custom skills I've added myself (CSA/DSSP coaches, morning-brief, security-scanner, azure-deploy, data-ai-toolkit, shared)")

What's on mine (visible above): the 7 Microsoft-bundled skills (`docx`, `xlsx`, `pptx`, `loop`, `excalidraw`, `expense-report`, `web-artifacts-builder`) — see [the bundled skills spoke](/blog/microsoft-scout-bundled-skills-and-features/) for what each one does — plus several I've added myself for my field-engineering work (`acr-signal-to-opportunity-coach`, `forecast-business-review-coach`, `customer-meeting-prep-outreach-coach`, `pipeline-msx-hygiene-coach`, `portfolio-account-planning-coach`, `funding-partner-activation-coach`, `solution-value-design-coach` and a `morning-brief`). Each one is a plain folder; nothing in a database, no registration, no manifest signing.

Drill into any one folder and you'll see the actual on-disk contract Scout reads:

![File Explorer inside the docx skill folder showing four items — scripts (folder), .bundled-version (file), LICENSE.txt (file), SKILL.md (file)](/images/blog/scout-complete-guide/72-scout-skill-folder-contents.png "Inside the docx skill folder · the SKILL.md file is the contract Scout reads · scripts folder holds helpers · .bundled-version and LICENSE.txt are Microsoft-bundled-skill-only extras you don't need on your own custom skills")

A skill folder is genuinely just:

- **`SKILL.md`** — required; the frontmatter + body markdown contract Scout reads
- **`scripts/`** — optional; helpers, shell snippets, anything the skill needs to do its job (Python, shell, executables)
- **`LICENSE.txt`** + **`.bundled-version`** — only on Microsoft's bundled skills; not needed on your own

To add a new skill: create a folder under `~/.copilot/skills/`, drop a `SKILL.md` inside, save. Done. Scout discovers it on next session. No build, no install, no service restart.

### Important — skills are LOCAL, not OneDrive-synced

A natural assumption (I had it too): "Scout uses OneDrive for memory, so my skills sync across my devices, right?" **No.**

In Scout's Settings, the **Workspaces** section sets the default file location for *outputs* Scout produces — by default this points to `OneDrive - <your org>\Documents\Microsoft Scout\`. That's where Scout drops PNG screenshots, PPTX decks, HTML dashboards, the artefacts it builds for you. Those DO sync across devices via OneDrive.

But the **skills themselves** — your `~/.copilot/skills/` folder — are **always local**. They do not sync. If you set up Scout on a second device, you have to re-clone your skills folder manually (`git clone` if you use a team repo, or simple file copy via OneDrive's `Documents` folder used as a transport).

This is by design: skills can contain device-specific scripts, local credentials, or paths to local tools. Auto-syncing them would be a security and compatibility footgun. But the gap between "Scout-outputs-in-OneDrive" and "skills-only-local" surprises a lot of users, so worth knowing up front.

---

## Why markdown-not-code

A few months in, the markdown-not-code pattern has held up well. Benefits I notice:

- **No build step** — edit a SKILL.md, save, Scout sees the change on the next prompt
- **No deploy** — no compile, no package, no version management
- **Low ceremony** — most skills are 10-40 lines of markdown plus a couple of supporting files
- **Reviewable by humans** — a skill is something you can read, share over Teams chat, or paste into an email; not a binary or a code package
- **Portable** — the same skill folder works on Scout and Copilot CLI today, and (with minor adjustments) on the open-source OpenClaw runtime too

The trade-off: skills run with whatever permissions Scout has, so a malicious `SKILL.md` from a random place on the internet could do real damage. Treat skill installs from outside your org the same way you'd treat installing a new browser extension — review the description and the file contents before dropping it into your skills folder.

---

## What to read next in this series

- **[Microsoft Scout — The Complete Guide (hub)](/blog/microsoft-scout-complete-guide/)** — what Scout is, how it differs from Copilot, what it costs, the honest take
- **[Admin Install & Frontier Setup](/blog/microsoft-scout-admin-install-frontier-enrollment/)** — the two-gate admin install walkthrough
- **[All 7 Bundled Skills Explained](/blog/microsoft-scout-bundled-skills-and-features/)** — Word, Excel, PowerPoint, Loop, Web Artifacts, Excalidraw, Expense Report
- **[Secure Configuration Guide](/blog/microsoft-scout-secure-configuration-25-settings/)** — the bookmark-worthy reference for IT admins (read rows 6-10 for MCP-specific tightening)
- **[Automations, Memory, Heartbeats](/blog/microsoft-scout-automations-memory-heartbeats/)** — Scout's always-on engine
