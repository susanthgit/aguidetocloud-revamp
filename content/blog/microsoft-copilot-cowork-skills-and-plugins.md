---
title: "Microsoft Copilot Cowork — Complete Skills Guide"
list_title: "Cowork: Skills and plugins"
description: "Complete guide to all built-in Microsoft Copilot Cowork skills plus 3 ways to extend (plugins, custom SKILL.md, Copilot Studio). With Learn references."
date: 2026-06-15
lastmod: 2026-06-15
draft: false
card_tag: "Cowork"
tag_class: "ai"
images: ["images/og/blog/microsoft-copilot-cowork-skills-and-plugins.jpg"]
og_headline: "Cowork: built-in skills + plugins"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - cowork
  - skills
  - plugins
  - ai
hub_id: "cowork"
layout: "notebook"
stamp: "feature guide"
intro_note: "↗ every built-in Cowork skill, how plugins extend it, and the three ways to add custom skills — no-code, low-code, pro-code"
sitemap:
  priority: 0.8
founder_note: |
  Skills are how Cowork stays useful. The built-in set covers the M365 apps you live in; plugins and custom skills are how you reach the rest of your stack. This page tracks what ships, what you can add, and what changes as Microsoft expands the catalog.
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Skill catalog refreshes as Microsoft adds more — this page tracks each release. **Last verified: 15 June 2026 · pre-GA structure.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is. This spoke is the skills-and-plugins reference for power users and developers.*

---

## TL;DR

- Cowork ships with **13 built-in skills, organised into 5 categories** (Communication · Documents · Calendar · Search · Automation)
- A **skill** is a reusable recipe in your OneDrive — different from a **prompt**, which is a one-time instruction
- Three ways to add custom skills: **OneDrive SKILL.md** (no-code), **Copilot Studio** (low-code), **Agents SDK** (pro-code)
- Microsoft maintains four official plugin pages on Microsoft Learn for full reference
- The fastest way to see what your tenant has: ask Cowork *"What skills do you have available?"* — it lists every one with a description

---

## Skill vs prompt — the simple mental model

This is the question I get asked first. Plain English:

|  | **Prompt** | **Skill** |
|---|---|---|
| **What it is** | A one-time instruction you type | A reusable recipe Cowork can run again |
| **Where it lives** | In the chat, gone when the chat ends | In your OneDrive at `Documents/Cowork/Skills/<name>/SKILL.md` |
| **Who can call it** | Just you, in that moment | Cowork itself — it picks the skill based on your wording |
| **When to use it** | One-off ask · novel scenario · exploration | Same workflow you do every week · multi-step thing you keep re-typing · something a teammate would also benefit from |
| **Analogy** | Hand-writing instructions for a colleague each time | Putting a recipe card in a recipe box — the colleague reads the card and follows the steps |

**The key idea:** a prompt tells Cowork what to do *right now*. A skill teaches Cowork *how* to do it whenever asked. Skills also compose — one skill can hand off to another, building up multi-stage workflows.

---

## Where to find skills in the UI

Cowork keeps all of this behind a single **Customize** door. Three clicks to get there.

### Step 1 — Open the attach menu

From the Cowork landing, click the **`+` button** to the left of the task input. A menu opens with four options. Pick the bottom one: **Customize · Manage skills & plugins**.

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/20-cowork-customize-menu-entry.png" alt="Cowork landing page with the plus button highlighted in a red box. The attach menu is open showing four options — Add work context, Upload images and files, Attach cloud files, and Customize · Manage skills and plugins (also highlighted in red with the cursor pointer hovering on it)." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

### Step 2 — Land on the Customize page

The Customize page has two tabs at the top: **Plugins** and **Skills**. Click **Skills**.

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/21-cowork-customize-tabs.png" alt="Customize page header showing a back arrow labelled Cowork, the page title Customize, two pill-shaped tabs labelled Plugins and Skills with Skills highlighted in a red box, and search and Add controls on the right." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

### Step 3 — See what's installed

The Skills tab is split into two sections:

- **Your skills** — custom skills you've added (or your IT team has rolled out)
- **Built-in** — pre-installed skills Cowork leverages automatically

You can toggle any skill on or off here. Disabled skills won't be picked by Cowork even if you ask for them by name.

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/22-cowork-skills-page-overview.png" alt="The Skills tab inside Cowork Customize. Two section headings highlighted in red boxes — Your skills and Built-in. Three custom skills are visible in Your skills (customer-session-followup, customer-session-prep, inbox-drafts) each with a toggle on the right. A Show more link sits below. The Built-in section begins underneath with the first three pre-installed skills (PDF, Word, Excel)." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

