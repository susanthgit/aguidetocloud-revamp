---
title: Forecast Next Period
description: Project future values based on historical patterns and state assumptions
prompt: 'Based on this historical data, forecast [METRIC] for the next [PERIOD — 3 months / 6 months / quarter]. Show: (1) The predicted values with confidence range, (2) The method and assumptions used, (3) Key factors that could change the forecast, (4) A chart with the historical trend and projected values. State your confidence level.'
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- analyst
- finance
- manager
use_case: analyst-agent
difficulty: advanced
tags:
- analyst
- forecast
- prediction
- trends
m365_surfaces:
- copilot-chat-work
---

## Tips for Best Results

- At least 12 months of data gives better forecasts
- The Analyst agent will choose an appropriate model (linear, seasonal, etc.)
- Add "Account for seasonality" if your data has monthly or quarterly patterns
- Always treat forecasts as estimates — communicate the confidence range to stakeholders
