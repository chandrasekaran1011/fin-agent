import { createDeepAgent } from "deepagents";
import { getLLMModel } from "@/agents/shared/model-provider";
import { getCheckpointer } from "@/agents/shared/checkpointer";
import { systemPrompt } from "./prompts";
import {
  fetchVendorProfile,
  fetchVendorTransactions,
  scorePaymentBehavior,
  analyzeConcentration,
  classifyRisk,
  generateRiskReport,
  saveVendorAssessment,
} from "./tools";

export function createVendorRiskAgent() {
  return createDeepAgent({
    name: "vendorguard",
    model: getLLMModel(),
    systemPrompt,
    tools: [
      fetchVendorProfile,
      fetchVendorTransactions,
      scorePaymentBehavior,
      analyzeConcentration,
      classifyRisk,
      generateRiskReport,
      saveVendorAssessment,
    ],
    skills: ["./skills/vendor-risk/", "./skills/financial-domain/"],
    checkpointer: getCheckpointer(),
  });
}
