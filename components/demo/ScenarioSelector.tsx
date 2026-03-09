"use client";

import { cn } from "@/lib/utils/cn";

interface ScenarioSelectorProps {
  selected: string;
  onSelect: (scenario: string) => void;
  className?: string;
}

const scenarios = [
  { id: "optimistic", label: "Optimistic", color: "bg-emerald-500" },
  { id: "base", label: "Base Case", color: "bg-indigo-500" },
  { id: "pessimistic", label: "Pessimistic", color: "bg-red-500" },
];

export function ScenarioSelector({
  selected,
  onSelect,
  className,
}: ScenarioSelectorProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {scenarios.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-150",
            selected === s.id
              ? "border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)] font-medium"
              : "border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", s.color)} />
          {s.label}
        </button>
      ))}
    </div>
  );
}
