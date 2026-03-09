export type TransactionType = "inflow" | "outflow";

export type TransactionCategory =
  | "revenue"
  | "opex"
  | "capex"
  | "payroll"
  | "tax"
  | "vendor_payment";

export type BusinessUnit = "north" | "south" | "west" | "corporate";

export type ScenarioType = "optimistic" | "base" | "pessimistic" | "consensus";

export interface CashFlowTransaction {
  id: string;
  date: string;
  amountInr: number;
  type: TransactionType;
  category: TransactionCategory;
  businessUnit: BusinessUnit;
  description: string;
  vendorId?: string;
  isForecast: boolean;
  confidence?: number;
}

export interface CleanedTransaction {
  id: string;
  date: string;
  amountInr: number;
  type: TransactionType;
  category: TransactionCategory;
  businessUnit: BusinessUnit;
  isOutlier: boolean;
  seasonalIndex?: number;
}

export interface AnalysisResult {
  trendDirection: "up" | "down" | "flat";
  trendSlope: number;
  seasonalityDetected: boolean;
  seasonalPeaks: string[];
  anomalies: Anomaly[];
  movingAverage30: number;
  movingAverage90: number;
  yoyGrowth: number;
}

export interface Anomaly {
  date: string;
  amountInr: number;
  expectedInr: number;
  zScore: number;
  category: TransactionCategory;
  description: string;
}

export interface SubAgentForecast {
  agentName: "optimist" | "analyst" | "risk-assessor";
  forecast90Day: ForecastPoint[];
  totalPredictedInr: number;
  keyAssumptions: string[];
  riskFactors: string[];
  confidenceScore: number;
}

export interface ForecastPoint {
  date: string;
  amountInr: number;
  confidence: number;
}

export interface ConsensusForecast {
  forecast90Day: ForecastPoint[];
  p10: number;
  p50: number;
  p90: number;
  agreementAreas: string[];
  disagreementAreas: string[];
  weights: Record<string, number>;
}

export interface ForecastScenario {
  type: ScenarioType;
  forecast: ForecastPoint[];
  totalInr: number;
  assumptions: string[];
}

export interface CashFlowAlert {
  type: "cash_gap" | "anomaly" | "concentration_risk" | "seasonal_trap";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  dateRange?: string;
  amountInr?: number;
}

export interface CashFlowDashboardData {
  netCashFlow: number;
  totalInflow: number;
  totalOutflow: number;
  anomalyCount: number;
  currentBalance: number;
  burnRate: number;
  runwayDays: number;
  forecastAccuracy: number;
  monthlyTrends: MonthlyTrend[];
  scenarios: ForecastScenario[];
  alerts: CashFlowAlert[];
}

export interface MonthlyTrend {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}
