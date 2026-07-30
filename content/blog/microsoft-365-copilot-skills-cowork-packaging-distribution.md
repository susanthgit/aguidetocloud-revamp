---
title: "Package and Publish Copilot Cowork Skills"
list_title: "Cowork Skills — Package, Connect, Publish"
description: "Package SKILL.md workflows and remote MCP connectors for Copilot Cowork, convert Claude plugins, validate the ZIP, test, and publish safely."
date: 2026-07-31
lastmod: 2026-07-31
draft: false
card_tag: "Copilot Skills"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-skills-cowork-packaging-distribution.jpg"]
og_headline: "Package Cowork Skills"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - cowork
  - skills
  - plugins
  - mcp
hub_id: "copilot-skills"
layout: "notebook"
stamp: "developer guide"
intro_note: "↗ a SKILL.md becomes a Cowork plugin when you package it for testing, governance, and distribution"
sitemap:
  priority: 0.8
founder_note: |
  Start with a Skills-only package. Get the instructions, naming, ZIP structure, and install loop working before you add a connector.

  A remote MCP server changes the risk, not just the manifest. Now you have authentication, user consent, external data, tool safety annotations, uptime, and admin review to think about. Earn that complexity one layer at a time.
---

<div class="living-doc-banner">

**Living developer guide.** Microsoft's public Cowork examples currently span Unified Manifest v1.28 and `devPreview`. This guide uses a safe Skills-only v1.28 starting point and marks MCP schema details for live validation. **Public sources last checked: 31 July 2026.**

</div>

*This is part of the [Microsoft 365 Copilot Skills series](/blog/microsoft-365-copilot-skills-explained/). For the end-user Skills page and built-in Cowork Skills, use the existing [Cowork Skills and plugins guide](/blog/microsoft-copilot-cowork-skills-and-plugins/). This spoke focuses on developer packaging and distribution.*

**A Cowork plugin is a Microsoft 365 app package that can contain Skills, connectors, or both.** The ZIP gives your reusable instructions a package identity, icons, validation rules, a test path, and an admin deployment path.

## The short version

- A **Skill** teaches Cowork how to perform a repeatable task.
- A **connector** gives Cowork live access to an external service, usually through remote MCP.
- Both live in a Microsoft 365 app package.
- Start with a Skills-only package.
- Put `manifest.json`, `color.png`, `outline.png`, and `skills/` at the ZIP root.
- Use a separate folder and `SKILL.md` for each Skill.
- A package can contain up to 20 Skills and 10 connectors.
- Test personally before tenant deployment.
- Tenant-uploaded packages do not go through Microsoft 365 App Store validation.
- Public distribution uses Partner Center and the Microsoft 365 App Store.
- Validate the current manifest schema instead of copying an old MCP example.

{{< margin >}}A Skill is the recipe. A connector is the doorway to another system. The plugin is the box that ships them.{{< /margin >}}

## What a Cowork plugin contains

The smallest useful Skills package looks like this:

```text
contoso-reporting.zip
├── manifest.json
├── color.png
├── outline.png
└── skills/
    └── weekly-status-report/
        └── SKILL.md
```

For a larger Skill:

```text
contoso-reporting.zip
├── manifest.json
├── color.png
├── outline.png
└── skills/
    └── weekly-status-report/
        ├── SKILL.md
        ├── references/
        │   └── reporting-rules.md
        └── scripts/
            └── validate-input.py
```

<!-- Screenshot planned: VS Code showing a Cowork Skills-only package with manifest.json, two icons, Skills folder, SKILL.md, references, and scripts. -->

The ZIP contents go at the root. Do not zip a parent folder and leave `manifest.json` one level too deep.

## Skills, connectors, and the three package patterns

| Package | Contains | Use it when |
|---|---|---|
| **Skills only** | `agentSkills` and Skill folders | The workflow can use Cowork's existing capabilities |
| **Skills + connector** | `agentSkills` plus `agentConnectors` | The workflow also needs a live external API or system |
| **Connector only** | `agentConnectors` | Cowork's existing Skills can already use the external tools |

### Skills

A Skill is a folder containing `SKILL.md`.

```markdown
---
name: weekly-status-report
description: >
  Creates a weekly project status report from the sources provided by
  the user. Use when asked for a weekly update, Friday report, project
  status, or leadership summary.
---

# Weekly status report

1. Gather the named sources.
2. Separate confirmed progress from open questions.
3. List risks, decisions, and next actions.
4. Do not invent an owner or due date.
```

The folder and `name` must match:

```text
skills/weekly-status-report/SKILL.md
name: weekly-status-report
```

### Connectors

A connector links Cowork to live tools or data outside Microsoft 365.

For Cowork, Microsoft documents remote MCP connectors using:

