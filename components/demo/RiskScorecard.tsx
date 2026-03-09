"use client";

import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

interface RiskScorecardProps {
  paymentScore: number;
  concentrationScore: number;
  creditScore: number;
  overallScore: number;
  riskLevel: string;
  className?: string;
}

function ScoreGauge({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="6"
        />
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          className="transition-all duration-1000 ease-out"
        />
        <text
          x="44"
          y="44"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg font-bold font-mono"
          fill="var(--text-primary)"
        >
          {Math.round(score)}
        </text>
      </svg>
      <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">
        {label}
      </p>
    </div>
  );
}

function getRiskBadgeVariant(level: string) {
  switch (level) {
    case "critical":
    case "high":
      return "danger" as const;
    case "medium":
      return "warning" as const;
    default:
      return "success" as const;
  }
}

export function RiskScorecard({
  paymentScore,
  concentrationScore,
  creditScore,
  overallScore,
  riskLevel,
  className,
}: RiskScorecardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-default)] bg-white p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Risk Scorecard
        </p>
        <Badge variant={getRiskBadgeVariant(riskLevel)} className="uppercase text-[10px]">
          {riskLevel} Risk
        </Badge>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4">
        <ScoreGauge label="Payment" score={paymentScore} color="#059669" />
        <ScoreGauge
          label="Concentration"
          score={concentrationScore}
          color="#d97706"
        />
        <ScoreGauge label="Credit" score={creditScore} color="#7c3aed" />
      </div>

      <div className="text-center border-t border-[var(--border-default)] pt-3">
        <p className="text-xs text-[var(--text-muted)]">Overall Risk Score</p>
        <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
          {Math.round(overallScore)}
          <span className="text-sm text-[var(--text-muted)] font-normal">
            /100
          </span>
        </p>
      </div>
    </div>
  );
}
