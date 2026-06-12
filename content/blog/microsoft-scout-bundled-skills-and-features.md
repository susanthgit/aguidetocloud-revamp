---
title: "Microsoft Scout — All 7 Bundled Skills Explained"
description: "Microsoft Scout ships seven bundled skills — docx, xlsx, pptx, Loop, web artifacts, Excalidraw, expense report. What each does and when Scout uses it."
date: 2026-06-12
lastmod: 2026-06-12
draft: false
card_tag: "Scout"
tag_class: "ai"
images: ["images/og/blog/microsoft-scout-bundled-skills-and-features.jpg"]
og_headline: "Scout Bundled Skills"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - scout
  - skills
  - mcp
  - agents
hub_id: "scout"
list_title: "Scout: All 7 bundled skills"
layout: "notebook"
stamp: "feature guide"
intro_note: "↗ the 7 bundled skills Microsoft Scout ships with on day one — plain-English breakdown of what each one does, plus the MCP servers, browser, shell, M365 connections, heartbeats, and sub-agent layers around them."
sitemap:
  priority: 0.8
founder_note: |
  Microsoft Learn documents five of Scout's bundled skills. The install actually ships seven. The two extras (Excalidraw, Expense Report) are routable by Scout the moment you sign in — they're just not called out in the public overview yet. This spoke walks every skill and the surrounding features so you know what Scout can do on day one, before you've added anything custom.
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Scout — Complete Guide](/blog/microsoft-scout-complete-guide/) series.** This is the feature-tour spoke. Bundled skills can change between releases — this page updates as Microsoft ships. **Last verified: 12 June 2026 · Scout version 0.23.0.20260608.1.**

</div>

*The hub for this series — [Microsoft Scout — The Complete Guide](/blog/microsoft-scout-complete-guide/) — covers what Scout is, how it differs from Copilot, what it costs, and the honest take. This spoke is the feature-tour reference.*

---

## The seven bundled skills

Skills in Scout are markdown files (one folder per skill, with a `SKILL.md` and supporting assets). The language model picks the right skill for each request based on the description in the SKILL.md frontmatter. Today's Scout install ships **seven** bundled skills at `C:\Program Files (x86)\Microsoft Scout\resources\bundled-skills\`:

