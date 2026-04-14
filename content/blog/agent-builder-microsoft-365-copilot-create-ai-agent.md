---
title: "Agent Builder in Microsoft 365 Copilot | Create Your Own AI Agent — Hands-On Lab"
description: "Learn how to create custom AI agents using Agent Builder (Copilot Studio Lite) in Microsoft 365 Copilot — step-by-step guide with natural language, knowledge sources, and templates."
date: 2025-05-07
youtube_id: "WbTdbOrNSxs"
card_tag: "Agentic AI"
tag_class: "ai"
images: ["images/og/blog/agent-builder-microsoft-365-copilot-create-ai-agent.jpg"]
---

## What Is Agent Builder?

**Agent Builder** (also known as **Copilot Studio Lite**) is a built-in feature inside Microsoft 365 Copilot that lets you create custom AI agents — **without writing any code**. You describe what you want the agent to do in natural language, and Agent Builder configures it for you automatically.

| Question | Answer |
|----------|--------|
| **Where is it?** | Built directly into Microsoft 365 Copilot — no separate app needed |
| **Who can use it?** | Anyone with a Microsoft 365 Copilot licence ($30/user/month) |
| **Do I need coding skills?** | No — describe your agent in plain English |
| **How is it different from Copilot Studio?** | Agent Builder is the lightweight version for quick, simple agents. Copilot Studio (full) is for complex agents with APIs, Power Automate, and custom connectors |

> **In simple terms:** Agent Builder is like creating a custom ChatGPT that knows your company's documents and follows your specific instructions — all within Microsoft 365.

---

## Agent Builder vs Copilot Studio (Full)

This is an important distinction:

| Feature | Agent Builder (Copilot Studio Lite) | Copilot Studio (Full) |
|---------|-------------------------------------|----------------------|
| **Access** | Inside Microsoft 365 Copilot app | Separate app at copilotstudio.microsoft.com |
| **Creation method** | Natural language or simple configure tab | Full canvas with visual designer |
| **Knowledge sources** | SharePoint, OneDrive, web, Copilot connectors | All of the above + custom APIs, databases, Dataverse |
| **Actions** | Code interpreter, image generator | Power Automate flows, HTTP actions, custom connectors |
| **Topics and entities** | ❌ Not available | ✅ Full topic-based conversation design |
| **Publishing** | Share within M365 Copilot and Teams | Publish to Teams, websites, Facebook, Slack, and more |
| **Licensing** | Included with M365 Copilot licence | Separate Copilot Studio licence required for advanced features |
| **Best for** | Quick, knowledge-grounded Q&A agents | Complex multi-step workflows with external integrations |

> **Rule of thumb:** Start with Agent Builder. If you need more than knowledge + instructions, upgrade to Copilot Studio (full).

---

## Three Ways to Create an Agent

Agent Builder gives you three approaches:

### 1. Natural Language (Recommended)

Just **describe** what you want. Agent Builder understands your intent and auto-configures everything:

> "Create an agent that helps new employees at Contoso find answers about onboarding, IT setup, benefits, and office locations. Use the documents in our HR SharePoint site."

Agent Builder automatically generates:
- **Name** and **description**
- **Instructions** (including guidelines, steps, and error handling)
- **Knowledge sources** (adds the SharePoint site you mentioned)
- **Starter prompts** (suggested questions for users)

You can refine by continuing the conversation: *"Also add the ability to create images"* or *"Change the tone to be more formal."*

### 2. Manual Configuration (Configure Tab)

If you prefer full control, click **Skip to configure** and fill in each field yourself:

| Field | Character Limit | Description |
|-------|----------------|-------------|
| **Name** | 30 characters | Descriptive and unique — shown to users |
| **Icon** | 192×192 px PNG, 1 MB max | Use AI to generate, browse library, or upload your own |
| **Description** | 1,000 characters | Tells the LLM when to activate your agent — keep it precise |
| **Instructions** | 8,000 characters | The core behaviour rules — what the agent does, how it responds, error handling |
| **Knowledge** | Up to 20 sources | SharePoint sites, folders, files, web content, or Copilot connectors |
| **Capabilities** | Toggle on/off | Code interpreter (documents, charts, code) and image generator |
| **Starter Prompts** | No minimum | Help users understand what the agent can do |

