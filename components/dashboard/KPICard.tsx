"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface KPICardProps {
  label: string;
  value: number;
  format?: (v: number) => string;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

function useCountUp(target: number, duration = 1500): number {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(from + (target - from) * eased);

      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    }

    ref.current = requestAnimationFrame(step);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration]);

  return current;
}

export function KPICard({
  label,
  value,
  format,
  trend,
  trendLabel,
  className,
}: KPICardProps) {
  const animatedValue = useCountUp(value);
  const displayValue = format
    ? format(animatedValue)
    : Math.round(animatedValue).toLocaleString("en-IN");

  return (
    <div
      className={cn(
        "relative rounded-xl border border-[var(--border-default)] bg-white p-5 transition-all duration-200 hover:shadow-md hover:border-[var(--border-hover)]",
        className
      )}
    >
      <div className="absolute bottom-0 left-0 h-[3px] w-2/5 rounded-br-xl bg-[var(--accent-primary)] opacity-40" />

      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] tabular-nums font-mono">
        {displayValue}
      </p>

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-[var(--success)]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[var(--danger)]" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}
          >
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-[var(--text-muted)]">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
