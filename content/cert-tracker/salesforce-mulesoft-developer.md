---
title: "Salesforce Certified MuleSoft Developer — Study Guide & Practice Exam"
description: "Free SALESFORCE-MULESOFT-DEVELOPER study guide. Try 20 questions free. Full practice exam access: US$9 for 1 year. Salesforce Certified MuleSoft Developer."
type: "cert-tracker"
layout: "single"
exam_code: "SALESFORCE-MULESOFT-DEVELOPER"
exam_title: "Salesforce Certified MuleSoft Developer"
exam_level: "intermediate"
exam_status: "active"
exam_category: "Salesforce"
vendor: "salesforce"
manual: false
guided_slug: "salesforce-mulesoft-developer"
faq_intro: "The questions Mule developers usually ask before booking the MuleSoft Developer exam."
faq:
  - question: "What does the Salesforce MuleSoft Developer exam cover?"
    answer: "Salesforce publishes twelve sections; this study guide consolidates them into eight teachable domains, and every consolidated weight is the exact sum of the sections inside it, so the total is still 100. Structuring Mule Applications and API Implementation Interfaces is the largest at 17% — splitting an application across configuration files, property placeholders and secure properties, the real differences between a flow, a subflow and a private flow, APIkit routers and RAML scaffolding. Then Routing Events and Handling Errors at 16%, covering the Choice router, Scatter-Gather, Try scopes and the decisive difference between on-error continue and on-error propagate; API-Led Connectivity and API Design at 15%; Debugging, Deploying and Managing APIs at 12%, covering the Anypoint Studio debugger, CloudHub, Runtime Manager, API proxies and API Manager policies; and Accessing and Modifying Mule Events, Using Connectors, Processing Records, and Transforming Data with DataWeave at 10% each."
  - question: "Does this exam have an exam code like AZ-104?"
    answer: "No. Salesforce identifies this credential by name rather than by an alphanumeric exam code, so there is no official code to quote. You may still see MCD-Level1 quoted on study sites — that is a legacy MuleSoft-era code from before Salesforce folded the MuleSoft credentials into its own certification programme, and it appears on no current Salesforce page. If a site presents it as the exam code today, treat that as a sign the site is working from a stale mirror."
  - question: "How long is the exam and what score do I need?"
    answer: "120 minutes for 60 multiple-choice questions, plus up to five unscored questions that do not count toward your result. The passing score is 70%. It is delivered proctored, either onsite at a testing centre or online, and costs $200 USD with a $100 USD retake fee. The credential is maintained with an annual maintenance badge on Trailhead."
  - question: "Do I need experience before taking it?"
    answer: "There is no hard prerequisite, so you can book it whenever you like. Salesforce recommends three to six months of hands-on Mule 4 project experience, and that recommendation is worth taking seriously — the questions hand you a flow and ask what it actually does, not what a component is called. This credential is itself the prerequisite for MuleSoft Developer II, so it is the natural first stop on the MuleSoft path."
  - question: "Which domain should I study first?"
    answer: "Start with the Mule event itself, even though Accessing and Modifying Mule Events is only 10%. Payload, attributes and variables — what each one is, who sets it, and how long it survives — underpin almost every question in the two heaviest domains, because a DataWeave transformation and an error handler are both really questions about what is in the event at that moment. Once that is second nature, move to Structuring Mule Applications and API Implementation Interfaces at 17%, then Routing Events and Handling Errors at 16%, where the recurring decision is what the caller ends up seeing when something fails."
---
## About the Salesforce MuleSoft Developer Exam

> Master the Salesforce Certified MuleSoft Developer exam: read a Mule 4 flow and predict exactly what it does, tell payload from attributes from variables, choose between a For Each scope and a Batch Job, write DataWeave that coerces, filters and orders data correctly, know why on-error continue and on-error propagate give the caller different answers, and deploy and govern the finished API on CloudHub and API Manager.

