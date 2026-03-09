export interface APIResponse<T> {
  data: T;
  cachedAt?: string;
  cacheHit: boolean;
}

export interface APIError {
  message: string;
  code: string;
  statusCode: number;
}

export interface AgentStartRequest {
  prompt: string;
  threadId?: string;
  sessionId?: string;
}

export interface AgentResumeRequest {
  threadId: string;
  resume: {
    decisions: AgentDecision[];
  };
}

export interface AgentDecision {
  type: "approve" | "reject" | "edit";
  itemId?: string;
  editedArgs?: Record<string, unknown>;
}

export interface ARAgentRequest extends AgentStartRequest {
  batchSize?: number;
  invoiceStatus?: string;
}

export interface CashFlowAgentRequest extends AgentStartRequest {
  businessUnit?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface VendorAgentRequest extends AgentStartRequest {
  vendorId: string;
}

export interface CopilotAgentRequest extends AgentStartRequest {
  sessionId: string;
  question: string;
}

export interface DashboardKPIs {
  totalInvoices: number;
  matchedInvoices: number;
  flaggedInvoices: number;
  matchRate: number;
}
