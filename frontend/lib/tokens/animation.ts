/**
 * Animation & easing token values for CSS / Tailwind.
 * Runtime GSAP presets live in `lib/animations.ts` (Motion agent).
 * These are the design-system source of truth for durations & curves.
 */

/** CSS cubic-bezier curves aligned with GSAP power/expo families */
export const easingTokens = {
  /** power2.out — UI micro-interactions */
  out: 'cubic-bezier(0.33, 1, 0.68, 1)',
  /** power3.out — reveals, medium transitions */
  outStrong: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** power4.out — slow scroll-linked ease */
  outSoft: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** power2.in — exits */
  in: 'cubic-bezier(0.32, 0, 0.67, 0)',
  /** power1.inOut — clicks / toggles */
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
  /** power3.inOut — hero scene blends */
  inOutStrong: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** expo.inOut — luxury scale / cinematic */
  luxury: 'cubic-bezier(0.87, 0, 0.13, 1)',
  /** soft overshoot — hover magnetic feel (CSS approx of elastic) */
  spring: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  /** linear — progress bars, ink fills */
  linear: 'linear',
} as const;

/** CSS duration strings */
export const durationTokens = {
  click: '200ms',
  fast: '300ms',
  exit: '400ms',
  hover: '500ms',
  medium: '600ms',
  slow: '1200ms',
  luxury: '1800ms',
  hero: '2500ms',
} as const;

/** Seconds for JS consumers that prefer numbers */
export const durationSeconds = {
  click: 0.2,
  fast: 0.3,
  exit: 0.4,
  hover: 0.5,
  medium: 0.6,
  slow: 1.2,
  luxury: 1.8,
  hero: 2.5,
} as const;

export const animationTokens = {
  easing: easingTokens,
  duration: durationTokens,
  durationSeconds,
  /** Named presets mirroring Motion `motionTokens` keys */
  presets: {
    fast: { duration: durationTokens.fast, easing: easingTokens.out },
    medium: { duration: durationTokens.medium, easing: easingTokens.outStrong },
    slow: { duration: durationTokens.slow, easing: easingTokens.outSoft },
    luxury: { duration: durationTokens.luxury, easing: easingTokens.luxury },
    hero: { duration: durationTokens.hero, easing: easingTokens.inOutStrong },
    exit: { duration: durationTokens.exit, easing: easingTokens.in },
    hover: { duration: durationTokens.hover, easing: easingTokens.spring },
    click: { duration: durationTokens.click, easing: easingTokens.inOut },
  },
} as const;

export type EasingToken = keyof typeof easingTokens;
export type DurationToken = keyof typeof durationTokens;
