---
title: Budget Variance Analysis
description: Analyse actual vs budgeted figures and highlight significant variances with explanations
prompt: 'Analyse this budget data comparing actual spend versus budgeted amounts. For each line item: (1) Calculate the variance (actual minus budget) and variance percentage, (2) Flag any variances greater
  than 10% as significant, (3) Categorise variances as Favourable or Unfavourable, (4) Suggest possible reasons for the top 5 largest variances, (5) Provide a summary with total budget utilisation percentage.
  Format as a table with colour-coded indicators.'
platforms:
- m365-copilot
- chatgpt
- gemini
best_on: m365-copilot
roles:
- finance
- manager
- executive
use_case: data-analysis
difficulty: intermediate
tags:
- budget
- finance
- variance
- excel
- reporting
- analysis
m365_surfaces:
- excel
- copilot-chat-work
---

## Tips for Best Results

- In **Excel**, select your budget data range first, then ask Copilot
- Works best with columns: Category, Budget, Actual, and optionally Prior Year
- Add "Compare against the same period last year" for trend context
- Follow up with "Create a chart showing the top 10 variances" 
