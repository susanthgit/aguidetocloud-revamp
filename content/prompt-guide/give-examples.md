---
title: "💡 Give Examples — Teach AI by Showing Patterns"
description: "Learn few-shot prompting — the technique of teaching AI what you want by providing examples. Interactive practice with before/after comparisons."
type: "prompt-guide"
weight: 5
difficulty: "intermediate"
emoji: "💡"
academic_name: "Few-shot Prompting"
read_time: "5 min"
technique_id: "give-examples"
sandbox_starter: "Categorize these support tickets"
sandbox_criteria:
  - id: "has_example"
    label: "Includes at least one example"
    pattern: "(?:example|for instance|e\\.g\\.|like this|such as|here'?s? (?:an |a )?(?:example|sample)|input:?|output:?|→)"
  - id: "has_pattern"
    label: "Shows input → output pattern"
    pattern: "(?:→|->|=>|:|input|output|before|after|original|result|category)"
  - id: "has_task"
    label: "Clear task after examples"
    pattern: "\\b(now |classify|categorize|categorise|apply|do the same|following|these|process)\\b"
faq:
  - question: "How many examples should I include?"
    answer: "2-3 examples is the sweet spot for most tasks. One example shows the pattern, two confirms it, three covers edge cases. More than 5 rarely helps and wastes tokens."
  - question: "What's the difference between zero-shot and few-shot prompting?"
    answer: "Zero-shot = no examples (just instructions). Few-shot = includes examples. Use zero-shot for simple tasks and few-shot when AI needs to learn a specific pattern or format."
---

## What Is It?

**Giving Examples** (also called few-shot prompting) means showing the AI what you want by providing sample inputs and outputs. Instead of describing the pattern, you demonstrate it.

Think of it like training a new colleague. You could explain the process in detail... or you could say "Here are 3 examples of how I categorised similar tickets. Now do the same with these." Most people learn faster from examples.

> 💡 **When words fail, examples succeed.** If you've tried describing what you want and the AI keeps getting it wrong, give it 2-3 examples of the correct output. This often solves the problem instantly.

## When to Use It

- ✅ When you need a specific format that's hard to describe in words
- ✅ When you want consistent categorisation or classification
- ✅ When the AI keeps getting the style or tone wrong
- ✅ When you need the output to match an existing pattern

## Before & After

### ❌ Before (No Examples)
> Categorize these support tickets

### ✅ After (With Examples)
> Categorize each support ticket into one of these categories: Billing, Technical, Access, Feature Request.
>
> Here are examples:
> - "I can't log in to my account" → **Access**
> - "I was charged twice this month" → **Billing**
> - "The dashboard keeps crashing on mobile" → **Technical**
>
> Now categorize these tickets:
> 1. "Can you add dark mode?"
> 2. "My password reset email never arrived"
> 3. "The export to CSV is generating empty files"

**What's better:** The AI now understands exactly how to format the output and what each category means in practice — not just in theory.

## Platform Tips

### Microsoft 365 Copilot
- In **Excel**, examples work great: "Flag column B like this: if amount > $1000 → 'High', if $500-$1000 → 'Medium', else 'Low'"
- In **Word**, show a sample paragraph then say "Write 5 more in this style"
- M365 Copilot can reference existing files as examples: "Format it like the Q1 report"

### ChatGPT
- Paste examples in code blocks for clean formatting
- ChatGPT carries examples across the conversation — set the pattern once, then give new inputs

### Claude
- Use XML tags: `<examples>` `<example>input → output</example>` `</examples>`
- Claude excels at learning complex patterns from just 2-3 examples

### Gemini
- Number your examples clearly: "Example 1:", "Example 2:"
- Gemini works best when examples are concise and consistent in format

## Real Examples from the Prompt Library

1. **[Customer Service](/prompts/customer-service/)** — Shows example tone for consistent responses
2. **[Writing](/prompts/writing/)** — Uses style examples to match voice
3. **[Data Analysis](/prompts/data-analysis/)** — Example categorisations for consistent labels

## Related Techniques

- **[🎯 Give Clear Instructions](/prompt-guide/give-clear-instructions/)** — Instructions set the task; examples show the pattern
- **[📐 Define the Format](/prompt-guide/define-the-format/)** — Examples are the most powerful way to define format
- **[🧠 Think Step by Step](/prompt-guide/think-step-by-step/)** — Show reasoning examples for complex tasks
