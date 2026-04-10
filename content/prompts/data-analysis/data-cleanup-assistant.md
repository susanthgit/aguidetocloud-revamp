---
title: Data Cleanup Instructions
description: Get step-by-step instructions to clean messy spreadsheet data into analysis-ready format
prompt: 'Help me clean up this messy spreadsheet data. The issues I am seeing: [DESCRIBE PROBLEMS — duplicates, inconsistent formatting, missing values, merged cells, etc.]. Provide a step-by-step cleanup
  plan: (1) Remove Duplicates — how to identify and remove them, (2) Standardise Formats — fix date formats, number formats, text capitalisation, (3) Handle Missing Data — strategy for blank cells (fill,
  flag, or remove), (4) Split/Merge Columns — separate combined data into proper columns, (5) Validate Data — formulas to check for errors and outliers, (6) Final Structure — what the clean dataset should
  look like. Provide the exact Excel steps or formulas for each action.'
platforms:
- m365-copilot
- chatgpt
- claude
- gemini
best_on: m365-copilot
roles:
- finance
- it-admin
- hr
- marketing
- manager
use_case: data-analysis
difficulty: intermediate
tags:
- excel
- data-cleanup
- data-quality
- spreadsheet
- formatting
- preparation
m365_surfaces:
- excel
- copilot-chat-work
---

## Tips for Best Results

- In **Excel**, Copilot can execute cleanup steps directly
- Describe the specific issues: "dates are mixed DD/MM and MM/DD formats"
- Always work on a copy — never clean the original data
- Follow up with "Now analyse the cleaned data for trends"
