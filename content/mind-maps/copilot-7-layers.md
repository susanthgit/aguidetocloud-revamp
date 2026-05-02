---
title: "How M365 Copilot Works in 7 Layers"
description: "Visual walkthrough of M365 Copilot's hidden architecture — apps, identity, orchestrator, grounding (RAG), AI models, responsible AI, and response governance."
intro: "Where does your prompt actually go? The 7 invisible layers between 'Summarise this' and the answer that comes back."
category: "copilot"
renderer: "static"
data_file: "copilot_7_layers"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/copilot-7-layers.jpg
faq:
  - question: "Does Copilot send my data to OpenAI?"
    answer: "No. Your prompts and grounding data stay inside Microsoft's commercial boundary. Microsoft hosts the AI models in Azure OpenAI Service — your data is not used to train foundation models, is not sent to OpenAI, and is encrypted in transit and at rest."
  - question: "What is grounding and why does it matter?"
    answer: "Grounding (Retrieval-Augmented Generation, or RAG) is the step where the orchestrator fetches relevant data from your Microsoft Graph — emails, files, chats, calendar — and adds it to your prompt before the AI model sees it. It's why Copilot can answer 'summarise the Q3 sales report' instead of guessing. Without grounding, Copilot would just be ChatGPT."
  - question: "Do I need to configure anything for Copilot security?"
    answer: "Mostly no. Copilot inherits every Conditional Access policy, MFA requirement, DLP rule, and sensitivity label you already have. If a user is blocked from M365 by your existing policies, they're blocked from Copilot. The thing you DO need to review is permissions hygiene in SharePoint and OneDrive — Copilot sees what the user can see."
  - question: "Which AI model does Copilot actually use?"
    answer: "Microsoft 365 Copilot uses a mix of OpenAI's GPT-4 family models hosted in Azure OpenAI, plus Anthropic Claude models for some scenarios since 2026. The orchestrator picks the right model for the task. You don't pick — and from your seat the experience is the same."
---
