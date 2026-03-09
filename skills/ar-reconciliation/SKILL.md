---
name: ar-reconciliation
description: AR reconciliation for invoice-to-transaction matching, discrepancy detection, confidence scoring, and approval workflows. Use for processing invoice batches and generating reconciliation summaries.
---

# AR Reconciliation Skill

## Invoice Matching Strategy

Follow this matching cascade for each invoice:

1. **Exact match**: Invoice number + amount within 2% tolerance + date within 3 days
2. **Fuzzy match**: Amount within 10% + date within 7 days + vendor name similarity
3. **Semantic match**: Use the `semantic_match` tool to find past invoices with similar descriptions, then correlate with bank transactions

## Multi-field Confidence Scoring

- Amount match weight: 40%
- Date proximity weight: 30%
- Description/semantic similarity weight: 30%

Score bands:
- 95-100: Exact match on all fields - auto-approve candidate
- 80-94: Strong match with minor variances - review recommended
- 60-79: Partial match - manual review required
- Below 60: No reliable match - flag as unmatched

## Discrepancy Detection Rules

Flag an item when ANY of these conditions are true:
- Amount discrepancy exceeds 5% of invoice total
- Date difference exceeds 7 business days between invoice and transaction
- Duplicate invoice number detected with different amounts
- No matching bank transaction found for the invoice
- Tax calculation mismatch exceeds 1%

## Severity Classification

- **High**: Amount discrepancy > 15% OR missing transaction for invoice > 10L
- **Medium**: Amount discrepancy 5-15% OR date diff 7-15 days
- **Low**: Amount discrepancy < 5% with date diff < 7 days

## Resolution Workflow

For each flagged item, analyze and recommend:
1. **Approve**: When discrepancy is explainable (rounding, partial payment, tax adjustment)
2. **Reject**: When likely duplicate or fraudulent entry
3. **Investigate**: When insufficient data to determine cause
4. **Adjust**: When amount can be corrected based on line item analysis

Always provide detailed reasoning with your resolution recommendation.

## Output Format

When presenting reconciliation results:
- Group by status: matched, flagged, unmatched
- Show confidence score as percentage
- Display amounts in INR (Indian Rupee format: lakhs, crores)
- Include vendor name and invoice number for context
- Summarize total discrepancy amount
