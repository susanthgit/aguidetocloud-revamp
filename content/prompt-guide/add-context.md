---
title: "📋 Add Context — Give AI the Background It Needs"
description: "Learn why context is the secret ingredient for great AI prompts. Practice adding relevant background information with workplace-focused examples."
type: "prompt-guide"
weight: 3
difficulty: "beginner"
emoji: "📋"
academic_name: "Context Engineering"
read_time: "4 min"
technique_id: "add-context"
sandbox_starter: "Write a status update"
sandbox_criteria:
  - id: "has_project"
    label: "Mentions a specific project or topic"
    pattern: "\\b(project|migration|rollout|implementation|upgrade|deployment|initiative|campaign|launch)\\b"
  - id: "has_audience"
    label: "Specifies who it's for"
    pattern: "\\b(manager|team|client|stakeholder|executive|board|leadership|colleague|customer|director)\\b"
  - id: "has_details"
    label: "Includes specific details (dates, numbers, names)"
    pattern: "(?:\\d+|january|february|march|april|may|june|july|august|september|october|november|december|Q[1-4]|last week|this month|deadline)"
faq:
  - question: "How much context should I include?"
    answer: "Include enough that a knowledgeable colleague could complete the task without asking follow-up questions. Key details: who's involved, what's the situation, what's the goal, and any constraints."
  - question: "Can I give too much context?"
    answer: "It's possible but rare. AI handles long context well. The bigger risk is too LITTLE context. When in doubt, include more rather than less — especially for complex tasks."
---

## What Is It?

**Adding Context** means giving the AI the background information it needs to give you a relevant answer. Without context, AI guesses — and guesses are rarely right.

Think of it like briefing a new team member. You wouldn't say "write the report" to someone who just joined — you'd explain the project, the audience, and what happened so far. AI needs the same briefing.

> 💡 **Key insight:** The AI doesn't know your situation. It doesn't know your project timeline, your team dynamics, or your company's policies. Every piece of context you add makes the response more relevant.

## When to Use It

- ✅ When the task involves your specific situation (not generic knowledge)
- ✅ When you need the AI to understand your constraints
- ✅ When previous AI responses were too generic or off-base
- ✅ When working with company-specific topics

## Before & After

### ❌ Before (No Context)
> Write a status update

### ✅ After (With Context)
> Write a weekly status update for my manager about the Microsoft 365 E5 migration project. We're in week 3 of 8. This week we completed Exchange Online mailbox migrations for 200 of 500 users. We hit a delay with shared mailboxes due to permission issues. Next week we're tackling SharePoint site migrations. Keep it concise — my manager prefers bullet points.

**What's better:** The AI knows the project, timeline, progress, blockers, next steps, audience preference, and format. It can write a genuinely useful update, not a generic template.

## Platform Tips

### Microsoft 365 Copilot
- **Copilot already has context** from your M365 data — emails, files, meetings. Reference them: "Based on last Tuesday's project meeting..."
- In **Word**, use "/" to reference specific files as context
- In **Teams**, Copilot can pull from the conversation — "Summarise what was discussed about the budget"

### ChatGPT
- Paste relevant data, emails, or documents directly into the conversation for full context
- Use the "Memory" feature to save persistent context across sessions

### Claude
- Claude excels with very long context (200K+ tokens) — paste entire documents
- Use `<context>` tags to clearly separate background from instructions

### Gemini
- Gemini can pull from your Google Workspace — reference Docs, Gmail, Calendar
- Be explicit about what context matters: "Given that our deadline is May 1st..."

## Real Examples from the Prompt Library

1. **[Email Reply](/prompts/email/)** — Notice how context about the situation shapes the response
2. **[Meeting Summary](/prompts/meetings/)** — Context about meeting purpose and attendees matters
3. **[Brainstorming](/prompts/brainstorming/)** — Background on constraints makes ideas practical

## Related Techniques

- **[🎯 Give Clear Instructions](/prompt-guide/give-clear-instructions/)** — Context + clear instructions = powerful combo
- **[🎭 Set a Role](/prompt-guide/set-a-role/)** — Give the "expert" the context they need
- **[🚧 Set Constraints](/prompt-guide/set-constraints/)** — Context defines the situation; constraints define the boundaries
