import { tool } from "langchain";
import { z } from "zod";
import { prisma } from "@/lib/db/postgres";
import { FAISSManager } from "@/lib/db/faiss";
import { cacheInvalidate, CACHE_KEYS } from "@/lib/db/redis";

export const loadInvoiceBatch = tool(
  async ({ status, limit }: { status?: string; limit?: number }) => {
    const invoices = await prisma.invoice.findMany({
      where: status ? { status } : undefined,
      include: { vendor: { select: { name: true } } },
      take: limit ?? 50,
      orderBy: { createdAt: "desc" },
    });
    return JSON.stringify(
      invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        vendorName: inv.vendor.name,
        amountInr: inv.totalAmountInr,
        status: inv.status,
        dueDate: inv.dueDate.toISOString(),
        matchConfidence: inv.matchConfidence,
      }))
    );
  },
  {
    name: "load_invoice_batch",
    description:
      "Load a batch of invoices from the database. Can filter by status (open, matched, flagged, etc.) and limit the number of results.",
    schema: z.object({
      status: z
        .string()
        .optional()
        .describe("Filter by status: open, matched, flagged, approved, rejected"),
      limit: z.number().optional().default(50).describe("Max invoices to load"),
    }),
  }
);

export const loadBankTransactions = tool(
  async ({ daysBack }: { daysBack?: number }) => {
    const since = new Date();
    since.setDate(since.getDate() - (daysBack ?? 90));

    const transactions = await prisma.cashFlowTransaction.findMany({
      where: {
        type: "inflow",
        date: { gte: since },
        isForecast: false,
      },
      take: 500,
      orderBy: { date: "desc" },
    });
    return JSON.stringify(
      transactions.map((tx) => ({
        id: tx.id,
        date: tx.date.toISOString(),
        amountInr: tx.amountInr,
        description: tx.description,
        category: tx.category,
      }))
    );
  },
  {
    name: "load_bank_transactions",
    description:
      "Load bank inflow transactions from the last N days for matching against invoices.",
    schema: z.object({
      daysBack: z.number().optional().default(90).describe("How many days back to fetch"),
    }),
  }
);

export const parseInvoice = tool(
  async ({ invoiceId }: { invoiceId: string }) => {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { vendor: { select: { name: true } } },
    });
    if (!invoice) return JSON.stringify({ error: "Invoice not found" });

    return JSON.stringify({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      vendorName: invoice.vendor.name,
      amount: invoice.amountInr,
      taxAmount: invoice.taxAmountInr,
      totalAmount: invoice.totalAmountInr,
      lineItems: invoice.lineItemsJson,
      dueDate: invoice.dueDate.toISOString(),
      issueDate: invoice.issueDate.toISOString(),
    });
  },
  {
    name: "parse_invoice",
    description: "Parse and extract structured data from a specific invoice by ID.",
    schema: z.object({
      invoiceId: z.string().describe("The invoice ID to parse"),
    }),
  }
);

export const semanticMatch = tool(
  async ({ description, k }: { description: string; k?: number }) => {
    try {
      const results = await FAISSManager.search(description, k ?? 5);
      return JSON.stringify(
        results.map((r) => ({
          title: r.doc.metadata.title,
          category: r.doc.metadata.category,
          score: r.score,
          sourceId: r.doc.metadata.sourceId,
          excerpt: r.doc.pageContent.substring(0, 200),
        }))
      );
    } catch {
      return JSON.stringify({ error: "FAISS index not available" });
    }
  },
  {
    name: "semantic_match",
    description:
      "Search FAISS for semantically similar invoices or documents based on a text description. Returns top-k results with similarity scores.",
    schema: z.object({
      description: z.string().describe("Text to find similar documents for"),
      k: z.number().optional().default(5).describe("Number of results to return"),
    }),
  }
);

export const matchInvoice = tool(
  async ({
    invoiceId,
    invoiceAmount,
    invoiceDate,
    candidateIds,
  }: {
    invoiceId: string;
    invoiceAmount: number;
    invoiceDate: string;
    candidateIds: string[];
  }) => {
    const candidates = await prisma.cashFlowTransaction.findMany({
      where: { id: { in: candidateIds } },
    });

    const matches = candidates.map((tx) => {
      const amountDiff = Math.abs(tx.amountInr - invoiceAmount) / invoiceAmount;
      const dateDiff = Math.abs(
        new Date(invoiceDate).getTime() - tx.date.getTime()
      ) / (1000 * 60 * 60 * 24);

      const amountScore = Math.max(0, 100 - amountDiff * 200);
      const dateScore = Math.max(0, 100 - dateDiff * 5);
      const confidence = amountScore * 0.6 + dateScore * 0.4;

      return {
        transactionId: tx.id,
        confidence: Math.round(confidence * 10) / 10,
        amountDiff: Math.round(amountDiff * 10000) / 100,
        dateDiffDays: Math.round(dateDiff),
        method: amountDiff < 0.02 && dateDiff < 3 ? "exact" : "fuzzy",
      };
    });

    matches.sort((a, b) => b.confidence - a.confidence);
    return JSON.stringify({ invoiceId, bestMatch: matches[0] ?? null, allMatches: matches.slice(0, 5) });
  },
  {
    name: "match_invoice",
    description:
      "Match an invoice against candidate bank transactions using amount and date fuzzy matching. Returns best match with confidence score.",
    schema: z.object({
      invoiceId: z.string(),
      invoiceAmount: z.number().describe("Invoice total amount in INR"),
      invoiceDate: z.string().describe("Invoice date in ISO format"),
      candidateIds: z.array(z.string()).describe("Transaction IDs to match against"),
    }),
  }
);

