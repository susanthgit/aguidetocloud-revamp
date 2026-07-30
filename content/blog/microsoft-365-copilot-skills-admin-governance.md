---
title: "Admin Guide to Microsoft 365 Copilot Skills"
list_title: "Copilot Skills — Admin & Governance Guide"
description: "Govern personal Skills, Cowork plugins, agents, and MCP tools without mixing their controls. Includes roles, deployment, Purview, DLP, IB, and pilot steps."
date: 2026-07-31
lastmod: 2026-07-31
draft: false
card_tag: "Copilot Skills"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-skills-admin-governance.jpg"]
og_headline: "Govern Copilot Skills"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - skills
  - governance
  - purview
  - mcp
hub_id: "copilot-skills"
layout: "notebook"
stamp: "admin guide"
intro_note: "↗ the control depends on what you are governing — a personal Skill is not the same thing as a plugin, agent, or MCP server"
sitemap:
  priority: 0.8
founder_note: |
  The safest admin question is not "How do we block Skills?" It is "Which Skill surface are we talking about?"

  Start with a small group, a named owner, a clear data boundary, and a review date. Then test the control you think you have. A policy name on a slide is not the same as seeing the block, audit event, consent prompt, and retained record in your tenant.
---

<div class="living-doc-banner">

**Living admin guide.** Microsoft publishes different controls for personal Office Skills, shared Cowork Skills, packaged plugins, agents, and Agent Tools. This page keeps those surfaces separate. **Public sources last checked: 31 July 2026.**

</div>

*This is part of the [Microsoft 365 Copilot Skills series](/blog/microsoft-365-copilot-skills-explained/).*

**There is no single "Copilot Skills admin switch."** The right control depends on what the user added and where it runs.

A personal `SKILL.md` in OneDrive is not governed through the same workflow as:

- a Cowork plugin from the Microsoft 365 App Store;
- an agent published to the Agent Store;
- a remote MCP server registered in Agent Tools.

Name the surface first. Then choose the control.

## The five governance surfaces

| Surface | What it is | Public admin story |
|---|---|---|
| **Personal Office Skill** | User-managed `SKILL.md` in PowerPoint or Excel | User flow is documented; exact tenant upload controls are not named in the public Skills pages |
| **Shared Cowork Skill** | OneDrive-backed Skill shared to named people | User can share to specific people and re-share updates |
| **Packaged Cowork plugin** | Microsoft 365 app package with Skills, connectors, or both | Admin deploy, target, allow, block, monitor |
| **Agent** | Broader custom Copilot experience | Agent Registry, requests, approval, publishing, lifecycle |
| **Agent Tool / MCP server** | External tool surface registered for agents | Tools Registry, requests, tenant consent, block/unblock, runtime enforcement |

<!-- Screenshot planned: Microsoft 365 admin center Agents > All agents > Registry showing Microsoft, partner, and organisation agents. -->

*Official UI reference: [Microsoft Learn — manage agents in Microsoft 365 admin center](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-copilot-agents-integrated-apps?view=o365-worldwide). Capture a current tenant view with identifying data masked.*

{{< margin >}}If you call all five "Skills," you will look for the right control in the wrong place.{{< /margin >}}

## Start with prerequisites and roles

### Cowork access

Microsoft says admins must enable usage-based billing to allow Cowork access. Discoverability is a separate setting.

If Cowork is discoverable but billing is not enabled, users can request access and the admin can review the request.

### Cowork plugin management

Public prerequisites:

- Microsoft 365 admin center access;
- tenant administrator or Copilot administrator role;
- Microsoft 365 Copilot licences for users who use the plugins.

### MCP tool approval

Approving a remote MCP server can include tenant-wide consent.

Microsoft names:

- **AI Administrator**
- **Global Administrator**

Use the least-privileged role that can complete the task. Global Administrator should not be the everyday answer.

| Job | Public role guidance |
|---|---|
| Manage Cowork plugins | Tenant admin or Copilot administrator |
| Approve Agent Tool/MCP request with tenant consent | AI Administrator or Global Administrator |
| Review and publish agents | Appropriate Agent Registry/admin roles |

