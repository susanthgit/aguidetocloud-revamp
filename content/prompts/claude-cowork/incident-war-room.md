---
title: Incident War Room Coordinator
description: Use Claude Cowork as a live incident tracker during a critical issue with multiple responders
prompt: >-
  We have a [SEVERITY — P1 / P2] incident: [INCIDENT DESCRIPTION]. Help coordinate: (1) Maintain a live timeline of events as team members report updates, (2) Track who is working on what, (3) Log all actions taken and their results, (4) Draft stakeholder communications at [INTERVAL — every 30 minutes / hourly], (5) When resolved, compile a post-incident report with timeline, root cause, and prevention actions. Keep everything factual and time-stamped.
platforms:
- claude
best_on: claude
roles:
- it-admin
- manager
- operations
use_case: claude-cowork
difficulty: advanced
tags:
- claude-cowork
- incident
- war-room
- coordination
m365_surfaces:
- copilot-chat-work
---

## Tips for Best Results

- Share the workspace URL with all incident responders for a single source of truth
- Claude time-stamps everything so the post-incident report writes itself
- Assign one person as communication lead — Claude drafts, they approve
