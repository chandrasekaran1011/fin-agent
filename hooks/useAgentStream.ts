"use client";

import { useState, useCallback, useRef } from "react";
import type {
  TraceEntry,
  TodoItem,
  SubagentInfo,
  AgentSSEEvent,
} from "@/types/agent";

interface InterruptState {
  toolName: string;
  threadId: string;
  pendingItems?: unknown[];
}

interface AgentStreamState {
  traceLog: TraceEntry[];
  todos: TodoItem[];
  subagents: SubagentInfo[];
  isRunning: boolean;
  isComplete: boolean;
  interrupt: InterruptState | null;
  error: string | null;
  threadId: string | null;
  provider: string | null;
}

interface UseAgentStreamReturn extends AgentStreamState {
  startAgent: (endpoint: string, payload: Record<string, unknown>) => void;
  resumeAgent: (
    endpoint: string,
    threadId: string,
    resume: Record<string, unknown>
  ) => void;
  resetAgent: () => void;
}

const initialState: AgentStreamState = {
  traceLog: [],
  todos: [],
  subagents: [],
  isRunning: false,
  isComplete: false,
  interrupt: null,
  error: null,
  threadId: null,
  provider: null,
};

export function useAgentStream(): UseAgentStreamReturn {
  const [state, setState] = useState<AgentStreamState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const processEvent = useCallback((eventType: string, data: string) => {
    try {
      const parsed = JSON.parse(data) as Record<string, unknown>;

      switch (eventType) {
        case "session_start":
          setState((prev) => ({
            ...prev,
            isRunning: true,
            isComplete: false,
            error: null,
            interrupt: null,
            threadId: (parsed.threadId as string) ?? prev.threadId,
            provider: (parsed.provider as string) ?? null,
          }));
          break;

        case "node_update": {
          const entry: TraceEntry = {
            node: parsed.node as string,
            status: "complete",
            message: `Node ${parsed.node} completed`,
            timestamp: (parsed.timestamp as number) ?? Date.now(),
            outputSummary:
              typeof parsed.output === "string"
                ? (parsed.output as string).slice(0, 200)
                : undefined,
          };
          setState((prev) => ({
            ...prev,
            traceLog: [...prev.traceLog, entry],
          }));
          break;
        }

        case "tool_call": {
          const toolEntry: TraceEntry = {
            node: ((parsed.tools as string[]) ?? []).join(", "),
            status: "started",
            message: `Calling tools: ${((parsed.tools as string[]) ?? []).join(", ")}`,
            timestamp: (parsed.timestamp as number) ?? Date.now(),
          };
          setState((prev) => ({
            ...prev,
            traceLog: [...prev.traceLog, toolEntry],
          }));
          break;
        }

        case "tool_result": {
          const resultEntry: TraceEntry = {
            node: parsed.tool as string,
            status: "complete",
            message: `Tool ${parsed.tool} returned result`,
            timestamp: (parsed.timestamp as number) ?? Date.now(),
            outputSummary:
              typeof parsed.content === "string"
                ? (parsed.content as string).slice(0, 200)
                : undefined,
          };
          setState((prev) => ({
            ...prev,
            traceLog: [...prev.traceLog, resultEntry],
          }));
          break;
        }

        case "token": {
          const tokenEntry: TraceEntry = {
            node: "token",
            status: "complete",
            message: parsed.content as string,
            timestamp: (parsed.timestamp as number) ?? Date.now(),
          };
          setState((prev) => ({
            ...prev,
            traceLog: [...prev.traceLog, tokenEntry],
          }));
          break;
        }

        case "todo_update":
          setState((prev) => ({
            ...prev,
            todos: (parsed.todos as TodoItem[]) ?? prev.todos,
          }));
          break;

        case "subagent_start":
          setState((prev) => ({
            ...prev,
            subagents: [
              ...prev.subagents,
              {
                name: parsed.name as string,
                description: (parsed.description as string) ?? "",
                status: "running",
              },
            ],
          }));
          break;

        case "subagent_complete":
          setState((prev) => ({
            ...prev,
            subagents: prev.subagents.map((sa) =>
              sa.name === parsed.name
                ? { ...sa, status: "complete" as const, result: parsed.result as string }
                : sa
            ),
          }));
          break;

        case "interrupt":
          setState((prev) => ({
            ...prev,
            isRunning: false,
            interrupt: {
              toolName: parsed.toolName as string,
              threadId: parsed.threadId as string,
              pendingItems: parsed.pendingItems as unknown[] | undefined,
            },
          }));
          break;

        case "agent_complete":
          setState((prev) => ({
            ...prev,
            isRunning: false,
            isComplete: true,
          }));
          break;

        case "agent_error":
          setState((prev) => ({
            ...prev,
            isRunning: false,
            error: parsed.message as string,
          }));
          break;
      }
    } catch {
      // Ignore malformed events
    }
  }, []);

  const connectSSE = useCallback(
    (endpoint: string, payload: Record<string, unknown>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            setState((prev) => ({
              ...prev,
              isRunning: false,
              error: `HTTP ${response.status}: ${response.statusText}`,
            }));
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            let currentEvent = "";
            for (const line of lines) {
              if (line.startsWith("event: ")) {
                currentEvent = line.slice(7).trim();
              } else if (line.startsWith("data: ") && currentEvent) {
                processEvent(currentEvent, line.slice(6));
                currentEvent = "";
              }
            }
          }
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setState((prev) => ({
            ...prev,
            isRunning: false,
            error: err instanceof Error ? err.message : "Connection failed",
          }));
        });
    },
    [processEvent]
  );

  const startAgent = useCallback(
    (endpoint: string, payload: Record<string, unknown>) => {
      setState({ ...initialState, isRunning: true });
      connectSSE(endpoint, payload);
    },
    [connectSSE]
  );

  const resumeAgent = useCallback(
    (
      endpoint: string,
      threadId: string,
      resume: Record<string, unknown>
    ) => {
      setState((prev) => ({
        ...prev,
        isRunning: true,
        interrupt: null,
      }));
      connectSSE(endpoint, { threadId, resume });
    },
    [connectSSE]
  );

  const resetAgent = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  return {
    ...state,
    startAgent,
    resumeAgent,
    resetAgent,
  };
}
