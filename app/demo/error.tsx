"use client";

import { Button } from "@/components/ui/button";

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="rounded-xl border border-[var(--danger-light)] bg-[var(--danger-light)] p-6 text-center max-w-md">
        <h2 className="text-lg font-semibold text-[var(--danger)] mb-2">
          Demo Error
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {error.message || "Failed to run agent demo"}
        </p>
        <Button onClick={reset} variant="outline">
          Retry
        </Button>
      </div>
    </div>
  );
}
