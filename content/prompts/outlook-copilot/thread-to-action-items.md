---
title: Email Thread to Action Items
description: Extract every commitment and action item from a long email chain
prompt: 'Review this email thread and extract all action items, commitments, and follow-ups. For each item list: what needs to be done, who committed to it, and any deadline mentioned. Present as a table. Flag anything that seems overdue.'
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- project-manager
- manager
- executive-assistant
use_case: outlook-copilot
difficulty: intermediate
tags:
- outlook
- email
- action-items
- tracking
m365_surfaces:
- outlook
---

## Tips for Best Results

- Works best on threads with 5+ messages where things get lost
- Follow up with "Draft a follow-up email listing these action items to all participants"
- Combines well with Teams meeting follow-ups for full accountability
