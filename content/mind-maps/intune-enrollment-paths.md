---
title: "Intune Device Enrollment — Pick a Path"
description: "Visual decision tree for Intune device enrollment — Autopilot, Hybrid Entra Join, Apple Business Manager, Android Zero Touch, BYOD MAM-only, kiosk and shared modes."
intro: "Six enrollment paths, three platforms, two device-ownership models. Here's how to pick — and why most modern orgs land on Autopilot + MAM-only."
category: "security"
format: "decision-tree"
renderer: "static"
data_file: "intune_enrollment_paths"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/intune-enrollment-paths.jpg
faq:
  - question: "What's Windows Autopilot and why is it 'zero touch'?"
    answer: "Autopilot lets a user receive a brand-new Windows device direct from the OEM (Dell, HP, Lenovo, Microsoft) and turn it on at home — Windows OOBE recognises the device hash, joins Entra ID, downloads Intune policies/apps, and delivers a fully configured corporate laptop without IT physically touching it. The 'touch' in question is IT touching the device. Modern alternatives to imaging + provisioning packages. The default for new Windows deployments in 2026."
  - question: "Should I still use Hybrid Entra Join for new devices?"
    answer: "No, for new deployments — Microsoft itself recommends cloud-only Entra Join for new devices. Hybrid (joined to both on-prem AD and Entra) only makes sense if you have legacy on-prem apps that authenticate via Kerberos and you can't refactor them to use Entra/SAML. Even then, plan a migration: on-prem apps can be modernised with Entra App Proxy or Entra Domain Services. Hybrid adds complexity for diminishing returns."
  - question: "BYOD: MAM-only vs full enrollment — what's the difference?"
    answer: "MAM (Mobile App Management) only: Intune protects the WORK APPS on the device (Outlook, Teams, OneDrive, etc.) — encryption, copy-paste blocks, conditional launch, remote-wipe of work data only. The device itself is not enrolled or managed; user owns the OS. Full enrollment: device joins Intune, full MDM. For BYOD, MAM-only is the right answer most of the time — protects org data without forcing users to surrender their personal phones to IT."
  - question: "What about the new Microsoft Intune Suite?"
    answer: "Intune Suite (separate licence) bundles Endpoint Privilege Management, Remote Help, Advanced Endpoint Analytics, Microsoft Tunnel for MAM, Cloud PKI, and Enterprise App Management. Useful for orgs that want to consolidate vendor tools — replaces several point products. Not required for basic Intune enrollment / policy work, but worth evaluating if you're paying for separate Privilege Management or Remote Support tools today."
---
