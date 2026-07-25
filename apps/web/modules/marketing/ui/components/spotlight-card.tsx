"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useRef } from "react";

/**
 * Pointer-tracked spotlight card: a soft radial glow follows the cursor
 * across the card surface. Pure CSS variables — no re-renders, no effect on
 * touch devices, invisible when the pointer leaves.
 */
export const SpotlightCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: React.MouseEvent) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent transition-colors hover:border-white/20",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(167,139,250,0.14), transparent 65%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};
