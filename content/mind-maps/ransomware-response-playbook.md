---
title: "Ransomware Response Playbook"
description: "Visual incident-response playbook for ransomware in Microsoft environments — detect, isolate (minutes), investigate, recover, the hard decisions, and prevent next time."
intro: "Ransomware response is six phases — and the hard decisions phase is the one most playbooks skip. Here's the full picture with Microsoft tooling."
category: "security"
format: "architecture"
renderer: "static"
data_file: "ransomware_response_playbook"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/ransomware-response-playbook.jpg
faq:
  - question: "What's the first thing to do when ransomware hits?"
    answer: "Network-isolate the affected endpoints — Defender for Endpoint has a one-click 'Isolate device' action that severs the host from everything except Defender management. This stops lateral spread INSTANTLY while you investigate. Don't power off (you lose volatile evidence in RAM). Don't unplug network manually (creates inconsistency). Use the platform's isolation. Then disable user accounts in Entra and revoke their tokens — CAE forces re-auth in minutes."
  - question: "Should we ever pay the ransom?"
    answer: "Official guidance from the FBI, NCSC (UK), CISA, and most insurance carriers: do NOT pay. Reasons: (1) no guarantee of decryption — ~30% of paying victims don't get usable keys back. (2) Marks you as a future target. (3) May fund sanctioned entities (legally and reputationally toxic). (4) The decryption tool, even when delivered, is often slow / buggy and you still need to restore from backup anyway. Engage your IR retainer; they will steer the legal/insurance/regulatory conversations."
  - question: "What does 'immutable backup' mean and why does it matter?"
    answer: "Immutable = backups that cannot be modified or deleted for a configured retention period, even by the storage admin. Examples: Azure Storage immutable blobs, AWS S3 Object Lock, dedicated backup services (Azure Backup with immutable vault, Veeam hardened repository). This is the SINGLE most important defense against modern ransomware — attackers explicitly target backups before encrypting production. If your backups can be deleted by a domain admin, they will be. The classic **3-2-1-1 rule** is: **3 copies of your data, on **2 different media**, with **1 copy off-site**, and **1 copy offline or immutable**. MFA on the backup admin account is best practice on top of that, not a substitute for the offline / immutable copy."
  - question: "Who do we have to notify and when?"
    answer: "Depends on jurisdiction and the data involved. GDPR (EU/UK): regulators within 72 hours if personal data is breached + affected individuals 'without undue delay' if high risk. US state laws: vary by state, often 30-90 days. HIPAA: 60 days. Some sectors have stricter SEC, FINRA, banking-regulator rules with shorter clocks. Get legal involved within HOURS, not days — they'll drive the notification matrix. Public disclosure timing is a strategic decision; coordinate with comms before any external statement."
---
