"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useVelocity,
  useReducedMotion,
  useTransform,
} from "framer-motion";

type StationeryKind = "pen" | "pencil" | "crayon" | "clip" | "seal" | "eraser";

interface StationeryItemConfig {
  id: string;
  kind: StationeryKind;
  side: "left" | "right";
  /** Rest position as % of viewport height */
  restYVh: number;
  /** Inset from outer edge within the gutter */
  inset: string;
  size: number;
  restRotate: number;
  opacity: number;
  color: string;
  accent?: string;
  /** Per-item kick multiplier for variety */
  kickScale: number;
}

interface ScrollStationeryAnimationProps {
  className?: string;
}

/** Colorful crayon / pencil / desk cutouts for left & right side pans */
const ITEMS: StationeryItemConfig[] = [
  // —— Left gutter ——
  {
    id: "crayon-l1",
    kind: "crayon",
    side: "left",
    restYVh: 8,
    inset: "18%",
    size: 78,
    restRotate: -22,
    opacity: 0.88,
    color: "#C2593F",
    accent: "#E8A090",
    kickScale: 1.15,
  },
  {
    id: "pencil-l1",
    kind: "pencil",
    side: "left",
    restYVh: 22,
    inset: "8%",
    size: 92,
    restRotate: 38,
    opacity: 0.85,
    color: "#D4AF37",
    accent: "#1C2D42",
    kickScale: 1.0,
  },
  {
    id: "crayon-l2",
    kind: "crayon",
    side: "left",
    restYVh: 36,
    inset: "28%",
    size: 70,
    restRotate: 12,
    opacity: 0.82,
    color: "#1C2D42",
    accent: "#D4AF37",
    kickScale: 1.25,
  },
  {
    id: "pen-l1",
    kind: "pen",
    side: "left",
    restYVh: 48,
    inset: "6%",
    size: 88,
    restRotate: -42,
    opacity: 0.8,
    color: "#1A1A1A",
    accent: "#D4AF37",
    kickScale: 0.95,
  },
  {
    id: "clip-l1",
    kind: "clip",
    side: "left",
    restYVh: 58,
    inset: "32%",
    size: 48,
    restRotate: 25,
    opacity: 0.78,
    color: "#D4AF37",
    kickScale: 1.4,
  },
  {
    id: "crayon-l3",
    kind: "crayon",
    side: "left",
    restYVh: 68,
    inset: "12%",
    size: 74,
    restRotate: -8,
    opacity: 0.84,
    color: "#2D6A4F",
    accent: "#95D5B2",
    kickScale: 1.1,
  },
  {
    id: "pencil-l2",
    kind: "pencil",
    side: "left",
    restYVh: 80,
    inset: "22%",
    size: 86,
    restRotate: -30,
    opacity: 0.86,
    color: "#C2593F",
    accent: "#1A1A1A",
    kickScale: 1.2,
  },
  {
    id: "seal-l1",
    kind: "seal",
    side: "left",
    restYVh: 90,
    inset: "16%",
    size: 52,
    restRotate: 6,
    opacity: 0.75,
    color: "#C2593F",
    accent: "#D4AF37",
    kickScale: 0.9,
  },
  // —— Right gutter ——
  {
    id: "pencil-r1",
    kind: "pencil",
    side: "right",
    restYVh: 10,
    inset: "10%",
    size: 90,
    restRotate: 28,
    opacity: 0.86,
    color: "#1C2D42",
    accent: "#D4AF37",
    kickScale: 1.05,
  },
  {
    id: "crayon-r1",
    kind: "crayon",
    side: "right",
    restYVh: 24,
    inset: "24%",
    size: 76,
    restRotate: -18,
    opacity: 0.88,
    color: "#D4AF37",
    accent: "#F5E6A8",
    kickScale: 1.2,
  },
  {
    id: "crayon-r2",
    kind: "crayon",
    side: "right",
    restYVh: 38,
    inset: "8%",
    size: 72,
    restRotate: 20,
    opacity: 0.84,
    color: "#C2593F",
    accent: "#E8A090",
    kickScale: 1.15,
  },
  {
    id: "clip-r1",
    kind: "clip",
    side: "right",
    restYVh: 50,
    inset: "30%",
    size: 46,
    restRotate: -35,
    opacity: 0.8,
    color: "#D4AF37",
    kickScale: 1.35,
  },
  {
    id: "pen-r1",
    kind: "pen",
    side: "right",
    restYVh: 60,
    inset: "12%",
    size: 84,
    restRotate: 18,
    opacity: 0.82,
    color: "#1C2D42",
    accent: "#D4AF37",
    kickScale: 1.0,
  },
  {
    id: "pencil-r2",
    kind: "pencil",
    side: "right",
    restYVh: 72,
    inset: "20%",
    size: 88,
    restRotate: -25,
    opacity: 0.85,
    color: "#2D6A4F",
    accent: "#1A1A1A",
    kickScale: 1.18,
  },
  {
    id: "crayon-r3",
    kind: "crayon",
    side: "right",
    restYVh: 84,
    inset: "14%",
    size: 70,
    restRotate: 14,
    opacity: 0.87,
    color: "#5C4B8A",
    accent: "#C9B8E8",
    kickScale: 1.22,
  },
  {
    id: "eraser-r1",
    kind: "eraser",
    side: "right",
    restYVh: 94,
    inset: "26%",
    size: 54,
    restRotate: -10,
    opacity: 0.78,
    color: "#EFECE6",
    accent: "#C2593F",
    kickScale: 0.85,
  },
];

