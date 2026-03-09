"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ApprovalItem {
  id: string;
  label: string;
  description?: string;
  amount?: string;
}

interface ApprovalGateProps {
  items: ApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onApproveAll?: () => void;
  className?: string;
}

export function ApprovalGate({
  items,
  onApprove,
  onReject,
  onApproveAll,
  className,
}: ApprovalGateProps) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border-2 border-[var(--warning)] bg-[var(--warning-light)] p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
        <p className="text-sm font-semibold text-[var(--warning)]">
          Human Approval Required
        </p>
        <span className="text-xs text-[var(--text-secondary)]">
          {items.length} item{items.length > 1 ? "s" : ""} pending
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-white p-3 border border-[var(--border-default)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-[var(--text-secondary)]">
                  {item.description}
                </p>
              )}
              {item.amount && (
                <p className="text-xs font-mono text-[var(--text-primary)] mt-0.5">
                  {item.amount}
                </p>
              )}
            </div>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(item.id)}
                className="gap-1 text-[var(--danger)] hover:bg-[var(--danger-light)]"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(item.id)}
                className="gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>

      {onApproveAll && items.length > 1 && (
        <Button onClick={onApproveAll} className="w-full" size="sm">
          Approve All ({items.length})
        </Button>
      )}
    </motion.div>
  );
}
