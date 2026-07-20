"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useMousePosition } from "./useMousePosition";
import { useReducedMotion } from "./useReducedMotion";
import { useDeviceCapability } from "./useDeviceCapability";
import { motionTokens } from "../lib/animations";

interface ParallaxOptions {
  /** Maximum movement distance in pixels. Default: 20 */
  depth?: number;
  /** Whether to invert the movement direction. Default: false */
  invert?: boolean;
}

/**
 * Creates a mouse-driven parallax effect.
 *
 * The element moves slightly based on the mouse position relative to the center
 * of the screen, creating an illusion of depth. Uses `useMousePosition` internally.
 * Disabled automatically on low-tier devices or if reduced motion is preferred.
 *
 * @param options - Configuration for the parallax effect.
 * @returns A ref to attach to the target element.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
) {
  const ref = useRef<T>(null);
  const mousePosRef = useMousePosition(0.05); // Smooth interpolation
  const prefersReduced = useReducedMotion();
  const { tier, isMobile } = useDeviceCapability();

  const { depth = 20, invert = false } = options;

  useEffect(() => {
    const el = ref.current;
    
    // Disable on mobile, low-tier devices, or if reduced motion is requested
    if (!el || prefersReduced || isMobile || tier === "low") {
       return;
    }

    let xTo: gsap.QuickToFunc | undefined;
    let yTo: gsap.QuickToFunc | undefined;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      // Create quickTo functions for optimal performance using fast motion token
      xTo = gsap.quickTo(el, "x", motionTokens.fast);
      yTo = gsap.quickTo(el, "y", motionTokens.fast);
    });
    
    const direction = invert ? -1 : 1;
    
    // Animate via GSAP ticker so we don't cause React re-renders
    const tick = () => {
      if (xTo && yTo) {
        xTo(mousePosRef.current.normalizedX * depth * direction);
        yTo(mousePosRef.current.normalizedY * depth * direction);
      }
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      mm.revert();
    };
  }, [depth, invert, prefersReduced, isMobile, tier, mousePosRef]);

  return ref;
}
