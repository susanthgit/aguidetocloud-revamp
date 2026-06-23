---
title: "The Researcher Agent in Microsoft 365 Copilot"
list_title: "Researcher Agent (Copilot)"
hub_id: "ai-agents"
description: "What the Researcher agent in Microsoft 365 Copilot does — deep, multi-step research across your work and the web, returned as a source-cited report."
date: 2026-06-23
lastmod: 2026-06-23
draft: false
card_tag: "Agents"
tag_class: "ai"
layout: "notebook"
stamp: "researcher agent"
intro_note: "← the deep-research agent in Microsoft 365 Copilot — what it does, how it differs from a quick Copilot chat, and how to get a source-cited report out of it"
images: ["images/og/blog/microsoft-365-researcher-agent.jpg"]
og_headline: "The Researcher Agent, Explained"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - researcher-agent
  - agents
  - research
  - ai
faq:
  - question: "What is the Researcher agent in Microsoft 365 Copilot?"
    answer: "Researcher is a built-in agent in the Microsoft 365 Copilot app that handles complex, multi-step research. It pulls from the web and, at work, from the files, emails, meetings and chats you already have access to, then returns a structured, source-cited report you can edit and share. Microsoft describes it as combining OpenAI's deep research model with Copilot's orchestration and deep search."
  - question: "How is Researcher different from just asking Copilot?"
    answer: "Standard Copilot Chat is optimised for speed — quick answers, short summaries, drafting a reply. Researcher is built for depth: it takes longer on purpose so it can reason across many sources and produce a structured report with headings, visuals and citations. Use Copilot Chat for a fast answer; use Researcher when you need an in-depth, shareable report."
  - question: "Do I need a licence to use Researcher?"
    answer: "Yes. Researcher is available to Microsoft 365 Copilot add-on users, and also to Microsoft 365 Premium subscribers. People on a base Microsoft 365 plan without one of those won't see it. It runs inside the Microsoft 365 Copilot app under Agents."
  - question: "Does Researcher use my work data — and is that safe?"
    answer: "It can use your work content — files, emails, meetings and chats — but only what you already have permission to see, and it respects the same policies and compliance you rely on across Microsoft 365. You can also point it at just the web, just your work, or both. It shows its sources so you can verify the important claims."
  - question: "Can I use Claude with Researcher?"
    answer: "Yes — Researcher now supports Anthropic's Claude models as an option, but your admin has to allow access to Anthropic models in the Microsoft 365 admin center first. Microsoft is rolling this out gradually, so it may not be available in every organisation yet."
  - question: "How many Researcher queries do I get?"
    answer: "Researcher is included with a qualifying licence rather than sold per query. At general availability (June 2025), a Microsoft 365 Copilot licence included 25 combined Researcher and Analyst queries a month. That figure has evolved since, so check the current Microsoft 365 Copilot documentation for the live number before you rely on it."
  - question: "Is Researcher available in government clouds?"
    answer: "Not yet. Microsoft's service description notes that built-in agents like Researcher and Analyst are not yet available in GCC, GCC High or DoD environments. Check the service description for the current status if you run a government tenant."
sitemap:
  priority: 0.8
founder_note: |
  Researcher is the one I reach for when "ask Copilot a quick question" isn't enough — when I actually need to pull a topic apart across our files and the open web and come back with something I'd put in front of a customer. It takes a couple of minutes instead of a couple of seconds, and that's the point: it's doing the reading and the reasoning for you, then showing its sources.

  Here's what it does, how it's different from a normal Copilot chat, and how to get a genuinely good report out of it. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) guide.** Researcher is **generally available** (since June 2025) to Microsoft 365 Copilot and Microsoft 365 Premium users. **Last verified: 23 June 2026.**

</div>

*The hub for this series — [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) — maps every agent Microsoft ships. This spoke is the detailed walkthrough of Researcher; its sibling is the [Analyst agent](/blog/microsoft-365-analyst-agent/).*

