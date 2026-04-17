---
title: Chatbot Conversation Design
description: Design a chatbot conversation flow for common requests
prompt: >-
  Design a chatbot conversation flow for handling [USE CASE — IT password resets / leave requests / FAQ / order status]. Include: (1) Welcome message and intent detection, (2) Main conversation branches, (3) Questions to ask and in what order, (4) Integration points (API calls, database lookups), (5) Handoff to human agent triggers, (6) Fallback and error messages. Map as a decision tree.
platforms:
- m365-copilot
- chatgpt
- claude
best_on: chatgpt
roles:
- it-admin
- developer
- operations
use_case: automation
difficulty: advanced
tags:
- automation
- chatbot
- conversational-ai
- design
---

## Tips for Best Results

- Handle the top 5 requests first — cover 80 percent of volume
- Always offer a path to a human agent
- Test with real users before going live
