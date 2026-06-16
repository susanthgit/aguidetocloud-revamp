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

> 🚧 **Pre-GA note:** the steps below reflect the **Frontier preview** enablement path as it stands today. On GA day Microsoft may simplify this (for example, dropping the Frontier opt-in). I'll refresh this section the moment the official GA enablement guide is public.

If you're an IT admin, here's how to turn Cowork on:

1. **Enrol in Frontier** — [M365 Admin Center](https://admin.microsoft.com) → Copilot → Settings → find **Copilot Frontier** → assign access (No access / All users / Specific users). It's opt-in, not automatic — and the admin account needs it enrolled too.
2. **Enable Anthropic** — Copilot → Settings → AI providers → Enable Anthropic. Cowork uses Claude under the hood through Microsoft's multi-model approach, and it's off by default in EU tenants.
3. **Cowork becomes available** — once Frontier is on, licensed users open Cowork at **m365.cloud.microsoft** (or the Microsoft 365 Copilot app), selecting it directly or finding it under **All agents**. No separate deployment needed.
4. **Scope the pilot** — three levers people mix up: *availability* (who's allowed), *deployment/pinning* (whether it shows in their Copilot rail), and *plugins* (what it can reach — see governance below). Keep availability to your pilot group first via the **Copilot Frontier** access setting (Specific users). Pilot-first is the sane default.
5. **Communicate** — tell your users it's available, what it does, and that it checks in before sensitive actions.

> ⚠️ **Do this before you enable it broadly:** review your [SharePoint permissions](https://learn.microsoft.com/en-us/sharepoint/modern-experience-sharing-permissions) and [information governance](https://learn.microsoft.com/en-us/purview/information-governance-solution) first. Cowork can reach anything the user can reach — so if your permissions are messy, Cowork surfaces that mess. Full remediation playbook: [SharePoint oversharing controls for Copilot](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/).

---

## Why a user can't see Cowork in Microsoft 365 Copilot

The five usual suspects, in rough order of likelihood:

1. **Your org hasn't enrolled in Frontier** — it's opt-in, not automatic.
2. **Anthropic isn't enabled** as a subprocessor — Cowork needs it (off by default in EU tenants).
3. **No Copilot licence** — the user needs the paid Microsoft 365 Copilot add-on.
4. **Access is group-restricted** — an admin scoped Cowork to specific groups, and this user isn't in one.
5. **Region or language not supported yet** — US English first, more coming.

If you've ruled out all five and a licensed user still can't see it, give it time to propagate — tenant changes can take a while to roll through — before raising a ticket.

---

## Governance — what's built in

The single most reassuring thing about Cowork for an admin: **it inherits the user's identity and permissions.** It can't see, touch, or send anything the user couldn't already — it's acting *as* them, inside the same guardrails.

Here's the enterprise stack it plugs into out of the box:

| Control | What it does for Cowork |
|---|---|
| **Entra ID** | Cowork acts under the user's identity and permissions — no new standing access is created. |
| **Purview DLP** | Data Loss Prevention policies apply to what Cowork drafts and sends, the same as any other M365 action. |
| **Purview audit log** | Cowork's actions land in the unified audit log — you can see what ran, when, and on whose behalf. |
| **Conditional Access** | Sign-in conditions (device, location, risk) apply to Microsoft 365 Copilot, Cowork included. |
| **Human-in-the-loop checkpoints** | Sensitive actions pause for explicit user approval (see below) — a governance lever, not just a UX nicety. |

None of this is bolted on after the fact — Cowork runs inside the same compliance framework as the rest of Microsoft 365.

*One caveat worth stating plainly: these protections are documented for Microsoft 365 Copilot broadly, and Cowork runs inside it. For an agentic tool, confirm Cowork-specific audit events and the exact DLP and Conditional Access coverage against Microsoft's GA documentation and your own tenant policies before you rely on them.*

**And budget a separate review for plugins and custom skills.** Cowork can be extended with plugins from the Microsoft 365 App Store and with custom `SKILL.md` skills. These widen what Cowork can reach — and they bring their own consent, connector-credential, data-handling, and audit questions. Decide which plugins are allowed in your tenant, and treat each one as its own governance review.

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

The checkpoint system is Cowork's most important governance feature, and it's worth understanding as a *control*, not just a prompt.

- **Actions that send or change something wait for approval.** Sending an email, posting to Teams, scheduling a meeting, creating a file — each pauses for an explicit yes, with a risk indicator and a button that matches the action (**Send**, **Post**, **Create**). If Cowork drafts the wrong thing, you simply don't approve it.
- **You can pause, resume, or cancel** at any time — see a run going sideways and you stop it immediately.
- **You can redirect mid-task.** "Actually, focus on the financial data, not the customer emails" — and it adapts within the current task.
- **A "skip future prompts" option exists.** A dropdown lets users stop being asked for similar low-risk actions — convenient, but it trades safety for speed.

For an admin, the honest framing is that checkpoints **reduce the blast radius — they're not a substitute for review.** A user can still approve the wrong action, or switch off prompts for an action type. And not everything is gated — drafting, reorganising files, or moving calendar items can happen inside a run. So the realistic worst case isn't "nothing"; it's "a user approved something they shouldn't have." Brief your people to treat each approval as a real decision, and to keep the skip-prompts option for genuinely low-stakes, repetitive work.

---

## What Cowork can't do (yet)

Set expectations honestly with your leadership and users — over-promising is the fastest way to lose a pilot:

- **External systems need Skills or plugins.** Cowork doesn't connect to Salesforce, Jira, or SAP out of the box; partner plugins from the Microsoft 365 App Store and custom skills can bridge the gap. (See the [Skills & plugins spoke](/blog/microsoft-copilot-cowork-skills-and-plugins/).)
- **English only at launch** — more languages coming.
- **No offline mode** — it's cloud-based and needs a connection.
- **Won't replace deep expertise** — it's strong at coordination, not strategic judgement.
- **It's a permissions amplifier** — if your SharePoint permissions are messy, Cowork makes that mess visible to users who shouldn't see it. This is the one to fix *before* rollout, not after.

These are solvable, and several are on Microsoft's roadmap — but check Microsoft's GA documentation before treating any limit as temporary, and know them before you promise the world.

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
