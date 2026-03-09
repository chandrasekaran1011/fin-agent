import { tool } from "langchain";
import { z } from "zod";
import { prisma } from "@/lib/db/postgres";
import { FAISSManager } from "@/lib/db/faiss";

export const queryARData = tool(
  async ({ metric, filters }: { metric: string; filters?: string }) => {
    const parsedFilters = filters ? JSON.parse(filters) : {};

    switch (metric) {
      case "aging": {
        const invoices = await prisma.invoice.findMany({
          where: { status: { not: "matched" } },
          select: { totalAmountInr: true, dueDate: true, status: true },
        });
        const now = new Date();
        const buckets = { current: 0, "31-60": 0, "61-90": 0, "91-120": 0, "120+": 0 };
        for (const inv of invoices) {
          const days = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
          if (days <= 30) buckets.current += inv.totalAmountInr;
          else if (days <= 60) buckets["31-60"] += inv.totalAmountInr;
          else if (days <= 90) buckets["61-90"] += inv.totalAmountInr;
          else if (days <= 120) buckets["91-120"] += inv.totalAmountInr;
          else buckets["120+"] += inv.totalAmountInr;
        }
        return JSON.stringify({ metric: "aging", buckets, totalOutstanding: Object.values(buckets).reduce((s, v) => s + v, 0) });
      }
      case "match_rate": {
        const total = await prisma.invoice.count();
        const matched = await prisma.invoice.count({ where: { status: "matched" } });
        return JSON.stringify({ metric: "match_rate", total, matched, rate: total > 0 ? Math.round((matched / total) * 1000) / 10 : 0 });
      }
      case "overdue": {
        const overdueInvoices = await prisma.invoice.findMany({
          where: {
            status: { in: ["open", "flagged"] },
            dueDate: { lt: new Date() },
            ...(parsedFilters.daysOverdue ? {
              dueDate: { lt: new Date(Date.now() - parsedFilters.daysOverdue * 24 * 60 * 60 * 1000) }
            } : {}),
          },
          include: { vendor: { select: { name: true } } },
          take: 20,
          orderBy: { dueDate: "asc" },
        });
        return JSON.stringify({
          metric: "overdue",
          count: overdueInvoices.length,
          items: overdueInvoices.map((inv) => ({
            invoiceNumber: inv.invoiceNumber,
            vendorName: inv.vendor.name,
            amountInr: inv.totalAmountInr,
            dueDate: inv.dueDate.toISOString(),
            daysOverdue: Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
          })),
        });
      }
      default: {
        const summary = {
          totalInvoices: await prisma.invoice.count(),
          openInvoices: await prisma.invoice.count({ where: { status: "open" } }),
          matchedInvoices: await prisma.invoice.count({ where: { status: "matched" } }),
          flaggedInvoices: await prisma.invoice.count({ where: { status: "flagged" } }),
        };
        return JSON.stringify({ metric: "summary", ...summary });
      }
    }
  },
  {
    name: "query_ar_data",
    description: "Query AR/invoice data. Metrics: summary, aging, match_rate, overdue.",
    schema: z.object({
      metric: z.string().describe("Metric type: summary, aging, match_rate, overdue"),
      filters: z.string().optional().describe("JSON string of filters like {daysOverdue: 60}"),
    }),
  }
);

