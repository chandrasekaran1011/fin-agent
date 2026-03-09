export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName?: string;
  amountInr: number;
  taxAmountInr: number;
  totalAmountInr: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  matchConfidence?: number;
  matchedTxId?: string;
  discrepancyAmountInr: number;
  discrepancyReason?: string;
  agentNotes?: string;
  lineItems?: LineItem[];
}

export type InvoiceStatus =
  | "open"
  | "matched"
  | "flagged"
  | "approved"
  | "rejected"
  | "disputed";

export interface LineItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface BankTransaction {
  id: string;
  date: string;
  amountInr: number;
  reference: string;
  vendorName?: string;
  description: string;
}

export interface ParsedInvoice {
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: LineItem[];
  dueDate: string;
}

export interface MatchResult {
  invoiceId: string;
  transactionId: string;
  confidence: number;
  method: "exact" | "fuzzy" | "semantic";
  amountDiff: number;
  dateDiffDays: number;
}

export interface FlaggedItem {
  invoiceId: string;
  transactionId?: string;
  reason: "amount_mismatch" | "date_mismatch" | "duplicate" | "missing_transaction" | "low_confidence";
  discrepancyAmount: number;
  severity: "low" | "medium" | "high";
  details: string;
}

export interface ResolvedItem {
  flaggedItemId: string;
  invoiceId: string;
  suggestedAction: "approve" | "reject" | "investigate" | "adjust";
  reasoning: string;
  confidence: number;
  priority: "low" | "medium" | "high";
}

export interface ApprovalItem {
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  discrepancy: string;
  resolution: string;
  confidence: number;
}

export interface ApprovalDecision {
  invoiceId: string;
  decision: "approve" | "reject";
  notes?: string;
}

export interface ReconciliationSummary {
  totalInvoices: number;
  matched: number;
  flagged: number;
  approved: number;
  rejected: number;
  totalAmountInr: number;
  discrepancyAmountInr: number;
  avgConfidence: number;
}

export interface ARDashboardData {
  totalInvoices: number;
  matchedInvoices: number;
  flaggedInvoices: number;
  matchRate: number;
  recentInvoices: Invoice[];
  summary: ReconciliationSummary;
  agingBuckets: AgingBucket[];
  recentMatches: MatchResult[];
  openItems: Invoice[];
}

export interface AgingBucket {
  label: string;
  count: number;
  amountInr: number;
  percentage: number;
}
