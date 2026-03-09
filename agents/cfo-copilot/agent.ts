import { createDeepAgent } from "deepagents";
import { getLLMModel } from "@/agents/shared/model-provider";
import { getCheckpointer } from "@/agents/shared/checkpointer";
import { copilotPrompt, dataAnalystPrompt, knowledgeRetrieverPrompt } from "./prompts";
import {
  queryARData,
  queryCashFlowData,
  queryVendorData,
  semanticSearch,
  generateChartSpec,
  citeSource,
  saveCopilotQuery,
} from "./tools";

export function createCopilotAgent() {
  return createDeepAgent({
    name: "boardbrief",
    model: getLLMModel(),
    systemPrompt: copilotPrompt,
    tools: [
      queryARData,
      queryCashFlowData,
      queryVendorData,
      semanticSearch,
      generateChartSpec,
      citeSource,
      saveCopilotQuery,
    ],
    skills: ["./skills/cfo-copilot/", "./skills/financial-domain/"],
    subagents: [
      {
        name: "data-analyst",
        description:
          "Queries structured financial data from PostgreSQL for AR, cash flow, and vendor metrics",
        systemPrompt: dataAnalystPrompt,
        tools: [queryARData, queryCashFlowData, queryVendorData],
      },
      {
        name: "knowledge-retriever",
        description:
          "Searches the financial knowledge base via FAISS semantic similarity for policies, reports, and analysis",
        systemPrompt: knowledgeRetrieverPrompt,
        tools: [semanticSearch],
      },
    ],
    checkpointer: getCheckpointer(),
  });
}
