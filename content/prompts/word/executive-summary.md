---
title: Executive Summary Generator
description: Condense a long document into a crisp executive summary with key takeaways
prompt: 'Summarise this document into an executive summary for [AUDIENCE — leadership / board / client]. Include: (1) The headline finding or recommendation (one sentence), (2) 3-5 key takeaways as bullet points, (3) Recommended next steps. Keep the entire summary under 200 words. Prioritise decisions over details.'
platforms:
- m365-copilot
- chatgpt
- claude
best_on: m365-copilot
roles:
- executive
- analyst
- project-manager
use_case: word
difficulty: beginner
tags:
- word
- summary
- executive
m365_surfaces:
- word
---

## Tips for Best Results

- Works best when the document is open in Word — Copilot reads the full context
- Specifying the audience changes the focus (board = financials, client = deliverables)
- Add "Include a one-line risk statement" for governance-heavy environments
