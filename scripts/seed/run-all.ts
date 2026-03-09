import { execSync } from "child_process";
import { seedVendors } from "./seed-vendors";
import { seedAR } from "./seed-ar";
import { seedCashFlow } from "./seed-cashflow";
import { seedCopilot } from "./seed-copilot";
import { seedFAISS } from "./seed-faiss";

async function main() {
  console.log("1/6 Running Prisma migrations...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } catch {
    console.log("  Migration deploy failed, trying generate...");
    execSync("npx prisma generate", { stdio: "inherit" });
    execSync("npx prisma db push", { stdio: "inherit" });
  }

  console.log("\n2/6 Seeding vendors...");
  await seedVendors();

  console.log("\n3/6 Seeding AR invoices + transactions...");
  await seedAR();

  console.log("\n4/6 Seeding cash flow transactions...");
  await seedCashFlow();

  console.log("\n5/6 Seeding co-pilot documents + history...");
  await seedCopilot();

  console.log("\n6/6 Building FAISS vector index...");
  try {
    await seedFAISS();
  } catch (error) {
    console.log(
      `  FAISS indexing skipped (requires LLM API key for embeddings): ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  console.log("\n--- Seed Summary ---");
  console.log("| Database   | Records Created              |");
  console.log("|------------|------------------------------|");
  console.log("| PostgreSQL | 50 vendors                   |");
  console.log("| PostgreSQL | 500 invoices                 |");
  console.log("| PostgreSQL | ~10,000+ cash flow txns      |");
  console.log("| PostgreSQL | 30 financial documents       |");
  console.log("| PostgreSQL | 5 sessions, 20 queries       |");
  console.log("| FAISS      | ~80 embedded documents       |");
  console.log("--------------------------------------------");

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
