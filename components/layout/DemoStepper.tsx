"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileCheck, TrendingUp, ShieldAlert, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const demoItems = [
  { href: "/demo/ar-recon", label: "AR Recon", icon: FileCheck },
  { href: "/demo/cashflow", label: "Cash Flow", icon: TrendingUp },
  { href: "/demo/vendor-risk", label: "Vendor Risk", icon: ShieldAlert },
  { href: "/demo/cfo-copilot", label: "CFO Co-Pilot", icon: MessageSquare },
];

export function DemoStepper() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-[var(--bg-tertiary)] p-1">
      {demoItems.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-all duration-150",
              isActive
                ? "bg-white text-[var(--accent-primary)] font-medium shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-xs font-medium">
              {index + 1}
            </span>
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
