---
title: Performance Issue Diagnosis
description: Systematically diagnose slow system or application performance
prompt: >-
  Help me diagnose slow performance in [SYSTEM/APPLICATION]. Walk me through: (1) Quick checks (CPU, memory, disk, network baseline), (2) Identifying the bottleneck, (3) Correlation with recent changes or events, (4) User-side vs server-side diagnosis, (5) Top 5 most common causes for this type of slowness, (6) Recommended monitoring to set up. Environment: [DETAILS].
platforms:
- m365-copilot
- chatgpt
- claude
best_on: chatgpt
roles:
- it-admin
- developer
- support
use_case: troubleshooting
difficulty: intermediate
tags:
- troubleshooting
- performance
- diagnosis
- monitoring
---

## Tips for Best Results

- Always check if something changed recently — 80 percent of issues follow a change
- Gather baseline metrics before declaring something slow
- Monitor for a week after fixing to confirm resolution
