---
title: Analyse Dataset for Top Insights
description: Ask the Analyst agent to find the most important patterns and trends in your data
prompt: 'Analyse this data and give me the top [NUMBER — 3 / 5] insights. For each insight explain: what the data shows, why it matters, and what I should do about it. Include a supporting chart or visualisation for the most impactful finding. Write for [AUDIENCE — management / the team / a technical audience].'
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- analyst
- manager
- finance
use_case: analyst-agent
difficulty: beginner
tags:
- analyst
- insights
- data-analysis
m365_surfaces:
- copilot-chat-work
---

## Tips for Best Results

- Upload your Excel file or reference a SharePoint-hosted spreadsheet
- The Analyst agent creates Python-based analysis behind the scenes
- Be specific about what "insight" means: trends, anomalies, comparisons, or correlations
