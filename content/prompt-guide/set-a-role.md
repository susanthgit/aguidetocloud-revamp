---
title: "🎭 Set a Role — Give AI the Right Expertise"
lastmod: "2026-04-12"
description: "Learn how role prompting transforms AI responses by assigning expertise. Practice setting roles with before/after examples for M365 Copilot, ChatGPT, Claude, and Gemini."
type: "prompt-guide"
weight: 2
difficulty: "beginner"
emoji: "🎭"
academic_name: "Role / Persona Prompting"
read_time: "4 min"
technique_id: "set-a-role"
sandbox_starter: "Help me with my presentation"
sandbox_criteria:
  - id: "has_role"
    label: "Assigns a role (You are a..., Act as a...)"
    pattern: "(?:you are|act as|as a|your role|imagine you|respond as)\\s"
  - id: "role_specific"
    label: "Role has expertise area"
    pattern: "\\b(expert|specialist|senior|experienced|professional|consultant|advisor|coach|analyst|strategist|designer|architect|manager|engineer)\\b"
  - id: "has_task"
    label: "Includes a clear task"
    pattern: "\\b(help|review|create|design|suggest|improve|prepare|build|write|draft|analyse|analyze)\\b"
faq:
  - question: "Why does assigning a role improve AI responses?"
    answer: "When you set a role, the AI draws on knowledge patterns associated with that expertise. 'You are a senior IT administrator' activates different language, depth, and perspective than a generic response."
  - question: "Can I combine multiple roles?"
    answer: "Yes! Try 'You are a senior IT administrator with 10 years of experience in Microsoft 365 migrations who explains things in simple terms.' The more specific the role, the better."
sandbox_answer: "You are a senior presentation designer who specialises in executive communications for Fortune 500 companies. Help me restructure my Q2 cloud migration slide deck to make it more compelling for our CTO. Focus on visual storytelling and data-driven insights."
fix_prompt: "You are an expert. Write me a report about our project."
fix_issues:
  - label: "Makes the role specific (not just 'expert')"
    pattern: "\\b(senior|experienced|specialist|10.year|project manager|analyst|consultant)\\b"
  - label: "Specifies the type of report"
    pattern: "\\b(status|progress|executive|quarterly|risk|budget|analysis)\\b"
  - label: "Names the project or domain"
    pattern: "\\b(migration|cloud|M365|rollout|implementation|upgrade|deployment)\\b"
best_for:
  - "Expert-level responses"
  - "Changing AI perspective"
  - "Writing in specific styles"
---

## What Is It?

**Setting a Role** tells the AI to respond as if it's a specific expert. It's like the difference between asking a random person for medical advice versus asking a doctor.

Think of it like a theatre director casting an actor. When you say "You are a senior cybersecurity analyst," the AI puts on that hat — using the right vocabulary, depth, and perspective for that role.

> 💡 **Pro tip:** The more specific the role, the better. "You are an expert" is okay. "You are a senior M365 administrator who specialises in Teams governance for large enterprises" is excellent.

## When to Use It

- ✅ When you need expert-level depth on a topic
- ✅ When you want a specific writing style or perspective
- ✅ When you need the AI to think like a particular professional
- ✅ When generic responses aren't cutting it

## Before & After

### ❌ Before (No Role)
> Help me with my presentation

### ✅ After (With Role)
> You are a senior presentation coach who has helped executives at Fortune 500 companies. Review my presentation outline about our Q2 cloud migration project and suggest improvements to make it more compelling for a C-level audience. Focus on storytelling and data visualisation.

**What's better:** The AI now thinks like a presentation expert, not a general assistant. It'll focus on executive communication, storytelling, and impact — not just formatting.

## Platform Tips

### Microsoft 365 Copilot
- In **Word/Outlook**, keep roles concise: "As an experienced technical writer, rewrite this..."
- In **Teams Copilot**, roles work well: "As a meeting facilitator, summarise the key decisions"
- **Note:** M365 Copilot has built-in context from your org — the role adds perspective on top

### ChatGPT
- Use the system message or Custom Instructions for persistent roles across a conversation
- ChatGPT responds well to detailed backstories: "You are a 20-year veteran IT admin..."

### Claude
- Claude maintains roles exceptionally well across long conversations
- Use `<role>` tags for clarity: `<role>You are a senior security architect</role>`

### Gemini
- Keep role descriptions clear and direct — Gemini responds best to straightforward role assignments
- Combine role with task: "As a data analyst, create a summary of..."

## Real Examples from the Prompt Library

1. **[Customer Service Reply](/prompts/customer-service/)** — Uses role to set the right support tone
2. **[Project Planning](/prompts/project-management/)** — PM role ensures structured thinking
3. **[Research Summary](/prompts/research/)** — Expert researcher role improves depth

## Related Techniques

- **[🎯 Give Clear Instructions](/prompt-guide/give-clear-instructions/)** — Combine with role for powerful results
- **[📋 Add Context](/prompt-guide/add-context/)** — Give the "expert" the background they need
- **[🗣️ Specify Audience & Tone](/prompt-guide/specify-audience-and-tone/)** — Control how the expert communicates
