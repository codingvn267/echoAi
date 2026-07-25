"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

/**
 * Restrained, enter-only page transition for the authenticated dashboard.
 * Keyed by pathname so Motion replays the enter animation on route change —
 * deliberately avoids AnimatePresence/`mode="wait"` since the Next.js App
 * Router doesn't guarantee persistent layouts get a reliable exit animation
 * before unmounting. Reduced-motion users get an immediate, static render.
 */
export function DashboardPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
