---
name: vendor-risk-intelligence
description: Vendor risk assessment including payment behavior scoring, concentration analysis, risk classification, and actionable recommendations. Use for deep scanning individual vendors and generating risk reports.
---

# Vendor Risk Intelligence Skill

## Assessment Workflow

Use `write_todos` to plan these steps, then execute sequentially:

1. Fetch vendor profile and transaction history
2. Score payment behavior
3. Analyze concentration risk
4. Classify overall risk level
5. Generate risk report with recommendations

## Payment Score Calculation (0-100)

Base score starts at 70, then adjust:
- On-time payments: +1 per on-time payment (max +20)
- Early payments (>5 days early): +0.5 each (max +10)
- Late payments (1-15 days): -2 each
- Late payments (15-30 days): -4 each
- Late payments (>30 days): -6 each
- Improving trend (last 6 months): +5
- Deteriorating trend: -10

## Concentration Score (0-100, higher = riskier)

- Vendor's AP as % of total AP exposure:
  - < 5%: Score 0-20 (low)
  - 5-15%: Score 20-50 (moderate)
  - 15-30%: Score 50-75 (high)
  - > 30%: Score 75-100 (critical)
- Same-category concentration adds +10 if category > 40% of total AP

## Credit Score (0-100)

Derived from:
- Outstanding balance vs credit limit ratio (lower = better)
- Payment consistency (low std deviation = better)
- Transaction volume trend (growing relationship = better)
- Late payment frequency trend

## Risk Classification Matrix

| Overall Score | Risk Level |
|--------------|------------|
| 80-100 | Low - continue relationship |
| 60-79 | Medium - monitor quarterly |
| 40-59 | High - review terms, reduce exposure |
| 0-39 | Critical - immediate action required |

Overall = (PaymentScore * 0.4) + ((100 - ConcentrationScore) * 0.3) + (CreditScore * 0.3)

## Report Structure

1. **Executive Summary**: 2-3 sentences on overall risk posture
2. **Key Risk Factors**: Bulleted list of top concerns
3. **Recommendation**: Primary action to take
4. **Suggested Actions**: 3-5 numbered concrete steps