The complete 250-question practice exam for the Salesforce Certified MuleSoft Developer credential, written to the twelve-section blueprint Salesforce publishes in its official exam guide and consolidated into eight teachable domains. Every question targets Mule 4 and the Spring '24 release. Covers API-led connectivity and API design including Application Network architecture, the System, Process and Experience layers, modern API characteristics, the C4E operating model, consuming RAML-based RESTful web services, REST methods and resources, request and response design, and when a value belongs in a URI parameter rather than a query parameter; structuring Mule applications and building API implementation interfaces including splitting an application across configuration files, property placeholders and secure properties, environment-specific property resolution, global elements and shared configuration, the real differences between a flow, a subflow and a private flow, when a Flow Reference is the right call and when it is not, APIkit routers, RAML scaffolding, and implementing responses that match a specification; accessing and modifying Mule events including the payload, the read-only attributes set by the source or connector, variables and their lifetime, DataWeave expressions that read and write each part of the event, and enriching an event with the Mule 4 connector Target parameter instead of a Mule 3 message enricher; using connectors including the Database Connector with select, insert, update and bulk operations, the File and FTP connectors, and retrieving and combining data mid-flow; processing records including For Each scopes, Batch Jobs with their Load and Dispatch, Process and On Complete phases, batch step filters and aggregators, record-level error handling, database listeners and watermarking, and persisting data between flow executions with the Object Store; transforming data with DataWeave including output directives and MIME types, type coercion, the core function library, map, filter, orderBy, groupBy, pluck and reduce, calling a Mule flow from a DataWeave script, and defining and reusing modules, functions and variables; routing events and handling errors including the Choice router with DataWeave conditions, Scatter-Gather aggregation and what happens when one route fails, First Successful and Round Robin, the Validation module, global and inline error handlers, the decisive difference between on-error continue and on-error propagate, combining multiple handlers, Try scopes and transactions, and mapping custom error types; and debugging, deploying and managing APIs including root-cause analysis of Mule errors, the Anypoint Studio visual debugger and breakpoints, log levels and the Logger component, deploying to CloudHub, Runtime Manager operations, API proxies, autodiscovery, and applying API Manager policies and SLA tiers. Original practice questions.

## Who Should Take This Exam?

The Salesforce Certified MuleSoft Developer is designed for **developers who already build and deploy Mule 4 applications**. Salesforce recommends three to six months of hands-on Mule 4 project experience, and this credential is the prerequisite for MuleSoft Developer II.

**Prerequisites:** None. Salesforce recommends three to six months of hands-on Mule 4 project experience. This credential is itself the prerequisite for MuleSoft Developer II.

**Typical study time:** 4-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | None — Salesforce identifies this credential by name |
| **Title** | Salesforce Certified MuleSoft Developer |
| **Duration** | 120 minutes |
| **Questions** | 60 multiple choice plus up to 5 unscored |
| **Pass Score** | 70% |
| **Cost** | $200 USD, retake $100 USD |
| **Provider** | Proctored onsite at a testing centre or online |
| **Validity** | Maintained with an annual maintenance badge on Trailhead |
| **Prerequisites** | None. Salesforce recommends three to six months of hands-on Mule 4 project experience. This credential is itself the prerequisite for MuleSoft Developer II. |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Salesforce →](https://help.salesforce.com/s/articleView?id=005298959&type=1) |

## Exam Domains & Weights

The Salesforce Certified MuleSoft Developer exam covers **8 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| API-Led Connectivity and API Design | 15% | 38 |
| Structuring Mule Applications and API Implementation Interfaces | 17% | 42 |
| Accessing and Modifying Mule Events | 10% | 25 |
| Using Connectors | 10% | 25 |
| Processing Records | 10% | 25 |
| Transforming Data with DataWeave | 10% | 25 |
| Routing Events and Handling Errors | 16% | 40 |
| Debugging, Deploying and Managing APIs | 12% | 30 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Structuring Mule Applications and API Implementation Interfaces** carries the most weight (17%), closely followed by **Routing Events and Handling Errors** (16%) — between them that is a third of the exam, so start there. Four domains tie for the lowest weight at 10% each, but don't skip them — **Accessing and Modifying Mule Events** in particular underpins the heavier domains, because DataWeave and error handling are both really questions about what is in the event.

## Practice Exam — 250 Questions

Prepare for the Salesforce Certified MuleSoft Developer with our **250-question practice exam** covering all 8 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## MuleSoft Certification Path

The Salesforce Certified MuleSoft Developer is the entry point to the MuleSoft path — Mule 4 application structure, the Mule event, connectors, batch processing, DataWeave, routing and error handling, and deploying to CloudHub with API Manager governance. It is the prerequisite for **MuleSoft Developer II**, which goes deeper into custom connectors, performance tuning and advanced deployment. If you also administer the wider Salesforce platform, the [Salesforce Certified Platform Administrator](/cert-tracker/salesforce-administrator/) covers a completely different surface — org configuration, sharing, reporting, Flow and Agentforce — with no overlap with this exam.

## Related Salesforce Certifications

If you're studying for the Salesforce Certified MuleSoft Developer, you might also be interested in these Salesforce certifications:

- **[Salesforce Certified Platform Administrator](/cert-tracker/salesforce-administrator/)** — 250 practice questions

## Study Tips

1. **Start with the heaviest domain** — focus your time where the exam focuses its questions
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
5. **Check the official page** — [official exam details](https://help.salesforce.com/s/articleView?id=005298959&type=1) always have the latest objectives
