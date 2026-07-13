---
title: "OTCA: OpenTelemetry Certified Associate exam — Free Study Guide"
description: "OTCA: the CNCF OpenTelemetry Certified Associate exam. 250-question practice exam (20 free) plus a complete study guide covering OpenTelemetry — the three signals (traces, metrics, logs), the API and SDK, instrumentation, context propagation and OTLP, the Collector's receivers, processors, exporters, and connectors, and debugging observability pipelines, with exam tips."
type: "cert-tracker"
layout: "single"
exam_code: "OTCA"
exam_title: "CNCF OTCA (OpenTelemetry Certified Associate)"
exam_level: "associate"
exam_status: "active"
exam_category: "CNCF"
vendor: "cncf"
manual: false
guided_slug: "cncf-otca"
---
## About the OTCA Exam

> Instrument applications and pipelines with OpenTelemetry's vendor-neutral observability

Master OpenTelemetry end to end — the CNCF vendor-neutral framework for generating, collecting, and exporting telemetry. The OTCA covers the fundamentals of observability (the three signals — traces, metrics, and logs — plus baggage, observability versus monitoring, resource attributes, semantic conventions, manual and automatic instrumentation, and analysis outcomes like SLIs/SLOs and RED/USE), the OpenTelemetry API and SDK (the API-versus-SDK split and the no-op-by-default API, the data model, TracerProvider/MeterProvider/LoggerProvider, span processors and exporters, head sampling, metric instruments, aggregation and temporality, the logs bridge, SDK pipelines, programmatic and OTEL_* environment-variable configuration, the Context API, W3C Trace Context and baggage propagation, zero-code agents, and OTLP export over gRPC and HTTP), the OpenTelemetry Collector (receivers, processors, exporters, connectors, and extensions, service pipelines, transforming data with OTTL, agent-versus-gateway deployment, the OpenTelemetry Operator, and scaling), and maintaining and debugging observability pipelines (context-propagation diagnosis, the debug exporter and zpages, error handling, and telemetry-schema migration). Original practice questions covering all 4 official OTCA domains. Not affiliated with, endorsed by, or sourced from CNCF or Linux Foundation certification exams.

## Who Should Take This Exam?

The OTCA is designed for **developers, DevOps engineers, SREs, and platform engineers** who instrument applications and operate observability pipelines with OpenTelemetry. There are no formal prerequisites; a working familiarity with distributed systems, application code, and running services is helpful but not required. The exam is multiple-choice and focuses on how OpenTelemetry works — the signals and data model, instrumenting with the API and SDK, propagating context, exporting with OTLP, configuring the Collector, and debugging telemetry pipelines.

**Typical study time:** 2-4 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | OTCA |
| **Title** | CNCF OTCA (OpenTelemetry Certified Associate) |
| **Duration** | 90 minutes |
| **Questions** | 60 |
| **Pass Score** | 75% |
| **Cost** | $250 USD |
| **Provider** | Linux Foundation / PSI |
| **Validity** | 2 years |
| **Question Types** | Multiple choice |

## Exam Domains & Weights

The OTCA exam covers **4 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| The OpenTelemetry API and SDK | 46% | 115 |
| The OpenTelemetry Collector | 26% | 65 |
| Fundamentals of Observability | 18% | 45 |
| Maintaining and Debugging Observability Pipelines | 10% | 25 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **The OpenTelemetry API and SDK** (46%) is by far the heaviest domain — nearly half the exam. Know the API-versus-SDK responsibilities (the API is no-op until an SDK is registered), the trace/metric/log data model, the SDK pipeline of processors and exporters, span processors (SimpleSpanProcessor versus the production-default BatchSpanProcessor) and head samplers, metric instruments and temporality, the logs bridge, OTEL_* configuration, and W3C Trace Context and baggage propagation with OTLP. Next, the Collector (26%) — receivers, processors, exporters, connectors, and extensions, service pipelines, and agent-versus-gateway deployment. Then Fundamentals (18%) and debugging pipelines (10%).

## Practice Exam — 250 Questions

Prepare for the OTCA with our **250-question practice exam** covering all 4 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## CNCF Certification Path

Start with KCNA (Kubernetes and Cloud Native Associate) for cloud native fundamentals. The OTCA (OpenTelemetry) certifies your ability to instrument applications and run observability pipelines, and pairs naturally with PCA (Prometheus) on the observability track and with the GitOps and delivery track — CGOA (GitOps) and CAPA (Argo) — as well as the core Kubernetes track (CKA administrator and CKAD developer) and the security and networking associates (KCSA, KCA, and CCA).

## Related CNCF Certifications

If you're studying for the OTCA, you might also be interested in these CNCF certifications:

- **[PCA: CNCF Prometheus Certified Associate](/cert-tracker/cncf-pca/)** — 250 practice questions
- **[KCNA: CNCF Kubernetes and Cloud Native Associate](/cert-tracker/cncf-kcna/)** — 250 practice questions
- **[CGOA: CNCF Certified GitOps Associate](/cert-tracker/cncf-cgoa/)** — 250 practice questions
- **[CCA: CNCF Certified Cilium Associate](/cert-tracker/cncf-cca/)** — 250 practice questions

## Study Tips

1. **Master the API and SDK** — the API-and-SDK domain (46%) is nearly half the exam; know the API-versus-SDK split, span processors and samplers, metric instruments and temporality, the logs bridge, OTEL_* configuration, and context propagation with OTLP
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
