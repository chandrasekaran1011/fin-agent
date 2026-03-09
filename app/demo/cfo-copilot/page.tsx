"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "@/components/demo/ChatInterface";
import { AgentTracePanel } from "@/components/agent/AgentTracePanel";
import { GraphVisualizer } from "@/components/agent/GraphVisualizer";
import { TodoProgressPanel } from "@/components/agent/TodoProgressPanel";
import { SubagentCard } from "@/components/agent/SubagentCard";
import { SemanticSearchBadge } from "@/components/demo/SemanticSearchBadge";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useAgentGraph } from "@/hooks/useAgentGraph";

const COPILOT_NODES = [
  "parse",
  "route",
  "data",
  "semantic",
  "chart",
  "narrative",
  "synthesize",
  "save",
];

const SUGGESTED_QUESTIONS = [
  "Why did EBITDA drop in Q3?",
  "What's our biggest cash risk this quarter?",
  "Which vendor has the highest exposure?",
  "Forecast cash position for next 30 days?",
  "Which invoices are overdue by 60+ days?",
];

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isStreaming?: boolean;
}

export default function CFOCopilotDemoPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);

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

  const statusMap = useAgentGraph(traceLog, COPILOT_NODES);

  const handleSend = useCallback(
    (message: string) => {
      setMessages((prev) => [...prev, { role: "user", content: message }]);

      startAgent("/api/agents/copilot", { prompt: message });

      // Simulate assistant response after a delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm analyzing your financial data across multiple sources to answer your question. Let me query the AR database, cash flow records, and search our knowledge base for relevant context...",
            sources: ["AR Database", "Cash Flow DB", "Knowledge Base"],
            isStreaming: true,
          },
        ]);
      }, 1500);
    },
    [startAgent]
  );

  return (
    <div className="grid grid-cols-[280px_1fr_280px] gap-4 min-h-[calc(100vh-8rem)]">
      {/* Left Panel */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Suggested Questions
          </p>
          <div className="space-y-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isRunning}
                className="w-full text-left rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-white p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--info)]" />
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Knowledge Base Active
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <SemanticSearchBadge source="47 docs indexed" />
            <SemanticSearchBadge source="FAISS" />
          </div>
        </div>

        <TodoProgressPanel todos={todos} />
        <SubagentCard subagents={subagents} />

        {error && (
          <Badge variant="danger" className="w-full justify-center">
            {error}
          </Badge>
        )}
      </div>

      {/* Center Panel */}
      <ChatInterface
        messages={messages}
        onSend={handleSend}
        isLoading={isRunning}
        suggestedQuestions={messages.length === 0 ? SUGGESTED_QUESTIONS : undefined}
      />

      {/* Right Panel */}
      <div className="space-y-4">
        <AgentTracePanel
          traceLog={traceLog}
          isRunning={isRunning}
          provider={provider}
        />
        <GraphVisualizer nodes={COPILOT_NODES} statusMap={statusMap} />
      </div>
    </div>
  );
}
