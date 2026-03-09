import { PrismaClient } from "@prisma/client";
import { Document } from "@langchain/core/documents";
import { FAISSManager } from "../../lib/db/faiss";
import type { FAISSDocMetadata } from "../../lib/db/faiss";

const prisma = new PrismaClient();

export async function seedFAISS(): Promise<void> {
  const financialDocs = await prisma.financialDocument.findMany();

  const documents: Document<FAISSDocMetadata>[] = financialDocs.map((doc) => ({
    pageContent: `${doc.title}\n\n${doc.content}`,
    metadata: {
      id: doc.id,
      category: doc.category,
      title: doc.title,
      sourceTable: "financial_documents",
      sourceId: doc.id,
    },
  }));

  // Add invoice summaries grouped by vendor
  const vendors = await prisma.vendor.findMany({
    include: {
      invoices: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  for (const vendor of vendors) {
    if (vendor.invoices.length === 0) continue;

    const totalAmount = vendor.invoices.reduce((sum, inv) => sum + inv.totalAmountInr, 0);
    const matchedCount = vendor.invoices.filter((inv) => inv.status === "matched").length;
    const flaggedCount = vendor.invoices.filter((inv) => inv.status === "flagged").length;

    const summary = `Invoice Summary for ${vendor.name} (${vendor.category})
Total invoices: ${vendor.invoices.length}
Total amount: ₹${(totalAmount / 100000).toFixed(2)} L
Matched: ${matchedCount}, Flagged: ${flaggedCount}
Payment terms: ${vendor.paymentTermsDays} days
Risk level: ${vendor.riskLevel ?? "unassessed"}
Average days to pay: ${vendor.avgDaysToPay ?? "N/A"}`;

    documents.push({
      pageContent: summary,
      metadata: {
        id: `vendor_summary_${vendor.id}`,
        category: "invoice_summary",
        title: `Invoice Summary - ${vendor.name}`,
        sourceTable: "invoices",
        sourceId: vendor.id,
      },
    });
  }

  await FAISSManager.rebuild(documents);
  console.log(
    `  Embedded ${documents.length} documents into FAISS index at ${process.env.FAISS_INDEX_PATH ?? "./data/faiss"}`
  );

  // Update embeddingId references
  for (const doc of financialDocs) {
    await prisma.financialDocument.update({
      where: { id: doc.id },
      data: { embeddingId: doc.id },
    });
  }
}
