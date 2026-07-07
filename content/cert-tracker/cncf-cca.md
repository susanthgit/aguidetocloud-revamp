---
title: "CCA: Certified Cilium Associate exam — Free Study Guide"
description: "CCA: the CNCF Certified Cilium Associate exam. 250-question practice exam (20 free) plus a complete study guide covering Cilium's eBPF architecture, identity-based network policy, the sidecarless service mesh, Hubble observability, installation, Cluster Mesh, eBPF, and BGP, with exam tips."
type: "cert-tracker"
layout: "single"
exam_code: "CCA"
exam_title: "CNCF CCA (Certified Cilium Associate)"
exam_level: "associate"
exam_status: "active"
exam_category: "CNCF"
vendor: "cncf"
manual: false
guided_slug: "cncf-cca"
---
## About the CCA Exam

> Prove you can run Kubernetes networking, security, and observability with Cilium

Master Cilium end to end — the eBPF-powered architecture (the cilium-agent, Cilium Operator, and CLI component model, IPAM modes, and tunnel-versus-native-routing datapaths), identity-based network policy (CiliumNetworkPolicy and CiliumClusterwideNetworkPolicy versus standard Kubernetes NetworkPolicy, plus L3/L4/L7 and DNS/FQDN rules), the sidecarless service mesh (Ingress, Gateway API, and transparent WireGuard/IPsec encryption), Hubble network observability, installing and configuring Cilium with the Cilium CLI, Cluster Mesh for multi-cluster connectivity, eBPF versus iptables, and BGP and external networking. Original practice questions covering all 8 official CCA domains. Not affiliated with, endorsed by, or sourced from CNCF or Linux Foundation certification exams.

## Who Should Take This Exam?

The CCA is designed for **platform engineers, network engineers, DevOps engineers, and SREs** who run Kubernetes clusters with Cilium as the CNI for networking, security, and observability. There are no formal prerequisites; a working familiarity with Kubernetes networking, YAML, and the Linux/eBPF datapath is helpful but not required. The exam is multiple-choice and focuses on how Cilium works — its eBPF architecture, identity-based policy, service mesh, Hubble observability, Cluster Mesh, and BGP.

**Typical study time:** 2-4 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | CCA |
| **Title** | CNCF CCA (Certified Cilium Associate) |
| **Duration** | 90 minutes |
| **Questions** | 60 |
| **Pass Score** | 75% |
| **Cost** | $250 USD |
| **Provider** | Linux Foundation / PSI |
| **Validity** | 2 years |
| **Question Types** | Multiple choice |

## Exam Domains & Weights

The CCA exam covers **8 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Architecture | 20% | 48 |
| Network Policy | 18% | 43 |
| Service Mesh | 16% | 38 |
| Network Observability | 10% | 24 |
| Installation and Configuration | 10% | 24 |
| Cluster Mesh | 10% | 24 |
| eBPF | 10% | 25 |
| BGP and External Networking | 6% | 24 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Architecture** (20%) and **Network Policy** (18%) are the two heaviest domains — know the eBPF datapath and Cilium's component roles, the IPAM modes, and how Cilium's identity-based CiliumNetworkPolicy differs from a standard Kubernetes NetworkPolicy (L7, DNS/FQDN, entities, cluster-wide, and deny rules). Then make sure you can explain the **Service Mesh** domain (16%) — Ingress versus Gateway API, and sidecar versus sidecarless — and read a Hubble flow in the **Network Observability** domain.

## Practice Exam — 250 Questions

Prepare for the CCA with our **250-question practice exam** covering all 8 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## CNCF Certification Path

Start with KCNA (Kubernetes and Cloud Native Associate) for cloud native fundamentals. The CCA (Cilium) certifies your ability to run Kubernetes networking, security, and observability with eBPF, and pairs naturally with the Kubernetes track — CKA (administrator), CKAD (developer), and KCSA/CKS (security) — as well as PCA (Prometheus) for metrics and CGOA/CAPA for GitOps continuous delivery.

## Related CNCF Certifications

If you're studying for the CCA, you might also be interested in these CNCF certifications:

- **[KCNA: CNCF Kubernetes and Cloud Native Associate](/cert-tracker/cncf-kcna/)** — 250 practice questions
- **[CKS: CNCF Certified Kubernetes Security Specialist](/cert-tracker/cncf-cks/)** — 250 practice questions
- **[PCA: CNCF Prometheus Certified Associate](/cert-tracker/cncf-pca/)** — 250 practice questions
- **[CAPA: CNCF Certified Argo Project Associate](/cert-tracker/cncf-capa/)** — 250 practice questions

## Study Tips

1. **Master the eBPF datapath and policy model** — Architecture (20%) and Network Policy (18%) are the two biggest domains; know how Cilium uses eBPF instead of iptables and how identity-based CiliumNetworkPolicy compares to Kubernetes NetworkPolicy
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
