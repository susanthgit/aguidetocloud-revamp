---
title: "Microsoft Copilot Cowork — Complete Admin Playbook"
list_title: "Cowork: Admin enablement and governance"
description: "Microsoft Copilot Cowork admin guide — turning it on, 4 governance controls, oversharing protection, 5-step pilot rollout, troubleshooting tips."
date: 2026-06-15
lastmod: 2026-06-15
draft: false
card_tag: "Cowork"
tag_class: "ai"
images: ["images/og/blog/microsoft-copilot-cowork-admin-and-governance.jpg"]
og_headline: "Cowork: admin and governance"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - cowork
  - admin
  - governance
  - ai
hub_id: "cowork"
layout: "notebook"
stamp: "admin guide"
intro_note: "↗ the IT admin playbook — turning Cowork on, governance controls, oversharing protection, pilot rollout, and the things that catch teams off-guard"
sitemap:
  priority: 0.8
founder_note: |
  Most of the customer questions I get about Cowork are about enablement and governance — not "what does it do" but "what should I lock down before I let users near it?" This page is the playbook I walk admins through. Pilot first, audit your SharePoint, brief your users, then expand.
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Admin path updates as Microsoft refines GA-day controls — this page tracks each change. **Last verified: 15 June 2026 · pre-GA structure.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is and how it works. This spoke is the IT admin playbook.*

---

## TL;DR

- **Cowork inherits user permissions** — it can only access what the user already has access to
- **Audit SharePoint before broad rollout** — Cowork surfaces over-sharing fast
- **Pilot first** — pick a small group, brief them, then expand
- **Governance is enterprise-grade** — Entra ID, Purview DLP, Conditional Access, full audit trail

---

## How to enable Cowork at GA

<!-- PRE-GA EXPANSION — content extracted from hub lines 639-665. Refresh on GA day with post-Frontier enablement path. -->

Coming: the official admin steps once Microsoft publishes the GA enablement guide.

---

## Why a user can't see Cowork in their Copilot Chat

<!-- PRE-GA EXPANSION — content extracted from hub lines 645-653 -->

Coming: the checklist (licence, region, group restriction, admin-disabled, etc.).

---

## Governance — what's built in

How Cowork plugs into Entra ID, Purview DLP, Conditional Access, and the M365 audit log out of the box.

---

## SharePoint oversharing — the most important control to check first

The "permissions amplifier" effect: Cowork can surface anything the user has access to, even if they didn't know they had access to it. If your SharePoint permissions are messy, Cowork makes that mess visible to the user.

For the full remediation playbook see [SharePoint oversharing controls for Microsoft 365 Copilot](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/).

---

## Pilot rollout playbook

A practical pilot plan:
1. Pick a small group (≈10-20 users) representing 2-3 roles
2. Brief them on what Cowork does, the approval checkpoint pattern, and what to escalate
3. Run for 2-4 weeks, collect usage + feedback
4. Audit access logs in Purview
5. Decide go/no-go for broader rollout based on what you saw

---

## Approval checkpoints — what they protect

<!-- PRE-GA EXPANSION — content extracted from hub lines 710-722 -->

The "Cowork pauses before sensitive actions" promise, and how to use it as a governance lever.

---

## What Cowork can't do (yet)

<!-- PRE-GA EXPANSION — content extracted from hub lines 725-735 -->

Set realistic expectations for your leadership and users.

---

## Known issues

<!-- PRE-GA STUB — refresh from Microsoft Learn "Known issues" page once GA settles -->

Coming: a curated list of known issues with workarounds, sourced from Microsoft's official "Cowork known issues" page.

---

## Other Cowork spokes

- [Cowork: How to use it step by step](/blog/microsoft-copilot-cowork-how-to-use-step-by-step/)
- [Cowork: Use cases by role](/blog/microsoft-copilot-cowork-use-cases-by-role/)
- [Cowork: Prompts to try](/blog/microsoft-copilot-cowork-prompts-to-try/)
- [Cowork: Pricing and cost management](/blog/microsoft-copilot-cowork-pricing-cost-management/)
- [Cowork: Skills and plugins](/blog/microsoft-copilot-cowork-skills-and-plugins/)
