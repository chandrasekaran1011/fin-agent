---
name: cashflow-forecasting
description: Cash flow forecasting with multi-agent debate, trend analysis, anomaly detection, and scenario modeling. Use for predicting cash positions, identifying risks, and generating consensus forecasts.
---

# Cash Flow Forecasting Skill

## Data Preparation

1. Fetch 24 months of historical transactions using `fetch_transactions`
2. Clean data using `clean_data` - removes outliers (z-score > 3), normalizes amounts, fills date gaps
3. Tag seasonal patterns (Q4 revenue bumps, year-end tax payments)

## Multi-Agent Debate Protocol

Delegate forecasting to three specialized subagents using the `task` tool:

1. **Optimist**: Focus on growth signals, improving revenue trends, and upside scenarios
2. **Analyst**: Use statistical regression, moving averages, and seasonality decomposition
3. **Risk-Assessor**: Identify cash gaps, worst-case scenarios, and liquidity risks

Each subagent should return:
- 90-day forecast (daily data points)
- Key assumptions (3-5 bullet points)
- Risk factors (2-4 items)
- Confidence score (0-100)

## Consensus Synthesis

After receiving all three forecasts:
1. Weight by confidence score (normalized to sum to 1.0)
2. Identify agreement areas (where all 3 agree within 10%)
3. Identify disagreement areas (spread > 20%)
4. Generate confidence intervals: P10 (pessimistic), P50 (consensus), P90 (optimistic)

## Scenario Generation

Create three scenario branches:
- **Optimistic**: +1 standard deviation from consensus
- **Base**: Consensus forecast
- **Pessimistic**: -1 standard deviation from consensus

## Alert Detection

Flag these conditions:
- **Cash gap**: Projected balance < 2 weeks of operating expenses
- **Anomaly**: Actual vs forecast deviation > 2 standard deviations
- **Concentration risk**: Single vendor payments > 30% of monthly outflow
- **Seasonal trap**: Historical Q-end patterns that may repeat

## INR Conventions

- Display large amounts in Crores (Cr) or Lakhs (L)
- Monthly totals typically range ₹1-5 Cr inflow, ₹80L-4Cr outflow per business unit
- Always show 2 decimal places for summary amounts
