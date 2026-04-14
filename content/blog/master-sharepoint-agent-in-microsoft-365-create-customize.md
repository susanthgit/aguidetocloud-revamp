---
title: "Master SharePoint Agent in Microsoft 365 | Create, Customize & Use in Teams (Full Beginner Guide)"
description: "Learn how to create, customise, and deploy SharePoint Agents in Microsoft 365 Copilot — build AI assistants grounded in your organisation's documents and sites."
date: 2025-08-26
youtube_id: "CPbJ1u-6uBU"
card_tag: "Agentic AI"
tag_class: "ai"
images: ["images/og/blog/master-sharepoint-agent-in-microsoft-365-create-customize.jpg"]
---

## What Is a SharePoint Agent?

A **SharePoint Agent** is a custom AI assistant that you create from a SharePoint site. It answers questions using **only the content on that specific site** — documents, pages, lists, and libraries. Think of it as a smart chatbot that has read every document on your SharePoint site and can answer questions about them instantly.

| Question | Answer |
|----------|--------|
| **What does it know?** | Only the content on the SharePoint site you created it from |
| **Can it access other sites?** | No — it's scoped to one site (and optionally specific folders/libraries) |
| **Does it make things up?** | It's grounded in your documents — responses include citations with links back to the source files |
| **Who can use it?** | Anyone who has access to the SharePoint site |
| **Where does it work?** | Microsoft 365 Copilot Chat, Microsoft Teams, and SharePoint itself |

> **In simple terms:** A SharePoint Agent is like having a colleague who has read every document on your site and can answer any question about them — in seconds.

---

## Why Create a SharePoint Agent?

### The Problem It Solves

Every organisation has the same challenge: **critical knowledge is buried in documents**. Policies, procedures, product specs, FAQs, training materials — they exist, but finding the right answer takes time.

Without a SharePoint Agent:
- Employees search SharePoint, scroll through results, open multiple documents, and hope they find the answer
- New hires struggle to find onboarding information
- Support teams answer the same questions repeatedly
- Knowledge is siloed in documents that nobody reads

With a SharePoint Agent:
- Ask a question in natural language → get an instant answer with citations
- New hires get answers from onboarding docs without bothering colleagues
- Support teams point customers/staff to the agent instead of manually answering
- The agent stays up to date as documents change — no retraining needed

---

## Real-World Use Cases

| Department | SharePoint Site | Agent Purpose |
|------------|----------------|---------------|
| **HR** | HR Policies site | Employees ask about leave, benefits, dress code, expenses — agent answers from policy docs |
| **IT** | IT Help Desk site | Staff ask "How do I reset my password?" or "How do I connect to VPN?" — agent answers from IT guides |
| **Sales** | Product Documentation site | Sales reps ask about features, pricing, competitor comparisons — agent answers from product sheets |
| **Legal** | Compliance site | Staff ask about data handling, privacy, or contract terms — agent answers from legal docs |
| **Onboarding** | New Starter site | New hires ask about org structure, tools, processes — agent answers from onboarding materials |
| **Project teams** | Project site | Team members ask about timelines, decisions, specs — agent answers from project documents |

---

## How to Create a SharePoint Agent

### Step 1: Go to Your SharePoint Site

Navigate to the SharePoint site you want to create an agent for. You need **site owner or member** permissions.

### Step 2: Open the Agent Builder

1. Click the **Copilot** icon on the site (or go to **Site settings** → **Copilot agents**)
2. Select **Create agent**

### Step 3: Configure the Agent

| Setting | What to do |
|---------|-----------|
| **Name** | Give it a clear name (e.g., "HR Policy Assistant", "IT Help Bot") |
| **Description** | Describe what it does — this helps users understand when to use it |
| **Instructions** | Tell the agent how to behave: tone, scope, what to do when it doesn't know an answer |
| **Knowledge sources** | Select which document libraries, folders, or specific files the agent should use |
| **Welcome message** | Set the first message users see when they open the agent |

