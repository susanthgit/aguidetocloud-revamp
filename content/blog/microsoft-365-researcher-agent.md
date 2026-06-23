---
title: "The Researcher Agent in Microsoft 365 Copilot"
list_title: "Researcher Agent (Copilot)"
hub_id: "built-in-agents"
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
    answer: "Standard Copilot Chat is optimised for speed — quick answers, short summaries, drafting a reply. Researcher is built for depth: it takes longer on purpose so it can reason across many sources and produce a structured, source-cited report. Use Copilot Chat for a fast answer; use Researcher when you need an in-depth, shareable report."
  - question: "Do I need a licence to use Researcher?"
    answer: "Yes. Researcher is available to Microsoft 365 Copilot add-on users, and also to Microsoft 365 Premium subscribers. People on a base Microsoft 365 plan without one of those won't see it. It runs inside the Microsoft 365 Copilot app under Agents."
  - question: "Does Researcher use my work data — and is that safe?"
    answer: "It can use your work content — files, emails, meetings and chats — but only what you already have permission to see, and it respects the same policies and compliance you rely on across Microsoft 365. You can also point it at just the web, just your work, or both. It shows its sources so you can verify the important claims."
  - question: "Can I use Claude with Researcher, and what is Critique and Council?"
    answer: "Researcher runs on multiple models. By default the selector is on Auto, which uses OpenAI's GPT and refines the result with Anthropic's Claude — and the selector is in the UI if your tenant exposes other options. Microsoft also added multi-model intelligence it calls Critique and Council — capabilities that raise the accuracy, depth and confidence of reports by having models review or weigh in on each other's work. Most of it is built in, though some depends on admin settings (such as allowing Anthropic's Claude)."
  - question: "What is Researcher with Computer Use?"
    answer: "It's the most advanced version of Researcher, available through the Frontier program and enabled by an admin. Standard Researcher reads sources; Computer Use can act inside a secure, cloud-hosted virtual computer — opening gated sites when you approve credentials, navigating real interfaces, and running code — to finish research a read-only agent can't. The sandbox is isolated from your device and network, ephemeral, and stores no credentials."
  - question: "How many Researcher queries do I get?"
    answer: "Researcher is included with a qualifying licence rather than sold per query. At general availability (June 2025), a Microsoft 365 Copilot licence included 25 combined Researcher and Analyst queries a month. That figure may change, so check the current Microsoft 365 Copilot documentation before you rely on it."
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

<p><img src="/images/blog/microsoft-365-researcher-agent/04-researcher-home-auto.webp" alt="The Researcher agent home in the Microsoft 365 Copilot app, headed 'Researcher' with the line 'Auto: GPT responses, refined by Claude (Frontier)' beneath it, an 'Auto' model selector top-right, a 'What do you want to research?' prompt box with a Sources button, Home/History/Reports/Saved/Shared tabs, and prompt-starter cards for Create a daily briefing, Research a topic, Comparative analysis, Research brief, Competitive analysis and Create a plan. The left rail shows Researcher and Analyst under Agents." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Researcher in the Microsoft 365 Copilot app — find it under **Agents**, next to Analyst. Note the **Auto** model selector and the **Sources** button: two of the things that make it more than a search box.*

---

## TL;DR

- **Researcher** is a built-in agent in the **Microsoft 365 Copilot app** for **deep, multi-step research** — it returns a **structured, source-cited report**, not a quick chat reply.
- It works across **the web** and **your work content** (files, emails, meetings, chats) — but only what **you** can already see. A **Sources** button lets you scope it.
- It **takes longer by design** — it reasons through many sources, then writes the report. It may ask **clarifying questions** first.
- It runs **multiple models**: an **Auto** mode blends **OpenAI's GPT** and **Anthropic's Claude**, and **Critique & Council** have models check each other for accuracy.
- A Frontier feature, **Researcher with Computer Use**, can act in a **secure virtual computer** — open gated sites, click through interfaces, run code.
- **On-switch:** a **Microsoft 365 Copilot** licence, or a **Microsoft 365 Premium** subscription. **Not in government clouds** yet.

