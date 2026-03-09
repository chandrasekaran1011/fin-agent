import type { AgentSSEEvent } from "@/types/agent";

export function sessionStartEvent(
  threadId: string,
  provider: string
): AgentSSEEvent {
  return {
    type: "session_start",
    threadId,
    provider,
    timestamp: Date.now(),
  };
}

export function toolCallEvent(
  tools: string[],
  args?: Record<string, unknown>
): AgentSSEEvent {
  return {
    type: "tool_call",
    tools,
    args,
    timestamp: Date.now(),
  };
}

export function toolResultEvent(
  tool: string,
  content: string
): AgentSSEEvent {
  return {
    type: "tool_result",
    tool,
    content,
    timestamp: Date.now(),
  };
}

export function tokenEvent(content: string): AgentSSEEvent {
  return {
    type: "token",
    content,
    timestamp: Date.now(),
  };
}

export function agentCompleteEvent(threadId: string): AgentSSEEvent {
  return {
    type: "agent_complete",
    threadId,
    timestamp: Date.now(),
  };
}

export function agentErrorEvent(message: string): AgentSSEEvent {
  return {
    type: "agent_error",
    message,
    timestamp: Date.now(),
  };
}

export function interruptEvent(
  toolName: string,
  pendingItems: unknown[],
  threadId: string
): AgentSSEEvent {
  return {
    type: "interrupt",
    toolName,
    pendingItems,
    threadId,
    timestamp: Date.now(),
  };
}