function StationeryGlyph({
  kind,
  color,
  accent,
  size,
}: {
  kind: StationeryKind;
  color: string;
  accent?: string;
  size: number;
}): React.ReactElement {
  const stroke = accent ?? color;

  switch (kind) {
    case "pen":
      return (
        <svg
          width={size}
          height={size * 0.28}
          viewBox="0 0 100 28"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="8" y="10" width="62" height="8" rx="2" fill={color} />
          <path d="M70 10 L92 14 L70 18 Z" fill={stroke} />
          <rect x="2" y="9" width="8" height="10" rx="1" fill={stroke} />
          <circle cx="22" cy="14" r="2" fill={stroke} opacity="0.7" />
        </svg>
      );
    case "pencil":
      return (
        <svg
          width={size}
          height={size * 0.22}
          viewBox="0 0 100 22"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="12" y="7" width="58" height="8" fill={color} />
          <path
            d="M70 7 L92 11 L70 15 Z"
            fill="#FAF9F5"
            stroke={color}
            strokeWidth="0.5"
          />
          <rect
            x="4"
            y="6"
            width="10"
            height="10"
            rx="1"
            fill={accent ?? "#C2593F"}
          />
          <line
            x1="20"
            y1="7"
            x2="20"
            y2="15"
            stroke="#1A1A1A"
            strokeWidth="0.6"
            opacity="0.35"
          />
          <line
            x1="24"
            y1="7"
            x2="24"
            y2="15"
            stroke="#1A1A1A"
            strokeWidth="0.4"
            opacity="0.25"
          />
        </svg>
      );
    case "crayon":
      return (
        <svg
          width={size * 0.38}
          height={size}
          viewBox="0 0 24 70"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="5" y="12" width="14" height="48" rx="3" fill={color} />
          <path d="M5 12 L12 1.5 L19 12 Z" fill={color} />
          <path d="M8 12 L12 4 L16 12 Z" fill={stroke} opacity="0.45" />
          <rect
            x="5"
            y="52"
            width="14"
            height="12"
            rx="2"
            fill="#FAF9F5"
            opacity="0.35"
          />
          <rect
            x="5"
            y="58"
            width="14"
            height="6"
            rx="1"
            fill={stroke}
            opacity="0.5"
          />
        </svg>
      );
    case "clip":
      return (
        <svg
          width={size * 0.45}
          height={size}
          viewBox="0 0 24 48"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M8 6 C8 3 16 3 16 8 L16 32 C16 38 8 38 8 32 L8 14 C8 10 14 10 14 14 L14 28"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "seal":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="24" cy="22" r="16" fill={color} />
          <circle
            cx="24"
            cy="22"
            r="10"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            opacity="0.7"
          />
          <path
            d="M18 38 L24 30 L30 38 L24 44 Z"
            fill={color}
            opacity="0.85"
          />
          <circle cx="24" cy="22" r="3" fill={stroke} opacity="0.8" />
        </svg>
      );
    case "eraser":
      return (
        <svg
          width={size}
          height={size * 0.55}
          viewBox="0 0 48 26"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <rect
            x="2"
            y="4"
            width="44"
            height="18"
            rx="3"
            fill={color}
            stroke="#4A443F"
            strokeWidth="0.8"
          />
          <rect
            x="2"
            y="4"
            width="14"
            height="18"
            rx="3"
            fill={accent ?? "#C2593F"}
          />
        </svg>
      );
    default:
      return <></>;
  }
}

interface PhysicsItemProps {
  config: StationeryItemConfig;
  scrollVelocity: ReturnType<typeof useVelocity>;
  scrollY: ReturnType<typeof useScroll>["scrollY"];
  reducedMotion: boolean;
}

