"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Play, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/demo/ar-recon", label: "Demos", icon: Play },
];

export function AppNav() {
  const pathname = usePathname();
  const provider = process.env.NEXT_PUBLIC_LLM_PROVIDER === "azure"
    ? "Azure OpenAI"
    : "OpenAI";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-default)] bg-white/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)] tracking-tight">
              FinAgent OS
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-[var(--accent-light)] text-[var(--accent-primary)] font-medium"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {provider}
          </Badge>
        </div>
      </div>
    </header>
  );
}
