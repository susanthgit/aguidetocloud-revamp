---
title: "MCPA: Model Context Protocol Associate Study Guide"
description: "Prepare for Linux Foundation MCPA: five domains, MCP architecture, execution and security. Try 20 questions free; full 250-question bank US$9."
type: "cert-tracker"
layout: "single"
exam_code: "MCPA"
exam_title: "Linux Foundation Model Context Protocol Associate"
exam_level: "intermediate"
exam_status: "active"
exam_category: "Linux Foundation"
vendor: "cncf"
manual: true
guided_slug: "cncf-mcpa"
lastmod: "2026-10-31"
images: ["/images/og/certs/cncf-mcpa.jpg"]
---

## About the MCPA Exam

> Understand how AI applications connect to tools and data, and where responsibility stays with the application.

The **Model Context Protocol Associate (MCPA)** is a Linux Foundation Education certification. It tests MCP fundamentals, architecture, interactions, security and operational use cases. MCP is a project of the **Agentic AI Foundation (AAIF)**. It is not a CNCF project; this site groups the credential under its existing CNCF / Linux Foundation catalogue.

Think of MCP as a common connection interface. It describes how an application discovers and uses external capabilities. It does not train the model, guarantee that a model will choose the right tool, or replace permissions on the underlying data.

The [official MCPA exam page](https://training.linuxfoundation.org/certification/model-context-protocol-associate-mcpa/) recommends the **2026-07-28 MCP release** when preparing. That release is an important distinction: older tutorials can describe different lifecycle and message patterns. Read versioned documentation rather than assuming that a remembered handshake still applies.

Our material is independent and original. It is not endorsed by The Linux Foundation or AAIF, and it does not contain official exam questions or exam dumps.

## Who Should Take This Exam?

MCPA suits developers, platform engineers and practitioners who need to reason about AI tool integrations, including their security and governance. There are **no formal prerequisites**. Familiarity with JSON-RPC, LLM APIs, basic OAuth concepts and capability definitions is recommended.

You do not need to memorise a particular vendor's assistant interface. You do need to distinguish protocol behaviour from the decisions an application makes around it.

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | MCPA |
| **Issuer** | Linux Foundation Education |
| **Duration** | 90 minutes |
| **Question Types** | Online, proctored multiple-choice |
| **Cost** | US$250, exam only |
| **Provider** | Linux Foundation / PSI |
| **Validity** | 2 years |
| **Eligibility** | 12 months after purchase; one retake included |
| **Prerequisites** | None required |
| **Preparation Reference** | MCP 2026-07-28, recommended on the official exam page |

The MCPA page does not publish a real-exam question count or MCPA-specific passing score. Our **250** is the size of this practice bank, not a claim about the real exam.

## Exam Domains & Weights

The following five domains and weights come from the official exam page. Practice-question counts are our allocation.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| MCP Fundamentals | 16% | 40 |
| Architecture & Components | 14% | 35 |
| Interactions & Execution | 26% | 65 |
| Security & Governance | 24% | 60 |
| Use Cases & Ecosystem | 20% | 50 |
| **Total** | **100%** | **250** |

**MCP Fundamentals:** Learn what MCP standardises and what it leaves to the host. Resources provide context, prompts provide reusable message templates, and tools expose operations. A common protocol makes integrations more portable; it does not make their data quality, business rules or permissions identical.

**Architecture & Components:** A host coordinates the application and its client instances. Each client communicates with one server. Servers expose focused capabilities rather than receiving unrestricted access to every conversation or other server. Be able to interpret JSON-RPC envelopes and structured schemas, and explain why local stdio and remote HTTP have different operational considerations.

**Interactions & Execution:** Follow a request through its response. Distinguish a protocol error from a tool execution failure, and examine the response rather than treating successful transport as successful work. The July 2026 specification uses self-contained requests, per-request protocol metadata and capabilities, and multi round-trip requests when additional client input is required. Study tools, resources, prompts, subscriptions, cancellation and progress in the [versioned specification](https://modelcontextprotocol.io/specification/2026-07-28).

**Security & Governance:** Draw the trust boundaries before choosing a control. Authentication, authorization, user consent and business approval answer different questions. Treat content from a server as data, not automatically as instructions. Review token handling, resource access, local executable permissions, audit evidence and privacy. An annotation or a list of roots is not proof that the underlying operation has been securely sandboxed.

**Use Cases & Ecosystem:** Practise choosing an integration for a concrete need: knowledge retrieval, analysis, support or development. Identify who owns the host, server and underlying service. Test capability compatibility and failures, not just whether a server appears in a list. Optional extensions require support; they are not features every MCP implementation must provide.

## Practice Exam — 250 Questions

The bank contains **250 original single-answer practice questions** across all five domains. Linux Foundation describes the real exam as multiple-choice; we do not claim that our item composition is identical to the real exam.

You can try **20 questions free**, without an account. Full practice access is **US$9 for one year**.

Each question includes a scenario, explanation, separate wrong-choice rationales, a hint, learning tips and a link to official documentation. Use study mode to understand the mechanism, then timed mode to practise making decisions without checking the explanation first.

[Start the MCPA practice exam](/guided/cncf-mcpa/practice/)

## Linux Foundation Certification Path

MCPA is a standalone associate credential; a Kubernetes certification is not a prerequisite. Start with MCP's purpose and component roles, then work through interactions, security and realistic integration decisions. The [official MCP documentation](https://modelcontextprotocol.io/specification/2026-07-28) is the reference for protocol details.

## Related Certifications

These cover adjacent skills, not prerequisites or higher levels of MCPA:

- [GitHub Copilot certification study guide](/cert-tracker/gh-300/) — using an assistant in development workflows.
- [OpenTelemetry Certified Associate study guide](/cert-tracker/cncf-otca/) — understanding telemetry and observability.

## Study Tips

1. **Label the protocol version.** Separate July 2026 requirements from older lifecycle examples. A tutorial's age matters when messages or capabilities have changed.
2. **Trace the responsibility.** For each scenario, identify the host, client, server and underlying service before choosing a control or diagnosing a failure.
3. **Read the failure boundary.** Distinguish transport, protocol, tool, permission and application failures. Similar-looking symptoms can require different fixes.
4. **Review the wrong choices.** Explain why a plausible alternative fails under the stated constraints, then try the 20-question preview before timed practice.
