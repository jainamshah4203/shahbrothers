"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import { fetchFeaturedProducts } from "@/lib/products";
import { useWishlistStore, type WishlistState } from "@/store/wishlist";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { useRevealAnimation } from "@/hooks/useRevealAnimation";

const AnimatedProductItem = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const revealRef = useRevealAnimation<HTMLDivElement>({ preset: "fadeUp", delay: index * 0.06 });
  return <div ref={revealRef} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-full">{children}</div>;
};

const NewArrivals = () => {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Fetch featured products (new arrivals or bestsellers) from backend
  const { data: featuredProducts = [], isLoading, isError, error } = useQuery<Product[], Error>({
    queryKey: ["featured-products", { limit: 8 }],
    queryFn: () => fetchFeaturedProducts(8),
  });

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // If we have multiple items, keep arrows enabled to allow looping
    const hasMulti = (featuredProducts?.length || 0) > 1;
    if (hasMulti) {
      setCanPrev(true);
      setCanNext(true);
      return;
    }
    setCanPrev(scrollLeft > 0);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, [scrollerRef, featuredProducts]);

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateButtons();
    const onResize = () => updateButtons();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => { 
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
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
    if (dir > 0 && atEnd && hasMulti) { el.scrollTo({ left: 0, behavior: 'smooth' }); return; }
    if (dir < 0 && atStart && hasMulti) { el.scrollTo({ left: Math.max(0, scrollWidth - clientWidth), behavior: 'smooth' }); return; }
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };


  const handleQuickView = (product: Product) => {
    setQuickView(product);
  };

  return (
    <section className="py-20 bg-warm-white-100">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-ds-section font-serif text-soft-black-900 mb-2">Just In</h2>
            <p className="text-ds-subtitle text-warm-gray-500">Fresh drops for the season—updated weekly.</p>
          </div>
          <Button variant="ghost" size="sm" className="hidden md:flex group text-wood-700 hover:text-wood-900 hover:bg-wood-100/50">
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 bg-warm-gray-100 rounded-token-md animate-pulse" />
            ))}
          </div>
        )}
        {isError && (
          <div className="text-sm text-destructive mb-8">
            Failed to load products{error?.message ? `: ${error.message}` : ""}
          </div>
        )}

        <div className="relative">
          <div ref={scrollerRef} className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-4" style={{ scrollbarWidth: 'none' }}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-80 bg-warm-gray-100 rounded-token-md animate-pulse" />
              ))
            ) : (
              featuredProducts.slice(0, 12).map((p, i) => (
                <AnimatedProductItem key={p.id || i} index={i}>
                  <ProductCard product={p} onQuickView={() => setQuickView(p)} />
                </AnimatedProductItem>
              ))
            )}
          </div>
          <button type="button" aria-label="Previous" onClick={() => scrollByAmount(-1)} disabled={!canPrev}
            className={`hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-soft-black-900/70 text-warm-white-50 shadow-elevation-2 hover:bg-soft-black-900 focus:outline-none transition-colors ${!canPrev ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" aria-label="Next" onClick={() => scrollByAmount(1)} disabled={!canNext}
            className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-soft-black-900/70 text-warm-white-50 shadow-elevation-2 hover:bg-soft-black-900 focus:outline-none transition-colors ${!canNext ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
    </section>
  );
};

export default NewArrivals;
