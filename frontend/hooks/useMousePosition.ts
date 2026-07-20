"use client";

import { useEffect, useCallback, useRef, MutableRefObject } from "react";

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
 * Tracks mouse position with smooth interpolation via `requestAnimationFrame`.
 *
 * Returns a MutableRefObject containing both raw pixel coordinates and normalized
 * [-1, 1] values centered on the viewport. The lerp factor controls smoothing speed
 * (lower = smoother, higher = more responsive). Uses ref to avoid 60fps re-renders.
 *
 * @param lerpFactor - Interpolation speed between 0 and 1. Default 0.1.
 */
export function useMousePosition(lerpFactor = 0.1): MutableRefObject<MousePosition> {
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

      cur.x += (tgt.x - cur.x) * lerpFactor;
      cur.y += (tgt.y - cur.y) * lerpFactor;

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
  }, [lerpFactor, handleMouseMove]);

  return positionRef;
}
