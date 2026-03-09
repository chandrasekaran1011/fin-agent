"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/lib/utils/format";
import type { CashFlowDashboardData } from "@/types/cashflow";

export default function CashFlowDashboardPage() {
  const { data, isLoading } = useDashboardData<CashFlowDashboardData>(
    "/api/dashboard/cashflow"
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
        <div className="h-64 rounded-xl border border-[var(--border-default)] bg-white animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Cash Flow
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Forecast charts, variance analysis, and burn rate
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Net Cash Flow"
          value={data?.netCashFlow ?? 0}
          format={(v) => formatCurrency(v)}
          trend={8.3}
        />
        <KPICard
          label="Total Inflow"
          value={data?.totalInflow ?? 0}
          format={(v) => formatCurrency(v)}
        />
        <KPICard
          label="Total Outflow"
          value={data?.totalOutflow ?? 0}
          format={(v) => formatCurrency(v)}
        />
        <KPICard
          label="Anomalies"
          value={data?.anomalyCount ?? 0}
        />
      </div>

      <TrendChart
        data={(data?.monthlyTrends ?? []).map((t) => ({
          label: t.month,
          inflow: t.inflow,
          outflow: t.outflow,
        }))}
        dataKey="inflow"
        label="Monthly Cash Flow Trend"
        color="#4f46e5"
      />
    </div>
  );
}
