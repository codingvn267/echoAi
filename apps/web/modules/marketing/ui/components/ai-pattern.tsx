import { cn } from "@workspace/ui/lib/utils";

/**
 * A decorative, abstract "AI flow" pattern: connected nodes drawn as a
 * self-contained SVG. No third-party imagery, no watermarks, scales crisply,
 * and inherits the surrounding zinc palette via currentColor. Purely
 * presentational — always paired with real text content for context.
 */
export const AiPattern = ({ className }: { className?: string }) => {
  const nodes = [
    { cx: 60, cy: 80 },
    { cx: 150, cy: 40 },
    { cx: 150, cy: 130 },
    { cx: 250, cy: 90 },
    { cx: 340, cy: 50 },
    { cx: 340, cy: 140 },
    { cx: 430, cy: 95 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
    [4, 6],
    [5, 6],
  ];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 490 180"
      fill="none"
      className={cn("text-zinc-500", className)}
    >
      <defs>
        <radialGradient id="ai-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {edges.map(([a, b], i) => {
        const from = nodes[a]!;
        const to = nodes[b]!;
        return (
          <line
            key={i}
            x1={from.cx}
            y1={from.cy}
            x2={to.cx}
            y2={to.cy}
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        );
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r="10" fill="url(#ai-node)" />
          <circle
            cx={n.cx}
            cy={n.cy}
            r="3.5"
            fill="currentColor"
            fillOpacity="0.95"
          />
        </g>
      ))}
    </svg>
  );
};
