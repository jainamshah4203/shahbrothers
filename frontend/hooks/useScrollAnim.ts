"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";
import {
  motionTokens,
  type DurationTokenName,
} from "../lib/animations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Built-in from-states for reveal mode. */
export type ScrollAnimPreset =
  | "fadeUp"
  | "fadeIn"
  | "scaleIn"
  | "slideLeft"
  | "slideRight";

export type ScrollAnimMode = "reveal" | "scrub";

export interface ScrollAnimOptions {
  /** `reveal` = play-once on enter; `scrub` = scroll-linked. Default: "reveal" */
  mode?: ScrollAnimMode;
  /** Reveal / scrub from-state preset. Default: "fadeUp" */
  preset?: ScrollAnimPreset;
  /** Duration token (ignored for scrub; scrub uses motionTokens.scroll). Default: "slow" */
  token?: DurationTokenName;
  /** ScrollTrigger start. Default: "top 85%" (reveal) / "top bottom" (scrub) */
  start?: string;
  /** ScrollTrigger end — scrub mode. Default: "bottom top" */
  end?: string;
  /** Delay before reveal (seconds). Default: 0 */
  delay?: number;
  /** Override from-state vars. */
  from?: gsap.TweenVars;
  /** Override to-state vars (scrub mode). Default: cleared transforms + opacity 1 */
  to?: gsap.TweenVars;
  /** Reveal toggleActions. Default: "play none none none" */
  toggleActions?: string;
}

const PRESET_FROM: Record<ScrollAnimPreset, gsap.TweenVars> = {
  fadeUp: { opacity: 0, y: 40 },
  fadeIn: { opacity: 0 },
  scaleIn: { opacity: 0, scale: 0.92 },
  slideLeft: { opacity: 0, x: -60 },
  slideRight: { opacity: 0, x: 60 },
};

/**
 * Canonical scroll-driven animation hook (GSAP ScrollTrigger).
 *
 * Prefer this over ad-hoc ScrollTrigger setup. Timings always come from
 * `motionTokens`. Respects `useReducedMotion` (element shown at rest state).
 *
 * @example
 *   const ref = useScrollAnim({ mode: "reveal", token: "luxury" });
 *   const scrubRef = useScrollAnim({ mode: "scrub", preset: "fadeUp" });
 *
 * @param options - Reveal or scrub configuration.
 * @returns A ref to attach to the animated element.
 */
export function useScrollAnim<T extends HTMLElement = HTMLDivElement>(
  options: ScrollAnimOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced = useReducedMotion();

  const {
    mode = "reveal",
    preset = "fadeUp",
    token = "slow",
    delay = 0,
    from,
    to,
    toggleActions = "play none none none",
  } = options;

  const start =
    options.start ?? (mode === "scrub" ? "top bottom" : "top 85%");
  const end = options.end ?? "bottom top";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced) {
      gsap.set(el, { clearProps: "all", opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    const fromVars = { ...PRESET_FROM[preset], ...from };
    const toVars = { opacity: 1, x: 0, y: 0, scale: 1, ...to };
    const timing = motionTokens[token].gsap;

    const ctx = gsap.context(() => {
      if (mode === "scrub") {
        gsap.fromTo(el, fromVars, {
          ...toVars,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start,
            end,
            scrub: motionTokens.scroll.scrub,
          },
        });
        return;
      }

      gsap.from(el, {
        ...fromVars,
        ...timing,
        delay,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [
    mode,
    preset,
    token,
    start,
    end,
    delay,
    from,
    to,
    toggleActions,
    prefersReduced,
  ]);

  return ref;
}