### 3. Templates

Agent Builder includes **pre-built templates** for common use cases — preconfigured with descriptions, instructions, and prompts. Use them as-is or customise:

- **Writing coach** — helps improve writing style and tone
- **Meeting prep** — summarises relevant docs and emails before meetings
- **Team onboarding** — answers questions about a new team
- **Custom** — start from a blank template

---

## Step-by-Step: Create Your First Agent

### Step 1: Open Agent Builder

Go to any of these locations:
- [microsoft365.com/chat](https://microsoft365.com/chat)
- **Microsoft Teams** (desktop or web)

Click **New agent** in the left panel.

### Step 2: Describe Your Agent

Type a natural language description:

> "I need an agent that helps my sales team quickly find product information, pricing, and competitive positioning. It should use our Sales Enablement SharePoint site and respond in a professional but friendly tone."

Agent Builder generates the configuration automatically.

### Step 3: Add Knowledge Sources

Click the **+** in the chat box or go to the **Configure** tab → **Knowledge** section:

| Source Type | What It Accesses | Licence Required |
|------------|-----------------|-----------------|
| **SharePoint sites** | Documents, pages, lists on specific sites | M365 Copilot |
| **SharePoint folders/files** | Specific folders or individual files | M365 Copilot |
| **Web content** | Public websites | M365 Copilot |
| **My emails** | Your Outlook inbox | M365 Copilot (add-on) |
| **My Teams chats** | Your Teams conversations | M365 Copilot (add-on) |
| **Copilot connectors** | Third-party data sources configured by your admin | M365 Copilot (add-on) |

> **Limit:** You can add up to **20 knowledge sources** per agent.

### Step 4: Add Capabilities

Toggle on additional abilities:

- **Create documents, charts, and code** — enables the [code interpreter](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/code-interpreter), allowing the agent to run Python code, create Excel charts, and generate documents
- **Create images** — enables the [image generator](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/image-generator), allowing the agent to create images from prompts

### Step 5: Test Your Agent

Switch to the **Try it** tab. Ask questions and verify the agent responds correctly. The agent updates in real time as you modify instructions or knowledge sources.

> **Tip:** Test edge cases — ask questions the agent shouldn't know. A good agent says "I don't have information about that" rather than making something up.

### Step 6: Share Your Agent

Once you're happy, share it:
- **With specific people** — share directly with colleagues
- **With your team** — add to a Teams channel
- **With your organisation** — submit for admin approval in the app catalogue

---

## Writing Effective Agent Instructions

The **instructions** field is the most important part. It's the "system prompt" that controls how your agent behaves.

### Best Practices

| ✅ Do | ❌ Don't |
|-------|---------|
| Be specific about the agent's scope | Use vague instructions like "help with stuff" |
| Define the tone and style | Assume the agent knows your preferences |
| Include error handling ("If you don't know, say...") | Leave the agent to make up answers |
| Add examples of ideal responses | Write instructions longer than needed |
| Specify what the agent should NOT do | Forget to set boundaries |

### Example: IT Help Desk Agent

```
You are the IT Help Desk assistant for Contoso Ltd.

Your role:
- Answer questions about IT policies, software setup, VPN access, and troubleshooting
- Use ONLY the documents in the IT Knowledge Base SharePoint site
- Be friendly, concise, and professional

Rules:
- Always cite the source document in your response
- If you don't know the answer, say: "I don't have information about that.
  Please contact the IT Help Desk at helpdesk@contoso.com or call ext. 4567"
- Never give advice about topics outside IT (HR, finance, legal, etc.)
- Never share internal passwords or security configurations
```

---

## Real-World Agent Ideas

| Agent | Knowledge Source | What It Does |
|-------|-----------------|-------------|
| **Sales Enablement Bot** | Sales SharePoint site | Answers questions about products, pricing, competitive positioning |
| **HR Policy Assistant** | HR Policies library | Answers questions about leave, benefits, dress code, expenses |
| **New Starter Guide** | Onboarding site | Helps new hires find information about tools, processes, org structure |
| **Project FAQ Bot** | Project team site | Answers questions about timelines, decisions, deliverables |
| **Customer Support Agent** | Product docs site | Answers customer questions from product documentation |
| **Training Assistant** | Learning portal site | Guides employees through training materials and certifications |

---

## Governance and Admin Controls

### For IT Admins

- Admins can **enable or disable** Agent Builder for users in the [Microsoft 365 Admin Center](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-copilot-agents-integrated-apps)
- Agents created with Agent Builder **don't consume Dataverse storage**
- Data processing follows the [Microsoft 365 product terms](https://go.microsoft.com/fwlink/?linkid=2173816)
- The **Allow web search in Copilot** policy takes precedence over per-agent web content settings

### Known Limitations

- Agent Builder is **not available on mobile** (desktop and web only)
- You **can't use these agents in Teams Chat** (only in Microsoft 365 Copilot app and Teams)
- Auto-sharing SharePoint files only works with **specific security groups** (not "everyone in the organisation")
- Customer Managed Keys and Lockbox are **not yet supported**

---

## 📚 Official Microsoft Resources

- [Agent Builder overview](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/copilot-studio-agent-builder)
- [Build agents with Agent Builder](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/copilot-studio-agent-builder-build)
- [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder-add-knowledge)
- [Share and manage agents](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder-share-manage-agents)
- [Write effective agent instructions](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-instructions)
- [Agent templates overview](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-templates-overview)
- [Code interpreter capability](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/code-interpreter)
- [Image generator capability](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/image-generator)
- [Regional availability and language support](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder-regional-availability)
- [Build your first agent (PDF guide)](https://res.public.onecdn.static.microsoft/s01-prod/pdf/Buid-an-agent-with-Agent-Builder.pdf)

## 🔗 Related Content on This Site

- [Copilot Studio Beginner Lab Part 1 — Full Copilot Studio](/blog/copilot-studio-beginner-lab-part-1-create-deploy/)
- [Copilot Studio Lab Part 2 — Entities & Connectors](/blog/copilot-studio-lab-part-2-entities-connectors-generative/)
- [Master SharePoint Agent](/blog/master-sharepoint-agent-in-microsoft-365-create-customize/)
- [Master All 6 Copilot Agents](/blog/master-all-6-microsoft-365-copilot-agents/)
- [M365 Copilot Full Tutorial](/blog/microsoft-365-copilot-full-tutorial-word-excel-teams/)
- [Browse all AI tutorials](/ai-hub/)
- [Daily AI News](/ai-news/)

## Frequently Asked Questions

**Do I need coding skills to use Agent Builder?**
No — Agent Builder is designed for non-developers. You describe your agent in natural language and it configures everything automatically.

**What's the difference between Agent Builder and Copilot Studio?**
Agent Builder (Copilot Studio Lite) is built into Microsoft 365 Copilot for quick, simple agents. Copilot Studio (full) is a separate app with advanced features like custom APIs, Power Automate actions, and visual topic design. Start with Agent Builder — upgrade to Copilot Studio if you need more.

**Can I use Agent Builder without a Copilot licence?**
No — Agent Builder requires a Microsoft 365 Copilot licence ($30/user/month). However, users who don't have a Copilot licence can still **use** agents that are shared with them (if they have Copilot Chat access).

**How many knowledge sources can I add?**
You can add up to 20 knowledge sources per agent, including SharePoint sites, folders, files, web content, and Copilot connectors.

**Can my agent take actions like sending emails or creating tickets?**
Agent Builder supports code interpreter (charts, calculations) and image generation. For actions like sending emails, creating tickets, or calling external APIs, you need **Copilot Studio (full)** with Power Automate.

**Does the agent use GPT-5?**
Yes — agents created in Agent Builder use GPT-5 by default, which provides improved reasoning, better context understanding, and more accurate responses.

**Is Agent Builder available on mobile?**
No — currently Agent Builder is only available on desktop and web versions of Microsoft 365 Copilot and Microsoft Teams.

---

## 💡 Want More?

- 📺 [Subscribe to A Guide to Cloud & AI on YouTube](https://www.youtube.com/susanthsutheesh) for new tutorials every week
- 📰 Check out the [AI News page](/ai-news/) for the latest AI headlines
- ☕ [Download free resources](https://ko-fi.com/aguidetocloud/shop)

---

*This article accompanies a video tutorial on the [A Guide to Cloud & AI](https://www.youtube.com/susanthsutheesh) YouTube channel. Written for beginners — no prior experience required.*
