"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";

interface InvoiceMatchCardProps {
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  status: string;
  confidence?: number;
  discrepancyAmount?: number;
  discrepancyReason?: string;
  className?: string;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "matched":
    case "approved":
      return "success" as const;
    case "flagged":
      return "warning" as const;
    case "rejected":
      return "danger" as const;
    default:
      return "secondary" as const;
  }
}

export function InvoiceMatchCard({
  invoiceNumber,
  vendorName,
  amount,
  status,
  confidence,
  discrepancyAmount,
  discrepancyReason,
  className,
}: InvoiceMatchCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border-default)] bg-white p-4 transition-all duration-200 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {invoiceNumber}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{vendorName}</p>
        </div>
        <Badge variant={getStatusVariant(status)}>{status}</Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-mono text-[var(--text-primary)]">
          {formatCurrency(amount)}
        </span>
        {confidence !== undefined && (
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              confidence >= 95
                ? "text-[var(--success)]"
                : confidence >= 80
                  ? "text-[var(--warning)]"
                  : "text-[var(--danger)]"
            )}
          >
            {confidence}% match
          </span>
        )}
      </div>

      {discrepancyAmount !== undefined && discrepancyAmount > 0 && (
        <div className="mt-2 rounded-md bg-[var(--warning-light)] px-3 py-1.5 text-xs text-[var(--warning)]">
          Discrepancy: {formatCurrency(discrepancyAmount)}
          {discrepancyReason && ` — ${discrepancyReason}`}
        </div>
      )}
    </div>
  );
}