## Deploy and block Cowork plugins

Admins can deploy plugins to:

- the whole organisation;
- specific users or groups;
- the Microsoft 365 App Store for user acquisition.

| Deployment | User gets it | User can remove it |
|---|---|---|
| Entire organisation | Automatically | No |
| Specific users/groups | Automatically | No |
| Available in App Store | User chooses to acquire it | Yes |

Admin-deployed plugins show **Managed by your organisation**.

Users cannot remove them, but they can enable or disable them for their own Cowork conversations from **Sources & Skills**. Microsoft says that preference is saved per device.

### Allow or block

In the Microsoft 365 admin center:

1. Open **Agents > Tools**.
2. Find the plugin.
3. Open the **Users** tab.
4. Choose availability for all users or specific users/groups.
5. Select **Block** when no user should access it.

Country or region-based scoping is not supported for plugin availability. Use security groups to represent those boundaries.

<!-- Screenshot planned: Cowork plugin detail in Microsoft 365 admin center showing user targeting, availability, and Block controls. -->

## Shared Cowork Skills

Cowork lets a user share a Skill or plugin they created:

- **Only you**
- **Specific users in your organisation**

When the creator changes a shared item, they use **Re-share** to update the recipients.

This is not the same as an admin-deployed package:

| Shared by creator | Admin deployed |
|---|---|
| Creator chooses named people | Admin targets users/groups |
| Recipient gets the creator-shared item | Target user gets a managed app |
| Creator re-shares updates | Admin manages package lifecycle |

Audit the real flow in your tenant before treating creator sharing as a formal organisation publishing process.

## Personal PowerPoint and Excel Skills

PowerPoint and Excel publicly document personal, OneDrive-backed custom Skills.

The Skills pages explain:

- user creation;
- OneDrive storage;
- Manage skills;
- enable/disable;
- refresh;
- personal use in PowerPoint.

They do not name:

- the exact admin policy that enables or blocks personal Skill upload;
- a dedicated audit event schema for that upload;
- the DLP or eDiscovery treatment of the personal Office Skills folder;
- a tenant publishing workflow equivalent to Cowork plugins.

> **Admin note**
>
> Do not claim a personal Office Skills control until you can name and test the exact policy. "Available based on your organisation's settings" proves a gate exists; it does not identify the admin surface.

## Connector authentication

An authenticated connector requires each user to complete sign-in or consent.

The admin cannot sign in on behalf of the user.

After sign-in, Cowork remembers the user's authorisation until the user or admin revokes it.

For the pilot, capture:

- requested permissions;
- consent screen;
- token revocation;
- sign-out;
- error behavior when access is removed;
- which environment the connector uses.

Dynamics 365 connectors use Microsoft Entra ID and can prompt a user to select an environment.

## Sideloading is not Store validation

There are three practical paths:

| Path | Use | Microsoft Store validation |
|---|---|---|
| Personal test install | Author testing | No |
| Tenant custom-app upload | Pilot/internal package | No |
| Microsoft 365 App Store | Public or catalog distribution | Yes |

Tenant-distributed packages do not go through Microsoft 365 App Store validation.

Control who can upload custom apps with Teams custom app policies.

For an internal package, your review should cover:

- manifest;
- Skill instructions;
- scripts and companion files;
- connector endpoints;
- auth configuration;
- requested permissions;
- destructive tool behavior;
- privacy and terms URLs;
- owner and support contact.

## Agent Registry is for agents

Agents are broader than Skills.

Microsoft 365 users can find allowed agents in the Agent Store. Organisation publishing goes through submission and admin approval in the Agent Registry.

Admin-managed agent types include:

- published by your organisation;
- shared by a creator;
- Microsoft agents;
- partner agents;
- Frontier agents.

Researcher and Analyst are part of the core Copilot Chat experience and do not fall under the same agent-related settings.

Do not use an Agent Registry screenshot to imply it is the personal `SKILL.md` inventory.

## Agent Tools and MCP governance

