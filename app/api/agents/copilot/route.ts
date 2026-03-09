import { NextRequest } from "next/server";
import { z } from "zod";
import { createCopilotAgent } from "@/agents/cfo-copilot/agent";
import { getProviderLabel } from "@/agents/shared/model-provider";
import { createSSEStream, SSE_HEADERS } from "@/lib/streaming/sse";

const RequestSchema = z.object({
  prompt: z.string(),
  threadId: z.string().optional(),
  sessionId: z.string().optional(),
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
      const agent = createCopilotAgent();

      const input = {
        messages: [{ role: "user" as const, content: body.prompt }],
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
