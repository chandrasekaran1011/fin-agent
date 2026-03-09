"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

interface VendorOption {
  id: string;
  name: string;
  category: string;
  riskLevel?: string;
}

interface VendorSearchPanelProps {
  vendors: VendorOption[];
  selected: VendorOption | null;
  onSelect: (vendor: VendorOption) => void;
  className?: string;
}

export function VendorSearchPanel({
  vendors,
  selected,
  onSelect,
  className,
}: VendorSearchPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return vendors.slice(0, 10);
    const q = query.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }, [vendors, query]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--border-default)] bg-white pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20"
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[var(--border-default)] bg-white p-1">
        {filtered.map((vendor) => (
          <button
            key={vendor.id}
            onClick={() => onSelect(vendor)}
            className={cn(
              "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors",
              selected?.id === vendor.id
                ? "bg-[var(--accent-light)] text-[var(--accent-primary)]"
                : "hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            )}
          >
            <div>
              <p className="font-medium">{vendor.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{vendor.category}</p>
            </div>
            {vendor.riskLevel && (
              <Badge
                variant={
                  vendor.riskLevel === "critical" || vendor.riskLevel === "high"
                    ? "danger"
                    : vendor.riskLevel === "medium"
                      ? "warning"
                      : "success"
                }
                className="text-[10px]"
              >
                {vendor.riskLevel}
              </Badge>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">
            No vendors found
          </p>
        )}
      </div>

      {selected && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
          <p className="text-xs text-[var(--text-muted)] mb-1">Selected</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {selected.name}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {selected.category}
          </p>
        </div>
      )}
    </div>
  );
}