Agent Tools provides a registry of tools and MCP servers.

Open:

```text
Microsoft 365 admin center
└── Agents
    └── Tools
        ├── Registry
        └── Requests
```

The registry supports:

- **Block**
- **Unblock**
- status filters;
- publisher filters;
- tool inventory.

<!-- Screenshot planned: Microsoft 365 admin center Agents > Tools > Registry showing available and blocked MCP servers. -->

*Official UI reference: [Microsoft Learn — Agent Tools registry](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-tools-for-agent?view=o365-worldwide&preserve-view=true).*

### BYO MCP is Preview

The Bring Your Own MCP flow is currently Preview.

The public flow:

1. Developer registers a remote MCP server through Agent 365 CLI.
2. Admin reviews the request.
3. Admin grants required permissions.
4. Supported clients can use the approved server.
5. Security teams monitor tool activity.

<!-- Screenshot planned: Microsoft 365 admin center Agents > Tools > Requests showing a safe Contoso MCP request awaiting review. -->

Public Preview caveats include:

- supported client list is limited;
- Azure AI Foundry and Microsoft 365 Declarative Agents are not supported in the documented flow;
- republishing a new server version is not supported;
- deleting a BYO MCP server is not currently supported.

Recheck every Preview limitation before relying on this list. Preview capabilities can change quickly.

## Purview support for Cowork

Cowork has its own public Purview support matrix because long-running, multi-step work does not map perfectly to every Microsoft 365 Copilot control.

### Supported for Cowork AI interactions

| Purview capability | Status |
|---|---|
| DSPM and DSPM for AI (classic) | Supported |
| Auditing | Supported |
| Sensitivity labels | Supported |
| Encryption without sensitivity labels | Supported |
| Insider Risk Management | Supported |
| Communication Compliance | Supported |
| eDiscovery | Supported |
| Data Lifecycle Management | Supported |

### Not supported in the current matrix

| Purview capability | Status |
|---|---|
| Data classification | Not supported |
| Data loss prevention | Not supported |
| Compliance Manager | Not supported |

This is the line to keep precise:

{{< hi >}}Purview supports several Cowork controls, but the current public matrix does not list DLP as supported for Cowork AI interactions.{{< /hi >}}

Do not shorten that to "Cowork inherits DLP."

## Sensitivity labels and encryption

Cowork honors existing access controls.

When a sensitivity label applies encryption, the user needs:

- **VIEW**
- **EXTRACT**

Cowork displays the highest-priority sensitivity label from the data used for a response.

Label inheritance is supported for newly created content in:

- Word;
- PowerPoint;
- Outlook.

If several labelled sources are used, the highest-priority label is applied.

Users can override an inherited label unless mandatory labelling prevents it.

<!-- Screenshot planned: Cowork response or created document showing a safe sensitivity label with no customer content. -->

## Auditing

Purview audit events can include:

- starting a Cowork conversation;
- adding, removing, or sharing a Skill or plugin;
- running a scheduled prompt;
- starting a browser task;
- uploading a file;
- creating an artifact in OneDrive.

Audit Standard provides Copilot activity records without an extra Audit Premium requirement for the basic log.

<!-- Screenshot planned: Purview Audit search showing safe Cowork or Skill/plugin activity records. -->

## eDiscovery and retention

eDiscovery can include:

- Cowork conversation transcripts;
- files Cowork created;
- scheduled prompts;
- uploaded files retained in OneDrive or the conversation.

Prompts and responses are stored in the user's mailbox and can be queried as Copilot activity.

For retention policies, select **Microsoft Copilot Experiences**.

Retention labels can also cover referenced cloud attachments and links shared through Copilot.

<!-- Screenshot planned: Purview retention-label flow showing cloud attachments and links shared in Exchange, Teams, Viva Engage, and Copilot. -->

