---
title: "The Analyst Agent in Microsoft 365 Copilot"
list_title: "Analyst Agent (Copilot)"
hub_id: "built-in-agents"
description: "What the Analyst agent in Microsoft 365 Copilot does — turns raw data from Excel, CSV and other files into plain-English insights, charts and tables."
date: 2026-06-23
lastmod: 2026-06-23
draft: false
card_tag: "Agents"
tag_class: "ai"
layout: "notebook"
stamp: "analyst agent"
intro_note: "← the data-analysis agent in Microsoft 365 Copilot — point it at your spreadsheets and ask a plain-English question, get back insights, charts and tables"
images: ["images/og/blog/microsoft-365-analyst-agent.jpg"]
og_headline: "The Analyst Agent, Explained"
og_glyph: "compare"
tags:
  - microsoft-365
  - copilot
  - analyst-agent
  - agents
  - data-analysis
  - ai
faq:
  - question: "What is the Analyst agent in Microsoft 365 Copilot?"
    answer: "Analyst is a built-in agent in the Microsoft 365 Copilot app that does data analysis for you. You attach data — Excel spreadsheets, CSV files and other sources — ask a plain-English question, and it calculates statistics, spots trends and outliers, and returns an easy-to-read report with charts and tables. Microsoft describes it as like having a skilled data scientist on hand, without needing to be one."
  - question: "How is Analyst different from Copilot in Excel?"
    answer: "Copilot in Excel helps you inside a single workbook. Analyst is built for the cross-file job: it can pull together multiple spreadsheets, CSVs and other data sources, consolidate them, and reason across the lot to answer a question — then hand back a written report with visuals. Think 'analyse all of these for me' rather than 'help me in this sheet'."
  - question: "Do I need a licence for Analyst?"
    answer: "Yes — Analyst runs inside the Microsoft 365 Copilot app and needs a Microsoft 365 Copilot licence. It reached general availability on 2 June 2025, alongside its sibling, the Researcher agent. You'll find it under Agents in the left navigation."
  - question: "What data can Analyst work with?"
    answer: "You attach the files that hold the data you want analysed — Excel spreadsheets, CSV files and similar sources — by selecting the + icon and Attach content, then uploading from your device or picking from OneDrive. It can work across more than one file at a time, which is the point: it consolidates them so you don't have to."
  - question: "Does Analyst write code?"
    answer: "Yes — under the hood it can write and run code (Python) to crunch your data. Microsoft built it on OpenAI's o3-mini reasoning model and it uses chain-of-thought reasoning, working through a problem step by step to refine its answer. You can view the code it runs in real time to check its work, or just take the insights it produces."
  - question: "How reliable are Analyst's results?"
    answer: "It's a strong starting point, not an unchecked oracle. Like all generative AI, its output is labelled as possibly incorrect, so sanity-check the numbers and the question it actually answered before you act on them — especially for anything high-stakes. The benefit is speed: minutes instead of hours wrangling rows by hand."
  - question: "What's the difference between Analyst and Researcher?"
    answer: "They're a pair, both in the Microsoft 365 Copilot app under Agents. Researcher does deep, multi-step research across documents and the web and returns a cited report. Analyst crunches structured data — spreadsheets and files — and returns data insights with charts. Use Researcher for 'go find out about X'; use Analyst for 'make sense of this data'."
  - question: "Is Analyst available in government clouds?"
    answer: "Not yet. Microsoft's service description notes that built-in agents like Analyst and Researcher are not yet available in GCC, GCC High or DoD environments. Check the service description for the current status if you run a government tenant."
sitemap:
  priority: 0.8
founder_note: |
  Analyst is the agent I wish I'd had every time someone dropped three spreadsheets on me and asked "so what's the story here?" You attach the files, ask the question in plain English, and it does the part I'm slowest at — consolidating the data and crunching it — then hands back something readable.

  It's the data sibling of Researcher: same place in Microsoft 365 Copilot, same idea of a reasoning agent doing real work, just pointed at your numbers instead of the web. Here's what it does and where it fits. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) guide.** Analyst is **generally available** (since June 2025) with a Microsoft 365 Copilot licence. **Last verified: 23 June 2026.**

