---
title: "Long Document Summariser"
description: "Condense a long document, report, or article into a clear executive summary"
prompt: "Summarise this document in three levels: (1) TL;DR — one sentence capturing the core message, (2) Executive Summary — a 3-4 sentence paragraph covering the key points, (3) Detailed Summary — bullet points covering every major section with the most important facts and figures preserved. Flag anything that seems like a decision point or requires action."
platforms: ["m365-copilot", "chatgpt", "claude", "notebooklm"]
m365_surfaces: ["word", "copilot-chat-work"]
best_on: "claude"
roles: ["manager", "it-admin", "student"]
use_case: "summarising"
difficulty: "beginner"
tags: ["summarising", "documents", "executive-summary", "reports", "reading"]
---

## Tips for Best Results

- **Claude** handles very long documents (100K+ tokens) — paste the entire document
- In **M365 Copilot (Word)**, open the document and ask Copilot to summarise
- **NotebookLM** is excellent for this — upload the document as a source, then ask questions
- Add "Highlight any risks or concerns mentioned" for compliance/legal documents

## Variations

### Email Thread Summary
> Summarise this email thread. For each message, note: sender, date, key point. Then provide an overall summary, current status, and any outstanding questions or actions needed.

### Academic Paper
> Summarise this research paper with: (1) Research question, (2) Methodology, (3) Key findings with data, (4) Limitations acknowledged, (5) Implications for practice. Keep it under 300 words.
