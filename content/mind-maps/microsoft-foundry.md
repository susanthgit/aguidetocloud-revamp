---
title: "Azure AI Foundry — Build, Evaluate, Deploy AI"
description: "Visual map of Azure AI Foundry — the AI platform with a multi-vendor model catalog at its core. OpenAI, Anthropic, Meta, open-weights, BYOM. Plus build, ground, evaluate, deploy, monitor, govern."
intro: "Foundry's core USP is the multi-vendor model catalog — OpenAI, Anthropic, Meta, open-weights, BYOM all live alongside each other. Six layers from raw models to governed production."
category: "copilot"
format: "architecture"
renderer: "static"
data_file: "microsoft_foundry"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/microsoft-foundry.jpg
faq:
  - question: "Foundry vs Azure OpenAI Service vs Copilot Studio — what's the difference?"
    answer: "Azure OpenAI Service is ONE source of models inside Azure AI Foundry — it hosts OpenAI's models specifically. Foundry is the broader platform: a multi-vendor model catalog (OpenAI, Anthropic, Meta, Mistral, open-weights, BYOM) PLUS the build/eval/deploy/govern tooling around them. Foundry's differentiator is exactly that you're NOT locked to one vendor — you can pick the right model per workload. Copilot Studio is the maker-focused tool for departmental agents; it now also supports multi-vendor models (including Anthropic Claude) and uses Foundry under the hood. M365 Copilot is the polished consumer experience."
  - question: "Why does multi-vendor model support matter?"
    answer: "Different models excel at different jobs. GPT-4o for general reasoning, Claude for long-context document work, Llama / Mistral for cheap high-volume inference, specialty fine-tunes for niche domains, BYOM for proprietary models trained on your data. Foundry's catalog lets you pick per agent, per route, even per user tier — you're not paying GPT-4 prices for every workload, and you're not stuck if a single vendor's pricing or availability changes. This is a big shift from the early 'just use OpenAI' era of 2023-2024."
  - question: "Why use the Foundry Agent Service vs Copilot Studio?"
    answer: "Copilot Studio is the right answer for citizen developers and departmental agents — low-code, fast to build, integrates with Power Platform connectors. Both Studio and Foundry now support multi-vendor models. Foundry Agent Service is for AI engineers who need: programmatic control over the full pipeline, complex multi-agent orchestration, custom retrieval, programmatic evaluation, deeper observability, or to publish agents that Studio's experience can't express. Most enterprises use both: Studio for the bulk of agents, Foundry for the 5-10% that need engineer-level control."
  - question: "What does 'continuous evaluation' actually do?"
    answer: "Runs your evaluators against a sample of REAL production traffic (not just offline test sets) to detect quality drift over time. Example: you ship an agent with 90% groundedness score on test data. A month later traffic patterns shifted (users asking different questions, models updated, retrieval index aged). Continuous eval catches the drop to 75% before users complain. Foundry's continuous eval surface lets you set thresholds and alerts. Critical for production AI — the offline-test-set-only model is yesterday's practice."
  - question: "When do I reach for Foundry vs just calling Azure OpenAI directly?"
    answer: "Direct Azure OpenAI API: prototype, simple chatbot, single-vendor commitment, throwaway code. Foundry: production workload that should be vendor-agnostic, regulated industry needs audit/eval, multi-team need for shared model deployments, complex tool use / RAG pipelines, you want managed endpoints with autoscale + retries, you need cost dashboards per business unit. Rule of thumb: prototype direct → if it gets traction or you want optionality on models, move to Foundry."
---