const PhysicsItem: React.FC<PhysicsItemProps> = ({
  config,
  scrollVelocity,
  scrollY,
  reducedMotion,
}) => {
  const yKick = useMotionValue(0);
  const rotateKick = useMotionValue(0);

  const ySpring = useSpring(yKick, {
    stiffness: 38,
    damping: 11,
    mass: 0.7,
  });
  const rotateSpring = useSpring(rotateKick, {
    stiffness: 34,
    damping: 10,
    mass: 0.75,
  });

  // Gentle parallax drift so pieces feel tied to page scroll
  const parallax = useTransform(
    scrollY,
    [0, 2000],
    [0, config.side === "left" ? -40 : 40]
  );

  const spinSign = useMemo(
    () => (config.id.charCodeAt(config.id.length - 1) % 2 === 0 ? 1 : -1),
    [config.id]
  );
  const spinRange = useMemo(
    () => 18 + (config.id.charCodeAt(0) % 28),
    [config.id]
  );

  const lastKickRef = useRef(0);
  const combinedRotate = useMotionValue(config.restRotate);
  const combinedY = useMotionValue(0);

  useEffect(() => {
    if (reducedMotion) {
      combinedRotate.set(config.restRotate);
      return;
    }
    return rotateSpring.on("change", (kick) => {
      combinedRotate.set(config.restRotate + kick);
    });
  }, [rotateSpring, combinedRotate, config.restRotate, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const unsubKick = ySpring.on("change", (k) => {
      combinedY.set(k + parallax.get());
    });
    const unsubParallax = parallax.on("change", (p) => {
      combinedY.set(ySpring.get() + p);
    });
    return () => {
      unsubKick();
      unsubParallax();
    };
  }, [ySpring, parallax, combinedY, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = scrollVelocity.on("change", (v) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const abs = Math.abs(v);

        // Soft gravity when scrolling slows
        if (abs < 120) {
          yKick.set(yKick.get() * 0.88);
          rotateKick.set(rotateKick.get() * 0.9);
          return;
        }

        const now = performance.now();
        // Stagger kicks slightly per item via kickScale delay feel
        if (now - lastKickRef.current < 36 / config.kickScale) return;
        lastKickRef.current = now;

        // Scroll down → items jump up; scroll up → fall reverse
        const direction = v > 0 ? -1 : 1;
        const kick =
          Math.min(abs * 0.08, 140) * direction * config.kickScale;
        const tumble =
          spinSign * Math.min(abs * 0.035, spinRange) * config.kickScale;

        yKick.set(yKick.get() * 0.35 + kick);
        rotateKick.set(rotateKick.get() * 0.3 + tumble);

        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          yKick.set(0);
          rotateKick.set(0);
        }, 520);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      if (settleTimer) clearTimeout(settleTimer);
      unsubscribe();
    };
  }, [
    scrollVelocity,
    reducedMotion,
    yKick,
    rotateKick,
    spinSign,
    spinRange,
    config.kickScale,
  ]);

  const sideStyle =
    config.side === "left"
      ? { left: config.inset }
      : { right: config.inset };

  return (
    <motion.div
      className="pointer-events-none absolute will-change-transform"
      style={{
        top: `${config.restYVh}vh`,
        ...sideStyle,
        y: reducedMotion ? 0 : combinedY,
        rotate: reducedMotion ? config.restRotate : combinedRotate,
        opacity: config.opacity,
        filter: "drop-shadow(0 10px 18px rgba(26,26,26,0.12))",
      }}
      aria-hidden="true"
    >
      <StationeryGlyph
        kind={config.kind}
        color={config.color}
        accent={config.accent}
        size={config.size}
      />
    </motion.div>
  );
};

/**
 * Fixed left/right side pans of stationery cutouts.
 * Scroll velocity kicks crayons & pencils upward with tumble;
 * gravity settles them back into the gutters — never over content.
 */
export const ScrollStationeryAnimation: React.FC<
  ScrollStationeryAnimationProps
> = ({ className = "" }) => {
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[30] overflow-hidden ${className}`}
      aria-hidden="true"
      role="presentation"
      inert
    >
      {/* Desktop / tablet gutters — outside content column */}
      <div className="relative mx-auto hidden h-full w-full md:block">
        <div className="absolute inset-y-0 left-0 w-[min(14vw,168px)]">
          {ITEMS.filter((i) => i.side === "left").map((item) => (
            <PhysicsItem
              key={item.id}
              config={item}
              scrollVelocity={scrollVelocity}
              scrollY={scrollY}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 w-[min(14vw,168px)]">
          {ITEMS.filter((i) => i.side === "right").map((item) => (
            <PhysicsItem
              key={item.id}
              config={item}
              scrollVelocity={scrollVelocity}
              scrollY={scrollY}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>

      {/* Mobile: sparse, low-opacity edge pieces */}
      <div className="relative h-full md:hidden">
        {ITEMS.filter((_, idx) => idx % 4 === 0).map((item) => (
          <PhysicsItem
            key={`m-${item.id}`}
            config={{
              ...item,
              opacity: item.opacity * 0.4,
              size: item.size * 0.65,
            }}
            scrollVelocity={scrollVelocity}
            scrollY={scrollY}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollStationeryAnimation;
