---
title: API Documentation Generator
description: Generate clean API documentation from code or specs
prompt: >-
  Generate API documentation for [API NAME]. For each endpoint include: (1) HTTP method and path, (2) Description of what it does, (3) Request parameters with types and required/optional, (4) Request body schema with examples, (5) Response schema with examples, (6) Error codes and meanings, (7) Authentication requirements. Format as Markdown.
platforms:
- chatgpt
- claude
best_on: claude
roles:
- developer
- tech-lead
- technical-writer
use_case: coding
difficulty: intermediate
tags:
- coding
- api
- documentation
---

## Tips for Best Results

- Include curl examples for each endpoint
- Add rate limiting and pagination details
- Keep descriptions concise — developers scan docs they do not read them
