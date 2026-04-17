---
title: Code Review Assistant
description: Get a thorough code review with actionable feedback
prompt: >-
  Review this code and provide feedback on: (1) Bugs or logic errors, (2) Security vulnerabilities, (3) Performance issues, (4) Readability and naming, (5) Missing error handling, (6) Test coverage gaps. For each issue: explain the problem, show the fix, and rate severity (critical, important, minor). [PASTE CODE]
platforms:
- chatgpt
- claude
best_on: claude
roles:
- developer
- tech-lead
use_case: coding
difficulty: intermediate
tags:
- coding
- review
- quality
- security
---

## Tips for Best Results

- Review small chunks rather than entire files for better feedback
- Ask Claude to focus on security if that is your main concern
- Use for self-review before submitting a PR
