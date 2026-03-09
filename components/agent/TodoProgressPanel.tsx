"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TodoItem } from "@/types/agent";

interface TodoProgressPanelProps {
  todos: TodoItem[];
  className?: string;
}

export function TodoProgressPanel({ todos, className }: TodoProgressPanelProps) {
  if (todos.length === 0) return null;

  const completed = todos.filter((t) => t.status === "completed").length;
  const total = todos.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-default)] bg-white p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Agent Plan
        </p>
        <span className="text-xs text-[var(--text-secondary)]">
          {completed}/{total} ({percent}%)
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)] mb-3">
        <motion.div
          className="h-full rounded-full bg-[var(--accent-primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {todos.map((todo, i) => (
            <motion.div
              key={`${todo.content}-${i}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-2 text-xs"
            >
              {todo.status === "completed" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] shrink-0 mt-0.5" />
              )}
              {todo.status === "in_progress" && (
                <Loader2 className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5 animate-spin" />
              )}
              {todo.status === "pending" && (
                <Circle className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />
              )}
              <span
                className={cn(
                  todo.status === "completed" && "text-[var(--text-muted)] line-through",
                  todo.status === "in_progress" && "text-[var(--text-primary)] font-medium",
                  todo.status === "pending" && "text-[var(--text-secondary)]"
                )}
              >
                {todo.content}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
