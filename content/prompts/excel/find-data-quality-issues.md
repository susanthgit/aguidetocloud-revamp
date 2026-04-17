---
title: Find Data Quality Issues
description: Identify duplicates, blanks, inconsistencies, and formatting problems in your data
prompt: 'Scan this table for data quality issues. Look for: (1) Duplicate rows, (2) Blank or missing values in required columns, (3) Inconsistent formatting (dates, currencies, text case), (4) Values that look like typos or outliers. List each issue with the row number and a suggested fix.'
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
- data-quality
- cleanup
- validation
m365_surfaces:
- excel
---

## Tips for Best Results

- Run this before any reporting or analysis to catch problems early
- For large datasets, add "Focus on columns [A, B, C]" to narrow the scope
- Follow up with "Fix the issues you found" to let Copilot apply corrections
