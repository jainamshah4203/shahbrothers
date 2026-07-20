"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import { motionTokens } from "../lib/animations";

interface MagneticOptions {
  /** How strongly the element is pulled towards the cursor (0 to 1). Default: 0.3 */
  strength?: number;
  /** Radius in pixels around the element where the magnetic effect starts. Default: 100 */
  radius?: number;
}

/**
 * Creates a magnetic hover effect where the element is pulled towards the mouse pointer.
 *
 * @param options - Configuration options for strength and activation radius.
 * @returns A ref to attach to the target element.
 */
export function useMagneticEffect<T extends HTMLElement = HTMLDivElement>(
  options: MagneticOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced = useReducedMotion();

  const { strength = 0.3, radius = 100 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    let xTo: gsap.QuickToFunc | undefined;
    let yTo: gsap.QuickToFunc | undefined;
    
    // Using gsap.context for easy cleanup
    const ctx = gsap.context(() => {
      xTo = gsap.quickTo(el, "x", motionTokens.hover);
      yTo = gsap.quickTo(el, "y", motionTokens.hover);
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const hWidth = rect.width / 2;
      const hHeight = rect.height / 2;
      
      const centerX = rect.left + hWidth;
      const centerY = rect.top + hHeight;
      
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      
      // Check if mouse is within the activation radius
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < radius) {
        // Apply magnetic pull
        xTo?.(distX * strength);
        yTo?.(distY * strength);
      } else {
        // Reset position
        xTo?.(0);
        yTo?.(0);
      }
    };

    const handleMouseLeave = () => {
      xTo?.(0);
      yTo?.(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      ctx.revert();
    };
  }, [strength, radius, prefersReduced]);

  return ref;
}
