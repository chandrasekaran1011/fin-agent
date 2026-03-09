export type NodeStatus = "pending" | "running" | "complete" | "error";

export type TodoItemStatus = "pending" | "in_progress" | "completed";

export interface TodoItem {
  id: string;
  content: string;
  status: TodoItemStatus;
}

export interface TraceEntry {
  node: string;
  status: "started" | "complete" | "error";
  message: string;
  timestamp: number;
  durationMs?: number;
  outputSummary?: string;
}

export interface SubagentInfo {
  name: string;
  description: string;
  status: NodeStatus;
  result?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface InterruptData {
  toolName: string;
  pendingItems: unknown[];
  threadId: string;
}

export type AgentSSEEvent =
  | { type: "session_start"; threadId: string; provider: string; timestamp: number }
  | { type: "tool_call"; tools: string[]; args?: Record<string, unknown>; timestamp: number }
  | { type: "tool_result"; tool: string; content: string; timestamp: number }
  | { type: "token"; content: string; timestamp: number }
  | { type: "todo_update"; todos: TodoItem[]; timestamp: number }
  | { type: "subagent_start"; name: string; description: string; timestamp: number }
  | { type: "subagent_complete"; name: string; result: string; timestamp: number }
  | { type: "interrupt"; toolName: string; pendingItems: unknown[]; threadId: string; timestamp: number }
  | { type: "agent_complete"; threadId: string; timestamp: number }
  | { type: "agent_error"; message: string; timestamp: number };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  chartSpec?: RechartsChartSpec;
  citations?: Citation[];
  semanticSources?: SemanticSource[];
}

export interface Citation {
  source: string;
  excerpt: string;
  relevance: number;
}

export interface SemanticSource {
  docId: string;
  title: string;
  category: string;
  score: number;
}

export interface RechartsChartSpec {
  type: "line" | "area" | "bar" | "pie";
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  title?: string;
}
