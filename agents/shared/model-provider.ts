import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface LLMConfig {
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export function getLLMModel(config: LLMConfig = {}): BaseChatModel {
  const { temperature = 0.1, maxTokens = 4000, streaming = true } = config;

  if (process.env.LLM_PROVIDER === "azure") {
    return new AzureChatOpenAI({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT?.replace(
        /^https?:\/\//,
        ""
      ).replace(/\.openai\.azure\.com\/?$/, ""),
      azureOpenAIApiDeploymentName:
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o",
      azureOpenAIApiVersion:
        process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview",
      temperature,
      maxTokens,
      streaming,
    });
  }

  return new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.OPENAI_MODEL ?? "gpt-4o",
    temperature,
    maxTokens,
    streaming,
  });
}

export function getProviderLabel(): string {
  return process.env.LLM_PROVIDER === "azure"
    ? "Azure OpenAI · GPT-4o"
    : "OpenAI · GPT-4o";
}
