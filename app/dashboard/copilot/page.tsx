"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { DataTable } from "@/components/dashboard/DataTable";
import { useDashboardData } from "@/hooks/useDashboardData";

interface CopilotDashboardData {
  totalQueries: number;
  avgConfidence: number;
  topSources: string[];
  recentQueries: Array<{
    question: string;
    answer: string;
    confidenceScore: number;
    createdAt: string;
  }>;
}

const columns = [
  { key: "question", label: "Question", sortable: true },
  {
    key: "confidenceScore",
    label: "Confidence",
    sortable: true,
    render: (row: Record<string, unknown>) =>
      `${((row.confidenceScore as number) * 100).toFixed(0)}%`,
    className: "font-mono",
  },
  {
    key: "createdAt",
    label: "Date",
    sortable: true,
    render: (row: Record<string, unknown>) =>
      new Date(row.createdAt as string).toLocaleDateString("en-IN"),
  },
];

export default function CopilotDashboardPage() {
  const { data, isLoading } = useDashboardData<CopilotDashboardData>(
    "/api/dashboard/copilot"
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
          CFO Co-Pilot
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Query history, insight feed, and usage stats
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Total Queries" value={data?.totalQueries ?? 0} />
        <KPICard
          label="Avg Confidence"
          value={(data?.avgConfidence ?? 0) * 100}
          format={(v) => `${v.toFixed(0)}%`}
        />
        <KPICard
          label="Knowledge Docs"
          value={47}
        />
      </div>

      <DataTable
        data={(data?.recentQueries as Record<string, unknown>[]) ?? []}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
}
