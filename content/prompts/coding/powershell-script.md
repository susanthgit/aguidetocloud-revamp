---
title: PowerShell Script from Description
description: Generate a PowerShell script from a plain English task description
prompt: >-
  Write a PowerShell script that [DESCRIBE TASK — e.g. finds all inactive users in Entra ID who have not signed in for 90 days and exports them to CSV]. Include: (1) Required modules and permissions, (2) Parameter block with defaults, (3) Error handling with try-catch, (4) Progress output, (5) CSV or report output, (6) Comments explaining each section. Target: PowerShell 7+.
platforms:
- m365-copilot
- chatgpt
- claude
best_on: chatgpt
roles:
- it-admin
- developer
use_case: coding
difficulty: intermediate
tags:
- coding
- powershell
- script
- automation
---

## Tips for Best Results

- Test in a non-production environment first
- Use approved PowerShell modules only
- Add -WhatIf support for destructive operations
