---
title: Long Document Deep Analysis
description: Upload a massive document and get a thorough, structured analysis leveraging Claude's 200K context
prompt: 'Analyse this entire document thoroughly. Provide: (1) Document Overview — type, purpose, author, date, length, (2) Executive Summary — the core message in 5 sentences, (3) Section-by-Section Analysis
  — key points from each major section, (4) Critical Assessment — strengths and weaknesses of the arguments/content, (5) Key Data Points — all important numbers, statistics, and figures extracted, (6) Inconsistencies
  — any contradictions or gaps in the document, (7) Implications — what this document means for [YOUR CONTEXT], (8) Questions Raised — issues the document raises but does not answer, (9) Recommended Actions
  — what should be done based on this content. Be thorough — I uploaded the full document for a reason.'
platforms:
- claude
- chatgpt
- m365-copilot
best_on: claude
roles:
- executive
- legal
- manager
- consultant
use_case: summarising
difficulty: advanced
tags:
- analysis
- document
- long-form
- claude
- deep-dive
- review
m365_surfaces:
- copilot-chat-work
- word
---

## Tips for Best Results

- **Claude** handles 200K+ tokens — upload entire reports, contracts, or research papers
- Replace [YOUR CONTEXT] with: "our company evaluation of this vendor"
- Great for: annual reports, legal contracts, research papers, audit findings
- Follow up with "Compare this document against [another document] and highlight differences"
