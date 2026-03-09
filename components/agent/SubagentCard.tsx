"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SubagentInfo } from "@/types/agent";

interface SubagentCardProps {
  subagents: SubagentInfo[];
  className?: string;
}

export function SubagentCard({ subagents, className }: SubagentCardProps) {
  if (subagents.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-default)] bg-white p-4",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
        Subagents
      </p>
      <div className="space-y-2">
        {subagents.map((sa) => (
          <motion.div
            key={sa.name}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm"
          >
            {sa.status === "complete" && (
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] shrink-0" />
            )}
            {sa.status === "running" && (
              <Loader2 className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0 animate-spin" />
            )}
            {sa.status === "pending" && (
              <Circle className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
            )}
            <span className="font-medium text-[var(--text-primary)] capitalize">
              {sa.name}
            </span>
            {sa.description && (
              <span className="text-xs text-[var(--text-muted)] truncate">
                {sa.description}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
