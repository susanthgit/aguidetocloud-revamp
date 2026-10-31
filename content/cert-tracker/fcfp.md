---
title: "FCFP Study Guide: Financial Desktop Interoperability"
description: "Explore the published FCFP topics with original FDC3 2.0 knowledge practice on contexts, intents, channels, trust and desktop workflow design."
type: "cert-tracker"
layout: "single"
exam_code: "FCFP"
exam_title: "FINOS Certified FDC3 Practitioner"
exam_level: "entry"
exam_status: "active"
exam_category: "Linux Foundation"
vendor: "linuxfoundation"
manual: true
guided_slug: "fcfp"
lastmod: "2026-11-01"
---

## About this study guide

The **FINOS Certified FDC3 Practitioner (FCFP)** certification from **The Linux Foundation** covers the concepts and design decisions behind financial desktop interoperability. Its published topics include shared context, application discovery, intents, channels, trust and the limits of the standard.

**Version scope matters.** These original practice questions explicitly use **FDC3 2.0**. The issuer does not state which FDC3 version its exam tests. **FDC3 3.0 is now current and is outside this bank.** This is versioned knowledge practice for the published topic areas, not a current-exam simulation or a claim of complete exam coverage.

This Guided resource is independent. It contains no official, recalled or reconstructed exam items and uses no official logo or badge. The Linux Foundation and FINOS own their certification and project names and marks. This resource is not affiliated with or endorsed by either organisation.

## Exam facts

| Detail | Published information checked on 1 November 2026 |
|---|---|
| Certification | FINOS Certified FDC3 Practitioner (FCFP) |
| Format | Online, remotely proctored multiple-choice exam |
| Duration | 90 minutes |
| Scored question count | Not stated on the issuer page |
| Passing score | 75% in the Linux Foundation multiple-choice FAQ |
| Prerequisites | None published; eligibility and identification requirements still apply |
| Validity | Two years |
| Scheduling eligibility | Twelve months after purchase; one retake included |
| Version tested by the issuer | Not stated on the issuer page |
| Availability | Enrolment offered; no retirement notice observed on the current exam page |
| Official information | [Linux Foundation FCFP certification](https://training.linuxfoundation.org/certification/finos-certified-fdc3-practitioner/) |

Check the [multiple-choice FAQ](https://docs.linuxfoundation.org/tc-docs/certification/faq-mc) and [exam instructions](https://docs.linuxfoundation.org/tc-docs/certification/important-instructions-mc) before booking. Use the official page for current pricing and programme requirements.

## Domains and practice coverage

The question allocation follows the five published weights. That allocation does not establish the issuer's exam version or guarantee that every exam objective is covered.

| Published domain | Weight | Original practice questions |
|---|---:|---:|
| Fundamentals | 20% | 50 |
| FDC3 Components | 20% | 50 |
| FDC3 Standard API | 34% | 85 |
| Security | 10% | 25 |
| Interoperability Design | 16% | 40 |
| **Total** | **100%** | **250** |

### Fundamentals

Start with the reason for the standard: applications can cooperate without each pair agreeing on a separate integration. Distinguish the responsibilities of FINOS, platform providers, application providers and users. Read the charter and separate required conformance from optional or experimental capabilities. Publishing an application is not the same as certifying a platform.

### FDC3 Components

Think of a Desktop Agent as the component that makes applications discoverable, launchable and addressable. A context identifies the subject of work; an intent describes the action another application should perform. Learn how standard context types and identifiers support reusable contracts. Read directory records carefully rather than assuming that an application's display name identifies a specific running instance.

### FDC3 Standard API

This is the largest topic area. Study channel membership, listeners, context delivery, intent discovery, intent raising, results, opening applications and metadata as separate mechanisms. In version 2.0, details such as whether a listener was added through the Desktop Agent or a Channel object can change initial delivery. Track API readiness, promise rejection and app-instance targeting explicitly.

### Security

Interoperability does not remove a trust boundary. A directory record tells an agent about an application; it does not make that application trustworthy or entitled to sensitive information. Separate the standard's channel restrictions from an organisation's own approval, authentication and data-loss-prevention controls. Share only the data a workflow requires.

### Interoperability Design

Begin with the user's task, then decide what subject data and action need to move between applications. Avoid treating a desktop interoperability interface as a replacement for backend services, identity systems or workspace management. Plan for unavailable applications, unsupported contexts and feedback loops without inventing behaviour the selected version does not promise.

## A practical study plan

1. **Label the version.** Keep version 2.0 notes separate from current 3.0 documentation.
2. **Map a small workflow.** Identify the initiating application, recipient, context, intended action and trust boundary.
3. **Trace a lifecycle.** Follow readiness, registration, discovery, delivery, result handling and cleanup.
4. **Compare neighbouring mechanisms.** Explain when user channels, application channels and intents solve different problems.
5. **Read the source after answering.** Check both the settling rule and why a plausible alternative fails.

The [official version index](https://fdc3.finos.org/versions) separates current and archived documentation. Use the [version 2.0 API specification](https://fdc3.finos.org/docs/2.0/api/spec), [context specification](https://fdc3.finos.org/docs/2.0/context/spec) and [App Directory specification](https://fdc3.finos.org/docs/2.0/app-directory/spec) for this bank.

## Independent practice

[Guided Financial Desktop Interoperability Study Practice](/guided/fcfp/) includes 250 original, explicitly version-scoped questions. Twenty are free without an account; full access is US$9 for one year. Each question provides an explanation, distractor feedback, a hint, a learning tip, a practical application and a public reference.

Practice access does not include an official exam voucher or authorised training, does not reproduce the live exam environment, and does not guarantee a pass. It does not claim that the issuer currently tests FDC3 2.0.
