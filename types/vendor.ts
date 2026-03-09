export type VendorCategory =
  | "IT"
  | "Logistics"
  | "Manufacturing"
  | "Services"
  | "Utilities";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  paymentTermsDays: number;
  creditLimitInr: number;
  outstandingBalance: number;
  avgDaysToPay?: number;
  latePaymentCount: number;
  totalTransactions: number;
  riskScore?: number;
  riskLevel?: RiskLevel;
  lastAssessedAt?: string;
}

export interface PaymentPatternAnalysis {
  avgDaysToPay: number;
  medianDaysToPay: number;
  stdDevDays: number;
  trendDirection: "improving" | "deteriorating" | "stable" | "cyclical";
  latePaymentRate: number;
  earlyPaymentRate: number;
  paymentHistory: PaymentHistoryPoint[];
  narrative: string;
}

export interface PaymentHistoryPoint {
  month: string;
  avgDaysToPay: number;
  lateCount: number;
  totalCount: number;
}

export interface ConcentrationAnalysis {
  vendorSharePercent: number;
  categorySharePercent: number;
  totalAPExposureInr: number;
  vendorExposureInr: number;
  concentrationLevel: "low" | "medium" | "high";
  topVendorsByExposure: VendorExposure[];
}

export interface VendorExposure {
  vendorId: string;
  vendorName: string;
  exposureInr: number;
  sharePercent: number;
}

export interface VendorRiskAssessment {
  id: string;
  vendorId: string;
  assessedAt: string;
  paymentScore: number;
  concentrationScore: number;
  creditScore: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  recommendation: string;
  agentReasoning: string;
}

export interface RiskReport {
  executiveSummary: string;
  keyRiskFactors: string[];
  recommendation: string;
  suggestedActions: string[];
  paymentScore: number;
  concentrationScore: number;
  creditScore: number;
  overallScore: number;
  riskLevel: RiskLevel;
}

export interface VendorDashboardData {
  totalVendors: number;
  highRiskCount: number;
  criticalCount: number;
  avgRiskScore: number;
  vendors: Vendor[];
  riskDistribution: Record<RiskLevel, number>;
  topRiskVendors: Vendor[];
  recentAssessments: VendorRiskAssessment[];
  concentrationAlerts: ConcentrationAlert[];
  heatmapData: HeatmapCell[];
}

export interface ConcentrationAlert {
  vendorName: string;
  sharePercent: number;
  level: "medium" | "high";
}

export interface HeatmapCell {
  vendorId: string;
  vendorName: string;
  category: VendorCategory;
  riskScore: number;
  score: number;
  riskLevel: RiskLevel;
}
