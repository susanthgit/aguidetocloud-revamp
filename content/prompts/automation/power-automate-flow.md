---
title: Power Automate Flow Designer
description: Design a Power Automate flow from a business requirement
prompt: >-
  Design a Power Automate flow for [USE CASE — approval workflow / email notification / data sync / form processing]. Include: (1) Trigger type, (2) Each action step with configuration, (3) Conditions and branches, (4) Error handling and retry logic, (5) Notification to stakeholders, (6) Testing checklist. Specify which connectors are needed.
platforms:
- m365-copilot
- chatgpt
best_on: m365-copilot
roles:
- it-admin
- operations
- analyst
use_case: automation
difficulty: intermediate
tags:
- automation
- power-automate
- flow
- m365
---

## Tips for Best Results

- Use built-in M365 connectors where possible for security
- Test with edge cases not just happy path
- Add run-after settings for error handling
