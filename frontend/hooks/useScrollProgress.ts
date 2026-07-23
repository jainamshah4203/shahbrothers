"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionTokens } from "../lib/animations";
import { useReducedMotion } from "./useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollProgressOptions {
  /** Start trigger position. Default: "top bottom" */
  start?: string;
  /** End trigger position. Default: "bottom top" */
  end?: string;
  /** Whether to scrub the animation. Default: true (uses motionTokens.scroll). */
  scrub?: boolean;
}

/**
 * Returns a scroll progress value (0–1) for a given element ref
 * using GSAP ScrollTrigger. Scrub intensity from `motionTokens.scroll`.
 *
 * Attach the returned `ref` to the container element whose scroll
 * position you want to track. The `progress` value animates from
 * 0 to 1 as the element scrolls through the viewport.
 *
 * @param options - ScrollTrigger configuration overrides.
 */
export function useScrollProgress(options: ScrollProgressOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const prefersReduced = useReducedMotion();

  const { start = "top bottom", end = "bottom top", scrub = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced) {
      setProgress(1);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      scrub: scrub ? motionTokens.scroll.scrub : undefined,
      onUpdate: (self) => setProgress(self.progress),
    });

    return () => {
      trigger.kill();
    };
  }, [start, end, scrub, prefersReduced]);

  return { ref, progress };
}
