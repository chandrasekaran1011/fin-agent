"use client";

import { AppNav } from "@/components/layout/AppNav";
import { DemoStepper } from "@/components/layout/DemoStepper";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <AppNav />
      <div className="border-b border-[var(--border-default)] bg-white px-6 py-3">
        <DemoStepper />
      </div>
      <main className="p-6">{children}</main>
    </div>
  );
}
