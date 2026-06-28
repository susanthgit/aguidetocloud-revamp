---
title: "Databricks Certified Machine Learning Professional — Study Guide & Practice Exam"
description: "Databricks Certified Machine Learning Professional study guide and 250-question practice exam. Exam objectives, domains and weights, study resources, and exam simulation covering distributed model development with Spark ML, scaling and tuning with the pandas Function API, Optuna and Ray, advanced MLflow, the FeatureEngineering Client, MLOps with Databricks Asset Bundles, Lakehouse Monitoring, and model deployment on Databricks Model Serving."
type: "cert-tracker"
layout: "single"
exam_code: "DATABRICKS-ML-PROFESSIONAL"
exam_title: "Certified Machine Learning Professional"
exam_level: "professional"
exam_status: "active"
exam_category: "Databricks"
vendor: "databricks"
manual: false
guided_slug: "databricks-ml-professional"
---
## About the DATABRICKS-ML-PROFESSIONAL Exam

> Master the Databricks Certified Machine Learning Professional exam (30 September 2025 guide) — building enterprise-scale ML on the Databricks Data Intelligence Platform: distributed model development with Spark ML, scaling and distributed hyperparameter tuning with the pandas Function API, Optuna and Ray, advanced MLflow (nested runs, custom PyFunc models), the FeatureEngineering Client with online tables and feature serving, MLOps with Unity Catalog model aliases and Databricks Asset Bundles, drift detection with Lakehouse Monitoring, and model deployment on Databricks Model Serving.

The complete practice exam for the Databricks Certified Machine Learning Professional certification (current 30 September 2025 exam guide). Covers model development using Spark ML (choosing distributed Spark ML versus single-node models, constructing ML pipelines with estimators and transformers, tuning with MLlib CrossValidator and TrainValidationSplit, evaluating and scoring models for batch and streaming, scaling distributed training with the pandas Function API and UDFs, distributed hyperparameter tuning with Optuna integrated with MLflow and with Ray on Spark, model versus data parallelism, advanced MLflow usage with nested runs and programmatic custom metrics, parameters and artifacts, custom PyFunc model objects, and advanced Feature Store concepts including point-in-time correctness, the FeatureEngineering Client, online tables, streaming features and on-demand feature serving), MLOps (model lifecycle management with Unity Catalog registered models and aliases in the deploy-code strategy, unit and integration testing across dev, test and prod, scalable environment architectures, defining ML assets with Databricks Asset Bundles, automated retraining triggered by drift and performance degradation, and drift detection with Lakehouse Monitoring across snapshot, time series and inference profiles, custom metrics, alerting and endpoint health monitoring), and model deployment (comparing blue-green, canary and shadow strategies, model rollout with Databricks Model Serving served entities and traffic splitting, and custom model serving by registering PyFunc models and querying them via REST API and the MLflow Deployments SDK) — every question a real-world scenario with full explanations.

## Who Should Take This Exam?

The Databricks Certified Machine Learning Professional is designed for **experienced machine learning engineers and MLOps practitioners** who design, implement, and manage production ML systems on the Databricks Data Intelligence Platform. It validates advanced, enterprise-scale skills: distributed training and tuning with Spark ML, Optuna and Ray; advanced MLflow and the FeatureEngineering Client; MLOps with Databricks Asset Bundles, automated retraining and Lakehouse Monitoring; and safe model deployment with custom serving. All machine-learning code on the exam is in Python, and it assumes fluency with the modern Unity Catalog stack (model aliases, not legacy registry stages).

**Prerequisites:** None required (course attendance + ~1 year of hands-on Databricks ML experience strongly recommended)

**Typical study time:** 5-9 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | DATABRICKS-ML-PROFESSIONAL |
| **Title** | Certified Machine Learning Professional |
| **Duration** | 120 minutes |
| **Questions** | 59 |
| **Pass Score** | Not officially published (pass/fail) |
| **Cost** | $200 USD |
| **Provider** | Databricks (Kryterion Webassessor; online proctored) |
| **Validity** | 2 years |
| **Prerequisites** | None (related training + ~1 year hands-on Databricks ML experience recommended) |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Databricks →](https://www.databricks.com/learn/certification/machine-learning-professional) |

## Exam Domains & Weights

The DATABRICKS-ML-PROFESSIONAL exam covers **3 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Model Development Using Spark ML | 44% | 105 |
| MLOps | 44% | 105 |
| Model Deployment | 12% | 40 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Model Development (44%) and MLOps (44%) together are almost the entire exam. For Model Development, get fluent with Spark ML pipelines and choosing distributed Spark ML versus single-node models, scaling with the pandas Function API (`applyInPandas`), distributed hyperparameter tuning with **Optuna** (`MLflowCallback` + `MlflowSparkStudy`) and **Ray** (not the deprecated Hyperopt), nested MLflow runs, custom PyFunc models, and the **FeatureEngineering Client** with point-in-time lookups, online tables, and feature serving. For MLOps, master the deploy-code strategy with **Unity Catalog model aliases** (`@champion`/`@challenger`, not legacy Staging/Production stages), unit vs integration testing, **Databricks Asset Bundles** for defining ML assets, automated retraining, and **Lakehouse Monitoring** (snapshot vs time-series vs inference profiles, drift metrics, custom metrics, and endpoint health). Model Deployment (12%) is the smallest domain but tests blue-green vs canary vs shadow rollouts, safe traffic shifting on Databricks Model Serving, and registering and querying custom PyFunc models via the REST API and the MLflow Deployments SDK.

## Practice Exam — 250 Questions

Prepare for the DATABRICKS-ML-PROFESSIONAL with our **250-question practice exam** covering all 3 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Databricks Certification Path

Start with the Data Engineer Associate or the Machine Learning Associate, then advance to this Machine Learning Professional and the other Professional tracks (Data Engineer Professional, Generative AI Engineer) and specialty certifications.

## Study Tips

1. **Start with the heaviest domains** — Model Development and MLOps are 88% of the exam between them
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
5. **Check the official page** — [official exam details](https://www.databricks.com/learn/certification/machine-learning-professional) always have the latest objectives
