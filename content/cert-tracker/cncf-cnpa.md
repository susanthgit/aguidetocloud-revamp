---
title: "CNPA Platform Engineering: Free Study Guide"
description: "Study all six CNPA domains. Try 20 original questions free; unlock the 250-question platform engineering practice bank for US$9 for 1 year."
type: "cert-tracker"
layout: "single"
exam_code: "CNPA"
exam_title: "Guided CNPA Platform Engineering Practice"
exam_level: "associate"
exam_status: "active"
exam_category: "CNCF"
vendor: "cncf"
manual: true
guided_slug: "cncf-cnpa"
lastmod: "2026-11-01"
images: ["/images/og/certs/cncf-cnpa.jpg"]
---

## About the CNPA Exam

The **Certified Cloud Native Platform Engineering Associate (CNPA)** covers the foundations of building platforms that help development teams deliver software. The emphasis is on useful capabilities, clear interfaces and measurable outcomes, not simply installing a developer portal.

This guide and its practice questions are independent study materials. They are not affiliated with or endorsed by CNCF or The Linux Foundation, and contain no recalled or official exam questions.

## Who Should Take This Exam?

CNPA is intended for people learning platform engineering, including developers, operations engineers and those supporting internal developer platforms. There are no formal prerequisites. Familiarity with cloud-native applications, Kubernetes and software delivery helps connect the concepts.

A developer portal can provide an entry point, but the platform also needs working services, supported interfaces, ownership and feedback from its users. Study how those pieces work together.

## Exam Quick Facts

| Detail | Value |
|---|---|
| Exam identifier | CNPA |
| Official credential | Certified Cloud Native Platform Engineering Associate |
| Format | Online proctored multiple-choice exam |
| Duration | 120 minutes |
| Questions | 85 |
| Passing score | 75% |
| Exam fee | US$250, including one retake |
| Provider | Linux Foundation / PSI |
| Certification validity | 2 years |
| Prerequisites | None |

The [official CNPA certification page](https://training.linuxfoundation.org/certification/certified-cloud-native-platform-engineering-associate-cnpa/) provides enrollment details. The Linux Foundation's [exam instructions](https://docs.linuxfoundation.org/tc-docs/certification/important-instructions-mc) specify CNPA's 85-question, 120-minute exception; its [multiple-choice FAQ](https://docs.linuxfoundation.org/tc-docs/certification/faq-mc) states the passing score. Facts checked on 1 November 2026; the issuer can update them.

## Exam Domains & Weights

| Official domain | Weight | Original practice questions |
|---|---:|---:|
| Platform Engineering Core Fundamentals | 36% | 90 |
| Platform Observability, Security, and Conformance | 20% | 50 |
| Continuous Delivery & Platform Engineering | 16% | 40 |
| Platform APIs and Provisioning Infrastructure | 12% | 30 |
| IDPs and Developer Experience | 8% | 20 |
| Measuring your Platform | 8% | 20 |
| **Total** | **100%** | **250** |

The practice-bank allocation follows the published domain weights. The **250 original study questions are not the official 85-question exam** and do not reproduce its items or guarantee a result. The [CNCF curriculum](https://github.com/cncf/curriculum/tree/master/cnpa) is the scope reference.

## Practice Exam — 250 Questions

Use the bank to connect platform concepts to concrete decisions: selecting capabilities around user needs, investigating delivery failures, interpreting telemetry, designing self-service APIs and choosing useful measures.

Each question includes a worked explanation, specific reasons the other answers do not fit, and a public primary reference.

- Try **20 questions free**, without an account.
- Unlock the full **250-question bank for US$9 for 1 year**.
- Review by domain and use the study and timed practice modes.
- Revisit weak areas with the available progress and repetition features.

Start with the [CNPA practice bank](/guided/cncf-cnpa/). Timed practice is a learning aid, not a replica of the issuer's examination.

## CNCF Certification Path

CNPA stands on its own; passing another credential is not an entry requirement. Kubernetes fundamentals, GitOps concepts and observability are useful supporting topics. Choose additional certifications based on the work you want to learn, not an assumed mandatory sequence.

## Related CNCF Certifications

- [KCNA study guide](/cert-tracker/cncf-kcna/) — Kubernetes and cloud-native foundations.
- [CGOA study guide](/cert-tracker/cncf-cgoa/) — the GitOps operating model.
- [PCA study guide](/cert-tracker/cncf-pca/) — Prometheus monitoring concepts.

## Study Tips

1. **Start with the platform's users.** Read the [CNCF Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/) and explain which developer problems a proposed capability solves.
2. **Separate interfaces from implementation.** A portal, catalog entry or custom-resource schema does not by itself provide the service behind it. Trace the request through the responsible backend and controller.
3. **Follow desired state through delivery.** Compare what is declared, what has been observed and which component is responsible for reconciling the difference.
4. **Use evidence, not one success signal.** Security checks, signatures and conformance results answer different questions; none guarantees that an application is safe.
5. **Read metrics in context.** The [current DORA metric guide](https://dora.dev/guides/dora-metrics/) distinguishes throughput and instability measures. Pair delivery data with developer feedback rather than imposing a universal target.
