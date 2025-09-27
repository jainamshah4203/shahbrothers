"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { fetchBestSellers, fetchOnSale } from "@/lib/products";
import type { Product } from "@/types/product";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatINR } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/cart";

export default function HomepageSections() {
  // Simple quick view handler state (optional)
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const { data: bestsellers = [], isLoading: loadingBest } = useQuery<Product[]>({
    queryKey: ["home-bestsellers", { limit: 8 }],
    queryFn: () => fetchBestSellers(8),
  });
  const { data: sale = [], isLoading: loadingSale } = useQuery<Product[]>({
    queryKey: ["home-sale", { limit: 8 }],
    queryFn: () => fetchOnSale(8),
  });

  // Carousel util hooks
  const makeCarousel = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const update = () => {
      const el = ref.current; if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanPrev(scrollLeft > 0);
      setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
    };
    useEffect(() => {
      update();
      const el = ref.current; if (!el) return;
      const onScroll = () => update();
      const onResize = () => update();
      el.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
    }, []);
    const scrollByAmt = (dir: 1 | -1) => {
      const el = ref.current; if (!el) return;
      el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
    };
    return { ref, canPrev, canNext, scrollByAmt } as const;
  };

  const c1 = makeCarousel();
  const c2 = makeCarousel();

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 space-y-16">
        {/* Best Sellers */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif">Best Sellers</h2>
              <p className="text-sm text-muted-foreground">Community favorites.</p>
            </div>
            <Button variant="ghost" size="sm" className="hidden md:flex group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="relative">
            <div
              ref={c1.ref}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {(loadingBest ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-72 bg-muted/30 rounded-lg animate-pulse" />
              )) : bestsellers.slice(0, 12).map((p, i) => (
                <div key={p.id || i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <ProductCard product={p} onQuickView={setQuickView} />
                </div>
              )))}
            </div>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => c1.scrollByAmt(-1)}
              disabled={!c1.canPrev}
              className={`hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black focus:outline-none ${!c1.canPrev ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => c1.scrollByAmt(1)}
              disabled={!c1.canNext}
              className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black focus:outline-none ${!c1.canNext ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* On Sale */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif">On Sale</h2>
              <p className="text-sm text-muted-foreground">Great pieces at better prices.</p>
            </div>
            <Button variant="ghost" size="sm" className="hidden md:flex group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="relative">
            <div
              ref={c2.ref}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {(loadingSale ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-72 bg-muted/30 rounded-lg animate-pulse" />
              )) : sale.slice(0, 12).map((p, i) => (
                <div key={p.id || i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <ProductCard product={p} onQuickView={setQuickView} />
                </div>
              )))}
            </div>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => c2.scrollByAmt(-1)}
              disabled={!c2.canPrev}
              className={`hidden md/grid absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black focus:outline-none ${!c2.canPrev ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => c2.scrollByAmt(1)}
              disabled={!c2.canNext}
              className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black focus:outline-none ${!c2.canNext ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick View Modal */}
        <Dialog open={!!quickView} onOpenChange={(open) => { if (!open) { setQuickView(null); setSelectedSize(""); setSelectedColor(""); } }}>
          <DialogContent className="max-w-2xl">
            {quickView && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded bg-muted">
                  {/* Basic image render; product.images is array of URLs */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={quickView.images?.[0] || '/placeholder.svg'} alt={quickView.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl font-semibold">{quickView.name}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2 flex items-center gap-2">
                    {quickView.salePrice ? (
                      <>
                        <span className="text-xl font-semibold">{formatINR(quickView.salePrice)}</span>
                        <span className="text-muted-foreground line-through">{formatINR(quickView.price)}</span>
                      </>
                    ) : (
                      <span className="text-xl font-semibold">{formatINR(quickView.price)}</span>
                    )}
                  </div>

                  {/* Color selector as pills */}
                  {Array.isArray(quickView.colors) && quickView.colors.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs mb-2 text-muted-foreground">Color</div>
                      <div className="flex flex-wrap gap-2">
                        {quickView.colors.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedColor(c)}
                            className={`px-3 py-1.5 rounded border text-xs ${selectedColor === c ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size selector as pills */}
                  {Array.isArray(quickView.sizes) && quickView.sizes.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs mb-2 text-muted-foreground">Size</div>
                      <div className="flex flex-wrap gap-2">
                        {quickView.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            className={`px-3 py-1.5 rounded border text-xs ${selectedSize === s ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Button
                      className="w-full md:w-auto"
                      disabled={
                        (Array.isArray(quickView.sizes) && quickView.sizes.length > 0 && !selectedSize) ||
                        (Array.isArray(quickView.colors) && quickView.colors.length > 0 && !selectedColor)
                      }
                      onClick={() => {
                        try {
                          const add = useCartStore.getState().addItem;
                          add(quickView as any, { qty: 1, size: selectedSize || undefined, color: selectedColor || undefined });
                          setQuickView(null);
                          setSelectedSize("");
                          setSelectedColor("");
                        } catch {}
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
