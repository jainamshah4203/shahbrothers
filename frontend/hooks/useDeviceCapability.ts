"use client";

import { useState, useEffect } from "react";

/** Device performance tier for adaptive quality scaling. */
export type DeviceTier = "low" | "medium" | "high";

export interface DeviceCapability {
  /** Performance tier based on hardware detection. */
  tier: DeviceTier;
  /** Whether the device is mobile (< 768px viewport). */
  isMobile: boolean;
  /** Whether the primary pointer is coarse (touch). */
  isTouch: boolean;
  /** Whether the device supports WebGL 2.0. */
  hasWebGL2: boolean;
}

const MOBILE_BREAKPOINT = 768;

/**
 * Whether WebGL scenes should mount for this capability profile.
 * Skips mobile, low tier, missing WebGL2, and reduced-motion users.
 */
export function shouldUseWebGL(
  capability: Pick<DeviceCapability, "tier" | "isMobile" | "hasWebGL2">,
  prefersReducedMotion = false
): boolean {
  if (prefersReducedMotion) return false;
  if (capability.isMobile) return false;
  if (!capability.hasWebGL2) return false;
  if (capability.tier === "low") return false;
  return true;
}

/**
 * Maximum device pixel ratio for the given performance tier.
 * Aligns with Hero3D Canvas `dpr` caps: high 2, medium 1.5, low 1.
 */
export function maxDpr(tier: DeviceTier): number {
  if (tier === "high") return 2;
  if (tier === "medium") return 1.5;
  return 1;
}

/**
 * Whether shadow maps / contact shadows should be enabled for the tier.
 */
export function enableShadows(tier: DeviceTier): boolean {
  return tier === "high" || tier === "medium";
}

function detectHasWebGL2(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

function detectGpuScore(): number {
  let gpuScore = 1;
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return gpuScore;

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return gpuScore;

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
    const lowEnd = /mali-4|mali-t[67]|adreno\s*[23]\d{2}|sgx|powervr|intel\s*hd\s*(4[0-5]|5[0-3])/i;
    if (lowEnd.test(renderer)) gpuScore = 0;
    const highEnd = /rtx|radeon\s*rx\s*[567]\d{3}|nvidia\s*ge?force\s*(gtx\s*1[06]|rtx)|apple\s*m[1-4]/i;
    if (highEnd.test(renderer)) gpuScore = 2;
  } catch {
    // WebGL detection failed — keep default score
  }
  return gpuScore;
}

function resolveTier(isMobile: boolean, gpuScore: number): DeviceTier {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

  let score = gpuScore;
  if (cores >= 8) score += 1;
  if (memory >= 8) score += 1;
  if (isMobile) score -= 1;

  if (score <= 1) return "low";
  if (score <= 3) return "medium";
  return "high";
}

/**
 * Detects device hardware capabilities and assigns a performance tier.
 *
 * Uses `navigator.hardwareConcurrency`, `navigator.deviceMemory`,
 * and WebGL renderer string to determine capability. Falls back
 * gracefully when APIs are unavailable.
 *
 * @returns Device capability information including tier and mobile status.
 */
export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>({
    tier: "medium",
    isMobile: false,
    isTouch: false,
    hasWebGL2: true,
  });

  useEffect(() => {
    const hasWebGL2 = detectHasWebGL2();
    const gpuScore = detectGpuScore();
    // Coarse primary pointer = touch-first UX; avoid maxTouchPoints so
    // hybrid laptops with fine pointers keep desktop cursor / Lenis.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    const syncViewportCapability = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const tier = resolveTier(isMobile, gpuScore);
      setCapability({ tier, isMobile, isTouch, hasWebGL2 });
    };

    syncViewportCapability();
    window.addEventListener("resize", syncViewportCapability);
    return () => window.removeEventListener("resize", syncViewportCapability);
  }, []);

  return capability;
}
