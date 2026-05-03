---
title: "The Microsoft AI Stack — Layer by Layer"
description: "Bird's-eye view of the Microsoft AI stack — foundation models, the Azure platform, Copilot apps, the agent layer, and the cross-cutting governance/identity/data fabric."
intro: "Microsoft AI is not one product — it's four layers plus a cross-cutting fabric. Here's how Foundry, Azure OpenAI, Copilot, and Studio actually relate."
category: "copilot"
format: "architecture"
renderer: "static"
data_file: "microsoft_ai_stack"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/microsoft-ai-stack.jpg
faq:
  - question: "What's the difference between Microsoft Foundry and Azure OpenAI?"
    answer: "Azure OpenAI Service hosts OpenAI's models (GPT-4, GPT-4o, etc.) inside Microsoft's Azure cloud — it's the model-hosting layer. Microsoft Foundry is the broader platform built on top — Foundry adds agent orchestration, evaluation, model fine-tuning workflows, deployment pipelines, and governance. Think Azure OpenAI = engine; Foundry = the workshop where you build with that engine."
  - question: "Where do Microsoft 365 Copilot and Copilot Studio fit?"
    answer: "M365 Copilot is the App Layer — the polished AI experience inside Word, Excel, Teams, etc. that information workers consume. Copilot Studio is the Agent Layer — the maker tool for building agents that integrate external systems, multi-step workflows, and custom logic. M365 Copilot uses the orchestrator and grounding layers underneath; Copilot Studio gives you direct access to those components for custom agents."
  - question: "Do I need Foundry to build a Copilot agent?"
    answer: "No. M365 Copilot has Agent Builder built in for lightweight agents grounded in your organisation's content. Copilot Studio handles departmental agents with workflow logic. You only reach for Foundry when you need fine-grained model selection, custom evaluation loops, multi-modal pipelines, or to publish AI APIs for your own apps to consume — territory beyond what M365 Copilot or Copilot Studio expose."
  - question: "What does the cross-cutting fabric actually do?"
    answer: "Every layer in the stack relies on Microsoft Graph (your tenant's data — files, emails, chats, calendar), Microsoft Entra (identity and access), and Microsoft Purview (governance, audit, sensitivity labels, DLP). When M365 Copilot answers a question, it authenticates via Entra, retrieves grounding from Graph, applies Purview policies to filter what it can see, and finally calls a model in the platform layer. The fabric is what makes it 'enterprise-grade AI' rather than just ChatGPT on your data."
---
