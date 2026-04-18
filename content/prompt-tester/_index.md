---
title: "🔬 Prompt Tester — A/B Compare Any Two AI Prompts"
description: "Paste two prompts side-by-side and instantly see which is more CRAFTS-complete. Per-criterion scoring, diff view, and auto-improvement suggestions. 100% free, runs in your browser."
type: "prompt-tester"
layout: "list"
sitemap:
  priority: 0.8
  changefreq: "monthly"
lastmod: 2026-04-18
images: ["images/og/prompt-tester.jpg"]
faq:
  - question: "How does the Prompt Tester compare two prompts?"
    answer: "Both prompts are scored independently using the CRAFTS framework — Context, Role, Action, Format, Tone, and Scope. Each pillar is scored out of its maximum, and the totals (0–100) are compared. You'll see which prompt is more complete and exactly which elements make the difference."
  - question: "What does 'more CRAFTS-complete' mean?"
    answer: "It means one prompt includes more of the six elements that help AI give better responses. A higher CRAFTS score doesn't guarantee a better AI output — but it does mean you've given the AI more to work with, which consistently leads to better results."
  - question: "Can I compare prompts from different AI platforms?"
    answer: "Absolutely. The CRAFTS framework is platform-agnostic — it measures prompt structure, not platform-specific features. A well-structured prompt works better on ChatGPT, Claude, Copilot, Gemini, and any other AI."
  - question: "What does the diff view show?"
    answer: "The diff view highlights word-level differences between your two prompts — green for words only in B, red for words only in A. It's most useful when comparing a revised version of the same prompt. If the prompts are very different, the diff is hidden automatically."
  - question: "Is my data private?"
    answer: "Yes. Everything runs 100% in your browser — your prompts are never sent to any server or API. History is stored in your browser's localStorage only, and you can clear it at any time."
  - question: "How does the 'Improve' feature work?"
    answer: "Click 'Improve Weaker Prompt' to auto-generate a rewritten version of the lower-scoring prompt. The rewrite adds missing CRAFTS elements — a role, context, format instructions, tone, and scope — based on what's missing. It uses the same engine as our Prompt Polisher tool."
  - question: "What if the scores are very close?"
    answer: "If the difference is less than 5 points, the tool shows 'Too close to call' instead of declaring a winner. Both prompts are similarly complete, and the difference is within scoring margin."
  - question: "Can I use this for Copilot Studio agent instructions?"
    answer: "Yes! Paste two versions of your agent instructions to see which is more structured. For dedicated agent instruction building, also check out our Agent Instruction Builder tool."
---