<p><img src="/images/blog/microsoft-365-researcher-agent/01-researcher-home.webp" alt="The Researcher agent home screen in the Microsoft 365 Copilot app, with a 'What do you want to research today?' prompt box and six prompt-starter cards — Project Update, Topic Report, Customer Brief, Market Analysis, Meeting Prep and Status Tracker — above a History list. The left navigation shows Researcher and Analyst under Agents." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Researcher in the Microsoft 365 Copilot app — find it under **Agents** in the left rail, next to Analyst. The prompt-starters are a quick way in.*

---

## TL;DR

- **Researcher** is a built-in agent in the **Microsoft 365 Copilot app** for **deep, multi-step research** — it returns a **structured, source-cited report**, not a quick chat reply.
- It works across **the web** and **your work content** (files, emails, meetings, chats) — but only what **you** can already see.
- It **takes longer by design** — it reasons through many sources, then writes the report. It may ask **clarifying questions** first.
- **On-switch:** a **Microsoft 365 Copilot** licence, or a **Microsoft 365 Premium** subscription. Find it under **Agents**.
- It can now use **Claude** (Anthropic) as a model option, once an admin allows it.
- **Not in government clouds** (GCC, GCC High, DoD) yet.

> 🧭 **Jump to:** [What it is](#what) · [Researcher vs Copilot Chat](#vs) · [How to use it](#how) · [Add your own sources](#sources-step) · [It reasons, then reports](#report) · [Prompt tips](#tips) · [Licensing & models](#licensing) · [Limits](#limits) · [Sources](#sources)

---

## What Researcher actually is {#what}

**Researcher** is a reasoning agent built for the kind of work you'd normally block out an afternoon for: *"pull together everything we know about X, from our files and the web, and give me something I can act on."* In Microsoft's words, it's *"built to tackle complex, multistep research and deliver a structured, source-cited report"* — combining **OpenAI's deep research model** with Microsoft 365 Copilot's orchestration and deep search.

The key idea: it doesn't just answer, it **researches**. It gathers from multiple sources, reasons across them, and composes a report with headings, visuals and citations — then you edit it, share it, or use it to kick off a document or deck.

---

## Researcher vs a normal Copilot chat {#vs}

This is the distinction people most need, so here it is plainly:

| Use **Copilot Chat** when you want… | Use **Researcher** when you want… |
|---|---|
| A quick answer or short summary | **In-depth research** across many sources |
| To brainstorm or draft a short reply | A **structured report** with headings and visuals |
| Speed — seconds | Depth — it takes longer, on purpose |
| A back-and-forth on simple tasks | Something **cited** you can trust and share |

The longer wait isn't a flaw — it's Researcher taking the time to reason so the output is something you can stand behind.

---

## How to use it {#how}

1. Open the **Microsoft 365 Copilot** app and select **Researcher** under **Agents**.
2. **Ask a question** — type a topic, or use a prompt-starter like *Market Analysis* or *Customer Brief*.
3. **Answer any clarifying questions.** Researcher often asks a couple to focus the work — answer them, or just say *"Go ahead."*
4. **Let it work.** It finds and reasons across your chosen sources.
5. **Get your report** — a structured summary with insights, citations and next steps.
6. **Take action** — edit it, share it, or turn it into a document or presentation.

---

## Add your own sources {#sources-step}

Researcher is good on the open web alone, but it gets sharper when you point it at your own material. Type a **`/`** in the prompt to add a file, or attach an email thread or document — then it focuses the analysis around what matters to you.

<p><img src="/images/blog/microsoft-365-researcher-agent/02-researcher-references.webp" alt="The Researcher prompt box with two work documents attached — Zavacore Fiber - TechSpecs.docx and Zava Newsletter.docx — above a detailed prompt asking it to analyse competitor moves in the smart fabric industry, with the six prompt-starter cards below." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Attaching your own documents to a Researcher prompt. Adding sources is optional — it just helps Researcher focus on what's relevant to you.*

You also get to **define the scope**: workplace resources, the web, or both. Deciding that up front gives you a more targeted report.

---

## It reasons, then reports {#report}

Here's the part that makes Researcher different from a search box: it works through the problem in steps — comparing sources, organising findings, checking the angle — and you can watch it work through the task before it writes.

<p><img src="/images/blog/microsoft-365-researcher-agent/03-researcher-reasoning.webp" alt="The Researcher agent showing its reasoning as a checklist of completed steps — proposing a roadmap analysis, organising competitor analysis and references, comparing competitor and Zava specs, reviewing the projected roadmap — followed by the start of a structured report headed 'Analysis of Competitor Moves in Smart...', with an 'AI-generated content may be incorrect' note." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Researcher working through the task — the steps it took — above the structured, cited report it produced. You can follow its progress, then verify the sources.*

The finished report is yours to refine. And because the report includes **cited sources**, you can check the claims that matter before you send it on.

---

## Prompt tips for better reports {#tips}

Microsoft's own guidance, in plain terms:

- **Be specific.** *"Write a report on my business impact on the Contoso project for my performance review"* beats *"write my performance review."*
- **Say where to look.** Tell it web, your work content, or both — it narrows the research.
- **Use the clarifying questions.** They're not friction — they're how you steer the output. Answer them rather than skipping.

---

## Licensing & models {#licensing}

- **Licence:** a **Microsoft 365 Copilot** add-on, or a **Microsoft 365 Premium** subscription. Researcher debuted in April 2025 through the Frontier program and reached **general availability on 2 June 2025**.
- **Models:** it runs on **OpenAI's deep research model** plus Copilot's orchestration. It now also supports **Anthropic's Claude** as an option — but an admin must **allow Anthropic models** in the Microsoft 365 admin center first, and that's rolling out gradually.
- **Query allowance:** included with the licence rather than sold per query — at general availability (June 2025) a Microsoft 365 Copilot licence included **25 combined** Researcher + Analyst queries a month. The figure has evolved since, so confirm the current number in Microsoft's docs.

> 📎 **There's a Frontier variant too:** Microsoft also lists **Researcher with Computer Use**, a separate, more advanced Frontier-program experience. It's worth knowing it exists if you outgrow standard Researcher — check Microsoft's page for what it can do before relying on it.

---

## Limits and good-to-knows {#limits}

- **It's slower than chat — on purpose.** If you need an instant answer, use Copilot Chat instead.
- **It only sees what you can.** Researcher respects your existing permissions; it won't surface work content you couldn't already open.
- **Review before you rely.** Like all generative output, it's labelled as possibly incorrect — the citations are there so you can check.
- **Languages:** Researcher supported **37 languages** at general availability, with more added since.
- **Government clouds:** not available in **GCC, GCC High or DoD** yet.

---

## Official Microsoft sources {#sources}

- [Get started with Researcher in Microsoft 365 Copilot](https://support.microsoft.com/en-us/topic/get-started-with-researcher-in-microsoft-365-copilot-e63ab760-f3de-4c47-ae87-dad601b0e9c4)
- [Researcher and Analyst are now generally available (Microsoft 365 blog)](https://www.microsoft.com/en-us/microsoft-365/blog/2025/06/02/researcher-and-analyst-are-now-generally-available-in-microsoft-365-copilot/)
- [AI tools and agents in Microsoft Teams &amp; Copilot (overview)](https://learn.microsoft.com/en-us/microsoftteams/copilot-ai-agents-overview)
- [Microsoft 365 Copilot service description (government-cloud availability)](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-copilot)

---

## The other built-in agents

- [Microsoft 365's Built-in Agents — the complete guide](/blog/microsoft-365-built-in-agents/) *(the hub)*
- [The Analyst Agent in Microsoft 365 Copilot](/blog/microsoft-365-analyst-agent/) *(its sibling)*
- [The Microsoft 365 Facilitator Agent in Teams](/blog/microsoft-365-facilitator-agent/)
- [The Planner Agent (Project Manager agent)](/blog/microsoft-365-project-manager-agent/)
