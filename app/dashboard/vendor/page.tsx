"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { HeatmapGrid } from "@/components/dashboard/HeatmapGrid";
import { DataTable } from "@/components/dashboard/DataTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Badge } from "@/components/ui/badge";
import type { VendorDashboardData } from "@/types/vendor";

const columns = [
  { key: "name", label: "Vendor", sortable: true },
  { key: "category", label: "Category", sortable: true },
  {
    key: "riskLevel",
    label: "Risk",
    sortable: true,
    render: (row: Record<string, unknown>) => {
      const level = row.riskLevel as string;
      const variant =
        level === "critical" || level === "high"
          ? ("danger" as const)
          : level === "medium"
            ? ("warning" as const)
            : ("success" as const);
      return <Badge variant={variant}>{level ?? "—"}</Badge>;
    },
  },
  {
    key: "riskScore",
    label: "Score",
    sortable: true,
    render: (row: Record<string, unknown>) => {
      const score = row.riskScore as number | null;
      return score ? score.toFixed(0) : "—";
    },
    className: "font-mono",
  },
  {
    key: "avgDaysToPay",
    label: "Avg Days to Pay",
    sortable: true,
    className: "font-mono",
  },
];

export default function VendorDashboardPage() {
  const { data, isLoading } = useDashboardData<VendorDashboardData>(
    "/api/dashboard/vendor"
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-[var(--border-default)] bg-white animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Vendor Risk
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Risk heatmap, vendor assessments, and alerts
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Vendors" value={data?.totalVendors ?? 0} />
        <KPICard label="High Risk" value={data?.highRiskCount ?? 0} />
        <KPICard label="Critical" value={data?.criticalCount ?? 0} />
        <KPICard
          label="Avg Risk Score"
          value={data?.avgRiskScore ?? 0}
          format={(v) => v.toFixed(0)}
        />
      </div>

      {data?.heatmapData && <HeatmapGrid data={data.heatmapData} />}

      <DataTable
        data={(data?.vendors as unknown as Record<string, unknown>[]) ?? []}
        columns={columns}
        pageSize={15}
      />
    </div>
  );
}
