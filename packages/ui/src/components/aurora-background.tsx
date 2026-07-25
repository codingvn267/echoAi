import { cn } from "@workspace/ui/lib/utils";

export interface AuroraBackgroundProps {
  className?: string;
  /**
   * Opacity multiplier for the whole layer, 0-1. Defaults to a subtle 0.16
   * suitable for dashboard/widget use; pass ~0.3-0.4 for marketing heroes.
   */
  intensity?: number;
  /** Adds a faint technical dot-grid pattern behind the color blobs. */
  variant?: "plain" | "grid";
}

/**
 * Shared "Aurora Signal" ambient background.
 *
 * Pure CSS, no Motion/JS dependency — safe to render on the server. Always
 * positioned `absolute inset-0` (never `fixed`) so it can be reused inside
 * marketing sections, the dashboard, or the widget iframe without escaping
 * its container. Reuses the existing `animate-helora-aurora` keyframe
 * (transform-only, no animated filters), which already respects
 * `prefers-reduced-motion` globally via globals.css.
 */
export function AuroraBackground({
  className,
  intensity = 0.16,
  variant = "plain",
}: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {variant === "grid" && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(125,211,228,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,228,0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      )}

      {/* Cyan → emerald signal core */}
      <div
        className="animate-helora-aurora absolute -top-1/3 -left-1/4 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--aurora-cyan) 0%, var(--aurora-emerald) 45%, transparent 70%)",
          opacity: intensity,
        }}
      />
      {/* Violet accent */}
      <div
        className="animate-helora-aurora absolute top-1/4 -right-1/4 h-[30rem] w-[30rem] rounded-full blur-3xl [animation-delay:-6s]"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, var(--aurora-violet) 0%, transparent 65%)",
          opacity: intensity * 0.85,
        }}
      />
      {/* Restrained warm accent */}
      <div
        className="animate-helora-aurora absolute bottom-[-20%] left-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl [animation-delay:-11s]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--aurora-coral) 0%, transparent 65%)",
          opacity: intensity * 0.5,
        }}
      />
    </div>
  );
}
