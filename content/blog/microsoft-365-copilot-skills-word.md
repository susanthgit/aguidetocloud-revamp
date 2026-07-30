---
title: "Copilot Skills in Word: What Exists Today"
list_title: "Skills in Word — The Honest Current State"
description: "Word has Edit with Copilot and a Word Agent, but no public standalone SKILL.md picker yet. Here is what each experience actually does."
date: 2026-07-31
lastmod: 2026-07-31
draft: false
card_tag: "Copilot Skills"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-skills-word.jpg"]
og_headline: "Copilot Skills in Word"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - skills
  - word
  - edit-with-copilot
hub_id: "copilot-skills"
layout: "notebook"
stamp: "current-state guide"
intro_note: "↗ Word can edit inside the document today — but that does not automatically mean it has the PowerPoint Skills picker"
sitemap:
  priority: 0.8
founder_note: |
  The easiest mistake here is to see the same word—agent, Skill, Copilot—and assume every app exposes the same thing. Word is useful today, just through a different door.

  Use Edit with Copilot when the document is already open. Use the Word Agent when you need a new file. Keep watching for a real Word SKILL.md picker, but do not teach a button that Microsoft has not publicly documented yet.
---

<div class="living-doc-banner">

**Current-state guide.** Public Microsoft sources document Skills in PowerPoint and Excel, but no equivalent Word `SKILL.md` picker page. **Public sources last checked: 31 July 2026.**

</div>

*This is part of the [Microsoft 365 Copilot Skills series](/blog/microsoft-365-copilot-skills-explained/).*

**The honest answer from the public sources checked for this guide: Microsoft documents Edit with Copilot and the Word Agent, but not a standalone Word `SKILL.md` Skills picker.** There is no public Word equivalent of PowerPoint's **Choose skills** or Excel's **All Skills** page in those sources.

Word does have two useful Copilot experiences:

1. **Edit with Copilot in Word** — works inside the document you already have open.
2. **Word Agent in Microsoft 365 Copilot** — creates a new Word file from Copilot Chat and saves it to OneDrive.

They are useful. They are not the same as a reusable `SKILL.md` picker.

## The three things people mix together

| Experience | Where it runs | What it does | `SKILL.md` picker? |
|---|---|---|---|
| **Edit with Copilot in Word** | Inside the open Word document | Creates, edits, refines, and formats content in place | Not publicly documented |
| **Word Agent** | Microsoft 365 Copilot app | Creates a new Word file from a prompt | Not a personal `SKILL.md` picker |
| **Copilot Skills** | Publicly documented today in PowerPoint, Excel, and Cowork | Reusable instruction packages chosen or invoked by name | No Word-specific public page found |

> **Simple rule:** Open document? Use Edit with Copilot. Need a new file? Use Word Agent. Need reusable `SKILL.md` instructions in Word? That surface is not publicly documented yet.

## Edit with Copilot in Word

Microsoft calls the current in-document editing experience **Edit with Copilot in Word**. Earlier releases called it **Agent Mode**.

It works as a co-creator in the open document:

- draft new content;
- rewrite and refine existing text;
- restructure sections;
- apply Word styles and formatting;
- use work context such as files, emails, and meetings when available.

<!-- Screenshot planned: Current Word Copilot Tools menu showing Edit with Copilot, not the older Agent mode label. -->

