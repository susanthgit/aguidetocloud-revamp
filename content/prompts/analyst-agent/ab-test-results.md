---
title: A/B Test Results Analyser
description: Analyse A/B test results for statistical significance
prompt: >-
  Analyse this A/B test: Control [A METRICS] vs Variant [B METRICS]. Determine: (1) Statistical significance (p-value), (2) Confidence interval, (3) Effect size, (4) Sample size adequacy, (5) Winner recommendation with caveats, (6) Whether to continue testing.
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- analyst
- marketing
- product-manager
use_case: analyst-agent
difficulty: advanced
tags:
- analyst
- ab-test
- statistics
---

## Tips for Best Results

- Do not call a winner too early
- Check for novelty effect
- Segment results by user type
