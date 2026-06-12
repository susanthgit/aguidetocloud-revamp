---
title: "Microsoft Scout — Admin Install & Frontier Setup"
description: "Step-by-step admin install for Microsoft Scout: Frontier enrollment in the Microsoft 365 admin center, Intune policy, attestation, GitHub Copilot license."
date: 2026-06-12
lastmod: 2026-06-12
draft: false
card_tag: "Scout"
tag_class: "ai"
images: ["images/og/blog/microsoft-scout-admin-install-frontier-enrollment.jpg"]
og_headline: "Scout Admin Install"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - scout
  - frontier
  - intune
  - admin
hub_id: "scout"
list_title: "Scout: Admin install & Frontier setup"
layout: "notebook"
stamp: "admin guide"
intro_note: "↗ the IT admin's two-gate install walkthrough for Microsoft Scout — Frontier in the M365 admin centre, Intune policy, attestation form, and the GitHub Copilot license assignment that sign-in needs."
sitemap:
  priority: 0.8
founder_note: |
  Most "Scout doesn't work for me" tickets are admin-gate questions in disguise. This is the walkthrough I wish I'd had when I onboarded my first pilot users — both gates, in order, with the in-product UI you'll actually see along the way. Bookmark it, share it with your IT admin, and you'll save a couple of hours on the first install.
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Scout — Complete Guide](/blog/microsoft-scout-complete-guide/) series.** This is the admin-install spoke. Frontier ships weekly — this page updates as the gates change. **Last verified: 12 June 2026 · Scout version 0.23.0.20260608.1.**

</div>

*The hub for this series — [Microsoft Scout — The Complete Guide](/blog/microsoft-scout-complete-guide/) — covers what Scout is, how it differs from Copilot, what it costs, and the honest take. This spoke is the install reference.*

---

## The two-gate access model in plain English

Microsoft's own admin docs make this explicit: **Microsoft Scout sits behind two separate admin gates, and both must be complete before any user can sign in.** Gate 1 enables the Frontier surface for your tenant. Gate 2 enables Microsoft Scout specifically for the devices and users you choose.

Frontier is the umbrella programme; Scout is one of the products inside it. Same Frontier umbrella also gates other Microsoft preview agents (Opal Frontier, for example) — separate toggles, same enrollment.

The good news: you only do all of this once per tenant.

