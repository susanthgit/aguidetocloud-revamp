---
title: "Splunk O11y Cloud Certified Metrics User — Study Guide & Practice Exam"
description: "Free Splunk O11y Cloud Certified Metrics User (SPLK-4001) study guide and 250-question practice exam. Master Splunk Observability Cloud metrics — getting data in with the OpenTelemetry Collector, the Infrastructure Monitoring data model (metrics, MTS, datapoints, dimensions vs properties), rollups and analytic functions, charts and dashboards, detectors and alerting, and troubleshooting Kubernetes with the Navigator and Cluster Analyzer."
type: "cert-tracker"
layout: "single"
exam_code: "SPLUNK-O11Y-CLOUD-METRICS-USER"
exam_title: "Splunk O11y Cloud Certified Metrics User"
exam_level: "entry"
exam_status: "active"
exam_category: "Splunk"
vendor: "splunk"
manual: false
guided_slug: "splunk-o11y-cloud-metrics-user"
---
## About the Splunk O11y Cloud Certified Metrics User Exam

> Master the Splunk O11y Cloud Certified Metrics User exam (SPLK-4001) — getting metrics in with the OpenTelemetry Collector, the Splunk Infrastructure Monitoring data model (metrics, MTS, datapoints, dimensions vs properties), rollups and analytic functions, building charts and dashboards, alerting with detectors, and troubleshooting Kubernetes with the Navigator and Cluster Analyzer in Splunk Observability Cloud.

The complete practice exam for the Splunk O11y Cloud Certified Metrics User certification (SPLK-4001). Covers getting metrics in with the Splunk Distribution of the OpenTelemetry Collector (agent vs gateway mode, the receivers / processors / exporters / pipelines model, and troubleshooting), the Infrastructure Monitoring data model (metrics, metric time series (MTS), datapoints, dimensions vs properties vs tags, and the metric types and their default rollups — gauge to average, counter to sum, cumulative counter to delta), monitoring with built-in content (navigators, the Kubernetes Navigator and Cluster Analyzer, and subscribing to alerts), visualizing metrics (searching metrics, charts and dashboards and dashboard groups, chart types, and applying rollups and analytic functions), alerting with detectors (from a chart, standalone, cloning, muting rules, and the condition types and severities), building efficient dashboards and alerts (single-instance dashboards, events, data links, and late datapoints and extrapolation), finding insights using analytics (totals across sources, combining plots, percentages and ratios, moving vs calendar windows, and timeshift comparisons), and detectors for common use cases (populations, non-flapping detectors, cyclic metrics, large populations, and ephemeral infrastructure) — every question a real-world scenario with full explanations, hints, exam tips, and why-wrong rationales.

## Who Should Take This Exam?

The Splunk O11y Cloud Certified Metrics User certification is designed for **SREs, DevOps engineers, platform and infrastructure-monitoring engineers, and on-call responders** who use **Splunk Observability Cloud (Splunk Infrastructure Monitoring)** to instrument, visualize, analyze, and alert on metrics. It is the entry-level Observability Cloud credential and validates the fundamentals every metrics user needs: getting data in with the OpenTelemetry Collector, reasoning about the Infrastructure Monitoring data model (metrics, MTS, dimensions vs properties), choosing the right rollup and analytic function, building charts and dashboards, and designing detectors that alert on real problems without flapping. It is distinct from the SPL-based Splunk Core and Enterprise credentials — this exam is about **observability metrics**, not log search.

**Prerequisites:** None required (the free Splunk Infrastructure Monitoring / Observability Cloud metrics learning path is recommended first)

**Typical study time:** 2-4 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam** | Splunk O11y Cloud Certified Metrics User |
| **Exam Code** | SPLK-4001 |
| **Duration** | 60 minutes |
| **Questions** | 54 |
| **Pass Score** | Pass / fail (Splunk does not publish an exact numeric cut score) |
| **Cost** | $130 USD |
| **Provider** | Splunk (Pearson VUE) |
| **Prerequisites** | None required |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Splunk →](https://www.splunk.com/en_us/training/certification-track/splunk-o11y-cloud-certified-metrics-user.html) |

## Exam Domains & Weights

The Splunk O11y Cloud Certified Metrics User exam covers **8 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Metrics Concepts (Infrastructure Monitoring data model) | 15% | 38 |
| Introduction to Visualizing Metrics | 15% | 38 |
| Finding Insights Using Analytics | 15% | 37 |
| Detectors for Common Use Cases | 15% | 37 |
| Get Metrics In with OpenTelemetry | 10% | 25 |
| Monitor Using Built-in Content | 10% | 25 |
| Introduction to Alerting on Metrics with Detectors | 10% | 25 |
| Create Efficient Dashboards and Alerts | 10% | 25 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** The four 15% domains carry the exam. In **Metrics Concepts**, nail the difference between a **dimension** (part of the metric time series identity, immutable, a new value creates a new MTS) and a **property** (post-ingest metadata, mutable, does not create a new MTS), and memorize the default rollups — **gauge to average, counter to sum, cumulative counter to delta**. In **Visualizing Metrics** and **Finding Insights Using Analytics**, know when a value is a **rollup** versus an **analytic function**, and how moving windows, calendar windows, and timeshift differ. For both detector domains, match the **condition type** to the metric behavior — Historical Anomaly or timeshift for cyclic metrics, Outlier or Population Comparison across a fleet, and duration or percent-of-duration conditions to stop flapping.

## Practice Exam — 250 Questions

Prepare for the Splunk O11y Cloud Certified Metrics User (SPLK-4001) with our **250-question practice exam** covering all 8 exam domains. Every question is a real-world scenario with detailed explanations and maps to the official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Splunk Observability Certification Path

The **Splunk O11y Cloud Certified Metrics User** is the entry point into Splunk's Observability Cloud track. It focuses on **metrics** in Splunk Infrastructure Monitoring — getting data in, the data model, visualization, analytics, and detectors. From here you can branch into the broader Splunk Observability Cloud suite (APM traces, RUM, Log Observer, Synthetics, and On-Call) and the deeper administration and engineering credentials. Note this track is separate from the SPL-based **Splunk Core Certified User / Power User** and **Splunk Enterprise Certified Admin** log-search credentials.

## Study Tips

1. **Start with Metrics Concepts** — the data model (metric vs MTS vs datapoint, dimension vs property, metric types and default rollups) underpins every other domain
2. **Get hands-on in Splunk Observability Cloud** — a free trial plus the Splunk Distribution of the OpenTelemetry Collector is the fastest way to internalise charts, rollups, analytics, and detectors
3. **Use our practice exam** — try the 20 free questions first to gauge your readiness
4. **Master detectors** — half the weight is on alerting; know the condition types, muting vs disabling, and how to avoid flapping on cyclic and ephemeral infrastructure
5. **Check the official page** — [official exam details](https://www.splunk.com/en_us/training/certification-track/splunk-o11y-cloud-certified-metrics-user.html) always have the latest objectives
