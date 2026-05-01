---
title: "Copilot Model Map — Which AI Powers What in M365 Copilot"
description: "Interactive map showing which AI models (GPT-5, Claude, Phi) power each Microsoft 365 Copilot feature. See routing patterns, admin controls, and multi-model orchestration."
type: "copilot-model-map"
layout: "list"
sitemap:
  priority: 0.9
  changefreq: "weekly"
lastmod: 2026-05-01
images: ["images/og/copilot-model-map.jpg"]
faq:
  - question: "Which AI models does Microsoft 365 Copilot use?"
    answer: "M365 Copilot uses a multi-model strategy including OpenAI GPT-5.x, Anthropic Claude Opus and Sonnet, Microsoft Phi-4, and OpenAI o3-mini. Different features use different models — Copilot automatically routes to the best model for each task."
  - question: "Can admins control which AI model Copilot uses?"
    answer: "It depends on the feature. Copilot Studio gives full model choice to agent creators. BizChat allows tenant-level opt-in for Anthropic models. Most in-app Copilot experiences (Word, Excel, Teams) have no admin model control — Microsoft manages routing automatically."
  - question: "What is Critique mode in Copilot Researcher?"
    answer: "Critique mode is a multi-model pattern where GPT drafts the research response and Claude independently reviews it for accuracy, completeness, and citation quality — similar to academic peer review. This is the default mode for Researcher."
  - question: "Does Copilot Cowork use Claude or GPT?"
    answer: "Copilot Cowork primarily uses Anthropic Claude as its reasoning engine for deep planning and multi-step execution. GPT may handle specific sub-tasks within Cowork workflows."
  - question: "Is this data official from Microsoft?"
    answer: "We source all data from official Microsoft blog posts, Microsoft Learn documentation, and public announcements. Each relationship is tagged as 'official' or 'inferred' with a verification date so you know the confidence level."
---
