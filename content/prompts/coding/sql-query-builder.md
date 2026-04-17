---
title: SQL Query Builder
description: Write a SQL query from a plain English description
prompt: >-
  Write a SQL query that [DESCRIBE WHAT YOU NEED — e.g. finds all customers who ordered more than 3 times in the last month but have not ordered in the last 7 days]. Database: [TYPE — SQL Server / PostgreSQL / MySQL]. Tables: [LIST TABLE NAMES AND KEY COLUMNS]. Include: the query, explanation of each clause, and performance considerations.
platforms:
- chatgpt
- claude
- m365-copilot
best_on: chatgpt
roles:
- developer
- analyst
- data-engineer
use_case: coding
difficulty: intermediate
tags:
- coding
- sql
- database
- query
---

## Tips for Best Results

- Provide table schemas for accurate column references
- Ask for index recommendations alongside the query
- Test on a subset of data before running on production
