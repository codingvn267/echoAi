"use client";

import { cn } from "@workspace/ui/lib/utils";
import { useRef } from "react";

/**
 * A 3D parallax tilt container that follows the pointer. Used for the floating
 * product mock in the hero. Disabled on touch / reduced-motion via CSS hover.
 */
export const TiltCard = ({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);

  const handleMove = (e: React.MouseEvent) => {
    const node = ref.current;
    if (!node) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    frame.current = requestAnimationFrame(() => {
      node.style.transform = `perspective(1200px) rotateX(${(-py * max).toFixed(
        2
      )}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(0)`;
    });
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={cn(
        "transition-transform duration-300 ease-out [transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  );
};
