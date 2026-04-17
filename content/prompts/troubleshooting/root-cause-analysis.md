---
title: Root Cause Analysis
description: Perform a structured root cause analysis on a resolved incident
prompt: >-
  Conduct a root cause analysis for [INCIDENT DESCRIPTION]. Use the 5 Whys method: (1) State the problem, (2) Ask why 5 times drilling deeper each time, (3) Identify the true root cause, (4) Distinguish symptoms from causes, (5) Recommend corrective actions to prevent recurrence, (6) Assign owners and timelines. Keep blameless — focus on systems not people.
platforms:
- m365-copilot
- chatgpt
- claude
best_on: chatgpt
roles:
- it-admin
- operations
- manager
use_case: troubleshooting
difficulty: advanced
tags:
- troubleshooting
- root-cause
- analysis
- 5-whys
---

## Tips for Best Results

- Conduct RCA within 48 hours while memory is fresh
- Involve everyone who participated in the resolution
- The first answer is rarely the root cause — keep asking why
