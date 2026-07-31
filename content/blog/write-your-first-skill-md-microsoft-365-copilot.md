---
title: "Write Your First SKILL.md: Step-by-Step Guide"
list_title: "Write Your First SKILL.md — Step-by-Step"
description: "Create a portable Agent Skill from scratch: folder rules, frontmatter, workflows, references, scripts, validation, trigger tests, and common fixes."
date: 2026-07-31
lastmod: 2026-07-31
draft: false
card_tag: "Copilot Skills"
tag_class: "ai"
images: ["images/og/blog/write-your-first-skill-md-microsoft-365-copilot.jpg"]
og_headline: "Write Your First SKILL.md"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - skills
  - skill-md
  - agent-skills
hub_id: "copilot-skills"
layout: "notebook"
stamp: "hands-on guide"
intro_note: "↗ one folder, one SKILL.md, one real task — start smaller than you think"
sitemap:
  priority: 0.8
founder_note: |
  A useful Skill is usually extracted from work that already happened. You did the task, corrected the agent, found the awkward edge cases, and decided what good looks like. SKILL.md is where you save that learning.

  Do not begin with a hundred rules. Begin with a real task, a clear finish line, and three test prompts. Let the failures teach you what the next line should be.
---

<div class="living-doc-banner">

**Living hands-on guide.** This tutorial separates the open Agent Skills specification from Microsoft-specific storage, packaging, and limits. **Public sources last checked: 31 July 2026.**

</div>

*This is part of the [Microsoft 365 Copilot Skills series](/blog/microsoft-365-copilot-skills-explained/).*

**A Skill can start as one folder with one file.** You do not need a plugin, connector, script, or app manifest for the first version.

```text
project-status-brief/
└── SKILL.md
```

That is enough to teach a compatible agent when to use a repeatable workflow and how to carry it out.

<!-- Screenshot planned: VS Code showing a project-status-brief folder with SKILL.md selected. -->

## The short version

1. Pick one real task you repeat.
2. Name the folder in kebab-case.
3. Create `SKILL.md`.
4. Add required `name` and `description` frontmatter.
5. Make `name` match the folder exactly.
6. Write the steps, output, guardrails, and edge cases.
7. Try two or three realistic prompts.
8. Add references only when the main file becomes too detailed.
9. Add a script only when deterministic code is safer than repeating the logic.
10. Validate, compare with a no-Skill baseline, and improve.

{{< margin >}}The file is simple. The quality comes from how clearly you describe the real work.{{< /margin >}}

## What is a SKILL.md file?