- Streamable HTTP over HTTPS;
- TLS 1.2 or later;
- JSON-RPC 2.0;
- `initialize`;
- `notifications/initialized`;
- `tools/list`;
- `tools/call`.

Microsoft recommends:

- 99.9% availability for a store-published app;
- tool responses in under 30 seconds;
- clear tool and parameter descriptions;
- structured output.

## Build a Skills-only manifest first

Microsoft's Cowork build guide shows a Unified Manifest v1.28 pattern for a Skills-only package:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/v1.28/MicrosoftTeams.schema.json",
  "manifestVersion": "1.28",
  "version": "1.0.0",
  "id": "11111111-1111-1111-1111-111111111111",
  "developer": {
    "name": "Contoso",
    "websiteUrl": "https://contoso.example",
    "privacyUrl": "https://contoso.example/privacy",
    "termsOfUseUrl": "https://contoso.example/terms"
  },
  "name": {
    "short": "Contoso Skills",
    "full": "Contoso Skills for Copilot Cowork"
  },
  "description": {
    "short": "Repeatable reporting workflows.",
    "full": "Skills that help Contoso teams create consistent project reports."
  },
  "icons": {
    "color": "color.png",
    "outline": "outline.png"
  },
  "accentColor": "#2B579A",
  "agentSkills": [
    {
      "folder": "./skills/weekly-status-report"
    }
  ]
}
```

Keep these limits in mind:

| Field | Public constraint |
|---|---|
| `id` | Stable GUID |
| `name.short` | Up to 30 characters |
| `name.full` | Up to 100 characters |
| `description.short` | Up to 80 characters |
| `description.full` | Up to 4,000 characters |
| `color.png` | 192 × 192 PNG |
| `outline.png` | 32 × 32 PNG |
| `agentSkills[].folder` | Required; up to 256 characters |

Use placeholder GUIDs and Contoso URLs in screenshots. Never show a real tenant secret, auth configuration ID, or customer endpoint.

## The manifest-version drift

Microsoft's current public material does not show one perfectly aligned MCP example.

| Source | Example |
|---|---|
| Cowork build guide | `manifestVersion: "1.28"` |
| Cowork admin guide | `devPreview` MCP example |
| Claude conversion script | Emits `devPreview` |

For remote MCP connectors, the current Cowork build guide requires `mcpToolDescription`:

- the manifest points to a packaged tool-description JSON file;
- that file must exist in the ZIP;
- Cowork can still call `tools/list` at runtime for discovery.

> **Things to know**
>
> Validate MCP packages against the current schema and live tenant upload. The build guide uses v1.28, while other Microsoft examples and the conversion script still show `devPreview`.

Safe wording for a customer or developer:

> Cowork plugins use the Microsoft 365 app package format. Start from the current Cowork build guide, then validate MCP connector fields with Agents Toolkit and a test-tenant upload before calling the package production-ready.

## Add a remote MCP connector

The connector lives in `agentConnectors`.

A simplified shape is:

```json
{
  "agentConnectors": [
    {
      "id": "contoso-reporting",
      "displayName": "Contoso Reporting",
      "description": "Reads approved reporting data from Contoso.",
      "toolSource": {
        "remoteMcpServer": {
          "mcpServerUrl": "https://api.contoso.example/mcp",
          "mcpToolDescription": {
            "file": "./tools/contoso-reporting-tools.json"
          },
          "authorization": {
            "type": "OAuthPluginVault",
            "referenceId": "AUTH-CONFIG-ID"
          }
        }
      }
    }
  ]
}
```

Package the referenced file at:

```text
tools/contoso-reporting-tools.json
```

Treat the example as a current starting shape, then validate the exact schema and auth configuration in your tenant.

### Design the tools for an agent

Bad tool name:

```text
getData
```

Better:

```text
get_project_status
```

Each parameter needs a useful description because the agent reads the schema to decide what to send.

For a small API, one tool per action can work:

- `search_projects`
- `get_project_status`
- `list_project_risks`

For a large API, use a discovery pattern:

- `search_actions`
- `execute_action`

## Use MCP annotations for safety

Cowork reads standard MCP tool annotations.

```json
{
  "name": "delete_project",
  "description": "Deletes a project after confirmation.",
  "annotations": {
    "title": "Delete project",
    "destructiveHint": true
  },
  "inputSchema": {}
}
```

The public rules are:

- `readOnlyHint: false` requires confirmation;
- `destructiveHint: true` requires confirmation;
- tools without safety annotations are treated as destructive;
- `title` provides the human-readable action label.

For non-Microsoft MCP servers, Microsoft says annotation-driven confirmation is rolling out progressively. Add the hints now, but verify the confirmation experience in your tenant.

<!-- Screenshot planned: Cowork confirmation card for a safe demo MCP tool showing a human-readable title and action approval. -->

For a read-only tool:

```json
{
  "name": "search_projects",
  "annotations": {
    "title": "Search projects",
    "readOnlyHint": true
  }
}
```

## Authentication

Microsoft's Cowork and plugin schema examples include:

| Type | Use |
|---|---|
| `None` | Public or anonymous service |
| `OAuthPluginVault` | OAuth-based service |
| `ApiKeyPluginVault` | Shown in Cowork-specific examples; support for MCP plugins needs tenant validation |

For authenticated configurations, the manifest stores a `referenceId` for the registered auth configuration or OAuth client. The credential itself lives in Microsoft's Enterprise Token Store rather than in `manifest.json` or `SKILL.md`.

An admin cannot complete connector sign-in for users. Each user completes the sign-in or consent flow the first time the connector is used.

### Dynamic Client Registration

If the MCP server supports Dynamic Client Registration, Cowork can create a client through the server's discovery and registration endpoints.

Microsoft documents requirements including:

- protected-resource metadata;
- authorisation-server metadata;
- RFC 7591 client registration;
- a client secret;
- PKCE enabled by default.

With DCR, the authorisation block can be omitted, but the package still needs `mcpToolDescription`.

`ApiKeyPluginVault` support is not described consistently across every public Cowork/auth page. Test the actual connector and do not infer support from one schema example.

## Package limits

Packaged Cowork plugin limits:

| Limit | Value |
|---|---:|
| Skills per package | 20 |
| Connectors per package | 10 |
| Companion files per Skill | 20 |
| Size per companion file | 5 MB |
| Total companion size per Skill | 10 MB |
| Companion download timeout | 15 seconds |
| Skill folder path | 256 characters |

Personal Cowork Skill upload has a different set:

| Personal upload | Value |
|---|---:|
| Single `.md` Skill | 1 MB |
| Archive compressed | 10 MB |
| Archive uncompressed | 50 MB |
| Files in archive | 100 |

Do not mix the two tables. A personal upload archive accepting 100 files does not mean a packaged Skill can have 100 companion files.

## Convert a Claude plugin

Microsoft publishes `Convert-ClaudePluginToMOS3.ps1`.

The short documentation example omits parameters the current script requires. A safer command is:

```powershell
.\Convert-ClaudePluginToMOS3.ps1 `
  -PluginPath .\my-claude-plugin `
  -OutputPath .\output `
  -PrivacyUrl https://contoso.example/privacy `
  -TermsOfUseUrl https://contoso.example/terms `
  -DetailedOutput
