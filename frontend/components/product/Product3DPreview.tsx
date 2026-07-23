"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { StationeryProductPreview } from "@/components/stationery-3d";
import { Motion, framerTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

type Props = {
  productName: string;
  className?: string;
};

/**
 * Optional stationery 3D preview — desktop + high-tier devices only.
 * Mobile and lower tiers keep the 2D gallery; this component returns null.
 */
export default function Product3DPreview({ productName, className }: Props) {
  const { isMobile, tier, hasWebGL2 } = useDeviceCapability();
  const prefersReduced = useReducedMotion();
  const [enabled, setEnabled] = useState(true);

  const canRender = !isMobile && tier === "high" && hasWebGL2;
  if (!canRender) return null;

  return (
    <div
      className={cn(
        "mt-4 overflow-hidden rounded-lg border border-charcoal-ink/8 bg-cream paper-surface paper-grain",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-charcoal-ink/8 px-4 py-3">
        <p className="font-sans text-xs font-medium uppercase tracking-widest text-muted-sepia">
          Studio preview
        </p>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className="rounded-full px-3 py-1 font-sans text-xs text-charcoal-ink transition-colors hover:bg-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          aria-pressed={enabled}
        >
          {enabled ? "Hide 3D" : "Show 3D"}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {enabled ? (
          <motion.div
            key="3d"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={framerTransition("medium")}
            className="relative aspect-[16/10] w-full"
            aria-label={`3D preview of ${productName}`}
          >
            <StationeryProductPreview className="h-full min-h-[280px] w-full" />
          </motion.div>
        ) : (
          <motion.div
            key="off"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={framerTransition("fast")}
            className="flex aspect-[16/10] items-center justify-center bg-linen/60 px-6"
          >
            <p className="font-sans text-sm text-muted-sepia">
              3D studio paused — gallery remains above.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!prefersReduced && enabled && (
        <motion.p
          className="px-4 py-2 font-sans text-[11px] tracking-wide text-muted-sepia/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={Motion.Fast.framer}
        >
          Drag to rotate · scroll to zoom
        </motion.p>
      )}
    </div>
  );
}
