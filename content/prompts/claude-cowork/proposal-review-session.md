---
title: Multi-Reviewer Document Review
description: Have multiple reviewers comment on a document while Claude synthesises feedback
prompt: >-
  We need [NUMBER] team members to review this [DOCUMENT TYPE]. As each reviewer adds their comments and suggestions: (1) Track all feedback by reviewer, (2) Identify where reviewers agree (easy fixes), (3) Highlight where reviewers disagree (needs discussion), (4) Suggest a resolution for each conflict based on the document goals, (5) Create a clean revised version incorporating the agreed changes.
platforms:
- claude
best_on: claude
roles:
- manager
- editor
- project-manager
use_case: claude-cowork
difficulty: intermediate
tags:
- claude-cowork
- review
- feedback
- collaboration
m365_surfaces:
- copilot-chat-work
---

## Tips for Best Results

- Faster than email round-robin reviews — everyone reviews simultaneously
- Claude identifies consensus vs conflict so you only discuss what matters
- Great for proposals, policies, and any document that needs multiple sign-offs
