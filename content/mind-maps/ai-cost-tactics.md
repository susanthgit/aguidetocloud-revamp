---
title: "AI Cost Tactics — Spend Less Without Losing Quality"
description: "Visual reference of AI cost levers — token math, model selection, prompt optimisation, RAG vs fine-tuning trade-offs, and caching strategies."
intro: "Five levers move AI bills the most. Token math, model choice, prompt compression, RAG over fine-tune, and caching. Pull on the right ones."
category: "copilot"
format: "reference"
renderer: "static"
data_file: "ai_cost_tactics"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/ai-cost-tactics.jpg
faq:
  - question: "What's the biggest cost lever for AI workloads?"
    answer: "Model selection. The price gap between a frontier model (GPT-4o, Claude Opus) and a fast/cheap model (GPT-4o mini, Claude Haiku) is typically 10-30x per token. Many production workloads default to the most expensive model 'because quality' without testing the cheaper one. Build an eval set of representative prompts; run cheap-model first; only fall through to expensive when quality drops below threshold. Most apps could cut bills 60-80% with intent routing."
  - question: "When does fine-tuning beat RAG?"
    answer: "Rarely, in practice. RAG (Retrieval-Augmented Generation) is cheap, easy to update, and matches most fine-tuning quality for knowledge tasks. Fine-tuning beats RAG only when: (1) you need a specific TONE/STYLE the base model can't follow with prompts; (2) you have heavily specialised jargon (medical, legal, niche industry); (3) you need lower latency and can't afford retrieval round-trip. Default to RAG; reach for fine-tuning when RAG quality is genuinely insufficient."
  - question: "What's prompt caching and is it worth setting up?"
    answer: "Prompt caching (Anthropic, OpenAI) lets you mark parts of your prompt as cacheable — system prompts, lengthy instructions, large documents — so repeat calls reuse the cached encoding. Cost reduction: typically 50-90% on the cached portion. Worth setting up if your workload sends similar long prompts often (chatbots with system prompts, document Q&A). Negligible benefit if every call is unique."
  - question: "How do I track AI spend properly?"
    answer: "Tag every API call with: tenant/customer ID, feature/use-case, model used, token counts, cache hits. Aggregate per dimension. Without this you can't optimise — you just see a big monthly bill. Azure OpenAI exposes per-deployment metrics; OpenAI/Anthropic provide usage APIs. Build a simple dashboard early — even just CSV exports — so you can spot the 80/20: which feature, which user, which model accounts for most spend. Optimise the top 20% first."
---
