"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import nextDynamic from "next/dynamic";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { Button } from "@/components/ui/button";

// Lazy load the 3D scene to keep the initial bundle small
const Scene = nextDynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-background" />
});

/**
 * Main Hero component combining 3D scene, scroll progress tracking,
 * HTML text overlay, and mobile fallbacks.
 */
export default function Hero3D() {
  const { isMobile } = useDeviceCapability();
  
  // Track scroll progress for the hero section (0 to 1)
  const { ref: containerRef, progress } = useScrollProgress({
    start: "top top",
    end: "bottom top",
  });

  // Calculate opacity based on scroll (fades out as you scroll down)
  const textOpacity = Math.max(0, 1 - progress * 2.5);
  // Calculate scale based on scroll (scales down slightly)
  const textScale = Math.max(0.8, 1 - progress * 0.5);

  return (
    <section ref={containerRef} className="hero-3d-container bg-background">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {!isMobile ? (
          <Scene scrollProgress={progress} />
        ) : (
          // Mobile Fallback Background
          <div className="absolute inset-0 hero-gradient">
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-overlay" />
          </div>
        )}
      </div>

      {/* HTML Overlay Layer */}
      <div 
        className="hero-3d-overlay"
        style={{ 
          opacity: textOpacity,
          transform: `scale(${textScale})`
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4 animate-slideUp">
              Premium Stationery & Office Supplies
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-foreground leading-tight mb-6 animate-slideUp" style={{ animationDelay: "100ms" }}>
              Create
              <br />
              <span className="italic text-primary">Inspire</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto animate-slideUp" style={{ animationDelay: "200ms" }}>
              Discover our curated collection of premium writing instruments, notebooks, 
              and desk accessories for the modern professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp" style={{ animationDelay: "300ms" }}>
              <Button size="lg" className="btn-primary group" asChild>
                <Link href="/collections">
                  Shop Stationery
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary"
                asChild
              >
                <Link href="/collections?q=brands">
                  Explore Brands
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-300"
        style={{ opacity: progress > 0.05 ? 0 : 1 }}
      >
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
