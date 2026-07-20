"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/types/product";
import { fetchBestSellers } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatINR } from "@/lib/formatCurrency";
import { useCartStore, type CartState } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { useRevealAnimation } from "@/hooks/useRevealAnimation";

const AnimatedProductItem = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const revealRef = useRevealAnimation<HTMLDivElement>({ preset: "fadeUp", delay: index * 0.06 });
  return <div ref={revealRef} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-full">{children}</div>;
};

function useCarousel() {
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
}



export default function BestSellersStrip() {
  const c = useCarousel();
  const { data: bestsellers = [], isLoading } = useQuery<Product[]>({
    queryKey: ["home-bestsellers", { limit: 8 }],
    queryFn: () => fetchBestSellers(8),
  });
  const multi = (bestsellers?.length || 0) > 1;

  const [quickView, setQuickView] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const addToCart = useCartStore((s: CartState) => s.addItem);
  const { toast } = useToast();

  const scroll = (dir: 1 | -1) => {
    const el = c.ref.current; if (!el) return;
    const amount = el.clientWidth * 0.9;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    const atStart = scrollLeft <= 0;
    if (multi && dir > 0 && atEnd) { el.scrollTo({ left: 0, behavior: 'smooth' }); return; }
    if (multi && dir < 0 && atStart) { el.scrollTo({ left: Math.max(0, scrollWidth - clientWidth), behavior: 'smooth' }); return; }
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-warm-white-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-ds-section font-serif text-soft-black-900 mb-2">Community Favorites</h2>
            <p className="text-ds-subtitle text-warm-gray-500">What everyone’s loving right now.</p>
          </div>
          <Button variant="ghost" size="sm" className="hidden md:flex group text-wood-700 hover:text-wood-900 hover:bg-wood-100/50">
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <div className="relative">
          <div ref={c.ref} className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-4" style={{ scrollbarWidth: 'none' }}>
            {(isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-80 bg-warm-gray-100 rounded-token-md animate-pulse" />
            )) : bestsellers.slice(0, 12).map((p, i) => (
              <AnimatedProductItem key={p.id || i} index={i}>
                <ProductCard product={p} hideBestsellerBadge onQuickView={() => setQuickView(p)} />
              </AnimatedProductItem>
            )))}
          </div>
          <button type="button" aria-label="Previous" onClick={() => scroll(-1)} disabled={!multi && !c.canPrev}
            className={`hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-soft-black-900/70 text-warm-white-50 shadow-elevation-2 hover:bg-soft-black-900 focus:outline-none transition-colors ${(!multi && !c.canPrev) ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" aria-label="Next" onClick={() => scroll(1)} disabled={!multi && !c.canNext}
            className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-soft-black-900/70 text-warm-white-50 shadow-elevation-2 hover:bg-soft-black-900 focus:outline-none transition-colors ${(!multi && !c.canNext) ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {/* Quick View Modal */}
        <ProductQuickView product={quickView} onClose={() => setQuickView(null)} />
      </div>
    </section>
  );
}
