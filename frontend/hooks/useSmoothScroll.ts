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
 *
 * @returns The Lenis instance reference.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const prefersReduced = useReducedMotion();
  const { isMobile } = useDeviceCapability();

  useEffect(() => {
    // Disable smooth scrolling on mobile or if reduced motion is preferred
    if (prefersReduced || isMobile) {
      return;
    }

    const easingFunc = gsap.parseEase(motionTokens.slow.ease);

    // Initialize Lenis
    const lenis = new Lenis({
      duration: motionTokens.slow.duration,
      easing: easingFunc,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    // Integrate with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReduced, isMobile]);

  return lenisRef;
}
