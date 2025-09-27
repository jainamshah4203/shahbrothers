"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import { fetchFeaturedProducts } from "@/lib/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatINR } from "@/lib/formatCurrency";
import ProductCard from "@/components/product/ProductCard";
import { useCartStore, type CartState } from "@/store/cart";
import { useWishlistStore, type WishlistState } from "@/store/wishlist";
import { useToast } from "@/hooks/use-toast";

const NewArrivals = () => {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = () => {
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
  };

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
  }, []);

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

  // Fetch featured products (new arrivals or bestsellers) from backend
  const { data: featuredProducts = [], isLoading, isError, error } = useQuery<Product[], Error>({
    queryKey: ["featured-products", { limit: 8 }],
    queryFn: () => fetchFeaturedProducts(8),
  });

  const addToCart = useCartStore((s: CartState) => s.addItem);
  const addWishlist = useWishlistStore((s: WishlistState) => s.add);
  const { toast } = useToast();

  const handleQuickView = (product: Product) => {
    setQuickView(product);
    setSelectedSize(null);
    setSelectedColor(null);
  };

  const handleAddToWishlist = (productId: string) => {
    addWishlist(productId);
    toast({
      title: "Added to wishlist",
      description: "Saved to your wishlist.",
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, { qty: 1 });
    toast({
      title: "Added to cart",
      description: product.name,
    });
  };

  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-medium mb-2">Just In</h2>
            <p className="text-muted-foreground">Fresh drops for the season—updated weekly.</p>
          </div>
          <Button variant="ghost" size="sm" className="hidden md:flex group">
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {isError && (
          <div className="text-sm text-destructive mb-8">
            Failed to load products{error?.message ? `: ${error.message}` : ""}
          </div>
        )}

        <div className="relative">
          <div ref={scrollerRef} className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 pb-2" style={{ scrollbarWidth: 'none' }}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] h-72 bg-muted/30 rounded-lg animate-pulse" />
              ))
            ) : (
              featuredProducts.slice(0, 12).map((p, i) => (
                <div key={p.id || i} className="snap-start shrink-0 w-[80%] sm:w-[50%] lg:w-[25%] animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <ProductCard product={p} onQuickView={() => setQuickView(p)} />
                </div>
              ))
            )}
          </div>
          <button type="button" aria-label="Previous" onClick={() => scrollByAmount(-1)} disabled={!canPrev}
            className={`hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black focus:outline-none ${!canPrev ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" aria-label="Next" onClick={() => scrollByAmount(1)} disabled={!canNext}
            className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black focus:outline-none ${!canNext ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <Dialog open={quickView !== null} onOpenChange={(open) => !open && setQuickView(null)}>
        {quickView && (
          <DialogContent className="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gallery */}
              <QuickViewGallery images={quickView.images} name={quickView.name} />
              {/* Details */}
              <div>
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl font-semibold">{quickView.name}</DialogTitle>
                </DialogHeader>
                <div className="mt-2 text-xl font-semibold">{formatINR(quickView.price)}</div>

                {/* Sizes */}
                {Array.isArray(quickView.sizes) && quickView.sizes.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs mb-2 text-muted-foreground">Size</div>
                    <div className="flex flex-wrap gap-2">
                      {quickView.sizes.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded border text-xs ${selectedSize === s ? 'bg-black text-white border-black' : 'hover:bg-accent'}`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {Array.isArray(quickView.colors) && quickView.colors.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs mb-2 text-muted-foreground">Color</div>
                    <div className="flex flex-wrap gap-2">
                      {quickView.colors.map((c, idx) => (
                        <button
                          type="button"
                          key={`${c}-${idx}`}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded border text-xs ${selectedColor === c ? 'bg-black text-white border-black' : 'hover:bg-accent'}`}
                        >{c}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6">
                  <Button
                    onClick={() => handleAddToCart({
                      ...quickView,
                      sizes: quickView.sizes || [],
                      colors: quickView.colors || [],
                    })}
                    className="w-full"
                    disabled={
                      (Array.isArray(quickView.sizes) && quickView.sizes.length > 0 && !selectedSize) ||
                      (Array.isArray(quickView.colors) && quickView.colors.length > 0 && !selectedColor)
                    }
                  >Add to Cart</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
};

export default NewArrivals;

// Lightweight gallery with looping and thumbnails for Quick View
function QuickViewGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const safe = Array.isArray(images) && images.length > 0 ? images : ["/placeholder.svg"];
  const prev = () => setIdx((i) => (i - 1 + safe.length) % safe.length);
  const next = () => setIdx((i) => (i + 1) % safe.length);

  return (
    <div>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={safe[idx]} alt={`${name} image ${idx + 1}`} className="w-full aspect-[4/5] object-cover rounded" />
        {safe.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>
      {safe.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {safe.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`thumb ${i + 1}`}
              className={`h-16 w-12 object-cover rounded cursor-pointer border ${i === idx ? 'border-foreground' : 'border-transparent'}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}