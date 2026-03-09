"use client";

import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
      <div className="rounded-xl border border-[var(--border-default)] bg-white p-8 text-center max-w-md">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
