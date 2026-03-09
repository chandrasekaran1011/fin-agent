import { createDeepAgent } from "deepagents";
import { getLLMModel } from "@/agents/shared/model-provider";
import { getCheckpointer } from "@/agents/shared/checkpointer";
import {
  orchestratorPrompt,
  optimistPrompt,
  analystPrompt,
  riskAssessorPrompt,
} from "./prompts";
import {
  fetchTransactions,
  cleanData,
  calculateTrend,
  runScenario,
  detectAnomaly,
  saveForecast,
} from "./tools";

export function createCashFlowAgent() {
  return createDeepAgent({
    name: "cashsight",
    model: getLLMModel(),
    systemPrompt: orchestratorPrompt,
    tools: [
      fetchTransactions,
      cleanData,
      calculateTrend,
      runScenario,
      detectAnomaly,
      saveForecast,
    ],
    skills: ["./skills/cashflow/", "./skills/financial-domain/"],
    subagents: [
      {
        name: "optimist",
        description:
          "Optimistic financial forecaster focusing on growth signals, revenue upside, and best-case scenarios",
        systemPrompt: optimistPrompt,
        tools: [calculateTrend, fetchTransactions],
      },
      {
        name: "analyst",
        description:
          "Statistical base-case financial analyst using regression, historical averages, and seasonality patterns",
        systemPrompt: analystPrompt,
        tools: [calculateTrend, runScenario, fetchTransactions],
      },
      {
        name: "risk-assessor",
        description:
          "Conservative risk-focused CFO identifying cash gaps, downside risks, and worst-case scenarios",
        systemPrompt: riskAssessorPrompt,
        tools: [detectAnomaly, calculateTrend, fetchTransactions],
      },
    ],
    checkpointer: getCheckpointer(),
  });
}
