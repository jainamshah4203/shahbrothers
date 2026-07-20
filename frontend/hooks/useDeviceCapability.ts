"use client";

import { useState, useEffect } from "react";

/** Device performance tier for adaptive quality scaling. */
export type DeviceTier = "low" | "medium" | "high";

interface DeviceCapability {
  /** Performance tier based on hardware detection. */
  tier: DeviceTier;
  /** Whether the device is mobile (< 768px viewport). */
  isMobile: boolean;
  /** Whether the device supports WebGL 2.0. */
  hasWebGL2: boolean;
}

const MOBILE_BREAKPOINT = 768;

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
    hasWebGL2: true,
  });

  useEffect(() => {
    const calculateCapability = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const hasWebGL2 = !!document.createElement("canvas").getContext("webgl2");

    let gpuScore = 1;
    try {
      const gl = document.createElement("canvas").getContext("webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
          const lowEnd = /mali-4|mali-t[67]|adreno\s*[23]\d{2}|sgx|powervr|intel\s*hd\s*(4[0-5]|5[0-3])/i;
          if (lowEnd.test(renderer)) gpuScore = 0;
          const highEnd = /rtx|radeon\s*rx\s*[567]\d{3}|nvidia\s*ge?force\s*(gtx\s*1[06]|rtx)|apple\s*m[1-4]/i;
          if (highEnd.test(renderer)) gpuScore = 2;
        }
      }
    } catch {
      // WebGL detection failed — keep default score
    }

    let score = gpuScore;
    if (cores >= 8) score += 1;
    if (memory >= 8) score += 1;
    if (isMobile) score -= 1;

    let tier: DeviceTier;
    if (score <= 1) tier = "low";
    else if (score <= 3) tier = "medium";
    else tier = "high";

    setCapability({ tier, isMobile, hasWebGL2 });
    };

    calculateCapability();
    window.addEventListener("resize", calculateCapability);
    return () => window.removeEventListener("resize", calculateCapability);
  }, []);

  return capability;
}
