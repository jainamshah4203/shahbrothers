"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import InstagramFeed from "@/components/home/InstagramFeed";
import OnSaleStrip from "@/components/home/OnSaleStrip";
import BestSellersStrip from "@/components/home/BestSellersStrip";

export default function HomePage() {
  const [cartItemsCount] = useState(0);

  return (
    <div className="min-h-screen">
      <Header cartItemsCount={cartItemsCount} />
      <main>
        {/* 1. Hero Banner */}
        <HeroSection />
        {/* 2. New Arrivals (early, freshness) */}
        <NewArrivals />
        {/* 3. Featured Collections (near top) */}
        <FeaturedCollections />
        {/* 4. On Sale (early) */}
        <OnSaleStrip />
        {/* 5. Best Sellers (middle) */}
        <BestSellersStrip />
        {/* Footer extras */}
        <InstagramFeed />
      </main>
      <Footer />
    </div>
  );
}