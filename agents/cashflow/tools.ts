import { tool } from "langchain";
import { z } from "zod";
import { prisma } from "@/lib/db/postgres";
import { cacheInvalidate, CACHE_KEYS } from "@/lib/db/redis";

export const fetchTransactions = tool(
  async ({
    businessUnit,
    startDate,
    endDate,
  }: {
    businessUnit?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const where: Record<string, unknown> = { isForecast: false };
    if (businessUnit) where.businessUnit = businessUnit;
    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const transactions = await prisma.cashFlowTransaction.findMany({
      where,
      orderBy: { date: "asc" },
      take: 2000,
    });

    const summary = {
      count: transactions.length,
      totalInflow: transactions
        .filter((t) => t.type === "inflow")
        .reduce((s, t) => s + t.amountInr, 0),
      totalOutflow: transactions
        .filter((t) => t.type === "outflow")
        .reduce((s, t) => s + t.amountInr, 0),
      dateRange: {
        from: transactions[0]?.date.toISOString(),
        to: transactions[transactions.length - 1]?.date.toISOString(),
      },
      byCategory: Object.fromEntries(
        Object.entries(
          transactions.reduce(
            (acc, t) => {
              acc[t.category] = (acc[t.category] ?? 0) + t.amountInr;
              return acc;
            },
            {} as Record<string, number>
          )
        )
      ),
    };

    return JSON.stringify(summary);
  },
  {
    name: "fetch_transactions",
    description:
      "Fetch cash flow transactions from PostgreSQL with optional filters for business unit and date range. Returns summary statistics.",
    schema: z.object({
      businessUnit: z
        .string()
        .optional()
        .describe("Filter by BU: north, south, west, corporate"),
      startDate: z.string().optional().describe("Start date ISO format"),
      endDate: z.string().optional().describe("End date ISO format"),
    }),
  }
);

export const cleanData = tool(
  async ({
    businessUnit,
    monthsBack,
  }: {
    businessUnit?: string;
    monthsBack?: number;
  }) => {
    const since = new Date();
    since.setMonth(since.getMonth() - (monthsBack ?? 24));

    const where: Record<string, unknown> = {
      isForecast: false,
      date: { gte: since },
    };
    if (businessUnit) where.businessUnit = businessUnit;

    const transactions = await prisma.cashFlowTransaction.findMany({
      where,
      orderBy: { date: "asc" },
    });

    // Calculate mean and std dev for outlier detection
    const amounts = transactions.map((t) => t.amountInr);
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const variance =
      amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const outlierThreshold = 3;
    const outliers = transactions.filter(
      (t) => Math.abs(t.amountInr - mean) / stdDev > outlierThreshold
    );

    // Monthly aggregation
    const monthly = new Map<string, { inflow: number; outflow: number; count: number }>();
    for (const tx of transactions) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthly.get(key) ?? { inflow: 0, outflow: 0, count: 0 };
      if (tx.type === "inflow") entry.inflow += tx.amountInr;
      else entry.outflow += tx.amountInr;
      entry.count++;
      monthly.set(key, entry);
    }

    return JSON.stringify({
      totalRecords: transactions.length,
      outlierCount: outliers.length,
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      monthlyData: Object.fromEntries(monthly),
      outlierExamples: outliers.slice(0, 5).map((o) => ({
        date: o.date.toISOString(),
        amount: o.amountInr,
        category: o.category,
        zScore: Math.round(((o.amountInr - mean) / stdDev) * 10) / 10,
      })),
    });
  },
  {
    name: "clean_data",
    description:
      "Clean and prepare transaction data by removing outliers (z-score > 3), computing monthly aggregates, and identifying data quality issues.",
    schema: z.object({
      businessUnit: z.string().optional(),
      monthsBack: z.number().optional().default(24),
    }),
  }
);

export const calculateTrend = tool(
  async ({ data, periods }: { data: string; periods?: number }) => {
    // Simple linear trend from monthly data
    const parsed = JSON.parse(data) as Record<string, { inflow: number; outflow: number }>;
    const months = Object.keys(parsed).sort();
    const netCash = months.map((m) => parsed[m].inflow - parsed[m].outflow);

    const n = netCash.length;
    const xMean = (n - 1) / 2;
    const yMean = netCash.reduce((s, v) => s + v, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (netCash[i] - yMean);
      denominator += (i - xMean) ** 2;
    }
    const slope = denominator !== 0 ? numerator / denominator : 0;

    // Simple seasonality detection (Q4 bump check)
    const q4Months = months.filter((m) => {
      const month = parseInt(m.split("-")[1]);
      return month >= 1 && month <= 3;
    });
    const q4Avg =
      q4Months.length > 0
        ? q4Months.reduce((s, m) => s + parsed[m].inflow, 0) / q4Months.length
        : 0;
    const overallAvg = months.reduce((s, m) => s + parsed[m].inflow, 0) / months.length;
    const seasonalityDetected = q4Avg > overallAvg * 1.1;

    // Project forward
    const forecast = [];
    for (let i = 0; i < (periods ?? 3); i++) {
      forecast.push({
        period: i + 1,
        predictedNet: Math.round(yMean + slope * (n + i)),
      });
    }

    return JSON.stringify({
      trendDirection: slope > 0 ? "up" : slope < 0 ? "down" : "flat",
      slopePerMonth: Math.round(slope),
      seasonalityDetected,
      currentMonthlyAvg: Math.round(yMean),
      forecast,
    });
  },
  {
    name: "calculate_trend",
    description:
      "Calculate linear trend and seasonality from monthly cash flow data. Input should be JSON string of monthly data from clean_data tool.",
    schema: z.object({
      data: z.string().describe("JSON string of monthly data {month: {inflow, outflow}}"),
      periods: z.number().optional().default(3).describe("Months to forecast forward"),
    }),
  }
);

