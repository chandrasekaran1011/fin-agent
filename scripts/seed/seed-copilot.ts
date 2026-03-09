import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const FINANCIAL_DOCUMENTS = [
  // Policies
  {
    title: "Payment Terms Policy FY2025",
    category: "policy",
    content: `Payment Terms Policy - Effective April 2025

All vendor payments must adhere to the following guidelines:

Standard Payment Terms:
- IT Services: Net 30 days from invoice receipt
- Manufacturing Supplies: Net 45 days from delivery confirmation
- Logistics Partners: Net 15 days from service completion
- Professional Services: Net 30 days, milestone-based for projects > 10L

Early Payment Discount:
- 2% discount available for payments within 10 days
- Must be pre-approved by Finance Manager for amounts > 5L
- Early payment requests processed every Tuesday and Thursday

Late Payment Penalties:
- 1.5% per month after 15 days past due
- Automatic vendor notification at 7, 15, and 30 days overdue
- Escalation to CFO for payments overdue > 45 days

Approval Matrix:
- Up to 1L: Department Manager
- 1L - 10L: Finance Manager
- 10L - 1Cr: CFO approval
- Above 1Cr: Board approval required`,
  },
  {
    title: "Credit Approval Policy",
    category: "policy",
    content: `Credit Approval and Vendor Onboarding Policy

New Vendor Credit Assessment:
1. Financial statement review (last 3 years)
2. Bank reference verification
3. Trade reference check (minimum 3 references)
4. Credit rating agency report (CRISIL/ICRA)

Credit Limit Assignment:
- Micro vendors (annual turnover < 1Cr): Max credit 5L
- Small vendors (1-10Cr turnover): Max credit 25L
- Medium vendors (10-100Cr): Max credit 1Cr
- Large vendors (>100Cr): Max credit 5Cr, board approval > 3Cr

Review Frequency:
- Annual review for all vendors with credit > 10L
- Quarterly review for vendors with risk score below 60
- Immediate review triggered by: payment default, news events, credit rating change`,
  },
  {
    title: "Expense Reimbursement Guidelines",
    category: "policy",
    content: `Employee Expense Reimbursement Policy

Travel Expenses:
- Domestic air travel: Economy class for distances > 500km
- Hotel: Up to 5000/night for metros, 3000/night for others
- Per diem: 1500/day domestic, variable international
- Local transport: Actual with receipts, max 2000/day

Entertainment:
- Client meals: Up to 2000 per person, pre-approval for > 4 persons
- Team events: 500 per person, quarterly budget per department

Technology:
- Software subscriptions: Pre-approved list only
- Hardware: Through IT procurement, not reimbursable

Submission:
- Within 15 days of expense
- All receipts required for amounts > 500
- Digital submission through expense portal`,
  },
  {
    title: "GST Compliance Framework",
    category: "policy",
    content: `GST Compliance and Filing Framework

Filing Schedule:
- GSTR-1 (Outward supplies): Monthly by 11th
- GSTR-3B (Summary return): Monthly by 20th
- GSTR-9 (Annual return): By December 31st

Input Tax Credit (ITC) Rules:
- Claim ITC only on verified invoices in GSTR-2A
- Reconcile ITC monthly with vendor submissions
- Reverse ITC for invoices not paid within 180 days

Rate Classification:
- IT Services: 18% GST
- Manufacturing goods: 12-28% based on HSN code
- Logistics: 5-18% based on service type
- Professional services: 18% GST`,
  },
  {
    title: "Treasury Management Policy",
    category: "policy",
    content: `Treasury and Cash Management Policy

Cash Position Monitoring:
- Daily cash position report by 10 AM
- Weekly 13-week cash flow forecast update
- Monthly board cash position summary

Investment Guidelines:
- Surplus cash: Fixed deposits (max 60%), liquid mutual funds (max 30%), overnight funds (min 10%)
- No single bank exposure > 25% of total investments
- Minimum 2 weeks operating expenses in current accounts

Foreign Exchange:
- Natural hedging preferred for recurring payments
- Forward contracts for confirmed exposures > USD 50K
- Options for contingent exposures

Banking Relationships:
- Primary banker: minimum 3 services
- Secondary bankers: 2-3 for competitive pricing
- Annual review of banking fees and charges`,
  },
  // Quarterly Reports
  {
    title: "Q3 FY2025 Financial Analysis",
    category: "report",
    content: `Quarterly Financial Analysis - Q3 FY2025 (Oct-Dec 2024)

Executive Summary:
The company experienced a challenging Q3 with consolidated EBITDA declining 12% QoQ primarily driven by the South business unit underperformance. Revenue grew 3% YoY but margin compression impacted profitability.

Key Highlights:
- Revenue: 42.3 Cr (vs 41.1 Cr Q2, +3% YoY)
- EBITDA: 6.8 Cr (vs 7.7 Cr Q2, -12% QoQ)
- EBITDA Margin: 16.1% (vs 18.7% Q2)
- Cash Position: 18.5 Cr (vs 22.1 Cr Q2)

South Business Unit Deep Dive:
The South unit saw a 35% EBITDA decline due to:
1. Loss of two major clients (combined 2.1 Cr annual revenue)
2. Increased operating costs from new Hyderabad office setup
3. One-time recruitment costs of 45L for new team buildout
4. Delayed project completions impacting revenue recognition

North Unit Performance:
Strong revenue growth of 28% YoY driven by new enterprise contracts. Pipeline remains healthy with 15 Cr in confirmed Q4 orders.

Cash Flow Concerns:
- Operating cash flow negative for first time in 8 quarters
- DSO increased to 52 days from 45 days
- Working capital requirements up 18% due to inventory buildup

Outlook:
Q4 expected to recover with seasonal revenue bump and South unit restructuring. Target EBITDA margin recovery to 18% by Q1 FY2026.`,
  },
  {
    title: "Q2 FY2025 Financial Analysis",
    category: "report",
    content: `Quarterly Financial Analysis - Q2 FY2025 (Jul-Sep 2024)

Revenue: 41.1 Cr (+8% YoY)
EBITDA: 7.7 Cr, Margin: 18.7%
Net Profit: 4.2 Cr

Business Unit Performance:
- North: 12.5 Cr revenue, 22% margin (strongest performer)
- South: 10.8 Cr revenue, 17% margin (stable)
- West: 13.2 Cr revenue, 19% margin (growing)
- Corporate: 4.6 Cr revenue, 15% margin (services)

Key Developments:
- Won 3 new enterprise contracts worth 8.5 Cr annually
- Completed ERP upgrade across all units
- Vendor consolidation reduced supplier base by 15%

Cash Management:
- Cash position: 22.1 Cr
- Operating cash flow: 5.3 Cr
- Capex: 1.8 Cr (planned IT infrastructure)
- Net working capital: 28.5 Cr`,
  },
  {
    title: "Q1 FY2025 Financial Analysis",
    category: "report",
    content: `Quarterly Financial Analysis - Q1 FY2025 (Apr-Jun 2024)

Revenue: 38.2 Cr (+5% YoY)
EBITDA: 6.9 Cr, Margin: 18.1%
Cash Position: 20.5 Cr

Highlights:
- Stable start to the fiscal year
- All business units met or exceeded targets
- New vendor risk assessment framework implemented
- AR automation reduced reconciliation time by 40%

Challenges:
- Rising raw material costs impacting manufacturing vendors
- Currency fluctuation on USD-denominated contracts
- Two vendor payment disputes totaling 35L`,
  },
  {
    title: "Q4 FY2024 Financial Analysis",
    category: "report",
    content: `Quarterly Financial Analysis - Q4 FY2024 (Jan-Mar 2024)

Revenue: 45.1 Cr (+12% YoY) - Seasonal Q4 boost
EBITDA: 9.2 Cr, Margin: 20.4%
Cash Position: 19.8 Cr

Strong finish to FY2024:
- Revenue exceeded full-year target by 4%
- All BUs profitable with North leading at 24% margin
- Successfully closed year-end deals worth 12 Cr
- Vendor base reduced from 85 to 62 through consolidation

Full Year FY2024 Summary:
- Annual Revenue: 155.8 Cr
- Annual EBITDA: 29.4 Cr (18.9% margin)
- Total Cash Generated: 22.1 Cr
- Capex: 8.5 Cr
- Headcount: 485 (up from 420)`,
  },
  // More quarterly reports
  {
    title: "Q3 FY2024 Financial Analysis",
    category: "report",
    content: `Q3 FY2024 (Oct-Dec 2023): Revenue 39.8 Cr, EBITDA 7.5 Cr (18.8% margin). Steady performance across all units. West unit completed major logistics contract. Cash position stable at 17.2 Cr. Working capital optimization saved 1.2 Cr in financing costs.`,
  },
  {
    title: "Q2 FY2024 Financial Analysis",
    category: "report",
    content: `Q2 FY2024 (Jul-Sep 2023): Revenue 37.5 Cr, EBITDA 7.0 Cr (18.7% margin). North unit growth accelerated with 3 new clients. South unit stable. Manufacturing vendor price renegotiations completed saving 85L annually. DSO improved to 42 days.`,
  },
  {
    title: "Q1 FY2024 Financial Analysis",
    category: "report",
    content: `Q1 FY2024 (Apr-Jun 2023): Revenue 33.4 Cr, EBITDA 5.7 Cr (17.1% margin). New fiscal year started with organizational restructuring. IT infrastructure upgrade initiated. 5 new vendors onboarded. Cash position: 15.8 Cr.`,
  },
  {
    title: "Q4 FY2023 Financial Analysis",
    category: "report",
    content: `Q4 FY2023 (Jan-Mar 2023): Revenue 40.2 Cr, EBITDA 8.1 Cr (20.1% margin). Strong seasonal finish. Record Q4 collections of 38 Cr. Vendor payment cycle optimized to average 28 days. Year-end audit completed with clean report.`,
  },
  // Vendor Performance Summaries
  {
    title: "IT Vendor Performance Review H1 FY2025",
    category: "analysis",
    content: `IT Vendor Performance Summary - H1 FY2025

Top Performers:
1. TechVista Solutions - 98% SLA compliance, on-time delivery, 15% cost reduction achieved
2. CloudNine Systems - Zero security incidents, 99.9% uptime, proactive issue resolution
3. DataBridge Analytics - Exceeded project milestones, strong documentation

Concerns:
1. Digitronics India - 3 late deliveries, quality issues in Q2, corrective action plan in place
2. ByteForge Labs - Staff turnover affecting project continuity, escalated to their management

Spending Analysis:
- Total IT vendor spend: 8.2 Cr (vs 7.5 Cr H1 FY2024, +9%)
- Cloud services: 45% of IT spend (growing)
- On-premise licenses: 25% (declining)
- Professional services: 30% (stable)`,
  },
  {
    title: "Logistics Vendor Performance Review H1 FY2025",
    category: "analysis",
    content: `Logistics Vendor Performance - H1 FY2025

Delivery Performance:
- Average on-time delivery: 91% (target: 95%)
- Damage rate: 0.3% (within 0.5% threshold)
- Best performer: SwiftCargo Logistics at 97% OTD

Cost Trends:
- Fuel surcharges up 12% vs H1 FY2024
- Negotiated volume discounts saving 65L annually
- Route optimization reduced per-km costs by 8%

Risk Areas:
- Bharat Shipping Co: Financial stability concerns, monitoring closely
- Continental Cargo: Insurance compliance pending renewal`,
  },
  {
    title: "Manufacturing Vendor Quality Report",
    category: "analysis",
    content: `Manufacturing Vendor Quality Scorecard - FY2025

Quality Metrics:
- Incoming inspection pass rate: 96.2% (target 98%)
- Defective returns: 12 incidents across 5 vendors
- Warranty claims: 2.1L (down 30% from FY2024)

Top Quality Vendors:
1. PrecisionCast Metals - Zero defects, ISO 9001 certified
2. TitanWorks Engineering - 99.8% quality rate, responsive to feedback

Improvement Required:
- SteelEdge Industries: 4 quality incidents, process audit scheduled
- AgroMill Products: Consistency issues in batch-to-batch quality`,
  },
  {
    title: "Services Vendor Cost Analysis",
    category: "analysis",
    content: `Professional Services Vendor Analysis - FY2025

Consulting Spend: 3.5 Cr
- Strategy consulting: 1.2 Cr (PrimeConsult Advisory)
- Legal services: 85L (LegalShield Partners)
- Audit & compliance: 65L (AuditFirst Associates)
- HR consulting: 45L (HR Dynamics India)
- Other: 35L

Value Assessment:
- PrimeConsult delivered 3x ROI on process optimization project
- LegalShield successfully defended 2 IP disputes saving estimated 2 Cr
- AuditFirst proactive compliance saves approximately 50L in potential penalties

Rate Benchmarking:
- Consulting rates 8% above market average
- Legal rates competitive
- Audit rates 5% below market (multi-year contract benefit)`,
  },
  {
    title: "Utilities Vendor Service Level Report",
    category: "analysis",
    content: `Utilities Vendor SLA Report - H1 FY2025

Power:
- PowerGrid Utilities: 99.7% uptime, 2 outages (both < 2 hours)
- GreenEnergy Solutions: Solar installation generating 15% of office power

Telecom:
- FiberLink Telecom: 99.9% connectivity, upgraded to 1Gbps
- TelcoNet Services: Mobile fleet management, 450 connections

Cost Optimization:
- Power costs reduced 12% through solar + LED transition
- Telecom costs flat despite 20% usage increase (volume negotiation)
- Water recycling saving 8L annually`,
  },
  {
    title: "Vendor Concentration Risk Report",
    category: "analysis",
    content: `Vendor Concentration Risk Assessment - FY2025

High Concentration Alerts:
1. TechVista Solutions: 18% of total AP exposure (above 15% threshold)
   - Mitigation: Diversifying with 2 alternate IT vendors

2. SwiftCargo Logistics: 22% of logistics spend
   - Mitigation: Onboarding BlueFleet Transport as backup

3. PrecisionCast Metals: 35% of manufacturing procurement
   - Mitigation: Qualifying MetalCore Fabrication for overlap items

Overall Portfolio:
- Top 5 vendors: 42% of total spend (target: < 35%)
- Single vendor dependency in 3 categories
- Geographic concentration: 60% vendors in West region`,
  },
  // Cash Flow Analysis
  {
    title: "Cash Flow Trend Analysis FY2025",
    category: "analysis",
    content: `Cash Flow Trend Analysis - FY2025

Operating Cash Flow:
- Q1: 4.8 Cr (healthy)
- Q2: 5.3 Cr (strong)
- Q3: -0.8 Cr (negative - South unit impact)
- Forecast Q4: 6.5 Cr (recovery expected)

Key Drivers of Q3 Decline:
1. South unit client losses reduced collections by 2.1 Cr
2. Year-end vendor payments accelerated by 1.5 Cr
3. Inventory buildup of 1.2 Cr for Q4 orders
4. One-time Hyderabad office setup: 45L

Working Capital Cycle:
- DSO: 52 days (up from 45, target: 40)
- DPO: 38 days (stable)
- Inventory days: 22 (up from 15)
- Cash conversion cycle: 36 days (up from 22)

Recommendations:
- Accelerate collections in South unit
- Negotiate extended payment terms with top 5 vendors
- Review inventory holding policy`,
  },
  {
    title: "Monthly Cash Position Report - December 2024",
    category: "analysis",
    content: `Monthly Cash Position - December 2024

Opening Balance: 19.2 Cr
Inflows: 14.8 Cr (collections 13.2 Cr + other income 1.6 Cr)
Outflows: 15.5 Cr (vendor payments 8.2 Cr + salaries 4.5 Cr + other 2.8 Cr)
Closing Balance: 18.5 Cr

Cash Runway: 4.2 months at current burn rate
Minimum Cash Policy: 10 Cr (currently compliant)

Upcoming Major Payments:
- Q3 advance tax: 1.8 Cr (due Jan 15)
- Annual insurance renewal: 35L (due Jan 20)
- Server infrastructure upgrade: 1.2 Cr (due Feb 1)`,
  },
  {
    title: "Budget vs Actual Analysis H1 FY2025",
    category: "analysis",
    content: `Budget vs Actual - H1 FY2025

Revenue: Actual 79.3 Cr vs Budget 82.0 Cr (-3.3%)
- North: +5% above budget (strong enterprise sales)
- South: -12% below budget (client losses)
- West: +2% above budget
- Corporate: On budget

EBITDA: Actual 14.6 Cr vs Budget 16.4 Cr (-11%)
- Margin: 18.4% vs budgeted 20.0%
- Gap driven by South unit and unplanned Hyderabad costs

Capex: Actual 3.5 Cr vs Budget 4.0 Cr (-12.5%)
- IT infrastructure: On track
- Office expansion: Deferred to H2

Key Variances:
- Employee costs +8% (new hires in North)
- Travel costs +15% (client visits for retention)
- Marketing costs -20% (campaign delays)`,
  },
  // AR Aging Reports
  {
    title: "AR Aging Analysis December 2024",
    category: "report",
    content: `Accounts Receivable Aging - December 2024

Total AR Outstanding: 28.5 Cr

Aging Buckets:
- Current (0-30 days): 15.2 Cr (53%) - Healthy
- 31-60 days: 6.8 Cr (24%) - Monitor
- 61-90 days: 3.5 Cr (12%) - Follow up
- 91-120 days: 2.1 Cr (7%) - Escalate
- 120+ days: 0.9 Cr (3%) - Legal action

Top Overdue Accounts:
1. Enterprise Client A: 1.2 Cr (75 days) - Payment plan agreed
2. Government Contract B: 85L (92 days) - Bureaucratic delay
3. SME Client C: 45L (110 days) - Dispute resolution in progress

Collection Efficiency: 89% (target 95%)
Bad Debt Provision: 45L (up from 30L in Sep)

Action Items:
- Deploy dedicated collection team for 60+ days accounts
- Implement automated payment reminders at 7, 14, 21 days
- Review credit terms for chronically late payers`,
  },
  {
    title: "AR Reconciliation Summary Q3 FY2025",
    category: "report",
    content: `AR Reconciliation Summary - Q3 FY2025

Invoices Processed: 1,247
Successfully Matched: 1,089 (87.3%)
Flagged for Review: 112 (9.0%)
Unmatched: 46 (3.7%)

Match Rate Trend:
- Q1: 91.2%
- Q2: 89.5%
- Q3: 87.3% (declining - investigating)

Common Discrepancy Types:
- Amount mismatch (GST calculation): 45%
- Partial payments: 25%
- Date discrepancies: 15%
- Duplicate entries: 10%
- Other: 5%

Automation Impact:
- Manual reconciliation time reduced from 120 hours to 35 hours per month
- Error rate reduced from 4.2% to 1.1%
- Cost savings: 8L per quarter in labor costs`,
  },
];

