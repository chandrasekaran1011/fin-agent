import { tool } from "langchain";
import { z } from "zod";
import { prisma } from "@/lib/db/postgres";
import { cacheInvalidate, CACHE_KEYS } from "@/lib/db/redis";

export const fetchVendorProfile = tool(
  async ({ vendorId }: { vendorId: string }) => {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return JSON.stringify({ error: "Vendor not found" });
    return JSON.stringify(vendor);
  },
  {
    name: "fetch_vendor_profile",
    description: "Load a vendor's complete profile from the database by ID.",
    schema: z.object({
      vendorId: z.string().describe("The vendor ID to look up"),
    }),
  }
);

export const fetchVendorTransactions = tool(
  async ({ vendorId, monthsBack }: { vendorId: string; monthsBack?: number }) => {
    const since = new Date();
    since.setMonth(since.getMonth() - (monthsBack ?? 24));

    const transactions = await prisma.cashFlowTransaction.findMany({
      where: { vendorId, date: { gte: since }, isForecast: false },
      orderBy: { date: "asc" },
    });

    const monthly = new Map<string, { total: number; count: number; late: number }>();
    for (const tx of transactions) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthly.get(key) ?? { total: 0, count: 0, late: 0 };
      entry.total += tx.amountInr;
      entry.count++;
      monthly.set(key, entry);
    }

    return JSON.stringify({
      vendorId,
      transactionCount: transactions.length,
      totalAmountInr: transactions.reduce((s, t) => s + t.amountInr, 0),
      dateRange: {
        from: transactions[0]?.date.toISOString(),
        to: transactions[transactions.length - 1]?.date.toISOString(),
      },
      monthlyBreakdown: Object.fromEntries(monthly),
    });
  },
  {
    name: "fetch_vendor_transactions",
    description: "Fetch a vendor's transaction history for the last N months with monthly breakdown.",
    schema: z.object({
      vendorId: z.string(),
      monthsBack: z.number().optional().default(24),
    }),
  }
);

export const scorePaymentBehavior = tool(
  async ({ vendorId }: { vendorId: string }) => {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return JSON.stringify({ error: "Vendor not found" });

    let score = 70;
    const avgDays = vendor.avgDaysToPay ?? vendor.paymentTermsDays;
    const terms = vendor.paymentTermsDays;

    if (avgDays <= terms) {
      score += Math.min(20, (terms - avgDays) * 2);
    } else if (avgDays <= terms + 15) {
      score -= (avgDays - terms) * 2;
    } else if (avgDays <= terms + 30) {
      score -= (avgDays - terms) * 3;
    } else {
      score -= (avgDays - terms) * 4;
    }

    score -= vendor.latePaymentCount * 0.5;
    score = Math.max(0, Math.min(100, score));

    return JSON.stringify({
      vendorId,
      vendorName: vendor.name,
      paymentScore: Math.round(score * 10) / 10,
      avgDaysToPay: avgDays,
      paymentTerms: terms,
      daysOverTerms: Math.max(0, avgDays - terms),
      latePaymentCount: vendor.latePaymentCount,
      totalTransactions: vendor.totalTransactions,
      assessment:
        score >= 80 ? "Good payment behavior" :
        score >= 60 ? "Acceptable with occasional delays" :
        score >= 40 ? "Concerning payment patterns" :
        "Critical payment issues",
    });
  },
  {
    name: "score_payment_behavior",
    description: "Calculate a payment behavior score (0-100) for a vendor based on their payment history.",
    schema: z.object({
      vendorId: z.string(),
    }),
  }
);

export const analyzeConcentration = tool(
  async ({ vendorId }: { vendorId: string }) => {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) return JSON.stringify({ error: "Vendor not found" });

    const allVendors = await prisma.vendor.findMany({
      select: { id: true, name: true, outstandingBalance: true, category: true },
    });

    const totalAP = allVendors.reduce((s: number, v: { outstandingBalance: number }) => s + v.outstandingBalance, 0);
    const vendorShare = totalAP > 0 ? (vendor.outstandingBalance / totalAP) * 100 : 0;

    const sameCategory = allVendors.filter((v) => v.category === vendor.category);
    const categoryTotal = sameCategory.reduce((s, v) => s + v.outstandingBalance, 0);
    const categoryShare = totalAP > 0 ? (categoryTotal / totalAP) * 100 : 0;

    let concentrationScore: number;
    if (vendorShare < 5) concentrationScore = vendorShare * 4;
    else if (vendorShare < 15) concentrationScore = 20 + (vendorShare - 5) * 3;
    else if (vendorShare < 30) concentrationScore = 50 + (vendorShare - 15) * 1.67;
    else concentrationScore = 75 + Math.min(25, (vendorShare - 30) * 1.25);

    if (categoryShare > 40) concentrationScore = Math.min(100, concentrationScore + 10);

    const topVendors = [...allVendors]
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
      .slice(0, 5)
      .map((v) => ({
        name: v.name,
        exposureInr: v.outstandingBalance,
        sharePercent: totalAP > 0 ? Math.round((v.outstandingBalance / totalAP) * 1000) / 10 : 0,
      }));

    return JSON.stringify({
      vendorId,
      vendorName: vendor.name,
      concentrationScore: Math.round(concentrationScore * 10) / 10,
      vendorSharePercent: Math.round(vendorShare * 10) / 10,
      categorySharePercent: Math.round(categoryShare * 10) / 10,
      totalAPExposureInr: totalAP,
      vendorExposureInr: vendor.outstandingBalance,
      concentrationLevel:
        vendorShare > 30 ? "critical" :
        vendorShare > 15 ? "high" :
        vendorShare > 5 ? "medium" : "low",
      topVendorsByExposure: topVendors,
    });
  },
  {
    name: "analyze_concentration",
    description: "Analyze AP concentration risk for a vendor - what percentage of total payables they represent.",
    schema: z.object({
      vendorId: z.string(),
    }),
  }
);

