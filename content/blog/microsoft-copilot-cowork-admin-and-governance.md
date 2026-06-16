---
title: "Microsoft Copilot Cowork — Complete Admin Playbook"
list_title: "Cowork: Admin enablement and governance"
description: "Microsoft Copilot Cowork admin guide — turning it on, 4 governance controls, oversharing protection, 5-step pilot rollout, troubleshooting tips."
date: 2026-06-15
lastmod: 2026-06-17
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

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Copilot Cowork reached **general availability on 16 June 2026** — this page reflects the GA enablement path and governance stack. **Last verified: 17 June 2026 · GA day.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is and how it works. This spoke is the IT admin playbook.*

---

## TL;DR

- **Cowork inherits user permissions** — it can only access what the user already has access to
- **Audit SharePoint before broad rollout** — Cowork surfaces over-sharing fast
- **Pilot first** — pick a small group, brief them, then expand
- **Governance is enterprise-grade** — Entra ID, audit log, DSPM, eDiscovery, Insider Risk, and Communication Compliance at GA (DLP coming soon)

---

## How to enable Cowork at GA

If you're an IT admin, here's how to turn Cowork on:

1. **Turn Cowork on** — in the [Microsoft 365 admin center](https://admin.microsoft.com) → Copilot, enable Cowork and choose who gets access (No access / All users / Specific users). Cowork is **off by default** — it's off until you enable it.
2. **Set up usage-based billing** — Cowork's task work is billed in Copilot Credits, so open the **Cost Management dashboard**, enable billing (pay-as-you-go or prepaid), and set spending limits and usage alerts before users start running tasks. (See the [pricing spoke](/blog/microsoft-copilot-cowork-pricing-cost-management/).)
3. **Enable Anthropic** — make sure Anthropic is enabled as a model provider; Cowork uses Claude under the hood through Microsoft's multi-model approach, and it can be off by default in some tenants.
4. **Scope the pilot** — three levers people mix up: *availability* (who's allowed), *deployment/pinning* (whether it shows in their Copilot rail), and *plugins* (what it can reach — see governance below). Keep availability to your pilot group first (Specific users). Pilot-first is the sane default.
5. **Communicate** — tell your users it's available, what it does, and that it checks in before sensitive actions.

> ⚠️ **Do this before you enable it broadly:** review your [SharePoint permissions](https://learn.microsoft.com/en-us/sharepoint/modern-experience-sharing-permissions) and [information governance](https://learn.microsoft.com/en-us/purview/information-governance-solution) first. Cowork can reach anything the user can reach — so if your permissions are messy, Cowork surfaces that mess. Full remediation playbook: [SharePoint oversharing controls for Copilot](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/).

---

## Why a user can't see Cowork in Microsoft 365 Copilot

The five usual suspects, in rough order of likelihood:

1. **An admin hasn't turned Cowork on** — it's off by default, so someone has to enable it in the Microsoft 365 admin center.
2. **Usage-based billing isn't set up** — Cowork's work is billed in Copilot Credits, so an admin needs to enable billing first.
3. **No Copilot licence** — the user needs the paid Microsoft 365 Copilot seat.
4. **Access is group-restricted** — an admin scoped Cowork to specific groups, and this user isn't in one.
5. **Anthropic isn't enabled** as a model provider — Cowork needs it, and it can be off by default in some tenants.

If you've ruled out all five and a licensed user still can't see it, give it time to propagate — tenant changes can take a while to roll through — before raising a ticket.

---

## Governance — what's built in

The single most reassuring thing about Cowork for an admin: **it inherits the user's identity and permissions.** It can't see, touch, or send anything the user couldn't already — it's acting *as* them, inside the same guardrails.

Here's the enterprise stack it plugs into out of the box:

| Control | What it does for Cowork |
|---|---|
| **Entra ID** | Cowork acts under the user's identity and permissions — no new standing access is created. |
| **Sensitivity labels** | Purview sensitivity labels are inherited and displayed end-to-end on Cowork's inputs and outputs. |
| **Unified audit log** | Cowork's prompts, responses, and actions land in the audit log — you can see what ran, when, and on whose behalf. |
| **DSPM for AI** | Data Security Posture Management gives visibility into Cowork's AI activity and the data it touches. |
| **eDiscovery** | Cowork content is discoverable for legal hold and investigation workflows. |
| **Insider Risk Management** | Cowork activity is in scope for insider-risk policies. |
| **Data Lifecycle Management** | Retention and lifecycle policies apply to Cowork content (rolling out worldwide in the week after GA). |
| **Communication Compliance** | Cowork communications are in scope for Communication Compliance policies. |
| **Conditional Access** | Sign-in conditions (device, location, risk) apply to Microsoft 365 Copilot, Cowork included. |
| **Human-in-the-loop checkpoints** | Sensitive actions pause for explicit user approval (see below) — a governance lever, not just a UX nicety. |

None of this is bolted on after the fact — Cowork's prompts, responses, and generated artifacts flow through the same Microsoft 365 compliance framework as the rest of your tenant: governed, discoverable, and retained.

> ⏳ **One gap to know at GA: Data Loss Prevention (DLP) for Cowork is *coming soon*.** Until it ships, don't assume DLP policies gate what Cowork drafts and sends — lean on the approval checkpoints and the controls above. As always for an agentic tool, confirm the exact coverage against Microsoft's GA documentation and your own tenant policies before you rely on any single control.

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
- **Check language coverage for your region** — Cowork is generally available worldwide, but confirm full language support for your users.
- **No offline mode** — it's cloud-based and needs a connection.
- **Won't replace deep expertise** — it's strong at coordination, not strategic judgement.
- **It's a permissions amplifier** — if your SharePoint permissions are messy, Cowork makes that mess visible to users who shouldn't see it. This is the one to fix *before* rollout, not after.

These are solvable, and several are on Microsoft's roadmap — but check Microsoft's GA documentation before treating any limit as temporary, and know them before you promise the world.

---

## Known issues

Cowork is new and evolving fast. For the current, authoritative list of limitations and fixes, check Microsoft's [Cowork documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/) — and remember Data Loss Prevention (DLP) support is still rolling out (see the governance note above).

---

## Other Cowork spokes

- [Cowork: How to use it step by step](/blog/microsoft-copilot-cowork-how-to-use-step-by-step/)
- [Cowork: Use cases by role](/blog/microsoft-copilot-cowork-use-cases-by-role/)
- [Cowork: Prompts to try](/blog/microsoft-copilot-cowork-prompts-to-try/)
- [Cowork: Pricing and cost management](/blog/microsoft-copilot-cowork-pricing-cost-management/)
- [Cowork: Skills and plugins](/blog/microsoft-copilot-cowork-skills-and-plugins/)
