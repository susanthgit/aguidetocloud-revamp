---
title: "Microsoft Foundry — Build, Evaluate, Deploy AI"
description: "Visual map of Microsoft Foundry — the AI platform layers. Models catalog, build with prompt flow + agents, ground with data, evaluate quality + safety, deploy to managed endpoints, monitor + govern."
intro: "Foundry is Microsoft's AI platform. Six layers from raw models to governed production. This map shows where each piece sits."
category: "copilot"
format: "architecture"
renderer: "static"
data_file: "microsoft_foundry"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/microsoft-foundry.jpg
faq:
  - question: "Foundry vs Azure OpenAI Service vs Copilot Studio — what's the difference?"
    answer: "Azure OpenAI Service hosts OpenAI's models in Azure — the model-hosting layer. Microsoft Foundry is the broader platform built ON TOP of model hosting — adds agent orchestration, evaluation, fine-tuning workflows, deployment pipelines, and governance. Copilot Studio is the maker tool for departmental agents — uses Foundry under the hood but exposes a simpler experience. So: Azure OpenAI = engine. Foundry = workshop where you build with that engine. Copilot Studio = guided wizard for non-developers. M365 Copilot = the polished consumer experience for end users."
  - question: "Why use the Foundry Agent Service vs Copilot Studio?"
    answer: "Copilot Studio is the right answer for citizen developers and departmental agents — low-code, fast to build, integrates with Power Platform connectors. Foundry Agent Service is for AI engineers who need: precise model selection, custom tool use, multi-agent orchestration, complex retrieval pipelines, programmatic evaluation, or to publish agents that Copilot Studio's experience can't express. Most enterprises use both: Copilot Studio for the bulk of agents, Foundry for the 5-10% that need engineer-level control."
  - question: "What does 'continuous evaluation' actually do?"
    answer: "Runs your evaluators against a sample of REAL production traffic (not just offline test sets) to detect quality drift over time. Example: you ship an agent with 90% groundedness score on test data. A month later traffic patterns shifted (users asking different questions, models updated, retrieval index aged). Continuous eval catches the drop to 75% before users complain. Foundry's continuous eval surface lets you set thresholds and alerts. Critical for production AI — the offline-test-set-only model is yesterday's practice."
  - question: "When do I reach for Foundry vs just calling Azure OpenAI directly?"
    answer: "Direct Azure OpenAI API: prototype, simple chatbot, no governance needs, throwaway code. Foundry: production agent that's used by real customers, regulated industry needs audit/eval, multi-team need for shared model deployments, complex tool use / RAG pipelines, you want managed endpoints with autoscale + retries, you need cost dashboards per business unit. Rule of thumb: prototype direct → if it gets traction, move to Foundry before it goes wide."
---
