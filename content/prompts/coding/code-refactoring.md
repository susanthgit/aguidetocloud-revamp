---
title: "Code Refactoring Assistant"
description: "Refactor messy code into clean, well-structured, maintainable code with explanations"
prompt: "Refactor this code to improve readability, maintainability, and performance. Specifically: (1) Apply consistent naming conventions, (2) Extract repeated logic into reusable functions, (3) Add clear inline comments where logic isn't obvious, (4) Handle edge cases and errors properly, (5) Follow the language's idiomatic best practices. Show the refactored code and briefly explain each change you made and why."
platforms: ["chatgpt", "claude", "gemini", "m365-copilot"]
best_on: "claude"
roles: ["developer"]
use_case: "coding"
difficulty: "intermediate"
tags: ["coding", "refactoring", "clean-code", "best-practices", "development"]
---

## Tips for Best Results

- Paste your code directly below this prompt
- Specify the language: "This is Python 3.12" or "This is TypeScript"
- **Claude** excels at explaining reasoning behind each change
- Add "Maintain backward compatibility" if this is production code
- Follow up with "Now write unit tests for the refactored code"

## Variations

### Performance Focus
> Refactor this code with a focus on performance optimisation. Identify bottlenecks, reduce time complexity where possible, and minimise memory allocations. Benchmark before/after where applicable.

### Security Audit
> Review this code for security vulnerabilities. Check for: injection risks, authentication issues, data exposure, insecure defaults. Refactor to fix any issues found and explain the security implications of each fix.
