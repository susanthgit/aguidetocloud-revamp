---
title: "Microsoft 365 Copilot Prompting — What's New 2026"
description: "Notebooks, Researcher, Analyst, Work IQ, model choice, Memory, multimodal. The 2026 prompting layer that sits on top of the four-block framework."
date: 2026-05-27
lastmod: 2026-05-27
card_tag: "Prompt Engineering"
tag_class: "ai"
layout: "notebook"
stamp: "upgrade brief"
intro_note: "↗ what's changed since the original Copilot prompt engineering guide. The fundamentals still apply — these features sit on top."
founder_note: |
  The four-block framework (Goal · Context · Expectations · Source) and the iteration habit haven't moved. They're still the spine. But the surfaces Copilot prompts run on have moved a lot since 2024. *(If you need a refresher on the basics, start with the [Field Guide](/blog/prompt-engineering-microsoft-365-copilot/).)*

  In the last twelve months Microsoft has shipped: **Copilot Notebooks** (persistent multi-source workspaces), the **Researcher** and **Analyst** agents (delegate a task, not a one-shot prompt), **Work IQ** (the new label for grounding across emails / files / meetings / chats), **model choice** (GPT-5.5 Thinking, GPT-5.5 Instant, Claude — each tuned differently), **Memory** (Copilot no longer forgets between sessions), and **multimodal** input (paste an image, speak a prompt, generate an image inside PowerPoint).

  Honest take? Most M365 Copilot users I meet are still prompting like it's 2024. The Field Guide on this site teaches that layer — and you should master it first. This upgrade brief is the layer on top. Skim it once. Pick one or two things to try this week. Come back when something else lands. *(For the monthly release notes, check the [May 2026 update](/blog/microsoft-365-copilot-may-2026-updates/) and the [April 2026 update](/blog/microsoft-365-copilot-april-2026-updates/).)*

  If you haven't read the [Prompt Engineering Field Guide](/blog/prompt-engineering-microsoft-365-copilot/) yet, **read that first**. Everything here assumes you already know what Goal · Context · Expectations · Source means and that iteration is a habit.
faq:
  - question: "What is Copilot Notebooks and why does it matter for prompting?"
    answer: "Copilot Notebooks is a shared AI-powered workspace where you pin references (files, emails, meeting recaps, web pages, OneNote sections) and prompt across the whole notebook. The references stay attached across sessions — so you don't re-attach the same files every time you want to ask a question. For multi-source prompting (compare these three docs against our policy), Notebooks is the surface that finally makes the workflow practical."
  - question: "What's the Researcher agent and how is prompting it different?"
    answer: "Researcher is a first-party Copilot agent built for multi-step research tasks. You give it a task brief — not a single-turn question — and it autonomously synthesises across your work data and the public web to produce a structured output. The prompting style is different: instead of 'summarise this file', you write a scope ('research the competitive landscape for our migration product, using our existing battle cards plus the web, produce a 3-page briefing with citations'). Researcher will multi-step through that scope on its own."
  - question: "What's the Analyst agent and when should I use it instead of Excel Copilot?"
    answer: "Analyst is the data-analysis specialist agent. It runs Python under the hood to do real numerical reasoning — calculations, statistical patterns, trend detection — across the files you attach. Use Analyst when the question is genuinely numerical and the data isn't already in a clean Excel sheet (e.g., a CSV export from CRM, a folder of monthly reports, an exported BI dataset). Use Excel Copilot when you're already working inside a workbook and want quick formulas, Plan-mode previewed changes, or chart suggestions. Both can call Python — Analyst is the more autonomous version."
  - question: "What is Work IQ?"
    answer: "Work IQ is Microsoft's umbrella label for Copilot's ability to ground responses in your enterprise data — emails, chats, meetings, files, your org structure — without you having to slash-command every source manually. Behind the scenes it draws on Microsoft Graph and your tenant's index. Practically: Work IQ is why Copilot Chat 'knows' your colleagues, your team's recent work, and your file history. The better your tenant's data hygiene (clean meeting transcripts, well-named files, sensible SharePoint permissions), the better Work IQ grounds."
  - question: "GPT-5.5 Thinking vs GPT-5.5 Instant vs Claude — which model should I use?"
    answer: "Plain rule: Thinking for analysis and complex reasoning (it's slower but produces deeper chains of thought), Instant for drafting and editing (it's fast and good enough), Claude when you want a different writing style for long-form work in Word. Model choice is now exposed in Copilot Chat, Word, Excel, and PowerPoint. If you're not sure, start on Instant; switch up to Thinking the moment the answer feels shallow."
  - question: "What is Copilot Memory and how does it change prompting?"
    answer: "Copilot Memory is the feature that lets Copilot remember things across sessions — your preferences, your team, your project context, your style. Once Memory is enabled in your tenant, you stop having to re-explain who you are and what you're working on every time you open a new chat. The prompting change: you can write shorter prompts because the Context block carries forward from previous conversations. Privacy and admin-control remain — your tenant decides what Memory captures and you can clear it at any time."
  - question: "What can I do with image and voice prompts in Copilot today?"
    answer: "Across most Copilot surfaces you can now (a) paste an image and ask Copilot to read it — a chart, a screenshot, a whiteboard photo, a UI mockup — and reason from it, (b) speak a prompt rather than type it (especially useful on mobile and in Teams meetings), and (c) generate images directly inside PowerPoint via integrated image models (GPT-Image, Flux, Auto). The 'paste a chart, ask for the headline trend' move is one of the highest-leverage things you can learn this year — it works in Copilot Chat already."
  - question: "What is Copilot Pages and when do I use it instead of a Word doc?"
    answer: "Copilot Pages is a collaborative AI canvas — a shareable, real-time-editable surface that sits between a chat response and a finished document. Workflow: get a good Copilot Chat answer, click 'Edit in Pages', then iterate with teammates and Copilot together on the same Page. Use Pages when the work is meant to be collaboratively-edited but isn't quite a formal document yet. Use a Word doc when it is."
  - question: "Should I rewrite my saved prompts to use these new features?"
    answer: "Not all at once. Most of your existing GCES-style prompts still work fine. Rewrite the ones where you're frequently doing multi-source comparison (move them into Notebooks), the ones that need real numerical analysis (let Analyst run Python), and the ones that need multi-step research (give them to Researcher). Leave the day-to-day 'draft a 150-word email' prompts alone — they don't need an upgrade."
  - question: "Where do I go after this brief?"
    answer: "Pick ONE thing from the brief and try it on a real work task this week. A Notebook is the easiest start — pin 3 references and ask a cross-source question. The Field Guide and Persona Playbook on this site cover the fundamentals; the Prompt Library has ready-to-use templates. The 4-week practice plan in the Field Guide is calibrated to layer the basics first, then add 2026 features one at a time."
