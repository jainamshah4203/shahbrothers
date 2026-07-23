"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import nextDynamic from "next/dynamic";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button } from "@/components/ui/button";
import { Motion } from "@/lib/animations";

const Scene = nextDynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-warm-off-white" aria-hidden />
  ),
});

/**
 * Fullscreen luxury hero — scroll-driven 3D desk on capable devices,
 * static atelier fallback on mobile / low-tier / reduced motion.
 */
export default function Hero3D() {
  const { isMobile, tier, hasWebGL2 } = useDeviceCapability();
  const prefersReduced = useReducedMotion();

  const { ref: containerRef, progress } = useScrollProgress({
    start: "top top",
    end: "bottom top",
  });

  const useWebGL = !isMobile && tier !== "low" && hasWebGL2 && !prefersReduced;

  // Overlay storytelling: brand readable early, CTA glass-legible through settle
  const headlineOpacity = Math.max(0.15, 1 - progress * 1.35);
  const ctaOpacity = Math.min(1, 0.55 + progress * 0.55);
  const overlayY = progress * -24;

  return (
    <section
      ref={containerRef}
      className="hero-3d-container min-h-screen bg-warm-off-white"
      aria-label="Shah Brothers hero"
    >
      <div className="absolute inset-0 z-0">
        {useWebGL ? (
          <Scene scrollProgress={progress} />
        ) : (
          <div className="absolute inset-0 overflow-hidden bg-warm-off-white">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 70% 40%, rgba(212,175,55,0.12), transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(28,45,66,0.08), transparent 50%), linear-gradient(165deg, #FAF9F5 0%, #F4F1EA 55%, #EFECE6 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-multiply"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80')",
              }}
              aria-hidden
            />
          </div>
        )}
      </div>

      {/* Soft glass veil for copy legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,249,245,0.55) 0%, rgba(250,249,245,0.15) 42%, rgba(250,249,245,0.45) 100%)",
          opacity: useWebGL ? 0.85 : 1,
        }}
        aria-hidden
      />

      <div
        className="hero-3d-overlay"
        style={{
          transform: `translateY(${overlayY}px)`,
          transition: prefersReduced ? undefined : `transform ${Motion.Hero.duration}s`,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div
            className="mx-auto max-w-3xl rounded-sm px-6 py-8 backdrop-blur-[2px] sm:px-10"
            style={{
              background: "rgba(250, 249, 245, 0.28)",
              boxShadow: "0 1px 0 rgba(212, 175, 55, 0.15)",
            }}
          >
            <p
              className="mb-4 font-sans text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-sepia"
              style={{ opacity: headlineOpacity }}
            >
              Artisan Stationery House
            </p>
            <h1
              className="font-serif text-[clamp(3.25rem,7.5vw,5.75rem)] font-medium leading-[0.92] tracking-[-0.03em] text-charcoal-ink"
              style={{ opacity: headlineOpacity }}
            >
              Create
              <span className="mx-3 font-light text-brass/50" aria-hidden>
                /
              </span>
              <em className="italic font-normal text-fountain-navy">Inspire</em>
            </h1>
            <p
              className="mx-auto mt-6 max-w-md font-sans text-base leading-[1.7] tracking-tight text-muted-sepia md:text-lg"
              style={{ opacity: headlineOpacity }}
            >
              Fountain pens, archival notebooks, and desk objects for considered
              work — stationery with presence, foil, and quiet luxury.
            </p>
            <div
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ opacity: ctaOpacity }}
            >
              <Button size="lg" className="btn-primary group min-w-[200px]" asChild>
                <Link href="/collections">
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-brass/50 bg-warm-off-white/40 text-charcoal-ink hover:border-brass hover:bg-brass/10"
                asChild
              >
                <Link href="/collections?q=brands">Shop Stationery</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500"
        style={{ opacity: progress > 0.08 ? 0 : 1 }}
        aria-hidden
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-charcoal-ink/25">
          <div className="mt-2 h-3 w-1 animate-bounce rounded-full bg-charcoal-ink/40" />
        </div>
      </div>
    </section>
  );
}