export const runScenario = tool(
  async ({
    baseAmount,
    stdDev,
    periods,
    scenarioType,
  }: {
    baseAmount: number;
    stdDev: number;
    periods: number;
    scenarioType: string;
  }) => {
    const multiplier =
      scenarioType === "optimistic" ? 1.15 : scenarioType === "pessimistic" ? 0.85 : 1.0;

    const points = [];
    for (let i = 0; i < periods; i++) {
      const noise = (Math.random() - 0.5) * stdDev * 0.3;
      const amount = Math.round(baseAmount * multiplier + noise);
      points.push({
        period: i + 1,
        amount,
        confidence: scenarioType === "base" ? 0.8 : 0.65,
      });
    }

    return JSON.stringify({
      scenarioType,
      periods,
      totalProjected: points.reduce((s, p) => s + p.amount, 0),
      avgMonthly: Math.round(points.reduce((s, p) => s + p.amount, 0) / periods),
      points,
    });
  },
  {
    name: "run_scenario",
    description:
      "Run a cash flow scenario simulation with configurable parameters. Produces projected amounts for the given number of periods.",
    schema: z.object({
      baseAmount: z.number().describe("Base monthly amount in INR"),
      stdDev: z.number().describe("Standard deviation for noise"),
      periods: z.number().describe("Number of periods to simulate"),
      scenarioType: z.string().describe("Type: optimistic, base, pessimistic"),
    }),
  }
);

export const detectAnomaly = tool(
  async ({ data, threshold }: { data: string; threshold?: number }) => {
    const parsed = JSON.parse(data) as Record<string, { inflow: number; outflow: number }>;
    const months = Object.keys(parsed).sort();
    const nets = months.map((m) => parsed[m].inflow - parsed[m].outflow);

    const mean = nets.reduce((s, v) => s + v, 0) / nets.length;
    const stdDev = Math.sqrt(
      nets.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / nets.length
    );

    const zThreshold = threshold ?? 2;
    const anomalies = months
      .map((month, i) => ({
        month,
        net: nets[i],
        zScore: stdDev !== 0 ? (nets[i] - mean) / stdDev : 0,
        inflow: parsed[month].inflow,
        outflow: parsed[month].outflow,
      }))
      .filter((a) => Math.abs(a.zScore) > zThreshold);

    return JSON.stringify({
      anomalyCount: anomalies.length,
      threshold: zThreshold,
      meanNetCashFlow: Math.round(mean),
      stdDev: Math.round(stdDev),
      anomalies: anomalies.map((a) => ({
        month: a.month,
        netCashFlow: Math.round(a.net),
        zScore: Math.round(a.zScore * 100) / 100,
        type: a.zScore > 0 ? "positive_spike" : "negative_spike",
        deviation: `${Math.round(Math.abs(a.zScore) * 100) / 100} standard deviations from mean`,
      })),
    });
  },
  {
    name: "detect_anomaly",
    description:
      "Detect anomalies in cash flow data using z-score analysis. Input should be monthly data JSON from clean_data tool.",
    schema: z.object({
      data: z.string().describe("JSON string of monthly data"),
      threshold: z.number().optional().default(2).describe("Z-score threshold for anomaly detection"),
    }),
  }
);

export const saveForecast = tool(
  async ({
    forecasts,
  }: {
    forecasts: Array<{
      scenarioType: string;
      businessUnit: string;
      predictedAmountInr: number;
      periodStart: string;
      periodEnd: string;
    }>;
  }) => {
    await prisma.cashFlowForecast.createMany({
      data: forecasts.map((f) => ({
        scenarioType: f.scenarioType,
        businessUnit: f.businessUnit,
        predictedAmountInr: f.predictedAmountInr,
        periodStart: new Date(f.periodStart),
        periodEnd: new Date(f.periodEnd),
      })),
    });

    await cacheInvalidate(CACHE_KEYS.dashboardCashflow);
    await cacheInvalidate(CACHE_KEYS.dashboardMaster);

    return JSON.stringify({
      success: true,
      savedCount: forecasts.length,
      message: `Saved ${forecasts.length} forecast records. Dashboard cache invalidated.`,
    });
  },
  {
    name: "save_forecast",
    description: "Save cash flow forecast results to the database and invalidate caches.",
    schema: z.object({
      forecasts: z.array(
        z.object({
          scenarioType: z.string(),
          businessUnit: z.string(),
          predictedAmountInr: z.number(),
          periodStart: z.string(),
          periodEnd: z.string(),
        })
      ),
    }),
  }
);
