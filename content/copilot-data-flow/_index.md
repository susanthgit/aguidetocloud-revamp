---
title: "Copilot Data Flow Map — Where Does Your Data Go?"
description: "Interactive data flow and architecture explorer for M365 Copilot. Layer-by-layer breakdown of how Copilot works, where your data goes, security boundaries, grounding, and admin controls."
type: "copilot-data-flow"
layout: "list"
sitemap:
  priority: 0.9
  changefreq: "weekly"
lastmod: 2026-05-01
images: ["images/og/copilot-data-flow.jpg"]
faq:
  - question: "Does Microsoft train AI models on my data?"
    answer: "No. Microsoft explicitly commits that prompts, responses, and Microsoft Graph data are NOT used to train foundation models. This applies to both OpenAI and Anthropic models used in Copilot."
  - question: "What happens when Copilot uses Anthropic Claude?"
    answer: "When Claude is used, your grounded prompt crosses the Microsoft boundary to Anthropic as a sub-processor. However, it remains under Microsoft's Data Protection Addendum (DPA). Anthropic cannot use your data for training. Admins can disable Claude entirely at tenant level."
  - question: "Does Copilot send my data to Bing?"
    answer: "Only a short, derived search query is sent to Bing — not your full prompt, documents, or tenant data. No user identity is shared. Admins can disable web search entirely or enable Zero Query Logging (ZQL)."
  - question: "Where is my Copilot data stored?"
    answer: "Copilot follows Microsoft 365 data residency commitments. Prompts and responses are stored at rest in your tenant's local region. Note: Anthropic processing is excluded from the EU Data Boundary."
  - question: "Can I see what users asked Copilot?"
    answer: "Yes. All Copilot interactions are logged in Microsoft Purview Audit — including prompts, responses, and web searches. Admins can search and review these logs."
  - question: "What compliance certifications does Copilot have?"
    answer: "M365 Copilot inherits Microsoft 365 compliance and also holds ISO/IEC 42001 (AI management system) certification. It is SOC 1/2, ISO 27001/27018, GDPR, and HIPAA compliant."
  - question: "What is grounding and why does it matter?"
    answer: "Grounding is the process of enriching your prompt with your organisation's actual data (emails, documents, chats) before sending it to the AI model. This is what makes Copilot give you specific, relevant answers instead of generic AI responses. It uses the Semantic Index and Microsoft Graph to find relevant context."
  - question: "How many layers does the Copilot architecture have?"
    answer: "M365 Copilot processes prompts through seven key layers: Microsoft 365 Apps, Identity and Access (Entra ID), the Copilot Orchestrator, the Grounding layer (Semantic Index and Microsoft Graph), LLM Processing (Azure OpenAI and optional Anthropic), Responsible AI controls, and Response and Governance (delivery, audit, retention)."
---