images: ["images/og/blog/microsoft-365-copilot-prompting-2026-whats-new.jpg"]
og_headline: "Copilot Prompting — What's New 2026"
og_glyph: "calendar"
tags:
  - prompt-engineering
  - copilot
  - microsoft-365
  - copilot-notebooks
  - copilot-agents
  - ai
sitemap:
  priority: 0.7
---

**The four-block framework still works. The Copilot it runs on has changed a lot.** This brief is the 2026 layer — Copilot Notebooks, the Researcher and Analyst agents, Work IQ, model choice, Memory, multimodal — that sits on top of the fundamentals.

If you haven't read the [Prompt Engineering Field Guide](/blog/prompt-engineering-microsoft-365-copilot/) yet, **read that first**. Everything below assumes you already know what {{< hi >}}Goal · Context · Expectations · Source{{< /hi >}} means and that iteration is a habit you already have. This brief is for people who prompt Copilot daily and want to know what's worth learning next.

<div class="post-trio">

📚 **Three posts on M365 Copilot prompting — pick where you are:**

- **🌱 [Field Guide](/blog/prompt-engineering-microsoft-365-copilot/)** — start here if you're new. Four-block framework, per-app prompts, the mistakes everyone makes.
- **🧑‍💼 [Persona Playbook](/blog/microsoft-365-copilot-by-persona-playbook/)** — your role's worked prompts. Recruiter · Ops · Finance · IT · Sales.
- **🆕 2026 Upgrade Brief (you're reading this)** — Notebooks · Researcher · Analyst · Memory · model choice. For daily prompters who want what's new.

</div>

> 🏃 **TL;DR for skimmers**
>
> Seven changes since the early Copilot days that are worth learning next:
>
> 1. {{< hi >}}**Copilot Notebooks**{{< /hi >}} — pin references once, prompt across them forever
> 2. {{< hi >}}**Researcher agent**{{< /hi >}} — delegate multi-step research tasks
> 3. {{< hi >}}**Analyst agent**{{< /hi >}} — real numerical reasoning via Python
> 4. {{< hi >}}**Work IQ**{{< /hi >}} — what Copilot grounds in automatically across your work
> 5. {{< hi >}}**Model choice**{{< /hi >}} — GPT-5.5 Thinking · Instant · Claude
> 6. {{< hi >}}**Memory**{{< /hi >}} — where enabled, Copilot can carry selected preferences and context across sessions
> 7. {{< hi >}}**Multimodal & Pages**{{< /hi >}} — paste images, speak prompts, generate visuals, collaborate on a shared canvas
>
> Pick one. Try it this week. Don't try all seven at once.

**Quick navigation:**

1. [The shift since 2024](#shift)
2. [Copilot Notebooks](#notebooks) — the multi-source workspace
3. [Researcher agent](#researcher) — task delegation, not single-turn
4. [Analyst agent](#analyst) — Python under the hood
5. [Work IQ](#workiq) — the new grounding label
6. [Model choice](#models) — Thinking vs Instant vs Claude
7. [Memory](#memory) — what changes when Copilot remembers
8. [Multimodal & Pages](#multimodal) — image, voice, generation, canvas
9. [The honest take — what's still rough](#honest)
10. [Where to start this week](#start)

<div class="living-doc-banner">

🔄 **Living document — dated 27 May 2026.** Microsoft is shipping Copilot updates roughly monthly. The framing in this brief is current as of late May 2026 — specific feature names, model versions, and UI positions will shift. The underlying shapes (Notebooks, agents, Memory, model choice) are durable. **I'm adding more UI screenshots — Researcher's final output, Analyst's final tables, the multimodal chart-read, model selector, Memory and Pages — as I capture clean ones; the text stands on its own meanwhile.** Spotted something off? [Let me know](/feedback/) and I'll update.

</div>

## The shift since 2024 {#shift}

Mid-2024 Copilot mostly felt like a one-chat-at-a-time assistant. You'd open a chat, type a prompt, get an answer, maybe iterate once or twice, then close the tab. Slash-commands existed but were mostly for one-shot file grounding. The four-block framework — Goal · Context · Expectations · Source — was the whole game.

Mid-2026 Copilot is several different things at once. A Notebook is a persistent workspace. An agent is a delegate. Memory is a backstory you don't have to retype. Work IQ is the context layer Copilot uses to understand your work graph before you manually attach a source. Model choice puts a dial in your hand. Multimodal lets you talk to Copilot with images and voice. Pages lets you and Copilot share a canvas with other humans.

Three things to hold on to as the surface keeps moving:

1. **The four blocks haven't moved.** Goal · Context · Expectations · Source is the spine. Every new surface is a different way to plug those four in. {{< hi >}}If you can write a clear brief, you can use any of this.{{< /hi >}}
2. **Iterate is still the habit.** Even with multi-step agents, the first run is a draft. The second is closer. The third is usually the keeper.
3. **You stay in the loop.** Notebooks summarise; you decide. Researcher proposes; you publish. Analyst calculates; you sense-check. Memory remembers; you can clear it. {{< hi >}}Copilot does more typing. You do more reading and judging.{{< /hi >}}

The rest of this brief is what each new thing actually does and how to prompt it.

## Copilot Notebooks — the multi-source workspace {#notebooks}

The biggest single change since 2024. Notebooks let you pin multiple references — files, Copilot Pages, OneNote pages, and other content your tenant exposes in the picker — into a shared workspace, then prompt across the whole notebook. The references stay attached across sessions. You don't re-explain them every time.

### Why this matters

Before Notebooks, every time you wanted to ask *"compare these three vendor proposals against our internal requirements doc"*, you had to attach four files, write the prompt, get the answer, then start over tomorrow if you had a follow-up. Now: pin the four references once, prompt across them today, prompt across them tomorrow, share the notebook with a colleague who can pick up where you left off.

It's the difference between {{< hi >}}prompting a chat tab and prompting a project workspace.{{< /hi >}}

### When to use a Notebook

- A project has **several relevant sources** (3 or more) you'll come back to across multiple sessions.
- You need to **cross-reference** several files at once — *"where does the discussion in /Steering meeting diverge from what /Project plan says?"*
- You want to **share a research context** with a teammate without rewriting every prompt.
- You're building **a body of work** over weeks — research, planning, ongoing analysis — and want a single home for it.

Stay in regular Copilot Chat when the question is **one-shot** and **doesn't need multi-source grounding**. Notebooks are workspace, not chat replacement.

### What it looks like — finding, creating, and using a Notebook

Notebooks is a little hidden if you've never opened it before. The five screenshots below are the whole journey — from "where is this even located" to "all my files attached and the first prompt typed".

**1. Where to find it — under the waffle.** Open the Microsoft 365 Copilot app, then click the app launcher (the 3×3 grid waffle icon at the top-right of the canvas). Notebooks sits there alongside Create, Opal and Office Agent. You can also pin Notebooks to the left rail once you've used it once — saves the waffle hunt next time.

<p><img src="/images/blog/prompting-2026/01a1-find-notebook-under-waffle.png" alt="Microsoft 365 Copilot app launcher waffle menu open showing four tiles in the top row — Create with a pink-purple gradient icon, Notebooks with a pink book icon circled in red as the destination, Opal in blue with a Frontier badge, and Office Agent in orange-purple with a Frontier badge. Below them a single More apps tile. The Microsoft 365 Copilot left navigation rail is visible behind the menu showing New chat, Search, Library, Tasks, Notebooks, Agents sections plus a Pinned label at the bottom." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**2. Name it, then create.** Give the Notebook a name that says what the project actually is — *Senior DE recruitment workspace*, not *Notebook 1*. The Select References panel that opens with the create dialog lets you pre-attach files, meetings, emails, even web pages. Pick a couple to get started; you can add more after. Then click **Create**.

<p><img src="/images/blog/prompting-2026/01a2-name-and-create-notebook.png" alt="Microsoft 365 Copilot create-notebook dialog. The title field at the top shows the typed name Senior DE recruitment workspace, underlined in red. A Select References panel below it with a hint that References are files and other content you want to work on in your notebook. Filter tabs labelled All (selected), Files, Meetings, Emails, 3 More dropdown, plus a search box, upload arrow icon, link icon, and OneDrive cloud icon. Four suggested references visible: a meeting SimplyAI meet and greet at 11:30 AM with Phill Eriksen, an external email Check in - People Leader session at Bluecurrent from Angelique Williams at 9:25 AM, a Word doc 24-Hire-handoff-template-and-example opened by you 2 hours ago, and a Word doc 05-Candidate-CV-1-Jane-Doe opened 2 hours ago. A drag-and-drop area below labelled Drag your content here instead, with supported file formats DOCX, PPTX, XLSX, PDF, and more. A blue Create button at the bottom right circled in red as the next action." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**3. Add the rest of your references.** Inside the Notebook, look for the small **+** icon next to the References header on the left rail. That opens the same picker you saw in step 2 — add the remaining files, web URLs, meeting recaps and emails one at a time, or drag a folder of files in all at once.

<p><img src="/images/blog/prompting-2026/01a3-add-references-button.png" alt="The newly-created Senior DE recruitment workspace Notebook with its left rail open. Header shows the notebook name with a pink notebook icon. Below it an Overview section, then a Created content panel containing a + New page link and a Quick create dropdown. A References section sits below with a small + icon circled in red as the add-reference button. A Suggested References panel lists three suggested files — 05-Candidate-CV-1-Jane-Doe, 01-Senior-Data-Engineer-JD, 24-Hire-handoff-template-and-exa truncated — each with a small + to add it to the notebook." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**4. All references attached — proof the workspace exists.** With every relevant file pinned, the References panel shows the full list. The Notebook can ground answers in this curated set whenever your question needs them — no more re-uploading the same files in every chat.

<p><img src="/images/blog/prompting-2026/01a4-eight-references-attached.png" alt="The Senior DE recruitment workspace Notebook left rail with 8 References attached, all listed and circled in red as a group. Reading top to bottom the list is: 16-Candidate-escalation-case-notes, 01-Senior-Data-Engineer-JD, 03-Senior-DE-intake-meeting-notes, 05-Candidate-CV-1-Jane-Doe, 06-Candidate-CV-2-John-Smith, 07-Candidate-CV-3-Priya-Patel, 09-Draft-interview-questions-need truncated, and 10-Rejection-email-template — all Word document icons. The Suggested References panel is still visible above this list. The Notebook header reads 8 References with a sort-filter control and a + icon to add more." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**5. The full Notebook workspace — the bit most people miss the first time.** With references attached, Copilot **automatically generates an Overview** in the middle of the canvas — a summary of what the notebook contains plus key insights it has already extracted across the references. You haven't even prompted yet, and you already have a synthesis. The right-rail **Ask about your content** chat is where your prompts go (this one is mid-typing). The Quick Create chips above offer one-click outputs — Audio overview, Study guide — generated from the same references. Three suggested follow-ups appear below the input box.

<p><img src="/images/blog/prompting-2026/01a5-notebook-full-with-prompt.png" alt="The full Senior DE recruitment workspace Notebook view with all 8 references attached and a prompt typed into the right-rail chat composer (circled in red). Left rail shows the 8 references list under a header reading 8 References. Centre area has two columns. Left column titled Summary with auto-generated text Senior DE Hiring Artifacts and a paragraph explaining the notebook consolidates interview design and candidate communication artifacts supporting a Senior Data Engineer hiring process emphasizing compliance fairness and consistent recruiter execution it captures a draft interview question set flagged for bias review alongside an HR-approved rejection template aligned with employment law and escalation guidance. Right column titled Quick Create with two chips Audio overview and Study guide, plus a Key Insights section under the heading Recruitment Process Readiness with two bullet points — Interview Questions Need Bias Review followed by The draft interview set explicitly flags bias risks including potentially leading and inappropriate personal questions and Proceeding without review could introduce compliance exposure and inconsistent candidate experience, and Standardized Rejection Communications with two bullets The rejection template is HR-approved prescribing tone timing and limits on individualized feedback and Standardization reduces legal risk and ensures consistent candidate treatment post-decision. Right rail labeled Ask about your content. The typed prompt circled in red reads summarise their alignment with the criteria the hiring manager said were most important in the intake meeting. Output a 3-column table: Criterion · Best-matching candidate evidence · Where evidence is missing or unclear. Cite each row. Do not rank, do not recommend, do not score. Flag any criterion where the intake meeting and the JD say different things. A blue send arrow at the bottom right. Three quick prompts visible below the input — Create a status report for this notebook, Draft an abstract with 5 citations listed from my References, and Describe common themes in my notebook." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

> 📎 **The "free Overview" is the underrated unlock.** Most demo videos jump straight to typing a prompt. Worth pausing on the auto-generated Overview and Key Insights — Copilot has *already* synthesised across all 8 references just because they're pinned. That's a free first draft of "what's in this body of work" before you've asked anything.

### How a Notebook prompt is shaped

Notebook prompts have the same four blocks underneath but lean heavily on **cross-source comparison** patterns. A few that work consistently:

> *"Compare /Vendor A proposal · /Vendor B proposal · /Vendor C proposal against /Internal requirements. For each requirement, output a row showing how each vendor addresses it (with a citation). Flag any requirement where no vendor has a clear answer."*

> *"Pull the notes from /Last Thursday's product strategy meeting and compare against /Project status summary page. Where did the discussion diverge from what's written down, and what got decided that hasn't been captured yet?"*

> *"What key dates were agreed in /Project email thread, and how does that compare to the dates in /Timeline page in this notebook? Flag any mismatch."*

> *"Across everything pinned to this notebook, what are the three biggest disconnects between what /Board deck says our priorities are and what the project team is actually doing? Cite each disconnect from a specific source."*

Notice the pattern: **gap analysis, mismatch detection, cross-source synthesis**. That's what Notebooks unlock that single-chat prompts struggle with.

Here's what that first prompt actually returns — the alignment table for Jane Doe (Copilot works through each of the three candidates in turn, one structured section per CV):

<p><img src="/images/blog/prompting-2026/01b-notebook-cross-source-table.png" alt="Microsoft 365 Copilot Notebook chat response showing a structured 3-column table for Jane Doe with the heading Jane Doe (from 05-Candidate-CV-1-Jane-Doe.docx) and a small file-icon attribution chip. The table columns read Criterion, Best-matching candidate evidence, and Where evidence is missing or unclear. Four visible rows. Row 1 — Production Python + SQL (must-have) — Evidence: Lists Python (advanced) and SQL (advanced), notes first production Python and SQL role and senior DE work leading warehouse rebuild with a +2 citation chip. Missing: CV doesn't explicitly say written and reviewed at this level but indicates senior responsibilities and advanced skill level with a +1 citation chip. Row 2 — Cloud data platform experience (Azure ideal; AWS/GCP acceptable) (must-have) — Evidence: Led rebuild on Azure Synapse + dbt; skills include Azure Synapse and Azure Data Factory with a +2 citation chip. Missing: None noted for cloud platform requirement; Azure experience is explicit with a +1 citation chip. Row 3 — Transformation framework (dbt) (must-have) — Evidence: Explicit quote rebuild ... on ... dbt; skills list dbt (production) with a +2 citation chip. Missing: No gaps noted with a +1 citation chip. Row 4 — Mentoring track record (not optional) (scope truncated by scroll) — Evidence partly visible: Mentored 3 mid-level engineers; two promoted to (truncated). Missing partly visible: CV describes mentoring but doesn't clearly state formal (truncated). A scroll-down arrow indicator visible at the bottom of the response signalling more rows below, and a Message Copilot input box at the very bottom of the panel." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**Three things to notice in this output that come straight from the four-block prompt:**

1. **Citation chips on every cell.** Each fact has a paperclip icon linking back to the source paragraph in the CV or JD — auditable, not hand-wavy. The `+2` chip means Copilot is grounding that claim in 2 source paragraphs across the references.
2. **Honest "Missing or unclear" column.** Where the CV doesn't say something the JD asks for, Copilot calls it out instead of inventing. That's the signal a recruiter takes into the screen call.
3. **No ranking, no recommendation, no score.** The guardrails in the prompt (*"Do not rank, do not recommend, do not score"*) hold. The judgment about who to interview next stays with the recruiter — Copilot just made the reading 10× faster.

### Outputs from a Notebook

A Notebook isn't just an input surface — it generates **outputs** too. The current support docs call out that Notebook outputs are evolving (no full image generation or data visualisation inside Notebooks *yet*, and grounding is limited to references you've added), but in practice you can produce:

- A **Word document** for a formal write-up
- A **PowerPoint deck** outline for a meeting
- Structured **summaries, tables, and reports** grounded only in your pinned references
- An **audio overview** — a short narrated summary of the notebook's contents (useful for catching up on the commute)
- A **study guide** — Q&A format for revising the material

Some tenants surface richer "Quick create" options (mind maps, infographics) as the experience rolls out. Treat anything beyond text-first outputs as evolving — and validate against Microsoft Support's current Notebooks page before promising it to a customer.

### The Notebook gotcha worth knowing

A reference is only as good as its indexing. If you pin a file you just saved to SharePoint, **wait a few minutes** — fresh files can take time to be indexed. If a prompt returns "no relevant information found" but you know the answer is in a pinned source, the indexer probably hasn't caught up yet. Try again in a few minutes, or attach the file directly to the prompt instead.

## Researcher agent — task delegation, not single-turn {#researcher}

Researcher is a first-party Copilot agent built for **multi-step research**. You give it a task brief — a scope and an outcome — and it plans the steps itself, runs them across your work data and the public web, synthesises, and produces a structured deliverable.

### How Researcher's prompts differ

A regular Copilot Chat prompt is **single-turn**: ask, answer, iterate. A Researcher prompt is a **task brief**: scope, sources, what good looks like. Researcher then does the steps itself — you don't iterate every one.

Compare:

> ❌ **Regular Copilot prompt:** *"Summarise the cloud migration market."*  
> You get a one-paragraph generic answer.

> ✅ **Researcher task brief:** *"Research the current competitive landscape for our cloud migration product. Use /Internal battle cards, /Our product overview, and the public web. Produce a 3-page briefing — sections: Top 5 competitors with their positioning · Where we win and where we don't · Three customer-asks we've heard repeatedly that we don't currently address · Recommended angles for our next campaign. Cite every claim. Flag anything you can't verify."*  
> Researcher plans the steps, runs them, and returns the structured briefing — with citations.

Here's what the Researcher agent actually looks like inside Microsoft 365 Copilot — note the **"Sources include"** chip strip just under the agent name: Web, Agents, Adobe Experience Manager Sites, Azure DevOps, *and 10 more sources*. The agent has access to a broader source set than regular Chat. The same task brief from above sits in the composer, ready for the **Research** button (not the usual Send arrow — Researcher uses its own action button).

<p><img src="/images/blog/prompting-2026/02a1-researcher-agent-card.png" alt="Microsoft 365 Copilot Researcher agent card. Purple-blue Researcher icon on the left. Title Researcher in large text. Created by Microsoft with a verified-tick badge. A Sources include row listing four icons with labels — Web (globe), Agents (purple sparkle), Adobe Experience Manager Sites (red A), Azure DevOps (cloud) — followed by the text and 10 more sources with a View sources link. Below the header card sits the prompt composer with the full talent-market research brief typed in: Research the talent market for Senior Data Engineers in New Zealand and Australia in 2026. Use only public sources — LinkedIn Talent Insights public reports, public NZ/AU technology salary surveys (Hays, Robert Half, Talent.com), Stack Overflow Developer Survey 2026, and Microsoft Tech Community blog posts on Azure data skills. Produce a 1-page hiring brief — Section 1: Salary ranges (cite source for each range). Section 2: In-demand technical skills for Senior DEs in 2026 (cite each). Section 3: Top 3 hiring trends affecting time-to-hire in this region. Section 4: Two specific recommendations for our internal recruitment team. Cite every claim with a URL. Flag anything you can't verify from the listed sources. A plus button on the left of the composer, a microphone icon on the right, and a circular Up-arrow send button to the far right. Below the composer two tabs labelled Research (selected, pill-style) and Sources." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

### When to use Researcher

- The question is **multi-step** — you can imagine breaking it into 4-8 sub-tasks yourself.
- The answer needs **a structured deliverable** — a briefing, a deck outline, a competitive analysis, an exec summary — not a one-paragraph reply.
- The sources span **work + web** — you want internal context grounded by external signal.
- You'd happily wait **a few minutes** for a thorough answer rather than 30 seconds for a surface one.

Skip Researcher for quick one-liners. You're paying complexity tax you don't need.

### A worked Researcher brief

> *"Research what our top 5 enterprise customers have publicly said about AI adoption in the last 12 months. Use /Our customer list and the public web (their blogs, press releases, public talks, LinkedIn posts from their executives). Output a structured briefing — one section per customer, each section covering: stated AI priorities · public investments announced · any AI partnerships disclosed · the named exec talking publicly · two questions our account team could ask next quarter to deepen the conversation. Cite every claim. Flag where the source signal is thin."*

The brief is doing the work the prompt frame used to do — but at a higher altitude. Goal, Context, Expectations, Source are all there. The scope is bigger.

**The moment Researcher is genuinely different from regular Chat:** as soon as you submit the brief, Researcher **plans its own steps** before doing any of them. Below is what that looks like for the talent-market brief above. Seven planned steps. Step one (Collecting salary range data) is active; the rest are queued. The status line at the bottom (*Clarifying data sources…*) is what Researcher is currently working on — a sub-step inside step one. {{< hi >}}This is what "task delegation, not single-turn" looks like in practice — you don't iterate every move; Researcher iterates its own moves and reports back.{{< /hi >}}

<p><img src="/images/blog/prompting-2026/02a2-researcher-step-plan.png" alt="Microsoft 365 Copilot Researcher agent in-flight Plan card. Header reads Researcher with the purple-blue Researcher icon. A boxed Plan card lists seven steps in order. Step 1 — Collecting salary range data — shown with a solid circle indicating it is the active step. Step 2 — Identify in-demand technical skills for Senior Data Engineers in 2026 from public reports — dashed-circle queued indicator. Step 3 — Research top 3 hiring trends affecting time-to-hire in New Zealand and Australia — queued. Step 4 — Develop two specific recommendations for the internal recruitment team — queued. Step 5 — Compile all findings into a 1-page hiring brief with citations — queued. Step 6 — Review the brief for clarity, accuracy, and adherence to word count — queued. Step 7 — Flag any claims that cannot be verified from the listed public sources — queued. Below the steps a divider and a status line in greyed italic text reading Clarifying data sources… with a small right-arrow chevron indicating a sub-step is in progress. A black circular Stop button visible at the right end of the status line to interrupt the run." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

> 📎 **Catch this moment in a customer demo.** *"I gave it one brief. It planned seven steps for itself. I can leave it running while I do something else — then come back and inspect the brief and the sources it used."* That single sentence resets the audience's mental model from *"AI chatbot"* to *"AI delegate"*.

**What the final output looks like** — once Researcher completes the 7 steps, you get a structured report: headings per section (Salary ranges · In-demand skills · Hiring trends · Recommendations), cited claims with clickable source URLs, and any items Researcher couldn't verify clearly flagged. *(Final-output screenshot coming once I've captured a clean one — the prompt pattern above is the part to copy today.)*

### Researcher gotchas

- **Don't ask Researcher to decide.** Same rule as everywhere else. It produces a briefing. You decide what to do with it.
- **Cite-everything is non-optional.** A Researcher output without citations is unverifiable. Always include *"Cite every claim. Flag anything you can't verify."* in the brief.
- **Scope it tight.** Vague scopes ("research AI") produce vague briefings. Specific scopes ("research what our top 5 enterprise customers have said about AI in the last 12 months") produce useful briefings.

## Analyst agent — Python under the hood {#analyst}

Analyst is the data-analysis specialist agent. It runs **Python under the hood** to do real numerical reasoning — calculations, trend detection, statistical comparisons, anomaly spotting — across data you attach. The math is actually executed in Python, not approximated by a language model.

### Why this changes the prompting

A language-model-only answer to *"what's the total of column C in this CSV?"* is a guess. A good guess, maybe — but a guess. Analyst runs the SUM in Python and returns the actual number. That single shift — from approximated math to executed math — is the entire point.

### When to use Analyst

- The question is **genuinely numerical** — sums, averages, percentages, distributions, trends.
- The data isn't already **in a clean Excel sheet** — it's a CSV export, a folder of monthly reports, a BI dataset export, a JSON file.
- You want the agent to **show its work** — Analyst typically explains what it did, which is exactly what you want when validating.
- You need **repeatable answers** — re-run the same prompt, get the same number, not a fresh hallucination.

Use Excel Copilot instead when you're already inside a workbook and want quick formulas, chart suggestions, or Plan-mode previewed changes. Use Analyst for the data that hasn't found its way into Excel yet.

### A worked Analyst brief

> *"Using /Q1 sales export CSV and /Q2 sales export CSV, calculate (1) total revenue per region per quarter, (2) percentage growth Q1→Q2 per region, (3) the top 5 customers by revenue across both quarters combined. Output as three tables. For each calculation, briefly explain the method so I can verify. Flag any data quality issues you find — missing values, duplicates, inconsistent formatting — before doing the math."*

Notice the **"flag data quality issues before doing the math"** line. That's the difference between a calculated number you trust and one you don't.

Here's what that looks like in Microsoft 365 Copilot — Analyst as the active agent, both xlsx files attached (the funnel data and the boomerang export), and the full task brief typed and ready to go. Note the three quick-action chips below the composer (*Analyze data · Get insights · Visualize*) — Analyst is positioned as a data specialist, not a general chat.

<p><img src="/images/blog/prompting-2026/03a1-analyst-prompt-and-files.png" alt="Microsoft 365 Copilot Analyst agent view. Analyst icon (purple-blue stylised chart) and Analyst title at top centre. A banner reads Uploading from device will send a copy to OneDrive (work/school) with a Manage uploads link, circled in red. Two attached file chips below the banner, both circled in red — 17-Recruitmen... (Excel green icon) and 20-Boomeran... (Excel green icon). Below the file chips the full Analyst task brief is typed into the composer in body text: Using the two attached files (Q2 recruitment funnel data + last 12 months of boomerang candidates), do four things in this order. (1) FIRST flag any data quality issues you find — missing values, inconsistent formatting, suspicious numbers, duplicates — before doing any analysis. (2) From the Q2 funnel data, calculate conversion rates between each consecutive stage of the funnel, and identify the stage with the biggest drop-off. Show the Python or method so I can verify. (3) From the boomerang data, identify the top 3 reasons candidates were rejected the first time around, and whether those reasons changed across the 12 months. (4) Two recommendations for the recruitment team to test next quarter — grounded in the data, not generic. Output as structured tables. Plain English commentary, no marketing language. Do not invent reasons not supported by the data. A plus button on the left of the composer, a microphone icon on the right, and a circular Up-arrow send button to the far right circled in red. Below the composer three quick-action cards: Analyze data — What are the trends you see in the uploaded files, Get insights — What are some quick insights about the data from the..., and Visualize — Create a table with the volume of planets, add a column to..." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**And the moment that proves Analyst is fundamentally different from a chat:** as soon as you send the brief, you see *"Coding and executing"* — Analyst is running **real Python** on your data, and showing you the code. Not approximated math. Not language-model guessing. Actual `pandas.read_excel`, actual code you can read and verify. {{< hi >}}The numbers are more trustworthy because the calculation is executed, not guessed — but you still need to check the file, the columns, the filters and the assumptions before you trust the answer.{{< /hi >}}

<p><img src="/images/blog/prompting-2026/03a2-analyst-python-executing.png" alt="Microsoft 365 Copilot Analyst response in flight. Two attached file chips visible at the top right of the chat thread — 17-Recruitment-funnel... and 20-Boomerang-candid..., both small green Excel icons. The user's task brief shows in a grey card just below, truncated with a chevron-down expand control. Below the user message, an Analyst label appears with the Analyst purple-blue chart icon. Underneath the Analyst label, a status line reads Coding and executing followed by a right-chevron arrow indicating the step in progress. Beneath the status line, a code-block card titled Python with a copy button at the top right. The code block shows two lines of actual Python: line 1 df_boomerang2 equals pd.read_excel open paren file2 comma sheet_name equals quote Atlas notes quote comma engine equals quote openpyxl quote close paren, and line 2 df_boomerang2.head() comma df_boomerang2.info() — pandas read-excel and head info calls, real executable code." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

> 📎 **Demo moment.** *"Watch the 'Coding and executing' line. That's not Copilot making up numbers — that's actual Python running on your data. If the recruiter wants to verify any number in the final output, click the code block, read the line that produced it, re-run it yourself."* That single beat is the trust shift — from *"AI said so"* to *"here's the code path that produced the number — now we can inspect it."*

**What the final tables look like** — once Analyst finishes the four-step brief, you get: a data-quality summary (issues found or "no major issues"), a funnel conversion table per stage with the biggest drop-off identified, a boomerang-reasons table showing the top 3 reasons + how they changed across the 12 months, and a short recommendations block grounded in the data. Every number traces back to a visible Python step. *(Final-tables screenshot coming once I've captured a clean one — the prompt pattern + method-shown discipline above is the part to copy today.)*

### Analyst gotchas

- **Always ask for the method.** *"Briefly explain the method so I can verify"* is the line that turns Analyst from black box to auditable.
- **Flag data quality first.** Always. Bad data makes pretty numbers; pretty numbers make bad decisions.
- **Re-run on real data, not samples.** A 10-row sample may behave differently from the full 10,000-row file. If the answer matters, run against the full data.

## Work IQ — the new grounding label {#workiq}

**Work IQ** is Microsoft's umbrella term for the way Copilot grounds responses in your enterprise data — emails, chats, meetings, files, your org structure — without you having to slash-command every single source manually. Behind the scenes it draws on Microsoft Graph and your tenant's index.

### What this changes about how you prompt

Before Work IQ was named as a thing, the framing was simpler — *"Copilot reads what you can read"*. The framing now is more useful: **Work IQ is a context layer that's already running**. When you open Copilot Chat and ask *"what did Sarah say about the Q3 plan last week?"*, Work IQ already knows who Sarah is (org chart), already knows which chats and emails to scan (recency + permissions), already knows your Q3 plan files exist (file metadata).

You don't have to be explicit about all that. Your prompt can be shorter.

> 📎 **Old prompt vs better 2026 prompt.**
> ❌ *"Summarise what Sarah said about Q3."*
> ✅ *"What did Sarah say about the Q3 plan last week across email, Teams, and meetings? Quote the source and link me back."*
>
> Work IQ helps find the haystack. You still tell it which needle matters and ask for the citation.

### The trade-off worth knowing

Work IQ output quality depends on your **tenant's data hygiene**. Specifically:

- **Meeting transcripts on or off** — if your org doesn't enable transcripts, Copilot can't reason across meetings, period.
- **File naming and metadata** — Copilot's index uses titles, metadata, owners. *"Final FINAL v3 copy.docx"* with no description is hard for Work IQ to surface usefully.
- **SharePoint permissions** — if everyone has access to everything (over-sharing), Work IQ returns noisier results because the haystack is bigger.
- **Old / stale content** — Work IQ doesn't know that a 2019 strategy doc is obsolete unless someone marks it so.

> 📎 **The practical move:** the highest-leverage thing IT and Ops admins can do for Copilot quality is tenant hygiene — not a new prompt or training session. Less oversharing, better file names, accurate org structure, meeting transcripts enabled. That's the Work IQ amplifier.

### Slash-command grounding is still there

Work IQ is **the default grounding layer**. Slash commands (`/file`, `/person`, `/meeting`) are **the explicit layer on top**. You still use slash commands when you want to be precise — *"use /this specific file, not whatever Copilot guesses"*. You skip slash commands when the question is broad enough that Work IQ's automatic grounding is enough.

The rule: **if the answer needs a specific source, slash it in. If the question is "what's going on with X?" — Work IQ will probably find what you need.**

## Model choice — Thinking vs Instant vs Claude {#models}

In supported tenants and surfaces, Copilot is starting to expose model choice rather than hiding everything behind one default. The exact dropdown varies by app, license, region, and admin settings. The three you'll see most often:

| Model | What it's good at | When to pick it |
|---|---|---|
| **GPT-5.5 Instant** | Speed, drafting, editing, summarising | Default — fast, good enough for most prompts |
| **GPT-5.5 Thinking** | Deeper reasoning, complex analysis, multi-step problem solving | When Instant gives you a surface answer and you want depth |
| **Claude** | Long-form writing, nuanced tone, structured argumentation | Where enabled by your admin — especially in Researcher and selected writing surfaces |

### The decision rule

- **Start on Instant.** It's the fastest, and 80% of the time it's enough.
- **Switch to Thinking** the moment the answer feels too shallow — *"analyse the trade-offs between X and Y"*, *"why did this metric move?"*, *"what are the risks I'm not seeing?"*. Thinking takes longer because it reasons longer. That's the trade.
- **Claude in Word** is worth a try when drafting something long-form and the GPT voice feels generic.

### Image models (PowerPoint)

PowerPoint Copilot now lets you pick the image model when generating visuals — **GPT-Image**, **Flux**, or **Auto** (let Copilot choose). Most of the time Auto is fine. When the generated image looks off-brand or generic, try the other models — they have different style defaults. {{< margin >}}Image generation in Copilot is still surface-level — fine for placeholder visuals, less reliable for branded artwork. Treat outputs as drafts.{{< /margin >}}

### Python mode (Excel + Analyst)

Not a "model" exactly, but the same dial: Excel Copilot now has a **Python mode** that routes calculations through real Python execution rather than language-model approximation. Use it for anything numerical that matters. Plan mode shows you the steps before running them, so you can catch errors before they touch the workbook.

> 💡 **Tip:** explicitly say *"use Python for this"* in an Excel Copilot prompt for any calculation you don't want approximated. The Plan mode preview will then show you exactly what's about to run.

## Memory — what changes when Copilot remembers {#memory}

Where enabled by your tenant, Copilot Memory lets Copilot retain selected context across sessions — your preferences, your team, your project, your style — rather than starting from scratch every chat. Memory rollout is **tenant-controlled and currently in preview** in most environments, so availability depends on your IT setup. When it's enabled in your tenant, the prompting workflow shifts.

### The before / after

**Before Memory:** every chat starts blank. You retype context every time. *"I'm Sush, I lead pre-sales for M365 Copilot in NZ, my regular customers are X, Y, Z..."* — for every prompt that needs the context.

**With Memory:** Copilot remembers you said that yesterday. New chat opens with the context already there. Your prompts get shorter because the **Context** block in the four-block framework carries forward.

> *"Continue working on the migration brief for Customer A. Same tone as the last one. Pull in the latest from /Customer A account chat."*

That prompt is one line because Memory already knows who Customer A is, what tone "the last one" had, and which account chat to look at.

### The discipline Memory requires

- **Tell Copilot what to remember.** *"Remember that I always send drafts to my manager first before customers."* — that's a Memory write. Then it just happens.
- **Tell Copilot what to forget.** *"Forget what I told you about Project X — it's been cancelled."* — keeps Memory current. Stale memory is worse than no memory.
- **Audit periodically.** Microsoft typically exposes a Memory management surface in the Copilot app — review what's been captured, clear what's wrong. Your tenant's admin may also have settings.

> 📎 **Privacy note:** Memory respects the same data boundary as the rest of Microsoft 365 Copilot — your tenant. Memory is not training data. But it IS a stored representation of preferences and context, so treat it the way you'd treat any work-context store: review it, clear what doesn't belong.

> 📎 **Admin / detail worth knowing.** Microsoft currently documents Copilot personalisation and memory as **preview**. Memories are stored in the user's Exchange mailbox (a hidden folder), Enhanced personalisation is on by default unless your admin turns it off, retention labels do not apply to memory, and saved memories are kept until the user deletes them. So don't treat Memory as magic short-term chat context — treat it as **managed work context** that lives where your other Exchange data lives, with admin and user controls over it.

### Memory gotchas

- **Memory doesn't mean Copilot has read your entire history.** It captures what it's told to or what's been raised as significant. It's a context store, not an omniscient log.
- **Don't assume cross-session continuity until you've verified Memory is on for you.** If it's not enabled in your tenant, your prompts still start blank. The four-block framework saves you here — type the Context block explicitly.

## Multimodal & Pages — image, voice, generation, canvas {#multimodal}

Several smaller features that compound when used together.

### Paste an image, ask a question

Copilot now accepts pasted images as part of a prompt across most surfaces. Highest-leverage examples:

- **A chart screenshot** → *"What's the headline trend here, and what's the question I should be asking my team about it?"*
- **A whiteboard photo** → *"Turn this into structured meeting notes — decisions, action items, open questions."*
- **A UI mockup** → *"Critique this from a usability perspective — what's confusing, what's missing, what's good?"*
- **A handwritten page** → *"Transcribe this and structure it as a project plan."*
- **A photo of a printed document** → *"Extract the key terms and summarise."*

The pattern is the same as text prompts: Goal · Context · Expectations · Source — the image is the source.

### Speak a prompt

Voice input is rolling out across Copilot surfaces — already in the mobile app, in Teams meetings, and increasingly on desktop. Use cases that pay off:

- **Mobile + ground-while-walking** — "Copilot, using last week's leadership recap, draft me an update for the board."
- **In a meeting** — capture a thought into Copilot without typing.
- **When typing is slow** — voice into a draft, then iterate in text.

Voice is most useful when **combined with grounding**. Pure voice without a source is fine for brainstorming; voice + a grounded file is where the actual work gets done.

### Generate an image

PowerPoint Copilot now generates images directly into your deck. Image generation is also appearing in Copilot Chat experiences, depending on your tenant and rollout. The prompting pattern:

> *"Generate a simple illustration for a slide titled 'Migration journey'. Style — minimalist, flat, brand colours navy and amber, no people, no text in the image."*

The "no text in the image" line is genuinely useful — image models still struggle to render text reliably. Tell them not to try.

### Copilot Pages

Pages is a **collaborative AI canvas**. Workflow:

1. Get a good Copilot Chat answer.
2. Click **"Edit in Pages"**.
3. The content opens in a shared real-time document.
4. Invite teammates. Continue iterating with Copilot inside the Page.

Use Pages when the work is collaborative-in-progress — not yet a formal Word doc, more than a chat answer. The killer pattern: a Copilot Chat answer becomes a Page → exec previews it → comments inline → Copilot drafts revisions → final version exports to Word for distribution. Less email back-and-forth, more shared canvas.

## The admin / power-user layer I'm not covering here {#not-covered}

Three things deliberately scoped out of this brief because they each deserve their own post — but worth naming so you know they exist:

- **Copilot Control System** — the tenant-level admin layer that governs Memory, connectors, agents, model choice, image generation, and Prompt Gallery pinning. If your tenant is doing Copilot seriously, this is the surface IT and security own.
- **Agent Builder · Copilot Studio · declarative agents** — the step after prompting. Once you have a prompt pattern that works, it becomes a *reusable* agent your team triggers without re-writing the prompt every time. The [M365 Agent Builder field guide](/blog/m365-agent-builder-explained/) on this site covers the no-code path.
- **Connectors and plugins** — Copilot now reads from LSEG, HubSpot, ServiceNow, Confluence, Salesforce, Notion-style data sources via federated connectors and the Model Context Protocol. Work IQ is extensible through these — it's not just M365 data any more.

These belong on your roadmap once the seven shapes in this brief feel comfortable. They're how Copilot stops being a personal productivity tool and starts being a tenant-wide capability.

## The honest take — what's still rough {#honest}

Worth saying because the marketing won't.

- **Notebooks indexing lag is real.** A reference pinned 5 minutes ago may not be fully searchable. Patience.
- **Researcher and Analyst can be slow.** Multi-step tasks aren't 30 seconds. Brief them well and walk away — don't refresh every 10 seconds.
- **Work IQ depends on tenant hygiene.** In an over-shared, under-curated tenant, Work IQ surfaces noise. That's a tenant problem, not a prompting problem.
- **Model choice can be flaky.** Sometimes Thinking is no deeper than Instant on a particular prompt. Try both. Pick the one whose answer you actually use.
- **Memory rollout varies.** If your tenant doesn't have Memory enabled, the *"new prompts will be shorter"* promise doesn't apply yet. Type the Context block explicitly.
- **Image generation still struggles with text inside images, hands, faces, and brand-specific style.** Use for placeholder visuals; commission real artwork for anything customer-facing.
- **Voice prompting can mis-transcribe.** Always glance at what was transcribed before you hit Send. Especially in noisy environments.
- **The feature names will change again.** Notebooks may become Workspaces. Researcher may rebrand. Work IQ may absorb other names. The shapes are durable; the labels are not.

None of these mean the features aren't worth using. They mean **stay sceptical, validate outputs, treat first drafts as drafts**, the same way you'd treat any junior colleague's first attempt.

## Where to start this week {#start}

Pick **one** of these. Try it on a real work task. Iterate. Notice the difference. Add another next week.

| Try this week | If you... |
|---|---|
| **Spin up your first Notebook** — pin 3 references and ask one cross-source question | Frequently re-attach the same files to different chats |
| **Brief Researcher** with one structured research task | Have a research-prep ritual that eats 2+ hours every week |
| **Hand Analyst a CSV** and ask for a specific calculation with method shown | Do recurring numerical analysis outside Excel |
| **Pick Thinking** for the next analysis-style prompt that goes shallow on Instant | Notice your prompts often need iteration because Copilot answers too quickly |
| **If Memory is enabled** — tell Copilot one durable preference about how you work | Find yourself re-explaining the same context every chat |
| **Paste an image** into Copilot Chat and ask for a headline read | Work with a lot of charts, screenshots, or whiteboards |
| **Open a Page** from your next good Chat answer | Often turn chat answers into shared docs anyway |

Don't try all seven at once. The four-block framework took most people a week to internalise — adding new features at the same speed is the right pace.

> 💡 **Track what compounds.** Same advice as the Field Guide: a one-line journal note at the end of each day in week one. *"Today I used X — it saved me Y minutes / I'd never have noticed Z without it / it didn't really help, I'll skip it next time."* By week three you'll know which 2-3 of these seven are actually compounding in your workflow. The rest you can park.

## Where to go next {#next}

This brief is the 2026 layer. The fundamentals are in the hub:

- 🌱 **[Prompt Engineering for Microsoft 365 Copilot — A Plain-English Field Guide](/blog/prompt-engineering-microsoft-365-copilot/)** — the four-block framework, per-app tips, the mistakes everyone makes. Read this first if you haven't.
- 🧑‍💼 **[Microsoft 365 Copilot — A Playbook for 5 Personas](/blog/microsoft-365-copilot-by-persona-playbook/)** — role-specific worked prompts. Recruiter · Ops · Finance · IT · Sales.

Also on this site:

- 📚 **[The Prompt Engineering Guide](/prompt-guide/)** — 8 deeper techniques, hands-on practice for each.
- 🧪 **[The Advanced Prompt Lab](/prompt-lab/)** — 12 expert techniques (Chain of Thought, Tree of Thought, ReAct, Meta-Prompting, etc.) for when the four blocks aren't enough.
- 📋 **[The Prompt Library](/prompts/)** — 500+ tested prompts. Filter by app and persona.
- 🎯 **[The Prompt Polisher](/prompt-polisher/)** — paste your prompt, get a score and a better version.
- 🧪 **[The Prompt Tester](/prompt-tester/)** — A/B compare two prompts.

**Microsoft references:**

- [Microsoft 365 Copilot Prompt Gallery](https://adoption.microsoft.com/en-us/copilot/prompt-gallery/) — Microsoft's curated public prompt library.
- [Microsoft Learn — Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview)
- [Microsoft Tech Community — Microsoft 365 Copilot blog](https://techcommunity.microsoft.com/category/microsoft365copilot/blog/microsoft365copilotblog) — monthly *What's New* posts. The single best place to track feature rollouts.

**Related guides on this site:**

- [Copilot Pro vs Microsoft 365 Copilot — Which Do You Need?](/blog/copilot-pro-vs-microsoft-365-copilot/)
- [How Microsoft 365 Copilot Works, Layer by Layer](/blog/how-microsoft-365-copilot-works-layer-by-layer/)
- [M365 Agent Builder — Plain-English Field Guide](/blog/m365-agent-builder-explained/)

---

✎ **One more thought.** The feature list above will look dated in twelve months. The pattern won't. **Microsoft is moving Copilot from a single-turn chat into a stack of collaborative AI surfaces — workspaces, agents, memory, multimodal canvases.** Each one is just another way to plug in the same four blocks.

The skill that compounds isn't memorising the features. It's getting fluent at writing a clear brief — and recognising which surface that brief belongs on. Hub for the brief. This page for the surface. Persona Playbook for the worked role-specific examples.

Try one thing this week. See what changes. Come back when something new lands.

— Sush

## FAQ {#faq}

The questions I hear most about the 2026 Copilot prompting layer.
