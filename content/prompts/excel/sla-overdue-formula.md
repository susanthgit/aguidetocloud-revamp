---
title: Create an SLA Overdue Formula
description: Build a formula that flags rows where deadlines have passed and highlights them
prompt: 'Create a formula for this table that flags rows where the [DEADLINE COLUMN] has passed and the [STATUS COLUMN] is not "Completed". Show "Overdue" in a new column. Then add conditional formatting to highlight overdue rows in red and items due within 3 days in amber.'
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- it-admin
- operations
- support
use_case: excel
difficulty: beginner
tags:
- excel
- formula
- sla
- conditional-formatting
m365_surfaces:
- excel
---

## Tips for Best Results

- Make sure your data is in a proper Excel table (Ctrl+T) before asking Copilot
- Reference your actual column names — Copilot reads the table headers
- Add "Also count how many items are overdue" to get a dashboard summary
