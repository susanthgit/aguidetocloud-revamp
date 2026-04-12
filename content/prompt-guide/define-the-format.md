---
title: "📐 Define the Format — Control How AI Responds"
lastmod: "2026-04-12"
description: "Learn how to specify output formats in your AI prompts. Master tables, bullet points, JSON, email formats and more with interactive examples."
type: "prompt-guide"
weight: 4
difficulty: "beginner"
emoji: "📐"
academic_name: "Output Formatting"
read_time: "3 min"
tldr: "Tell AI exactly HOW to structure the output — table, bullets, email, JSON — based on how you'll USE it."
technique_id: "define-the-format"
sandbox_starter: "Tell me about project management tools"
sandbox_criteria:
  - id: "has_format"
    label: "Specifies output format"
    pattern: "\\b(table|bullet points?|numbered list|JSON|markdown|email|paragraph|heading|column|row|comparison|step-by-step|checklist)\\b"
  - id: "has_structure"
    label: "Describes desired structure"
    pattern: "\\b(include|with columns?|organize|group|section|categorize|sort|rank|compare side)\\b"
  - id: "has_task"
    label: "Has a clear task"
    pattern: "\\b(create|list|compare|summarize|summarise|write|explain|generate|build|draft)\\b"
faq:
  - question: "What output formats work best with AI?"
    answer: "The most useful formats are: bullet points (quick info), tables (comparisons), numbered lists (steps/processes), email format (communications), and JSON/code (developers). Match the format to how you'll USE the output."
  - question: "Can I combine multiple formats in one prompt?"
    answer: "Absolutely! Try: 'Give me a table comparing the tools, then a bullet list of recommendations.' AI handles multi-format outputs well."
sandbox_answer: "Compare the top 5 project management tools for small IT teams (under 20 people) in a table with these columns: Tool Name, Monthly Cost per User, Best Feature, Biggest Limitation, and Best For. Then add 3 bullet points recommending which tool to use based on team size."
fix_prompt: "Tell me about the pros and cons of Teams vs Slack"
fix_issues:
  - label: "Specifies output format"
    pattern: "\\b(table|comparison|side.by.side|bullet points|columns|rows)\\b"
  - label: "Defines comparison criteria"
    pattern: "\\b(price|features|integrations|security|ease of use|support|compliance|limit)\\b"
  - label: "Includes a recommendation ask"
    pattern: "\\b(recommend|suggest|which|best for|verdict|conclusion|pick)\\b"
best_for:
  - "Comparisons & tables"
  - "Structured reports"
  - "Pasting into other tools"
---

## What Is It?

**Defining the Format** tells AI exactly HOW to structure its response. Without this, AI picks a format for you — and it's often not what you need.

Think of it like ordering a drink. "Coffee" gets you something. "A large flat white in a takeaway cup with one sugar" gets exactly what you want. The content is the same — coffee — but the format changes everything about how useful it is.

> 💡 **The format trick:** Always think "how will I USE this output?" If you're pasting into Excel, ask for a table. If you're sending in Slack, ask for bullet points. If it's a report, ask for headings and paragraphs.

## When to Use It

- ✅ When you need structured output (tables, lists, steps)
- ✅ When you'll paste the output into another tool
- ✅ When you need to compare multiple items
- ✅ When the default AI format doesn't match your needs

## Before & After

### ❌ Before (No Format)
> Tell me about project management tools

### ✅ After (With Format)
> Compare the top 5 project management tools for IT teams in a table with these columns: Tool Name, Best For, Price (per user/month), Key Feature, and Limitation. Then add 3 bullet points recommending which tool suits teams of different sizes.

**What's better:** The response will be a neat, usable comparison table plus targeted recommendations — ready to share with your team.

## Platform Tips

### Microsoft 365 Copilot
- In **Excel**, Copilot understands table format natively — "Create a table of..."
- In **PowerPoint**, specify "as slide bullet points" for presentation-ready output
- In **Word**, use "Format as a professional report with headings" for structured docs

### ChatGPT
- ChatGPT renders markdown well — ask for tables, code blocks, and headers
- "Format as a markdown table" gives clean, copy-pasteable output

### Claude
- Claude handles complex multi-part formats beautifully
- Use XML tags for structure: `<format>comparison table</format>`

### Gemini
- Gemini defaults to bullet lists — be explicit if you want tables or paragraphs
- "Present this as a numbered step-by-step guide" works well

## Real Examples from the Prompt Library

1. **[Data Analysis](/prompts/data-analysis/)** — Specifies table format for structured output
2. **[Presentations](/prompts/presentations/)** — Uses slide-ready format
3. **[Summarising](/prompts/summarising/)** — Controls output length and structure

## Related Techniques

- **[🎯 Give Clear Instructions](/prompt-guide/give-clear-instructions/)** — Clear instructions + defined format = professional output
- **[🚧 Set Constraints](/prompt-guide/set-constraints/)** — Length limits, word counts, structure rules
- **[💡 Give Examples](/prompt-guide/give-examples/)** — Show the AI your desired format by example
