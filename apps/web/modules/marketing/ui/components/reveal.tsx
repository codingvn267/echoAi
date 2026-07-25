"use client";

import { cn } from "@workspace/ui/lib/utils";
import { createElement, useEffect, useRef, useState } from "react";

// Deliberately a concrete union, not `React.ElementType` — once
// @react-three/fiber's types are loaded anywhere in this program, it merges
// hundreds of Three.js elements into the global JSX.IntrinsicElements set,
// which makes a fully-generic `React.ElementType` prop resolve to `never`
// for shared HTML props like `style`/`className`/`ref`. Every real usage of
// Reveal only ever needs a plain block-level HTML tag, so this union is not
// a public-API reduction in practice.
type RevealTag = "div" | "section" | "span" | "article" | "li" | "ul";

/**
 * Reveals its children with a staggered fade + rise the first time it scrolls
 * into view. Honors prefers-reduced-motion (renders visible immediately).
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: RevealTag;
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Rendered via createElement (not JSX's `<Tag>`) because JSX's handling of
  // a union-typed tag name widens shared props like `ref` into an
  // unsatisfiable intersection once @react-three/fiber's global JSX
  // augmentation is loaded anywhere in this program; createElement's plain
  // string-tag overload does not have that limitation.
  return createElement(
    Tag,
    {
      ref,
      style: { transitionDelay: `${delay}ms` },
      className: cn(
        "transition-all duration-700 ease-out will-change-transform",
        shown
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-6 opacity-0 blur-[2px]",
        className
      ),
    },
    children
  );
};
