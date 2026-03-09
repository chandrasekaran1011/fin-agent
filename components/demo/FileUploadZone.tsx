"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FileUploadZoneProps {
  onUpload: () => void;
  isLoading?: boolean;
  className?: string;
}

export function FileUploadZone({
  onUpload,
  isLoading,
  className,
}: FileUploadZoneProps) {
  return (
    <button
      onClick={onUpload}
      disabled={isLoading}
      className={cn(
        "w-full rounded-xl border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 text-center transition-all duration-200 hover:border-[var(--accent-primary)] hover:bg-[var(--accent-light)] disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <Upload className="h-8 w-8 mx-auto text-[var(--text-muted)] mb-2" />
      <p className="text-sm font-medium text-[var(--text-primary)]">
        {isLoading ? "Loading invoices..." : "Load Invoice Batch"}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        Click to load synthetic invoice data for demo
      </p>
    </button>
  );
}
