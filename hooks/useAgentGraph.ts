"use client";

import { useMemo } from "react";
import type { TraceEntry } from "@/types/agent";

type NodeStatus = "pending" | "running" | "complete" | "error";

export function useAgentGraph(
  traceLog: TraceEntry[],
  nodeNames: string[]
): Record<string, NodeStatus> {
  return useMemo(() => {
    const statusMap: Record<string, NodeStatus> = {};

    for (const name of nodeNames) {
      statusMap[name] = "pending";
    }

    for (const entry of traceLog) {
      const node = entry.node;
      if (!(node in statusMap) && node !== "token") {
        statusMap[node] = "pending";
      }

      if (entry.status === "started") {
        statusMap[node] = "running";
      } else if (entry.status === "complete") {
        statusMap[node] = "complete";
      } else if (entry.status === "error") {
        statusMap[node] = "error";
      }
    }

    return statusMap;
  }, [traceLog, nodeNames]);
}