---

## The 13 built-in skills — what your tenant actually shows

Microsoft's [Agent Academy Cowork Collective](https://github.com/microsoft/agent-academy/tree/main/docs/cowork-collective) describes Cowork as shipping with 13 built-in skills in 5 categories. Here's the exact list as it appears in the Skills page UI:

| # | Skill | What it does (UI description) |
|---|---|---|
| 1 | **PDF** | Read, create, and manipulate PDF documents |
| 2 | **Word** | Read, create, and edit Word documents |
| 3 | **Excel** | Read, create, and manipulate Excel spreadsheets |
| 4 | **PowerPoint** | Read, create, and edit PowerPoint presentations |
| 5 | **html** | Create, edit, and validate standalone single-file HTML |
| 6 | **Calendar Management** | Full-spectrum calendar management with purpose-aware classification, block defense, and tiered logic |
| 7 | **Daily Briefing** | Aggregated morning brief from calendar, email, Teams |
| 8 | **Meetings** | Meeting intelligence, summaries, and prep |
| 9 | **Scheduling** | Calendar scheduling and management |
| 10 | **Communications** | Audience-adaptive communications |
| 11 | **Skill Management** | Create, validate, and manage personal Cowork skills and instructions |
| 12 | **goal** | Set a standing goal — the agent keeps working until the condition is met or the effort limit is reached |
| 13 | **debug-trajectory** | (Manual trigger only) Renders the current session's transcript as a self-contained HTML attachment |

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/23-cowork-built-in-skills-list.png" alt="The Built-in skills section inside Cowork's Customize page, scrolled to show all 13 pre-installed skills in a vertical list — PDF, Word, Excel, PowerPoint, html, Calendar Management, Daily Briefing, Meetings, Scheduling, Communications, Skill Management, goal, and debug-trajectory — each with a one-line description and a toggle on the right. A Show less link is visible at the bottom confirming this is the full list." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

Mapping back to the 5 Agent Academy categories:

| Category | UI skills |
|---|---|
| **Communication** | Communications (the rest sits under task-orchestration patterns Cowork handles automatically — see the Naming convention note below) |
| **Documents** | PDF, Word, Excel, PowerPoint, html |
| **Calendar** | Calendar Management, Daily Briefing, Meetings, Scheduling |
| **Search** | Built into Cowork's task-planning — surfaces through Daily Briefing, Meetings, and the cross-app reach |
| **Automation** | goal (long-running standing goals), Skill Management (creating and managing skills) |

---

## Ask Cowork what it can do — the easy way

If you'd rather not click around the Customize page, **ask Cowork directly**. The single best discovery prompt:

<div class="prompt-cards">

> What built-in skills do you have available? List each by name with a one-line description of what it does.

</div>

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/24-cowork-ask-skills-prompt.png" alt="The Cowork task input box showing the typed prompt 'What built-in skills do you have available? List each by name with a one-line description of what it does.' ready to be submitted, with the formatting and microphone icons on the right of the input." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

Cowork responds with a grouped list — both the built-in skills it ships with AND any custom skills you've added, all together:

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/25-cowork-skills-response.png" alt="Cowork's response listing 21 skills grouped into five categories — Document Creation (work-doc, work-presentation, work-spreadsheet, docx, xlsx, pptx, pdf, html), Productivity and Calendar (daily-briefing, calendar-management, schedule-meeting, meeting-intel, meeting-recap, inbox-drafts, stakeholder-comms), Customer Sessions (customer-session-prep, customer-session-followup), Research and Analysis (deep-research, render-ui), and Skills and Configuration (skills, update-config)." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

### Naming convention — UI labels vs skill IDs

You'll notice the response uses names like `schedule-meeting`, `meeting-intel`, `pdf`, `html` — the lowercase, hyphenated **internal skill IDs**. The Customize UI shows the friendly labels (Scheduling, Meetings, PDF, html).

When you write a custom skill that references built-in skills, use the **skill IDs** — that's what Cowork's planner matches against. When you're explaining Cowork to a colleague, use the **UI labels** — they're easier to read.

---

## How plugins extend Cowork

Built-in skills cover the M365 apps you live in. **Plugins** extend Cowork to systems outside M365 — your CRM, your ticketing system, your project management tool, your data warehouse.

