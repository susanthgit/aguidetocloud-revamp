---
title: "CCDV-F Study Guide & Practice Questions"
description: "Claude Certified Developer - Foundations guide and 250 original revision questions. Partner-only exam eligibility applies. Try 20 free; full bank US$9."
type: "cert-tracker"
layout: "single"
exam_code: "ANTHROPIC-CCDV-F"
exam_title: "Claude Certified Developer - Foundations (CCDV-F)"
exam_level: "beginner"
exam_status: "planned"
exam_category: "Anthropic"
vendor: "anthropic"
manual: true
supplemental: true
guided_slug: "anthropic-ccdv-f"
---

## About the CCDV-F Exam

> **Before buying:** Anthropic currently limits exam registration to employees of **Claude Partner Network organisations**, using a recognised company email domain. Buying this independent revision bank does not establish eligibility or include an exam voucher. Check [Anthropic's current certification eligibility FAQ](https://anthropic-partners.skilljar.com/page/faq-certifications) before planning an exam.

Claude Certified Developer - Foundations covers the implementation of applications built with Claude: the API, agent workflows, integration, developer tooling, model choices, context, security, and MCP.

This bank contains **250 original single-answer revision questions** mapped to the public **CCDV-F Exam Guide, version 1.0, July 2026**. It is not official Anthropic exam material or endorsed training. The real exam also includes multiple-response items. Our smaller domains are deliberately oversampled for study breadth; this is **not a proportional exam simulation**, and a practice score does not predict an exam result.

## Who Should Take This Exam?

The guide describes developers who build and integrate applications using Claude. No mandatory training or skill prerequisite is listed, but the partner-only registration restriction still applies. A developer should be comfortable reading application code, following request and response lifecycles, and reasoning about errors, state, permissions, and tests.

This Developer bank focuses on implementation decisions. It is not a substitute for practising with the actual tools, nor a claim that every product feature covered here will appear on an exam.

## Exam Quick Facts

These figures come from the July 2026 guide. Check the official guide and current FAQ before booking; the practice-bank price is separate from the exam fee.

| Detail | Value |
|--------|-------|
| **Credential** | Claude Certified Developer - Foundations (CCDV-F) |
| **Questions** | 53 multiple-choice and multiple-response items; each item states how many responses to select |
| **Time** | 120 minutes |
| **Pass Score** | Scaled score of 720 on a 100-1,000 scale |
| **Exam Fee** | USD $125 |
| **Delivery** | Proctored online and/or at a test centre, per program policy |
| **Validity** | 12 months after award |
| **Eligibility** | Claude Partner Network employees with a recognised employer email domain |
| **Official Guide** | [Anthropic's July 2026 CCDV-F exam guide](https://everpath-course-content.s3-accelerate.amazonaws.com/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/1783542875/Claude%20Certified%20Developer%20%E2%80%93%20Foundations%20Exam%20Guide.pdf) |

## Exam Domains & Weights

The official decimal weights total 100%. **Practice counts are an editorial study allocation, not the exam's distribution.** We provide at least 24 questions per domain, including the two small developer-tooling and debugging domains.

| Domain | Official Weight | Practice Questions |
|--------|-----------------|--------------------|
| Agents and Workflows | 14.7% | 33 |
| Applications and Integration | 33.1% | 64 |
| Claude Code | 3.1% | 24 |
| Eval, Testing, and Debugging | 2.6% | 24 |
| Model Selection and Optimization | 16.8% | 33 |
| Prompt and Context Engineering | 11.0% | 24 |
| Security and Safety | 8.1% | 24 |
| Tools and MCPs | 10.6% | 24 |
| **Total** | **100%** | **250** |

## Practice Questions - 250 Original Scenarios

Try **20 questions free**, with no account needed. Full bank access costs **US$9 for one year**, with explanations, reasoning for the wrong answers, public-source references, and progress tracking.

Every practice item has four options and one correct answer. The real exam's multiple-response format is not reproduced by this bank. Use the questions to identify topics to practise, not to estimate an official pass mark.

## Study Tips

1. **Start with Applications and Integration**, the largest official domain at 33.1%. Trace requests, responses, streaming events, application state, and configuration through a small working application.
2. **Separate a workflow from an agent.** Identify which steps the application controls and where the model chooses its next action. Inspect the actual tool-call and result messages.
3. **Debug with evidence.** Capture request identifiers, error categories, and relevant trace events. Distinguish a retryable service error from a request that must be corrected.
4. **Measure model and context choices.** Compare representative outputs and token use against a defined task, rather than assuming a larger model or more context always improves the result.
5. **Keep permissions outside untrusted text.** Practise safe tool boundaries, credential handling, and the differences between instructions, retrieved material, and authorised actions.
6. **Use the current first-party documentation.** Claude Code, the API, Agent SDK, and MCP features change. Read the linked source when a question raises a product-specific detail.
