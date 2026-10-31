---
title: "Guided Blockchain Study Practice for the BCP Exam"
description: "Prepare for the BCP exam with independent blockchain study practice covering Besu networks, storage, cryptography, permissioning, execution and monitoring."
date: 2026-11-01T09:08:11+13:00
type: "cert-tracker"
layout: "single"
exam_code: "BCP"
exam_title: "Besu Certified Professional"
exam_level: "beginner"
exam_status: "active"
exam_category: "Linux Foundation"
vendor: "linuxfoundation"
manual: true
guided_slug: "bcp"
---

## About the BCP Exam

The **Besu Certified Professional (BCP)** exam from **The Linux Foundation** covers blockchain fundamentals and the design and operation of public and private networks using the Besu Ethereum client. Its public blueprint spans seven domains, from genesis configuration and peer discovery to transaction execution and node monitoring.

> **Before buying:** Guided Blockchain Study Practice is independent, unaffiliated preparation based on the public blueprint and public technical documentation. It contains original learning questions, not official or recalled exam items. It is not endorsed by The Linux Foundation or the Besu project. Practice access does not include an exam voucher or certification.

> **Version scope:** The current public blueprint still names on-chain permissioning and blockchain privacy. The maintainers announced the deprecation and removal of Tessera privacy, smart-contract-based permissioning, proof-of-work support and Fast-Sync in [Sunsetting Tessera and Simplifying Besu](https://www.lfdecentralizedtrust.org/blog/sunsetting-tessera-and-simplifying-hyperledger-besu). Historical questions are explicitly scoped; they are not instructions to enable those features in current Besu. Local node/account permissioning remains documented, and Paladin is a separate privacy layer. The official exam page does not publish a tested Besu software version.

## Who Should Take This Exam?

BCP suits developers, node operators and platform engineers who need to understand Ethereum-compatible blockchain networks. You should be comfortable reasoning about peers, transactions, signing keys, state storage and operational monitoring.

The official page lists no exam prerequisites. Working through a small private network is useful preparation, but buying this practice product does not register you for the official exam.

## Exam Quick Facts

| Detail | Current public information |
|--------|----------------------------|
| **Exam code** | BCP |
| **Credential** | Besu Certified Professional |
| **Duration** | 90 minutes |
| **Official question count** | Not published on the official BCP page or multiple-choice FAQ |
| **Pass score** | 75%, under the Linux Foundation multiple-choice exam FAQ |
| **Question type** | Multiple choice |
| **Delivery** | Online, remotely proctored |
| **Exam fee** | US$250; confirm current pricing on the official page |
| **Eligibility period** | 12 months from purchase |
| **Retake** | One retake under the current programme terms |
| **Validity** | 2 years |
| **Prerequisites** | None listed for this exam; programme eligibility requirements still apply |
| **Tested software version** | Not published on the official BCP page |
| **Official page** | [Linux Foundation BCP certification](https://training.linuxfoundation.org/certification/besu-certified-professional/) |

Check the [multiple-choice certification FAQ](https://docs.linuxfoundation.org/tc-docs/certification/faq-mc) and the current official page before scheduling. This guide uses the credential name on the bookable exam page; the certification agreement currently lists a different expansion of BCP.

## Exam Domains and Practice Coverage

The question allocation follows the published weights exactly.

| Official domain | Weight | Practice questions |
|-----------------|--------|--------------------|
| Besu Core Concepts | 24% | 60 |
| Networking | 26% | 65 |
| Transactions and Storage | 14% | 35 |
| Cryptography | 10% | 25 |
| Permissioning and Privacy | 10% | 25 |
| Execution Engine and Consensus | 8% | 20 |
| Monitoring | 8% | 20 |
| **Total** | **100%** | **250** |

### Besu Core Concepts

Study block propagation, genesis configuration, gas, logs and events, chain IDs, Ethereum addresses and public keys. Separate hashing, encryption and signing, and understand the trade-offs between decentralization, security and throughput.

### Networking

Distinguish RPC and validator roles, peer discovery and synchronization. Understand how a new node joins a network, how private-network consensus differs from public Ethereum, and what a gas-free private network does and does not change.

### Transactions and Storage

Trace how transactions update account and contract state. Distinguish the blockchain history from current world state, Merkle-based commitments from their underlying data, and token standards from the native currency.

### Cryptography

Understand transaction signing, key custody, structured-data signing and elliptic-curve cryptography. A valid signature proves authorization by the key holder; it does not encrypt transaction contents or prove that a transaction will execute successfully.

### Permissioning and Privacy

Separate admission controls from confidentiality. [Local permissioning](https://docs.besu-eth.org/private-networks/concepts/permissioning) restricts nodes or accounts on the nodes enforcing those rules; it does not make all ledger data private. Study legacy on-chain permissioning only in its stated historical context. [Paladin privacy](https://docs.besu-eth.org/private-networks/concepts/privacy-with-paladin) is a separate layer, not a renamed built-in Tessera implementation.

### Execution Engine and Consensus

Follow transaction-pool admission, ordering, EVM execution and block validation. Distinguish public Ethereum execution-client duties from consensus-client duties, and study private-network consensus in the specific protocol named by the scenario.

### Monitoring

Learn how logs, metrics and dashboards reveal peer, synchronization and execution problems. Separate high availability for RPC access from consensus fault tolerance, and understand the operational role of plugins.

## Practice Exam: 250 Original Questions

The bank contains **250 original single-answer learning questions** across the seven domains. Each includes an explanation, feedback for every distractor, a hint, an exam tip, practical context and an official documentation link.

The first **20 questions are free**. Full practice access is **US$9 for one year**. The practice count is our learning allocation, not a claim about the number of questions in the official exam.

## A Practical Study Path

1. Read the [official blueprint](https://training.linuxfoundation.org/certification/besu-certified-professional/) and identify the role of each domain.
2. Use the [Besu documentation](https://docs.besu-eth.org/) alongside a small private test network. Keep the release and network type explicit.
3. Trace a signed transaction from submission through pool admission, execution and inclusion in a block.
4. Compare [full and snap synchronization](https://docs.besu-eth.org/public-networks/concepts/node-sync), including their storage and node-role assumptions.
5. Test node/account permissioning separately from privacy. Read historical features against their archived version rather than current deployment instructions.
6. Diagnose deliberately introduced peer, synchronization and RPC failures using logs and metrics.

## Study Tips

1. **Name the network and version first.** A public Ethereum execution client and a private-network validator have different responsibilities.
2. **Do not confuse signing with secrecy.** Transaction authorization and data confidentiality are separate properties.
3. **Keep synchronization modes distinct.** Full-Sync and the removed Fast-Sync are not the same mode.
4. **Treat legacy features as legacy.** The blueprint's wording does not establish current feature support.
5. **Do not skip the smaller domains.** Execution/consensus and monitoring each carry 8%; neither is optional.