*Official UI reference: [Microsoft Support — Edit with Copilot in Word](https://support.microsoft.com/en-us/word/edit-with-copilot-in-word). The current public image still shows the older **Agent mode** label, so capture the live tenant wording.*

### Open Edit with Copilot

1. Open a Word document.
2. Open Copilot from the Home tab, sidebar, or the Copilot Dynamic Action Button.
3. In the prompt box, select **Tools**.
4. Select **Edit with Copilot**.
5. Describe the change you want.
6. Review the result before keeping it.

<!-- Screenshot planned: Word document showing the Copilot Dynamic Action Button and the chat pane open in Edit mode. -->

*Official UI reference: [Microsoft Support — welcome to Copilot in Word](https://support.microsoft.com/en-us/word/welcome-to-copilot-in-word).*

### A practical edit prompt

```text
Make the executive summary shorter and easier to scan.

Keep the existing facts, figures, and decision.
Use one short opening paragraph followed by no more than five bullets.
Do not change the rest of the document.
```

That prompt gives Copilot:

- a clear target;
- boundaries;
- an output shape;
- a preserve list.

Those same ingredients make a good Skill description—but Word does not currently expose the public Skill picker needed to save and invoke it as a Word `SKILL.md`.

## Use work context with the slash picker

Word can ground a draft in files, emails, and meetings.

Type `/` in the Copilot prompt and start typing the source name. You can also choose an item from the menu.

```text
Draft a two-page customer brief using /Project Phoenix steering meeting
and /Project Phoenix decision log.

Use the confirmed decisions only.
Add a final section for open questions.
```

Microsoft documents up to **20 reference items** when creating a new draft.

<!-- Screenshot planned: Word Copilot slash picker showing safe demo files, emails, or meetings as reference options. -->

The permission boundary still matters. You must already have access to the selected SharePoint or OneDrive files.

## Review before changes land

In a shared document, Edit with Copilot shows a preview of suggested changes in chat before applying them. Nothing is added until you review and approve it.

<!-- Screenshot planned: Shared Word document with Copilot previewing suggested edits and an approval control before applying them. -->

For quick drafting, Word also provides:

- **Keep it**
- **Regenerate**
- **Discard**
- a follow-up prompt to refine the result.

<!-- Screenshot planned: Word Copilot result options showing Keep it, Regenerate, and Discard. -->

Switch to **Chat only** when you want an answer or critique without changing the document.

<!-- Screenshot planned: Word Copilot Chat only mode answering a question about the document without editing it. -->

## What Edit with Copilot does not replace

Edit with Copilot works in the document that is already open. Microsoft's support page says it cannot create a separate new file from that mode.

It also says external-tool integration is not supported.

For a new document, use the Word Agent.

### Capability drift to verify

Microsoft's current Edit with Copilot support page still lists these limitations:

- cannot generate or insert images in Edit mode;
- cannot add or modify comments;
- cannot turn Track Changes on or off;
- cannot accept or reject tracked changes;
- does respect Track Changes when it is already enabled.

Microsoft's June 2026 update separately announced image insertion and comment-driven document edits in Word.

Those public pages are not fully aligned.

> **Things to know**
>
> Test image insertion, comment-driven edits, and Track Changes behavior in your tenant. Microsoft's rollout is staged, so the public pages can describe different points in time.

## Word Agent in Microsoft 365 Copilot

The **Word Agent** is a separate experience in the Microsoft 365 Copilot app.

Use it when you want to create a new Word file from a prompt.

### Where to find it

1. Open Microsoft 365 Copilot on the web, desktop app, or Teams.
2. Open **Tools** in Copilot Chat or the **Agents** menu.
3. Select **Word**.
4. Describe the document you need.
5. Answer any clarifying questions.
6. Review the preview.
7. Open the saved file from OneDrive.

<!-- Screenshot planned: Microsoft 365 Copilot Tools or Agents menu showing the Word Agent. -->

### A practical Word Agent prompt

```text
Create a two-page project proposal.

Include:
- the problem;
- the proposed approach;
- a four-week timeline;
- risks and mitigations;
- decisions needed.

Use plain language for a mixed technical and business audience.
```

The Word Agent creates a file, shows a preview, and saves it to OneDrive.

<!-- Screenshot planned: Word Agent showing a generated document preview and OneDrive save location. -->

## Word Agent availability and admin dependency

Microsoft says the Word, Excel, and PowerPoint Agents are available to Microsoft 365 users:

- with or without a Microsoft 365 Copilot licence;
- including Microsoft 365 Personal, Family, and Premium plans;
- in supported Microsoft 365 Copilot languages.

The organisational experience depends on Anthropic models being enabled. Microsoft says these file-creation Agents exclusively use Anthropic models, and an admin can disable that model provider.

If the Word Agent is missing:

1. check whether the Anthropic model provider is enabled;
2. check regional availability;
3. check the Microsoft 365 Copilot app rather than the Word app;
4. confirm your account and licence context.

## GA or still rolling out?

The public wording is mixed.

| Microsoft source | Wording |
|---|---|
| April 2026 Microsoft 365 Blog | Agentic capabilities in Word, Excel, and PowerPoint are generally available and the default experience for customers with Microsoft 365 Copilot and Microsoft 365 Premium subscriptions; the post also says they are available to Microsoft 365 Personal and Family users |
| Current Edit with Copilot support page | Rolling out worldwide; Personal/Family access listed as coming soon; Insiders or Frontier suggested for early access |

The safest public wording is:

> Edit with Copilot has been announced as generally available, but Microsoft still describes parts of the Word rollout and consumer access as staged. Availability can depend on licence, organisation settings, platform, and update channel.

Recheck both pages against your tenant before relying on the table.

## Where `SKILL.md` fits today

PowerPoint publicly documents:

- **Choose skills**
- `@` mention invocation
- **Manage skills**
- custom upload
- OneDrive Skill storage.

Excel publicly documents:

- **All Skills**
- `@` mention invocation
- **Manage skills**
- OneDrive custom Skills.

Cowork publicly documents:

- built-in Skills;
- personal custom Skills;
- shared Skills;
- packaged plugin Skills.

Word does not currently have an equivalent public support page.

That means this spoke should not invent:

- **Choose skills in Word**;
- **Manage skills in Word**;
- a Word `@skill-name` workflow;
- a Word custom-Skill upload screen.

## What to use in Word today

| Your task | Use |
|---|---|
| Rewrite part of the open document | Edit with Copilot |
| Restructure the whole open document | Edit with Copilot |
| Ask questions without changing the file | Chat only |
| Ground a draft in files, emails, or meetings | Slash references in Word |
| Create a new Word file from Copilot Chat | Word Agent |
| Reuse a `SKILL.md` method | Use a documented Skills surface such as PowerPoint, Excel, or Cowork; Word support is not yet publicly documented |

## Troubleshooting

| Problem | What to check |
|---|---|
| **Edit with Copilot is missing** | Licence, organisation settings, platform, update channel, and rollout |
| **The menu still says Agent Mode** | Older build or staged naming update |
| **Slash references are missing** | Microsoft 365 Copilot licence, source permissions, and platform |
| **Changes landed in the wrong section** | Narrow the prompt and select the target text first |
| **Word Agent is missing from Copilot** | Anthropic admin setting, region, and account context |
| **You expected a Word Skills picker** | No public Word-specific `SKILL.md` picker is currently documented |

## Continue the Copilot Skills series

- **[Microsoft 365 Copilot Skills, explained](/blog/microsoft-365-copilot-skills-explained/)** — the hub.
- **[Skills in PowerPoint](/blog/microsoft-365-copilot-skills-powerpoint/)** — the documented picker and custom upload flow.
- **[Skills in Excel](/blog/microsoft-365-copilot-skills-excel/)** — end-user Skills and the separate Office.js preview.
- **[Cowork Skill packaging and distribution](/blog/microsoft-365-copilot-skills-cowork-packaging-distribution/)** — packages, connectors, MCP, validation, and publishing.
- **[Write your first SKILL.md](/blog/write-your-first-skill-md-microsoft-365-copilot/)** — the practical authoring guide.
- **[Admin and governance for Copilot Skills](/blog/microsoft-365-copilot-skills-admin-governance/)** — controls, permissions, Purview, and rollout.

## Official public sources

- [Microsoft Support — welcome to Copilot in Word](https://support.microsoft.com/en-us/word/welcome-to-copilot-in-word)
- [Microsoft Support — Edit with Copilot in Word](https://support.microsoft.com/en-us/word/edit-with-copilot-in-word)
- [Microsoft Support — draft and add content with Copilot in Word](https://support.microsoft.com/en-us/word/copilot/draft-and-add-content-with-copilot-in-word)
- [Microsoft Support — Word, Excel, and PowerPoint Agents in Microsoft 365 Copilot](https://support.microsoft.com/en-us/office/365-copilot-app/get-started-with-word-excel-and-powerpoint-agents-in-microsoft-365-copilot)
- [Microsoft Learn — admin controls for Word, Excel, and PowerPoint Agents](https://learn.microsoft.com/en-us/microsoft-365/copilot/wordexcelppt-agents)
- [Microsoft 365 Blog — agentic capabilities in Word, Excel, and PowerPoint](https://www.microsoft.com/en-us/microsoft-365/blog/2026/04/22/copilots-agentic-capabilities-in-word-excel-and-powerpoint-are-generally-available/)
- [Microsoft 365 Copilot June 2026 feature update](https://techcommunity.microsoft.com/blog/Microsoft365CopilotBlog/what%E2%80%99s-new-in-microsoft-365-copilot--june-2026/4529572)