export const flagDiscrepancy = tool(
  async ({
    invoiceId,
    transactionId,
    amountDiffPercent,
    dateDiffDays,
    confidence,
  }: {
    invoiceId: string;
    transactionId?: string;
    amountDiffPercent: number;
    dateDiffDays: number;
    confidence: number;
  }) => {
    const reasons = [];
    let severity: "low" | "medium" | "high" = "low";

    if (amountDiffPercent > 15) {
      reasons.push(`Amount discrepancy of ${amountDiffPercent}% exceeds 15% threshold`);
      severity = "high";
    } else if (amountDiffPercent > 5) {
      reasons.push(`Amount discrepancy of ${amountDiffPercent}% exceeds 5% threshold`);
      severity = "medium";
    }

    if (dateDiffDays > 15) {
      reasons.push(`Date difference of ${dateDiffDays} days exceeds 15 day threshold`);
      severity = "high";
    } else if (dateDiffDays > 7) {
      reasons.push(`Date difference of ${dateDiffDays} days exceeds 7 day threshold`);
      if (severity === "low") severity = "medium";
    }

    if (confidence < 60) {
      reasons.push(`Low match confidence: ${confidence}%`);
      severity = "high";
    }

    if (!transactionId) {
      reasons.push("No matching bank transaction found");
      severity = "high";
    }

    return JSON.stringify({
      invoiceId,
      transactionId,
      flagged: reasons.length > 0,
      reasons,
      severity,
      recommendation: severity === "high" ? "investigate" : "review",
    });
  },
  {
    name: "flag_discrepancy",
    description:
      "Analyze a matched invoice-transaction pair for discrepancies. Returns whether to flag, the reasons, and severity level.",
    schema: z.object({
      invoiceId: z.string(),
      transactionId: z.string().optional(),
      amountDiffPercent: z.number().describe("Percentage difference in amounts"),
      dateDiffDays: z.number().describe("Difference in days between dates"),
      confidence: z.number().describe("Match confidence percentage"),
    }),
  }
);

export const resolveItem = tool(
  async ({
    invoiceId,
    discrepancyType,
    discrepancyDetails,
  }: {
    invoiceId: string;
    discrepancyType: string;
    discrepancyDetails: string;
  }) => {
    // This would normally use LLM reasoning, but as a tool it returns structured data
    // The deep agent will use this tool's output along with its own reasoning
    return JSON.stringify({
      invoiceId,
      discrepancyType,
      analysisComplete: true,
      note: `Resolution analysis prepared for invoice ${invoiceId}. Discrepancy type: ${discrepancyType}. Details: ${discrepancyDetails}. The agent should now provide a recommended action (approve, reject, investigate, or adjust) based on this analysis and the skill guidelines.`,
    });
  },
  {
    name: "resolve_item",
    description:
      "Prepare resolution analysis for a flagged invoice item. Use the AR reconciliation skill guidelines to determine the recommended action.",
    schema: z.object({
      invoiceId: z.string(),
      discrepancyType: z
        .string()
        .describe("Type: amount_mismatch, date_mismatch, duplicate, missing_transaction"),
      discrepancyDetails: z.string().describe("Detailed description of the discrepancy"),
    }),
  }
);

export const approveReconciliation = tool(
  async ({ items }: { items: Array<{ invoiceId: string; action: string; confidence: number }> }) => {
    // This tool triggers a human-in-the-loop interrupt
    // The deep agent will pause here for approval
    return JSON.stringify({
      pendingApproval: true,
      itemCount: items.length,
      items: items.map((item) => ({
        invoiceId: item.invoiceId,
        suggestedAction: item.action,
        confidence: item.confidence,
      })),
      message: "Items submitted for human approval. Waiting for approve/reject decisions.",
    });
  },
  {
    name: "approve_reconciliation",
    description:
      "Submit reconciliation items for human approval. This will pause the agent and wait for the user to approve or reject each item.",
    schema: z.object({
      items: z.array(
        z.object({
          invoiceId: z.string(),
          action: z.string().describe("Suggested action: approve, reject, investigate, adjust"),
          confidence: z.number().describe("Confidence in the suggestion (0-100)"),
        })
      ),
    }),
  }
);

export const saveReconciliation = tool(
  async ({
    results,
  }: {
    results: Array<{
      invoiceId: string;
      status: string;
      matchConfidence?: number;
      matchedTxId?: string;
      agentNotes?: string;
    }>;
  }) => {
    let updated = 0;
    for (const result of results) {
      await prisma.invoice.update({
        where: { id: result.invoiceId },
        data: {
          status: result.status,
          matchConfidence: result.matchConfidence,
          matchedTxId: result.matchedTxId,
          agentNotes: result.agentNotes,
        },
      });
      updated++;
    }

    await cacheInvalidate(CACHE_KEYS.dashboardAR);
    await cacheInvalidate(CACHE_KEYS.dashboardMaster);

    return JSON.stringify({
      success: true,
      updatedCount: updated,
      message: `Updated ${updated} invoices. Dashboard cache invalidated.`,
    });
  },
  {
    name: "save_reconciliation",
    description:
      "Save reconciliation results to the database and invalidate dashboard caches. Call this after all matching and approvals are complete.",
    schema: z.object({
      results: z.array(
        z.object({
          invoiceId: z.string(),
          status: z.string().describe("New status: matched, approved, rejected, flagged"),
          matchConfidence: z.number().optional(),
          matchedTxId: z.string().optional(),
          agentNotes: z.string().optional(),
        })
      ),
    }),
  }
);
