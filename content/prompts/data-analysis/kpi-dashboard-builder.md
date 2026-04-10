---
title: KPI Dashboard Data Prep
description: Transform raw data into KPI summaries with trends, targets, and RAG status indicators
prompt: 'Using this data, create a KPI dashboard summary. For each metric: (1) Current value, (2) Target value, (3) Variance from target as a percentage, (4) RAG status (Red if >10% below target, Amber
  if 5-10% below, Green if on or above target), (5) Trend direction compared to last period (↑ improving, → stable, ↓ declining). Present as a clean table. Then provide a narrative summary of the top 3
  areas needing attention and top 3 areas performing well.'
platforms:
- m365-copilot
- chatgpt
- claude
best_on: m365-copilot
roles:
- manager
- executive
- finance
use_case: data-analysis
difficulty: intermediate
tags:
- kpi
- dashboard
- metrics
- excel
- reporting
- performance
m365_surfaces:
- excel
- copilot-chat-work
---

## Tips for Best Results

- In **Excel**, Copilot can create charts and conditional formatting directly
- Include both current period and prior period data for trend analysis
- Adjust the RAG thresholds to match your organisation's standards
- Follow up with "Create a PowerPoint slide with these KPIs" for presentations
