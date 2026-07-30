---
title: "How to Use Copilot Skills in PowerPoint"
list_title: "Skills in PowerPoint — Step-by-Step"
description: "Choose, invoke, manage, upload, edit, and troubleshoot reusable Copilot Skills in PowerPoint, with the SKILL.md rules that matter."
date: 2026-07-31
lastmod: 2026-07-31
draft: false
card_tag: "Copilot Skills"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-skills-powerpoint.jpg"]
og_headline: "PowerPoint Copilot Skills"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - skills
  - powerpoint
  - skill-md
hub_id: "copilot-skills"
layout: "notebook"
stamp: "walkthrough"
intro_note: "↗ turn the PowerPoint task you keep repeating into a Skill you can call again"
sitemap:
  priority: 0.8
founder_note: |
  Start with one small task you know well. A Skill that reliably creates one useful executive-summary slide is better than a giant "make my deck perfect" Skill that leaves Copilot guessing.

  Write the method, try it on a real presentation, and tighten the places where the result drifts. That small loop is where a saved prompt becomes something your future self can trust.
---

<div class="living-doc-banner">

**Living walkthrough.** Microsoft announced that reusable PowerPoint Skills rolled out in July 2026. The public support page documents the workflow, but it does not provide a complete platform, channel, or licence matrix. **Public sources last checked: 31 July 2026.**

</div>

*This is part of the [Microsoft 365 Copilot Skills series](/blog/microsoft-365-copilot-skills-explained/). Start with the hub if you want the difference between a Skill, prompt, plugin, connector, and agent.*

**PowerPoint Skills let you save a repeatable presentation method and call it again from Copilot.** You can choose a Skill from the prompt box, invoke one with an `@` mention, turn Skills on or off, and add your own custom `SKILL.md`.

That is the useful bit: you stop retyping the same long instruction every time you need a deck reviewed, a summary slide created, or a presentation cleaned up.

<!-- Screenshot planned: PowerPoint Copilot using a custom Skill through an @ mention in the prompt box. -->

*Official UI reference: [Microsoft Support — Copilot in PowerPoint Skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills).*

## The short version

- Open Copilot in PowerPoint.
- Select the **+** menu in the prompt box.
- Select **Choose skills**.
- Pick a Skill, or type its name as an `@` mention.
- Use **Settings > Manage skills** to turn Skills on or off.
- Add a custom Skill by uploading it, pasting it through **Add skill**, or placing its folder in OneDrive.
- Keep the Skill in its own folder with a `SKILL.md` file.
- Make the folder name match the `name` field exactly.
- Uploaded custom Skills are for your personal use.

{{< margin >}}The Skill is the method. Your current presentation is the material it works on.{{< /margin >}}

## Before you start

You need Copilot in PowerPoint to see the Skills experience.

Microsoft's [PowerPoint Skills support page](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills) says Copilot might be missing because:

- it is not included with your Microsoft 365 subscription; or
- your organisation's settings do not make it available.

Microsoft's June 2026 feature update says reusable PowerPoint Skills **rolled out in July 2026**. The support page does not list every supported PowerPoint platform, update channel, or licence combination.

> **Things to know**
>
> If another person can see **Choose skills** and you cannot, do not assume your app is broken. Check your licence, organisation settings, update channel, and rollout state first. The exact availability matrix is not fully documented publicly.

## Choose a Skill in PowerPoint

The quickest route starts in the Copilot prompt box.

1. Open the presentation you want to work on.
2. Open Copilot in PowerPoint.
3. Select the **+** menu in the prompt field.
4. Select **Choose skills**.
5. Pick the Skill you want Copilot to use.
6. Add the rest of your request and send it.

The list can include:

- Skills provided by Copilot in PowerPoint; and
- custom Skills you uploaded.

<!-- Screenshot planned: PowerPoint Copilot plus menu open with Choose skills highlighted. -->

