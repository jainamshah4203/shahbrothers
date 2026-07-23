"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/types/product";
import { fetchBestSellers } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { useScrollAnim } from "@/hooks/useScrollAnim";

const AnimatedProductItem = ({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) => {
  const revealRef = useScrollAnim<HTMLDivElement>({
    mode: "reveal",
    preset: "fadeUp",
    token: "slow",
    delay: index * 0.06,
  });
  return (
    <div
      ref={revealRef}
      className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-full"
    >
      {children}
    </div>
  );
};

function useCarousel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const update = () => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 0);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  };
  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => update();
    const onResize = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return { ref, canPrev, canNext } as const;
}

export default function BestSellersStrip() {
  const c = useCarousel();
  const { data: bestsellers = [], isLoading } = useQuery<Product[]>({
    queryKey: ["home-bestsellers", { limit: 8 }],
    queryFn: () => fetchBestSellers(8),
  });
  const multi = (bestsellers?.length || 0) > 1;
  const [quickView, setQuickView] = useState<Product | null>(null);
  const headerRef = useScrollAnim<HTMLDivElement>({
    mode: "reveal",
    preset: "fadeUp",
    token: "slow",
  });

  const handleQuickView = (product: Product) => {
    setQuickView(product);
  };

  const scroll = (dir: 1 | -1) => {
    const el = c.ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    const atStart = scrollLeft <= 0;
    if (multi && dir > 0 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (multi && dir < 0 && atStart) {
      el.scrollTo({
        left: Math.max(0, scrollWidth - clientWidth),
        behavior: "smooth",
      });
      return;
    }
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="bg-warm-off-white py-16">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <h2 className="mb-2 font-serif text-ds-section text-charcoal-ink">
              Community{" "}
              <em className="italic-accent text-fountain-navy">Favorites</em>
            </h2>
            <p className="text-ds-subtitle text-warm-sepia">
              What everyone&apos;s loving right now.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="group hidden text-fountain-navy hover:bg-cream hover:text-charcoal-ink md:flex"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <div className="relative">
          <div
            ref={c.ref}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-4"
            style={{ scrollbarWidth: "none" }}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 w-[80%] shrink-0 snap-start animate-pulse rounded-token-md bg-linen sm:w-[50%] lg:w-[25%]"
                  />
                ))
              : bestsellers.slice(0, 12).map((p, i) => (
                  <AnimatedProductItem key={p.id || i} index={i}>
                    <ProductCard
                      product={p}
                      hideBestsellerBadge
                      onQuickView={handleQuickView}
                    />
                  </AnimatedProductItem>
                ))}
          </div>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scroll(-1)}
            disabled={!multi && !c.canPrev}
            className={`absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-charcoal-ink/70 text-warm-off-white shadow-elevation-2 transition-colors hover:bg-charcoal-ink focus:outline-none md:grid ${
              !multi && !c.canPrev ? "cursor-not-allowed opacity-40" : ""
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scroll(1)}
            disabled={!multi && !c.canNext}
            className={`absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-charcoal-ink/70 text-warm-off-white shadow-elevation-2 transition-colors hover:bg-charcoal-ink focus:outline-none md:grid ${
              !multi && !c.canNext ? "cursor-not-allowed opacity-40" : ""
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <ProductQuickView
          product={quickView}
          onClose={() => setQuickView(null)}
        />
      </div>
    </section>
  );
}
