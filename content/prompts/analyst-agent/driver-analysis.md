---
title: Identify Key Drivers
description: Find what factors are driving a metric up or down and quantify their impact
prompt: 'Analyse this data and identify the biggest drivers behind [METRIC — revenue growth / ticket volume / churn rate]. For each driver: quantify its impact, explain the mechanism, and suggest what we can do about it. Rank drivers by impact size. Create a chart showing the contribution of each driver.'
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- analyst
- manager
- executive
use_case: analyst-agent
difficulty: advanced
tags:
- analyst
- drivers
- root-cause
- analysis
m365_surfaces:
- copilot-chat-work
---

## Tips for Best Results

- The Analyst agent uses Python for statistical analysis behind the scenes
- Include enough data columns — the more variables, the better the driver analysis
- Add "State your confidence level for each finding" to set realistic expectations
