"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";
import { motionTokens } from "../lib/animations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Available reveal animation presets. */
export type RevealPreset =
  | "fadeUp"
  | "fadeIn"
  | "scaleIn"
  | "slideLeft"
  | "slideRight";

interface RevealOptions {
  /** Animation preset. Default: "fadeUp" */
  preset?: RevealPreset;
  /** Delay before animation starts (seconds). Default: 0 */
  delay?: number;
  /** Animation token to use. Default: "slow" */
  token?: keyof typeof motionTokens;
  /** ScrollTrigger start position. Default: "top 85%" */
  start?: string;
  /** Whether the animation should replay when scrolling back. Default: false */
  toggleActions?: string;
}

const PRESET_FROM: Record<RevealPreset, gsap.TweenVars> = {
  fadeUp: { opacity: 0, y: 40 },
  fadeIn: { opacity: 0 },
  scaleIn: { opacity: 0, scale: 0.85 },
  slideLeft: { opacity: 0, x: -60 },
  slideRight: { opacity: 0, x: 60 },
};

/**
 * Scroll-triggered reveal animation hook using GSAP.
 *
 * Attach the returned ref to any element. When it enters the
 * viewport, it will animate in using the chosen preset.
 * Respects `prefers-reduced-motion` — shows instantly if set.
 *
 * @param options - Animation configuration.
 * @returns A ref to attach to the target element.
 */
export function useRevealAnimation<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced = useReducedMotion();

  const {
    preset = "fadeUp",
    delay = 0,
    token = "slow",
    start = "top 85%",
    toggleActions = "play none none none",
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    const fromVars = PRESET_FROM[preset];
    
    // We ignore duration/ease if the token is "scroll" since scrub handles it
    const tokenProps = motionTokens[token];
    const isScrollToken = token === "scroll";

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      gsap.from(el, {
        ...fromVars,
        ...(isScrollToken ? {} : tokenProps),
        delay,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions,
          ...(isScrollToken ? tokenProps : {}),
        },
      });
    });

    return () => mm.revert();
  }, [preset, delay, token, start, toggleActions, prefersReduced]);

  return ref;
}