</div>

*The hub for this series — [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) — maps every agent Microsoft ships. This spoke is the detailed walkthrough of Analyst; its sibling is the [Researcher agent](/blog/microsoft-365-researcher-agent/).*

<p><img src="/images/blog/microsoft-365-analyst-agent/01-analyst-agents-nav.webp" alt="The left navigation of the Microsoft 365 Copilot app showing the Agents group, with Researcher and Analyst listed at the top, followed by Idea Coach, Prompt Coach and Surveys, plus All agents and Create agent links." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Where to find Analyst: under **Agents** in the Microsoft 365 Copilot app, right next to Researcher.*

---

## TL;DR

- **Analyst** is a built-in agent in the **Microsoft 365 Copilot app** that **turns raw data into insights** — attach files, ask a plain-English question, get a readable report with charts and tables.
- It's built for the **cross-file** job: consolidate **multiple spreadsheets / CSVs** and reason across them — more than Copilot can do inside one sheet.
- Under the hood it's **OpenAI's o3-mini** reasoning model and it can **write and run code (Python)** — and you can watch the code run if you want to check its work, or just take the results.
- **On-switch:** a **Microsoft 365 Copilot** licence. Find it under **Agents**, next to Researcher.
- **You don't have to be a data analyst** — that's the whole point.
- **Not in government clouds** (GCC, GCC High, DoD) yet.

