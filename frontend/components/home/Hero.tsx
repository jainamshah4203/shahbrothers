"use client";

import React, { Suspense, lazy } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StationeryPreviewSkeleton from "@/components/stationery-3d/StationeryPreviewSkeleton";

const LazyHeroCanvas = lazy(() => import("./Hero3DCanvas"));

/**
 * Asymmetrical editorial hero — serif copy left, interactive 3D pen right.
 */
export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-warm-off-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 18% 0%, rgba(244,241,234,0.95), transparent 55%), radial-gradient(ellipse at 92% 70%, rgba(212,175,55,0.08), transparent 45%), radial-gradient(ellipse at 70% 100%, rgba(28,45,66,0.05), transparent 40%)",
        }}
      />

      <div className="container relative mx-auto grid min-h-[min(92vh,880px)] grid-cols-1 items-center gap-10 px-4 py-14 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <motion.div
          className="lg:col-span-5"
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
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative mx-auto aspect-[5/4] w-full max-w-xl overflow-hidden rounded-[2px] bg-cream shadow-paper lg:ml-auto lg:max-w-none">
            <div className="absolute inset-0 debossed" aria-hidden />
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