Microsoft maintains four reference pages on Microsoft Learn:

| Page | When to read |
|---|---|
| **Available plugins for Copilot Cowork** | Browse the catalog before deciding to build your own |
| **Use plugins with Copilot Cowork** | End-user guide — how to invoke a plugin in a task |
| **Build plugins for Copilot Cowork** | Developer reference for new plugins |
| **Manage plugins for Copilot Cowork** | Admin governance, approvals, scope, audit |

<!-- Sush — once GA settles and Microsoft removes the (Frontier) suffix from these pages, link them directly with the post-GA URLs -->

---

## Custom skills — three paths

You're not limited to what Microsoft ships. There are three ways to add your own.

### Path 1 — Custom skills via OneDrive (no-code, works today)

This is the easiest path — no admin involvement, no app installs.

**Method A — Ask Cowork to create it for you (fastest):**

Tell Cowork in chat: *"Create a custom skill called [name] with these instructions: [your steps]"* — Cowork validates the skill, writes the SKILL.md file, and syncs it to your OneDrive automatically within ~35 seconds. Ready to use immediately.

**Method B — Upload the file manually to OneDrive:**

1. Open your **OneDrive** — navigate to `Documents → Cowork → Skills` (create these folders if they don't exist)
2. Create a **subfolder** for your skill (e.g., `morning-briefing`)
3. Inside that subfolder, create a file called **`SKILL.md`**
4. Use this minimal pattern:

```markdown
---
name: Morning Briefing
description: >-
  Summarises my day from calendar, email, and Teams. Use when I say
  "morning briefing", "what's on today", or "what do I need to know
  this morning".
---

# Morning Briefing

## 1. Gather context first (never invent)
- Calendar — today's meetings with times and attendees
- Email — top 3 unread emails needing my response before first meeting
- Teams — any urgent messages I haven't responded to

## 2. Output
A scannable bullet list grouped by Calendar / Email / Teams,
followed by "Top 3 priorities" picked from across all three.
```

5. Save it — Cowork **automatically discovers** all skills in this folder at the start of every conversation.

Both methods produce the same result. Method A is great for quick personal skills; Method B is useful when you want to pre-build and distribute skill files across a team.

You can create up to **50 custom skills** per user. Each file must be under 1 MB.

#### The SKILL.md pattern that works in practice

Cowork now standardises a richer SKILL.md structure than the earlier minimal template — and it auto-scores skills against this structure (see "Cowork scores your skill" below). When you use Method A and ask Cowork to create a skill for you, the file Cowork writes follows this 8-section pattern:

| Section | Purpose |
|---|---|
| **YAML frontmatter** — `name:`, `description:` (with trigger phrases), `cowork:` extension (`category:` + `icon:`) | The skill ID, the trigger phrases Cowork's planner matches against, and category/icon metadata for the Skills UI |
| **Overview** | One paragraph — what this skill does and what gets produced |
| **When to Use** | Trigger scenarios written as user-facing examples |
| **When NOT to Use** | What this skill is *not* for, plus explicit handoff to sibling skills ("for X, use the `<other-skill>` skill instead") — this is the section Cowork scores most heavily on **Scope Boundaries** |
| **Quick Start** | A condensed numbered workflow showing the steps Cowork will run end-to-end |
| **Core Instructions** | The full numbered Step 1 → Step N detail. Every tool call named explicitly (`ListCalendarView`, `ListMessages`, etc.). Every parameter spelled out |
| **Output** | The exact shape of the artefact — example tables, formatting rules, file naming |
| **Guardrails** | Numbered list of explicit rules — what NOT to do, what to never invent, when to leave `[confirm]` placeholders. Cowork scores this section directly under **Robustness** |

The "never invent" line is the most important habit. It tells Cowork to leave a clearly-marked placeholder (e.g. `[confirm date]`) rather than guessing. That single discipline is the difference between a skill that's safe to demo and one that occasionally embarrasses you in front of a customer.

---

## Cowork's 5-step skill creation pipeline

When you ask Cowork to create a skill (Method A above), it runs through a deterministic 5-step pipeline rather than just writing a file blind:

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/31-cowork-skill-creation-thought-process.png" alt="Cowork's Thought process panel expanded during skill creation. Shows the planning workflow with five numbered steps — 1. Validate the name, 2. Draft and write the SKILL.md, 3. Auto-validate and score, 4. Generate quality report, 5. Show summary. Below the list, Cowork notes that the name is valid and the user is at 4 of 50 skills used." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

The pipeline:

| Step | What happens |
|---|---|
| 1. Validate the name | Checks the skill name is unique in your library and that you're under the 50-skill quota |
| 2. Draft and write the SKILL.md | Generates the SKILL.md file following the 8-section pattern above, writes it to your OneDrive `Documents/Cowork/Skills/<name>/` folder |
| 3. **Auto-validate and score** | Scores the just-written skill against four quality dimensions (Trigger Clarity, Instruction Specificity, Scope Boundaries, Robustness) plus three hard gates (Publish bar MVB ≥ 70, No-fabrication check, Risk tier classification) |
| 4. **Generate quality report** | Produces a standalone `skill-quality-report.html` file in the task output folder showing the score breakdown |
| 5. Show summary | Sends a final chat summary with the trigger phrases, what the skill does, and the score |

This is new behaviour — older Cowork builds wrote the SKILL.md and stopped there. The validation + scoring + report pattern means a custom skill arrives audit-ready.

---

## Cowork scores your skill — Skill Quality Report

After writing the SKILL.md, Cowork displays a **Skill Quality Report** card in the chat. The score is out of 100, computed from four 25-point dimensions, with three hard gates that decide whether the skill is publishable.

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/32-cowork-skill-quality-dimension-breakdown.png" alt="Cowork's Skill Quality Report card showing a sample skill scoring 96 out of 100 with an Excellent green badge. A full-width green progress bar sits below the title. The Dimension Breakdown lists four scored dimensions — Trigger Clarity 25 of 25 with note '6 trigger phrases plus exclusion clause', Instruction Specificity 25 of 25 with note 'Numbered workflow, named tools, output format, Quick Start', Scope Boundaries 23 of 25 with note 'When NOT to Use section, delegation to sibling skills', and Robustness 23 of 25 with note '10 guardrail rules, missing-data handling'. Below the dimensions are three rows — Publish bar (MVB greater than or equal to 70) marked PASS, No-fabrication check marked PASS, and Risk tier shown as Medium (read-only, no writes). A note on the right reads Syncing to OneDrive (about 35 seconds), and the six trigger phrases that fire the skill are listed at the bottom." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

### The four dimensions

| Dimension | Max | What earns full marks |
|---|---|---|
| **Trigger Clarity** | 25 | Multiple trigger phrases (≈5+), distinct wording (not just synonyms), and a "Do NOT use for…" exclusion clause that delegates to sibling skills |
| **Instruction Specificity** | 25 | Numbered Core Instructions workflow, every tool call named (`ListCalendarView`, `docx`, etc.), explicit Output format with example tables, a Quick Start condensed view |
| **Scope Boundaries** | 25 | "When NOT to Use" section that explicitly delegates to sibling skills, clear in-scope vs out-of-scope boundary |
| **Robustness** | 25 | Multiple explicit guardrail rules (10 is a strong baseline), missing-data handling with `[confirm]` placeholders, "never invent" discipline |

### The three hard gates

| Gate | What it means |
|---|---|
| **Publish bar (MVB ≥ 70)** | Minimum Viable Bar — skills scoring under 70 are flagged as not-publishable; Cowork won't promote them as ready-to-use |
| **No-fabrication check** | Validates the skill enforces "never invent" discipline — placeholders for missing facts rather than guesses |
| **Risk tier** | Classified Low / Medium / High based on what the skill writes or sends. *Read-only* skills (only retrieves data, doesn't post or send) get **Medium**; skills that send emails or post to Teams without checkpoints get **High** |

### What you see in the chat after creation

The final chat summary tells you what the skill is, the score, the trigger phrases, and attaches the standalone `skill-quality-report.html` file for review later.

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/33-cowork-skill-creation-summary.png" alt="Cowork's final chat summary after creating a skill. Headline reads 'Your friday-portfolio-digest skill is live and scored 96 out of 100 — Excellent, well above the 70 publish bar.' Lists six trigger phrases — friday portfolio digest, weekly customer touchpoint review, who do I need to stay in touch with, friday customer review, portfolio check, and who needs a touchpoint before the weekend. Below that, six numbered steps describe what the skill does — scans calendar for external attendees, checks sent items for outbound emails, checks inbox for inbound flagged messages, marks orgs with no touchpoint in 14 plus days as Stale, produces a scannable digest with Active / Awaiting Reply / Stale / Top 3 sections and saves a .docx file named friday-portfolio-digest-2026-06-15.docx, and never sends or posts anything. Closing note says the quality report is saved to files and changes will appear in OneDrive within about 35 seconds. An attached file shown is skill-quality-report.html." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

> 💡 **Use the scoring to tune your prompts.** When I asked Cowork to create the `friday-portfolio-digest` skill above, the first generation scored 96 — the 4 lost points came from two dimensions (Scope Boundaries and Robustness) where my create-prompt could have been more explicit. If a skill scores below the Publish bar, re-issue the create-prompt with more guardrails, more sibling-skill delegation, and more specific tool names. Cowork will re-score the next version. It's a working feedback loop.

---

## Path 2 — Custom skills via Copilot Studio (low-code, for admins)

If you're an IT admin or power user, [Copilot Studio](https://copilotstudio.microsoft.com) lets you build custom skills using Power Automate flows, API connectors, or AI-powered topics. Once published, they appear as callable actions inside Cowork.

### Path 3 — Pro-code skills (for developers)

For full control, the [Microsoft 365 Agents SDK](https://github.com/microsoft/Agents) lets developers build skills in .NET, JavaScript, or Python. Register them in Copilot Studio and they become available inside Cowork — just like any built-in skill.

---

## Where to find more skills

| Resource | What's there |
|---|---|
| [microsoft/skills on GitHub](https://github.com/microsoft/skills) | 130+ pre-built skills, ready to deploy or customise |
| [microsoft/CopilotStudioSamples](https://github.com/microsoft/CopilotStudioSamples) | Agent and skill samples for real business scenarios |
| [microsoft/Agents](https://github.com/microsoft/Agents) | SDK for building your own custom skills |
| [Copilot Studio Sample Gallery](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/agent-samples) | Official curated samples from Microsoft |

> ⚠️ **Admin tip:** Before adding third-party skills, review the permissions they request. Each skill accesses data on behalf of the user — so treat skill approval the same way you'd treat an app approval in Entra ID. Start with a pilot group.

📖 [Add and manage skills in Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-use-skills)

---

## Other Cowork spokes

- [Cowork: How to use it step by step](/blog/microsoft-copilot-cowork-how-to-use-step-by-step/)
- [Cowork: Use cases by role](/blog/microsoft-copilot-cowork-use-cases-by-role/)
- [Cowork: Prompts to try](/blog/microsoft-copilot-cowork-prompts-to-try/)
- [Cowork: Pricing and cost management](/blog/microsoft-copilot-cowork-pricing-cost-management/)
- [Cowork: Admin enablement and governance](/blog/microsoft-copilot-cowork-admin-and-governance/)

## Official Microsoft references for skills + plugins

- [Microsoft Learn — Copilot Cowork overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/)
- [Microsoft Agent Academy — Cowork Collective](https://github.com/microsoft/agent-academy/tree/main/docs/cowork-collective) — official hands-on labs:
  - [Badge Bandit](https://github.com/microsoft/agent-academy/blob/main/docs/cowork-collective/badge-check/index.md) — 25 min · CSV analysis + styled HTML report email
  - [Vacay (Out-of-Office Prep)](https://github.com/microsoft/agent-academy/blob/main/docs/cowork-collective/out-of-office-prep/index.md) — 20 min · full OOO handoff in one conversation
  - [Audit Ace](https://github.com/microsoft/agent-academy/blob/main/docs/cowork-collective/compliance-packet/index.md) — 25 min · compliance packet assembly

## Community Cowork skill libraries (with attribution)

The Cowork developer community is publishing creative skill patterns publicly. One worth a look if you build custom skills:

- [`ITSpecialist111/Copilot-Cowork-Skills`](https://github.com/ITSpecialist111/Copilot-Cowork-Skills) — a personal research repository containing two interesting patterns:
  - **`skill-factory`** — a meta-skill that batch-creates other skill packages to a defined quality bar
  - **`rfp-agent-swarm`** — a 7-skill pipeline for RFP response work (intake → fit assessment → drafting → human gates → review → assembly), shared substrate, 4 hard human-approval gates

> ⚠️ **Note on community content:** Community repos like the one above are independent research artefacts, not Microsoft products. The author of that repo states this clearly. They can be excellent learning material but should always be validated against [Microsoft Learn — Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/) before being used with real data.