```

The script also needs a website URL. It can resolve that from:

1. `-WebsiteUrl`;
2. `plugin.json` `homepage`;
3. `author.url`.

If none exists, it stops.

### What the script reads

- `.claude-plugin/plugin.json`
- optional `.mcp.json`
- `skills/*/SKILL.md`
- optional `color.png`
- optional `outline.png`

### What it produces

- a deterministic app GUID unless you provide one;
- a `devPreview` Microsoft 365 manifest;
- `agentSkills` entries for valid Skill folders;
- `agentConnectors` for URL-based MCP servers;
- generated placeholder icons when icons are missing;
- a ZIP named from the plugin and version.

### What does not carry over

| Claude plugin item | Cowork conversion state |
|---|---|
| `skills/` | Copied and referenced |
| remote URL MCP servers | Converted to connectors |
| stdio/local MCP servers | Skipped |
| `commands/` | Copied by the current script, but not represented as a supported manifest capability |
| `agents/` | Not supported |
| `hooks/` | Not supported |
| `settings.json` | Not applicable |
| `bin/` | Not applicable |

The `commands/` detail matters. The docs say slash commands are not supported; the script still copies the folder. Treat those files as inert package content unless the validator says otherwise.

For a converted connector, also add and reference the required `mcpToolDescription` file. The current conversion script does not generate that field.

> **Things to know**
>
> The conversion script is a starting point, not a store-readiness certificate. Replace placeholder auth references, verify privacy/terms fields, check the manifest version, and validate every connector.

## Validate the package

Cowork publishes named validation rules.

### Manifest-level

| Code | Check |
|---|---|
| `ASKILL-M001` | Every `agentSkills` entry has `folder` |
| `ASKILL-M002` | No more than 20 Skills |
| `ASKILL-M003` | Folder path is no more than 256 characters |

### Package-level

| Code | Check |
|---|---|
| `ASKILL-P001` | Referenced folder exists |
| `ASKILL-P002` | Folder contains `SKILL.md` |
| `ASKILL-P003` | YAML frontmatter is valid |
| `ASKILL-P004` | `name` exists |
| `ASKILL-P005` | `description` exists |
| `ASKILL-P006` | `name` matches the folder |
| `ASKILL-P007` | `name` uses kebab-case |
| `ASKILL-P008` | Folder entries are not duplicated |

Connector checks include:

- required, unique `id`;
- required `displayName`;
- one valid tool source;
- HTTPS MCP URL;
- `mcpToolDescription` present with a file that exists in the ZIP;
- `referenceId` present for authenticated vault types;
- no `referenceId` for `None`.

## Test personally

Two public paths:

### Cowork UI

1. Open **Customize**.
2. Select **Plugins**.
3. Select **Upload plugin**.
4. Choose the ZIP.
5. Keep sharing set to **Only you**.
6. Start a new Cowork conversation.
7. Check which Skill or connector activates.

<!-- Screenshot planned: Cowork Customize Plugins tab with Upload plugin and a safe Contoso test plugin visible. -->

*Official UI reference: [Microsoft Learn — Customize Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-customize).*

### Agents Toolkit CLI

```powershell
npm install -g @microsoft/m365agentstoolkit-cli
atk auth login
atk install --file-path "C:\packages\contoso-reporting.zip" --scope Personal
```

<!-- Screenshot planned: Terminal showing a successful Agents Toolkit personal install with dummy AppId and TitleId. -->

Use a test account and test tenant. Do not show real auth IDs in a public screenshot.

## Deploy inside the organisation

Admins can upload a custom app package and target:

- specific users;
- security groups;
- the whole organisation.

Tenant-distributed packages do **not** go through Microsoft 365 App Store validation. That makes this path useful for:

- development;
- pilot testing;
- internal-only plugins.

It also means your organisation owns the review.

Control custom-app upload rights with the existing Teams custom app policies.

<!-- Screenshot planned: Microsoft 365 admin center showing a safe plugin detail with Installed for, availability, and Block controls. -->

## Publish publicly

Public distribution uses Partner Center and the Microsoft 365 App Store.

Store validation covers:

- manifest integrity;
- Skill and connector validation;
- Microsoft 365 app security requirements;
- marketplace certification;
- Copilot/Cowork experience evidence.

<!-- Screenshot planned: Partner Center Microsoft 365 and Copilot submission page for a safe draft app. -->

Check whether Partner Center accepts the manifest version used by the current test package before promising a public route for a `devPreview` connector.

## Information Barriers caveat

Microsoft says Information Barriers are not currently supported for Cowork plugin or Skill management and sharing.

In an IB-enabled tenant, embedded knowledge-file uploads are blocked at the tenant level. That prevents affected plugins and Skills from being uploaded or published.

Recheck this time-bound limitation before every rollout.

## Shipping checklist

- [ ] ZIP has `manifest.json` and icons at root
- [ ] Every Skill folder contains `SKILL.md`
- [ ] Folder and `name` match
- [ ] Descriptions contain real trigger phrases
- [ ] No secrets in files
- [ ] Auth `referenceId` points to a real configuration
- [ ] MCP URL uses HTTPS
- [ ] MCP tools have safety annotations
- [ ] Destructive tools require confirmation
- [ ] Privacy and terms URLs work
- [ ] Package validates
- [ ] Personal test passes
- [ ] Admin pilot uses a small group
- [ ] Store submission uses the current schema

## Continue the Copilot Skills series

- **[Microsoft 365 Copilot Skills, explained](/blog/microsoft-365-copilot-skills-explained/)** — the hub.
- **[Skills in PowerPoint](/blog/microsoft-365-copilot-skills-powerpoint/)** — picker, upload, and management.
- **[Skills in Excel](/blog/microsoft-365-copilot-skills-excel/)** — end-user Skills and Office.js Preview.
- **[Skills in Word](/blog/microsoft-365-copilot-skills-word/)** — the honest current state.
- **[Write your first SKILL.md](/blog/write-your-first-skill-md-microsoft-365-copilot/)** — the authoring walkthrough.
- **[Admin and governance for Copilot Skills](/blog/microsoft-365-copilot-skills-admin-governance/)** — controls, permissions, Purview, and pilot decisions.

## Official public sources

- [Microsoft Learn — build plugins for Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development)
- [Microsoft Learn — manage Cowork plugins](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-manage-plugins)
- [Microsoft Learn — use Cowork plugins](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugins)
- [Microsoft Learn — Customize Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-customize)
- [Microsoft Learn — publish agents and apps for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/publish)
- [Microsoft Learn — plugin authentication](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication)
- [Microsoft Learn — Agent Skills schema](https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/root-agent-skills?view=m365-app-1.28&preserve-view=true)
- [Microsoft conversion script — Convert-ClaudePluginToMOS3.ps1](https://download.microsoft.com/download/20e5d05b-0bfd-419b-bdde-06c14b8fcf5b/Convert-ClaudePluginToMOS3.ps1)
- [Agent Skills specification](https://agentskills.io/specification)
