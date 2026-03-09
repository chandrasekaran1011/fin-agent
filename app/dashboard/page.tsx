"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/lib/utils/format";
import type { DashboardKPIs } from "@/types/api";

export default function MasterDashboardPage() {
  const { data, isLoading } = useDashboardData<DashboardKPIs>(
    "/api/dashboard/ar"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          CFO Dashboard
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Master overview across all financial modules
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-[var(--border-default)] bg-white animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">
              AR Reconciliation
            </p>
            <div className="grid grid-cols-4 gap-4">
              <KPICard
                label="Total Invoices"
                value={data?.totalInvoices ?? 500}
              />
              <KPICard
                label="Matched"
                value={data?.matchedInvoices ?? 350}
                trend={4.2}
                trendLabel="vs last month"
              />
              <KPICard
                label="Flagged"
                value={data?.flaggedInvoices ?? 75}
                trend={-12.5}
                trendLabel="vs last month"
              />
              <KPICard
                label="Match Rate"
                value={data?.matchRate ?? 82}
                format={(v) => `${v.toFixed(1)}%`}
                trend={2.1}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Cash Flow
            </p>
            <div className="grid grid-cols-4 gap-4">
              <KPICard
                label="Net Cash Flow"
                value={23400000}
                format={(v) => formatCurrency(v)}
                trend={8.3}
              />
              <KPICard
                label="Forecast Accuracy"
                value={94}
                format={(v) => `${v.toFixed(0)}%`}
              />
              <KPICard label="Anomalies Detected" value={3} trend={-50} />
              <KPICard label="Active Forecasts" value={12} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Vendor Risk
            </p>
            <div className="grid grid-cols-4 gap-4">
              <KPICard label="Total Vendors" value={50} />
              <KPICard label="High Risk" value={8} trend={-25} />
              <KPICard label="Critical" value={2} />
              <KPICard
                label="Avg Risk Score"
                value={34}
                format={(v) => v.toFixed(0)}
                trend={-5.2}
                trendLabel="improving"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
