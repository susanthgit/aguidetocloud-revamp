---
title: "How to Use Copilot Skills in Excel"
list_title: "Skills in Excel — User Guide + Developer Preview"
description: "Use built-in and custom Copilot Skills in Excel, then understand the separate Office.js developer preview without mixing the two experiences."
date: 2026-07-31
lastmod: 2026-07-31
draft: false
card_tag: "Copilot Skills"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-skills-excel.jpg"]
og_headline: "Excel Copilot Skills"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - skills
  - excel
  - office-js
hub_id: "copilot-skills"
layout: "notebook"
stamp: "user + developer guide"
intro_note: "↗ Excel has two Skills stories — the one you can use, and the developer preview you should label carefully"
sitemap:
  priority: 0.8
founder_note: |
  Excel Skills make the most sense when the method matters as much as the answer. A variance review, a model update, or a formatting pass should follow the same checks every time.

  Keep the first Skill small. Make the output visible in the workbook. Then test it against a clean workbook, a messy workbook, and a workbook that is missing something important. That is where the useful guardrails come from.
---

<div class="living-doc-banner">

**Living walkthrough.** Microsoft documents an end-user Skills experience in Excel and a separate Office.js custom-Skills developer preview. They are not the same release. Public sources last checked: 31 July 2026.

</div>

*This is part of the [Microsoft 365 Copilot Skills series](/blog/microsoft-365-copilot-skills-explained/). Start with the hub if you need the difference between a Skill, prompt, plugin, connector, and agent.*

**Copilot Skills in Excel let you save a repeatable workbook method and call it again with an `@` mention.** Microsoft also has a developer preview that lets a packaged Skill run Office.js code inside Excel.

The names are almost identical. The status is not:

| Experience | What it is | Public status |
|---|---|---|
| **End-user Excel Skills** | Built-in and OneDrive-backed `SKILL.md` instructions you use from Copilot in Excel | Pre-built Skills are GA. Personal custom Skills are documented on the current support page; the 25 June announcement said they were rolling to GA across web, Windows, and Mac in July 2026 |
| **Office.js custom Skills** | Packaged developer extensions with JavaScript that can read and change the workbook | **Preview — Microsoft says not to use them in production** |

<!-- Screenshot planned: Excel Copilot prompt box invoking a safe custom Skill with an @ mention while Manage Skills is visible behind it. -->

*Official UI reference: [Microsoft Support — Copilot in Excel Skills](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-skills).*

## The short version

- Open Copilot in Excel.
- Select **Add work content**.
- Select **All Skills**.
- Pick a Skill, or invoke one directly with `@skill-name`.
- Use **Settings > Manage skills** to control automatic Skill selection.
- Create personal custom Skills in the OneDrive Skills folder.
- Put each Skill in its own folder with a matching `SKILL.md`.
- Microsoft-managed Skills include `@brandkit` and `@theme-design`.
- Keep the Office.js path clearly labelled **Preview**.
- Do not use Office.js custom Skills in production yet.

{{< margin >}}End-user Skills save the instructions. Office.js Skills can also run code against the workbook. That extra power is why the developer path has a separate preview label.{{< /margin >}}

## Find and use Skills in Excel

The end-user flow starts from the Copilot prompt box:

1. Open the workbook you want to work on.
2. Open Copilot in Excel.
3. Select the Add work content menu in the prompt field.
4. Select All Skills.
5. Choose the Skill you want.
6. Add any workbook-specific detail and send the request.

The All Skills list can include:

- Skills provided by Copilot in Excel; and
- personal custom Skills from your OneDrive Skills folder.

<!-- Screenshot planned: Excel Add work content menu open with All Skills highlighted. -->

