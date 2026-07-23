import type { DeviceTier } from "@/hooks/useDeviceCapability";
import {
  enableShadows,
  maxDpr,
  shouldUseWebGL,
} from "@/hooks/useDeviceCapability";

export type { DeviceTier };
export { enableShadows, maxDpr, shouldUseWebGL };

/**
 * Preferred Canvas / WebGL DPR range by device tier.
 * Use as `dpr={preferredDpr(tier)}` on R3F Canvas.
 */
export function preferredDpr(tier: DeviceTier): [number, number] {
  return [1, maxDpr(tier)];
}

/**
 * Whether particle systems should mount for the tier.
 */
export function enableParticles(tier: DeviceTier): boolean {
  return tier !== "low";
}

/**
 * Lenis + GSAP ticker is expensive on weak GPUs; skip on low tier,
 * mobile, touch, and reduced-motion.
 */
export function shouldEnableSmoothScroll(options: {
  tier: DeviceTier;
  isMobile: boolean;
  isTouch?: boolean;
  prefersReducedMotion: boolean;
}): boolean {
  if (options.prefersReducedMotion) return false;
  if (options.isMobile || options.isTouch) return false;
  if (options.tier === "low") return false;
  return true;
}

/**
 * Custom cursor springs are skipped on low tier, touch, mobile, reduced motion.
 */
export function shouldEnableCustomCursor(options: {
  tier: DeviceTier;
  isMobile: boolean;
  isTouch?: boolean;
  prefersReducedMotion: boolean;
}): boolean {
  if (options.prefersReducedMotion) return false;
  if (options.isMobile || options.isTouch) return false;
  if (options.tier === "low") return false;
  return true;
}

/**
 * Shared `next/dynamic` options for below-fold homepage sections.
 * Keeps SSR so content remains crawlable; chunks load after first paint.
 */
export const belowFoldDynamicOptions = {
  ssr: true,
} as const;
