import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/postgres";
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/db/redis";

export async function GET() {
  try {
    const cached = await cacheGet(CACHE_KEYS.dashboardVendor);
    if (cached) {
      return NextResponse.json({ data: JSON.parse(cached), cacheHit: true, cachedAt: new Date().toISOString() });
    }

    const [totalVendors, riskGroups, topRisk, recentAssessments] = await Promise.all([
      prisma.vendor.count(),
      prisma.vendor.groupBy({ by: ["riskLevel"], _count: true }),
      prisma.vendor.findMany({
        where: { riskLevel: { in: ["high", "critical"] } },
        orderBy: { riskScore: "asc" },
        take: 10,
      }),
      prisma.vendorRiskAssessment.findMany({
        include: { vendor: { select: { name: true, category: true } } },
        orderBy: { assessedAt: "desc" },
        take: 5,
      }),
    ]);

    const riskDistribution: Record<string, number> = {};
    for (const group of riskGroups) {
      if (group.riskLevel) riskDistribution[group.riskLevel] = group._count;
    }

    const avgScore = await prisma.vendor.aggregate({ _avg: { riskScore: true } });

    // Heatmap data
    const allVendors = await prisma.vendor.findMany({
      select: { id: true, name: true, category: true, riskScore: true, riskLevel: true },
    });

    const data = {
      totalVendors,
      riskDistribution,
      avgRiskScore: Math.round((avgScore._avg.riskScore ?? 0) * 10) / 10,
      highRiskCount: (riskDistribution.high ?? 0) + (riskDistribution.critical ?? 0),
      topRiskVendors: topRisk,
      recentAssessments: recentAssessments.map((a: { vendor: { name: string; category: string }; [key: string]: unknown }) => ({
        ...a,
        vendorName: a.vendor.name,
        vendorCategory: a.vendor.category,
      })),
      heatmapData: allVendors.map((v: { id: string; name: string; category: string; riskScore: number | null; riskLevel: string | null }) => ({
        vendorId: v.id,
        vendorName: v.name,
        category: v.category,
        riskScore: v.riskScore ?? 50,
        riskLevel: v.riskLevel ?? "medium",
      })),
    };

    await cacheSet(CACHE_KEYS.dashboardVendor, JSON.stringify(data), CACHE_TTL.dashboard);
    return NextResponse.json({ data, cacheHit: false, cachedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[Dashboard Vendor]", error);
    return NextResponse.json({ message: "Failed to load vendor data" }, { status: 500 });
  }
}
