---
title: "Meeting Notes to Action Items"
description: "Extract clear action items with owners and deadlines from messy meeting notes"
prompt: "Review these meeting notes and extract all action items. For each action item, provide: (1) Task — what needs to be done, (2) Owner — who is responsible, (3) Deadline — when it's due (if mentioned), (4) Priority — High, Medium, or Low based on context. Format as a clean table. If no deadline was mentioned, suggest a reasonable one based on the urgency implied."
platforms: ["m365-copilot", "chatgpt", "claude", "gemini"]
m365_surfaces: ["teams", "copilot-chat-work", "onenote"]
best_on: "m365-copilot"
roles: ["manager", "it-admin", "hr"]
use_case: "meetings"
difficulty: "beginner"
tags: ["meetings", "action-items", "productivity", "teams", "project-management"]
---

## Tips for Best Results

- In **M365 Copilot (Teams)**, use this after a meeting — Copilot already has the transcript
- In **OneNote**, paste meeting notes and use Copilot to process them
- For **ChatGPT/Claude**, paste the raw meeting notes below the prompt
- Add "Flag any items that seem blocked or dependent on other tasks" for extra depth

## Variations

### With Decision Log
> Review these meeting notes and create two sections: (1) DECISIONS MADE — list every decision with context, (2) ACTION ITEMS — table with Task, Owner, Deadline, Priority. Include any open questions that weren't resolved.

### Standup Format
> Extract action items from these standup notes. Format as: What was done yesterday, What's planned today, and Blockers. Group by person.
