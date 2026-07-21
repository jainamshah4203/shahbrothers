"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useVelocity,
  useReducedMotion,
} from "framer-motion";

type StationeryKind =
  | "pen"
  | "pencil"
  | "crayon"
  | "clip"
  | "seal"
  | "eraser";

interface StationeryItemConfig {
  id: string;
  kind: StationeryKind;
  side: "left" | "right";
  /** Vertical start as % of document scroll height (0–100) */
  restY: number;
  /** Horizontal inset from side edge (px or %) */
  inset: string;
  size: number;
  restRotate: number;
  opacity: number;
  color: string;
  accent?: string;
}

interface ScrollStationeryAnimationProps {
  className?: string;
}

const ITEMS: StationeryItemConfig[] = [
  {
    id: "pen-l",
    kind: "pen",
    side: "left",
    restY: 12,
    inset: "1.5%",
    size: 72,
    restRotate: -28,
    opacity: 0.55,
    color: "#1C2D42",
    accent: "#D4AF37",
  },
  {
    id: "clip-l",
    kind: "clip",
    side: "left",
    restY: 28,
    inset: "4%",
    size: 36,
    restRotate: 18,
    opacity: 0.5,
    color: "#D4AF37",
  },
  {
    id: "crayon-l",
    kind: "crayon",
    side: "left",
    restY: 48,
    inset: "2%",
    size: 48,
    restRotate: -12,
    opacity: 0.45,
    color: "#C2593F",
  },
  {
    id: "seal-l",
    kind: "seal",
    side: "left",
    restY: 68,
    inset: "3.5%",
    size: 44,
    restRotate: 8,
    opacity: 0.5,
    color: "#C2593F",
    accent: "#D4AF37",
  },
  {
    id: "eraser-l",
    kind: "eraser",
    side: "left",
    restY: 88,
    inset: "2%",
    size: 40,
    restRotate: -6,
    opacity: 0.4,
    color: "#EFECE6",
    accent: "#C2593F",
  },
  {
    id: "pencil-r",
    kind: "pencil",
    side: "right",
    restY: 18,
    inset: "2%",
    size: 64,
    restRotate: 22,
    opacity: 0.5,
    color: "#D4AF37",
    accent: "#1C2D42",
  },
  {
    id: "seal-r",
    kind: "seal",
    side: "right",
    restY: 36,
    inset: "4%",
    size: 40,
    restRotate: -14,
    opacity: 0.48,
    color: "#1C2D42",
    accent: "#D4AF37",
  },
  {
    id: "clip-r",
    kind: "clip",
    side: "right",
    restY: 55,
    inset: "1.5%",
    size: 32,
    restRotate: 32,
    opacity: 0.45,
    color: "#D4AF37",
  },
  {
    id: "pen-r",
    kind: "pen",
    side: "right",
    restY: 72,
    inset: "3%",
    size: 68,
    restRotate: 15,
    opacity: 0.52,
    color: "#1A1A1A",
    accent: "#D4AF37",
  },
  {
    id: "crayon-r",
    kind: "crayon",
    side: "right",
    restY: 90,
    inset: "2.5%",
    size: 46,
    restRotate: -20,
    opacity: 0.42,
    color: "#1C2D42",
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
        <svg width={size} height={size * 0.28} viewBox="0 0 100 28" fill="none" aria-hidden>
          <rect x="8" y="10" width="62" height="8" rx="2" fill={color} />
          <path d="M70 10 L92 14 L70 18 Z" fill={stroke} />
          <rect x="2" y="9" width="8" height="10" rx="1" fill={stroke} />
          <circle cx="22" cy="14" r="2" fill={stroke} opacity="0.7" />
        </svg>
      );
    case "pencil":
      return (
        <svg width={size} height={size * 0.22} viewBox="0 0 100 22" fill="none" aria-hidden>
          <rect x="12" y="7" width="58" height="8" fill={color} />
          <path d="M70 7 L92 11 L70 15 Z" fill="#EFECE6" stroke={color} strokeWidth="0.5" />
          <rect x="4" y="6" width="10" height="10" rx="1" fill={accent ?? "#C2593F"} />
          <line x1="20" y1="7" x2="20" y2="15" stroke={accent ?? "#1A1A1A"} strokeWidth="0.6" opacity="0.4" />
        </svg>
      );
    case "crayon":
      return (
        <svg width={size * 0.35} height={size} viewBox="0 0 24 70" fill="none" aria-hidden>
          <rect x="6" y="12" width="12" height="48" rx="2" fill={color} />
          <path d="M6 12 L12 2 L18 12 Z" fill={color} opacity="0.85" />
          <rect x="6" y="52" width="12" height="10" rx="1" fill={stroke} opacity="0.35" />
        </svg>
      );
    case "clip":
      return (
        <svg width={size * 0.45} height={size} viewBox="0 0 24 48" fill="none" aria-hidden>
          <path
            d="M8 6 C8 3 16 3 16 8 L16 32 C16 38 8 38 8 32 L8 14 C8 10 14 10 14 14 L14 28"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "seal":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
          <circle cx="24" cy="22" r="16" fill={color} />
          <circle cx="24" cy="22" r="10" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.7" />
          <path d="M18 38 L24 30 L30 38 L24 44 Z" fill={color} opacity="0.85" />
          <circle cx="24" cy="22" r="3" fill={stroke} opacity="0.8" />
        </svg>
      );
    case "eraser":
      return (
        <svg width={size} height={size * 0.55} viewBox="0 0 48 26" fill="none" aria-hidden>
          <rect x="2" y="4" width="44" height="18" rx="3" fill={color} stroke="#4A443F" strokeWidth="0.8" />
          <rect x="2" y="4" width="14" height="18" rx="3" fill={accent ?? "#C2593F"} />
        </svg>
      );
    default:
      return <></>;
  }
}

