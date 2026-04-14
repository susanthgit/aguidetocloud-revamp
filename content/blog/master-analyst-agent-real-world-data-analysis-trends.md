---
title: "Master Analyst Agent | Real-World Data Analysis, Trends & Insights using Microsoft 365 Copilot"
description: "Learn how to use the Analyst Agent in Microsoft 365 Copilot for real-world data analysis — trends, insights, charts, PivotTables, and forecasting in Excel."
date: 2025-10-07
youtube_id: "kuPLfYr2YZU"
card_tag: "Agentic AI"
tag_class: "ai"
images: ["images/og/blog/master-analyst-agent-real-world-data-analysis-trends.jpg"]
---

## What Is the Analyst Agent?

The **Analyst Agent** is a specialised AI agent within Microsoft 365 Copilot designed for **data analysis in Excel**. Unlike regular Copilot Chat (which answers questions in the side panel), the Analyst Agent can **directly edit your workbook** — creating tables, charts, PivotTables, formulas, and formatting on your behalf.

Think of it as having a data analyst sitting next to you who can instantly process your data and produce professional outputs.

| Feature | Regular Copilot in Excel | Analyst Agent (Edit with Copilot) |
|---------|------------------------|----------------------------------|
| **Answers questions** | ✅ In the side panel | ✅ In the side panel |
| **Creates charts** | ❌ Suggests only | ✅ Creates directly in your workbook |
| **Builds PivotTables** | ❌ | ✅ Creates and formats them |
| **Writes formulas** | Suggests formulas | ✅ Inserts formulas into cells |
| **Multi-step tasks** | One step at a time | ✅ Plans and executes multiple steps |
| **Reshapes data** | ❌ | ✅ Merges sheets, transforms data |

> **Note:** Microsoft recently renamed "Agent Mode" to **"Edit with Copilot"** as agentic capabilities become a standard part of how Copilot works. The capability is the same — it's just integrated more naturally into the experience.

---

## How It Works

When you enable Edit with Copilot in Excel, Copilot:

1. **Analyses your prompt** — understands what you're asking for
2. **Creates a step-by-step plan** — breaks complex tasks into actionable steps
3. **Executes directly in your workbook** — creates tables, charts, formulas, and formatting
4. **Reviews its own work** — evaluates whether the output matches your intent
5. **Shows its reasoning** — you can watch the thought process in the Copilot pane

You stay in control at all times — you can undo any change, pause the process, or refine the prompt.

---

## How to Access the Analyst Agent

1. Open **Excel** (web, Windows, or Mac)
2. Click **Home** → **Copilot** to open the pane
3. Edit with Copilot is **on by default** — you'll see the Excel selector in the chat box
4. Alternatively, click the **Tools** menu in Copilot and choose **Edit with Copilot**

### Choose Your AI Model

If you have a paid Microsoft 365 Copilot licence, you can switch between AI models:

| Model | Provider | Best for |
|-------|----------|---------|
| **GPT-5** | OpenAI | General-purpose analysis and reasoning |
| **Claude** | Anthropic | Complex multi-step data transformation |

Use the **model picker dropdown** in the Copilot pane to switch. Your admin must allow Anthropic models in the Microsoft 365 Admin Center.

---

## Real-World Use Cases

### Sales Analysis

> **Prompt:** "Analyse our Q1 sales data. Show me the top 5 products by revenue, create a bar chart comparing regions, and add a column calculating year-over-year growth."

Copilot will:
- Sort and filter your data
- Add a calculated column with the YoY growth formula
- Create a formatted bar chart
- Highlight the top performers

### Financial Modelling

> **Prompt:** "Create an annual financial close report for the business, including a breakdown of product lines across variance to budget and year-over-year growth. Use standard financial formatting."

### Loan Calculator

> **Prompt:** "Build a loan calculator that computes monthly payments based on loan amount, annual interest rate, and term in years. Generate a schedule showing month, payment, principal, interest, and remaining balance."

### Budget Tracking

> **Prompt:** "Create a monthly household budget tracker with categories like Rent, Groceries, Utilities, and Entertainment. Apply conditional formatting and data bars for % Over/Under Budget. Add a donut chart to visualise spending distribution."

### Trend Detection

> **Prompt:** "Look at the last 12 months of customer support tickets. Identify trends — which categories are increasing? Create a line chart showing monthly volume by category."

---

## What the Analyst Agent Can Create

| Output Type | Examples |
|------------|---------|
| **Tables** | Formatted data tables with headers, filters, and sorting |
| **Charts** | Bar, line, pie, donut, scatter, area charts |
| **PivotTables** | Grouped and summarised data with row/column breakdowns |
| **Formulas** | SUM, AVERAGE, VLOOKUP, IF, COUNTIF, and complex nested formulas |
| **Conditional formatting** | Data bars, colour scales, icon sets, and custom rules |
| **Calculated columns** | Growth rates, margins, percentages, running totals |

---

## Tips for Getting the Best Results

