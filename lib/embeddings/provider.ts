import { OpenAIEmbeddings, AzureOpenAIEmbeddings } from "@langchain/openai";
import type { Embeddings } from "@langchain/core/embeddings";

export function getEmbeddings(): Embeddings {
  if (process.env.LLM_PROVIDER === "azure") {
    return new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT?.replace(
        /^https?:\/\//,
        ""
      ).replace(/\.openai\.azure\.com\/?$/, ""),
      azureOpenAIApiDeploymentName:
        process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT ?? "text-embedding-3-small",
      azureOpenAIApiVersion:
        process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview",
    });
  }

  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  });
}
