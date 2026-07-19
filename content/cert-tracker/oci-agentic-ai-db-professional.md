---
title: "Agentic AI for Oracle AI Database Professional (1Z0-1159-26) — Study Guide & Practice Exam"
description: "Agentic AI for Oracle AI Database Professional (1Z0-1159-26) study guide and 250-question practice exam. The six exam domains — Oracle AI Vector Search Foundations; Vector Distance and Indexing; Retrieval-Augmented Generation (RAG); Select AI Agent Solutions; Agentic Interfaces and Tool Access (MCP); and Private Agent Factory Governance — plus exam objectives, study resources, and a timed exam simulation. Free 20-question preview."
type: "cert-tracker"
layout: "single"
exam_code: "OCI-AGENTIC-AI-DB-PROFESSIONAL"
exam_title: "Agentic AI for Oracle AI Database Professional"
exam_level: "professional"
exam_status: "active"
exam_category: "Oracle"
vendor: "oracle"
manual: false
guided_slug: "oci-agentic-ai-db-professional"
---
## About the OCI-AGENTIC-AI-DB-PROFESSIONAL Exam

> Master the Agentic AI for Oracle AI Database Professional exam (1Z0-1159-26) — building AI agents, retrieval-augmented generation, and semantic search INSIDE Oracle Database 23ai and Autonomous AI Database. It covers the VECTOR data type and in-database embeddings (the VECTOR_EMBEDDING operator and imported ONNX models), the VECTOR_DISTANCE metrics with HNSW and IVF vector indexes, RAG pipelines built with the DBMS_VECTOR_CHAIN utilities, Select AI Agents defined with the DBMS_CLOUD_AI_AGENT package, the Autonomous Database MCP Server, and Private Agent Factory governance.

The complete practice exam for the Agentic AI for Oracle AI Database Professional certification (exam 1Z0-1159-26, validated against Oracle Cloud Infrastructure 2026). It covers Oracle AI Vector Search Foundations (the VECTOR data type with FLOAT32, FLOAT64, INT8 and BINARY formats, in-database embeddings with the VECTOR_EMBEDDING operator and DBMS_VECTOR.UTL_TO_EMBEDDING, importing ONNX models with DBMS_VECTOR.LOAD_ONNX_MODEL, and calling external embedding providers), Applying Vector Distance and Indexing (the VECTOR_DISTANCE function with COSINE, DOT, EUCLIDEAN, MANHATTAN, HAMMING and JACCARD metrics and the shorthand distance functions, HNSW in-memory neighbor-graph indexes and IVF neighbor-partition indexes, exact versus approximate ANN search with FETCH APPROX and TARGET ACCURACY, and multi-vector PARTITIONS BY search on IVF), Building Retrieval-Augmented Generation Solutions (the in-database RAG pipeline, the DBMS_VECTOR_CHAIN utilities UTL_TO_TEXT, UTL_TO_CHUNKS, UTL_TO_EMBEDDINGS, UTL_TO_GENERATE_TEXT and UTL_TO_RERANK, chunking strategies, and Select AI RAG with the narrate action and a vector_index profile), Designing Select AI Agent Solutions (DBMS_CLOUD_AI.CREATE_PROFILE, the SELECT AI runsql, showsql, narrate, explainsql and chat actions, and Select AI Agents built with the DBMS_CLOUD_AI_AGENT package — CREATE_AGENT, CREATE_TASK and CREATE_TOOL, and the built-in SQL, RAG, WEBSEARCH and NOTIFICATION tool types), Configuring Agentic Interfaces and Tool Access (the Autonomous Database MCP Server over streamable HTTPS, enabling it with the adb$feature tag, connecting MCP clients such as Claude Desktop, tool access with Virtual Private Database and MCP_SERVER_CONTEXT$, and the SQLcl, OCI-Managed and ORDS MCP server options), and Governing Private Agent Factory Deployments (the Oracle Private Agent Factory components, private deployment for data sovereignty, role-based access control, audit trails, versioning, and the agent governance lifecycle) — every question a real-world Oracle AI Database scenario with full explanations.

## Who Should Take This Exam?

The Agentic AI for Oracle AI Database Professional (1Z0-1159-26) is designed for **AI engineers, GenAI application developers, machine-learning engineers, and data scientists** who build agentic-AI, RAG, and vector-search applications directly inside the Oracle AI Database — generating and storing embeddings, running vector similarity search, composing RAG pipelines, designing Select AI agents, and wiring AI agents to the database through the MCP server. It validates professional-level, implementation-focused skills, so **hands-on experience with Oracle Database 23ai or Autonomous AI Database and the DBMS_VECTOR, DBMS_VECTOR_CHAIN, and DBMS_CLOUD_AI packages is strongly recommended**, along with foundational Python and AI/ML knowledge. It pairs naturally with the Oracle Autonomous AI Database Professional certification.

