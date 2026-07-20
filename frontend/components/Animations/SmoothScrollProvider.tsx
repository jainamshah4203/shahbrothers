"use client";

import React, { createContext, useContext } from "react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Lenis from "lenis";

// Create context to provide the Lenis instance to any child components that need imperative control
const SmoothScrollContext = createContext<Lenis | null>(null);

/**
 * Hook to access the current Lenis smooth scroll instance.
 * Useful for imperative scrolling (e.g. lenis.scrollTo('#target'))
 * 
 * @returns The Lenis instance or null if disabled (mobile/reduced-motion)
 */
export function useLenis() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Provides smooth scrolling capability to the entire application.
 * Wraps useSmoothScroll to initialize Lenis and makes the instance available via context.
 * 
 * @param props - React props containing children
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useSmoothScroll();

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
