"use client";

import { cn } from "@/lib/utils/cn";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

type NodeStatus = "pending" | "running" | "complete" | "error";

interface NodeBadgeProps {
  status: NodeStatus;
  label: string;
  className?: string;
}

const statusConfig: Record<
  NodeStatus,
  { icon: typeof Circle; color: string; bgColor: string }
> = {
  pending: {
    icon: Circle,
    color: "text-[var(--text-muted)]",
    bgColor: "bg-[var(--bg-tertiary)]",
  },
  running: {
    icon: Loader2,
    color: "text-[var(--accent-primary)]",
    bgColor: "bg-[var(--accent-light)]",
  },
  complete: {
    icon: CheckCircle2,
    color: "text-[var(--success)]",
    bgColor: "bg-[var(--success-light)]",
  },
  error: {
    icon: XCircle,
    color: "text-[var(--danger)]",
    bgColor: "bg-[var(--danger-light)]",
  },
};

export function NodeBadge({ status, label, className }: NodeBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon
        className={cn("h-3 w-3", status === "running" && "animate-spin")}
      />
      {label}
    </span>
  );
}
