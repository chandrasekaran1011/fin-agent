"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable } from "@/components/dashboard/DataTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import type { ARDashboardData } from "@/types/ar";

const columns = [
  { key: "invoiceNumber", label: "Invoice #", sortable: true },
  { key: "vendorName", label: "Vendor", sortable: true },
  {
    key: "totalAmountInr",
    label: "Amount",
    sortable: true,
    render: (row: Record<string, unknown>) =>
      formatCurrency(row.totalAmountInr as number),
    className: "font-mono",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row: Record<string, unknown>) => {
      const status = row.status as string;
      const variant =
        status === "matched" || status === "approved"
          ? ("success" as const)
          : status === "flagged"
            ? ("warning" as const)
            : ("secondary" as const);
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    key: "matchConfidence",
    label: "Confidence",
    sortable: true,
    render: (row: Record<string, unknown>) => {
      const conf = row.matchConfidence as number | null;
      return conf ? `${conf.toFixed(0)}%` : "—";
    },
    className: "font-mono",
  },
];

export default function ARDashboardPage() {
  const { data, isLoading } = useDashboardData<ARDashboardData>(
    "/api/dashboard/ar"
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
        <div className="h-96 rounded-xl border border-[var(--border-default)] bg-white animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          AR Reconciliation
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Invoice matching, aging analysis, and open items
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Total Invoices"
          value={data?.totalInvoices ?? 0}
        />
        <KPICard
          label="Matched"
          value={data?.matchedInvoices ?? 0}
          trend={4.2}
        />
        <KPICard
          label="Flagged"
          value={data?.flaggedInvoices ?? 0}
          trend={-12.5}
        />
        <KPICard
          label="Match Rate"
          value={data?.matchRate ?? 0}
          format={(v) => `${v.toFixed(1)}%`}
        />
      </div>

      <DataTable
        data={(data?.recentInvoices as unknown as Record<string, unknown>[]) ?? []}
        columns={columns}
        pageSize={15}
      />
    </div>
  );
}
