/**
 * Motion Engine — single source of truth for Shah Brothers animation timing.
 *
 * Luxury principle: soft springs / expo curves over elastic bounce.
 * Elastic is reserved for magnetic / hover micro-delight only.
 *
 * Usage (other agents):
 *   import { Motion, motionTokens, framerVariants, gsapVars } from "@/lib/animations";
 *
 *   // Named aliases
 *   gsap.to(el, { ...Motion.Luxury.gsap, opacity: 1 });
 *   <motion.div transition={Motion.Hover.framer} whileHover={Motion.Hover.whileHover} />
 *   <motion.div variants={Motion.Reveal.variants} initial="hidden" animate="visible" />
 *
 *   // Raw tokens
 *   gsap.quickTo(el, "x", motionTokens.fast.gsap);
 *   const t = motionTokens.medium.framer; // { duration, ease: cubic-bezier }
 *
 *   // Helpers
 *   gsap.from(el, { ...gsapVars("slow"), y: 0 });
 */

import gsap from "gsap";
import type { Transition, Variants } from "framer-motion";

/** Framer Motion cubic-bezier tuple. */
export type CubicBezier = [number, number, number, number];

/** Named easings — cubic arrays for Framer, string easings for GSAP. */
export const easings = {
  fast: {
    cubic: [0.25, 0.1, 0.25, 1] as CubicBezier,
    gsap: "power2.out",
  },
  medium: {
    cubic: [0.22, 1, 0.36, 1] as CubicBezier,
    gsap: "power3.out",
  },
  slow: {
    cubic: [0.16, 1, 0.3, 1] as CubicBezier,
    gsap: "power4.out",
  },
  /** Soft luxury curve — expo, not bounce. */
  luxury: {
    cubic: [0.87, 0, 0.13, 1] as CubicBezier,
    gsap: "expo.inOut",
  },
  /** Hero / scroll-linked cinematic curve. */
  hero: {
    cubic: [0.65, 0, 0.35, 1] as CubicBezier,
    gsap: "power3.inOut",
  },
  exit: {
    cubic: [0.4, 0, 1, 1] as CubicBezier,
    gsap: "power2.in",
  },
  /** Elastic micro-delight for magnetic / hover only. */
  hover: {
    cubic: [0.34, 1.56, 0.64, 1] as CubicBezier,
    gsap: "elastic.out(1, 0.4)",
  },
  click: {
    cubic: [0.4, 0, 0.2, 1] as CubicBezier,
    gsap: "power1.inOut",
  },
  /** Soft spring substitute for brand UI (Framer). */
  softSpring: {
    cubic: [0.22, 1, 0.36, 1] as CubicBezier,
    gsap: "power3.out",
  },
} as const;

export type EasingName = keyof typeof easings;

/** Soft spring transition for Framer brand UI (non-elastic). */
export const softSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 22,
  mass: 1,
};

export interface MotionTiming {
  /** Duration in seconds. */
  duration: number;
  /** GSAP-ready vars: { duration, ease }. */
  gsap: { duration: number; ease: string };
  /** Framer-ready transition: { duration, ease: cubic-bezier }. */
  framer: Transition;
}

function timing(
  duration: number,
  easing: (typeof easings)[EasingName],
  framerOverride?: Transition
): MotionTiming {
  return {
    duration,
    gsap: { duration, ease: easing.gsap },
    framer: framerOverride ?? { duration, ease: easing.cubic },
  };
}

/**
 * Canonical timing tokens.
 * Prefer `token.gsap` / `token.framer` — do not spread the whole token into GSAP.
 */
export const motionTokens = {
  fast: timing(0.3, easings.fast),
  medium: timing(0.6, easings.medium),
  slow: timing(1.2, easings.slow),
  luxury: timing(1.8, easings.luxury, {
    duration: 1.8,
    ease: easings.luxury.cubic,
  }),
  hero: timing(2.5, easings.hero),
  exit: timing(0.4, easings.exit),
  /** Magnetic / hover micro-delight — elastic allowed here only. */
  hover: timing(0.5, easings.hover),
  click: timing(0.2, easings.click),
  /** Soft spring token for brand interactions that need spring feel without bounce. */
  softSpring: {
    duration: 0.7,
    gsap: { duration: 0.7, ease: easings.softSpring.gsap },
    framer: softSpring,
  } satisfies MotionTiming,
  /** Scroll-driven scrub — use with ScrollTrigger / useScrollAnim. */
  scroll: {
    scrub: 1 as const,
    gsap: { scrub: 1 as const },
    framer: { type: "tween" as const },
  },
} as const;