> 🧭 **Jump to:** [What it is](#what) · [Researcher vs Copilot Chat](#vs) · [How to use it](#how) · [Sources & work content](#sources-step) · [It reasons, then reports](#report) · [Auto, Critique & Council](#models) · [Computer Use](#computer-use) · [Prompt tips](#tips) · [Licensing](#licensing) · [Limits](#limits) · [Sources](#sources)

---

## What Researcher actually is {#what}

**Researcher** is a reasoning agent built for the kind of work you'd normally block out an afternoon for: *"pull together everything we know about X, from our files and the web, and give me something I can act on."* In Microsoft's words, it's *"built to tackle complex, multistep research and deliver a structured, source-cited report"* — combining **OpenAI's deep research model** with Microsoft 365 Copilot's orchestration and deep search.

The key idea: it doesn't just answer, it **researches**. It gathers from multiple sources, reasons across them, and composes a **structured, source-cited report** — organised into sections, and (where the experience generates them) with visuals — then you edit it, share it, or use it to kick off a document or deck.

---

## Researcher vs a normal Copilot chat {#vs}

This is the distinction people most need, so here it is plainly:

| Use **Copilot Chat** when you want… | Use **Researcher** when you want… |
|---|---|
| A quick answer or short summary | **In-depth research** across many sources |
| To brainstorm or draft a short reply | A **structured, source-cited report** |
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

## Sources & work content {#sources-step}

Researcher is good on the open web alone, but it gets sharper when you point it at **your own material**. Two ways to do that:

- **The Sources button** under the prompt lets you scope what it draws on — your **work content**, the **web**, or both.
- **Attach specifics** — type a **`/`** to add a file, or attach an email thread or document — and it focuses the analysis around exactly what you give it.

At work, "your content" means the **files, emails, meetings and chats you already have access to** — Researcher only ever sees what *you* could already open, and it respects the same policies and compliance as the rest of Microsoft 365.

<p><img src="/images/blog/microsoft-365-researcher-agent/02-researcher-references.webp" alt="The Researcher prompt box with two work documents attached — Zavacore Fiber - TechSpecs.docx and Zava Newsletter.docx — above a detailed prompt asking it to analyse competitor moves in the smart fabric industry, with the six prompt-starter cards below." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Attaching your own documents to a Researcher prompt. Adding sources is optional — it just helps Researcher focus on what's relevant to you.*

Deciding the scope up front — **work, web, or both** — is the single biggest lever on how targeted the report comes back.

---

## It reasons, then reports {#report}

Here's the part that makes Researcher different from a search box: it works through the problem in steps — comparing sources, organising findings, checking the angle — and you can watch it work through the task before it writes.

<p><img src="/images/blog/microsoft-365-researcher-agent/03-researcher-reasoning.webp" alt="The Researcher agent showing its reasoning as a checklist of completed steps — proposing a roadmap analysis, organising competitor analysis and references, comparing competitor and Zava specs, reviewing the projected roadmap — followed by the start of a structured report headed 'Analysis of Competitor Moves in Smart...', with an 'AI-generated content may be incorrect' note." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Researcher working through the task — the steps it took — above the structured, cited report it produced. You can follow its progress, then verify the sources.*

The finished report is yours to refine. And because the report includes **cited sources**, you can check the claims that matter before you send it on.

---

## One agent, many models — Auto, Critique & Council {#models}

Most chatbots run on one model. Researcher can use **several**, with an **Auto** default — and that's part of what quietly makes its reports better.

By default the model selector sits on **Auto**. As the home screen spells out, Auto means **"GPT responses, refined by Claude"** — it uses **OpenAI's GPT** to do the work and **Anthropic's Claude** to refine it. The selector is right there in the UI, so if your tenant exposes other model options you may be able to choose one yourself.

<p><img src="/images/blog/microsoft-365-researcher-agent/05-researcher-auto-model.webp" alt="A close-up of the top of the Researcher agent showing the Researcher title, an 'Auto' model selector in the top-right corner, and the subtitle 'Auto: GPT responses, refined by Claude (Frontier). Learn more'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The **Auto** model selector — Researcher's default blends OpenAI's GPT with Anthropic's Claude. The selector is in the UI if you'd rather pick a model yourself.*

On top of that, Microsoft added **multi-model intelligence** to Researcher — Microsoft describes **Critique** and **Council** as two capabilities that raise the **accuracy, depth and confidence** of its reports. The way they've been described:

- **Critique** — a second model **reviews and refines** the first model's work before you see the answer (the "GPT, refined by Claude" pattern the UI shows). A second opinion, built in.
- **Council** — for harder questions, **several models weigh in together**, like a panel comparing notes, so the report reflects more than one perspective.

> 📎 **Why it matters:** for the high-stakes research you'd actually put in front of a customer or a leadership team, having models **check each other** is the difference between a confident-sounding answer and one you can trust. Most of this is built in — though some of it (like allowing Anthropic's Claude) depends on your admin's settings.

