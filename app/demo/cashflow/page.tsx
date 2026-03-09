"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DebatePanel } from "@/components/demo/DebatePanel";
import { ScenarioSelector } from "@/components/demo/ScenarioSelector";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { AgentTracePanel } from "@/components/agent/AgentTracePanel";
import { GraphVisualizer } from "@/components/agent/GraphVisualizer";
import { TodoProgressPanel } from "@/components/agent/TodoProgressPanel";
import { SubagentCard } from "@/components/agent/SubagentCard";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useAgentGraph } from "@/hooks/useAgentGraph";

const CF_NODES = [
  "collect",
  "clean",
  "analyze",
  "debate",
  "consensus",
  "scenario",
  "alert",
  "complete",
];

const BUSINESS_UNITS = ["all", "north", "south", "west", "corporate"];

export default function CashFlowDemoPage() {
  const [businessUnit, setBusinessUnit] = useState("all");
  const [scenario, setScenario] = useState("base");

  const {
    traceLog,
    todos,
    subagents,
    isRunning,
    isComplete,
    error,
    provider,
    startAgent,
    resetAgent,
  } = useAgentStream();

  const statusMap = useAgentGraph(traceLog, CF_NODES);

  const handleRun = () => {
    startAgent("/api/agents/cashflow", { businessUnit });
  };

  const debateAgents = [
    {
      name: "optimist",
      status: (subagents.find((s) => s.name === "optimist")?.status ?? "pending") as "pending" | "running" | "complete",
      forecast: subagents.find((s) => s.name === "optimist")?.result,
      keyAssumption: "Revenue growth continues at 28% YoY",
      confidence: 78,
    },
    {
      name: "analyst",
      status: (subagents.find((s) => s.name === "analyst")?.status ?? "pending") as "pending" | "running" | "complete",
      forecast: subagents.find((s) => s.name === "analyst")?.result,
      keyAssumption: "Historical averages with seasonal adjustment",
      confidence: 85,
    },
    {
      name: "risk-assessor",
      status: (subagents.find((s) => s.name === "risk-assessor")?.status ?? "pending") as "pending" | "running" | "complete",
      forecast: subagents.find((s) => s.name === "risk-assessor")?.result,
      keyAssumption: "Cash gap risk in next 45 days",
      confidence: 72,
    },
  ];

  const sampleChartData = Array.from({ length: 12 }, (_, i) => ({
    label: `Month ${i + 1}`,
    value: 2000000 + Math.random() * 3000000 + (i * 200000),
  }));

  return (
    <div className="grid grid-cols-[280px_1fr_280px] gap-4 min-h-[calc(100vh-8rem)]">
      {/* Left Panel */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Configuration
          </p>

          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
            Business Unit
          </label>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {BUSINESS_UNITS.map((bu) => (
              <button
                key={bu}
                onClick={() => setBusinessUnit(bu)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  businessUnit === bu
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]"
                }`}
              >
                {bu}
              </button>
            ))}
          </div>

          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running CashSight...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run CashSight Agents
              </>
            )}
          </Button>

          {error && (
            <Badge variant="danger" className="mt-2 w-full justify-center">
              {error}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={resetAgent}
            className="w-full mt-2"
          >
            Reset
          </Button>
        </div>

        <TodoProgressPanel todos={todos} />
        <SubagentCard subagents={subagents} />
      </div>

      {/* Center Panel */}
      <div className="space-y-4 overflow-y-auto">
        <DebatePanel
          agents={debateAgents}
          consensus={isComplete ? "Consensus forecast synthesized from 3 subagent perspectives. Weighted by confidence scores." : undefined}
        />

        <ScenarioSelector selected={scenario} onSelect={setScenario} />

        {(isComplete || traceLog.length > 3) && (
          <TrendChart
            data={sampleChartData}
            dataKey="value"
            label={`${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario — 90-Day Forecast`}
            color={
              scenario === "optimistic"
                ? "#059669"
                : scenario === "pessimistic"
                  ? "#dc2626"
                  : "#4f46e5"
            }
          />
        )}

        {!isRunning && !isComplete && traceLog.length === 0 && (
          <div className="rounded-xl border border-[var(--border-default)] bg-white p-12 text-center text-sm text-[var(--text-muted)]">
            Select a business unit and run the agents to see the multi-agent debate and consensus forecast
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="space-y-4">
        <AgentTracePanel
          traceLog={traceLog}
          isRunning={isRunning}
          provider={provider}
        />
        <GraphVisualizer nodes={CF_NODES} statusMap={statusMap} />
      </div>
    </div>
  );
}