export type MotionTokenName = keyof typeof motionTokens;
export type DurationTokenName = Exclude<MotionTokenName, "scroll">;

/** Pick GSAP tween vars from a duration token. */
export function gsapVars(token: DurationTokenName): { duration: number; ease: string } {
  return motionTokens[token].gsap;
}

/** Pick Framer transition from a duration token. */
export function framerTransition(token: DurationTokenName): Transition {
  return motionTokens[token].framer;
}

/** Framer Motion variants for common luxury reveals & interactions. */
export const framerVariants = {
  reveal: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: motionTokens.slow.framer,
    },
  } satisfies Variants,
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: motionTokens.medium.framer,
    },
  } satisfies Variants,
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: motionTokens.luxury.framer,
    },
  } satisfies Variants,
  exit: {
    visible: { opacity: 1, y: 0 },
    hidden: {
      opacity: 0,
      y: -12,
      transition: motionTokens.exit.framer,
    },
  } satisfies Variants,
  hoverLift: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -4,
      scale: 1.02,
      transition: motionTokens.hover.framer,
    },
  } satisfies Variants,
  clickPress: {
    rest: { scale: 1 },
    pressed: {
      scale: 0.97,
      transition: motionTokens.click.framer,
    },
  } satisfies Variants,
  hero: {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: motionTokens.hero.framer,
    },
  } satisfies Variants,
} as const;

/**
 * Named Motion API surface for other agents.
 * Prefer these aliases over raw token keys in UI code.
 */
export const Motion = {
  Fast: {
    ...motionTokens.fast,
    name: "fast" as const,
  },
  Medium: {
    ...motionTokens.medium,
    name: "medium" as const,
  },
  Slow: {
    ...motionTokens.slow,
    name: "slow" as const,
  },
  Luxury: {
    ...motionTokens.luxury,
    name: "luxury" as const,
    spring: softSpring,
  },
  Hero: {
    ...motionTokens.hero,
    name: "hero" as const,
    variants: framerVariants.hero,
  },
  Hover: {
    ...motionTokens.hover,
    name: "hover" as const,
    variants: framerVariants.hoverLift,
    whileHover: { scale: 1.02, transition: motionTokens.hover.framer },
  },
  Click: {
    ...motionTokens.click,
    name: "click" as const,
    variants: framerVariants.clickPress,
    whileTap: { scale: 0.97, transition: motionTokens.click.framer },
  },
  Exit: {
    ...motionTokens.exit,
    name: "exit" as const,
    variants: framerVariants.exit,
  },
  Reveal: {
    ...motionTokens.slow,
    name: "reveal" as const,
    variants: framerVariants.reveal,
    gsapFrom: { opacity: 0, y: 40 } as gsap.TweenVars,
  },
  Scroll: {
    ...motionTokens.scroll,
    name: "scroll" as const,
  },
  SoftSpring: {
    ...motionTokens.softSpring,
    name: "softSpring" as const,
  },
} as const;

/** Reusable GSAP preset animations (imperative). */
export const motionPresets = {
  fadeIn: (target: gsap.DOMTarget, vars?: gsap.TweenVars) => {
    return gsap.fromTo(
      target,
      { opacity: 0 },
      { opacity: 1, ...motionTokens.medium.gsap, ...vars }
    );
  },
  revealUp: (target: gsap.DOMTarget, vars?: gsap.TweenVars) => {
    return gsap.fromTo(
      target,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, ...motionTokens.slow.gsap, ...vars }
    );
  },
  scaleIn: (target: gsap.DOMTarget, vars?: gsap.TweenVars) => {
    return gsap.fromTo(
      target,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, ...motionTokens.luxury.gsap, ...vars }
    );
  },
  exit: (target: gsap.DOMTarget, vars?: gsap.TweenVars) => {
    return gsap.to(target, {
      opacity: 0,
      y: -12,
      ...motionTokens.exit.gsap,
      ...vars,
    });
  },
};
