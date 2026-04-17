---
title: Error Handling Pattern
description: Design robust error handling for an application component
prompt: >-
  Design error handling for [COMPONENT — API endpoint / background job / file processor / user form] in [LANGUAGE]. Include: (1) Input validation, (2) Try-catch structure, (3) Specific exception types to handle, (4) Logging strategy, (5) User-friendly error messages, (6) Retry logic for transient failures, (7) Graceful degradation. Show complete code.
platforms:
- chatgpt
- claude
best_on: claude
roles:
- developer
- tech-lead
use_case: coding
difficulty: advanced
tags:
- coding
- error-handling
- resilience
- patterns
---

## Tips for Best Results

- Never expose stack traces to end users
- Log enough detail for debugging but no sensitive data
- Use exponential backoff for retry logic
