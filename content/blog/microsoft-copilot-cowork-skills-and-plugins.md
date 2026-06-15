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

- Cowork ships with a set of built-in skills covering core M365 apps
- Three ways to add more: **plugins**, **custom SKILL.md files** in OneDrive (no-code), or **Copilot Studio** (low-code / pro-code)
- Microsoft maintains four official plugin pages on Microsoft Learn for full reference

---

## Built-in skills — 13 in 5 categories

Cowork ships with **13 built-in skills, organised in 5 categories**. The category structure below mirrors [Microsoft's official Cowork Collective labs](https://github.com/microsoft/agent-academy/tree/main/docs/cowork-collective) (the authoritative source).

| Category | What it covers |
|---|---|
| **Communication** | Draft and send emails, post to Teams channels and chats, manage your inbox |
| **Documents** | Create Word documents, Excel spreadsheets, PowerPoint presentations, and PDFs |
| **Calendar** | Schedule meetings using natural language, manage calendar conflicts, get daily briefings |
| **Search** | Find information and people across your organisation, perform deep research |
| **Automation** | Run prompts on a schedule for recurring tasks |

<!-- TODO Atlas/Sush: enumerate the exact 13 individual skill names from Sush's tenant during testing. Current verified source (agent-academy) confirms the count + 5-category structure; individual-skill enumeration in the hub body is one-place-only and should be reconciled. -->

> 💡 **Recent change worth knowing:** Cowork now auto-approves emails sent to yourself — no approval prompt for self-emails. Other actions still require approval. (Source: [Microsoft Agent Academy Cowork Collective — Badge Bandit](https://github.com/microsoft/agent-academy/blob/main/docs/cowork-collective/badge-check/index.md).)

---

## How plugins extend Cowork

What plugins are, when to use them, where to find the official Microsoft catalog.

Microsoft maintains four reference pages on Microsoft Learn:
- **Available plugins for Copilot Cowork** — the catalog
- **Use plugins with Copilot Cowork** — end-user guide
- **Build plugins for Copilot Cowork** — developer reference
- **Manage plugins for Copilot Cowork** — admin governance

<!-- Sush — once GA settles and Microsoft removes the (Frontier) suffix from these pages, link them directly with the new URLs -->

---

## Custom skills via OneDrive (no-code)

<!-- PRE-GA EXPANSION — content extracted from hub lines 583-614 -->

Two methods that both work — asking Cowork to create the SKILL.md, or uploading the file yourself.

---

## Custom skills via Copilot Studio (low-code)

<!-- PRE-GA EXPANSION — content extracted from hub lines 616-619 -->

For admins and power users.

---

## Custom skills via the Agents SDK (pro-code)

<!-- PRE-GA EXPANSION — content extracted from hub lines 620-622 -->

For developers — .NET, JavaScript, or Python.

---

## Where to find more skills

<!-- PRE-GA EXPANSION — content extracted from hub lines 624-635 -->

GitHub repos, sample galleries, and the Microsoft Learn skill index.

---

## Admin watch-outs when adding third-party skills

<!-- PRE-GA EXPANSION — content extracted from hub lines 633-635 -->

Treat skill approval the way you treat app approval in Entra ID.

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
