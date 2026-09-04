---
title: "SnowPro Specialty: Gen AI (GES-C02) — Study Guide & Practice Exam"
description: "Free GES-C02 study guide. Try 20 questions free. Full practice exam access: US$9 for 1 year. SnowPro Specialty: Gen AI."
type: "cert-tracker"
layout: "single"
exam_code: "SNOWPRO-SPECIALTY-GEN-AI"
exam_title: "SnowPro Specialty: Gen AI"
exam_level: "specialty"
exam_status: "active"
exam_category: "Snowflake"
vendor: "snowflake"
manual: false
guided_slug: "snowpro-specialty-gen-ai"
---
## About the SnowPro Specialty: Gen AI Exam

> Master the Snowflake SnowPro Specialty: Gen AI certification (GES-C02) — building, governing, and optimising generative AI on Snowflake Cortex, from the AI SQL functions and RAG to model governance, cost control, and document processing.

The complete practice exam for the Snowflake SnowPro Specialty: Gen AI certification (GES-C02, the exam version that replaced GES-C01 on 19 May 2026). This specialty exam validates how you build, secure, and run production generative AI workloads inside Snowflake. Covers **Snowflake for Gen AI** (the Cortex umbrella, Snowflake-hosted LLMs and the `CORTEX_MODELS_ALLOWLIST` parameter, Cortex Fine-tuning, Cortex Search as a managed hybrid retrieval service, Cortex Analyst with semantic views and the verified query repository, Cortex Agents and their tool set, Snowflake Intelligence, Cortex Code, Copilot Inline, AI Studio, Cortex Knowledge Extensions, cross-region inference, and bringing your own models through the Snowflake Model Registry and Snowpark Container Services), **Snowflake Gen AI functions** (the AI_ function family — `AI_COMPLETE`, `AI_CLASSIFY`, `AI_FILTER`, `AI_AGG`, `AI_SUMMARIZE_AGG`, `AI_SIMILARITY`, `AI_EMBED`, `AI_SENTIMENT`, `AI_TRANSCRIBE` and `AI_REDACT` — vector types and distance functions, production RAG with chunking, embedding and reranking, multi-modal audio and image workflows, model selection trade-offs, chat-with-data interfaces over the Cortex REST APIs and Streamlit, applying AI functions inside streams, tasks and dynamic tables, and running third-party and custom models), **Snowflake Gen AI governance** (the Cortex database roles, privileges on search services, semantic views and agents, restricting which models an account may call, Cortex Guard and `AI_REDACT`, the feature-specific usage views that answer each cost question, budgets, warehouse sizing and chargeback tagging, and AI observability with evaluations, tracing and metrics), and **Snowflake document processing** (`AI_PARSE_DOCUMENT` OCR versus LAYOUT modes, `AI_EXTRACT` field extraction, stages and directory tables, automated pipelines with streams and tasks, and troubleshooting and optimising extraction accuracy, latency and cost) — every question a real-world scenario with a full explanation and a link to the official Snowflake documentation.

> 📌 **Naming note:** Snowflake renamed **Snowflake Intelligence** to **Snowflake CoWork** at Snowflake Summit in June 2026 — *after* the GES-C02 exam version was published. The official exam guide still lists the sub-area as "Snowflake Intelligence", so expect the older name in exam wording and the newer name in current Snowflake documentation. They are the same product.

## Who Should Take This Exam?

The SnowPro Specialty: Gen AI certification is designed for **AI/ML engineers, data engineers, data scientists, analytics engineers, and application developers** who build generative AI features on the Snowflake AI Data Cloud — RAG pipelines, chat-with-your-data interfaces, document extraction, and LLM-powered analytics — and for the **data governance and platform leads** who have to secure and pay for them. It validates hands-on skill with Snowflake Cortex end to end: the AI SQL functions, retrieval and agents, model and cost governance, and document processing.

**Prerequisites:** None (SnowPro Core is recommended but not required). Snowflake recommends 1+ years of hands-on Gen AI experience on Snowflake, plus working Python and SQL.

