"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TraceEntry } from "@/types/agent";

interface AgentTracePanelProps {
  traceLog: TraceEntry[];
  isRunning: boolean;
  provider?: string | null;
  className?: string;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AgentTracePanel({
  traceLog,
  isRunning,
  provider,
  className,
}: AgentTracePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [traceLog]);

  const handleCopy = () => {
    const text = traceLog
      .map(
        (e) =>
          `[${formatTime(e.timestamp)}] ${e.node} — ${e.status} — ${e.message}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-[var(--border-default)] bg-white overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Agent Trace
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--accent-primary)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {provider && (
            <span className="text-[10px] text-[var(--text-muted)]">
              {provider}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            title="Copy trace"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 max-h-[400px] min-h-[200px]"
      >
        {traceLog.length === 0 && !isRunning && (
          <p className="text-xs text-[var(--text-muted)] text-center py-8">
            Agent trace will appear here when running
          </p>
        )}

        <AnimatePresence initial={false}>
          {traceLog.map((entry, i) => (
            <motion.div
              key={`${entry.timestamp}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-2 text-xs font-mono"
            >
              <span className="text-[var(--text-muted)] shrink-0 tabular-nums">
                {formatTime(entry.timestamp)}
              </span>

              {entry.status === "complete" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] shrink-0 mt-0.5" />
              )}
              {entry.status === "started" && (
                <Loader2 className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5 animate-spin" />
              )}
              {entry.status === "error" && (
                <AlertCircle className="h-3.5 w-3.5 text-[var(--danger)] shrink-0 mt-0.5" />
              )}

              <span
                className={cn(
                  "font-medium",
                  entry.status === "complete" && "text-[var(--success)]",
                  entry.status === "started" && "text-[var(--accent-primary)]",
                  entry.status === "error" && "text-[var(--danger)]"
                )}
              >
                {entry.node}
              </span>

              <span className="text-[var(--text-secondary)] truncate">
                {entry.message}
              </span>

              {entry.durationMs !== undefined && (
                <span className="text-[var(--text-muted)] shrink-0 ml-auto">
                  {entry.durationMs}ms
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
