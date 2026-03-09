import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const INDIAN_COMPANY_NAMES = [
  // IT
  "TechVista Solutions", "Digitronics India", "CloudNine Systems", "InfraStack Technologies",
  "NexGen Softech", "DataBridge Analytics", "ByteForge Labs", "CyberShield Infosec",
  "Quantum Compute India", "PrismaTech Services", "NetCore Solutions", "Synthwave Digital",
  // Logistics
  "SwiftCargo Logistics", "TransIndia Freight", "BlueFleet Transport", "GoFreight Express",
  "Bharat Shipping Co", "AnchorPort Logistics", "TrackLine Movers", "SpeedLink Carriers",
  "Continental Cargo", "PrimeLine Logistics",
  // Manufacturing
  "SteelEdge Industries", "Bharat Forge Works", "PrecisionCast Metals", "TitanWorks Engineering",
  "AgroMill Products", "ChemSynth Manufacturing", "PolyFab Industries", "ElectroCast Systems",
  "MetalCore Fabrication", "IndoSteel Corporation",
  // Services
  "PrimeConsult Advisory", "LegalShield Partners", "AuditFirst Associates", "HR Dynamics India",
  "StratEdge Consulting", "ComplianceFirst LLP", "TalentBridge HR", "MarketPulse Research",
  "BrandCraft Media", "EventScope India", "CapitalWise Finance", "RiskGuard Advisors",
  // Utilities
  "PowerGrid Utilities", "TelcoNet Services", "AquaPure Systems",
  "GreenEnergy Solutions", "FiberLink Telecom", "SolarVolt India",
];

const CATEGORIES: Array<{ name: string; count: number }> = [
  { name: "IT", count: 12 },
  { name: "Logistics", count: 10 },
  { name: "Manufacturing", count: 10 },
  { name: "Services", count: 12 },
  { name: "Utilities", count: 6 },
];

function getCreditLimit(category: string): number {
  const ranges: Record<string, [number, number]> = {
    IT: [10_00_000, 5_00_00_000],
    Logistics: [5_00_000, 2_00_00_000],
    Manufacturing: [20_00_000, 5_00_00_000],
    Services: [5_00_000, 1_00_00_000],
    Utilities: [2_00_000, 50_00_000],
  };
  const [min, max] = ranges[category] ?? [5_00_000, 1_00_00_000];
  return faker.number.int({ min, max });
}

export async function seedVendors(): Promise<void> {
  await prisma.vendor.deleteMany();

  let nameIndex = 0;
  const vendors = [];

  for (const { name: category, count } of CATEGORIES) {
    for (let i = 0; i < count; i++) {
      const companyName = INDIAN_COMPANY_NAMES[nameIndex] ?? faker.company.name();
      nameIndex++;

      // Risk distribution: first 40% low, next 40% medium, next 16% high, last 4% critical
      const riskBucket = i / count;
      let riskProfile: { avgDays: number; lateCount: number; riskLevel: string };

      if (riskBucket < 0.4) {
        riskProfile = {
          avgDays: faker.number.int({ min: 20, max: 30 }),
          lateCount: faker.number.int({ min: 0, max: 2 }),
          riskLevel: "low",
        };
      } else if (riskBucket < 0.8) {
        riskProfile = {
          avgDays: faker.number.int({ min: 35, max: 45 }),
          lateCount: faker.number.int({ min: 3, max: 8 }),
          riskLevel: "medium",
        };
      } else if (riskBucket < 0.96) {
        riskProfile = {
          avgDays: faker.number.int({ min: 50, max: 75 }),
          lateCount: faker.number.int({ min: 10, max: 20 }),
          riskLevel: "high",
        };
      } else {
        riskProfile = {
          avgDays: faker.number.int({ min: 80, max: 120 }),
          lateCount: faker.number.int({ min: 25, max: 40 }),
          riskLevel: "critical",
        };
      }

      const creditLimit = getCreditLimit(category);
      const outstandingRatio =
        riskProfile.riskLevel === "critical"
          ? faker.number.float({ min: 0.7, max: 0.95 })
          : faker.number.float({ min: 0.1, max: 0.5 });

      const totalTx = faker.number.int({ min: 50, max: 500 });
      const riskScore =
        riskProfile.riskLevel === "low"
          ? faker.number.float({ min: 80, max: 100 })
          : riskProfile.riskLevel === "medium"
            ? faker.number.float({ min: 60, max: 79 })
            : riskProfile.riskLevel === "high"
              ? faker.number.float({ min: 40, max: 59 })
              : faker.number.float({ min: 10, max: 39 });

      vendors.push({
        name: companyName,
        category,
        paymentTermsDays: faker.helpers.arrayElement([15, 30, 45, 60]),
        creditLimitInr: creditLimit,
        outstandingBalance: Math.round(creditLimit * outstandingRatio),
        avgDaysToPay: riskProfile.avgDays,
        latePaymentCount: riskProfile.lateCount,
        totalTransactions: totalTx,
        riskScore: Math.round(riskScore * 10) / 10,
        riskLevel: riskProfile.riskLevel,
        lastAssessedAt: faker.date.recent({ days: 30 }),
      });
    }
  }

  await prisma.vendor.createMany({ data: vendors });
  console.log(`  Created ${vendors.length} vendors`);
}