### Step 4: Test It

Use the built-in test panel to ask questions and verify the agent provides accurate, cited answers from your documents.

### Step 5: Share It

Once you're happy, share the agent:
- **In Microsoft Teams** — add it as a tab in a channel or make it available in Teams chat
- **In Copilot Chat** — users can find and `@mention` it in Microsoft 365 Copilot
- **On the SharePoint site** — visitors see the agent icon and can ask questions directly

---

## Customising Your Agent's Behaviour

### Writing Good Instructions

The **instructions** field is the most important configuration. It tells the agent how to behave. Here are best practices:

**Good example:**
> "You are the IT Help Desk assistant for Contoso Ltd. Answer questions about IT policies, software setup, and troubleshooting based on the documents in this site. Be friendly and concise. If you don't know the answer, say 'I don't have information about that — please contact the IT Help Desk at helpdesk@contoso.com'. Always include a citation to the source document."

**Bad example:**
> "Help people with IT stuff."

### Scoping Knowledge Sources

You can narrow what the agent knows by selecting **specific libraries or folders** instead of the entire site:

- **Whole site** → agent knows everything on the site
- **Specific library** → agent only knows documents in that library (e.g., "Policies" library only)
- **Specific folders** → agent only knows documents in selected folders

> **Tip:** Start narrow and expand. It's better to have an agent that gives precise answers from a focused set of documents than one that gives vague answers from too many sources.

---

## Data Security and Permissions

SharePoint Agents inherit the **same security permissions** as the underlying SharePoint site:

- The agent can only access documents that **the user asking the question** has permission to see
- If a user doesn't have access to a specific document, the agent won't include that document's content in its response
- All interactions are logged in the **Microsoft 365 audit log**
- No data leaves your Microsoft 365 tenant boundary

This means:
- ✅ A marketing team member asking the HR agent will only see answers from documents they have access to
- ✅ Confidential documents restricted to HR staff won't appear in responses to non-HR users
- ✅ External guests can use the agent but only see content shared with them

