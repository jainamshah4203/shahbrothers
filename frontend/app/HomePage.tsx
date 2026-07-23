"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import NewArrivals from "@/components/home/NewArrivals";
import { belowFoldDynamicOptions } from "@/lib/performance";

const ScrollStationeryAnimation = dynamic(
  () => import("@/components/home/ScrollStationeryAnimation"),
  { ssr: false }
);

const MonogramCustomizer = dynamic(
  () => import("@/components/customizer/MonogramCustomizer"),
  belowFoldDynamicOptions
);

const OnSaleStrip = dynamic(
  () => import("@/components/home/OnSaleStrip"),
  belowFoldDynamicOptions
);

const BestSellersStrip = dynamic(
  () => import("@/components/home/BestSellersStrip"),
  belowFoldDynamicOptions
);

const InstagramFeed = dynamic(
  () => import("@/components/home/InstagramFeed"),
  belowFoldDynamicOptions
);

/**
 * Homepage composition.
 * Side-pan stationery physics floats above section backgrounds (pointer-events none)
 * so crayons/pencils remain visible in left/right gutters while scrolling.
 *
 * Above-fold (Hero, Categories, NewArrivals) stay eager.
 * Below-fold strips/customizer/feed are code-split via next/dynamic.
 * No local state — pure composition to avoid unnecessary re-renders.
 */
export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-warm-off-white">
      {/* Fixed gutter layer — z above sections, never captures clicks */}
      <ScrollStationeryAnimation />

      <main className="relative z-[1]">
        {/* Full-bleed hero outside the padded product column */}
        <Hero />

        {/* Inner column keeps product UI clear of side pans on wide screens */}
        <div className="mx-auto w-full max-w-[1600px] md:px-[min(12vw,148px)]">
          <Categories />
          <NewArrivals />
          <MonogramCustomizer />
          <OnSaleStrip />
          <BestSellersStrip />
          <InstagramFeed />
        </div>
      </main>
    </div>
  );
}
