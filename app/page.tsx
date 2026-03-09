"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileCheck,
  TrendingUp,
  ShieldAlert,
  MessageSquare,
  ArrowRight,
  BarChart3,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const modules = [
  {
    id: "ar",
    name: "AutoRecon",
    description: "AI-powered AR reconciliation with invoice matching and approval workflows",
    icon: FileCheck,
    dashboardHref: "/dashboard/ar",
    demoHref: "/demo/ar-recon",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "cashflow",
    name: "CashSight",
    description: "Multi-agent cash flow forecasting with debate-driven consensus",
    icon: TrendingUp,
    dashboardHref: "/dashboard/cashflow",
    demoHref: "/demo/cashflow",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "vendor",
    name: "VendorGuard",
    description: "Vendor risk intelligence with payment scoring and concentration analysis",
    icon: ShieldAlert,
    dashboardHref: "/dashboard/vendor",
    demoHref: "/demo/vendor-risk",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "copilot",
    name: "BoardBrief",
    description: "CFO co-pilot with semantic search, data queries, and narrative generation",
    icon: MessageSquare,
    dashboardHref: "/dashboard/copilot",
    demoHref: "/demo/cfo-copilot",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const provider =
    process.env.NEXT_PUBLIC_LLM_PROVIDER === "azure"
      ? "Azure OpenAI"
      : "OpenAI";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Powered by {provider}
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-4"
          >
            FinAgent{" "}
            <span className="text-[var(--accent-primary)]">OS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-12"
          >
            Agentic Finance Intelligence Platform — 4 live AI demos for CFOs and
            finance leaders
          </motion.p>

          {/* Module Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto"
          >
            {modules.map((mod) => (
              <motion.div
                key={mod.id}
                variants={item}
                className="group rounded-xl border border-[var(--border-default)] bg-white p-6 text-left transition-all duration-200 hover:shadow-lg hover:border-[var(--border-hover)] hover:-translate-y-1"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${mod.bgColor} flex items-center justify-center`}
                  >
                    <mod.icon className={`h-5 w-5 ${mod.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={mod.dashboardHref} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={mod.demoHref} className="flex-1">
                    <Button size="sm" className="w-full gap-1">
                      <Play className="h-3.5 w-3.5" />
                      Run Demo
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-8 text-xs text-[var(--text-muted)] font-mono">
          <span>500 invoices seeded</span>
          <span className="h-3 w-px bg-[var(--border-default)]" />
          <span>50 vendors tracked</span>
          <span className="h-3 w-px bg-[var(--border-default)]" />
          <span>24 months history</span>
          <span className="h-3 w-px bg-[var(--border-default)]" />
          <span>47 knowledge docs</span>
        </div>
      </div>
    </div>
  );
}