const SAMPLE_QUERIES = [
  { question: "What is our current cash runway?", answer: "Based on the current cash position of 18.5 Cr and monthly burn rate of approximately 4.4 Cr, the company has a cash runway of approximately 4.2 months. This is above the minimum threshold of 3 months but below the preferred 6-month runway target." },
  { question: "Which vendor has the highest risk score?", answer: "Based on the latest vendor risk assessments, the highest risk vendors are in the critical category with risk scores below 40. These vendors show patterns of severely late payments (80+ days average) and high concentration exposure." },
  { question: "Why did EBITDA drop in Q3?", answer: "Q3 FY2025 EBITDA declined 12% QoQ to 6.8 Cr primarily due to South business unit underperformance. Key factors: 1) Loss of two major clients (2.1 Cr annual revenue impact), 2) New Hyderabad office setup costs (45L one-time), 3) Increased recruitment costs for team buildout. North unit's 28% YoY growth partially offset the decline." },
  { question: "What is our AR aging distribution?", answer: "Total AR outstanding is 28.5 Cr. Distribution: Current (0-30 days): 15.2 Cr (53%), 31-60 days: 6.8 Cr (24%), 61-90 days: 3.5 Cr (12%), 91-120 days: 2.1 Cr (7%), 120+ days: 0.9 Cr (3%). Collection efficiency is at 89% against a target of 95%." },
  { question: "What are the top 3 vendor concentration risks?", answer: "Top concentration risks: 1) TechVista Solutions at 18% of total AP exposure (above 15% threshold), 2) SwiftCargo Logistics at 22% of logistics spend, 3) PrecisionCast Metals at 35% of manufacturing procurement. Mitigation plans include diversifying with alternate vendors in each category." },
];