*Official UI reference: [Microsoft Support — choose Skills in PowerPoint](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills#choose-skills).*

### Use an @mention instead

You do not have to open the picker every time.

Type `@` followed by the Skill name in your prompt:

```text
@copyedit-this-presentation

Review this deck for spelling, grammar, repeated wording, and unclear slide titles.
Keep the meaning and tone. Show me the proposed changes before I accept them.
```

Microsoft uses `@copyedit-this-presentation` as its public example. The `@` mention makes your choice explicit: you are telling Copilot which reusable method to apply.

For a one-off task, a normal prompt might be enough. Use a Skill when the method is worth repeating.

## Manage which Skills PowerPoint can use

PowerPoint can also select a relevant enabled Skill automatically.

To control that list:

1. Open the **Settings** menu in the upper-right corner of the Copilot pane.
2. Select **Manage skills**.
3. Turn individual Skills on or off.

<!-- Screenshot planned: PowerPoint Manage skills pane showing Custom skills and built-in presentation Skills with toggles. -->

*Official UI reference: [Microsoft Support — manage PowerPoint Skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills#manage-skills). Capture the full pane so the toggles and Skill names are readable.*

Turning a Skill off has two effects:

- Copilot stops using it automatically.
- The Skill no longer appears in the Skill dropdown.

Turning it off does not mean you have deleted its OneDrive folder. It only removes that Skill from the active PowerPoint experience.

## Add your own custom Skill

Microsoft documents three routes. They all lead to the same basic result: a custom Skill stored in your OneDrive Skills folder.

### Option 1: Upload a Skill from PowerPoint

1. In the Copilot prompt box, select **+**.
2. Select **Choose skills**.
3. Scroll to the end of the list.
4. Select **Manage skills**.
5. Select **Add skill**.
6. Upload or drag and drop the Skill files.

<!-- Screenshot planned: PowerPoint Custom skills pane with Add skill menu open, showing Create manually and Upload skill. -->

<!-- Screenshot planned: PowerPoint Upload skill pane showing the drag-and-drop area and OneDrive Skills folder message. -->

*Official UI reference: [Microsoft Support — upload a PowerPoint Skill](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills#option-1-upload-a-skill-within-copilot-in-powerpoint). Capture both the Add menu and upload panel.*

PowerPoint saves the uploaded Skill to your OneDrive Skills folder. Microsoft says it should then be available from the Skill dropdown.

If it does not appear, open **Manage skills** and select **Refresh**.

> **Things to know**
>
> A custom Skill uploaded this way is for your personal use. The public PowerPoint page does not describe a tenant-wide publishing workflow for the picker. Treat organisation-published PowerPoint Skills as unconfirmed rather than borrowing Cowork's plugin deployment model.

### Option 2: Paste a Skill through Add skill

The **Add skill** flow also provides a form where you can paste the Skill.

After you select **Add**, PowerPoint saves it to the same OneDrive Skills location.

This route is useful when:

- the Skill is short;
- you want to make a quick change before saving it; or
- someone has given you the `SKILL.md` content rather than a ready-made folder.

Before you paste anything, read it. A Skill is an instruction set that Copilot will follow.

### Option 3: Add the folder directly in OneDrive

You can manage the files yourself:

1. In the Copilot pane, open **Settings**.
2. Select **Manage skills**.
3. Select **Custom skills**.
4. Select **Create OneDrive folder**.
5. Select **Open skills folder**.
6. Add one folder per Skill.
7. Put `SKILL.md` inside each folder.
8. Return to PowerPoint and select **Refresh**.

This is the clearest route when you want to manage the Skill folder yourself. Keep the first version simple: one folder and one `SKILL.md`. If you add references, templates, or other companion files, test that PowerPoint actually uses them before relying on them.

## The SKILL.md format PowerPoint expects

Each custom Skill needs its own folder:

```text
create-executive-summary-slide/
└── SKILL.md
```

The file starts with YAML frontmatter and continues with Markdown instructions:

```markdown
---
name: create-executive-summary-slide
description: >
  Creates one executive-summary slide from the current presentation.
  Use when the user asks for an executive summary, leadership overview,
  or one-slide recap of the deck.
---

# Create an executive-summary slide

## Workflow

1. Read the current presentation.
2. Identify the three to five points a leader needs first.
3. Create one new slide after the title slide.
4. Follow the presentation's existing theme and layout.
5. Keep each point short and do not invent missing facts.

## Output

Use one clear title and no more than five summary points.
```

The two required frontmatter fields are:

| Field | What it does |
|---|---|
| `name` | Gives the Skill its machine-readable identifier |
| `description` | Explains what the Skill does and when Copilot should use it |

The open [Agent Skills specification](https://agentskills.io/specification) adds the exact naming rules:

- `name` must be 1-64 characters;
- use lowercase letters, numbers, and hyphens;
- do not start or end with a hyphen;
- do not use consecutive hyphens;
- make the name match the parent folder exactly.

```text
Folder: create-executive-summary-slide
name: create-executive-summary-slide
```

That matches.

```text
Folder: create-executive-summary-slide
name: executive-summary
```

That does not.

PowerPoint skips a folder when its folder name does not match the `name` in `SKILL.md`.

## Edit, replace, disable, or delete a Skill

Open **Manage skills**, then open **Custom skills**.

Depending on the Skill and how it was added, the pane can show actions such as:

- **Edit**
- **Replace**
- **Delete**

<!-- Screenshot planned: PowerPoint Custom skills list showing Edit or Replace and Delete actions below uploaded Skills. -->

*Official UI reference: [Microsoft Support — edit or remove PowerPoint Skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills#edit-or-remove-skills). Use a lab Skill name with no customer or tenant data.*

Microsoft's page text documents **Edit** and **Delete**. Its public screenshot also shows **Replace** for one uploaded Skill. Which action appears can depend on the upload method; check your own tenant.

Use the actions for different jobs:

| Action | Use it when |
|---|---|
| **Turn off** | You want to keep the Skill but stop PowerPoint using it |
| **Edit** | You want to change the instructions |
| **Replace** | You have a newer file for an uploaded Skill, when this action is available |
| **Delete** | You no longer want the custom Skill |
| **Refresh** | You changed the files directly in OneDrive |

<!-- Screenshot planned: PowerPoint Custom skills pane with Add skill and Refresh buttons visible. -->

*Official UI reference: [Microsoft Support — refresh custom PowerPoint Skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills#edit-or-remove-skills).*

## What makes a good PowerPoint Skill?

A good PowerPoint Skill has a narrow job and a visible finish line.

| Better Skill | Too broad |
|---|---|
| Create one executive-summary slide | Make this presentation better |
| Check slide titles for a consistent pattern | Fix all wording and design |
| Turn the current deck into a five-minute talk track | Prepare me for everything |
| Review the deck against a named checklist | Apply best practices |
| Convert dense slides into one-message-per-slide | Make it more professional |

The first column gives Copilot something it can finish and you can review.

### Include presentation-specific rules

Useful instructions can cover:

- where the new slide should go;
- how many slides or bullets to create;
- whether to preserve the existing theme;
- whether to use speaker notes;
- what source material to use;
- what Copilot must not invent;
- how to handle a missing fact;
- what the final output should look like.

### Keep the description practical

The description helps Copilot decide when to use the Skill.

Weak:

```yaml
description: Helps with presentations.
```

Stronger:

```yaml
description: >
  Reviews the current PowerPoint presentation for repeated wording,
  unclear slide titles, and inconsistent terminology. Use when the user
  asks to copyedit, proofread, or check presentation consistency.
```

The stronger version says what the Skill does and gives Copilot the words that should trigger it.

## Troubleshooting

| Problem | What to check |
|---|---|
| **Copilot is missing** | Confirm your subscription includes it and your organisation allows it |
| **Choose skills is missing** | Check rollout, platform, update channel, licence, and organisation settings; the exact matrix is not fully documented publicly |
| **Uploaded Skill does not appear** | Select **Refresh** in **Manage skills** |
| **OneDrive Skill is ignored** | Make the folder name match the `name` field exactly |
| **Skill disappeared from the dropdown** | Check whether it was turned off |
| **Skill triggers for the wrong request** | Make the `description` narrower and add clearer trigger phrases |
| **Result changes too much of the deck** | Reduce the Skill's scope and state what it must preserve |

## Admin note

The public PowerPoint page focuses on personal Skills. It says users can add Skills created by their organisation, but it does not document the same admin deployment workflow that Microsoft publishes for Cowork plugins.

That leaves two open questions:

1. whether admins can centrally allow or block personal PowerPoint Skill uploads; and
2. whether packaged or organisation-published Skills appear directly in the PowerPoint picker.

Do not fill those gaps with the Cowork answer. They are different surfaces.

## Continue the Copilot Skills series

- **[Microsoft 365 Copilot Skills, explained](/blog/microsoft-365-copilot-skills-explained/)** — the hub: format, distribution, portability, and governance.
- **[Skills in Excel](/blog/microsoft-365-copilot-skills-excel/)** — end-user Skills and the separate Office.js developer preview.
- **[Skills in Word](/blog/microsoft-365-copilot-skills-word/)** — the current Word experience and the standalone-picker question.
- **[Cowork Skill packaging and distribution](/blog/microsoft-365-copilot-skills-cowork-packaging-distribution/)** — packages, connectors, MCP, validation, and publishing.
- **[Write your first SKILL.md](/blog/write-your-first-skill-md-microsoft-365-copilot/)** — the hands-on authoring guide.
- **[Admin and governance for Copilot Skills](/blog/microsoft-365-copilot-skills-admin-governance/)** — controls, permissions, Purview, and rollout decisions.

## Official public sources

- [Microsoft Support — Copilot in PowerPoint Skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills)
- [Microsoft 365 Copilot June 2026 feature update](https://techcommunity.microsoft.com/blog/Microsoft365CopilotBlog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)
- [Agent Skills specification](https://agentskills.io/specification)
