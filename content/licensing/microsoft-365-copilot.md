---
title: "Microsoft 365 Copilot — Complete Guide, Pricing & Requirements (2026)"
description: "Microsoft 365 Copilot — AI in every Office app, grounded on your data. $30/user/month add-on. Requirements and plans."
type: "licensing"
layout: "single"
plan_name: "Microsoft 365 Copilot"
plan_id: "copilot-addon"
price: 30
price_note: "Add-on (requires qualifying base plan)"
tagline: "AI assistant in every Office app — grounded on your enterprise data"
plan_category: "Copilot & AI"
badge: ""
ms_official: "https://www.microsoft.com/en-us/microsoft-365/copilot/enterprise"
m365maps: "https://m365maps.com/files/Microsoft-365-Copilot.htm"
last_verified: "April 2026"
faq:
  - q: "How much does Microsoft 365 Copilot cost?"
    a: "Microsoft 365 Copilot is $30 per user per month as an add-on. It requires a qualifying base plan (M365 E3, E5, Business Standard, or Business Premium). M365 E7 ($99/user/month) includes Copilot at no extra cost."
  - q: "What is the difference between Copilot Chat and Microsoft 365 Copilot?"
    a: "Copilot Chat is free basic AI chat that does NOT access your enterprise data. Microsoft 365 Copilot ($30/user/month) is grounded on your emails, files, meetings, and calendar — it knows your work context."
  - q: "Which plans support the Copilot add-on?"
    a: "Microsoft 365 E3, E5, Business Standard, and Business Premium. NOT supported on Office 365-only plans, Frontline (F1/F3), or Business Basic."
  - q: "Do I need Copilot for every user?"
    a: "No. You can assign Copilot to specific users. Most organisations start with 10-20% of users (knowledge workers, executives) and expand based on ROI."
---

## What Does Microsoft 365 Copilot Do?

Copilot is an **AI assistant embedded directly in the Office apps you use every day**. Unlike Copilot Chat (which is a standalone chatbot), M365 Copilot is grounded on your **enterprise data** — your emails, files, meetings, calendar, and Teams conversations.

```mermaid
flowchart LR
    COP["🤖 M365 Copilot\n$30/user/mo"]
    GRAPH["📊 Microsoft Graph\nYour emails, files,\nmeetings, calendar"]
    APPS["📧 Where It Works\nWord · Excel · PPT\nOutlook · Teams\nOneNote · Loop"]
    LLM["🧠 AI Model\nGPT-4 class\nEnterprise-grade"]
    COP --> GRAPH
    COP --> APPS
    COP --> LLM
    style COP fill:#1e3a5f,stroke:#8b5cf6,color:#ffffff
    style GRAPH fill:#1e293b,stroke:#3b82f6,color:#ffffff
    style APPS fill:#1e293b,stroke:#22c55e,color:#ffffff
    style LLM fill:#1e293b,stroke:#f59e0b,color:#ffffff
```

### What It Does in Each App

| App | What Copilot Does | Example |
|-----|------------------|---------|
| **Word** | Draft, rewrite, summarise documents | "Draft a project proposal based on last quarter's report" |
| **Excel** | Analyse data, create formulas, generate charts | "What are the top 5 trends in this sales data?" |
| **PowerPoint** | Create presentations from prompts or documents | "Turn this Word doc into a 10-slide deck" |
| **Outlook** | Summarise email threads, draft replies, schedule | "Summarise this 47-email thread in 3 bullet points" |
| **Teams** | Meeting recap, action items, catch-up summaries | "What did I miss in the 2pm meeting?" |
| **OneNote** | Organise notes, generate summaries, draft plans | "Create a project plan from these meeting notes" |
| **Loop** | Co-author with AI, brainstorm, draft collaboratively | "Help me brainstorm 10 marketing campaign ideas" |

## Copilot Chat vs Microsoft 365 Copilot

This is the **#1 confusion point**:

| Feature | Copilot Chat (Free) | M365 Copilot ($30/mo) |
|---------|:-------------------:|:---------------------:|
| Price | Free | $30/user/month |
| AI chat interface | ✅ | ✅ |
| **Access to your enterprise data** | ❌ | ✅ |
| **Works inside Office apps** | ❌ | ✅ |
| **Meeting summaries in Teams** | ❌ | ✅ |
| **Email summaries in Outlook** | ❌ | ✅ |
| Available in Word/Excel/PPT | ❌ (removed April 2026) | ✅ |

> **💡 Plain English:** Copilot Chat is like talking to ChatGPT — it doesn't know your work. M365 Copilot knows your emails, files, meetings, and calendar. That's the $30/month difference.

## Which Plans Support Copilot?

| Base Plan | Copilot Add-On? | Total Cost |
|-----------|:--------------:|:----------:|
| M365 E3 ($39) | ✅ | $69/user/mo |
| M365 E5 ($60) | ✅ | $90/user/mo |
| **M365 E7 ($99)** | **Included** | $99/user/mo |
| Business Standard ($14) | ✅ | $44/user/mo |
| Business Premium ($22) | ✅ | $52/user/mo |
| Business Basic ($7) | ❌ | — |
| Office 365 E1/E3/E5 | ❌ | — |
| Frontline F1/F3 | ❌ | — |

> **💡 Tip:** If you're on E5 and buying Copilot ($90 total), compare with E7 at $99 — you get Copilot PLUS Agent 365 and the full Entra Suite for $9 more.

## Requirements Before Deploying

1. **Qualifying base licence** — see table above
2. **Entra ID authentication** — users must sign in via Entra (formerly Azure AD)
3. **Latest apps** — New Outlook, current Teams, OneDrive enabled
4. **Data governance review** — Copilot surfaces data the user can access. Review permissions first!
5. **Network** — No special requirements, but ensure Teams/Office connectivity

> **⚠️ Critical:** Copilot will surface **everything a user has access to**. If your SharePoint permissions are overly broad, Copilot will expose data that was technically accessible but practically hidden. **Audit permissions before deploying.**

## Deployment Strategy

Most organisations don't deploy Copilot to everyone at once. The recommended approach:

```mermaid
flowchart LR
    P1["Phase 1\n5-10% of users\nExecutives + Champions\n1-2 months"]
    P2["Phase 2\n20-30% of users\nKnowledge workers\n2-3 months"]
    P3["Phase 3\n50-100% of users\nBroad rollout\nOngoing"]
    P1 --> P2 --> P3
    style P1 fill:#1e293b,stroke:#f59e0b,color:#ffffff
    style P2 fill:#1e293b,stroke:#3b82f6,color:#ffffff
    style P3 fill:#1e293b,stroke:#22c55e,color:#ffffff
```

## Frequently Asked Questions


**1. Is Copilot worth $30/user/month?**

It depends on the user. For knowledge workers who live in Outlook and Teams, the meeting summaries alone can save 30+ minutes per day. For users who rarely use Office apps, it's probably not worth it.



**2. Can I try Copilot before committing?**

Yes. Microsoft offers trial licences (typically 25 seats for 30 days). Ask your Microsoft rep or partner.



**3. Does Copilot store my prompts?**

Copilot follows your Microsoft 365 compliance and data residency policies. Prompts are not used to train the AI model. Data stays within your tenant's geographic boundary.

