"use client";

import React, { cloneElement, ReactElement } from "react";
import { useMagneticEffect } from "@/hooks/useMagneticEffect";

interface MagneticButtonProps {
  children: ReactElement;
  /** Magnetic pull strength (0-1). Default: 0.3 */
  strength?: number;
  /** Activation radius in pixels. Default: 100 */
  radius?: number;
}

/**
 * Wrapper component that applies a magnetic hover effect to its child.
 * The child must be a valid React Element that accepts a ref.
 */
export default function MagneticButton({ 
  children, 
  strength = 0.3, 
  radius = 100 
}: MagneticButtonProps) {
  const magneticRef = useMagneticEffect<HTMLElement>({ strength, radius });

  // Clone the child to inject the ref transparently
  return cloneElement(children, {
    ref: magneticRef,
  });
}
