import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/postgres";
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/db/redis";

export async function GET() {
  try {
    const cached = await cacheGet(CACHE_KEYS.dashboardCopilot);
    if (cached) {
      return NextResponse.json({ data: JSON.parse(cached), cacheHit: true, cachedAt: new Date().toISOString() });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalQueries, avgConfidence, documentsIndexed, sessionsToday, recentQueries] =
      await Promise.all([
        prisma.copilotQuery.count(),
        prisma.copilotQuery.aggregate({ _avg: { confidenceScore: true } }),
        prisma.financialDocument.count(),
        prisma.copilotSession.count({ where: { startedAt: { gte: today } } }),
        prisma.copilotQuery.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            question: true,
            confidenceScore: true,
            sourcesUsed: true,
            createdAt: true,
          },
        }),
      ]);

    const data = {
      totalQueries,
      avgConfidence: Math.round((avgConfidence._avg.confidenceScore ?? 0) * 100) / 100,
      documentsIndexed,
      sessionsToday,
      recentQueries,
    };

    await cacheSet(CACHE_KEYS.dashboardCopilot, JSON.stringify(data), CACHE_TTL.dashboard);
    return NextResponse.json({ data, cacheHit: false, cachedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[Dashboard Copilot]", error);
    return NextResponse.json({ message: "Failed to load copilot data" }, { status: 500 });
  }
}
