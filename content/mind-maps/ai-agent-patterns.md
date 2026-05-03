---
title: "AI Agent Patterns — Pick the Right Architecture"
description: "Visual decision tree for AI agent design — direct LLM, RAG, tool-using, multi-step planner-executor, and reflection patterns. Pick the simplest pattern that solves your problem."
intro: "Five canonical agent patterns from simple to complex. Pick the simplest that solves your problem — adding complexity costs tokens, latency, and quality."
category: "copilot"
format: "decision-tree"
renderer: "static"
data_file: "ai_agent_patterns"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/ai-agent-patterns.jpg
faq:
  - question: "Should I always start with the simplest pattern?"
    answer: "Yes. Default to direct LLM call → if grounding needed, add RAG → if actions needed, add tools → if multi-step needed, add a planner. Each step up the ladder ADDS latency (more LLM round-trips), cost (more tokens), and failure modes (more places things go wrong). Most production agents land on RAG + 1-2 tools. Multi-step planner-executor and multi-agent debate are powerful but expensive — make sure simpler patterns genuinely fall short before reaching for them."
  - question: "What's the difference between RAG and fine-tuning?"
    answer: "RAG (Retrieval-Augmented Generation) — at runtime, fetch relevant documents from a vector store + include in the prompt. The model is unchanged. Pros: cheap, easy to update (just add docs), citable. Fine-tuning — train custom weights into the model. Pros: bakes in tone/style, no retrieval latency. Cons: expensive, hard to update, risks overfitting. RAG is the right default for 95% of knowledge-task agents. Fine-tuning is for narrow style/tone needs after RAG quality is genuinely insufficient."
  - question: "What's a 'planner-executor' agent?"
    answer: "An agent that does multiple LLM calls in sequence: first a 'planning' call to break down the user's request into steps, then 'executor' calls (often using tools) to perform each step, sometimes a 'reflection' call to check the result and re-plan if needed. ReAct (Reason + Act) is one popular implementation. Useful for genuinely multi-step tasks (e.g., 'analyse Q3 sales, draft a recap, post to Teams'). Cost: 3-10x a single LLM call. Watch costs and add max-step limits."
  - question: "When do I need multi-agent debate or LLM-as-judge?"
    answer: "Both are quality-amplification patterns for high-stakes outputs. Multi-agent debate — multiple agents propose answers, debate or vote, surface the consensus. Useful when reasoning quality matters more than cost. LLM-as-judge — a separate LLM evaluates the output against criteria you've defined (correctness, tone, safety). Useful for quality monitoring at scale. Both 5-20x the cost of a single call. Good for: legal drafts, medical advice, financial analysis, regulated outputs. Overkill for: chatbots, simple Q&A, internal tools."
---
