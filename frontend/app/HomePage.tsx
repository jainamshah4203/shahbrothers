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

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-warm-off-white">
      <ScrollStationeryAnimation />
      <main className="relative z-10">
        <Hero />
        <Categories />
        <NewArrivals />
        <MonogramCustomizer />
        <OnSaleStrip />
        <BestSellersStrip />
        <InstagramFeed />
      </main>
    </div>
  );
}