---
title: "Independent Study Guide for RVFA"
description: "Study architecture, assembly, C calling conventions, firmware and operating systems for RVFA with original practice and clear technical explanations."
type: "cert-tracker"
layout: "single"
exam_code: "RVFA"
exam_title: "RISC-V Foundational Associate"
exam_level: "beginner"
exam_status: "active"
exam_category: "Linux Foundation"
vendor: "linuxfoundation"
manual: false
guided_slug: "rvfa"
supplemental: true
lastmod: "2026-10-31"
---

## About this study guide

The **RISC-V Foundational Associate (RVFA)** certification, offered by **The Linux Foundation**, checks entry-level knowledge of the RISC-V instruction set architecture, assembly programming, C interoperability, firmware and operating systems. It is useful for people moving into embedded hardware or software work, or moving from another processor architecture.

This is an independent Guided study resource. Its questions are original hypothetical examples, not official assessment items, recalled exam questions or a full exam simulation. Guided is not affiliated with, endorsed by or sponsored by The Linux Foundation or RISC-V International. The Linux Foundation and RVFA certification marks belong to their respective owners; RISC-V is a registered trademark of RISC-V International. No official logo or certification badge is used.

## Exam facts

| Detail | Published information |
|---|---|
| Certification | RISC-V Foundational Associate (RVFA) |
| Format | Online, remotely proctored multiple-choice exam |
| Time | 90 minutes |
| Passing score | 75%, under the issuer's multiple-choice FAQ |
| Prerequisites | None; familiarity with C, Git, GDB and system architecture is recommended |
| Validity | Two years |
| Booking | Check the [official RVFA certification page](https://training.linuxfoundation.org/certification/linux-foundation-risc-v-foundational-associate/) for current pricing and eligibility |
| Status checked | Available for enrollment on 31 October 2026; no retirement notice found on the issuer pages checked |

The issuer's [multiple-choice FAQ](https://docs.linuxfoundation.org/tc-docs/certification/faq-mc) and [exam instructions](https://docs.linuxfoundation.org/tc-docs/certification/important-instructions-mc) explain the current policies. The bank size below is our study allocation, not a claim about the real exam's question count.

## Domains and study allocation

| Official domain | Official weight | Practice questions |
|---|---:|---:|
| RISC-V Overview | 10% | 25 |
| RISC-V Instruction Set Architecture | 35% | 88 |
| Assembly Language for RISC-V | 25% | 62 |
| High Level Languages for RISC-V: C Programming | 15% | 38 |
| RISC-V Operating Systems & Tools | 15% | 37 |
| **Total** | **100%** | **250** |

The domain names and weights come from the certification page. Technical examples use the January 2026 instruction-set manuals and standard psABI conventions, with the processor width, extensions, privilege level and platform stated where they affect the result. This is our technical reference baseline, not an issuer-published exam revision or a guarantee of complete exam coverage.

### RISC-V Overview

Start with the boundary between an instruction set, a processor implementation and an ABI. An open instruction set does not make every chip design or software licence open. Understand what RISC-V International standardizes, how extensions become ratified and how to find the specification that governs a particular feature.

### RISC-V Instruction Set Architecture

Give this domain the most study time. Compare RV32I and RV64I, instruction formats, signed and unsigned arithmetic, loads, stores and branches. Follow how M, C, F, D and A extend the base architecture. Separate instruction semantics from a particular processor's speed.

For privileged code, distinguish exceptions from interrupts, identify the current privilege level and follow trap delegation. CSR operations, instruction synchronization, address-translation synchronization and ordinary data ordering solve different problems. Do not treat every fence as a cache flush.

### Assembly Language for RISC-V

Work through short programs by tracking registers and memory explicitly. State initial values before predicting an outcome. Practise loops, comparisons, address calculations, pseudo-instructions and disassembly. When optimizing, compare the instruction sequence and the actual platform constraints rather than assuming that fewer instructions always means less elapsed time.

### High Level Languages for RISC-V: C Programming

Learn how C code meets assembly through the ABI: arguments, return values, saved registers and the stack. Keep architecture flags separate from ABI flags. A processor supporting floating-point instructions does not automatically select a floating-point calling convention.

For inline assembly, distinguish compiler constraints, clobbers and ordering from hardware synchronization. Read the generated disassembly to test an assumption, and avoid examples whose C behavior is undefined.

### RISC-V Operating Systems & Tools

Compare bare-metal startup, machine firmware and a supervisor operating system. Understand the roles of OpenSBI, device trees and the boot handoff without assuming that every RISC-V board uses the same firmware or includes an MMU.

Use QEMU's system and user modes for the different problems they solve. When an application does not run, inspect its architecture, ABI, interpreter and libraries before blaming its instruction sequence.

## A practical study approach

Use a disposable simulator or development environment. Write a short program, predict its result, inspect the disassembly and compare the observed behavior with the applicable specification. Record the mistaken assumption when a prediction fails.

Use the [unprivileged instruction-set manual](https://docs.riscv.org/reference/isa/v20260120/unpriv/unpriv-index.html), [privileged architecture manual](https://docs.riscv.org/reference/isa/v20260120/priv/priv-index.html) and [ELF psABI documentation](https://riscv-non-isa.github.io/riscv-elf-psabi-doc/) alongside the issuer's recommended [RISC-V Fundamentals course](https://training.linuxfoundation.org/training/riscv-fundamentals-lfd210/). Buying this practice bank does not include the official course or exam.

## Independent practice

[Guided study practice for RVFA](/guided/rvfa/) includes 250 original multiple-choice questions across the five domains. Twenty questions are free without an account; full access is US$9 for one year. Explanations discuss the mechanism and each wrong option so that a mistake becomes useful study.

This practice does not reproduce the issuer's exam environment or guarantee a pass.