export const classifyRisk = tool(
  async ({
    paymentScore,
    concentrationScore,
    creditScore,
  }: {
    paymentScore: number;
    concentrationScore: number;
    creditScore: number;
  }) => {
    const overall =
      paymentScore * 0.4 + (100 - concentrationScore) * 0.3 + creditScore * 0.3;

    const riskLevel =
      overall >= 80 ? "low" :
      overall >= 60 ? "medium" :
      overall >= 40 ? "high" : "critical";

    return JSON.stringify({
      overallRiskScore: Math.round(overall * 10) / 10,
      riskLevel,
      components: {
        paymentScore,
        concentrationScore,
        creditScore,
      },
      interpretation:
        riskLevel === "low" ? "Continue relationship with standard monitoring" :
        riskLevel === "medium" ? "Monitor quarterly, review payment terms" :
        riskLevel === "high" ? "Review relationship, consider reducing exposure" :
        "Immediate action required - escalate to CFO",
    });
  },
  {
    name: "classify_risk",
    description: "Synthesize payment, concentration, and credit scores into an overall risk classification.",
    schema: z.object({
      paymentScore: z.number().describe("Payment behavior score 0-100"),
      concentrationScore: z.number().describe("Concentration risk score 0-100 (higher = riskier)"),
      creditScore: z.number().describe("Credit worthiness score 0-100"),
    }),
  }
);

export const generateRiskReport = tool(
  async ({
    vendorName,
    riskLevel,
    overallScore,
    paymentScore,
    concentrationScore,
    creditScore,
    keyFindings,
  }: {
    vendorName: string;
    riskLevel: string;
    overallScore: number;
    paymentScore: number;
    concentrationScore: number;
    creditScore: number;
    keyFindings: string[];
  }) => {
    return JSON.stringify({
      reportGenerated: true,
      vendorName,
      riskLevel,
      overallScore,
      scores: { paymentScore, concentrationScore, creditScore },
      keyFindings,
      note: "Report data prepared. The agent should use this data along with the vendor-risk skill to generate the full executive summary, risk factors, recommendation, and suggested actions.",
    });
  },
  {
    name: "generate_risk_report",
    description: "Prepare structured data for a vendor risk report. The agent generates the narrative.",
    schema: z.object({
      vendorName: z.string(),
      riskLevel: z.string(),
      overallScore: z.number(),
      paymentScore: z.number(),
      concentrationScore: z.number(),
      creditScore: z.number(),
      keyFindings: z.array(z.string()),
    }),
  }
);

export const saveVendorAssessment = tool(
  async ({
    vendorId,
    paymentScore,
    concentrationScore,
    creditScore,
    overallRiskScore,
    riskLevel,
    recommendation,
    agentReasoning,
  }: {
    vendorId: string;
    paymentScore: number;
    concentrationScore: number;
    creditScore: number;
    overallRiskScore: number;
    riskLevel: string;
    recommendation: string;
    agentReasoning: string;
  }) => {
    await prisma.vendorRiskAssessment.create({
      data: {
        vendorId,
        paymentScore,
        concentrationScore,
        creditScore,
        overallRiskScore,
        riskLevel,
        recommendation,
        agentReasoning,
      },
    });

    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        riskScore: overallRiskScore,
        riskLevel,
        lastAssessedAt: new Date(),
      },
    });

    await cacheInvalidate(CACHE_KEYS.dashboardVendor);
    await cacheInvalidate(CACHE_KEYS.dashboardMaster);

    return JSON.stringify({
      success: true,
      message: `Vendor assessment saved. Risk level: ${riskLevel}. Dashboard cache invalidated.`,
    });
  },
  {
    name: "save_vendor_assessment",
    description: "Save a completed vendor risk assessment to the database and update the vendor's risk profile.",
    schema: z.object({
      vendorId: z.string(),
      paymentScore: z.number(),
      concentrationScore: z.number(),
      creditScore: z.number(),
      overallRiskScore: z.number(),
      riskLevel: z.string(),
      recommendation: z.string(),
      agentReasoning: z.string(),
    }),
  }
);
