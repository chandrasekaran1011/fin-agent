"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VendorSearchPanel } from "@/components/demo/VendorSearchPanel";
import { RiskScorecard } from "@/components/demo/RiskScorecard";
import { AgentTracePanel } from "@/components/agent/AgentTracePanel";
import { GraphVisualizer } from "@/components/agent/GraphVisualizer";
import { TodoProgressPanel } from "@/components/agent/TodoProgressPanel";
import { StreamingText } from "@/components/agent/StreamingText";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useAgentGraph } from "@/hooks/useAgentGraph";

const VR_NODES = [
  "fetch",
  "transactions",
  "score",
  "pattern",
  "concentration",
  "classify",
  "report",
  "save",
];

const SAMPLE_VENDORS = [
  { id: "v1", name: "Tata Consultancy Services", category: "IT", riskLevel: "low" },
  { id: "v2", name: "Reliance Industries", category: "Manufacturing", riskLevel: "medium" },
  { id: "v3", name: "Wipro Technologies", category: "IT", riskLevel: "low" },
  { id: "v4", name: "Bharti Airtel", category: "Services", riskLevel: "medium" },
  { id: "v5", name: "Adani Logistics", category: "Logistics", riskLevel: "high" },
  { id: "v6", name: "JSW Steel", category: "Manufacturing", riskLevel: "critical" },
  { id: "v7", name: "Infosys Limited", category: "IT", riskLevel: "low" },
  { id: "v8", name: "HCL Technologies", category: "IT", riskLevel: "low" },
  { id: "v9", name: "Mahindra Logistics", category: "Logistics", riskLevel: "medium" },
  { id: "v10", name: "NTPC Limited", category: "Utilities", riskLevel: "low" },
];

export default function VendorRiskDemoPage() {
  const [selectedVendor, setSelectedVendor] = useState<{
    id: string;
    name: string;
    category: string;
    riskLevel?: string;
  } | null>(null);

  const {
    traceLog,
    todos,
    isRunning,
    isComplete,
    error,
    provider,
    startAgent,
    resetAgent,
  } = useAgentStream();

  const statusMap = useAgentGraph(traceLog, VR_NODES);

  const handleRun = () => {
    if (!selectedVendor) return;
    startAgent("/api/agents/vendor", {
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
    });
  };

  const lastTrace = traceLog.length > 0 ? traceLog[traceLog.length - 1] : null;

  return (
    <div className="grid grid-cols-[280px_1fr_280px] gap-4 min-h-[calc(100vh-8rem)]">
      {/* Left Panel */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Select Vendor
          </p>

          <VendorSearchPanel
            vendors={SAMPLE_VENDORS}
            selected={selectedVendor}
            onSelect={setSelectedVendor}
          />

          <Button
            onClick={handleRun}
            disabled={isRunning || !selectedVendor}
            className="w-full mt-3 gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deep Scanning...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Deep Scan Vendor
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
      </div>

      {/* Center Panel */}
      <div className="space-y-4 overflow-y-auto">
        {!selectedVendor && traceLog.length === 0 && (
          <div className="rounded-xl border border-[var(--border-default)] bg-white p-12 text-center text-sm text-[var(--text-muted)]">
            Select a vendor from the panel to begin risk assessment
          </div>
        )}

        {selectedVendor && (
          <div className="rounded-xl border border-[var(--border-default)] bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {selectedVendor.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedVendor.category}
                </p>
              </div>
              {selectedVendor.riskLevel && (
                <Badge
                  variant={
                    selectedVendor.riskLevel === "critical" || selectedVendor.riskLevel === "high"
                      ? "danger"
                      : selectedVendor.riskLevel === "medium"
                        ? "warning"
                        : "success"
                  }
                  className="uppercase"
                >
                  {selectedVendor.riskLevel} risk
                </Badge>
              )}
            </div>
          </div>
        )}

        {isComplete && (
          <>
            <RiskScorecard
              paymentScore={72}
              concentrationScore={45}
              creditScore={68}
              overallScore={62}
              riskLevel={selectedVendor?.riskLevel ?? "medium"}
            />

            <div className="rounded-xl border border-[var(--border-default)] bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
                Agent Recommendation
              </p>
              <StreamingText
                text={`Based on comprehensive analysis of ${selectedVendor?.name ?? "the vendor"}'s payment history, concentration exposure, and credit signals, we recommend maintaining the current relationship with enhanced monitoring. Key risk factors include payment delays averaging 12 days beyond terms and a concentration ratio of 18% of total AP. Suggested actions: 1) Renegotiate payment terms to Net 45, 2) Diversify spend across 2-3 alternative vendors, 3) Set up automated payment delay alerts.`}
                className="text-sm text-[var(--text-primary)]"
              />
            </div>
          </>
        )}

        {isRunning && lastTrace && (
          <div className="rounded-xl border border-[var(--border-default)] bg-white p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Processing: {lastTrace.message}
            </p>
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
        <GraphVisualizer nodes={VR_NODES} statusMap={statusMap} />
      </div>
    </div>
  );
}
