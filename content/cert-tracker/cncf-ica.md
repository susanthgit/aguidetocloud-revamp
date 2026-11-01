---
title: "ICA: Istio Certified Associate Study Guide"
description: "Free ICA study guide for Istio 1.29. Review routing, security and troubleshooting. Try 20 learning questions free; full 250-question access is US$9."
type: "cert-tracker"
layout: "single"
exam_code: "ICA"
exam_title: "Istio Certified Associate (ICA)"
exam_level: "intermediate"
exam_status: "active"
exam_category: "CNCF"
vendor: "cncf"
manual: true
guided_slug: "cncf-ica"
lastmod: "2026-11-01"
faq_intro: "Common questions about ICA preparation and this independent learning bank."
faq:
  - q: "Is this a hands-on ICA exam simulator?"
    a: "No. These are original multiple-choice learning questions. Linux Foundation's current technical instructions describe 15-20 practical command-line tasks. Use this bank alongside hands-on Istio lab practice, not instead of it."
  - q: "Which Istio version does this guide use?"
    a: "Istio 1.29, which is specified in the current ICA technical instructions. The older August 2025 program-change announcement describes 1.26. Check Linux Foundation's instructions again before your exam."
  - q: "Does a practice score mean I will pass ICA?"
    a: "No. The official 68% passing score applies to the actual exam. A multiple-choice practice score cannot demonstrate your ability to configure and troubleshoot a running mesh."
  - q: "How many learning questions are included?"
    a: "250 original questions across four domains. You can try 20 free; full practice access costs US$9 for one year."
---

## About the ICA Exam

> Learn to operate an Istio service mesh, then prove it in a real lab.

The **Istio Certified Associate (ICA)** is a Linux Foundation certification for engineers working with service-to-service traffic, reliability and security. It covers installing and upgrading Istio, managing traffic, securing workloads and troubleshooting.

**This is a knowledge-validation question bank, not a hands-on exam simulator.** Linux Foundation's [current ICA technical instructions](https://docs.linuxfoundation.org/tc-docs/certification/important-instructions-ica) describe **15-20 practical command-line tasks on Istio 1.29**. Its [certification product page](https://training.linuxfoundation.org/certification/istio-certified-associate-ica/) also mentions multiple-choice. We do not assume an exact MCQ composition or reproduce official exam questions.

Use these original questions to test your reasoning. Then apply, inspect and troubleshoot the configurations yourself. A practice score does not predict an official exam result.

## Who Should Take This Exam?

Platform engineers, SREs, developers and CI/CD practitioners who work with Istio. There are no formal prerequisites. Familiarity with Kubernetes Services, workloads, namespaces and YAML will help you make sense of the mesh.

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | ICA |
| **Title** | Istio Certified Associate |
| **Duration** | 120 minutes |
| **Tasks** | 15-20 practical tasks in the current technical instructions |
| **Pass Score** | 68% on the official exam, not a practice-bank readiness threshold |
| **Cost** | US$250 for the official exam |
| **Provider** | Linux Foundation / PSI |
| **Validity** | 2 years |
| **Environment** | Istio 1.29 in the current technical instructions |
| **Prerequisites** | None formally required |

Sources: [ICA certification and enrollment](https://training.linuxfoundation.org/certification/istio-certified-associate-ica/), [ICA FAQ](https://docs.linuxfoundation.org/tc-docs/certification/frequently-asked-questions-ica) and [current technical instructions](https://docs.linuxfoundation.org/tc-docs/certification/important-instructions-ica). Verify the environment again before sitting the exam: the older [August 2025 change announcement](https://training.linuxfoundation.org/istio-certified-associate-ica-program-changes/) still describes Istio 1.26.

## Exam Domains & Weights

| Domain | Official Weight | Learning Questions |
|--------|-----------------|--------------------|
| Installation, Upgrade & Configuration | 20% | 50 |
| Traffic Management | 35% | 88 |
| Securing Workloads | 25% | 62 |
| Troubleshooting | 20% | 50 |
| **Total** | **100%** | **250** |

> Traffic Management carries the largest weight. Practise tracing a request through route matches, subsets, gateways and destination policies rather than learning each YAML object in isolation.

## Practice Questions - 250 Original Learning Questions

Try **20 questions free**, with no account required. Full access costs **US$9 for one year** and includes explanations, why each distractor is wrong, hints, domain progress and official documentation links.

The bank uses single-answer MCQs to check understanding. It cannot assess command-line speed, configuration execution or recovery in a live cluster. Independent study material; not affiliated with or endorsed by CNCF, Istio, Tetrate or The Linux Foundation.

## Study Tips

1. **Install both modes.** Follow the [Istio 1.29 sidecar installation guide](https://istio.io/v1.29/docs/setup/install/) and [ambient installation guide](https://istio.io/v1.29/docs/ambient/install/). Identify which component handles each layer.
2. **Make routing observable.** Apply a route, send requests, inspect proxy configuration and compare the actual outcome with your intended weights.
3. **Separate authentication from authorization.** Work through [Istio security concepts](https://istio.io/v1.29/docs/concepts/security/) and test what happens when a client omits a token or presents a different identity.
4. **Practise failure diagnosis.** Use [istioctl diagnostic tools](https://istio.io/v1.29/docs/ops/diagnostic-tools/istioctl/) to distinguish a rejected configuration from an unreachable endpoint.
5. **Use learning questions to find gaps.** Read the explanations, open the linked source, then repeat the behavior in your own lab. Do not use a high MCQ score as a substitute for practical evidence.

## Related CNCF Certifications

- [CKA: Certified Kubernetes Administrator](/cert-tracker/cncf-cka/) for cluster administration.
- [CKAD: Certified Kubernetes Application Developer](/cert-tracker/cncf-ckad/) for application deployment.
- [PCA: Prometheus Certified Associate](/cert-tracker/cncf-pca/) for monitoring and PromQL.
