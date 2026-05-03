---
title: "Copilot Prompt Patterns"
description: "Visual reference of prompt patterns for Microsoft 365 Copilot — the R-T-C-F formula, summarise/draft/analyse patterns, and the anti-patterns to avoid."
intro: "Better prompts = better answers. Five pattern families, the R-T-C-F formula, and the four anti-patterns that produce useless Copilot output."
category: "copilot"
format: "reference"
renderer: "static"
data_file: "copilot_prompt_patterns"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/copilot-prompt-patterns.jpg
faq:
  - question: "What's the R-T-C-F formula?"
    answer: "Role + Task + Context + Format. Example: 'Act as a marketing director (R), write a one-page launch announcement (T) for our Q3 product release in the legal-tech industry, customer-facing tone (C), as bullet points with a 2-line summary at top (F).' This structure consistently produces better Copilot output than vague prompts. Microsoft's official prompt training uses a similar GCSE framework (Goal, Context, Source, Expectations); R-T-C-F is the streamlined daily-use version."
  - question: "What's the biggest mistake in Copilot prompts?"
    answer: "Vagueness. 'Help me write something about Q3' produces generic filler. The fix isn't longer prompts — it's specific prompts. Compare: 'Summarise our Q3 sales report' (Copilot doesn't know which one) vs 'Summarise the Q3 EMEA Sales Report from Sarah Chen, focusing on what changed vs Q2'. Same length, infinitely more useful output. Habit-forming tip: before hitting submit, ask yourself 'could a new hire do this with what I just wrote?' — if no, add specificity."
  - question: "Should I paste secrets or sensitive data into Copilot prompts?"
    answer: "M365 Copilot — yes for org-internal sensitive data; no for personal secrets. M365 Copilot stays inside your commercial tenant boundary, doesn't train on your prompts, and respects DLP/sensitivity labels. So pasting financial figures, HR data, customer info from your tenant is fine. Don't paste: passwords/API keys (use a password manager), personal medical/financial data, or anything from systems outside your tenant. Copilot Chat (free tier) is web-grounded — be more cautious about what you paste there."
  - question: "How do I get good at prompting fast?"
    answer: "(1) Build a prompt library — save the 10-20 prompts that worked for you, share with team. (2) Iterate, don't restart — refine the prompt rather than starting over: 'be more concise', 'add a risks section', 'use the original tone'. (3) Use Copilot for prompt help — 'help me improve this prompt: [your draft]'. (4) Look at what others use — Microsoft's prompt examples, Copilot Lab inside the M365 Copilot app, communities. Most users get 2x better in 2 weeks if they actively practise."
---
