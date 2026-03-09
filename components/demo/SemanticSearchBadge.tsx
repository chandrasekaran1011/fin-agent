"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SemanticSearchBadgeProps {
  source: string;
  score?: number;
  className?: string;
}

export function SemanticSearchBadge({
  source,
  score,
  className,
}: SemanticSearchBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[var(--info-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--info)]",
        className
      )}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {source}
      {score !== undefined && (
        <span className="opacity-70">({Math.round(score * 100)}%)</span>
      )}
    </span>
  );
}
