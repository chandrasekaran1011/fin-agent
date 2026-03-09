import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/postgres";
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/db/redis";

export async function GET() {
  try {
    const cached = await cacheGet(CACHE_KEYS.dashboardCashflow);
    if (cached) {
      return NextResponse.json({ data: JSON.parse(cached), cacheHit: true, cachedAt: new Date().toISOString() });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTxs = await prisma.cashFlowTransaction.findMany({
      where: { isForecast: false, date: { gte: thirtyDaysAgo } },
    });

    const inflow = recentTxs.filter((t: { type: string }) => t.type === "inflow").reduce((s: number, t: { amountInr: number }) => s + t.amountInr, 0);
    const outflow = recentTxs.filter((t: { type: string }) => t.type === "outflow").reduce((s: number, t: { amountInr: number }) => s + t.amountInr, 0);

    // Monthly trend (last 12 months)
    const yearAgo = new Date();
    yearAgo.setMonth(yearAgo.getMonth() - 12);
    const allTxs = await prisma.cashFlowTransaction.findMany({
      where: { isForecast: false, date: { gte: yearAgo } },
      orderBy: { date: "asc" },
    });

    const monthly = new Map<string, { inflow: number; outflow: number }>();
    for (const tx of allTxs) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthly.get(key) ?? { inflow: 0, outflow: 0 };
      if (tx.type === "inflow") entry.inflow += tx.amountInr;
      else entry.outflow += tx.amountInr;
      monthly.set(key, entry);
    }

    const monthlyTrend = Array.from(monthly.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        inflow: data.inflow,
        outflow: data.outflow,
        net: data.inflow - data.outflow,
      }));

    const data = {
      currentBalance: inflow - outflow,
      burnRate: outflow,
      runwayDays: outflow > 0 ? Math.round(((inflow - outflow) / (outflow / 30)) * 10) / 10 : 999,
      monthlyTrend,
      period: "last_30_days",
      totalInflow: inflow,
      totalOutflow: outflow,
    };

    await cacheSet(CACHE_KEYS.dashboardCashflow, JSON.stringify(data), CACHE_TTL.dashboard);
    return NextResponse.json({ data, cacheHit: false, cachedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[Dashboard CashFlow]", error);
    return NextResponse.json({ message: "Failed to load cash flow data" }, { status: 500 });
  }
}