The [Agent Skills specification](https://agentskills.io/specification) defines a Skill as a directory containing at least `SKILL.md`.

The file has:

1. YAML frontmatter at the top.
2. Markdown instructions below it.

```markdown
---
name: project-status-brief
description: >
  Creates a concise project status brief from user-provided sources.
  Use when asked for a weekly update, project report, leadership brief,
  steering summary, or status pack.
---

# Project status brief

Instructions go here.
```

The open format is used by compatible clients including Microsoft Copilot experiences, GitHub Copilot and VS Code, Claude, Gemini CLI, Cursor, OpenAI Codex, and others. Each host still decides where Skills live and which tools or scripts it can run.

## Find an existing Skill first

Before writing from scratch, search the [CAT Agent Skills gallery](https://microsoft.github.io/cat-agent-skills/).

It is a Microsoft-hosted community gallery for Cowork, Copilot Studio and Scout. The gallery can save time, but it is not a security-reviewed marketplace:

- community submissions are shared under MIT;
- CI validates metadata and structure;
- scripts, references and assets ship verbatim;
- Microsoft Support does not support the gallery or individual Skills.

Read the exact `SKILL.md` and bundled files before reuse.

## Step 1: choose one real task

Good first Skill:

> Turn source material into a short project status brief with progress, risks, decisions, and next actions.

Too broad:

> Help with project management.

The first has:

- a known input;
- a repeatable method;
- a visible output;
- boundaries you can test.

The second could mean a hundred different jobs.

### Start from work that already happened

The strongest Skills capture real expertise:

- steps that worked;
- corrections you made;
- formats your team expects;
- edge cases that caused mistakes;
- checks you always perform;
- tools or references the agent would not know to use.

If the agent already performs the whole task well without a Skill, the Skill may not add enough value.

### Optional: draft from a recording

[Microsoft Skill Recorder](/blog/microsoft-skill-recorder-copilot-skills/) can reconstruct intent and ordered steps from a recorded task, then draft a Scout or Cowork Skill.

Treat the output as a first draft:

- use synthetic data;
- review every fixed value and action;
- compare final `allowed-tools` with the approved plan;
- remove personal paths, names and secrets;
- test the Skill against a no-Skill baseline.

Version 0.3.1 does not generate supporting files or Copilot Studio Skills, and cloud analysis receives selected screenshots and activity data.

## Step 2: create the folder

Use lowercase letters, numbers, and hyphens:

```text
project-status-brief
```

Valid:

```text
weekly-report
project-status-brief
invoice-review-v2
```

Invalid:

```text
ProjectStatusBrief
project_status_brief
-project-status
project--status
project-status-
```

The `name` field must:

- be 1-64 characters;
- use lowercase letters, numbers, and hyphens;
- not start or end with a hyphen;
- not contain consecutive hyphens;
- match the parent directory exactly.

## Step 3: write the frontmatter

Create `project-status-brief/SKILL.md`:

```yaml
---
name: project-status-brief
description: >
  Creates a concise project status brief from user-provided sources.
  Use when asked for a weekly update, project report, leadership brief,
  steering summary, or status pack.
---
```

### Required fields

| Field | Rule |
|---|---|
| `name` | 1-64 characters; exact folder match |
| `description` | 1-1024 characters; explain what the Skill does and when to use it |

### Optional fields

| Field | Use |
|---|---|
| `license` | Name a licence or bundled licence file |
| `compatibility` | State product, package, network, or runtime requirements; up to 500 characters |
| `metadata` | Add host-specific string key-value pairs such as author or version |
| `allowed-tools` | Experimental pre-approved tool list; support varies by host |

Do not add optional metadata merely because an example contains it. Add it when the host or distribution path needs it.

<!-- Screenshot planned: SKILL.md frontmatter showing matching folder name, precise description, and optional metadata clearly separated. -->

## Step 4: make the description trigger the right work

The agent initially sees only the Skill's `name` and `description`.

That makes the description the front door.

Weak:

```yaml
description: Helps with project reports.
```

Stronger:

```yaml
description: >
  Creates a concise project status brief from user-provided sources.
  Use when asked for a weekly update, project report, leadership brief,
  steering summary, or status pack.
```

The stronger version describes:

- the outcome;
- the source boundary;
- the likely user language.

### Test near-misses

The Skill should trigger for:

- "Turn these meeting notes into this week's project update."
- "I need a steering brief from the attached status deck."
- "Can you prepare the Friday project report?"

It should not trigger for:

- "Create a project plan for a new programme."
- "Schedule the project stand-up."
- "Design a risk register template."

Near-misses are better tests than obviously unrelated prompts.

## Step 5: write the workflow

Keep the body procedural.

```markdown
# Project status brief

## Inputs

Use only the files, messages, notes, or links the user provides or names.

## Workflow

1. Identify the reporting period, project, and audience.
2. Read the provided sources.
3. Separate confirmed progress from planned work.
4. Extract risks, decisions, blockers, and next actions.
5. Ask for missing owners or dates instead of inventing them.
6. Draft the brief using the required output structure.
7. Check every factual statement against the supplied sources.

## Output

Use these headings:

1. Overall status
2. Progress
3. Risks and blockers
4. Decisions needed
5. Next actions

## Guardrails

- Do not invent a status, owner, date, budget, or decision.
- Mark conflicting source information clearly.
- Keep the brief under 500 words unless the user asks for more.
- Use plain language for a mixed business and technical audience.
```

This gives the agent a path and a finish line.

<!-- Screenshot planned: Full project-status-brief SKILL.md showing Inputs, Workflow, Output, and Guardrails sections. -->

## Step 6: define the output

Output templates improve consistency.

```markdown
## Output template

# [Project name] — status brief

**Reporting period:** [date range]
**Overall status:** [confirmed status or "Not provided"]

## Progress
- [confirmed progress]

## Risks and blockers
| Risk | Impact | Owner | Next step |
|---|---|---|---|

## Decisions needed
- [decision and decision owner]

## Next actions
| Action | Owner | Due |
|---|---|---|
```

A template is more reliable than "make it professional."

## Step 7: add guardrails and edge cases

Guardrails are the lines that prevent plausible but wrong output.

For this Skill:

- what if the reporting period is missing?
- what if two sources disagree?
- what if an action has no owner?
- what if the user provides no source material?
- what if the Skill is invoked for a project plan instead?

Write the answer:

```markdown
## Edge cases

- If the reporting period is missing, ask for it before drafting.
- If two sources conflict, show both versions and ask which is current.
- If an owner or due date is missing, write "Not provided."
- If no source material is available, ask for it; do not create a fictional update.
- If the user asks for a project plan, do not use this Skill.
```

## Step 8: use references for detail

When `SKILL.md` starts becoming an encyclopedia, move detail out:

```text
project-status-brief/
├── SKILL.md
└── references/
    ├── status-definitions.md
    └── writing-style.md
```

Tell the agent when to read each file:

```markdown
## References

- Read `references/status-definitions.md` when the source uses red,
  amber, green, or another health rating.
- Read `references/writing-style.md` before drafting for an executive audience.
```

Do not write only:

```markdown
See references for more information.
```

The agent needs the condition.

<!-- Screenshot planned: Skill folder with references/status-definitions.md and SKILL.md instructions that say exactly when to read it. -->

### Progressive disclosure

The open specification recommends:

| Layer | Loaded |
|---|---|
| `name` + `description` | During discovery |
| `SKILL.md` body | When the Skill activates |
| references, scripts, assets | When required |

Recommended—not universal hard limits:

- keep `SKILL.md` under 500 lines;
- keep the body under roughly 5,000 tokens;
- keep references focused;
- keep file references shallow.

Microsoft hosts can add stricter package limits. Do not turn a Cowork companion-file limit into a rule for every Agent Skills client.

## Step 9: add a script only when it earns its place

Skip scripts in the first version unless deterministic code adds real value.

Good reasons:

- validate a known file format;
- transform data the same way every time;
- generate a chart with tested code;
- check output against fixed rules.

Poor reason:

- the Skill looks more advanced with code.

Example folder:

```text
project-status-brief/
├── SKILL.md
├── references/
│   └── status-definitions.md
└── scripts/
    └── validate-report.py
```

Reference it with a relative path:

```markdown
## Validation

After creating a Markdown report, run:

python scripts/validate-report.py --input report.md
```

Scripts should:

- avoid interactive prompts;
- accept flags, environment variables, or standard input;
- provide useful `--help`;
- send structured data to stdout;
- send diagnostics to stderr;
- return meaningful exit codes;
- be safe to retry;
- provide a dry-run mode for destructive work;
- document prerequisites.

<!-- Screenshot planned: Terminal running a safe validate-report.py script with --help and then returning structured validation output. -->

> **Things to know**
>
> Script support depends on the host. A script that runs in VS Code, GitHub Copilot CLI, or Claude Code might not run in PowerPoint, Excel, or Cowork. Use `compatibility` when the environment matters, and test the exact host.

## Step 10: validate the format

The Agent Skills project publishes `skills-ref`:

```powershell
skills-ref validate .\project-status-brief
```

It checks frontmatter and naming conventions.

<!-- Screenshot planned: Terminal showing skills-ref validate passing for project-status-brief and failing a folder-name mismatch example. -->

Format validation does not prove the Skill is useful. It proves the package is shaped correctly.

## Step 11: test the Skill against a baseline

Start with two or three realistic evals:

```json
{
  "skill_name": "project-status-brief",
  "evals": [
    {
      "id": 1,
      "prompt": "Turn these project notes into a Friday status brief.",
      "expected_output": "A sourced brief with progress, risks, decisions, and actions.",
      "files": ["evals/files/project-notes.md"]
    },
    {
      "id": 2,
      "prompt": "These two notes disagree on the launch date. Prepare the update.",
      "expected_output": "The conflict is surfaced instead of silently resolved.",
      "files": [
        "evals/files/team-notes.md",
        "evals/files/steering-notes.md"
      ]
    }
  ]
}
```

Run each prompt:

1. with the Skill;
2. without the Skill, or with the previous version.

Then compare:

- factual accuracy;
- output structure;
- missing-information behavior;
- time;
- token use;
- human usefulness.

Add assertions after the first run:

```json
"assertions": [
  "The brief contains all five required sections",
  "No missing owner or due date is invented",
  "Conflicting launch dates are both shown",
  "Every factual progress claim is traceable to an input file"
]
```

<!-- Screenshot planned: Side-by-side eval results showing with-Skill and without-Skill outputs plus assertion pass rates. -->

### Test triggering separately

Create roughly:

- 8-10 prompts that should trigger;
- 8-10 near-misses that should not.

Run each more than once because model behavior varies.

Improve the description using failures from a train set, then check a held-back validation set so you do not overfit to the exact test wording.

## Step 12: install it in the target host

The storage path depends on the product.

| Host | Publicly documented path |
|---|---|
| PowerPoint | OneDrive Skills folder created from Manage skills |
| Excel | OneDrive Skills folder created from Manage skills |
| Cowork | OneDrive [`Documents/Cowork/skills/`](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork#create-custom-skills), Customize upload, or packaged plugin |
| VS Code | [`.agents/skills/<skill-name>/SKILL.md`](https://agentskills.io/skill-creation/quickstart) by default |

Portable format does not mean identical runtime.

Test:

- discovery;
- activation;
- reference loading;
- script execution;
- file access;
- output location;
- permissions;
- approval prompts.

## Common failures

| Failure | Fix |
|---|---|
| Folder and `name` differ | Rename one so they match exactly |
| Skill never triggers | Add user intent and realistic trigger phrases to `description` |
| Skill triggers everywhere | Narrow the description and test near-misses |
| Body is too long | Move detail to a reference and state when to read it |
| Agent ignores a reference | Link it explicitly from the workflow |
| Script blocks forever | Remove interactive input |
| Script output is hard to use | Return JSON/CSV and useful errors |
| Agent invents missing values | Add a stop/ask/not-provided rule |
| Skill works only on the author's example | Add varied prompts and edge cases |
| Secrets are inside the Skill | Move credentials to the host's secure auth system |
| Skill claims work succeeded | Add a verification step and require evidence |

## First-Skill checklist

- [ ] One real repeatable task
- [ ] Folder uses valid kebab-case
- [ ] `name` matches folder
- [ ] `description` says what and when
- [ ] Workflow has numbered steps
- [ ] Output has a defined shape
- [ ] Missing facts are handled
- [ ] Near-misses are listed
- [ ] References have loading conditions
- [ ] Scripts are optional and host-tested
- [ ] Format validation passes
- [ ] With-Skill result beats the baseline
- [ ] Human reviewer checks the output

## Continue the Copilot Skills series

- **[Microsoft 365 Copilot Skills, explained](/blog/microsoft-365-copilot-skills-explained/)** — the hub.
- **[Skills in PowerPoint](/blog/microsoft-365-copilot-skills-powerpoint/)** — picker, upload, and management.
- **[Skills in Excel](/blog/microsoft-365-copilot-skills-excel/)** — end-user Skills and Office.js Preview.
- **[Skills in Word](/blog/microsoft-365-copilot-skills-word/)** — the honest current state.
- **[Cowork Skill packaging and distribution](/blog/microsoft-365-copilot-skills-cowork-packaging-distribution/)** — package, connect, test, publish.
- **[Microsoft Skill Recorder](/blog/microsoft-skill-recorder-copilot-skills/)** — recording-assisted Scout and Cowork Skill drafting.
- **[Admin and governance for Copilot Skills](/blog/microsoft-365-copilot-skills-admin-governance/)** — controls, permissions, Purview, and rollout.

## Official public sources

- [Agent Skills specification](https://agentskills.io/specification)
- [Agent Skills quickstart](https://agentskills.io/skill-creation/quickstart)
- [Agent Skills authoring best practices](https://agentskills.io/skill-creation/best-practices)
- [Using scripts in Agent Skills](https://agentskills.io/skill-creation/using-scripts)
- [Evaluating Skill output quality](https://agentskills.io/skill-creation/evaluating-skills)
- [Optimising Skill descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)
- [Microsoft Learn — build Cowork plugins](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development)
- [Microsoft Support — PowerPoint Skills](https://support.microsoft.com/en-us/powerpoint/copilot/copilot-in-powerpoint-skills)
- [Microsoft Support — Excel Skills](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-skills)
- [CAT Agent Skills gallery](https://microsoft.github.io/cat-agent-skills/)
- [Microsoft Skill Recorder](https://github.com/microsoft/skill-recorder)
