---
title: "SnowPro Specialty: Native Apps (NAS-C02) — Study Guide & Practice Exam"
description: "SnowPro Specialty: Native Apps study guide and 250-question practice exam. Snowflake SnowPro Specialty: Native Apps certification (NAS-C02) — exam objectives, domains and weights, and exam simulation covering designing, building, deploying, and managing Snowflake Native Applications with the Native App Framework: application packages, manifests, setup scripts, application logic, release channels, versions and patches, upgrades, Marketplace listings, and telemetry."
type: "cert-tracker"
layout: "single"
exam_code: "SNOWPRO-SPECIALTY-NATIVE-APPS"
exam_title: "SnowPro Specialty: Native Apps"
exam_level: "specialty"
exam_status: "active"
exam_category: "Snowflake"
vendor: "snowflake"
manual: false
guided_slug: "snowpro-specialty-native-apps"
---
## About the SnowPro Specialty: Native Apps Exam

> Master the Snowflake SnowPro Specialty: Native Apps certification (NAS-C02) — designing, building, deploying, and managing Snowflake Native Applications across their full lifecycle with the Native App Framework.

The complete practice exam for the Snowflake SnowPro Specialty: Native Apps certification (NAS-C02). This specialty exam validates how you build and ship production Snowflake Native Applications end to end. Covers **designing** Native Applications (the application package vs application object vs listing object model, application roles, the three provider/consumer data-access patterns — shared content granted TO SHARE IN APPLICATION PACKAGE, provider objects shared via REFERENCE_USAGE, and consumer objects bound through references — choosing a Native App vs a plain secure share, choosing a SQL/Snowpark app vs a Snowpark Container Services app, and least-privilege design), **building** Native Applications (the manifest.yml structure and every field, SQL-only setup scripts and their restrictions, versioned vs regular schemas, application logic with owner's-rights vs restricted-caller's-rights procedures, Streamlit in an app, the privilege/reference/app-specification workflows, manifest v1 manual vs v2 automatic grants, the reference and register-callback contract, the permission SDK, and the callback and readiness matrix), **deploying** Native Applications (development-mode installation, release channels QA/ALPHA/DEFAULT, versions and patches and release directives, publishing to Snowflake Marketplace, Cross-Cloud Auto-Fulfillment, free/limited-trial/paid listings and Custom Event Billing, and diagnosing installation failures), and **managing** Native Applications (release-management privileges like MANAGE RELEASES, version and patch and directive rules, upgrade commands and what persists across an upgrade, upgrade states and maintenance policies, monitoring and callback history, event tables and provider telemetry sharing, and deprecating, dropping, and uninstalling) — every question a real-world provider/developer scenario with full explanations.

## Who Should Take This Exam?

The SnowPro Specialty: Native Apps certification is designed for **Native App developers, provider data engineers, ISV solution engineers, and platform engineers** who build, package, and publish applications on the Snowflake AI Data Cloud and distribute them through Snowflake Marketplace. It validates hands-on skill with the Native App Framework across the full app lifecycle.

**Prerequisites:** None (SnowPro Core is recommended but not required). Snowflake recommends 1+ years of enterprise Snowflake experience plus 6+ months of hands-on Native App development.

**Typical study time:** 4-8 weeks of focused study (plus hands-on Native App Framework experience)

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | SnowPro Specialty: Native Apps (NAS-C02) |
| **Title** | SnowPro Specialty: Native Apps |
| **Duration** | 85 minutes |
| **Questions** | 55 |
| **Pass Score** | 750 / 1000 (scaled) |
| **Cost** | $225 USD |
| **Provider** | Snowflake (Pearson VUE / online proctored) |
| **Validity** | 2 years |
| **Prerequisites** | None (SnowPro Core recommended) |
| **Question Types** | Multiple choice, Multiple select |
| **Official Page** | [View on Snowflake →](https://learn.snowflake.com/en/certifications/snowpro-nativeapps-c02/) |

## Exam Domains & Weights

The SnowPro Specialty: Native Apps exam covers **4 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Build Snowflake Native Applications | 38% | 95 |
| Manage Snowflake Native Applications | 29% | 72 |
| Design Snowflake Native Applications | 22% | 55 |
| Deploy Snowflake Native Applications | 11% | 28 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** Build (38%) is the heaviest domain, so know the manifest.yml fields cold — manifest_version 1 (manual grants) vs 2 (automatic grants), the required `artifacts` block, references vs privileges, and which callbacks exist. Setup scripts are **SQL only** and cannot run `USE DATABASE`/`USE SCHEMA`/`USE ROLE`; stateless code lives in a **versioned schema** while state lives in a **regular schema**; and application logic runs owner's-rights by default, with **restricted** caller's rights (never unrestricted) as the alternative. Manage (29%) rewards the version/patch/upgrade model: a new version starts at immutable patch 0, there is no whole-upgrade transactional rollback, and telemetry is shared with `AUTHORIZE_TELEMETRY_EVENT_SHARING` (the shared-row marker is `snow.application.shared`, not `SHARED_CONTENT`). Design (22%) is about the object model — package vs object vs listing, application roles, and the three data-access patterns. Deploy (11%) is release channels (QA/ALPHA/DEFAULT), `REGISTER VERSION` then `MODIFY RELEASE CHANNEL ... ADD VERSION`, and Marketplace publishing.

## Practice Exam — 250 Questions

Prepare for the SnowPro Specialty: Native Apps with our **250-question practice exam** covering all 4 exam domains. Every question is a real-world provider/developer scenario with detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Snowflake Certification Path

Start with the **SnowPro Core Certification** (the broad, foundational credential), then add **SnowPro Advanced** role certifications (Architect, Data Engineer, Administrator, Data Analyst, Data Scientist) and **SnowPro Specialty** certifications — **Native Apps**, Gen AI, and Snowpark — which validate focused, hands-on expertise in a specific Snowflake capability. There is no hard prerequisite for the Native Apps specialty, though SnowPro Core is recommended.

## Study Tips

1. **Lead with Build and Manage** — together they are 67% of the exam; know manifest.yml, setup-script rules, versioned-vs-regular schemas, owner's-vs-restricted-caller rights, and the version/patch/upgrade model cold
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness for the specialty level
3. **Get hands-on in a trial account** — build a real application package, write a manifest and setup script, register a version to a release channel, install it in development mode, and run an upgrade
4. **Think in mechanisms** — the exam is about *which* Native App Framework object, privilege, command, or callback fits the requirement; read every explanation for the why
5. **Check the official page** — [official exam details](https://learn.snowflake.com/en/certifications/snowpro-nativeapps-c02/) always have the latest objectives
