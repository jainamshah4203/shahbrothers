"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { motionTokens } from "@/lib/animations";
import { shouldEnableSmoothScroll } from "@/lib/performance";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SmoothScrollContext = createContext<Lenis | null>(null);

/**
 * Hook to access the current Lenis smooth scroll instance.
 * Useful for imperative scrolling (e.g. lenis.scrollTo('#target'))
 *
 * @returns The Lenis instance or null if disabled (mobile/low-tier/reduced-motion)
 */
export function useLenis() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Provides smooth scrolling capability to the entire application.
 * Skips Lenis + GSAP ticker entirely on low tier, mobile, touch, and reduced motion
 * so weak devices are not RAF-thrashed.
 *
 * @param props - React props containing children
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const prefersReduced = useReducedMotion();
  const { tier, isMobile, isTouch } = useDeviceCapability();

  useEffect(() => {
    if (
      !shouldEnableSmoothScroll({
        tier,
        isMobile,
        isTouch,
        prefersReducedMotion: prefersReduced,
      })
    ) {
      setLenis(null);
      return;
    }

    const { duration, ease } = motionTokens.slow.gsap;
    const easingFunc = gsap.parseEase(ease);

    const instance = new Lenis({
      duration,
      easing: easingFunc,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    instance.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(onTick);
      instance.destroy();
      setLenis(null);
    };
  }, [prefersReduced, isMobile, isTouch, tier]);

  return (
    <SmoothScrollContext.Provider value={lenis}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
