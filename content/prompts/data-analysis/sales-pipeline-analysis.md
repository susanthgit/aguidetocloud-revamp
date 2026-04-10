---
title: Sales Pipeline Analysis
description: Analyse your sales pipeline data to identify top opportunities, risks, and forecast accuracy
prompt: 'Analyse this sales pipeline data and provide: (1) Total pipeline value by stage (Prospect, Qualified, Proposal, Negotiation, Closed Won/Lost), (2) Win rate by stage and by sales rep, (3) Average
  deal cycle time from first contact to close, (4) At-risk deals — opportunities that have been in the same stage for more than [X] days, (5) Revenue forecast for the next quarter based on current pipeline
  and historical win rates, (6) Top 5 recommendations to improve pipeline conversion.'
platforms:
- m365-copilot
- chatgpt
- gemini
best_on: m365-copilot
roles:
- sales
- manager
- executive
use_case: data-analysis
difficulty: advanced
tags:
- sales
- pipeline
- forecast
- excel
- crm
- revenue
m365_surfaces:
- excel
- copilot-chat-work
---

## Tips for Best Results

- In **Excel**, ensure your data has columns: Deal Name, Stage, Value, Rep, Created Date, Last Updated
- Replace [X] with your stale threshold (e.g., 30 days)
- Export from your CRM (Dynamics, Salesforce, HubSpot) as CSV first
- Follow up with "Create a pipeline funnel chart" for visual presentation
