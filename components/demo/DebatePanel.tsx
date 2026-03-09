"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart3, ShieldAlert, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface SubAgentResult {
  name: string;
  forecast?: string;
  keyAssumption?: string;
  confidence?: number;
  status: "pending" | "running" | "complete";
}

interface DebatePanelProps {
  agents: SubAgentResult[];
  consensus?: string;
  className?: string;
}

const agentConfig: Record<string, { icon: typeof TrendingUp; color: string }> = {
  optimist: { icon: TrendingUp, color: "text-emerald-600" },
  analyst: { icon: BarChart3, color: "text-indigo-600" },
  "risk-assessor": { icon: ShieldAlert, color: "text-amber-600" },
};

export function DebatePanel({ agents, consensus, className }: DebatePanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        {agents.map((agent) => {
          const config = agentConfig[agent.name] ?? {
            icon: BarChart3,
            color: "text-slate-600",
          };
          const Icon = config.icon;

          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[var(--border-default)] bg-white p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-sm font-semibold capitalize text-[var(--text-primary)]">
                  {agent.name.replace("-", " ")}
                </span>
                {agent.status === "running" && (
                  <Loader2 className="h-3 w-3 animate-spin text-[var(--accent-primary)] ml-auto" />
                )}
                {agent.status === "complete" && (
                  <Badge variant="success" className="ml-auto text-[10px]">
                    Done
                  </Badge>
                )}
              </div>

              {agent.status === "pending" && (
                <p className="text-xs text-[var(--text-muted)]">Waiting...</p>
              )}

              {agent.forecast && (
                <p className="text-lg font-mono font-semibold text-[var(--text-primary)] mb-1">
                  {agent.forecast}
                </p>
              )}

              {agent.keyAssumption && (
                <p className="text-xs text-[var(--text-secondary)]">
                  {agent.keyAssumption}
                </p>
              )}

              {agent.confidence !== undefined && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-[var(--bg-tertiary)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent-primary)]"
                      style={{ width: `${agent.confidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium tabular-nums text-[var(--text-muted)]">
                    {agent.confidence}%
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {consensus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border-2 border-[var(--accent-primary)] bg-[var(--accent-light)] p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-primary)] mb-2">
            Consensus Forecast
          </p>
          <p className="text-sm text-[var(--text-primary)]">{consensus}</p>
        </motion.div>
      )}
    </div>
  );
}
