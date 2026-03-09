"use client";

import { cn } from "@/lib/utils/cn";

type NodeStatus = "pending" | "running" | "complete" | "error";

interface GraphVisualizerProps {
  nodes: string[];
  statusMap: Record<string, NodeStatus>;
  className?: string;
}

const statusColors: Record<NodeStatus, { fill: string; stroke: string }> = {
  pending: { fill: "fill-slate-100", stroke: "stroke-slate-300" },
  running: { fill: "fill-indigo-50", stroke: "stroke-indigo-500" },
  complete: { fill: "fill-emerald-50", stroke: "stroke-emerald-500" },
  error: { fill: "fill-red-50", stroke: "stroke-red-500" },
};

export function GraphVisualizer({
  nodes,
  statusMap,
  className,
}: GraphVisualizerProps) {
  const nodeCount = nodes.length;
  const width = 100;
  const nodeSpacing = nodeCount > 1 ? (width - 20) / (nodeCount - 1) : 0;
  const cy = 50;
  const r = 12;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-default)] bg-white p-4 overflow-hidden",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
        Agent Graph
      </p>
      <svg
        viewBox={`0 0 ${width} 100`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges */}
        {nodes.map((_, i) => {
          if (i === nodeCount - 1) return null;
          const x1 = 10 + i * nodeSpacing;
          const x2 = 10 + (i + 1) * nodeSpacing;
          const nextStatus = statusMap[nodes[i + 1]] ?? "pending";
          const currentStatus = statusMap[nodes[i]] ?? "pending";
          const isTraversed =
            currentStatus === "complete" || nextStatus !== "pending";

          return (
            <line
              key={`edge-${i}`}
              x1={x1}
              y1={cy}
              x2={x2}
              y2={cy}
              className={cn(
                "transition-all duration-300",
                isTraversed ? "stroke-indigo-400" : "stroke-slate-200"
              )}
              strokeWidth={0.8}
              strokeDasharray={isTraversed ? "none" : "2 2"}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((name, i) => {
          const cx = 10 + i * nodeSpacing;
          const status = statusMap[name] ?? "pending";
          const colors = statusColors[status];

          return (
            <g key={name}>
              {status === "running" && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 4}
                  className="fill-none stroke-indigo-300 animate-ping"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                className={cn(
                  colors.fill,
                  colors.stroke,
                  "transition-all duration-300"
                )}
                strokeWidth={1}
              />
              {status === "complete" && (
                <text
                  x={cx}
                  y={cy + 1.5}
                  textAnchor="middle"
                  className="fill-emerald-600 text-[5px]"
                  dominantBaseline="middle"
                >
                  ✓
                </text>
              )}
              {status === "error" && (
                <text
                  x={cx}
                  y={cy + 1.5}
                  textAnchor="middle"
                  className="fill-red-600 text-[5px]"
                  dominantBaseline="middle"
                >
                  ✗
                </text>
              )}
              <text
                x={cx}
                y={cy + r + 8}
                textAnchor="middle"
                className="fill-slate-500 text-[3.5px]"
              >
                {name.length > 10 ? name.slice(0, 8) + ".." : name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
