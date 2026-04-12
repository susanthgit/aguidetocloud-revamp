---
title: "🧠 Think Step by Step — Guide AI Reasoning"
lastmod: "2026-04-12"
description: "Learn chain-of-thought prompting — make AI show its reasoning for better accuracy. Practice with complex problem-solving scenarios."
type: "prompt-guide"
weight: 6
difficulty: "intermediate"
emoji: "🧠"
academic_name: "Chain-of-Thought (CoT) Prompting"
read_time: "5 min"
technique_id: "think-step-by-step"
sandbox_starter: "Should we migrate to the cloud?"
sandbox_criteria:
  - id: "has_steps"
    label: "Asks for step-by-step reasoning"
    pattern: "\\b(step by step|step-by-step|think through|walk me through|reason through|break down|one step at a time|explain your reasoning|show your work)\\b"
  - id: "has_criteria"
    label: "Provides evaluation criteria"
    pattern: "\\b(consider|factor|criteria|evaluate|weigh|compare|pros|cons|cost|risk|benefit|requirement|constraint)\\b"
  - id: "has_conclusion"
    label: "Asks for a final recommendation"
    pattern: "\\b(recommend|conclusion|final|decision|verdict|suggestion|advice|bottom line|summary|therefore)\\b"
faq:
  - question: "When should I use chain-of-thought prompting?"
    answer: "Use it for complex decisions, multi-step analysis, troubleshooting, math problems, or any task where reasoning matters more than just the final answer. It dramatically reduces errors on complex tasks."
  - question: "Does 'think step by step' actually work?"
    answer: "Yes! Research shows that adding 'think step by step' or 'explain your reasoning' significantly improves accuracy on complex tasks. It forces the AI to reason through each part rather than jumping to conclusions."
sandbox_answer: "We're considering migrating our on-premises Exchange Server 2019 and file shares (4TB) to Microsoft 365 for 250 users. Walk me through this decision step by step:\n\n1. First, evaluate our current on-prem costs vs M365 E3 licensing\n2. Then, identify the top 5 migration risks for our size\n3. Next, assess our team's readiness (we have 2 IT staff)\n4. Consider our 5-year-old servers and $50K annual IT budget\n5. Finally, give a recommendation with confidence level and suggested timeline"
fix_prompt: "What's the best cloud platform?"
fix_issues:
  - label: "Asks for reasoning process"
    pattern: "\\b(step.by.step|walk me through|think through|break down|reason|explain your|analyse each)\\b"
  - label: "Provides specific criteria to evaluate"
    pattern: "\\b(cost|security|compliance|scalability|performance|team size|industry|integration|support)\\b"
  - label: "Asks for a conclusion"
    pattern: "\\b(recommend|conclusion|summary|verdict|which one|best for|final)\\b"
best_for:
  - "Complex decisions"
  - "Troubleshooting"
  - "Analysis & evaluation"
---

## What Is It?

**Think Step by Step** (formally called chain-of-thought prompting) tells AI to show its reasoning process instead of jumping straight to an answer. This dramatically improves accuracy for complex tasks.

Think of it like a maths exam. "What's the answer?" might get you a wrong number. "Show your working" forces you to think through each step — and catch mistakes along the way. AI works the same way.

> 💡 **This is the single most powerful technique for complex tasks.** Research from Google and others shows it can improve accuracy by 40-70% on reasoning problems. And it's as simple as adding "think step by step."

## When to Use It

- ✅ Complex decisions with multiple factors
- ✅ Troubleshooting and diagnosis
- ✅ Analysis that requires weighing pros and cons
- ✅ Math, logic, or multi-step problems
- ✅ When you don't trust the AI's first answer

## Before & After

### ❌ Before (No Reasoning)
> Should we migrate to the cloud?

### ✅ After (Step-by-Step)
> We're considering migrating our on-premises Exchange Server 2019 and file shares (4TB) to Microsoft 365 for 250 users. Walk me through this decision step by step:
>
> 1. First, evaluate our current costs vs cloud costs
> 2. Then, identify the top 5 migration risks
> 3. Next, assess our team's readiness
> 4. Finally, give a recommendation with a confidence level
>
> Consider: we have 2 IT staff, our servers are 5 years old, and we have a $50K annual IT budget. Think through each factor before reaching your conclusion.

**What's better:** The AI will systematically work through each consideration, showing its reasoning. You can spot where it's right, where it's wrong, and where you need to give more context.

## Platform Tips

### Microsoft 365 Copilot
- In **Teams meetings**, ask Copilot: "Walk through the arguments presented for and against this proposal"
- In **Excel**, "Explain the calculation step by step" helps verify formulas
- Copilot works best with structured steps: numbered lists of what to evaluate

### ChatGPT
- "Think step by step" is ChatGPT's magic phrase — it consistently improves outputs
- For complex analysis, use: "Before giving your answer, reason through each factor"

### Claude
- Claude naturally shows detailed reasoning — pair with "think step by step" for even more thorough analysis
- Use: "In your thinking, consider X, Y, and Z before concluding"

### Gemini
- Gemini responds well to: "Break this down into steps and explain each one"
- Use numbered steps to structure the reasoning: "Step 1: Analyse..., Step 2: Compare..."

## Real Examples from the Prompt Library

1. **[Research Analysis](/prompts/research/)** — Uses step-by-step for thorough evaluation
2. **[Data Analysis](/prompts/data-analysis/)** — Structured analysis with reasoning
3. **[Project Management](/prompts/project-management/)** — Risk assessment with thinking process

## Related Techniques

- **[📋 Add Context](/prompt-guide/add-context/)** — Give AI the facts it needs to reason about
- **[🚧 Set Constraints](/prompt-guide/set-constraints/)** — Focus the reasoning on what matters
- **[💡 Give Examples](/prompt-guide/give-examples/)** — Show an example of good reasoning
