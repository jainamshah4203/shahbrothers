"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import { useDeviceCapability } from "./useDeviceCapability";
import { motionTokens } from "../lib/animations";

interface TiltOptions {
  /** Maximum rotation angle in degrees. Default: 10 */
  maxAngle?: number;
  /** Perspective CSS value. Default: 1000 */
  perspective?: number;
  /** Scale factor on hover. Default: 1.05 */
  scale?: number;
}

/**
 * Creates a 3D tilt effect on hover based on mouse position.
 * Timings from `motionTokens.fast`.
 *
 * @param options - Configuration for max angle, perspective, and scale.
 * @returns A ref to attach to the target element.
 */
export function useTiltEffect<T extends HTMLElement = HTMLDivElement>(
  options: TiltOptions = {}
) {
  const ref = useRef<T>(null);
  const prefersReduced = useReducedMotion();
  const { isMobile, tier } = useDeviceCapability();

  const { maxAngle = 10, perspective = 1000, scale = 1.05 } = options;

  useEffect(() => {
    const el = ref.current;

    if (!el || prefersReduced || isMobile || tier === "low") return;

    let xTo: gsap.QuickToFunc | undefined;
    let yTo: gsap.QuickToFunc | undefined;
    let scaleTo: gsap.QuickToFunc | undefined;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      gsap.set(el, { transformPerspective: perspective });

      xTo = gsap.quickTo(el, "rotationY", motionTokens.fast.gsap);
      yTo = gsap.quickTo(el, "rotationX", motionTokens.fast.gsap);
      scaleTo = gsap.quickTo(el, "scale", motionTokens.fast.gsap);
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      xTo?.(x * maxAngle * 2);
      yTo?.(-y * maxAngle * 2);
    };

    const handleMouseEnter = () => {
      scaleTo?.(scale);
    };

    const handleMouseLeave = () => {
      xTo?.(0);
      yTo?.(0);
      scaleTo?.(1);
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      mm.revert();
    };
  }, [maxAngle, perspective, scale, prefersReduced, isMobile, tier]);

  return ref;
}
