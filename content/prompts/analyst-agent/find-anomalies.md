---
title: Find Anomalies and Outliers
description: Detect unusual patterns, outliers, and data quality issues in your dataset
prompt: 'Scan this dataset for anomalies and outliers. Look for: (1) Values that are unusually high or low compared to the rest, (2) Sudden changes or spikes in trends, (3) Missing or suspicious data patterns, (4) Inconsistencies between related columns. For each finding, explain why it is unusual and suggest whether it is an error or a genuine anomaly worth investigating.'
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- analyst
- finance
- operations
use_case: analyst-agent
difficulty: intermediate
tags:
- analyst
- anomalies
- outliers
- data-quality
m365_surfaces:
- copilot-chat-work
---

## Tips for Best Results

- Works best with time-series data or large datasets where manual scanning is impractical
- Add "Define an outlier as more than 2 standard deviations from the mean" for statistical precision
- The Analyst agent can create visualisations highlighting the anomalies