This is the part that takes longest the first time. The two gates also explain the most-asked support question — "I installed Scout and it won't sign in." Almost always, that means one of the gates isn't complete yet. The hub guide's [FAQ section](/blog/microsoft-scout-complete-guide/#faq-heading) covers the most common cases.

---

## Gate 1 — Turn on Frontier in the Microsoft 365 admin centre

You need to be signed in as an admin with one of these roles:

- **AI Admin** (preferred — the role designed for this)
- **Security Admin**
- **Office Apps Admin**
- Global Admin works too, but you should be using a least-privilege role wherever possible

Frontier users you assign access to also need a Microsoft 365 Copilot license — verify license assignment for your pilot users before they try to sign in to Scout.

### Step 1 — Open the M365 admin centre

Sign in to **[admin.microsoft.com](https://admin.microsoft.com)** with your admin account.

You land on the M365 admin centre home page. Mine looks like this (CDX/Contoso demo tenant — yours will show your own org name, your real user counts, and your real Copilot activity):

<p><img src="/images/blog/scout-complete-guide/10-m365-admin-homepage.png" alt="Microsoft 365 admin center home page in the Contoso demo tenant. The dashboard reads 'Manage Microsoft 365, Copilot, and AI agents all in one place' and shows widgets for User licenses breakdown (43 active users, 99/100 Microsoft 365 licenses, 24/25 Microsoft 365 Copilot licenses), Microsoft 365 usage (11 active users with a chart for OneDrive and SharePoint trending up across Apr–Jun), Copilot activity (24 licensed users, 0 unlicensed, 0 prompts used) and the beginning of an Agent activity widget showing 277 total agents. The left navigation shows Home, Copilot, Agents, Users, Teams & groups, Roles, Resources, Marketplace, Billing, Support, Settings, Setup, Reports, Health." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The Microsoft 365 admin centre home page in our CDX/Contoso demo tenant. The dashboard layout is the new "all in one place" view (toggle at the top). The Copilot and Agents entries in the left navigation are the two we care about for the rest of this walkthrough.*

### Step 2 — Navigate to Copilot Settings

Click **Copilot** in the left navigation, then **Settings**, then the **View all** tab at the top of the settings page.

<p><img src="/images/blog/scout-complete-guide/11-m365-admin-copilot-settings.png" alt="Microsoft 365 admin center Copilot Settings page in the Contoso tenant. The Copilot menu in the left navigation is expanded (highlighted with a red box) showing Overview, Connectors, Search, Billing & usage, Settings (also red boxed as the active selection). At the top of the page two tabs are visible — Optimize and View all — with View all selected and underlined in blue. The settings list shows multiple entries with their descriptions including Web search for Microsoft 365 Copilot and Microsoft 365 Copilot Chat, Screen and camera sharing, Recommendations for Microsoft 365 Copilot licensing, Pin Microsoft 365 Copilot Chat, Pin Microsoft 365 Copilot apps to the Windows taskbar, People Skills in Microsoft 365 Copilot, Opal (Frontier), Microsoft Copilot for Security, Microsoft 365 Copilot self-service purchases, Microsoft 365 Copilot in admin centers, Fabric data in Microsoft 365 Copilot, Dataverse data available in Microsoft 365 Copilot." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Copilot → Settings → View all. The full Copilot settings list is long — search is faster than scrolling.*

> **Sidebar — Opal (Frontier) is a separate setting.** You'll notice **Opal (Frontier)** in the settings list too. That's a different Microsoft Frontier-preview product (a workspace-design tool) — same Frontier umbrella, separate access toggle. Don't confuse it with Copilot Frontier (the umbrella that gates Scout). I'll cover Opal in its own post.

### Step 3 — Search for Frontier

Top right of the settings view is a **Search all Copilot settings** box. Type `frontier` and Microsoft narrows the list to the Frontier-related settings:

<p><img src="/images/blog/scout-complete-guide/13-m365-admin-search-frontier.png" alt="Microsoft 365 admin center Copilot Settings page filtered by the search term 'frontier'. The search box in the top right (highlighted with a red box) contains the text 'frontier'. The results table shows two rows: Opal (Frontier) with the description 'Choose which users in your organization can access Opal (Frontier)', and Copilot Frontier (the second row highlighted with a red box) with the description 'Enable exclusive early access program in your organization'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Search results for "frontier" — two settings appear. The one to click for Scout access is the second row, **Copilot Frontier** (description: "Enable exclusive early access program in your organization").*

### Step 4 — Open Copilot Frontier and pick who gets access

Click **Copilot Frontier**. The "Turn on Frontier features" flyout slides in:

<p><img src="/images/blog/scout-complete-guide/08-m365-cdx-frontier-setting.png" alt="Microsoft 365 admin center 'Turn on Frontier features' flyout. The panel explains that Frontier features are previews and might not reach GA, requires a Microsoft 365 Copilot license per user, and warns changes may take up to 3 hours to process. Three radio options are visible — No access, All users, Specific users — with Specific users currently selected and three users enrolled (MOD Administrator, Amber Rodriguez, Sonia Rees)." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The Copilot Frontier flyout — three access options (No access, All users, Specific users), with Specific users selected here for our demo and three demo users assigned. Notice the TAP note at the top of the panel and the 3-hour propagation warning. Both matter.*

You have three options:

- **No access** — default. Nobody in your tenant gets Frontier features. Pick this to disable Scout access cleanly.
- **All users** — every licensed Microsoft 365 Copilot user in your tenant gets Frontier features automatically. Pick this if you've decided Frontier is your default release channel for all your Copilot users. Most enterprises start more cautiously than this.
- **Specific users** — only the named users get Frontier features. Pick this for a controlled pilot — usually 3-10 users from across functions while you validate Scout against your org's policies and risk posture.

Click **Save**. Then wait *up to three hours* for the change to propagate. Tell your pilot users not to attempt sign-in until the next business hour at the earliest.

Gate 1 done.

---

## Gate 2 — Intune policy, attestation, GitHub Copilot license

Gate 2 has three required admin actions. All must be completed before users can sign in to Microsoft Scout.

### Gate 2.1 — Enable access via an Intune policy

An IT admin must configure an Intune policy for Microsoft Scout that:

- Sets the required registry and device conditions
- Enables login capability for the app

Without this policy in place, users can't sign in to Microsoft Scout even if they install the app successfully.

The Intune policy templates ship in the public GitHub repo at [github.com/microsoft/scout-resources/tree/main/admins](https://github.com/microsoft/scout-resources/tree/main/admins):

- `microsoft-scout.admx` — policy definitions
- `en-US/microsoft-scout.adml` — policy display strings
- README with every policy explained

The key policy to enable here is `AllowScoutFrontierAccess` set to **Enabled**, targeted at the device groups whose users should be allowed to sign in.

For the full step-by-step inside Intune, see Microsoft's [Set up Microsoft Scout with Intune](https://learn.microsoft.com/en-us/microsoft-scout/admin-intune-setup) doc. It walks every screen.

<!-- 📸 Screenshots 15-19 placeholder — Intune policy import + AllowScoutFrontierAccess configuration + assignment to a device group (coming in a future revision once we re-walk through Intune for capture) -->

### Gate 2.2 — Complete the attestation and opt-in

Because Microsoft Scout can route data outside Microsoft 365 to third-party inference paths (specifically GitHub, since Scout uses your GitHub Copilot license for token billing), admins must explicitly attest and opt in for their organisation. This is an additional gating layer beyond Frontier enrollment, and it applies even if Gate 1 is already complete.

The attestation lives in a Microsoft Forms-based [M365 Admin Frontier organisation sign-up form](https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRyKGkCGRU0tBnsDASQkbqxJUOUROWUI4SFc5MFI5TTZJSU5MWExFRDZDMC4u). Open it as a tenant admin and walk through the questions. Microsoft links to this form from the [official admin-access overview](https://learn.microsoft.com/en-us/microsoft-scout/admin-access-overview).

<!-- 📸 Screenshot 20 placeholder — Microsoft Forms attestation page (coming in a future revision) -->

### Gate 2.3 — Provision GitHub Copilot licenses

Admins must ensure that users who'll use Scout have **GitHub Copilot Business or Enterprise** licenses assigned. This step is only required if users aren't already licensed.

For more information, see:

- [Setting up GitHub Copilot for your organization](https://docs.github.com/enterprise-cloud@latest/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-organization)
- [Granting access to GitHub Copilot for members of your organization](https://docs.github.com/enterprise-cloud@latest/copilot/how-tos/administer-copilot/manage-for-organization/manage-access/grant-access)

<!-- 📸 Screenshot 21 placeholder — GitHub Copilot license successfully assigned (coming in a future revision) -->

---

## What happens if any gate is incomplete

Installing the Microsoft Scout app always succeeds. The download isn't heavily gated. **Sign-in is where access is enforced.**

If Frontier isn't turned on for the user, or the Intune policy isn't deployed, or the attestation form hasn't been submitted, sign-in is blocked and the app doesn't show a clear in-product indication of why. The fix lives on the admin side, not the client.

If users report sign-in problems, verify both gates first before investigating the client:

| Check | Where | What "green" looks like |
|---|---|---|
| Gate 1 | M365 admin centre → Copilot → Settings → Copilot Frontier | User's UPN appears in Specific users (or All users is selected) |
| Gate 2.1 | Intune → Devices → Configuration → Scout policy | Policy assigned to user's device, last sync recent |
| Gate 2.2 | Internal record from the Forms submission | Attestation submitted by a tenant admin |
| Gate 2.3 | GitHub.com org → Settings → Copilot → Access | User's GitHub account has a GitHub Copilot Business or Enterprise seat |

---

## End-user requirements (after both gates are complete)

Once you've completed both admin gates, end users still need to:

- [Download and install the Microsoft Scout app](https://aka.ms/msscout)
- **Have a GitHub account** — Microsoft Scout uses your GitHub account for token billing, so each user needs one before signing in
- **Sign in with work credentials** — sign-in only succeeds after both admin gates are complete

User-side walkthrough (download → install → sign-in → permissions setup) is in the [hub guide Quick Start](/blog/microsoft-scout-complete-guide/#2--quick-start--download-install-sign-in-update-uninstall) section.

---

## Monday-morning admin checklist

If you're an M365 admin reading this on a Sunday evening and want to act before standup tomorrow:

1. **This morning (5 min):** Check whether your org is enrolled in the Frontier program. M365 admin centre → Copilot → Settings → search "Frontier" → Copilot Frontier. If it's set to *No access*, you have a decision to make.
2. **This morning (5 min):** Confirm your own admin account has a Microsoft 365 Copilot license assigned. Without it, the Frontier setting won't render.
3. **This morning (5 min):** Decide your pilot scope. 3-10 users from across functions is a sensible starting size for a *Specific users* enrollment. Pick people with low fear and high curiosity.
4. **This week (30 min):** Walk through Gate 2 end-to-end for the pilot group. Intune policy + attestation form + GitHub Copilot license.
5. **This week (30 min):** Install Scout on your own device, sign in, run one simple task end-to-end. Don't try to break it on day one — feel the shape.
6. **This week (30 min):** Walk through the five high-impact settings from the [secure-config spoke](/blog/microsoft-scout-secure-configuration-25-settings/). Closes the bulk of the practical risk.

---

## What to read next in this series

- **[Microsoft Scout — The Complete Guide (hub)](/blog/microsoft-scout-complete-guide/)** — what Scout is, how it differs from Copilot, what it costs, the honest take
- **[All 7 Bundled Skills Explained](/blog/microsoft-scout-bundled-skills-and-features/)** — Word, Excel, PowerPoint, Loop, Web Artifacts, Excalidraw, Expense Report — what each does
- **[Secure Configuration Guide](/blog/microsoft-scout-secure-configuration-25-settings/)** — the bookmark-worthy reference for IT admins
- **[MCP Servers & Custom Skills](/blog/microsoft-scout-mcp-servers-and-custom-skills/)** — extending Scout with your own MCP servers and SKILL.md files
- **[Automations, Memory, Heartbeats](/blog/microsoft-scout-automations-memory-heartbeats/)** — Scout's always-on engine
