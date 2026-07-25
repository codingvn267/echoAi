"use client";

import { motion, useReducedMotion } from "motion/react";

const WORDS = ["chat", "and", "voice", "support"];

/**
 * Word-level emphasis for the hero's key phrase. Renders as real, crawlable
 * DOM text at all times (no runtime text-splitting/mutation); only the
 * per-word entrance animation is skipped for prefers-reduced-motion.
 */
export function HeroHeadlineEmphasis() {
  const reduceMotion = useReducedMotion();

  return (
    <span className="text-gradient-aurora">
      {WORDS.map((word, i) => (
        <motion.span
          key={word}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: reduceMotion ? 0 : 0.15 + i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
        >
          {word}
          {i < WORDS.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}
