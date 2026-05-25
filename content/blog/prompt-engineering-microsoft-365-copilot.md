---
title: "Prompt Engineering for Microsoft 365 Copilot — Field Guide"
description: "Brief Microsoft 365 Copilot like a capable new colleague. Microsoft's 4-block framework, slash-command grounding, per-app prompts, mistakes to avoid."
date: 2026-05-25
lastmod: 2026-05-25
card_tag: "Prompt Engineering"
tag_class: "ai"
layout: "notebook"
stamp: "field guide"
intro_note: "↗ started as a handout for one recruitment conversation. Realised it was useful well beyond that room."
founder_note: |
  Prompt engineering is the most mis-named skill in AI right now. It sounds like it needs a computer-science degree. It doesn't. It's just learning how to brief Copilot properly — the way you'd brief any capable new colleague on day one.

  I had to look this up three times before it clicked. Then I taught it to a recruitment team, a finance team, an operations team, my mum (a teacher). Same four-block framework. Same patient explanation. Same lightbulb moment.

  Honest take? Most people overcomplicate this. The official Microsoft framework is four blocks. Add one habit on top — iterate — and you have a working skill in an afternoon. The rest of this post is the slow, plain-English version of those five things, plus the per-app tips that took me longer to learn than I'd like to admit.

  If you only have ten minutes, jump straight to the [Cheat Sheet](#cheat-sheet) — print it, screenshot it, stick it next to your monitor. You'll come back to the deeper sections when you hit a wall.
faq:
  - question: "What is prompt engineering?"
    answer: "Prompt engineering is the skill of writing clear, useful instructions for an AI tool like Microsoft 365 Copilot. It's not coding — it's communication. The clearer your brief, the better the answer. Microsoft's official framework breaks a good prompt into four blocks: Goal, Context, Expectations, and Source. Master those plus the habit of iterating and you have the skill."
  - question: "Do I need to be technical to learn this?"
    answer: "No. Prompt engineering is about writing clear English (or any other language) — not code. If you can brief a new colleague, you can prompt Copilot. The hard part for most people is being more specific than they're used to being, not anything technical."
  - question: "What's the difference between Microsoft 365 Copilot Chat and Copilot inside Word or Excel?"
    answer: "Microsoft 365 Copilot Chat (at microsoft365.com/chat) is the general-purpose chat surface — best for reasoning across files, emails, meetings, and the web. Copilot inside Word, Excel, PowerPoint, Outlook and Teams is task-specific — best for things tied to the document or message you have open. Use Chat when you need to reason across multiple sources. Use the in-app Copilot when the task is rooted in one file."
  - question: "Can Copilot read my work emails and files?"
    answer: "Microsoft 365 Copilot (the licensed version your employer pays for) can — within the limits of your existing permissions. It only sees what you can already see. Copilot Pro (the personal $20 version) cannot — it only works with your personal files. The free Copilot Chat does not read your work data at all."
  - question: "What is a slash command?"
    answer: "A slash command is the / character followed by a file, person, meeting, or chat name. It tells Copilot exactly which document or context to ground its answer in. For example, '/Q3 report' tells Copilot to use that specific file as the source. Slash commands are grounding — they're not a separate Copilot mode, they're how you point Copilot at the right material. Availability varies by Copilot surface and tenant configuration — when slash auto-complete doesn't appear, the file picker or 'Add files' button does the same job."
  - question: "Will my Copilot prompts stay private?"
    answer: "If you use Microsoft 365 Copilot at work, your prompts stay inside your organisation's tenant boundary. Microsoft does not use them to train AI models. Free consumer Copilot is different — read the privacy terms before pasting anything sensitive. As a rule: never paste personally identifiable information, customer data, or anything regulated into a consumer AI tool."
  - question: "Can I let Copilot make decisions for me?"
    answer: "No. Copilot is a drafting and reasoning assistant — not a decision-maker. Use it to summarise, structure, draft, compare, and flag. Use a human to decide. This is especially important in hiring, performance, financial and legal contexts where AI must not be the sole basis for a decision."
  - question: "How long should a prompt be?"
    answer: "Long enough to remove the guesswork — usually 2-5 sentences. A specific 30-word prompt beats a vague 200-word one every time. The point is not length, it's clarity. If your prompt could mean ten different things, Copilot will pick one at random."
  - question: "Why does Copilot sometimes get things wrong?"
    answer: "Three main reasons. (1) The model doesn't actually know your facts unless you ground it with /file or other sources. (2) The prompt was too vague and Copilot guessed. (3) The model genuinely got it wrong — language models hallucinate. The fix for (1) and (2) is better prompting. The fix for (3) is to always validate output before you publish it."
  - question: "Where do I go next after this guide?"
    answer: "Practise the four-block framework on real work tasks for a week. Then explore the deeper techniques in the Prompt Guide and Prompt Lab on this site, the 500-prompt library for ready-to-use templates, and the Prompt Polisher to score your own prompts. For role-specific examples — recruitment, ops, finance, IT, sales — see the companion Persona Playbook."
images: ["images/og/blog/prompt-engineering-microsoft-365-copilot.jpg"]
og_headline: "Prompt Engineering for Copilot"
og_glyph: "layers"
tags:
  - prompt-engineering
  - copilot
  - microsoft-365
  - copilot-chat
  - ai
sitemap:
  priority: 0.9
---

**Prompt engineering is just learning how to brief Microsoft 365 Copilot properly.** That's the whole skill. Not magic, not coding, not a course. A working brief.

I had to look this up three times before it clicked. Then I taught it to a recruitment team, a finance team, an operations team. Same four blocks every time. Same lightbulb moment. So this is the slow, plain-English version of the brief I wish someone had handed me on day one.

> 🏃 **TL;DR for skimmers**
>
> Microsoft 365 Copilot is a **capable new colleague on day one**. Strong at language, fast at drafting, knows nothing about your company until you tell it. Your job is the brief.
>
> Microsoft's official prompt framework is four blocks: {{< hi >}}**Goal** · **Context** · **Expectations** · **Source**{{< /hi >}}. Add one habit on top: **iterate**. That's the whole skill.
>
> Start here: [Cheat Sheet](#cheat-sheet) · [4-block framework](#four-blocks) · [Per-app prompts](#apps) · [10 mistakes](#mistakes)

**Quick navigation:**

🚀 **Start here (10-min read):**

1. [Mental model — a capable new colleague](#mental-model)
2. [One working prompt — before & after](#first-prompt)
3. [The Cheat Sheet](#cheat-sheet)
4. [The 4-block framework](#four-blocks)
5. [The habit that makes the framework work — iterate](#iterate)

📚 **Deep dives:**

- [Where you can prompt — Chat vs the apps](#where)
- [The grounding unlock — slash commands and file pickers](#grounding)
- [Before you paste anything into Copilot](#privacy)
- [App-by-app quick wins](#apps) — [Chat](#app-chat) · [Word](#app-word) · [Excel](#app-excel) · [PowerPoint](#app-pp) · [Outlook](#app-outlook) · [Teams](#app-teams) · [OneNote](#app-onenote) · [Loop](#app-loop)
- [10 prompt mistakes to avoid](#mistakes)
- [The honest take — what Copilot won't do](#honest)
- [3 real scenarios](#scenarios) · [4-week practice plan](#practice) · [Where to next](#next)

<div class="living-doc-banner">

🔄 **Living document.** Microsoft 365 Copilot ships changes monthly. The four-block framework and the underlying skills don't move — but a button position, a feature name, or a specific slash command may have shifted by the time you read this. Spotted something off? [Let me know](/feedback/) and I'll update.

</div>

## The 30-second mental model — a capable new colleague {#mental-model}

Picture this. You've just hired someone brilliant. First language is English, can read fast, can write in any tone, can find patterns in numbers, can summarise a 40-page document in two minutes. The catch: it's day one. They know nothing about your company, your team, your style, your customers, your filing system or your acronyms.

If you want a useful piece of work from them, you'd give them a proper brief. A specific task. Some background. What good looks like. The right documents to read. You'd review their first draft and ask for a second.

That's the whole job of a prompt. {{< hi >}}A prompt is a brief for a capable new colleague who knows nothing about your world.{{< /hi >}}

Hold that picture. The rest of this guide just unpacks it.

```mermaid
flowchart LR
    A["You"] -->|"Brief"| B["Copilot<br/>(capable<br/>new colleague)"]
    B -->|"First draft"| C{"Good<br/>enough?"}
    C -->|"No — coach"| A
    C -->|"Yes"| D["You review<br/>and decide"]
    D --> E["Use it"]
```

Notice what Copilot does **not** do in that diagram. It doesn't decide. It doesn't publish. It doesn't email customers on your behalf without you seeing it. You stay in the loop because you're the human and you have the judgment. Copilot does the typing and the structuring — fast.

{{< margin >}}This is the whole reason "AI replaces jobs" is the wrong frame. AI replaces the typing. Judgment is still the job.{{< /margin >}}

## One working prompt — before and after {#first-prompt}

Before we go deep on theory, let's prove the skill exists. Here are two prompts asking for the same thing. Try them in your Copilot Chat right now if you have it.

> ❌ **Before (vague):**
>
> *"Write me something about the project."*

You'll get something. Probably a generic 200 words about "the project" that could apply to any project anywhere. Not useful.

> ✅ **After (briefed properly):**
>
> *"Draft a 200-word status update for the customer migration project, aimed at the steering committee. Use the meeting recap from yesterday and the risk log from last week. Lead with the three biggest risks, then this week's wins, then next week's asks. Plain English, no jargon, no marketing tone."*

Now you'll get something useful on the first try. Notice what changed:

- **Goal:** Draft a 200-word status update
- **Context:** Customer migration project, steering committee audience
- **Expectations:** Lead with risks, then wins, then asks. Plain English, no jargon.
- **Source:** The meeting recap from yesterday + the risk log from last week

Four blocks. Microsoft calls them **Goal**, **Context**, **Expectations**, **Source**. Those are the bones of every good prompt. The rest of this guide is detail.

## The Cheat Sheet {#cheat-sheet}

If you only screenshot one thing, screenshot this. {{< margin >}}Yes, print it. Stick it next to your monitor. Past-me would have saved hours.{{< /margin >}}

### The 4-block prompt recipe

| Block | Plain-English question | Example |
|---|---|---|
| **Goal** | What do you want Copilot to do? | "Draft an interview guide for…" |
| **Context** | What does Copilot need to know? | "…a senior data engineer role at a regulated bank…" |
| **Expectations** | What does good look like? | "…6 behavioural questions, 4 technical questions, no leading language…" |
| **Source** | Where should it ground its answer? | "…using /Senior DE Job Description and /Interview rubric." |

### The habit on top: **iterate**

Treat the first answer as a draft. Coach Copilot with one sentence at a time:

- *"Shorter. Cut to 6 bullets."*
- *"Less marketing tone. Plainer."*
- *"Use the names from the source document."*
- *"Remove anything you can't ground in /Source File."*

### Slash-command grounding (when your Copilot supports it)

| You type | What it does |
|---|---|
| `/file name` | Grounds the answer in that file |
| `/person name` | Adds what's known about that person |
| `/meeting name` | Pulls in that meeting's recap |
| `/email subject` | Pulls in that email thread |

If slash auto-complete doesn't appear, use the **file picker** / **Add files** button in the chat composer — that's the proper fallback for grounding. Pasting a filename into the prompt does **not** ground; pasting the actual content works for one-shot tasks but isn't equivalent to a real source reference.

### App-by-app one-liner

| App | One thing to try first |
|---|---|
| **Copilot Chat** | "Catch me up on /[project name] across emails, files, and Teams" |
| **Word** | "Draft a one-page brief based on /[long document]" |
| **Excel** | "Find the three biggest variances in this sheet and explain them" |
| **PowerPoint** | "Turn /[Word doc] into a 6-slide deck for [audience]" |
| **Outlook** | "Reply saying yes, propose Thursday, keep it warm" |
| **Teams** | "Recap this meeting in 5 bullets and list the action items by owner" |
| **OneNote** | "Summarise my notes from this notebook into key decisions" |
| **Loop** | "Draft a project kickoff page with goals, owners, and milestones" |

### 5 rules that fix 90% of bad prompts

1. **Be specific.** "Write something" gets you anything. "Draft a 150-word email" gets you that email.
2. **Tell Copilot the audience.** A steering committee reads differently to a customer.
3. **Name the format.** Bullets, table, paragraph, slide outline — say which.
4. **Ground it.** Point at the real file. Don't make Copilot guess your facts.
5. **Iterate.** First answer is a draft. The second one is usually the good one.

### Safety strip — three rules that go on every prompt

{{< hi >}}**Right Copilot for the data** · **Ground it in a real source** · **You review before it goes out.**{{< /hi >}}

The full version of these three lives in the [Before you paste anything](#privacy) section below. Read it before your first real prompt.

## The 4-block framework — Goal · Context · Expectations · Source {#four-blocks}

This is Microsoft's official framework. You'll see it in [Microsoft Learn](https://learn.microsoft.com/en-us/training/modules/write-effective-prompts-do-more-prompting/) and in the [Microsoft 365 Copilot support pages](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-writing-prompts-in-microsoft-365-copilot). Four blocks, one habit.

### Block 1 — Goal

The task. The verb. What you want done.

- "Summarise…"
- "Draft…"
- "Compare…"
- "Find…"
- "Reword…"
- "Translate…"
- "Explain…"
- "Organise…"

> ❌ "Help me with the customer email."  
> ✅ "**Draft a reply** to the customer email."

The first is a wish. The second is a task. Copilot answers tasks well.

### Block 2 — Context

What does Copilot need to know about the situation? Who is the audience? What's already true? Why is this happening?

- Audience: *"…for a steering committee that hasn't been close to the detail."*
- Background: *"…the customer escalated last Friday and we missed the SLA."*
- Tone: *"…warm but factual — not defensive."*
- Constraints: *"…we cannot offer a refund."*

Context is the section most people skip. It's also where the biggest quality jump lives. {{< hi >}}Vague context = generic answer. Specific context = answer that sounds like you.{{< /hi >}}

### Block 3 — Expectations

What does "good" look like? This is the section that turns a wall of text into a deliverable.

- **Length:** "in 150 words", "in 5 bullets", "as a one-page brief", "as a 6-slide outline"
- **Format:** "as a table with columns Risk · Likelihood · Owner · Next step"
- **Tone:** "plain English, no jargon, no marketing voice"
- **Style:** "in my normal email tone — see the example below"
- **Limits:** "don't speculate beyond what's in the source documents", "don't rank candidates", "flag anything missing"

If you don't say what good looks like, Copilot picks a default. The default is rarely what you wanted.

### Block 4 — Source

Which documents, emails, meetings, or chats should Copilot use?

- **Files** in SharePoint or OneDrive (use the file picker or `/file name`)
- **Emails** in your mailbox (in supported experiences, with grounding enabled)
- **Meeting recaps** from Teams (the meeting must have a recap)
- **Teams chats** in supported experiences
- **Public web pages** (when web grounding is enabled and the URL is supported)

Without a Source, Copilot writes from general knowledge. That's fine for a brainstorm. It's not fine when the answer needs to reflect *your* customer, *your* policy, *your* numbers. {{< margin >}}Most "Copilot got it wrong" stories I hear are actually "Copilot wasn't given the source".{{< /margin >}}

A grounded prompt looks like this:

> *"Using /Q3 forecast and the last three /Weekly business review meetings, summarise the three biggest revenue risks for the steering committee. 150 words, plain English, no jargon."*

Four blocks. Goal, Context, Expectations, Source. Once you've written ten of these you'll never go back to vague prompting.

### How the 4 blocks map to the deeper techniques

The [Prompt Engineering Guide](/prompt-guide/) on this site teaches 8 techniques in more depth. Those techniques aren't replaced by the 4-block framework — they're **what each block looks like in practice**.

| Deeper technique (from /prompt-guide/) | Fits inside the block |
|---|---|
| [Give clear instructions](/prompt-guide/give-clear-instructions/) | **Goal** |
| [Set a role](/prompt-guide/set-a-role/) | **Context** (often) or **Expectations** (sometimes) |
| [Add context](/prompt-guide/add-context/) | **Context** |
| [Give examples](/prompt-guide/give-examples/) | **Context** or **Expectations** |
| [Define the format](/prompt-guide/define-the-format/) | **Expectations** |
| [Set constraints](/prompt-guide/set-constraints/) | **Expectations** |
| [Specify audience and tone](/prompt-guide/specify-audience-and-tone/) | **Context** + **Expectations** |
| [Think step by step](/prompt-guide/think-step-by-step/) | **Expectations** + iteration |

The 4-block framework is the container. The 8 techniques are how you fill each container with precision.

## The habit that makes the framework work — iterate {#iterate}

The four blocks get you a good first draft. **Iteration** gets you the answer you actually wanted.

Iteration is not a fifth block. It's a habit. After Copilot answers, you stay in the chat and coach it one sentence at a time. The brilliant new colleague analogy keeps holding — you wouldn't expect a real new hire to nail it first try either.

A few patterns that work:

- *"Shorter — cut to 5 bullets."*
- *"Plainer — drop the marketing words."*
- *"Use the names and numbers from /Source File, not generic placeholders."*
- *"Give me the options with pros and cons — don't just hedge, but stay grounded in the source."*
- *"Remove anything that isn't grounded in the source documents."*
- *"Now turn this into a slide outline."*
- *"Now write a 2-line summary suitable for an exec preview."*

> 💡 **Tip from a few hundred sessions:** the answer you wanted is almost always the **third** answer. First is generic. Second is closer but over-polished. Third is the one. Plan for three rounds — it's faster than starting from scratch.

If iteration isn't getting you there, the original brief was probably under-specified. Open a new chat and rewrite the prompt with more in the Context and Expectations blocks.

## Where you can prompt — Microsoft 365 Copilot Chat vs the apps {#where}

Copilot shows up in two flavours inside Microsoft 365: a **general chat surface** and **task-specific assistants inside each app**. The same brain, different doors.

```mermaid
flowchart TD
    A["I need Copilot to..."] --> B{"Is the task<br/>rooted in ONE<br/>document or message<br/>I have open?"}
    B -->|"Yes"| C["Use Copilot inside<br/>that app<br/>(Word, Excel, PowerPoint,<br/>Outlook, Teams)"]
    B -->|"No — needs<br/>multiple sources"| D{"Do I need it to<br/>reason across files,<br/>emails, meetings,<br/>chats?"}
    D -->|"Yes"| E["Use Microsoft 365<br/>Copilot Chat<br/>(microsoft365.com/chat)"]
    D -->|"No — general<br/>question"| F["Free Copilot Chat<br/>or Copilot Chat<br/>without grounding"]
```

The shortcut rule: {{< hi >}}**inside one file → use the app's Copilot. Across many sources → use Copilot Chat.**{{< /hi >}} Everything else is a refinement of that rule.

Need to understand the licensing behind these surfaces? The [Copilot Pro vs Microsoft 365 Copilot guide](/blog/copilot-pro-vs-microsoft-365-copilot/) on this site covers it end-to-end.

## The grounding unlock — slash commands and file pickers {#grounding}

The biggest quality jump in your prompting is the day you stop relying on general knowledge and start grounding Copilot in your real work.

**Grounding** means pointing Copilot at the specific files, emails, meetings, or chats that should inform its answer. When your Copilot experience supports it, the easiest way to ground is the **slash command** — type `/` and start typing a name. Copilot will offer matching files, people, meetings, or emails.

A few patterns that pay off:

| Pattern | What it does |
|---|---|
| `/Project alpha brief` | Grounds Copilot in that specific document |
| `/Steering committee 12 May` | Pulls in that meeting's recap and decisions |
| `/email subject line` | Brings in an email thread (in supported experiences) |
| `/person name` | Surfaces what's known about that person from your org graph |

If your Copilot doesn't surface slash auto-complete, use the **file picker** in the chat composer instead — it does the same thing under the hood. The label might be "Add files", "Reference content", or a paperclip icon depending on which surface you're in.

> 📎 **Why this matters:** Without grounding, Copilot is writing from general knowledge plus whatever it remembers from the recent chat. That's fine for brainstorming and writing scaffolds. It is **not** fine when your answer needs to reflect a specific customer, policy, decision, or set of numbers. Most "Copilot hallucinated" stories I hear are really "Copilot wasn't given the source".

A grounded prompt for the same status-update task above looks like:

> *"Using /Customer migration weekly recap (the most recent three) and /Risk register, draft a 200-word status update for the steering committee. Lead with the three biggest risks, then this week's wins, then next week's asks. Plain English, no jargon."*

Same four blocks. Now Copilot is reading **your** recaps and **your** risk register — not generic project-management filler.

> 🚨 **Heads-up — slash availability varies.** Slash-command coverage depends on which Copilot surface you're in, your tenant's connectors, the file's index status, and whether the source is supported on that surface. If `/filename` doesn't auto-complete, use the **file picker** or **Add files** button in the chat composer — that's the proper grounding fallback. Pasting a filename as plain text into the prompt does NOT ground; pasting the file's actual content works for a one-shot prompt but isn't equivalent to a real source reference.

## Before you paste anything into Copilot {#privacy}

A short, important section that comes BEFORE the app-by-app tips — because the cleanest way to learn is to start with the right Copilot for the right data, not patch it later.

**1. Use the right Copilot for the data.** Work data → your organisation's Microsoft 365 Copilot (the licensed enterprise version). Personal data → Copilot Pro or the free consumer chat. **Never paste customer data, candidate PII, internal financials, or anything regulated into a consumer AI tool.**

**2. Respect existing permissions.** Copilot only sees what you can already see. That includes things you can see but probably shouldn't — over-permissioned SharePoint folders, an old shared drive, a Teams channel you joined for one meeting two years ago. Before you ground Copilot in something sensitive, check who has access to the source.

**3. Validate before you publish.** Copilot drafts. You publish. Always check facts, names, numbers, dates, customer identifiers, and especially anything regulated. Treat the first answer the way you'd treat a confident new hire's first draft — useful but in need of a once-over.

> 📎 **One more.** If you're unsure whether your Copilot is the licensed enterprise version, check inside the chat surface itself — look for "Microsoft 365 Copilot" branding, the Work tab, or an admin-approved indicator. A work account is **necessary but not sufficient** for tenant-data grounding; you also need to be in a licensed Microsoft 365 Copilot experience (or an approved work-grounded Copilot Chat surface) — not the free consumer chat. When in doubt, ask IT.

## App-by-app quick wins {#apps}

The four blocks apply everywhere. But each app has a handful of prompts that pay off immediately. Here are the ones I keep coming back to.

### Copilot Chat (microsoft365.com/chat) {#app-chat}

The most versatile surface. Best for reasoning across files, emails, meetings, and Teams chats — anywhere you'd otherwise be opening five tabs and copy-pasting between them.

Three prompts to try first:

> 1. *"Catch me up on /[project name] across the last two weeks — emails, meetings, and Teams chats. What changed, who decided what, what's blocked? 200 words, plain English, bullet points."*

> 2. *"Summarise the three biggest themes from /[meeting series name] over the last month. Highlight any decisions, action owners, and unresolved questions."*

> 3. *"Find any email or chat from /[person name] where they raised a concern about [topic]. Quote the relevant sentence and give me the link."*

Copilot Chat is also the right surface for cross-app drafting: *"Draft a one-pager based on /Brief doc, then turn it into a 5-slide outline and an exec email summary."*

### Word — drafting, rewriting, structuring {#app-word}

Word's Copilot lives inside the document. Best for everything that ends in a finished document: briefs, reports, policies, FAQs.

Three prompts to try first:

> 1. *"Draft a one-page project brief based on /Discovery notes. Sections: Goal, Approach, Risks, Milestones, Asks. Plain English, no marketing tone."*

> 2. *"Rewrite this paragraph in a warmer, more confident tone. Keep the facts unchanged."*

> 3. *"Turn this long document into a 200-word executive summary, then list the open questions at the end."*

Word Copilot is also the easiest place to learn the iteration habit — you can see exactly what changed and revert if you don't like it.

### Excel — analyse, formulas, insights {#app-excel}

Excel's Copilot is best for the question *"what does this data actually say?"* — not yet ideal for very large or messy datasets, but excellent for cleaned-up tables.

Three prompts to try first:

> 1. *"Find the three biggest variances between forecast and actuals in this sheet. Explain each in one sentence and propose a likely driver."*

> 2. *"Generate the formula to count unique customers who appear in column B but not column F."*

> 3. *"Build a chart showing monthly trend by region for column G. Pick the chart type that best fits this data."*

For very messy data, do a cleaning pass in Copilot Chat first — paste a sample, ask *"what formatting inconsistencies should I fix before analysing this?"* — then bring it back into Excel.

### PowerPoint — turn content into slides, redesign, simplify {#app-pp}

PowerPoint's Copilot is the fastest way to get from "I have a long document" to "I have a draft deck". The first draft will not be perfect. That's fine — it'll be 80% there and your iteration habit takes you the rest of the way.

Three prompts to try first:

> 1. *"Create a 6-slide presentation from /Project brief. Audience is the steering committee. Title slide, 4 content slides covering Goal · Approach · Risks · Asks, and a closing slide with next steps."*

> 2. *"Redesign this slide to be cleaner and more readable. Reduce the text and use a clearer structure."*

> 3. *"Make this slide simpler — cut the bullets to 3, larger font, plain English."*

The key with PowerPoint is to start from a Source. Empty-PowerPoint prompts give you generic decks. Document-grounded prompts give you your deck.

### Outlook — summarise, reply, schedule {#app-outlook}

Outlook's Copilot is where the daily wins live. Most people I've taught feel the time savings on email triage and drafting within a week.

Three prompts to try first:

> 1. *"Summarise this long thread in 4 bullets. What was decided, what's open, who owns what next?"*

> 2. *"Reply saying I'll attend, propose Thursday afternoon as an alternative, and keep the tone warm."*

> 3. *"Draft a polite follow-up to this email — no response in 10 days, soft deadline of next Friday, professional but not pushy. 100 words."*

The single biggest unlock here is the iteration habit. First reply too formal? Just say *"warmer"*. Too long? *"Cut to 60 words"*. Done in 15 seconds.

### Teams — recaps, action items, meeting prep {#app-teams}

Teams Copilot does two things really well: **meeting recaps after** and **meeting prep before**.

Three prompts to try first:

> 1. *"Recap this meeting in 5 bullets. List the action items by owner. Flag any decisions made and any open questions."*

> 2. *"What did I miss from /[meeting name] last Tuesday? Focus on decisions and anything I'm now responsible for."*

> 3. *"Help me prepare for a 30-minute meeting with /[person] tomorrow. Pull recent emails, chats, and shared files. What's on their mind and what should I ask?"*

The third one is a quiet superpower. Used well, it makes every internal meeting more focused.

### OneNote — summarise, organise, find {#app-onenote}

If you take notes by hand or paste-and-pray into OneNote, Copilot turns it into something useful.

Three prompts to try first:

> 1. *"Summarise my notes from this notebook into key decisions, action items, and unresolved questions."*

> 2. *"Find the meeting where we agreed on the migration date. Quote the relevant note."*

> 3. *"Turn these scattered notes into a one-page brief organised by Goal, Approach, Risks, Next steps."*

### Loop — collaborate, plan, structure {#app-loop}

Loop is where Copilot helps you start a shared workspace cleanly — kickoff pages, planning grids, joint notes.

Three prompts to try first:

> 1. *"Draft a project kickoff page with sections for Goal, Owners, Milestones, Risks, and an open-questions log."*

> 2. *"Turn this brainstorm into a structured planning grid — columns for Idea, Owner, Effort, Impact, Next step."*

> 3. *"Suggest a meeting agenda for the kickoff based on this kickoff page."*

## 10 prompt mistakes to avoid {#mistakes}

These are the ones I see most often. None of them are technical. All of them are habits.

**1. Vague verbs.** *"Help me with the report."* Use a real verb — draft, summarise, compare, find.

**2. No audience.** A customer reads differently to a steering committee reads differently to your mum. Say which.

**3. No format.** "Bullet points", "table", "200 words", "slide outline". Pick one. Default formats are rarely what you wanted.

**4. No source.** If the answer needs your facts, you need to give Copilot the source. Otherwise you'll get generic.

**5. Quitting after the first answer.** The first answer is a draft. Coach it. The third answer is usually the keeper.

**6. Pasting sensitive data into the wrong Copilot.** Never paste customer or candidate PII into a consumer AI tool. Use your organisation's enterprise Copilot or don't paste at all.

**7. Asking Copilot to decide.** Hiring, performance, financial decisions, customer-facing approvals — these stay with humans. Use Copilot to summarise and structure. Use yourself to decide.

**8. Treating output as truth without checking.** Names, dates, numbers, citations. Copilot will sometimes invent things that look plausible. Validate before you publish.

**9. Over-engineering the prompt.** A specific 30-word prompt beats a 200-word prompt with elaborate role-play. Be specific, not fancy.

**10. Forgetting the iteration habit.** If the first answer wasn't right, that's not a bug — that's the workflow. Coach Copilot. Don't start over.

## The honest take — what Copilot won't do for you {#honest}

Worth saying clearly, because the marketing softens it.

- {{< hi >}}**Copilot will not make decisions for you.**{{< /hi >}} It will draft, summarise, compare, structure. Hiring outcomes, performance ratings, financial commitments, customer commitments — those are yours.
- **Copilot will not learn your company without grounding.** Without `/file` and the file picker, it's writing from general knowledge.
- **Copilot will sometimes be wrong.** Language models hallucinate. The mitigation is grounding + validation, not blind trust.
- **Copilot will not replace judgment.** It will free up the time you used to spend typing, so you can spend more time on the judgment work.
- **Copilot is not the same in every surface.** Consumer Copilot, Copilot Pro, and Microsoft 365 Copilot are three different products with different data access and different governance. [The licensing guide](/blog/copilot-pro-vs-microsoft-365-copilot/) covers this in detail.

If those four things stay true in your head, you'll get a lot of value from Copilot without any of the surprises.

## Three real scenarios {#scenarios}

The framework is one thing. Watching it in action is another. Three short scenarios — names changed.

### "Mei the recruiter, drowning in CVs"

> **Situation:** Mei is a senior recruiter at a 2,000-person company. 80 applicants for a senior data engineer role. She has two days to give the hiring manager a structured longlist.

She doesn't ask Copilot to rank candidates — that decision stays with her and the hiring manager. She uses Copilot to **summarise each CV against the role criteria**, in a consistent shape. One prompt, applied to each CV individually:

> *"Using /Senior DE Job Description, summarise this CV against the essential criteria only. Output a table: Criterion · Evidence in CV · Missing or unclear. Do not rank. Do not recommend. Flag where evidence is missing."*

Now Mei has 80 consistent summaries. She reads through them faster. The decisions are still hers — but the typing isn't.

She'll also use prompts for **inclusive job advert drafting**, **interview guide creation**, and **candidate communication** — covered in detail in the [Recruiters & HR field guide](/blog/microsoft-365-copilot-for-recruiters-and-hr/).

### "Priya the ops lead, weekly business review prep"

> **Situation:** Priya runs a 12-person operations team. Every Tuesday she presents to her director: what shipped, what slipped, what's at risk. It used to take her Sunday afternoon.

She grounds Copilot Chat in three weeks of meeting recaps, the team's Loop planning page, and a Teams chat: *"Using /WBR meetings (last three) and /Ops planning page and /Ops leads chat from the last 7 days, draft a 4-bullet weekly business review for my director. Lead with: shipped, slipped, at risk, asks. Plain English. No marketing tone."*

First draft is 80% there. She iterates a few times — shorter on the wins, more specific on the risks, swap one phrasing. The job that used to eat her Sunday afternoon is done before Monday's first coffee.

### "Tom the finance manager, variance commentary"

> **Situation:** Tom owns monthly variance commentary for his business unit. Forecast vs actuals, by category, with a one-paragraph "why" on each big variance. It's the most disliked task on his desk.

He grounds Copilot in his variance Excel: *"In this sheet, find the three biggest unfavourable variances and the two biggest favourable ones. For each, draft a one-sentence likely driver based on the row data. Do not speculate beyond what's in the sheet — flag if a driver isn't clear."*

He spends the saved time on the actual judgment call — which variances need exec attention, which need a deeper investigation, which are noise. The typing is gone; the thinking is still his.

## Your 4-week practice plan {#practice}

If you've got this far, you've got the theory. Now build the habit.

| Week | Do this |
|---|---|
| **1 — Outlook** | Use Copilot to summarise long email threads and draft three replies a day. Iterate on each reply at least once. By Friday, the iteration habit feels normal. |
| **2 — Word** | Draft one document a day grounded in a real source file. Use the 4-block framework explicitly — write Goal · Context · Expectations · Source in your prompt every time. |
| **3 — Excel + Teams** | Two simple Excel "what does this data say?" prompts a week + a recap after every Teams meeting. By end of week you'll feel the time savings. |
| **4 — Copilot Chat** | Move to cross-source prompts. *"Catch me up on /project across emails, files, meetings."* This is where the real productivity unlock is. |

> 💡 **Track what you save.** I genuinely recommend a one-line note at the end of each day in week 1-2: *"Today Copilot helped me on X — felt like it saved me real time."* By the end of two weeks you'll have your own evidence. Your mileage will vary, but the trend usually tells the story.

## Where to go next {#next}

You now have the framework, the per-app tips, the privacy guardrails, and a practice plan. A few places worth knowing about on this site:

- 📚 **[The Prompt Engineering Guide](/prompt-guide/)** — 8 deeper techniques (clear instructions, set a role, add context, define the format, give examples, set constraints, specify audience and tone, think step by step). Hands-on practice for each.
- 🧪 **[The Advanced Prompt Lab](/prompt-lab/)** — 12 expert techniques (Chain of Thought, Tree of Thought, Few-Shot, ReAct, Meta-Prompting, and more). For when the four blocks aren't enough.
- 📋 **[The Prompt Library](/prompts/)** — 500+ tested prompts organised by app and persona. Customisable starting points for almost any task.
- 🎯 **[The Prompt Polisher](/prompt-polisher/)** — paste your prompt, get a score and an improved version. Brutal but useful.
- 🧪 **[The Prompt Tester](/prompt-tester/)** — A/B test two prompts side by side to see which one Copilot likes better.

**Role-specific deep dives:**

- 🧑‍💼 **[Microsoft 365 Copilot — A Plain-English Playbook for 5 Personas](/blog/microsoft-365-copilot-by-persona-playbook/)** — the role-specific companion. Recruiters & HR · Operations · Finance · IT Admin · Sales & Marketing. Day-in-the-life workflows, worked prompts, persona-specific guardrails, and the safety patterns that matter in each role.

**Related licensing and architecture guides:**

- [Copilot Pro vs Microsoft 365 Copilot — Which Do You Need?](/blog/copilot-pro-vs-microsoft-365-copilot/)
- [How Microsoft 365 Copilot Works, Layer by Layer](/blog/how-microsoft-365-copilot-works-layer-by-layer/)
- [M365 Agent Builder — Plain-English Field Guide](/blog/m365-agent-builder-explained/)
- [22 Copilot features you should be using](/blog/20-copilot-features-you-should-be-using/)

---

✎ **One more thought.** The biggest mindset shift, the thing that made prompt engineering click for me, was treating Copilot as a capable new colleague rather than a search engine. Search engines reward keywords. Colleagues reward a clear brief. The four blocks are just the structure of a clear brief.

You don't need a course. You need the habit. Try the framework on your next email reply. Iterate once. Notice what changed. Do it again tomorrow. By the end of a week, prompting will feel as ordinary as writing.

— Sush

## FAQ {#faq}

The most common questions I get from people new to prompting Microsoft 365 Copilot.