export const queryCashFlowData = tool(
  async ({ metric, filters }: { metric: string; filters?: string }) => {
    const parsedFilters = filters ? JSON.parse(filters) : {};

    switch (metric) {
      case "monthly_trend": {
        const since = new Date();
        since.setMonth(since.getMonth() - (parsedFilters.months ?? 12));
        const txs = await prisma.cashFlowTransaction.findMany({
          where: { isForecast: false, date: { gte: since } },
          orderBy: { date: "asc" },
        });
        const monthly = new Map<string, { inflow: number; outflow: number }>();
        for (const tx of txs) {
          const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
          const entry = monthly.get(key) ?? { inflow: 0, outflow: 0 };
          if (tx.type === "inflow") entry.inflow += tx.amountInr;
          else entry.outflow += tx.amountInr;
          monthly.set(key, entry);
        }
        return JSON.stringify({ metric: "monthly_trend", data: Object.fromEntries(monthly) });
      }
      case "forecast": {
        const forecasts = await prisma.cashFlowForecast.findMany({
          where: parsedFilters.scenarioType ? { scenarioType: parsedFilters.scenarioType } : {},
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        return JSON.stringify({ metric: "forecast", forecasts });
      }
      default: {
        const now = new Date();
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const recentTxs = await prisma.cashFlowTransaction.findMany({
          where: { isForecast: false, date: { gte: monthAgo } },
        });
        const inflow = recentTxs.filter((t) => t.type === "inflow").reduce((s, t) => s + t.amountInr, 0);
        const outflow = recentTxs.filter((t) => t.type === "outflow").reduce((s, t) => s + t.amountInr, 0);
        return JSON.stringify({
          metric: "summary",
          period: "last_30_days",
          totalInflow: inflow,
          totalOutflow: outflow,
          netCashFlow: inflow - outflow,
          burnRate: outflow,
        });
      }
    }
  },
  {
    name: "query_cashflow_data",
    description: "Query cash flow data. Metrics: summary, monthly_trend, forecast.",
    schema: z.object({
      metric: z.string().describe("Metric type: summary, monthly_trend, forecast"),
      filters: z.string().optional().describe("JSON string of filters"),
    }),
  }
);

export const queryVendorData = tool(
  async ({ metric, filters }: { metric: string; filters?: string }) => {
    const parsedFilters = filters ? JSON.parse(filters) : {};

    switch (metric) {
      case "risk_distribution": {
        const vendors = await prisma.vendor.groupBy({
          by: ["riskLevel"],
          _count: true,
        });
        return JSON.stringify({ metric: "risk_distribution", distribution: vendors });
      }
      case "top_risk": {
        const topRisk = await prisma.vendor.findMany({
          where: { riskLevel: { in: ["high", "critical"] } },
          orderBy: { riskScore: "asc" },
          take: 10,
        });
        return JSON.stringify({ metric: "top_risk", vendors: topRisk });
      }
      case "exposure": {
        const vendors = await prisma.vendor.findMany({
          orderBy: { outstandingBalance: "desc" },
          take: parsedFilters.limit ?? 10,
          select: { name: true, outstandingBalance: true, category: true, riskLevel: true },
        });
        const totalExposure = await prisma.vendor.aggregate({ _sum: { outstandingBalance: true } });
        return JSON.stringify({
          metric: "exposure",
          totalExposureInr: totalExposure._sum.outstandingBalance,
          topVendors: vendors,
        });
      }
      default: {
        const summary = {
          totalVendors: await prisma.vendor.count(),
          highRisk: await prisma.vendor.count({ where: { riskLevel: "high" } }),
          critical: await prisma.vendor.count({ where: { riskLevel: "critical" } }),
          avgRiskScore: (await prisma.vendor.aggregate({ _avg: { riskScore: true } }))._avg.riskScore,
        };
        return JSON.stringify({ metric: "summary", ...summary });
      }
    }
  },
  {
    name: "query_vendor_data",
    description: "Query vendor risk data. Metrics: summary, risk_distribution, top_risk, exposure.",
    schema: z.object({
      metric: z.string().describe("Metric type: summary, risk_distribution, top_risk, exposure"),
      filters: z.string().optional().describe("JSON string of filters"),
    }),
  }
);

export const semanticSearch = tool(
  async ({ query, k, minScore, category }: { query: string; k?: number; minScore?: number; category?: string }) => {
    try {
      const results = minScore
        ? await FAISSManager.searchWithThreshold(query, k ?? 5, minScore)
        : await FAISSManager.search(query, k ?? 5);

      const filtered = category
        ? results.filter((r) => r.doc.metadata.category === category)
        : results;

      return JSON.stringify({
        query,
        resultCount: filtered.length,
        results: filtered.map((r) => ({
          title: r.doc.metadata.title,
          category: r.doc.metadata.category,
          score: Math.round(r.score * 1000) / 1000,
          excerpt: r.doc.pageContent.substring(0, 500),
          sourceId: r.doc.metadata.sourceId,
        })),
      });
    } catch {
      return JSON.stringify({ error: "FAISS index not available. Run db:seed to build the index." });
    }
  },
  {
    name: "semantic_search",
    description: "Search the financial knowledge base (FAISS) for semantically relevant documents. Use for policy questions, historical analysis, and context retrieval.",
    schema: z.object({
      query: z.string().describe("Natural language search query"),
      k: z.number().optional().default(5).describe("Number of results"),
      minScore: z.number().optional().describe("Minimum similarity score threshold (0-1)"),
      category: z.string().optional().describe("Filter by category: policy, report, analysis, invoice_summary, forecast"),
    }),
  }
);

export const generateChartSpec = tool(
  async ({
    chartType,
    title,
    data,
    xKey,
    yKeys,
    colors,
  }: {
    chartType: string;
    title: string;
    data: string;
    xKey: string;
    yKeys: string[];
    colors?: string[];
  }) => {
    const parsedData = JSON.parse(data);
    return JSON.stringify({
      type: chartType,
      title,
      data: parsedData,
      xKey,
      yKeys,
      colors: colors ?? ["#4f46e5", "#059669", "#d97706", "#dc2626"],
    });
  },
  {
    name: "generate_chart_spec",
    description: "Generate a Recharts-compatible chart specification for rendering in the chat interface.",
    schema: z.object({
      chartType: z.string().describe("Chart type: line, area, bar, pie"),
      title: z.string().describe("Chart title"),
      data: z.string().describe("JSON string of data array [{...}, ...]"),
      xKey: z.string().describe("Key for x-axis"),
      yKeys: z.array(z.string()).describe("Keys for y-axis values"),
      colors: z.array(z.string()).optional().describe("Color hex codes for each y-key"),
    }),
  }
);

export const citeSource = tool(
  async ({ source, excerpt, relevance }: { source: string; excerpt: string; relevance: number }) => {
    return JSON.stringify({ source, excerpt, relevance, formatted: `[${source}]` });
  },
  {
    name: "cite_source",
    description: "Format a data point as an inline citation for the response.",
    schema: z.object({
      source: z.string().describe("Source name: AR Database, Cash Flow DB, Vendor DB, Knowledge Base"),
      excerpt: z.string().describe("Relevant excerpt from the source"),
      relevance: z.number().describe("Relevance score 0-1"),
    }),
  }
);

export const saveCopilotQuery = tool(
  async ({
    sessionId,
    question,
    answer,
    sourcesUsed,
    confidenceScore,
    chartSpec,
    faissDocIds,
  }: {
    sessionId: string;
    question: string;
    answer: string;
    sourcesUsed: string[];
    confidenceScore: number;
    chartSpec?: string;
    faissDocIds?: string[];
  }) => {
    await prisma.copilotQuery.create({
      data: {
        sessionId,
        question,
        answer,
        sourcesUsed,
        confidenceScore,
        chartSpecJson: chartSpec ? JSON.parse(chartSpec) : undefined,
        faissDocIds: faissDocIds ?? [],
      },
    });
    return JSON.stringify({ success: true, message: "Query saved to session history." });
  },
  {
    name: "save_copilot_query",
    description: "Save a completed Q&A interaction to the copilot session history.",
    schema: z.object({
      sessionId: z.string(),
      question: z.string(),
      answer: z.string(),
      sourcesUsed: z.array(z.string()),
      confidenceScore: z.number(),
      chartSpec: z.string().optional(),
      faissDocIds: z.array(z.string()).optional(),
    }),
  }
);
