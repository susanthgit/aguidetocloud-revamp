---
title: Email Delivery Troubleshooting
description: Diagnose why emails are not being delivered
prompt: >-
  Help me diagnose email delivery failure. Scenario: [DESCRIBE — emails not received / going to spam / bouncing / delayed]. Check: (1) Message trace in Exchange Admin, (2) SPF/DKIM/DMARC alignment, (3) Transport rules that might redirect, (4) Recipient mailbox issues, (5) IP reputation, (6) Content filtering triggers. Provide step-by-step diagnosis with Exchange admin paths.
platforms:
- m365-copilot
- chatgpt
best_on: chatgpt
roles:
- it-admin
- support
use_case: troubleshooting
difficulty: intermediate
tags:
- troubleshooting
- email
- delivery
- exchange
---

## Tips for Best Results

- Message trace is your best friend for email issues
- Check transport rules — they silently redirect more than you expect
- SPF/DKIM failures cause legitimate emails to land in spam
