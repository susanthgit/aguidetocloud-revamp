---
title: Expense Report Analyser
description: Analyse expense data to find patterns, flag anomalies, and identify cost-saving opportunities
prompt: 'Analyse this expense data and provide: (1) Total Spend Summary — by category, department, and time period, (2) Top Spenders — individuals or departments with highest expenses, (3) Trend Analysis
  — month-over-month spending patterns, (4) Anomaly Detection — flag any expenses that seem unusual (unusually high amounts, weekend expenses, duplicate claims), (5) Policy Compliance — identify expenses
  that may violate common corporate policies (excessive meals, unapproved travel class), (6) Cost-Saving Opportunities — 3-5 specific recommendations to reduce spending, (7) Benchmarks — compare against
  typical corporate spending ratios. Format as a clear report with tables.'
platforms:
- m365-copilot
- chatgpt
- claude
best_on: m365-copilot
roles:
- finance
- manager
- executive
use_case: data-analysis
difficulty: intermediate
tags:
- expenses
- finance
- analysis
- cost-saving
- excel
- compliance
m365_surfaces:
- excel
- copilot-chat-work
---

## Tips for Best Results

- In **Excel**, select the expense data range and ask Copilot to analyse
- Export from your expense system (Concur, Dynamics, SAP) as CSV first
- Add "Flag any expenses over  that lack a business justification" for compliance
- Follow up with "Create a dashboard chart showing monthly spending by category" 
