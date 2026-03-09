import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const BUSINESS_UNITS = ["north", "south", "west", "corporate"] as const;

const CATEGORY_WEIGHTS = {
  revenue: 0.4,
  opex: 0.25,
  payroll: 0.2,
  vendor_payment: 0.1,
  capex: 0.03,
  tax: 0.02,
} as const;

function getMonthlyBase(bu: string): { inflow: number; outflow: number } {
  const bases: Record<string, { inflow: number; outflow: number }> = {
    north: { inflow: 3_00_00_000, outflow: 2_40_00_000 },
    south: { inflow: 2_50_00_000, outflow: 2_00_00_000 },
    west: { inflow: 4_00_00_000, outflow: 3_20_00_000 },
    corporate: { inflow: 1_50_00_000, outflow: 1_20_00_000 },
  };
  return bases[bu] ?? bases.north;
}

export async function seedCashFlow(): Promise<void> {
  await prisma.cashFlowTransaction.deleteMany();
  await prisma.cashFlowForecast.deleteMany();

  const vendors = await prisma.vendor.findMany({ select: { id: true } });
  const transactions = [];

  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - 24);

  for (const bu of BUSINESS_UNITS) {
    const base = getMonthlyBase(bu);

    for (let monthOffset = 0; monthOffset < 24; monthOffset++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(monthDate.getMonth() + monthOffset);
      const month = monthDate.getMonth();
      const isQ4 = month >= 0 && month <= 2; // Jan-Mar = Q4 in Indian FY

      // Planted anomalies
      let inflowMultiplier = 1.0;
      let outflowMultiplier = 1.0;

      // Month 18: Q3 EBITDA drop in south
      if (monthOffset === 17 && bu === "south") {
        inflowMultiplier = 0.65;
      }

      // Month 12: Unusual capex spike in corporate
      if (monthOffset === 11 && bu === "corporate") {
        outflowMultiplier = 2.5;
      }

      // Months 20-22: Revenue growth in north
      if (monthOffset >= 19 && monthOffset <= 21 && bu === "north") {
        inflowMultiplier = 1.28;
      }

      // Q4 seasonal bump
      if (isQ4) {
        inflowMultiplier *= 1.2;
      }

      const txPerMonth = faker.number.int({ min: 80, max: 120 });

      for (let t = 0; t < txPerMonth; t++) {
        const day = faker.number.int({ min: 1, max: 28 });
        const txDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);

        const isInflow = Math.random() < 0.45;

        if (isInflow) {
          const amount = Math.round(
            (base.inflow / txPerMonth) *
              faker.number.float({ min: 0.3, max: 2.5 }) *
              inflowMultiplier
          );

          transactions.push({
            date: txDate,
            amountInr: amount,
            type: "inflow",
            category: "revenue",
            businessUnit: bu,
            description: faker.helpers.arrayElement([
              "Product sales revenue",
              "Service subscription payment",
              "Consulting fee received",
              "License renewal payment",
              "Project milestone payment",
            ]),
            vendorId: null,
            isForecast: false,
          });
        } else {
          const categoryRoll = Math.random();
          let category: string;
          let cumWeight = 0;

          if ((cumWeight += CATEGORY_WEIGHTS.opex) > categoryRoll) {
            category = "opex";
          } else if ((cumWeight += CATEGORY_WEIGHTS.payroll) > categoryRoll) {
            category = "payroll";
          } else if ((cumWeight += CATEGORY_WEIGHTS.vendor_payment) > categoryRoll) {
            category = "vendor_payment";
          } else if ((cumWeight += CATEGORY_WEIGHTS.capex) > categoryRoll) {
            category = monthOffset === 11 && bu === "corporate" ? "capex" : "capex";
          } else {
            category = "tax";
          }

          let amount = Math.round(
            (base.outflow / txPerMonth) *
              faker.number.float({ min: 0.2, max: 2.0 }) *
              outflowMultiplier
          );

          // Capex spike for corporate month 12
          if (category === "capex" && monthOffset === 11 && bu === "corporate") {
            amount = faker.number.int({ min: 2_00_00_000, max: 8_00_00_000 });
          }

          const vendorId =
            category === "vendor_payment" && vendors.length > 0
              ? faker.helpers.arrayElement(vendors).id
              : null;

          transactions.push({
            date: txDate,
            amountInr: amount,
            type: "outflow",
            category,
            businessUnit: bu,
            description: faker.helpers.arrayElement([
              "Office rent payment",
              "Software license renewal",
              "Employee salary disbursement",
              "Vendor invoice payment",
              "Equipment maintenance",
              "Travel & conveyance",
              "Marketing campaign spend",
              "GST payment",
              "Professional services fee",
            ]),
            vendorId,
            isForecast: false,
          });
        }
      }
    }
  }

  // Create forecast rows (90 days forward)
  for (const bu of BUSINESS_UNITS) {
    const base = getMonthlyBase(bu);
    for (let day = 1; day <= 90; day++) {
      const fDate = new Date(now);
      fDate.setDate(fDate.getDate() + day);

      for (const scenario of ["optimistic", "base", "pessimistic"] as const) {
        const multiplier =
          scenario === "optimistic" ? 1.15 : scenario === "pessimistic" ? 0.85 : 1.0;

        transactions.push({
          date: fDate,
          amountInr: Math.round((base.inflow / 30) * multiplier * faker.number.float({ min: 0.8, max: 1.2 })),
          type: "inflow",
          category: "revenue",
          businessUnit: bu,
          description: `${scenario} forecast - projected revenue`,
          vendorId: null,
          isForecast: true,
          confidence: scenario === "base" ? 0.8 : scenario === "optimistic" ? 0.6 : 0.7,
        });
      }
    }
  }

  // Batch insert in chunks
  const chunkSize = 500;
  for (let i = 0; i < transactions.length; i += chunkSize) {
    await prisma.cashFlowTransaction.createMany({
      data: transactions.slice(i, i + chunkSize),
    });
  }

  console.log(`  Created ${transactions.length} cash flow transactions`);
}
