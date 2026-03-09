import { createDeepAgent } from "deepagents";
import { getLLMModel } from "@/agents/shared/model-provider";
import { getCheckpointer } from "@/agents/shared/checkpointer";
import { systemPrompt } from "./prompts";
import {
  loadInvoiceBatch,
  loadBankTransactions,
  parseInvoice,
  semanticMatch,
  matchInvoice,
  flagDiscrepancy,
  resolveItem,
  approveReconciliation,
  saveReconciliation,
} from "./tools";

export function createARAgent() {
  return createDeepAgent({
    name: "autorecon",
    model: getLLMModel(),
    systemPrompt,
    tools: [
      loadInvoiceBatch,
      loadBankTransactions,
      parseInvoice,
      semanticMatch,
      matchInvoice,
      flagDiscrepancy,
      resolveItem,
      approveReconciliation,
      saveReconciliation,
    ],
    skills: ["./skills/ar-reconciliation/", "./skills/financial-domain/"],
    interruptOn: {
      approve_reconciliation: { allowedDecisions: ["approve", "reject"] },
    },
    checkpointer: getCheckpointer(),
  });
}
