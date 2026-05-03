---
title: "SharePoint Permissions Decoded"
description: "Visual map of SharePoint's permission model — site → library → folder → file inheritance, default groups, when inheritance breaks, external sharing, and why Copilot makes permission hygiene critical."
intro: "SharePoint permissions are simple in theory and a swamp in practice. Here's the model — and why Copilot makes hygiene non-negotiable."
category: "copilot"
format: "architecture"
renderer: "static"
data_file: "sharepoint_permissions"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/sharepoint-permissions.jpg
faq:
  - question: "What does 'breaking inheritance' mean and why is it bad?"
    answer: "By default, every library, folder, and file inherits permissions from its parent — change permissions at the site, all children update. When you add a unique permission to a folder or file (often via the 'Share' button), SharePoint creates a NEW permission set for that item — it stops inheriting from the parent. Future changes at the site or library don't apply. It's not bad in itself, but at scale it makes 'who has access to what?' nearly impossible to audit. Best practice: minimise unique permissions, share via M365 Groups or security groups, not individuals."
  - question: "Why does Copilot make permissions hygiene urgent?"
    answer: "Copilot uses your tenant's grounding to answer prompts — it sees every file YOU can see across SharePoint, OneDrive, emails, chats. If your SharePoint has years of accumulated oversharing — 'Anyone with the link' files, public sites with sensitive data, broken inheritance leaving files stranded — Copilot will surface those in answers. The rule is 'Copilot won't show you anything you don't already have access to' — which is technically true but sociologically catastrophic, because users had no idea what they had access to. Pre-Copilot: passive risk. Post-Copilot: active surface."
  - question: "What's Restricted SharePoint Search?"
    answer: "A tenant-wide setting that limits Copilot's grounding to a curated allow-list of SharePoint sites + each user's OneDrive. Useful as a transitional control during Copilot rollout while you do permission cleanup. Once your SharePoint estate is clean, switch back to org-wide search. Microsoft positions it as 'training wheels' — buys you 3-6 months to fix permissions without blocking the rollout."
  - question: "Should I use SharePoint Site groups or Microsoft 365 Groups?"
    answer: "M365 Groups when the team needs Teams + email + a Planner — the SharePoint site auto-provisions and the Group's owners/members become Site Owners/Members. Use SharePoint groups for sites that don't need a Team (e.g., a corporate intranet, a project archive). Avoid managing access through individual Entra users on each site — that's the unmanaged unique-permissions trap. Use Entra security groups when you want to manage by role across many sites."
---
