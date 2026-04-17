---
title: Approval Workflow Designer
description: Design a multi-step approval workflow
prompt: >-
  Design an approval workflow for [PROCESS]. Include: (1) Form fields, (2) Routing rules (by amount, type, department), (3) Escalation if unapproved within [TIME], (4) Notifications (submitted, approved, rejected, escalated), (5) Audit trail. Power Automate actions specified.
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- it-admin
- operations
use_case: automation
difficulty: intermediate
tags:
- automation
- approval
- power-automate
---

## Tips for Best Results

- Keep chains short — each step adds delay
- Auto-approve low-value items
- Test with out-of-office approvers