| # | Skill | What it does |
|---|---|---|
| 1 | **docx** | Create, read, edit, or manipulate Word documents — reports, memos, letters, templates, tables of contents, page numbers, tracked changes, image insertion. Trigger words include "Word doc", "report", "letter", "template". |
| 2 | **xlsx** | Open, read, edit, or fix spreadsheets — `.xlsx`, `.xlsm`, `.csv`, `.tsv`. Includes formulas, formatting, charting, cleaning malformed data, converting between tabular formats. |
| 3 | **pptx** | Create, edit, read, parse, or extract from PowerPoint presentations — slide decks, pitch decks, speaker notes, comments, even SharePoint-hosted or OneDrive-hosted `.pptx` URLs. |
| 4 | **loop** | Edit Microsoft Loop documents in the browser using Playwright automation. Loop has no public API, so Scout drives it through the browser — a clever workaround for a workload that otherwise wouldn't be reachable. |
| 5 | **web-artifacts-builder** | Build interactive self-contained HTML artifacts — dashboards, visualisations, org charts, network maps, trackers, comparisons. Output is one HTML file, opens in any browser, no build step. |
| 6 | **excalidraw** | Generate Excalidraw diagrams from descriptions — architecture diagrams, flowcharts, data flow visualisations. Outputs `.excalidraw` JSON files that open in [aka.ms/excalidraw](https://aka.ms/excalidraw) or embed in documentation. |
| 7 | **expense-report** | Create and fill out Microsoft Dynamics 365 MyExpense expense reports from receipts using visible browser automation. Handles travel expenses, recurring monthly expenses, hotel itemisation, and corporate AMEX matching. Produces a complete review-ready draft; the user always submits themselves. |

<p><img src="/images/blog/scout-complete-guide/31-skill-web-artifacts-cost-dashboard.png" alt="A fully rendered interactive HTML dashboard produced by Scout's web-artifacts-builder skill, captioned 'Cloud Cost Dashboard · Monthly trends across Azure, AWS & GCP · FY26 · 12-month rolling'. The dashboard has four filter controls (Time range, Provider, Environment, Currency), four KPI summary cards (This Month Spend $487,230 down 4.2 percent, YTD Spend $2.84M up 12.8 percent, Forecast Next Month $511,400, Savings Opportunity $42,180), a stacked monthly bar chart broken down by Azure, AWS and GCP across Jul 2025 to Jun 2026, and a donut chart showing environment split (Production, Dev, Test, Sandbox), plus Export CSV and Share report action buttons. All data shown is sample data generated for the demo." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The interactive HTML dashboard Scout's `web-artifacts-builder` skill produced from a one-line prompt ("Show me a sample interactive HTML dashboard for monthly cloud cost trends — use fake data"). All the numbers are demo data; the controls, KPI cards, and dual-chart layout are what the skill ships in a single self-contained HTML file. No build step, no SPA, opens in any browser.*

> **Sidebar — Microsoft Learn currently documents five of these (Word, Excel, PowerPoint as one row, Loop, and Web Artifacts Builder). The install ships seven.** Excalidraw and Expense Report are on disk and routable by the language model the moment you install Scout, but they aren't called out in the public overview yet. Worth knowing because both are surprisingly capable. The Expense Report skill in particular hints at how Scout is being shaped for Microsoft enterprise workflows — it knows about AMEX matching and hotel itemisation.

You can also add your own custom skills by dropping a `SKILL.md` into your skills directory (Scout reads from `~/.copilot/skills/` — the same folder Copilot CLI uses, which is why some of my skills carry across from my Clawpilot days). More on authoring skills in the [MCP & custom skills spoke](/blog/microsoft-scout-mcp-servers-and-custom-skills/).

<!-- 📸 Screenshots 30-36 — one shot per skill in action (placeholders to capture in Scout) -->

### How I actually use these — lived examples

The table above is the inventory. Here's how a few of them show up in my actual week.

- **`web-artifacts-builder`** is the skill I reach for most. The cost-trend dashboard in the [hub guide's real-workflow section](/blog/microsoft-scout-complete-guide/#1--what-is-microsoft-scout) came out of one prompt — but the same skill is what I use to mock up a portfolio dashboard, a customer-status tracker, or a what-if pricing comparison. One prompt, one HTML file, no build step.
- **`expense-report`** is the one that surprised me with how grown-up it is. Receipt photos in → expense lines out, including AMEX corporate-card matching and hotel itemisation. It produces a review-ready draft; I scan it, fix anything wrong, and submit myself. The skill's own SKILL.md is explicit: "the user always submits themselves" — which is exactly the right default for anything that touches finance.
- **`pptx`** is the one I underuse — but when I reach for it, it's usually for "update this 20-slide customer deck with our latest ACR numbers" type work. It edits in place rather than regenerating the whole deck.
- **`loop`** is the clever one. Loop has no public API, so Scout drives it through the browser via Playwright. The result feels like Loop has an API; really, Scout is just being a careful keyboard.

Skills route automatically based on the SKILL.md description, so you don't have to call them by name. Ask Scout to "draft a Word memo summarising my last week," and the `docx` skill fires. Ask for "a chart showing my weekly meeting load," and `web-artifacts-builder` picks it up.

---

## MCP servers in the box

Scout ships with two MCP (Model Context Protocol) servers bundled at install time, both in `resources\app.asar.unpacked\node_modules`:

- **`@microsoft/workiq`** — the Work IQ MCP server, which is how Scout queries your Microsoft 365 data (email, calendar, Teams chats, OneDrive files, SharePoint pages, contacts). This is the same Work IQ API I covered in detail in the [Work IQ Day 1 post](/blog/microsoft-work-iq-api-day-1-ga/). Worth re-reading that post if you want to understand what Scout actually does when it "looks at your inbox."
- **`@playwright/mcp`** — the Playwright MCP server, which drives the browser. Used by the Loop skill, the Expense Report skill, and any web automation Scout needs to run.

You can add your own MCP servers through Scout's settings — bring in third-party MCPs from the catalog, install local stdio MCPs, or wire up remote HTTP MCPs with OAuth. Covered in the [MCP & custom skills spoke](/blog/microsoft-scout-mcp-servers-and-custom-skills/).

<!-- 📸 Screenshot 37 — Scout's MCP servers list showing the two bundled servers (placeholder) -->

The MCP servers panel itself lives inside Scout's Extensions menu and there's a per-server permission controller deeper in Settings → Manage Permissions. The full walkthrough — with the Extensions UI screenshots and the per-MCP toggle pattern — is in the [MCP servers spoke](/blog/microsoft-scout-mcp-servers-and-custom-skills/#where-mcp-servers-live-in-scouts-ui-a-visual-walkthrough).

---

## Browser automation — Playwright with safety rails

Scout drives a real browser through Playwright. That means Scout can navigate web pages, fill forms, click buttons, scrape content, and interact with any web app you can sign into. It's the same engine the Loop skill and the Expense Report skill use under the hood.

Two safety rails ship enabled by default in the bundled `playwright-mcp-config.json`:

- **`allowUnrestrictedFileAccess: false`** — Scout's browser can't read arbitrary files off your disk through `file://` URLs. The browser sandbox stays inside web content.
- **Downloads disabled** — Scout's browser doesn't save downloaded files to your disk automatically. You stay in control of file ingress.

There's a third file in the install, `playwright-init-egress-block.js`, that adds an outbound URL block list — your admin can configure (via the `BrowserEgressBlockedOrigins` ADMX policy) which domains Scout's browser is allowed to talk to. Useful for regulated tenants that want Scout's browser to be unable to talk to, say, public file-sharing sites.

Full coverage of the egress policy and the rest of the secure-config surface is in the [secure-config spoke](/blog/microsoft-scout-secure-configuration-25-settings/).

<!-- 📸 Screenshot 38 — Scout driving the browser via Playwright (placeholder) -->

---

## The shell and file system

Scout can run shell commands on your local machine. This is the capability that makes Scout genuinely different from any other Microsoft AI surface — none of them touch the shell. It's also the capability that needs the most careful permission setup.

Out of the box, Scout uses a **tiered permission system**:

- **Auto-approve** — commands you've told Scout it can run without asking each time (typically read-only commands you trust)
- **Prompt** — commands Scout runs only after you click an approval card in the UI (typically write commands)
- **Block** — commands Scout will never run, even with approval (typically destructive commands like `rm -rf /` or `Format-Volume`)

You can also mark **sensitive directories** that always require explicit approval before Scout touches anything inside them — for example, your secrets folder, your private keys, your customer data area.

File system access works the same way: Scout has a configured workspace, can read and write inside it freely (subject to the per-action approval rules), and needs explicit confirmation to step outside.

The single most important ADMX policy to enable for non-developer Scout users is `RestrictToWorkspace` — it prevents Scout from touching files outside the configured workspace directory. Detail in the [secure-config spoke row 23](/blog/microsoft-scout-secure-configuration-25-settings/).

<!-- 📸 Screenshot for the permission card UI — covered in the [secure-config spoke](/blog/microsoft-scout-secure-configuration-25-settings/) -->

---

## Microsoft 365 connections

Through the bundled Work IQ MCP server, Scout reaches into your Microsoft 365 estate without needing a separate auth dance per workload:

- **Outlook** — read, draft, send email (drafting always saves to your Drafts; sending requires per-message approval)
- **Teams** — read 1:1 chats, group chats, channel messages, post replies
- **Calendar** — read your calendar, draft RSVPs, schedule meetings, find conflict-free time
- **OneDrive** — read, write, search files in your OneDrive
- **SharePoint** — read pages and documents from sites you have access to
- **Contacts** — look up people across your org and external partners

Every action runs in your signed-in user's identity (the standing Work IQ constraint — no app-only auth), which means everything Scout does inside M365 is attributable to you in audit logs.

---

## Heartbeats, automations, and sub-agents

The features that make Scout an Autopilot rather than a chat surface — heartbeats, automations, sub-agents, and the memory + personality system around them — all live in their own spoke.

See the [Automations, Memory, Heartbeats](/blog/microsoft-scout-automations-memory-heartbeats/) spoke for:

- Heartbeats every 15-120 minutes — what they do, how to configure
- Named automations on a schedule or trigger
- Sub-agent delegation for parallel work
- The layered memory model (local profile + Microsoft 365 context grounded through Work IQ)
- Personality tuning

---

## What to read next in this series

- **[Microsoft Scout — The Complete Guide (hub)](/blog/microsoft-scout-complete-guide/)** — what Scout is, how it differs from Copilot, what it costs, the honest take
- **[Admin Install & Frontier Setup](/blog/microsoft-scout-admin-install-frontier-enrollment/)** — the two-gate admin install walkthrough
- **[Secure Configuration Guide](/blog/microsoft-scout-secure-configuration-25-settings/)** — the bookmark-worthy reference for IT admins
- **[MCP Servers & Custom Skills](/blog/microsoft-scout-mcp-servers-and-custom-skills/)** — extending Scout with your own MCP servers and SKILL.md files
- **[Automations, Memory, Heartbeats](/blog/microsoft-scout-automations-memory-heartbeats/)** — Scout's always-on engine
