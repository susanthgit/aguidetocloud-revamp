---
title: Incident Triage Guide
description: Quickly diagnose and categorise an IT incident
prompt: >-
  Help me triage this IT incident: [DESCRIBE THE ISSUE]. (1) Classify severity (P1-P4) based on user impact, (2) Identify the most likely affected system or service, (3) List 5 diagnostic checks to run immediately, (4) Suggest the probable root cause, (5) Recommend whether to escalate or resolve at this level, (6) Draft a status update for affected users.
platforms:
- m365-copilot
- chatgpt
- claude
best_on: chatgpt
roles:
- it-admin
- support
- operations
use_case: troubleshooting
difficulty: intermediate
tags:
- troubleshooting
- incident
- triage
- diagnosis
---

## Tips for Best Results

- Include the error message, affected users count, and when it started
- Check if recent changes correlate with the incident
- Always communicate to affected users even if you do not have a fix yet
