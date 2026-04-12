---
title: "🎯 Give Clear Instructions — Stop Being Vague with AI"
description: "Learn why vague prompts get vague answers. Master the art of writing specific, actionable AI instructions with before/after examples and hands-on practice."
type: "prompt-guide"
weight: 1
difficulty: "beginner"
emoji: "🎯"
academic_name: "Zero-shot / Instruction Prompting"
read_time: "4 min"
technique_id: "give-clear-instructions"
sandbox_starter: "Write me something about emails"
sandbox_criteria:
  - id: "specific_task"
    label: "Specific task verb (write, create, draft...)"
    pattern: "\\b(write|create|draft|compose|generate|build|design|list|outline|summarize|explain)\\b"
  - id: "topic_detail"
    label: "Detailed topic (not just 'something')"
    pattern: "\\b(follow-up|apology|introduction|onboarding|complaint|meeting|project|report|quarterly|deadline|customer|client)\\b"
  - id: "word_count"
    label: "At least 15 words"
    check: "minWords:15"
faq:
  - question: "What makes a prompt 'clear'?"
    answer: "A clear prompt has a specific action verb (write, create, explain), a detailed subject, and enough context that the AI doesn't have to guess what you want."
  - question: "How long should a good prompt be?"
    answer: "There's no magic number, but effective prompts are typically 2-5 sentences. The goal isn't length — it's specificity. A 20-word specific prompt beats a 100-word vague one."
---

## What Is It?

**Give Clear Instructions** is the most fundamental prompt engineering technique — and the one most people skip.

Think of it like ordering food. "Give me food" gets you something random. "I'd like a medium-rare ribeye steak with mashed potatoes and grilled asparagus" gets exactly what you want. AI works the same way.

> 💡 **The #1 rule:** If your prompt could mean 10 different things, the AI will pick one randomly. Be specific enough that there's only one reasonable interpretation.

## When to Use It

- ✅ Every single time you use AI (this is the foundation)
- ✅ When you're getting vague or unhelpful responses
- ✅ When you need a specific format, length, or style
- ✅ When the task has particular requirements

## Before & After

### ❌ Before (Vague)
> Write me something about emails

**What's wrong:** "Something" could be an article, a template, a poem, tips, history... the AI has to guess.

### ✅ After (Clear)
> Draft a professional follow-up email to a client who hasn't responded to our project proposal in 2 weeks. Keep it polite but include a soft deadline. Maximum 150 words.

**What's better:** Specific task (draft), specific type (follow-up email), specific context (client, proposal, 2 weeks), specific tone (polite), specific constraint (150 words).

## Platform Tips

### Microsoft 365 Copilot
- In **Word**, be specific about the document type: "Write a project status update" not "Write something"
- In **Outlook**, Copilot works best with clear instructions like "Reply saying I'll attend but can't stay past 3pm"
- In **Teams**, be specific: "Summarise action items from this meeting" not "What happened?"

### ChatGPT
- ChatGPT handles longer, more detailed instructions well — don't hold back on specifics
- Use the Custom Instructions feature to set baseline context so individual prompts can focus on the task

### Claude
- Claude excels at following detailed instructions — the more specific, the better the output
- Use XML-style tags to structure complex instructions: `<task>`, `<context>`, `<format>`

### Gemini
- Gemini works well with numbered instructions for multi-part tasks
- Be explicit about format — Gemini sometimes defaults to bullet lists

## Real Examples from the Prompt Library

These prompts from our [Prompt Library](/prompts/) demonstrate clear instructions:

1. **[Professional Email Reply](/prompts/email/)** — Notice how it specifies the type of reply, tone, and constraints
2. **[Meeting Summary](/prompts/meetings/)** — Clear about what to include (decisions, action items, owners)
3. **[Data Analysis](/prompts/data-analysis/)** — Specific about the type of analysis and output format

## Related Techniques

After mastering clear instructions, level up with:

- **[🎭 Set a Role](/prompt-guide/set-a-role/)** — Tell AI who to be for even better results
- **[📋 Add Context](/prompt-guide/add-context/)** — Give AI the background it needs
- **[📐 Define the Format](/prompt-guide/define-the-format/)** — Control the shape of the output