---

## Researcher with Computer Use {#computer-use}

This is the most advanced version, available through the **Frontier program** (early access for Copilot-licensed users, switched on by an admin). Standard Researcher *reads*; **Researcher with Computer Use** can **act** — inside a **secure, cloud-hosted virtual computer** that's isolated from your device and your network.

What that unlocks, in Microsoft's words:

- **Access gated content** — open sites behind a login or paywall, when *you* approve the credentials.
- **Navigate real interfaces** — click, type and work through websites or apps, while you stay in control.
- **Run code or scripts** — use a secure command line to crunch data as part of the research.

It's built for **richer reports grounded in the real web and your work content** — the research tasks a read-only agent simply can't finish. The virtual machine runs on **Windows 365 for Agents**, the sandbox is **ephemeral** (it doesn't persist), **no credentials are stored**, and admins get granular controls — enable/disable it, scope it to a pilot group, and set allow/block lists of sites.

> ⚠️ **Frontier, not GA:** Computer Use is a Frontier-program feature and admin-gated, so it won't be on in every tenant. Treat it as the powerful, opt-in tier of Researcher rather than the default.

---

## Prompt tips for better reports {#tips}

Microsoft's own guidance, in plain terms:

- **Be specific.** *"Write a report on my business impact on the Contoso project for my performance review"* beats *"write my performance review."*
- **Say where to look.** Tell it web, your work content, or both — it narrows the research.
- **Use the clarifying questions.** They're not friction — they're how you steer the output. Answer them rather than skipping.

---

## Licensing {#licensing}

- **Licence:** a **Microsoft 365 Copilot** add-on, or a **Microsoft 365 Premium** subscription. Researcher debuted in April 2025 through the Frontier program and reached **general availability on 2 June 2025**.
- **Query allowance:** included with the licence rather than sold per query — at general availability (June 2025) a Microsoft 365 Copilot licence included **25 combined** Researcher + Analyst queries a month. That figure may change, so confirm the current number in Microsoft's docs.
- **Models & Computer Use:** the multi-model behaviour (Auto, Critique, Council) is built in; **Researcher with Computer Use** is a separate **Frontier** tier an admin enables (see [above](#computer-use)).

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
- [Introducing multi-model intelligence in Researcher — Critique & Council (Microsoft 365 Copilot blog)](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/introducing-multi-model-intelligence-in-researcher/4506011)
- [Get started using Researcher with Computer Use (Frontier)](https://support.microsoft.com/en-us/Microsoft-365-Copilot/get-started-using-researcher-with-computer-use-in-microsoft-365-copilot-frontier)
- [Researcher with Computer Use — FAQ (Microsoft Learn)](https://learn.microsoft.com/en-us/microsoft-365/copilot/researcher-agent-computer-use-faq)
- [Researcher and Analyst are now generally available (Microsoft 365 blog)](https://www.microsoft.com/en-us/microsoft-365/blog/2025/06/02/researcher-and-analyst-are-now-generally-available-in-microsoft-365-copilot/)
- [Microsoft 365 Copilot service description (government-cloud availability)](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-copilot)

---

## The other built-in agents

- [Microsoft 365's Built-in Agents — the complete guide](/blog/microsoft-365-built-in-agents/) *(the hub)*
- [The Analyst Agent in Microsoft 365 Copilot](/blog/microsoft-365-analyst-agent/) *(its sibling)*
- [The Microsoft 365 Facilitator Agent in Teams](/blog/microsoft-365-facilitator-agent/)
- [The Planner Agent (Project Manager agent)](/blog/microsoft-365-project-manager-agent/)
