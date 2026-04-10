---
title: What-If Scenario Analysis
description: Build a scenario analysis comparing optimistic, realistic, and pessimistic projections
prompt: 'Create a what-if scenario analysis for [DECISION/PROJECTION]. Build three scenarios: (1) Optimistic — best case with favourable assumptions, (2) Realistic — most likely case based on current trends,
  (3) Pessimistic — worst case with unfavourable assumptions. For each scenario provide: variable assumptions used, projected outcome (revenue, cost, timeline, or metric), probability estimate, key risks,
  and recommended actions. Create a comparison table and identify the break-even point or decision threshold. Conclude with a recommendation on which scenario to plan for.'
platforms:
- m365-copilot
- chatgpt
- claude
- gemini
best_on: m365-copilot
roles:
- finance
- executive
- manager
- sales
use_case: data-analysis
difficulty: advanced
tags:
- scenario-analysis
- what-if
- forecasting
- excel
- finance
- planning
m365_surfaces:
- excel
- copilot-chat-work
---

## Tips for Best Results

- In **Excel**, use with Data Tables or Scenario Manager for dynamic modelling
- Replace [DECISION/PROJECTION] with: "launching in a new market", "hiring 10 more engineers"
- Add specific variables: "Assume price can vary between -"
- Follow up with "Create a sensitivity analysis chart showing the impact of each variable"
