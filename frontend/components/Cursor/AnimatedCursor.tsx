"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { shouldEnableCustomCursor } from "@/lib/performance";

/**
 * Animated custom cursor for desktop users.
 * Features a dot that follows the mouse exactly, and a ring that follows with a spring effect.
 * Disabled on mobile, touch, low-tier devices, and reduced motion.
 */
export default function AnimatedCursor() {
  const { isMobile, isTouch, tier } = useDeviceCapability();
  const prefersReduced = useReducedMotion();
  const enabled = shouldEnableCustomCursor({
    tier,
    isMobile,
    isTouch,
    prefersReducedMotion: prefersReduced,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useSpring(-100, { stiffness: 1000, damping: 50, mass: 0.1 });
  const cursorY = useSpring(-100, { stiffness: 1000, damping: 50, mass: 0.1 });

  const ringX = useSpring(-100, { stiffness: 250, damping: 30, mass: 0.5 });
  const ringY = useSpring(-100, { stiffness: 250, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("custom-cursor");

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);

      setIsVisible((prev) => (prev ? prev : true));
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleElementEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("[data-cursor='pointer']")
      ) {
        setIsHovering(true);
      }
    };

    const handleElementLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleElementEnter);
    document.addEventListener("mouseout", handleElementLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleElementEnter);
      document.removeEventListener("mouseout", handleElementLeave);
    };
  }, [enabled, cursorX, cursorY, ringX, ringY]);

  if (!enabled || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-foreground rounded-full -ml-1 -mt-1 mix-blend-difference"
        style={{ x: cursorX, y: cursorY }}
        animate={{
          scale: isClicking ? 0.5 : isHovering ? 0.5 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-foreground/30 -ml-4 -mt-4 mix-blend-difference"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(255, 255, 255, 0.1)" : "transparent",
          borderColor: isHovering ? "rgba(255, 255, 255, 0.5)" : "var(--foreground)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
}