> 🧭 **Jump to:** [What it is](#what) · [Analyst vs Copilot in Excel](#vs) · [How to use it](#how) · [Example prompts](#prompts) · [Researcher or Analyst?](#siblings) · [Licensing](#licensing) · [Limits](#limits) · [Sources](#sources)
---

## What Analyst actually is {#what}

**Analyst** is, in Microsoft's words, *"an AI-powered assistant for data analysis… like having a skilled data analyst on hand to help you make sense of data quickly without requiring advanced expertise."*

The job it removes is the tedious one: looking through thousands of rows across multiple files, trying to consolidate them, and then working out what they mean. You hand Analyst the files and a question, and it calculates the statistics, identifies the trends, surfaces the outliers, and writes it up in plain language with **charts and tables**.

It's built on **OpenAI's o3-mini reasoning model** and uses **chain-of-thought reasoning** — it works through a problem in steps, taking as many as it needs to refine the answer, and it can **write and run Python** to do the heavy lifting. You can **view the code it runs in real time** and check its work — or just take the insight.

---

## Analyst vs Copilot in Excel {#vs}

Easy to confuse, genuinely different:

| **Copilot in Excel** | **The Analyst agent** |
|---|---|
| Helps you **inside one workbook** | Works **across multiple files** at once |
| Formulas, charts, analysis in the sheet | Consolidates spreadsheets, CSVs, other data |
| "Help me in this spreadsheet" | "Make sense of all of this data" |
| Lives in Excel | Lives in the Microsoft 365 Copilot app |

If your data lives in one sheet, Copilot in Excel is right there. If the story is spread across several files, that's Analyst.

---

## How to use it {#how}

1. Open the **Microsoft 365 Copilot** app and select **Analyst** under **Agents**.
2. **Type a question** about the data you want to analyse.
3. Select the **+** icon, then **Attach content**, and supply the file(s) — upload from your device or pick from **OneDrive**.
4. Let it work — it consolidates and analyses the data, reasoning through it step by step.
5. **Read the report** — plain-English findings with the charts and tables to back them up.

---

## Example prompts — what you can actually ask it {#prompts}

The pattern that works every time: **attach your files first, then ask a specific question** — not "analyse this," but "compare X by Y and tell me the trend." Microsoft's own starter prompts, plus more in the same shape, grouped by the job you're doing:

**Sales & revenue** *(Microsoft's own example prompts)*

> 📎 *"Compare sales data by region and quarter and highlight key trends."*

> 📎 *"Identify top-performing products or services based on customer engagement metrics."*

**Customers & retention** *(based on Microsoft's described use cases)*

> 📎 *"Identify our top customers who aren't fully using the products they've purchased."*

> 📎 *"Show how discounts affected customer behaviour over the last year."*

**Product & marketing**

> 📎 *"Visualise product sentiment and usage trends to inform our go-to-market plan."*

> 📎 *"Find the outliers in this dataset and explain what might be driving them."*

Microsoft's own write-up describes people using Analyst to assess how discounts affect customer behaviour, find customers who aren't fully using what they bought, and visualise sentiment and usage trends — the kind of question you'd normally hand to a data analyst and wait a day for.

> 🧩 **A good habit:** ask one clear question per run. If you need five things, that's often five sharper prompts — each gets a cleaner answer than one sprawling "tell me everything about this data."

> 📎 **Tip:** because Analyst can **run code**, you can use the **code-view option** to inspect the Python it ran — so you (or a real analyst) can check the method, not just the answer.

---

## Researcher or Analyst — which one? {#siblings}

Analyst has a sibling, the [Researcher agent](/blog/microsoft-365-researcher-agent/), in the same place. They look similar but do opposite halves of "knowledge work":

| You have… | You want… | Reach for… |
|---|---|---|
| A question about a topic | Deep research + a cited report | **Researcher** |
| Spreadsheets and raw data | Consolidated data insights + charts | **Analyst** |

Both are reasoning agents, both sit under **Agents** in Microsoft 365 Copilot, and they came out of the same June 2025 launch. Many people use both — Researcher to gather the picture, Analyst to crunch the numbers behind it.

---

## Licensing {#licensing}

- **Licence:** a **Microsoft 365 Copilot** licence. Analyst debuted in April 2025 through the Frontier program and reached **general availability on 2 June 2025**.
- **Where:** the **Microsoft 365 Copilot** app, under **Agents**.
- **Allowance:** included with the licence; at general availability a Microsoft 365 Copilot licence included **25 combined** Researcher + Analyst queries a month, and like Researcher that figure may change — confirm the current number in Microsoft's docs.

---

## Limits and good-to-knows {#limits}

- **Check the output.** It's labelled as possibly incorrect — sanity-check the numbers and confirm it answered the question you meant.
- **It needs the data attached.** Analyst works on the files you give it; point it at the right sources for a useful answer.
- **Fewer languages than Researcher.** At general availability Analyst supported **8 languages** (Researcher supported 37), with more added since — check Microsoft's docs if you work in a non-English language.
- **Allowance:** at GA a Microsoft 365 Copilot licence included **25 combined** Researcher + Analyst queries a month; that figure may change, so confirm the current number.
- **Government clouds:** not available in **GCC, GCC High or DoD** yet.

---

## Official Microsoft sources {#sources}

- [Get started with Analyst in Microsoft 365 Copilot](https://support.microsoft.com/en-us/topic/get-started-with-analyst-in-microsoft-365-copilot-ff505b9c-a06c-4be9-b855-69d89b1d25d2)
- [Researcher and Analyst are now generally available (Microsoft 365 blog)](https://www.microsoft.com/en-us/microsoft-365/blog/2025/06/02/researcher-and-analyst-are-now-generally-available-in-microsoft-365-copilot/)
- [Get started with Researcher in Microsoft 365 Copilot](https://support.microsoft.com/en-us/topic/get-started-with-researcher-in-microsoft-365-copilot-e63ab760-f3de-4c47-ae87-dad601b0e9c4)
- [Microsoft 365 Copilot service description (government-cloud availability)](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-copilot)

---

## The other built-in agents

- [Microsoft 365's Built-in Agents — the complete guide](/blog/microsoft-365-built-in-agents/) *(the hub)*
- [The Researcher Agent in Microsoft 365 Copilot](/blog/microsoft-365-researcher-agent/) *(its sibling)*
- [The Microsoft 365 Facilitator Agent in Teams](/blog/microsoft-365-facilitator-agent/)
- [The Planner Agent (Project Manager agent)](/blog/microsoft-365-project-manager-agent/)