**Typical study time:** 4-8 weeks of focused study (plus hands-on time in a Snowflake trial account)

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | SnowPro Specialty: Gen AI (GES-C02) |
| **Title** | SnowPro Specialty: Gen AI |
| **Duration** | 85 minutes |
| **Questions** | 55 |
| **Pass Score** | 750 / 1000 (scaled) |
| **Cost** | $225 USD |
| **Provider** | Snowflake (Pearson VUE / online proctored) |
| **Validity** | 2 years |
| **Prerequisites** | None (SnowPro Core recommended) |
| **Question Types** | Multiple choice, Multiple select |
| **Official Page** | [View on Snowflake →](https://learn.snowflake.com/en/certifications/snowpro-GenAI-C02/) |

## Exam Domains & Weights

The SnowPro Specialty: Gen AI exam covers **4 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Snowflake for Gen AI Overview | 18% | 45 |
| Snowflake Gen AI Functions | 38% | 95 |
| Snowflake Gen AI Governance | 29% | 73 |
| Snowflake Document Processing | 15% | 37 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Gen AI Functions (38%) is the heaviest domain, so know the AI_ family by *job to be done*: `AI_COMPLETE` for open-ended generation, `AI_CLASSIFY` for labels, `AI_FILTER` for a boolean in a `WHERE` clause, `AI_AGG`/`AI_SUMMARIZE_AGG` for reducing many rows to one answer, and `AI_EMBED` + `VECTOR_COSINE_SIMILARITY` for retrieval. For RAG, know the chunk → embed → retrieve → rerank order and when **Cortex Search** replaces hand-rolled vector search. Governance (29%) is mostly *which role, which view, which parameter*: `SNOWFLAKE.CORTEX_USER` to call functions, `CORTEX_MODELS_ALLOWLIST` to restrict which models an account may call, **Cortex Guard** for harmful-content filtering versus `AI_REDACT` for PII, and the feature-specific usage views (not one generic view) for cost questions. Overview (18%) rewards knowing which *product* fits a requirement — Cortex Search vs Cortex Analyst vs Cortex Agents — plus their limits, such as Cortex Agents APIs not being callable from a Streamlit in Snowflake app on a warehouse runtime (use a container runtime). Document Processing (15%) is small but very learnable: `AI_PARSE_DOCUMENT` **OCR** mode for plain text versus **LAYOUT** mode when tables and structure matter, `AI_EXTRACT` for pulling named fields, and stages plus directory tables plus streams and tasks for automation.

## Practice Exam — 250 Questions

Prepare for the SnowPro Specialty: Gen AI with our **250-question practice exam** covering all 4 exam domains. Every question is a real-world scenario with detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Snowflake Certification Path

Start with the **SnowPro Core Certification** (the broad, foundational credential), then add **SnowPro Advanced** role certifications (Architect, Data Engineer, Administrator, Data Analyst, Data Scientist) and **SnowPro Specialty** certifications — **Gen AI**, Native Apps, and Snowpark — which validate focused, hands-on expertise in a specific Snowflake capability. There is no hard prerequisite for the Gen AI specialty, though SnowPro Core and real project experience with Cortex are strongly recommended.

## Related Snowflake Certifications

If you're studying for the SnowPro Specialty: Gen AI, you might also be interested in these Snowflake certifications:

- **[SnowPro Core Certification (COF-C03)](/cert-tracker/snowpro-core/)** — 250 practice questions
- **[SnowPro Specialty: Native Apps (NAS-C02)](/cert-tracker/snowpro-specialty-native-apps/)** — 250 practice questions
- **[SnowPro Advanced: Data Scientist](/cert-tracker/snowpro-advanced-data-scientist/)** — 250 practice questions
- **[SnowPro Advanced: Data Engineer](/cert-tracker/snowpro-advanced-data-engineer/)** — 250 practice questions
- **[SnowPro Advanced: Architect](/cert-tracker/snowpro-advanced-architect/)** — 250 practice questions

## Study Tips

1. **Lead with Functions and Governance** — together they are 67% of the exam; know which AI_ function does which job, and which role, view, or parameter enforces which control
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness for the specialty level
3. **Get hands-on in a trial account** — build a small RAG pipeline end to end: stage documents, `AI_PARSE_DOCUMENT` them, chunk and `AI_EMBED`, retrieve with Cortex Search, then answer with `AI_COMPLETE`
4. **Think in mechanisms and limits** — the exam is about *which* Cortex feature, privilege, parameter, or mode fits the requirement, and what each one cannot do; read every explanation for the why
5. **Check the official page** — [official exam details](https://learn.snowflake.com/en/certifications/snowpro-GenAI-C02/) always have the latest objectives