*Official UI reference: [Microsoft Support — use Skills in Excel](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-skills#use-skills).*

### Invoke a Skill with an @mention

You can skip the picker and call a Skill directly:

```text
@theme-design

Apply an Excel theme across this workbook.
Keep the existing formulas, values, sheet names, and table structure.
```

Microsoft's public examples also use names such as:

- `@brandkit`
- `@portfolio-monitoring`
- `@variance-analysis`
- `@model-update`
- `@comps-analysis`

Availability differs. `brandkit` and `theme-design` are Microsoft-managed Skills. Finance examples can come from sample, custom, or future partner Skills, so do not promise that every tenant has every name.

## Manage Skills

To control which Skills Copilot can select automatically:

1. Open the **Settings** menu in the upper-right corner of the Copilot pane.
2. Select **Manage skills**.
3. Open the relevant folder.
4. Turn Skills on or off.

<!-- Screenshot planned: Excel Manage Skills dialog showing Custom skills and Finance folders with their toggles. -->

*Official UI reference: [Microsoft Support — manage Excel Skills](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-skills#manage-skills).*

Excel has one useful difference to remember:

> Turning a Skill off stops Copilot from selecting it automatically, but you can still invoke the disabled Skill directly with its `@` mention.

That gives you two levels of control:

- **enabled** — Copilot can choose it when relevant;
- **disabled** — it stays out of automatic selection, but you can still call it explicitly.

## Microsoft-managed Excel Skills

Microsoft publicly documents many built-in Skills and names two Microsoft-managed formatting Skills.

### brandkit

Use `@brandkit` to apply organisation-approved brand guidance across a workbook.

It can style:

- colour palettes;
- typography;
- chart and table appearance;
- headers;
- logos, when an official Brand Kit is available.

The Skill is enabled by default and appears in the **Formatting** folder in Manage skills.

> **Things to know**
>
> `@brandkit` can reference a Brand Kit created by your organisation's brand manager. Check what Brand Kit your organisation has configured before expecting a branded result.

### theme-design

Use `@theme-design` to apply an Excel theme using design guidance from the Excel team.

It can work across:

- charts;
- tables;
- cells;
- borders;
- colour hierarchy;
- colour contrast.

The Skill is automatically enabled and also appears under Formatting.

<!-- Screenshot planned: Excel Manage Skills Formatting folder showing brandkit and theme-design enabled. -->

*Official source: [Microsoft Support — Microsoft-managed Skills in Excel](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-microsoft-skills).*

## Create a personal custom Skill

The Excel support page documents a OneDrive-backed flow:

1. In Copilot, open Settings.
2. Select Manage skills.
3. Select **Custom skills**.
4. Select **Create OneDrive folder**.
5. Select **Open skills folder**.
6. Add one folder per Skill.
7. Put `SKILL.md` inside the folder.
8. Return to Excel and select **Refresh**.

<!-- Screenshot planned: Excel Custom skills pane showing Open skills folder and Refresh. -->

*Official UI reference: [Microsoft Support — create custom Excel Skills](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-skills#create-custom-skills).*

The folder name and the `name` field must match:

```text
format-variance-table/
└── SKILL.md
```

```markdown
---
name: format-variance-table
description: >
  Formats an existing variance table in Excel. Use when the user asks
  to highlight favourable and unfavourable variances or prepare a
  variance table for review.
---

# Format a variance table

1. Use the existing table and labels.
2. Preserve formulas and source values.
3. Apply one consistent number format.
4. Make favourable and unfavourable variances easy to distinguish.
5. Do not invent a target, owner, or explanation that is not in the workbook.
```

This is an instruction-only Skill. It uses the capabilities Copilot in Excel already has.

<!-- Screenshot planned: OneDrive Skills folder containing format-variance-table and its SKILL.md open with name and description visible. -->

## Availability

Microsoft's 25 June 2026 Excel announcement gives the clearest public status split:

| Capability | Public status in that announcement |
|---|---|
| Pre-built Skills | Generally available for Microsoft 365 Copilot customers across Excel for web, Windows, and Mac |
| Personal custom Skills | On 25 June: available to Insiders on Windows and Mac, rolling to GA across Excel for web, Windows, and Mac in July 2026. The current support page documents the OneDrive custom-Skills flow without a preview banner |
| Partner-built Skills | Coming in Q3 2026 |

The current Excel support page documents personal custom Skills without a preview banner.

Confirm that custom Skills are present on Excel for web, Windows, and Mac in your tenant. The public Skills sources do not confirm iPad support or provide a Skills-specific SKU table.

## The separate Office.js developer preview

Now the second story.

Microsoft also lets developers create a packaged Excel Skill with JavaScript in a `scripts/` folder. That script can use Office.js to read or change the workbook.

Microsoft's warning is direct:

> Custom Skills for Excel are in preview. Do not use them in a production Skill.

The developer path is for testing and learning today.

### What the package contains

A preview package can look like this:

```text
excel-skill-package/
├── manifest.json
├── color.png
├── outline.png
└── skills/
    └── find-accelerating-growth/
        ├── SKILL.md
        ├── resources/
        │   ├── workbook-data-guardrails.md
        │   └── excel-vs-agent-execution.md
        └── scripts/
            └── find-accelerating-growth.js
```

<!-- Screenshot planned: Code editor showing the Office.js Excel Skill package with manifest, SKILL.md, resources, and scripts. -->

### Excel-specific SKILL.md guidance

Microsoft's developer overview recommends:

1. Add `excel` to `metadata.tags`.
2. Use a **Workbook output** section instead of a generic output section.
3. Add a **Common pitfalls to avoid** section.
4. Explain when the Skill should run inside Excel.
5. Explain what to do when the Skill is invoked outside Excel.
6. Point to the exact script by its relative path.

```yaml
---
name: find-accelerating-growth
description: >
  Finds rows in an Excel table whose values rise with increasingly
  larger increases. Use when the user asks for accelerating growth.
metadata:
  version: 1.0.0
  tags: excel, office-js, tables, trends
---
```

### Office.js script rules

The preview guidance says:

- put JavaScript files in `scripts/`;
- make each script run to completion without more user or agent input;
- typically use one asynchronous `Excel.run(...)` block;
- do not call `Office.onReady`;
- do not define `Office.initialize`;
- let Copilot create and initialise the Office.js runtime.

```javascript
await Excel.run(async (context) => {
  const worksheet = context.workbook.worksheets.getActiveWorksheet()
  worksheet.load('name')
  await context.sync()

  return `Active worksheet: ${worksheet.name}`
})
```

The preview does not support passing parameters into the functions that call Office.js. The workbook itself supplies the input.

### Manifest and runtime caveats

Microsoft says the Skill does not need an `"extensions"` section merely to start Office.js. Copilot in Excel creates the runtime and executes the packaged script.

That also means there is no `"extensions.requirements.capabilities"` key to restrict the Skill to an Excel requirement set. Microsoft says the effect of calling an unsupported API is undefined.

If the same package also contains an Office Add-in or Teams app, the Skill cannot share its packaged Office.js file directly with the hosted app. You must duplicate code that both surfaces need.

The current Excel tutorial and Cowork packaging examples show different manifest versions. Use the latest schema required by the live validator rather than copying a version number from this post.

## Test the developer preview safely

The public tutorial uses Microsoft 365 Agents Toolkit to package and install the app.

The test loop is:

1. Build the package.
2. Install it for your test account.
3. Open the workbook in Excel.
4. Wait for the Skill to appear.
5. Invoke the full `@skill-name`.
6. Check the workbook output and Copilot response.
7. Remove the app after the test session.

Microsoft's uninstall steps use Teams:

1. Open **Apps**.
2. Select **Manage your apps**.
3. Find the package.
4. Select the trash icon.
5. Select **Remove**.

<!-- Screenshot planned: Excel developer-preview Skill invoked with @find-accelerating-growth and its chart output visible in the workbook. -->

## What makes a good Excel Skill?

The best Excel Skills make the workbook result easy to inspect.

| Better | Too broad |
|---|---|
| Format this variance table without changing formulas | Make this workbook professional |
| Create a dashboard sheet from the named table | Analyse everything |
| Find rows matching one defined growth pattern | Find interesting trends |
| Apply our approved Brand Kit | Make it look on-brand |
| Rebuild this monthly reporting layout | Fix the model |

Useful guardrails include:

- use the workbook as the source of truth;
- name the sheets, tables, or ranges the Skill may inspect;
- preserve formulas unless the workflow explicitly changes them;
- never invent missing values;
- stop broad searches when the required data is found;
- state what the Skill completed and what still needs user action;
- never claim a workbook update succeeded outside an Excel-capable environment.

## Troubleshooting

| Problem | What to check |
|---|---|
| **All Skills is missing** | Check licence, rollout, app platform, update channel, and organisation settings |
| **A custom Skill is missing** | Select **Refresh** in Custom skills |
| **OneDrive Skill is ignored** | Match the folder name and `name` exactly |
| **Disabled Skill does not run automatically** | Invoke it directly with `@skill-name` |
| **brandkit has little to apply** | Check whether an official Brand Kit exists in the tenant |
| **Office.js script fails** | Confirm the Skill is running inside Excel and remove `Office.onReady` or `Office.initialize` |
| **Preview script needs a parameter** | The preview does not support passing parameters into Office.js functions |
| **Skill claims it changed a workbook outside Excel** | Add explicit Excel-versus-non-Excel execution guidance |

## Admin note

The public Excel Skills page explains the user and OneDrive flow. It does not name the tenant control for enabling or blocking personal Skill uploads, or describe a complete audit/DLP model for that personal path.

Keep these as open checks:

1. the exact admin policy controlling personal Excel Skills;
2. the eDiscovery and retention treatment of the OneDrive Skills folder;
3. partner Skill deployment when marketplace support reaches the tenant;
4. the Office.js preview's exact channel and tenant requirements.

## Continue the Copilot Skills series

- **[Microsoft 365 Copilot Skills, explained](/blog/microsoft-365-copilot-skills-explained/)** — the hub.
- **[Skills in PowerPoint](/blog/microsoft-365-copilot-skills-powerpoint/)** — Choose skills, `@` mention, upload, and management.
- **[Skills in Word](/blog/microsoft-365-copilot-skills-word/)** — what Word has today and what it does not publicly document.
- **[Cowork Skill packaging and distribution](/blog/microsoft-365-copilot-skills-cowork-packaging-distribution/)** — packages, connectors, MCP, validation, and publishing.
- **[Write your first SKILL.md](/blog/write-your-first-skill-md-microsoft-365-copilot/)** — the practical authoring guide.
- **[Admin and governance for Copilot Skills](/blog/microsoft-365-copilot-skills-admin-governance/)** — controls, permissions, Purview, and rollout.

## Official public sources

- [Microsoft Support — use and manage Copilot Skills in Excel](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-skills)
- [Microsoft Support — Microsoft-managed Skills in Excel](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-microsoft-skills)
- [Microsoft 365 Blog — Copilot in Excel for finance](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/25/copilot-in-excel-built-for-the-era-of-frontier-finance/)
- [Microsoft Learn — overview of Office.js Copilot Skills for Excel](https://learn.microsoft.com/en-us/office/dev/add-ins/excel/excel-skills)
- [Microsoft Learn — Office.js Copilot Skill tutorial](https://learn.microsoft.com/en-us/office/dev/add-ins/excel/excel-copilot-skill)
- [Agent Skills specification](https://agentskills.io/specification)
