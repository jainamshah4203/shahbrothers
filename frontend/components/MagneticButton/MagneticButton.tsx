"use client";

import React, { cloneElement, ReactElement, Ref } from "react";
import { useMagneticEffect } from "@/hooks/useMagneticEffect";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MagneticButtonProps {
  children: ReactElement;
  /** Magnetic pull strength (0-1). Default: 0.3 */
  strength?: number;
  /** Activation radius in pixels. Default: 100 */
  radius?: number;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  (ref as React.MutableRefObject<T | null>).current = value;
}

/**
 * Wrapper that applies magnetic hover to its child.
 * Magnetic motion is disabled automatically when `prefers-reduced-motion` is set
 * (via `useMagneticEffect` / `useReducedMotion`).
 */
export default function MagneticButton({
  children,
  strength = 0.3,
  radius = 100,
}: MagneticButtonProps) {
  const prefersReduced = useReducedMotion();
  const magneticRef = useMagneticEffect<HTMLElement>({ strength, radius });
  const childRef = (children as ReactElement & { ref?: Ref<HTMLElement> }).ref;

  if (prefersReduced) {
    return children;
  }

  return cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      assignRef(magneticRef, node);
      assignRef(childRef, node);
    },
  } as Partial<typeof children.props>);
}