interface PhysicsItemProps {
  config: StationeryItemConfig;
  scrollVelocity: ReturnType<typeof useVelocity>;
  reducedMotion: boolean;
}

const PhysicsItem: React.FC<PhysicsItemProps> = ({
  config,
  scrollVelocity,
  reducedMotion,
}) => {
  const yKick = useMotionValue(0);
  const rotateKick = useMotionValue(0);

  const ySpring = useSpring(yKick, {
    stiffness: 48,
    damping: 14,
    mass: 0.85,
  });
  const rotateSpring = useSpring(rotateKick, {
    stiffness: 42,
    damping: 12,
    mass: 0.9,
  });

  const spinSign = useMemo(
    () => (config.id.charCodeAt(0) % 2 === 0 ? 1 : -1),
    [config.id]
  );
  const spinRange = useMemo(
    () => 15 + (config.id.charCodeAt(config.id.length - 1) % 31),
    [config.id]
  );

  const lastKickRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;
    const unsubscribe = scrollVelocity.on("change", (v) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const abs = Math.abs(v);
        if (abs < 180) {
          // Gravity settle toward rest
          yKick.set(yKick.get() * 0.92);
          rotateKick.set(rotateKick.get() * 0.94);
          return;
        }

        const now = performance.now();
        if (now - lastKickRef.current < 48) return;
        lastKickRef.current = now;

        const direction = v > 0 ? -1 : 1;
        const kick = Math.min(abs * 0.045, 90) * direction;
        const tumble = spinSign * Math.min(abs * 0.02, spinRange);

        yKick.set(yKick.get() + kick);
        rotateKick.set(rotateKick.get() + tumble);

        // Soft gravity pull after kick
        window.setTimeout(() => {
          yKick.set(0);
          rotateKick.set(0);
        }, 420);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [
    scrollVelocity,
    reducedMotion,
    yKick,
    rotateKick,
    spinSign,
    spinRange,
  ]);

  const sideStyle =
    config.side === "left"
      ? { left: config.inset }
      : { right: config.inset };

  // Combine rest angle + velocity tumble without nesting transforms
  const combinedRotate = useMotionValue(config.restRotate);

  useEffect(() => {
    if (reducedMotion) {
      combinedRotate.set(config.restRotate);
      return;
    }
    return rotateSpring.on("change", (kick) => {
      combinedRotate.set(config.restRotate + kick);
    });
  }, [rotateSpring, combinedRotate, config.restRotate, reducedMotion]);

  return (
    <motion.div
      className="pointer-events-none absolute will-change-transform drop-shadow-[0_8px_16px_rgba(26,26,26,0.08)]"
      style={{
        top: `${config.restY}%`,
        ...sideStyle,
        y: reducedMotion ? 0 : ySpring,
        rotate: reducedMotion ? config.restRotate : combinedRotate,
        opacity: config.opacity,
      }}
      aria-hidden
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
 * Scroll-driven stationery physics layer.
 * Items jump/tumble with scroll velocity, then settle in page margins.
 * Never intercepts pointer events or covers content columns.
 */
export const ScrollStationeryAnimation: React.FC<
  ScrollStationeryAnimationProps
> = ({ className = "" }) => {
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[1] overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Constrain visuals to side gutters on large screens */}
      <div className="relative mx-auto hidden h-full max-w-[100vw] lg:block">
        <div className="absolute inset-y-0 left-0 w-[min(11vw,140px)]">
          {ITEMS.filter((i) => i.side === "left").map((item) => (
            <PhysicsItem
              key={item.id}
              config={item}
              scrollVelocity={scrollVelocity}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 w-[min(11vw,140px)]">
          {ITEMS.filter((i) => i.side === "right").map((item) => (
            <PhysicsItem
              key={item.id}
              config={item}
              scrollVelocity={scrollVelocity}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>

      {/* Mobile: fewer, subtler pieces at very low opacity */}
      <div className="relative h-full lg:hidden">
        {ITEMS.filter((_, idx) => idx % 3 === 0).map((item) => (
          <PhysicsItem
            key={`m-${item.id}`}
            config={{ ...item, opacity: item.opacity * 0.45, size: item.size * 0.75 }}
            scrollVelocity={scrollVelocity}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollStationeryAnimation;
