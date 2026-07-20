import gsap from "gsap";

export const motionTokens = {
  fast: { duration: 0.3, ease: "power2.out" },
  medium: { duration: 0.6, ease: "power3.out" },
  slow: { duration: 1.2, ease: "power4.out" },
  luxury: { duration: 1.8, ease: "expo.inOut" },
  hero: { duration: 2.5, ease: "power3.inOut" },
  exit: { duration: 0.4, ease: "power2.in" },
  hover: { duration: 0.5, ease: "elastic.out(1, 0.4)" },
  click: { duration: 0.2, ease: "power1.inOut" },
  scroll: { scrub: 1 },
};

// Reusable preset animations
export const motionPresets = {
  fadeIn: (target: gsap.DOMTarget, vars?: gsap.TweenVars) => {
    return gsap.fromTo(
      target,
      { opacity: 0 },
      { opacity: 1, ...motionTokens.medium, ...vars }
    );
  },
  revealUp: (target: gsap.DOMTarget, vars?: gsap.TweenVars) => {
    return gsap.fromTo(
      target,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, ...motionTokens.slow, ...vars }
    );
  },
  scaleIn: (target: gsap.DOMTarget, vars?: gsap.TweenVars) => {
    return gsap.fromTo(
      target,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, ...motionTokens.luxury, ...vars }
    );
  }
};