1. **Be specific about the output format** — "Create a bar chart" is better than "Show me the data"
2. **Reference specific columns** — "Use the Revenue column" helps Copilot find the right data
3. **Ask for multi-step analysis** — the Agent excels at chaining tasks together
4. **Start with clean data** — data in an [Excel Table format](https://support.microsoft.com/en-us/office/overview-of-excel-tables-7ab0bb7d-3a9e-4b56-a3c9-6c94334e492c) works best (select data → Ctrl+T)
5. **Iterate** — if the first output isn't perfect, refine: "Make the chart larger" or "Add percentage labels"
6. **Watch the reasoning panel** — Copilot shows its step-by-step plan so you can understand what it's doing

---

## Important Notes

- **Edit with Copilot only works with the currently open workbook** — it can't access other files, emails, or external data
- **Be careful with shared files** — Copilot makes direct changes. Use undo or [view prior versions](https://support.microsoft.com/en-us/office/view-previous-versions-of-office-files-5c1e076f-a9c9-41b8-8ace-f77b9642e2c2) to revert
- **Complex requests may take a few minutes** — you'll see Copilot's reasoning in the pane while it works
- **For simple tasks** like inserting a single chart, Excel's built-in Recommended Charts may be faster
- Supported in **English, Spanish, Japanese, French, German, Portuguese, Italian, Chinese, Korean, Dutch**, and many more languages

---

## Licensing

| Licence | Edit with Copilot Access |
|---------|------------------------|
| Microsoft 365 Personal/Family + AI credits | ✅ Yes |
| Microsoft 365 Premium | ✅ Yes (includes model picker) |
| Microsoft 365 Copilot (commercial, $30/user/month) | ✅ Yes (includes model picker) |
| Copilot Chat (free, included in M365/O365) | ✅ Yes (basic access) |

📖 [Full licensing details](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-licensing)

---

## 📚 Official Microsoft Resources

- [Edit with Copilot (Agent Mode) in Excel](https://support.microsoft.com/en-us/office/agent-mode-in-excel-a2fd6fe4-97ac-416b-b89a-22f4d1357c7a)
- [Building Agent Mode in Excel — engineering blog](https://aka.ms/AgentModeinExcel)
- [Choose your AI model in Excel](https://support.microsoft.com/en-us/topic/choose-your-model-when-editing-with-copilot-in-excel-b2c3b3ec-154b-484b-84d0-914a80df395a)
- [FAQ: Editing with Copilot in Excel](https://support.microsoft.com/en-us/office/frequently-asked-questions-about-editing-with-copilot-in-excel-1cfd906d-40b4-46be-8e2d-65b893e28a02)
- [Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview)
- [Copilot data privacy and security](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy)
- [Copilot Prompt Gallery](https://m365.cloud.microsoft/copilot-prompts)

## 🔗 Related Content on This Site

- [Copilot in Excel — 20 Powerful Features](/blog/copilot-in-excel-tutorial-20-powerful-features-to/)
- [Master All 6 Copilot Agents](/blog/master-all-6-microsoft-365-copilot-agents/)
- [Master Researcher Agent](/blog/master-researcher-agent-save-time-with-ai-powered/)
- [Master SharePoint Agent](/blog/master-sharepoint-agent-in-microsoft-365-create-customize/)
- [M365 Copilot Full Tutorial](/blog/microsoft-365-copilot-full-tutorial-word-excel-teams/)
- [Browse all AI tutorials](/ai-hub/)
- [Daily AI News](/ai-news/)

## Frequently Asked Questions

**Is the Analyst Agent the same as "Agent Mode" in Excel?**
Yes — Microsoft recently renamed it from "Agent Mode" to "Edit with Copilot" to simplify the terminology. The functionality is the same: Copilot can directly create and edit content in your workbook.

**Can the Analyst Agent access data from other files?**
No — Edit with Copilot only works with the currently open workbook. It can't pull data from other Excel files, emails, or enterprise systems.

**Does it work with existing spreadsheets?**
Yes — you can open an existing workbook and ask Copilot to analyse, reformat, or enhance the data. It works best when your data is in an Excel Table format.

**Can I undo changes made by Copilot?**
Yes — you can use Ctrl+Z to undo individual changes, or view prior versions of the file to revert to an earlier state.

**Do I need a paid licence?**
Edit with Copilot is now available to Copilot Chat users (free tier) as well as paid Microsoft 365 Copilot subscribers. The model picker (to switch between OpenAI and Anthropic models) requires a paid licence.

**What's the best way to prepare my data?**
Format your data as an Excel Table (select data → Ctrl+T). Use clear column headers and avoid merged cells. Clean, structured data gives Copilot the best foundation to work with.

---

## 💡 Want More?

- 📺 [Subscribe to A Guide to Cloud & AI on YouTube](https://www.youtube.com/susanthsutheesh) for new tutorials every week
- 📰 Check out the [AI News page](/ai-news/) for the latest AI headlines
- ☕ [Download free resources](https://ko-fi.com/aguidetocloud/shop)

---

*This article accompanies a video tutorial on the [A Guide to Cloud & AI](https://www.youtube.com/susanthsutheesh) YouTube channel. Written for beginners — no prior experience required.*
