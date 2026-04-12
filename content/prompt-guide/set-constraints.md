---
title: "🚧 Set Constraints — Define the Boundaries"
description: "Learn constraint prompting — how to set limits, boundaries, and rules that keep AI responses focused and useful. Hands-on practice included."
type: "prompt-guide"
weight: 7
difficulty: "intermediate"
emoji: "🚧"
academic_name: "Constraint Prompting"
read_time: "4 min"
technique_id: "set-constraints"
sandbox_starter: "Write about cloud computing"
sandbox_criteria:
  - id: "has_limit"
    label: "Includes a length or scope constraint"
    pattern: "\\b(maximum|max|minimum|min|no more than|at most|at least|under \\d|within \\d|\\d+ words|\\d+ sentences|\\d+ paragraphs|\\d+ bullet|brief|concise|short)\\b"
  - id: "has_rule"
    label: "Sets a content rule (do/don't)"
    pattern: "\\b(don'?t|do not|avoid|exclude|must|only|never|always|without|skip|no (?:jargon|code|technical|marketing))\\b"
  - id: "has_focus"
    label: "Narrows the topic focus"
    pattern: "\\b(focus on|specifically|only about|limited to|in the context of|for (?:beginners|IT|admins|managers))\\b"
faq:
  - question: "What kinds of constraints can I set?"
    answer: "Common constraints include: length (max 200 words), scope (focus only on security), audience (written for non-technical managers), format (no bullet points), content rules (don't use jargon), and tone (professional but friendly)."
  - question: "Can constraints make responses worse?"
    answer: "Overly restrictive constraints can. If you say 'explain quantum computing in 10 words,' quality suffers. Set constraints that help focus without crippling the response."
---

## What Is It?

**Setting Constraints** means telling AI what NOT to do, or putting limits on its response. Without constraints, AI tends to be verbose, generic, and unfocused.

Think of it like a garden fence. Without boundaries, a garden grows wild and messy. With the right constraints, you get a beautiful, focused space. Constraints don't limit creativity — they channel it.

> 💡 **Constraints are liberating.** Paradoxically, the more constraints you give, the more focused and useful the output. "Write about cloud computing" is overwhelming. "Write 3 benefits of cloud computing for small businesses, in plain English, under 150 words" is specific and actionable.

## When to Use It

- ✅ When AI responses are too long or verbose
- ✅ When you need output for a specific audience
- ✅ When you want to avoid certain content (jargon, code, opinions)
- ✅ When you need a specific word count or scope

## Before & After

### ❌ Before (No Constraints)
> Write about cloud computing

### ✅ After (With Constraints)
> Write 3 key benefits of migrating to cloud computing for small businesses with under 50 employees. Maximum 150 words. Use plain English — no technical jargon. Don't mention specific vendors. Focus on cost savings, flexibility, and security.

**What's better:** The AI will deliver exactly what you need — concise, jargon-free, and focused on what matters to the audience. No wasted words.

## Platform Tips

### Microsoft 365 Copilot
- In **Word**, "Keep it under 300 words" and "Use simple language" are particularly effective
- In **Outlook**, "Reply in 3 sentences or fewer" keeps emails concise
- In **PowerPoint**, "Maximum 5 bullet points per slide, no more than 8 words each"

### ChatGPT
- ChatGPT respects word limits fairly well but may go slightly over — use "strictly under X words"
- Negative constraints work well: "Do NOT include code examples" or "Avoid marketing language"

### Claude
- Claude follows constraints precisely — it's excellent at "exactly 3 paragraphs" or "no more than 5 items"
- Use explicit boundaries: "Only discuss X, Y, and Z. Nothing else."

### Gemini
- Be very explicit with constraints — "IMPORTANT: Keep under 100 words"
- Gemini sometimes ignores soft constraints, so use firm language

## Real Examples from the Prompt Library

1. **[Email](/prompts/email/)** — Word count constraints for concise emails
2. **[Summarising](/prompts/summarising/)** — Scope constraints for focused summaries
3. **[Writing](/prompts/writing/)** — Tone and audience constraints

## Related Techniques

- **[📐 Define the Format](/prompt-guide/define-the-format/)** — Format + constraints = precise output
- **[🗣️ Specify Audience & Tone](/prompt-guide/specify-audience-and-tone/)** — Audience is a type of constraint
- **[📋 Add Context](/prompt-guide/add-context/)** — Context tells AI the situation; constraints set the rules
