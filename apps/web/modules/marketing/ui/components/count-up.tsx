"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a stat like "38%", "<3s", "24/7" from zero to its final value the
 * first time it scrolls into view. Non-numeric stats render as-is. Honors
 * prefers-reduced-motion by skipping straight to the final value.
 */
export const CountUp = ({
  value,
  duration = 1400,
}: {
  value: string;
  duration?: number;
}) => {
  const match = /^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(match ? `${match[1]}0${match[3]}` : value);

  useEffect(() => {
    const node = ref.current;
    if (!node || !match) return;

    const [, prefix = "", digits = "0", suffix = ""] = match;
    const target = Number(digits);
    const decimals = digits.includes(".") ? digits.split(".")[1]!.length : 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame: number;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
};
