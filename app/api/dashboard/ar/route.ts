import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/postgres";
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/db/redis";

export async function GET() {
  try {
    const cached = await cacheGet(CACHE_KEYS.dashboardAR);
    if (cached) {
      return NextResponse.json({ data: JSON.parse(cached), cacheHit: true, cachedAt: new Date().toISOString() });
    }

    const [total, matched, flagged, open] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: "matched" } }),
      prisma.invoice.count({ where: { status: "flagged" } }),
      prisma.invoice.count({ where: { status: "open" } }),
    ]);

    const totalOutstanding = await prisma.invoice.aggregate({
      where: { status: { in: ["open", "flagged"] } },
      _sum: { totalAmountInr: true },
    });

    const avgConfidence = await prisma.invoice.aggregate({
      where: { matchConfidence: { not: null } },
      _avg: { matchConfidence: true },
    });

    const recentInvoices = await prisma.invoice.findMany({
      where: { status: { in: ["open", "flagged"] } },
      include: { vendor: { select: { name: true } } },
      take: 10,
      orderBy: { dueDate: "asc" },
    });

    const data = {
      summary: {
        totalInvoices: total,
        matched,
        flagged,
        openItems: open,
        matchRate: total > 0 ? Math.round((matched / total) * 1000) / 10 : 0,
        totalOutstandingInr: totalOutstanding._sum.totalAmountInr ?? 0,
        avgConfidence: Math.round((avgConfidence._avg.matchConfidence ?? 0) * 10) / 10,
      },
      recentOpenItems: recentInvoices.map((inv: { id: string; invoiceNumber: string; vendor: { name: string }; totalAmountInr: number; dueDate: Date; status: string; matchConfidence: number | null }) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        vendorName: inv.vendor.name,
        amountInr: inv.totalAmountInr,
        dueDate: inv.dueDate.toISOString(),
        status: inv.status,
        matchConfidence: inv.matchConfidence,
      })),
    };

    await cacheSet(CACHE_KEYS.dashboardAR, JSON.stringify(data), CACHE_TTL.dashboard);
    return NextResponse.json({ data, cacheHit: false, cachedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[Dashboard AR]", error);
    return NextResponse.json({ message: "Failed to load AR data" }, { status: 500 });
  }
}
