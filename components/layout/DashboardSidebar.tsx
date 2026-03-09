"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  TrendingUp,
  ShieldAlert,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const sidebarItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/ar", label: "AR Reconciliation", icon: FileCheck },
  { href: "/dashboard/cashflow", label: "Cash Flow", icon: TrendingUp },
  { href: "/dashboard/vendor", label: "Vendor Risk", icon: ShieldAlert },
  { href: "/dashboard/copilot", label: "Co-Pilot", icon: MessageSquare },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-secondary)] min-h-[calc(100vh-3.5rem)]">
      <nav className="flex flex-col gap-1 p-3">
        <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Dashboards
        </p>
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                isActive
                  ? "bg-[var(--accent-light)] text-[var(--accent-primary)] font-medium border-l-2 border-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