export async function seedCopilot(): Promise<void> {
  await prisma.copilotQuery.deleteMany();
  await prisma.copilotSession.deleteMany();
  await prisma.financialDocument.deleteMany();

  // Create financial documents
  await prisma.financialDocument.createMany({
    data: FINANCIAL_DOCUMENTS.map((doc) => ({
      title: doc.title,
      category: doc.category,
      content: doc.content,
    })),
  });
  console.log(`  Created ${FINANCIAL_DOCUMENTS.length} financial documents`);

  // Create demo sessions and queries
  const sessions = [];
  for (let i = 0; i < 5; i++) {
    sessions.push(
      await prisma.copilotSession.create({
        data: {
          startedAt: faker.date.recent({ days: 7 }),
        },
      })
    );
  }

  for (let i = 0; i < 20; i++) {
    const session = faker.helpers.arrayElement(sessions);
    const qa = SAMPLE_QUERIES[i % SAMPLE_QUERIES.length];
    await prisma.copilotQuery.create({
      data: {
        sessionId: session.id,
        question: qa.question,
        answer: qa.answer,
        sourcesUsed: faker.helpers.arrayElements(
          ["ar_db", "cashflow_db", "vendor_db", "faiss_index"],
          { min: 1, max: 3 }
        ),
        confidenceScore: faker.number.float({ min: 0.75, max: 0.98, fractionDigits: 2 }),
        faissDocIds: [],
      },
    });
  }
  console.log(`  Created ${sessions.length} copilot sessions with 20 queries`);
}
