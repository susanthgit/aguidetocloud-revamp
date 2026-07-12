---
title: "KCA: Kyverno Certified Associate exam — Free Study Guide"
description: "KCA: the CNCF Kyverno Certified Associate exam. 250-question practice exam (20 free) plus a complete study guide covering Kyverno policy-as-code — validate, mutate, generate, and verifyImages rules, installation and RBAC, the Kyverno CLI, applying policies, CEL, policy reports, and exceptions, with exam tips."
type: "cert-tracker"
layout: "single"
exam_code: "KCA"
exam_title: "CNCF KCA (Kyverno Certified Associate)"
exam_level: "associate"
exam_status: "active"
exam_category: "CNCF"
vendor: "cncf"
manual: false
guided_slug: "cncf-kca"
---
## About the KCA Exam

> Prove you can automate Kubernetes security, compliance, and governance with Kyverno

Master Kyverno end to end — the policy-as-code model for Kubernetes. The KCA covers Kyverno fundamentals (the ClusterPolicy and Policy resources and the validate, mutate, generate, and verifyImages rule types, admission controllers, and distributing policies as OCI images), installation and configuration (Helm installs into a dedicated Namespace, the admission/background/reports/cleanup controllers, CRDs, controller flags, RBAC, high availability, and upgrades), the Kyverno CLI (apply, test, and jp for shift-left policy testing), applying policies and resource selection, writing policies (validation pattern anchors, preconditions, mutation with strategic-merge and RFC-6902 JSON patches, generation with data and clone plus synchronize, verifyImage rules with cosign attestors, variables and API calls, autogen, cleanup policies, and CEL), and policy management (Policy Reports in the OpenReports format, PolicyExceptions, and Prometheus metrics). Original practice questions covering all 6 official KCA domains. Not affiliated with, endorsed by, or sourced from CNCF or Linux Foundation certification exams.

## Who Should Take This Exam?

The KCA is designed for **platform engineers, DevSecOps and security engineers, DevOps engineers, and SREs** who use Kyverno to enforce policy-as-code on Kubernetes. There are no formal prerequisites; a working familiarity with Kubernetes resources, YAML, and admission control is helpful but not required. The exam is multiple-choice and focuses on how Kyverno works — writing validate, mutate, generate, and verifyImages rules, installing and configuring the controllers, using the CLI, and managing policy reports and exceptions.

**Typical study time:** 2-4 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | KCA |
| **Title** | CNCF KCA (Kyverno Certified Associate) |
| **Duration** | 90 minutes |
| **Questions** | 60 |
| **Pass Score** | 75% |
| **Cost** | $250 USD |
| **Provider** | Linux Foundation / PSI |
| **Validity** | 2 years |
| **Question Types** | Multiple choice |

## Exam Domains & Weights

The KCA exam covers **6 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Writing Policies | 32% | 80 |
| Fundamentals of Kyverno | 18% | 45 |
| Installation, Configuration, and Upgrades | 18% | 45 |
| Kyverno CLI | 12% | 30 |
| Applying Policies | 10% | 25 |
| Policy Management | 10% | 25 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Writing Policies** (32%) is by far the heaviest domain — you must be able to write and read validate rules (the pattern anchors: conditional, equality, existence, negation, and add-if-not-present), mutate rules (strategic-merge versus RFC-6902 JSON patches, and mutate-existing), generate rules (data versus clone, and synchronize), and verifyImages rules (cosign keyed versus keyless attestors and attestations). Next, know the two 18% domains — Fundamentals (the validate/mutate/generate/verifyImages rule types and how Kyverno runs as an admission controller) and Installation (the four controllers, Helm high availability, and RBAC). Then be fluent with the Kyverno CLI (apply, test, jp) and the difference between Enforce and Audit.

## Practice Exam — 250 Questions

Prepare for the KCA with our **250-question practice exam** covering all 6 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## CNCF Certification Path

Start with KCNA (Kubernetes and Cloud Native Associate) for cloud native fundamentals. The KCA (Kyverno) certifies your ability to enforce policy-as-code on Kubernetes, and pairs naturally with the security track — KCSA (security associate) and CKS (Certified Kubernetes Security Specialist) — as well as the core Kubernetes track (CKA administrator and CKAD developer), CCA (Cilium) for networking and runtime security, and CGOA/CAPA for GitOps continuous delivery.

## Related CNCF Certifications

If you're studying for the KCA, you might also be interested in these CNCF certifications:

- **[KCSA: CNCF Kubernetes and Cloud Native Security Associate](/cert-tracker/cncf-kcsa/)** — 250 practice questions
- **[CKS: CNCF Certified Kubernetes Security Specialist](/cert-tracker/cncf-cks/)** — 250 practice questions
- **[CCA: CNCF Certified Cilium Associate](/cert-tracker/cncf-cca/)** — 250 practice questions
- **[KCNA: CNCF Kubernetes and Cloud Native Associate](/cert-tracker/cncf-kcna/)** — 250 practice questions

## Study Tips

1. **Master writing policies** — Writing Policies (32%) is the biggest domain; be able to author and interpret validate, mutate, generate, and verifyImages rules, know the pattern anchors, and understand strategic-merge versus JSON patches and generate data versus clone
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
