"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import NewArrivals from "@/components/home/NewArrivals";
import InstagramFeed from "@/components/home/InstagramFeed";
import OnSaleStrip from "@/components/home/OnSaleStrip";
import BestSellersStrip from "@/components/home/BestSellersStrip";
import MonogramCustomizer from "@/components/customizer/MonogramCustomizer";

const ScrollStationeryAnimation = dynamic(
  () => import("@/components/home/ScrollStationeryAnimation"),
  { ssr: false }
);

/**
 * Homepage composition.
 * Side-pan stationery physics floats above section backgrounds (pointer-events none)
 * so crayons/pencils remain visible in left/right gutters while scrolling.
 */
export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-warm-off-white">
      {/* Fixed gutter layer — z above sections, never captures clicks */}
      <ScrollStationeryAnimation />

      <main className="relative z-[1]">
        {/* Inner column keeps product UI clear of side pans on wide screens */}
        <div className="mx-auto w-full max-w-[1600px] md:px-[min(12vw,148px)]">
          <Hero />
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
