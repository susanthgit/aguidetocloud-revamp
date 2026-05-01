---
title: "Copilot Data Flow Map — Where Does Your Data Go?"
description: "Interactive data flow visualisation showing exactly where your data goes when using M365 Copilot. See security boundaries, sub-processor paths, admin controls, and compliance certifications."
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
---
