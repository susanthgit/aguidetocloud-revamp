---
title: "🗣️ Specify Audience & Tone — Control the Voice"
lastmod: "2026-04-12"
description: "Learn how to control AI's writing style by specifying audience and tone. Practice creating audience-aware prompts for different workplace scenarios."
type: "prompt-guide"
weight: 8
difficulty: "intermediate"
emoji: "🗣️"
academic_name: "Audience / Tone Tuning"
read_time: "4 min"
technique_id: "specify-audience-and-tone"
sandbox_starter: "Explain what happened with the server outage"
sandbox_criteria:
  - id: "has_audience"
    label: "Specifies the audience"
    pattern: "\\b(for (?:my |the |our )?(?:manager|team|CEO|executive|client|customer|non-technical|developer|board|stakeholder|beginner|leadership)|audience|reader|aimed at)\\b"
  - id: "has_tone"
    label: "Defines the tone or style"
    pattern: "\\b(professional|friendly|formal|casual|empathetic|confident|reassuring|technical|simple|concise|urgent|diplomatic|supportive|encouraging|plain English)\\b"
  - id: "has_task"
    label: "Clear communication task"
    pattern: "\\b(explain|write|draft|summarize|summarise|communicate|present|report|describe|brief|update)\\b"
faq:
  - question: "Why does specifying audience matter?"
    answer: "The same information needs to be communicated very differently to a CEO (high-level, business impact) versus a technical team (details, root cause, fix). Without audience specification, AI defaults to a generic middle ground that serves no one well."
  - question: "What are the most useful tones for workplace communication?"
    answer: "Professional but friendly (most emails), diplomatic (escalations/bad news), reassuring (incident comms to customers), confident (proposals), and concise (executive updates). Match the tone to the situation."
sandbox_answer: "Write two versions of the server outage communication:\n\nVersion 1 — For customers (reassuring, non-technical):\nBriefly explain services were disrupted, the issue is resolved, no data was affected. Under 100 words. Tone: calm, empathetic, professional.\n\nVersion 2 — For the IT team (technical, action-focused):\nDetail the root cause (DNS failover timeout), the fix applied, and 3 follow-up preventive actions. Include timeline. Tone: direct, solution-oriented."
fix_prompt: "Explain the security incident to everyone"
fix_issues:
  - label: "Specifies the audience"
    pattern: "\\b(for (?:the |my )?(?:board|executives|customers|clients|team|managers|non.technical|leadership|staff)|audience)\\b"
  - label: "Sets the tone"
    pattern: "\\b(professional|reassuring|calm|diplomatic|urgent|confident|empathetic|friendly|formal)\\b"
  - label: "Defines what to include/exclude"
    pattern: "\\b(include|exclude|focus on|don.?t mention|avoid|impact|resolution|action|timeline|next steps)\\b"
best_for:
  - "Stakeholder comms"
  - "Incident responses"
  - "Multi-audience content"
---

## What Is It?

**Specifying Audience & Tone** tells AI WHO will read the output and HOW it should sound. The same information, communicated in different ways, can inform, confuse, reassure, or alarm.

Think of it like explaining a network outage. To your CEO: "Services were briefly disrupted; we've resolved it with no data loss." To your engineering team: "The primary DNS resolver hit a race condition in the failover logic; we patched the TTL config." Same event, completely different communication.

> 💡 **The audience test:** Before writing your prompt, ask "Who will read this?" and "What should they feel after reading it?" Those two answers should go in your prompt.

## When to Use It

- ✅ Writing emails to different stakeholders
- ✅ Creating documents for mixed audiences
- ✅ Incident communications (calm and reassuring)
- ✅ Executive summaries (concise and impactful)
- ✅ Training materials (encouraging and clear)

## Before & After

### ❌ Before (No Audience/Tone)
> Explain what happened with the server outage

### ✅ After (With Audience & Tone)
> Write two versions of the server outage communication:
>
> **Version 1 — For customers (reassuring, non-technical):**
> Explain that services were briefly disrupted, we've identified and resolved the issue, and no data was affected. Keep it under 100 words. Tone: calm, professional, empathetic.
>
> **Version 2 — For the IT team (technical, action-focused):**
> Detail the root cause (DNS failover timeout), the fix applied, and 3 follow-up actions to prevent recurrence. Include timeline. Tone: direct, technical, solution-oriented.

**What's better:** Same event, but each version is perfectly tailored to its audience. The customer feels reassured; the IT team has actionable details.

## Platform Tips

### Microsoft 365 Copilot
- In **Outlook**, "Reply with a professional but warm tone" transforms generic replies
- In **Teams**, "Summarise this for a non-technical audience" is powerful for cross-team comms
- In **Word**, "Write this at an executive level — focus on business impact, not technical details"

### ChatGPT
- Set a persistent tone via Custom Instructions: "Always write in a friendly, professional tone"
- ChatGPT handles "translate this technical concept for a 10-year-old" style prompts well

### Claude
- Claude is excellent at maintaining consistent tone across long outputs
- Use: "Write as if you're a patient teacher explaining to someone new to IT"

### Gemini
- Be explicit: "Tone: formal and confident" or "Tone: casual and encouraging"
- Gemini may default to neutral — always specify

## Real Examples from the Prompt Library

1. **[Email](/prompts/email/)** — Different tones for different recipients
2. **[Customer Service](/prompts/customer-service/)** — Empathetic, solution-focused tone
3. **[Presentations](/prompts/presentations/)** — Audience-aware slide content

## Related Techniques

- **[🎭 Set a Role](/prompt-guide/set-a-role/)** — Role and tone work together (a coach speaks differently than an analyst)
- **[🚧 Set Constraints](/prompt-guide/set-constraints/)** — Audience is a type of constraint
- **[📋 Add Context](/prompt-guide/add-context/)** — Context about the audience situation shapes the right tone
