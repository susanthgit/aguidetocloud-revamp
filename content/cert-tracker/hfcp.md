---
title: "HFCP Hyperledger Fabric Certified Practitioner Study Guide"
description: "Prepare for the Linux Foundation HFCP with 250 original questions across blockchain fundamentals, Fabric networks, smart contracts and client applications."
date: 2026-10-31T20:00:00+13:00
type: "cert-tracker"
layout: "single"
exam_code: "HFCP"
exam_title: "Hyperledger Fabric Certified Practitioner"
exam_level: "intermediate"
exam_status: "active"
exam_category: "Linux Foundation"
vendor: "linuxfoundation"
manual: true
guided_slug: "hfcp"
---

## About the HFCP Exam

The **Hyperledger Fabric Certified Practitioner (HFCP)** validates practical knowledge of Hyperledger Fabric v2.5. It covers the permissioned blockchain model, network design and operation, smart-contract lifecycle and ledger access, and client applications built with the Fabric Gateway.

The official blueprint has four domains. **Hyperledger Fabric Networks** is the largest at 36%. **Smart Contracts** and **Client Applications** each carry 24%, while **Fundamentals of Blockchain** carries 16%.

> **Before buying:** This is independent practice based on the public Linux Foundation blueprint and official Hyperledger Fabric documentation. It contains original teaching questions, not official or recalled exam items. The Linux Foundation does not publish the real exam's question count on the HFCP page or multiple-choice FAQ, so this guide does not invent one. Practice access does not include an exam voucher.

## Who Should Take This Exam?

HFCP suits developers, platform engineers, solution architects and administrators who need to understand how a Fabric network processes transactions from proposal through endorsement, ordering, validation and commit.

The official page lists no prerequisite. Hands-on familiarity with certificates, containers, distributed systems and a programming language supported by Fabric will make the material easier.

## Exam Quick Facts

| Detail | Current public information |
|--------|----------------------------|
| **Exam code** | HFCP |
| **Credential** | Hyperledger Fabric Certified Practitioner |
| **Fabric version** | Hyperledger Fabric v2.5 |
| **Duration** | 90 minutes |
| **Official question count** | Not published on the official HFCP page or Linux Foundation multiple-choice FAQ |
| **Pass score** | 75% |
| **Question type** | Multiple choice |
| **Delivery** | Online, remotely proctored |
| **Exam fee** | US$250 |
| **Eligibility period** | 12 months from purchase |
| **Retake** | One retake under the current programme terms |
| **Validity** | 2 years |
| **Prerequisites** | None |
| **Official page** | [Linux Foundation HFCP certification](https://training.linuxfoundation.org/certification/hyperledger-fabric-certified-practitioner-hfcp/) |

Confirm current booking and programme requirements in the [Linux Foundation multiple-choice certification FAQ](https://docs.linuxfoundation.org/tc-docs/certification/faq-mc) before scheduling.

## Exam Domains and Practice Coverage

This practice bank follows the official weights exactly.

| Official domain | Weight | Practice questions |
|-----------------|--------|--------------------|
| Fundamentals of Blockchain | 16% | 40 |
| Hyperledger Fabric Networks | 36% | 90 |
| Smart Contracts | 24% | 60 |
| Client Applications | 24% | 60 |
| **Total** | **100%** | **250** |

### Fundamentals of Blockchain

Understand distributed ledgers, smart contracts, consensus, the Hyperledger Fabric model and the business reasons for using a permissioned network. Be clear about deterministic finality, identities and policies, ledger replication, world state and immutable transaction history.

### Hyperledger Fabric Networks

Trace the execute-order-validate transaction flow and know the responsibilities of peers, orderers, membership service providers and channels. Study Raft quorum and operations, gossip, channel configuration updates, policies, snapshots, state databases, production topology, certificate rotation and network maintenance.

### Smart Contracts

Know how contracts are packaged as chaincode, installed, approved and committed through the Fabric v2 lifecycle. Practise ledger reads and writes, MVCC validation, range and rich queries, private-data collections, transient input, collection policies, retention and state-based endorsement.

### Client Applications

Understand the Fabric Gateway model and the peer Gateway service. Distinguish evaluate from submit, follow proposal, endorsement, transaction and commit-status operations, handle offline signing, and process chaincode, block and private-data events with durable checkpointing.

## Practice Exam: 250 Original Questions

The HFCP bank contains **250 original single-answer questions**. Each question includes a detailed explanation, specific feedback for every distractor, a hint, an exam tip, a practical application and a link to the relevant official documentation.

The first **20 questions are free** without an account. Full practice access is **US$9 for one year**.

The scenarios test operational decisions rather than isolated definitions. They include endorsement and validation failures, Raft quorum changes, MSP and TLS updates, CouchDB query behaviour, chaincode lifecycle approvals, private-data recovery, Gateway submission and commit status, event replay and offline signing.

## A Practical Study Path

1. Read the [Hyperledger Fabric introduction](https://hyperledger-fabric.readthedocs.io/en/release-2.5/whatis.html) and explain why Fabric is permissioned and modular.
2. Trace the [transaction flow](https://hyperledger-fabric.readthedocs.io/en/release-2.5/txflow.html) from proposal to commit until you can name which component performs each step.
3. Build a small test network and inspect channel configuration, peer ledgers, orderer logs and commit status.
4. Deploy and upgrade chaincode through the v2 lifecycle. Deliberately create an approval or endorsement mismatch and diagnose it.
5. Add a private-data collection and verify what members, non-members and orderers can observe.
6. Use a Fabric Gateway client to evaluate, submit, wait for commit status and consume events with a checkpoint.

## Study Tips

1. **Keep the transaction stages separate.** Endorsement simulation, ordering, validation and commit are distinct controls.
2. **Do not turn Raft into BFT.** Fabric v2.5 Raft is crash-fault tolerant and requires a majority quorum.
3. **Separate blockchain history from world state.** Invalid transactions remain in blocks but do not update current state.
4. **Treat private data and its hash differently.** Raw private values bypass the ordering service; their hashes are committed to the channel ledger.
5. **Know the Gateway object boundaries.** Proposal, transaction, commit status and event operations have different responsibilities.
6. **Use version-pinned documentation.** Study the [Fabric v2.5 documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.5/) rather than assuming behaviour from a newer release.
