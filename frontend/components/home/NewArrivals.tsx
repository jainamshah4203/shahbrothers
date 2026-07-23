"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import { fetchFeaturedProducts } from "@/lib/products";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import ProductCard from "@/components/product/ProductCard";
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

const NewArrivals = () => {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const headerRef = useScrollAnim<HTMLDivElement>({
    mode: "reveal",
    preset: "fadeUp",
    token: "slow",
  });

  const { data: featuredProducts = [], isLoading, isError, error } = useQuery<
    Product[],
    Error
  >({
    queryKey: ["featured-products", { limit: 8 }],
    queryFn: () => fetchFeaturedProducts(8),
  });

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasMulti = (featuredProducts?.length || 0) > 1;
    if (hasMulti) {
      setCanPrev(true);
      setCanNext(true);
      return;
    }
    setCanPrev(scrollLeft > 0);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, [featuredProducts]);

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateButtons();
    const onResize = () => updateButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateButtons]);

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    const atStart = scrollLeft <= 0;
    const hasMulti = (featuredProducts?.length || 0) > 1;
    if (dir > 0 && atEnd && hasMulti) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (dir < 0 && atStart && hasMulti) {
      el.scrollTo({
        left: Math.max(0, scrollWidth - clientWidth),
        behavior: "smooth",
      });
      return;
    }
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const handleQuickView = (product: Product) => {
    setQuickView(product);
  };

  return (
    <section className="bg-warm-off-white py-20">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <h2 className="mb-2 font-serif text-ds-section text-charcoal-ink">
              Just{" "}
              <em className="italic-accent text-fountain-navy">In</em>
            </h2>
            <p className="text-ds-subtitle text-warm-sepia">
              Fresh drops for the season—updated weekly.
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

        {isError && (
          <div className="mb-8 text-sm text-destructive">
            Failed to load products
            {error?.message ? `: ${error.message}` : ""}
          </div>
        )}

        <div className="relative">
          <div
            ref={scrollerRef}
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
              : featuredProducts.slice(0, 12).map((p, i) => (
                  <AnimatedProductItem key={p.id || i} index={i}>
                    <ProductCard
                      product={p}
                      onQuickView={handleQuickView}
                    />
                  </AnimatedProductItem>
                ))}
          </div>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByAmount(-1)}
            disabled={!canPrev}
            className={`absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-charcoal-ink/70 text-warm-off-white shadow-elevation-2 transition-colors hover:bg-charcoal-ink focus:outline-none md:grid ${
              !canPrev ? "cursor-not-allowed opacity-40" : ""
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
            onClick={() => scrollByAmount(1)}
            disabled={!canNext}
            className={`absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-charcoal-ink/70 text-warm-off-white shadow-elevation-2 transition-colors hover:bg-charcoal-ink focus:outline-none md:grid ${
              !canNext ? "cursor-not-allowed opacity-40" : ""
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
      </div>

      <ProductQuickView
        product={quickView}
        onClose={() => setQuickView(null)}
      />
    </section>
  );
};

export default NewArrivals;
