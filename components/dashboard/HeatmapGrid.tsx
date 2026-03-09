"use client";

import { cn } from "@/lib/utils/cn";
import type { HeatmapCell } from "@/types/vendor";

interface HeatmapGridProps {
  data: HeatmapCell[];
  className?: string;
}

function getRiskColor(level: string): string {
  switch (level) {
    case "critical":
      return "bg-red-500 text-white";
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    case "low":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function HeatmapGrid({ data, className }: HeatmapGridProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-default)] bg-white p-5",
        className
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-4">
        Risk Heatmap
      </p>
      <div className="grid grid-cols-5 gap-2">
        {data.map((cell) => (
          <div
            key={cell.vendorId}
            className={cn(
              "rounded-lg p-2.5 text-center transition-all duration-200 hover:scale-105 cursor-default",
              getRiskColor(cell.riskLevel)
            )}
            title={`${cell.vendorName}: ${cell.riskLevel} risk (${cell.score})`}
          >
            <p className="text-[10px] font-medium truncate">{cell.vendorName}</p>
            <p className="text-sm font-bold tabular-nums">{cell.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
