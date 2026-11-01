---
title: "CNPE Study Guide: Cloud Native Platform Engineering"
description: "Study CNPE's five platform engineering domains. Original MCQ learning companion, not a hands-on exam simulator. Try 20 questions free."
type: "cert-tracker"
layout: "single"
exam_code: "CNPE"
exam_title: "Cloud Native Platform Engineering MCQ Companion"
exam_level: "professional"
exam_status: "active"
exam_category: "CNCF"
vendor: "cncf"
manual: true
guided_slug: "cncf-cnpe"
supplemental: true
lastmod: "2026-11-01"
---

## About the CNPE Exam

CNPE validates practical cloud native platform engineering: designing infrastructure, delivering changes, providing self-service APIs, diagnosing incidents and enforcing policy.

**Before you buy:** the official CNPE exam is hands-on and performance-based. Our 250 original multiple-choice questions are a **conceptual study companion**, not a hands-on exam simulator. They include no lab environment, do not measure practical skills and do not predict an exam result. Use them alongside practical preparation. This material is not affiliated with or endorsed by CNCF or The Linux Foundation.

The [Linux Foundation CNPE page](https://training.linuxfoundation.org/certification/certified-cloud-native-platform-engineer-cnpe/) and [CNCF CNPE overview](https://www.cncf.io/training/certification/cnpe/) are the sources for the exam details below, checked on November 1, 2026.

## Who Should Take This Exam?

CNPE is aimed at experienced platform engineers, DevOps and site reliability practitioners, and platform architects. There are no formal prerequisites. Candidates need practical experience implementing and operating cloud native platforms, not just recognising tool names.

The official guidance expects candidates to use documentation when working with unfamiliar tools. Its examples are not a fixed tool list or a promise about a particular exam task.

## Exam Quick Facts

| Detail | Official assessment |
|--------|---------------------|
| Exam | Certified Cloud Native Platform Engineer (CNPE) |
| Format | Online, proctored, performance-based |
| Duration | 120 minutes |
| Tasks | 15-20 practical tasks |
| Environment | Linux remote desktop, terminal and web interfaces |
| Published exam price | US$445; check the official page before booking |
| Retake | One retake included |
| Certification validity | 2 years |
| Prerequisites | None required |

The [official CNPE instructions](https://docs.linuxfoundation.org/tc-docs/certification/important-instructions-cnpe) describe the tasks, permitted resources and exam environment. They are separate from this question bank. Linux Foundation also provides access to its own exam simulator with exam enrollment; that is **not** this product.

## Exam Domains & Weights

These are the five official CNPE domains. The question counts are this bank's editorial allocation, not official exam task counts.

| Domain | Official weight | Companion questions |
|--------|----------------:|--------------------:|
| Platform Architecture and Infrastructure | 15% | 38 |
| GitOps and Continuous Delivery | 25% | 62 |
| Platform APIs and Self-Service Capabilities | 25% | 62 |
| Observability and Operations | 20% | 50 |
| Security and Policy Enforcement | 15% | 38 |
| **Total** | **100%** | **250** |

### Platform Architecture and Infrastructure

Study how networking, storage and compute choices interact. Practise making capacity and isolation decisions for shared platforms, using cost information to right-size resources, and improving multi-tenant resource usage without weakening separation between teams.

### GitOps and Continuous Delivery

Connect the desired-state workflow to application and infrastructure delivery. Understand how a Kubernetes-integrated pipeline feeds a GitOps process, and how progressive delivery uses measurements to decide whether a blue/green or canary rollout should continue.

### Platform APIs and Self-Service Capabilities

Work with custom resource definitions, operators and provisioning workflows. A self-service API needs a clear contract: what a developer requests, how automation fulfills it, how status is reported, and how failed or repeated requests are handled.

### Observability and Operations

Use monitoring, alerts, logs and traces together to investigate platform failures. Look beyond isolated signal definitions: consider deployment metrics, platform efficiency, incident evidence and the checks that demonstrate a remediation actually worked.

### Security and Policy Enforcement

Connect service-to-service protection, access controls and admission policy to the platform's operating model. Study how audit trails, software bills of materials, compliance reports and pipeline security checks provide evidence. A scanner result alone does not establish that a deployment is safe.

## MCQ Learning Companion — 250 Questions

The companion contains original selected-response scenarios across all five domains. Study Mode provides explanations and wrong-answer analysis; flashcards and progress tracking support revision. The modes are untimed and do not recreate CNPE's practical assessment.

**20 questions are free**, with no account needed. Full access costs **US$9 for one year**, with no subscription or auto-renewal. Read the format limitation above before buying.

[Try the CNPE conceptual study companion](/guided/cncf-cnpe/practice/)

## Study Tips

1. **Build and verify:** practise a small self-service platform workflow in your own disposable environment, and check the resulting resources and status.
2. **Follow a change across the platform:** connect a delivery change to its provisioning, telemetry and policy consequences.
3. **Investigate before changing:** use observable evidence to distinguish a delivery problem, resource constraint, API failure and policy rejection.
4. **Practise documentation use:** consult official project documentation rather than memorising an assumed list of exam commands.
5. **Treat MCQs as revision:** a correct selected response is not proof that you can implement the same decision in a live environment.

## Related CNCF Certifications

- [CKA: Kubernetes administration](/cert-tracker/cncf-cka/) — Kubernetes cluster operation.
- [CGOA: GitOps foundations](/cert-tracker/cncf-cgoa/) — desired-state delivery concepts.
- [CBA: Backstage](/cert-tracker/cncf-cba/) — developer portal implementation.
- [PCA: Prometheus](/cert-tracker/cncf-pca/) — monitoring with Prometheus.
- [KCSA: Kubernetes security foundations](/cert-tracker/cncf-kcsa/) — Kubernetes and cloud native security.
