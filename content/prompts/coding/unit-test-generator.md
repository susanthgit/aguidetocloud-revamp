---
title: Unit Test Generator
description: Generate comprehensive unit tests for existing code
prompt: >-
  Write unit tests for this [LANGUAGE] code: [PASTE CODE]. Include: (1) Happy path tests, (2) Edge cases (null, empty, boundary values), (3) Error handling tests, (4) Tests for each public method. Use [FRAMEWORK — Jest / pytest / xUnit / NUnit]. Include descriptive test names that explain what is being tested.
platforms:
- chatgpt
- claude
best_on: claude
roles:
- developer
- qa
use_case: coding
difficulty: intermediate
tags:
- coding
- testing
- unit-test
- quality
---

## Tips for Best Results

- Aim for at least 80 percent coverage of the code under test
- Test behaviour not implementation details
- Include both positive and negative test cases
