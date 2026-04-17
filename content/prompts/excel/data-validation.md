---
title: Data Validation Rules Designer
description: Set up data validation to prevent errors in shared spreadsheets
prompt: >-
  Design data validation rules for this shared spreadsheet with columns: [LIST COLUMNS]. For each column specify: (1) Allowed data type, (2) Validation rule (dropdown list, range, format), (3) Input message for users, (4) Error message if invalid, (5) Whether blank is allowed. Goal: prevent data quality issues before they happen.
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- analyst
- it-admin
- operations
use_case: excel
difficulty: intermediate
tags:
- excel
- validation
- data-quality
- rules
---

## Tips for Best Results

- Use dropdown lists for any column with a fixed set of values
- Add helper text so users know what format to use
- Lock structure but allow data entry in shared sheets
