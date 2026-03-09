import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

export async function seedAR(): Promise<void> {
  await prisma.invoice.deleteMany();

  const vendors = await prisma.vendor.findMany({ select: { id: true, name: true } });
  if (vendors.length === 0) throw new Error("No vendors found. Run seed-vendors first.");

  const invoices = [];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  for (let i = 0; i < 500; i++) {
    const vendor = faker.helpers.arrayElement(vendors);
    const baseAmount = faker.number.int({ min: 10_000, max: 50_00_000 });
    const taxRate = faker.helpers.arrayElement([0.05, 0.12, 0.18, 0.28]);
    const taxAmount = Math.round(baseAmount * taxRate);
    const totalAmount = baseAmount + taxAmount;

    const issueDate = faker.date.between({ from: sixMonthsAgo, to: new Date() });
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + faker.helpers.arrayElement([15, 30, 45, 60]));

    // Distribution: 350 clean, 75 amount mismatch, 50 date mismatch, 15 duplicate, 10 missing tx
    let status: string;
    let matchConfidence: number | null = null;
    let discrepancyAmount = 0;
    let discrepancyReason: string | null = null;
    let matchedTxId: string | null = null;

    if (i < 350) {
      // Clean matches
      status = "matched";
      matchConfidence = faker.number.float({ min: 85, max: 100, fractionDigits: 1 });
      matchedTxId = `tx_${faker.string.alphanumeric(10)}`;
    } else if (i < 425) {
      // Amount mismatch
      status = "flagged";
      const discrepancyPct = faker.number.float({ min: 0.05, max: 0.25 });
      discrepancyAmount = Math.round(totalAmount * discrepancyPct);
      discrepancyReason = "amount_mismatch";
      matchConfidence = faker.number.float({ min: 40, max: 75, fractionDigits: 1 });
    } else if (i < 475) {
      // Date mismatch
      status = "flagged";
      discrepancyReason = "date_mismatch";
      matchConfidence = faker.number.float({ min: 50, max: 78, fractionDigits: 1 });
    } else if (i < 490) {
      // Duplicates
      status = "flagged";
      discrepancyReason = "duplicate";
      discrepancyAmount = faker.number.int({ min: 1000, max: 50000 });
      matchConfidence = faker.number.float({ min: 30, max: 60, fractionDigits: 1 });
    } else {
      // Missing transaction
      status = "open";
      discrepancyReason = "missing_transaction";
    }

    const lineItemCount = faker.number.int({ min: 1, max: 5 });
    const lineItems = Array.from({ length: lineItemCount }, () => {
      const qty = faker.number.int({ min: 1, max: 100 });
      const rate = faker.number.int({ min: 500, max: 50000 });
      return {
        description: faker.commerce.productName(),
        qty,
        rate,
        amount: qty * rate,
      };
    });

    invoices.push({
      invoiceNumber: `INV-${String(2024000 + i).padStart(7, "0")}`,
      vendorId: vendor.id,
      amountInr: baseAmount,
      taxAmountInr: taxAmount,
      totalAmountInr: totalAmount,
      issueDate,
      dueDate,
      status,
      matchConfidence,
      matchedTxId,
      discrepancyAmountInr: discrepancyAmount,
      discrepancyReason,
      lineItemsJson: lineItems,
    });
  }

  await prisma.invoice.createMany({ data: invoices });
  console.log(`  Created ${invoices.length} invoices`);
}
