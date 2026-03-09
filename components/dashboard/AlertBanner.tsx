"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface AlertBannerProps {
  message: string;
  severity?: "warning" | "danger" | "info";
  dismissible?: boolean;
  className?: string;
}

const severityStyles = {
  warning: "bg-[var(--warning-light)] border-[var(--warning)] text-[var(--warning)]",
  danger: "bg-[var(--danger-light)] border-[var(--danger)] text-[var(--danger)]",
  info: "bg-[var(--info-light)] border-[var(--info)] text-[var(--info)]",
};

export function AlertBanner({
  message,
  severity = "warning",
  dismissible = true,
  className,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm",
        severityStyles[severity],
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 hover:bg-black/5 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
