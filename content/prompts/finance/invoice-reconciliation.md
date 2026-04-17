---
title: Invoice Reconciliation Helper
description: Compare invoices against purchase orders and flag discrepancies
prompt: >-
  Compare these invoices against the purchase orders and flag: (1) Amount mismatches (over-billing or under-billing), (2) Missing line items, (3) Incorrect quantities, (4) Duplicate invoices, (5) Invoices without a matching PO. Present discrepancies in a table with invoice number, PO number, expected amount, actual amount, and status. Calculate total discrepancy value.
platforms:
- m365-copilot
best_on: m365-copilot
roles:
- finance
- accounts-payable
- operations
use_case: finance
difficulty: beginner
tags:
- finance
- invoices
- reconciliation
- audit
---

## Tips for Best Results

- Sort by discrepancy value — address the largest first
- Check for duplicate invoice numbers across vendors
- Set up three-way matching as a standard process