*Official UI reference: [Microsoft Learn — Purview for Copilot Cowork](https://learn.microsoft.com/en-us/purview/ai-copilot-cowork).*

## DSPM, Insider Risk, and Communication Compliance

### DSPM

Cowork interactions appear in Activity Explorer under AI activities.

The current docs say they do not appear in:

- the Apps and agents dashboard;
- the AI observability page.

### Insider Risk Management

The Risky AI usage template can detect signals such as:

- prompt-injection behavior;
- access to protected material.

### Communication Compliance

Communication Compliance can evaluate prompts and responses while preserving role-based access and pseudonymisation.

## The DLP nuance

The Purview Cowork matrix marks DLP unsupported for Cowork AI interactions.

Cowork browser tasks are different. They run through Edge on the user's device and inherit the organisation's Conditional Access, DLP, and tenant browsing policies for Edge and browser use.

That does not change the AI-interaction matrix.

| Layer | DLP wording |
|---|---|
| Cowork AI interaction | Current Purview matrix: not supported |
| Local Edge browser task | Inherits existing browser/device policies |

## Information Barriers

Microsoft says Information Barriers are not currently supported for Cowork plugin or Skill management and sharing.

In an IB-enabled tenant:

- embedded knowledge-file uploads are blocked at tenant level;
- affected plugins and Skills cannot be uploaded or published.

This is a time-bound limitation. Recheck it before the pilot.

## Pilot checklist

### Access and scope

- [ ] Enable usage-based billing for the pilot
- [ ] Decide whether Cowork is discoverable
- [ ] Assign required licences
- [ ] Use a small security group
- [ ] Name a business owner and technical owner

### Roles

- [ ] Use Copilot administrator for plugin management where appropriate
- [ ] Use AI Administrator for MCP approval where possible
- [ ] Avoid routine Global Administrator use

### Package review

- [ ] Review every Skill instruction
- [ ] Review scripts and companion files
- [ ] Review connector endpoints and permissions
- [ ] Check MCP safety annotations
- [ ] Test destructive-action confirmation
- [ ] Verify privacy and terms links

### Purview

- [ ] Confirm sensitivity-label behavior
- [ ] Confirm audit events
- [ ] Test eDiscovery query
- [ ] Configure retention for Microsoft Copilot Experiences
- [ ] Review Insider Risk and Communication Compliance
- [ ] Record DLP, data-classification, and Compliance Manager gaps
- [ ] Check Information Barriers status

### User test

- [ ] Test connector sign-in and revocation
- [ ] Test admin block
- [ ] Test per-conversation disable
- [ ] Test plugin removal from a new session
- [ ] Record expected and unexpected data access

## Continue the Copilot Skills series

- **[Microsoft 365 Copilot Skills, explained](/blog/microsoft-365-copilot-skills-explained/)** — the hub.
- **[Skills in PowerPoint](/blog/microsoft-365-copilot-skills-powerpoint/)** — personal picker, upload, and management.
- **[Skills in Excel](/blog/microsoft-365-copilot-skills-excel/)** — end-user Skills and Office.js Preview.
- **[Skills in Word](/blog/microsoft-365-copilot-skills-word/)** — the honest current state.
- **[Cowork Skill packaging and distribution](/blog/microsoft-365-copilot-skills-cowork-packaging-distribution/)** — package, connect, test, publish.
- **[Write your first SKILL.md](/blog/write-your-first-skill-md-microsoft-365-copilot/)** — the authoring walkthrough.

## Official public sources

- [Microsoft Learn — manage Cowork plugins](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-manage-plugins)
- [Microsoft Learn — manage Copilot Cowork for your organisation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-admin-governance)
- [Microsoft Learn — Purview support for Copilot Cowork](https://learn.microsoft.com/en-us/purview/ai-copilot-cowork)
- [Microsoft Learn — manage agents in Microsoft 365 admin center](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-copilot-agents-integrated-apps?view=o365-worldwide)
- [Microsoft Learn — manage Agent Tools and MCP servers](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-tools-for-agent?view=o365-worldwide&preserve-view=true)
- [Microsoft Learn — build Cowork plugins](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development)
- [Microsoft Learn — Customize Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-customize)
- [Microsoft Support — PowerPoint Skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills)
- [Microsoft Support — Excel Skills](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-skills)