**Prerequisites:** None required (Oracle recommends foundational Python and AI/ML knowledge plus hands-on Oracle Database 23ai / Autonomous AI Database experience)

**Typical study time:** 5-8 weeks of focused study

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| **Exam Code** | OCI-AGENTIC-AI-DB-PROFESSIONAL |
| **Title** | Agentic AI for Oracle AI Database Professional |
| **Duration** | 90 minutes |
| **Questions** | 50 |
| **Pass Score** | 68% (verify at Oracle registration) |
| **Cost** | $245 USD |
| **Provider** | Oracle University (Oracle MyLearn / Pearson VUE, online proctored or test center) |
| **Validity** | Subject to the Oracle Cloud Recertification policy |
| **Prerequisites** | None required (Python and AI/ML knowledge recommended) |
| **Question Types** | Multiple choice |
| **Official Page** | [View on Oracle →](https://education.oracle.com/agentic-ai-for-oracle-ai-database-professional/pexam_1Z0-1159-26) |

## Exam Domains & Weights

The OCI-AGENTIC-AI-DB-PROFESSIONAL exam covers **6 domains**. Focus your study time based on the weights below — higher-weighted domains have more exam questions.

| Domain | Weight | Practice Qs |
|--------|--------|-------------|
| Explain Oracle AI Vector Search Foundations | 8% | 24 |
| Apply Vector Distance and Indexing | 32% | 72 |
| Build Retrieval-Augmented Generation (RAG) Solutions | 24% | 60 |
| Design Select AI Agent Solutions | 16% | 40 |
| Configure Agentic Interfaces and Tool Access | 12% | 30 |
| Govern Private Agent Factory Deployments | 8% | 24 |
| **Total** | **100%** | **250** |

> 💡 **Study tip:** **Vector Distance and Indexing** (32%) and **RAG** (24%) together are over half the exam — start there. Know that Oracle uses the `VECTOR_DISTANCE` function (not pgvector's `<=>` operators), that HNSW is an in-memory neighbor-graph index while IVF is a neighbor-partition index (and multi-vector `PARTITIONS BY` works only on IVF), and that RAG is composed from the `DBMS_VECTOR_CHAIN` utilities. For the agent domains, remember that Select AI Agents live in the dedicated `DBMS_CLOUD_AI_AGENT` package and the ADB MCP Server is a managed HTTPS endpoint — no Kafka or streaming middleware.

## Practice Exam — 250 Questions

Prepare for the OCI-AGENTIC-AI-DB-PROFESSIONAL with our **250-question practice exam** covering all 6 exam domains. Every question includes detailed explanations and maps to official exam objectives.

**What you get:**
- ✅ Exam simulation mode with timer
- ✅ Spaced repetition for weak areas
- ✅ Detailed explanations for every question
- ✅ Progress tracking across domains
- ✅ 20 free questions — no account needed

## Oracle Certification Path

Start with OCI Foundations, then Architect Associate, and advance to the Professional and specialty tracks — Architect, Developer, Security, Networking, Data Science, the Autonomous AI Database Professional, and this Agentic AI for Oracle AI Database Professional for AI engineers building in-database GenAI.

## Related Oracle Certifications

If you're studying for the OCI-AGENTIC-AI-DB-PROFESSIONAL, you might also be interested in these Oracle certifications:

- **[OCI-AUTONOMOUS-DB-PROFESSIONAL: Autonomous AI Database Professional](/cert-tracker/oci-autonomous-db-professional/)** — 250 practice questions
- **[OCI-AI-FOUNDATIONS: Cloud Infrastructure 2026 AI Foundations Associate](/cert-tracker/oci-ai-foundations/)** — 250 practice questions
- **[OCI-DATA-SCIENCE-PROFESSIONAL: Cloud Infrastructure 2026 Data Science Professional](/cert-tracker/oci-data-science-professional/)** — 250 practice questions

## Study Tips

1. **Start with the heaviest domains** — focus your time where the exam focuses its questions
2. **Use our practice exam** — try the 20 free questions first to gauge your readiness
3. **Review explanations** — don't just check if you got it right; read why each answer is correct
4. **Simulate exam conditions** — use the timed exam mode to practice under pressure
5. **Check the official page** — [official exam details](https://education.oracle.com/agentic-ai-for-oracle-ai-database-professional/pexam_1Z0-1159-26) always have the latest objectives
