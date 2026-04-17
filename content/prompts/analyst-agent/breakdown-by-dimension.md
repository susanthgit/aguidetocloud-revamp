---
title: Break Down Results by Dimension
description: Slice your data by categories to find where performance varies
prompt: 'Break down the results in this data by [DIMENSIONS — region, product, customer type, department]. For each segment show: total, average, percentage of whole, and trend direction. Highlight the best and worst performing segments. Create a chart comparing the top segments.'
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- analyst
- manager
- finance
use_case: analyst-agent
difficulty: intermediate
tags:
- analyst
- segmentation
- breakdown
- comparison
m365_surfaces:
- copilot-chat-work
---

## Tips for Best Results

- Name the exact columns you want to slice by
- Add "Also calculate year-over-year change for each segment" for trend analysis
- Follow up with "Why is [SEGMENT] performing differently from the others?"
