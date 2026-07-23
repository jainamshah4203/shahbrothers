"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";
import { useDeviceCapability } from "./useDeviceCapability";
import { motionTokens } from "../lib/animations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook to initialize and manage Lenis smooth scrolling.
 * Integrates directly with GSAP ScrollTrigger.
 * Duration / easing from `motionTokens.slow`.
 *
 * API (stable for SmoothScrollProvider):
 *   returns `React.MutableRefObject<Lenis | null>`
 *
 * @returns The Lenis instance reference.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const prefersReduced = useReducedMotion();
  const { isMobile } = useDeviceCapability();

  useEffect(() => {
    if (prefersReduced || isMobile) {
      return;
    }

    const { duration, ease } = motionTokens.slow.gsap;
    const easingFunc = gsap.parseEase(ease);

    const lenis = new Lenis({
      duration,
      easing: easingFunc,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReduced, isMobile]);

  return lenisRef;
}