📖 [SharePoint Copilot best practices](https://learn.microsoft.com/en-us/sharepoint/sharepoint-copilot-best-practices) · [Copilot data privacy](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy)

---

## Preparing Your SharePoint Site for an Agent

Before creating an agent, optimise your site's content for the best results:

### Content Quality Checklist

| ✅ Do | ❌ Don't |
|-------|---------|
| Use clear, descriptive document titles | Use generic names like "Doc1.docx" |
| Organise documents in logical folders/libraries | Dump everything in a single library |
| Keep documents up to date | Leave outdated policies published |
| Use headings and structure in documents | Write wall-of-text documents |
| Remove duplicate documents | Have multiple versions of the same file |
| Set correct permissions on libraries | Over-share sensitive content |

### SharePoint Search Optimisation

The agent uses the same search infrastructure as SharePoint Search. Microsoft recommends:

- **Make sure content can be found** — ensure documents are indexed and not blocked from search
- **Use metadata and columns** — tag documents with relevant metadata (department, topic, date)
- **Review sharing settings** — use [SharePoint Advanced Management](https://learn.microsoft.com/en-us/sharepoint/advanced-management) to audit oversharing

📖 [Optimise SharePoint content for search](https://learn.microsoft.com/en-us/sharepoint/make-sure-content-can-be-found) · [SharePoint Advanced Management](https://learn.microsoft.com/en-us/sharepoint/advanced-management)

---

## SharePoint Agent vs Other Copilot Agents

| Agent | Knowledge Source | Best For |
|-------|-----------------|---------|
| **SharePoint Agent** | One SharePoint site | Department-specific Q&A from documents |
| **Copilot Studio Agent** | Multiple data sources (SharePoint, APIs, databases) | Complex workflows and multi-source knowledge |
| **Word Agent** | Open document + M365 data | Creating and editing Word documents |
| **Analyst Agent** | Excel workbook | Data analysis and chart creation |
| **Researcher Agent** | Web + M365 data | Deep research and briefing generation |

> **When to use SharePoint Agent:** You want a simple, no-code agent grounded in one site's documents.
> **When to use Copilot Studio:** You need complex logic, multiple data sources, or Power Automate integration.

---

## Licensing Requirements

| Licence | Can Create Agents? | Can Use Agents? |
|---------|-------------------|-----------------|
| Microsoft 365 Copilot ($30/user/month) | ✅ Yes | ✅ Yes |
| Copilot Chat (free, included in M365) | ❌ No | ✅ Yes (if shared with them) |
| SharePoint site access only | ❌ No | ❌ No |

To create a SharePoint Agent, you need a **Microsoft 365 Copilot licence**. Users who are shared the agent only need access to the SharePoint site.

---

## 📚 Official Microsoft Resources

- [SharePoint Copilot best practices](https://learn.microsoft.com/en-us/sharepoint/sharepoint-copilot-best-practices)
- [Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview)
- [Microsoft 365 Copilot agents](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility)
- [SharePoint Advanced Management](https://learn.microsoft.com/en-us/sharepoint/advanced-management)
- [Optimise content for SharePoint search](https://learn.microsoft.com/en-us/sharepoint/make-sure-content-can-be-found)
- [Copilot data privacy and security](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy)
- [Copilot Prompt Gallery](https://m365.cloud.microsoft/copilot-prompts)

## 🔗 Related Content on This Site

- [Master All 6 Copilot Agents](/blog/master-all-6-microsoft-365-copilot-agents/)
- [Copilot Studio Beginner Lab — Build Your First Agent](/blog/copilot-studio-beginner-lab-part-1-create-deploy/)
- [Copilot Studio Lab Part 2 — Entities & Connectors](/blog/copilot-studio-lab-part-2-entities-connectors-generative/)
- [Master Analyst Agent — Data Analysis](/blog/master-analyst-agent-real-world-data-analysis-trends/)
- [Master Researcher Agent](/blog/master-researcher-agent-save-time-with-ai-powered/)
- [M365 Copilot Full Tutorial](/blog/microsoft-365-copilot-full-tutorial-word-excel-teams/)
- [Browse all AI tutorials](/ai-hub/)

## Frequently Asked Questions

**Can I create multiple agents on one SharePoint site?**
Yes — you can create multiple agents on the same site, each scoped to different document libraries or folders. For example, an HR site could have a "Leave Policy Agent" and a "Benefits Agent."

**Does the agent update automatically when documents change?**
Yes — the agent uses SharePoint's search index, which updates automatically when documents are added, modified, or deleted. There's no manual retraining needed.

**Can external guests use the agent?**
External guests can interact with the agent if they have access to the SharePoint site. The agent will only show content the guest has permission to view.

**What file formats does the agent understand?**
The agent can read Word documents (.docx), PDFs, PowerPoint presentations (.pptx), Excel files (.xlsx), and SharePoint pages. It works best with well-structured text content.

**Can the agent take actions (like creating tickets or sending emails)?**
No — SharePoint Agents are **read-only knowledge assistants**. They answer questions from documents but can't perform actions. For action-based agents, use **Copilot Studio** with Power Automate integration.

**How accurate are the responses?**
Responses are grounded in your documents and include **citations** linking back to the source. However, like all AI, it may occasionally misinterpret content. Always verify critical information against the source document.

---

## 💡 Want More?

- 📺 [Subscribe to A Guide to Cloud & AI on YouTube](https://www.youtube.com/susanthsutheesh) for new tutorials every week
- 📰 Check out the [AI News page](/ai-news/) for the latest AI headlines
- ☕ [Download free resources](https://ko-fi.com/aguidetocloud/shop)

---

*This article accompanies a video tutorial on the [A Guide to Cloud & AI](https://www.youtube.com/susanthsutheesh) YouTube channel. Written for beginners — no prior experience required.*
