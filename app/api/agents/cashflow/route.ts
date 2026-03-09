import { NextRequest } from "next/server";
import { z } from "zod";
import { createCashFlowAgent } from "@/agents/cashflow/agent";
import { getProviderLabel } from "@/agents/shared/model-provider";
import { createSSEStream, SSE_HEADERS } from "@/lib/streaming/sse";

const RequestSchema = z.object({
  prompt: z.string().optional(),
  threadId: z.string().optional(),
  businessUnit: z.string().optional(),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const body = RequestSchema.parse(await req.json());
  const threadId = body.threadId ?? crypto.randomUUID();
  const { stream, send, close } = createSSEStream();

  (async () => {
    send("session_start", {
      threadId,
      provider: getProviderLabel(),
      timestamp: Date.now(),
    });

    try {
      const agent = createCashFlowAgent();
      const bu = body.businessUnit ?? "all";
      const prompt =
        body.prompt ??
        `Generate a 90-day cash flow forecast for the "${bu}" business unit. Fetch historical transactions, clean the data, then delegate forecasting to the optimist, analyst, and risk-assessor subagents. Synthesize their outputs into a consensus forecast with scenarios and alerts.`;

      const input = {
        messages: [{ role: "user" as const, content: prompt }],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streamResult: AsyncIterable<Record<string, unknown>> = await (agent as any).stream(input, {
        configurable: { thread_id: threadId },
        streamMode: "updates",
        subgraphs: true,
      });

      for await (const chunk of streamResult) {
        for (const [key, value] of Object.entries(chunk)) {
          send("node_update", {
            node: key,
            output: typeof value === "string" ? value : JSON.stringify(value),
            timestamp: Date.now(),
          });
        }
      }

      send("agent_complete", { threadId, timestamp: Date.now() });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      send("agent_error", { message, timestamp: Date.now() });
    } finally {
      close();
    }
  })();

  return new Response(stream, { headers: SSE_HEADERS });
}
