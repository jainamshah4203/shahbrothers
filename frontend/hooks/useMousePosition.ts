"use client";

import { useEffect, useCallback, useRef, MutableRefObject } from "react";
import { motionTokens } from "../lib/animations";

export interface MousePosition {
  /** Raw X position in pixels. */
  x: number;
  /** Raw Y position in pixels. */
  y: number;
  /** X position normalized to [-1, 1] (center = 0). */
  normalizedX: number;
  /** Y position normalized to [-1, 1] (center = 0). */
  normalizedY: number;
}

const INITIAL: MousePosition = { x: 0, y: 0, normalizedX: 0, normalizedY: 0 };

/**
 * Default lerp derived from fast token duration so tracking stays in sync
 * with motionTokens (shorter duration → snappier follow).
 */
function lerpFromToken(): number {
  const d = motionTokens.fast.duration;
  // Map ~0.3s → ~0.05–0.12 range; clamp for stability.
  return Math.min(0.15, Math.max(0.04, 0.15 * (0.3 / d)));
}

/**
 * Tracks mouse position with smooth interpolation via `requestAnimationFrame`.
 *
 * Returns a MutableRefObject containing both raw pixel coordinates and normalized
 * [-1, 1] values centered on the viewport. The lerp factor controls smoothing speed
 * (lower = smoother, higher = more responsive). Uses ref to avoid 60fps re-renders.
 *
 * Default lerp is derived from `motionTokens.fast` when omitted.
 *
 * @param lerpFactor - Interpolation speed between 0 and 1. Default from motionTokens.
 */
export function useMousePosition(
  lerpFactor?: number
): MutableRefObject<MousePosition> {
  const resolvedLerp = lerpFactor ?? lerpFromToken();
  const positionRef = useRef<MousePosition>({ ...INITIAL });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetRef.current.x = e.clientX;
    targetRef.current.y = e.clientY;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;

      cur.x += (tgt.x - cur.x) * resolvedLerp;
      cur.y += (tgt.y - cur.y) * resolvedLerp;

      const w = window.innerWidth;
      const h = window.innerHeight;

      positionRef.current = {
        x: cur.x,
        y: cur.y,
        normalizedX: (cur.x / w) * 2 - 1,
        normalizedY: -(cur.y / h) * 2 + 1,
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [resolvedLerp, handleMouseMove]);

  return positionRef;
}
