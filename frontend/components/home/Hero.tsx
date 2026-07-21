"use client";

import React, { Suspense, lazy } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StationeryPreviewSkeleton from "@/components/stationery-3d/StationeryPreviewSkeleton";

const LazyHeroCanvas = lazy(() => import("./Hero3DCanvas"));

/**
 * Asymmetrical editorial hero — serif copy left, interactive 3D pen right.
 * Background matches homepage warm off-white for seamless contrast.
 */
export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-warm-off-white">
      {/* Soft atmosphere — same family as page canvas, no hard panel contrast */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 15% 10%, rgba(244,241,234,0.55), transparent 50%), radial-gradient(ellipse at 88% 60%, rgba(239,236,230,0.4), transparent 45%)",
        }}
      />

      <div className="container relative z-[1] mx-auto grid min-h-[min(88vh,820px)] grid-cols-1 items-center gap-8 px-4 py-12 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:py-16 xl:px-12">
        <motion.div
          className="lg:col-span-5 lg:pr-4"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-6 font-sans text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-sepia">
            Artisan Stationery House
          </p>

          <h1 className="font-serif text-[clamp(3.5rem,8vw,6rem)] font-medium leading-[0.92] tracking-[-0.03em] text-charcoal-ink">
            Create
            <span className="mx-3 font-light text-brass/50" aria-hidden>
              /
            </span>
            <em className="italic font-normal text-fountain-navy">Inspire</em>
          </h1>

          <p className="mt-7 max-w-md font-sans text-base leading-[1.7] tracking-tight text-muted-sepia md:text-lg">
            Fountain pens, archival notebooks, and desk objects for considered
            work — stationery with presence, foil, and quiet luxury.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/collections" className="btn-outline-pill">
              Explore Collection
            </Link>
            <Link
              href="/collections?q=foil"
              className="inline-flex items-center justify-center rounded-full border border-brass/60 bg-transparent px-7 py-2.5 font-sans text-sm tracking-tight text-charcoal-ink transition-colors duration-300 hover:border-brass hover:bg-brass hover:text-charcoal-ink"
            >
              Personalized Foil
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative lg:col-span-7"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Flush with page — warm-off-white studio, no cream card contrast */}
          <div className="relative mx-auto aspect-[5/4] w-full max-w-xl overflow-hidden bg-warm-off-white lg:ml-auto lg:max-w-none">
            <Suspense
              fallback={
                <StationeryPreviewSkeleton label="Warming the studio…" />
              }
            >
              <LazyHeroCanvas />
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
