---
title: "PTCA PyTorch Certified Associate Study Guide"
description: "Prepare for the Linux Foundation PTCA with 250 original PyTorch questions across fundamentals, model development, optimisation and data handling."
date: 2026-10-31T11:35:00+13:00
type: "cert-tracker"
layout: "single"
exam_code: "PTCA"
exam_title: "PyTorch Certified Associate"
exam_level: "intermediate"
exam_status: "active"
exam_category: "Linux Foundation"
vendor: "linuxfoundation"
manual: true
guided_slug: "ptca"
---

## About the PTCA Exam

The **PyTorch Certified Associate (PTCA)** validates practical knowledge of the core PyTorch workflow: creating and transforming tensors, building `nn.Module` models, training and evaluating them, moving work across supported devices, improving execution, measuring performance, using distributed training, and building reliable data pipelines.

The official blueprint has four domains. **PyTorch Fundamentals** is the largest at 38%, followed by **Performance & Optimization** at 26%, **Model Development** at 20%, and **Data Handling** at 16%.

> **Before buying:** This is independent practice based on the public Linux Foundation blueprint and official PyTorch documentation. It contains original teaching questions, not official or recalled exam items. The Linux Foundation does not publish the real exam's question count on the PTCA page or multiple-choice FAQ, so this guide does not invent one. Practice access does not include an exam voucher.

## Who Should Take This Exam?

PTCA is aimed at early-stage machine-learning practitioners who use Python and want to prove that they can work safely with PyTorch rather than only follow a notebook.

It suits junior machine-learning engineers, data scientists, software developers moving into model development, and students who have built at least a small training pipeline. The official page lists no formal prerequisite, but basic Python and machine-learning familiarity will make the material easier.

## Exam Quick Facts

| Detail | Current public information |
|--------|----------------------------|
| **Exam code** | PTCA |
| **Credential** | PyTorch Certified Associate |
| **Duration** | 120 minutes |
| **Official question count** | Not published on the official PTCA page or Linux Foundation multiple-choice FAQ |
| **Pass score** | 75% |
| **Question type** | Multiple choice |
| **Delivery** | Online, remotely proctored through PSI Bridge |
| **Exam fee** | US$250 |
| **Eligibility period** | 12 months from purchase |
| **Retake** | One retake under the current programme terms |
| **Validity** | 2 years |
| **Prerequisites** | None formally required |
| **Official page** | [Linux Foundation PTCA certification](https://training.linuxfoundation.org/certification/pytorch-certified-associate-ptca/) |

Always confirm current booking, identity, system and retake requirements in the [Linux Foundation Candidate Handbook](https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2) before scheduling.

## Exam Domains and Practice Coverage

This practice bank follows the official weights exactly.

| Official domain | Weight | Practice questions |
|-----------------|--------|--------------------|
| PyTorch Fundamentals | 38% | 95 |
| Model Development | 20% | 50 |
| Performance & Optimization | 26% | 65 |
| Data Handling | 16% | 40 |
| **Total** | **100%** | **250** |

### PyTorch Fundamentals

Know concrete tensor behaviour: shape and dtype inference, broadcasting, indexing, views versus copies, autograd graph recording, gradient accumulation, training and evaluation loops, model saving and loading, and CPU, CUDA and MPS device rules.

### Model Development

Understand `nn.Module`, parameters, buffers, submodule registration, common layers, activations, losses, optimizers and schedulers. Be able to trace dimensions through a model and diagnose an incompatible layer or target shape.

### Performance & Optimization

Use autocast and gradient scaling correctly, treat `torch.compile` as an optimisation with limits rather than a guarantee, measure work with appropriate synchronization and warm-up, and understand the process and synchronization model of `DistributedDataParallel`.

### Data Handling

Know map-style and iterable datasets, `DataLoader` batching and worker behaviour, sampling, pinned memory, transform placement, image dtype and range conversion, normalization, and how random transforms behave across calls.

## Practice Exam: 250 Original Questions

The PTCA bank contains **250 original single-answer questions**. Each question includes a detailed explanation, specific feedback for every distractor, a hint, an exam tip, a practical application and a link to the relevant official PyTorch documentation.

The first **20 questions are free** without an account. Full practice access is **US$9 for one year**.

The questions use concrete code and operational decisions. They test details such as whether an operation returns a view or copy, when gradients accumulate, why `model.eval()` and gradient disabling are separate controls, where AMP belongs in a training step, why CUDA timing needs synchronization, what DDP does and does not synchronize, and how `DataLoader` workers affect data and randomness.

## PTCA Certification Path

The Linux Foundation publishes a [PTCA certification pathway](https://training.linuxfoundation.org/certification/ptca-certification-pathway/) for candidates building their PyTorch skills. Use it as a learning sequence, not as evidence that another certification is a formal prerequisite.

For hands-on preparation, work through the [PyTorch Learn the Basics tutorial](https://docs.pytorch.org/tutorials/beginner/basics/intro.html), then rebuild the examples without copying them. Change tensor shapes, devices, model layers, batch sizes and worker settings so you can explain each outcome.

## Study Tips

1. **Run the code.** Small tensor and autograd examples are faster to understand when you inspect shapes, dtypes, devices, strides and `.grad` directly.
2. **Separate the controls.** Training or evaluation mode, gradient recording and optimizer updates are related, but none automatically performs the others.
3. **Trace shapes explicitly.** Write the shape after every convolution, pooling, flattening and linear operation.
4. **Measure honestly.** Warm up accelerated work, synchronize where required and compare equivalent workloads.
5. **Practise data edge cases.** Test incomplete batches, multiple workers, iterable datasets, randomized transforms and pinned-memory transfers.
6. **Follow current documentation.** PyTorch APIs evolve; use the linked official pages rather than memorising an old snippet.
