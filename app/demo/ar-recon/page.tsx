"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUploadZone } from "@/components/demo/FileUploadZone";
import { InvoiceMatchCard } from "@/components/demo/InvoiceMatchCard";
import { ApprovalGate } from "@/components/demo/ApprovalGate";
import { AgentTracePanel } from "@/components/agent/AgentTracePanel";
import { GraphVisualizer } from "@/components/agent/GraphVisualizer";
import { TodoProgressPanel } from "@/components/agent/TodoProgressPanel";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useAgentGraph } from "@/hooks/useAgentGraph";

const AR_NODES = [
  "ingest",
  "parse",
  "match",
  "flag",
  "resolve",
  "approve",
  "complete",
];

const BATCH_SIZES = [10, 25, 47];

export default function ARReconDemoPage() {
  const [batchSize, setBatchSize] = useState(25);
  const [loaded, setLoaded] = useState(false);

  const {
    traceLog,
    todos,
    isRunning,
    isComplete,
    interrupt,
    error,
    threadId,
    provider,
    startAgent,
    resumeAgent,
    resetAgent,
  } = useAgentStream();

  const statusMap = useAgentGraph(traceLog, AR_NODES);

  const handleRun = () => {
    startAgent("/api/agents/ar", { batchSize });
  };

  const handleApprove = (id: string) => {
    if (threadId) {
      resumeAgent("/api/agents/ar", threadId, {
        decisions: [{ id, action: "approve" }],
      });
    }
  };

  const handleReject = (id: string) => {
    if (threadId) {
      resumeAgent("/api/agents/ar", threadId, {
        decisions: [{ id, action: "reject" }],
      });
    }
  };

  return (
    <div className="grid grid-cols-[280px_1fr_280px] gap-4 min-h-[calc(100vh-8rem)]">
      {/* Left Panel */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Invoice Batch
          </p>

          <div className="flex gap-1.5 mb-4">
            {BATCH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBatchSize(size)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  batchSize === size
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-default)]"
                }`}
              >
                {size} invoices
              </button>
            ))}
          </div>

          <FileUploadZone
            onUpload={() => setLoaded(true)}
            isLoading={false}
          />

          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full mt-3 gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running AutoRecon...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run AutoRecon Agent
              </>
            )}
          </Button>

          {isRunning && (
            <Badge variant="info" className="mt-2 w-full justify-center">
              Agent Running
            </Badge>
          )}
          {isComplete && (
            <Badge variant="success" className="mt-2 w-full justify-center">
              Reconciliation Complete
            </Badge>
          )}
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
        <div className="rounded-xl border border-[var(--border-default)] bg-white p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Reconciliation Results
          </p>

          {!isRunning && !isComplete && traceLog.length === 0 && (
            <div className="text-center py-12 text-sm text-[var(--text-muted)]">
              Configure batch size and run the agent to see results
            </div>
          )}

          {traceLog.length > 0 && (
            <div className="space-y-2">
              {traceLog
                .filter((t) => t.outputSummary)
                .slice(-10)
                .map((entry, i) => (
                  <InvoiceMatchCard
                    key={i}
                    invoiceNumber={`INV-${String(i + 1).padStart(4, "0")}`}
                    vendorName={entry.node}
                    amount={Math.random() * 5000000}
                    status={entry.status === "complete" ? "matched" : "pending"}
                    confidence={Math.round(70 + Math.random() * 30)}
                  />
                ))}
            </div>
          )}

          {interrupt && (
            <ApprovalGate
              items={[
                {
                  id: "1",
                  label: "Invoice batch approval",
                  description: "Review flagged items before finalizing",
                },
              ]}
              onApprove={handleApprove}
              onReject={handleReject}
              className="mt-4"
            />
          )}

          {isComplete && (
            <div className="mt-4 rounded-lg bg-[var(--success-light)] p-4 text-sm text-[var(--success)]">
              Reconciliation complete. {batchSize} invoices processed.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="space-y-4">
        <AgentTracePanel
          traceLog={traceLog}
          isRunning={isRunning}
          provider={provider}
        />
        <GraphVisualizer nodes={AR_NODES} statusMap={statusMap} />
      </div>
    </div>
  );
}
