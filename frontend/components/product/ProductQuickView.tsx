"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { framerTransition } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductQuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const prefersReduced = useReducedMotion();

  if (!product) return null;

  const needSize = Array.isArray(product.sizes) && product.sizes.length > 0;
  const needColor = Array.isArray(product.colors) && product.colors.length > 0;
  const canAdd = (!needSize || !!selectedSize) && (!needColor || !!selectedColor);

  function handleAddToCart() {
    addToCart(
      { ...product, sizes: product.sizes || [], colors: product.colors || [] },
      { qty: 1, size: selectedSize || undefined, color: selectedColor || undefined }
    );
    setJustAdded(true);
    toast({ title: "Added to cart", description: product.name });
    window.setTimeout(() => {
      onClose();
      setSelectedSize(null);
      setSelectedColor(null);
      setJustAdded(false);
    }, 480);
  }

  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setSelectedSize(null);
          setSelectedColor(null);
          setJustAdded(false);
        }
      }}
    >
      <DialogContent className="max-w-3xl border-charcoal-ink/10 bg-warm-off-white paper-grain">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <QVGallery images={product.images} name={product.name} />
          <div>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-semibold text-charcoal-ink md:text-xl">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 font-sans text-xl font-semibold text-charcoal-ink">
              {formatINR(product.salePrice ?? product.price)}
            </div>
            {product.salePrice && (
              <div className="font-sans text-sm text-muted-sepia line-through">
                {formatINR(product.price)}
              </div>
            )}

            {needSize && (
              <div className="mt-4">
                <div className="mb-2 font-sans text-xs text-muted-sepia">Size</div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-sans text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass",
                        selectedSize === s
                          ? "border-brass bg-charcoal-ink text-warm-off-white"
                          : "border-charcoal-ink/15 text-charcoal-ink hover:bg-linen"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {needColor && (
              <div className="mt-4">
                <div className="mb-2 font-sans text-xs text-muted-sepia">Color</div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, idx) => (
                    <button
                      type="button"
                      key={`${c}-${idx}`}
                      onClick={() => setSelectedColor(c)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-sans text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass",
                        selectedColor === c
                          ? "border-brass bg-charcoal-ink text-warm-off-white"
                          : "border-charcoal-ink/15 text-charcoal-ink hover:bg-linen"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <motion.div
                animate={justAdded && !prefersReduced ? { scale: [1, 0.97, 1] } : { scale: 1 }}
                transition={framerTransition("click")}
              >
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  disabled={!canAdd}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={justAdded ? "added" : "add"}
                      className="inline-flex items-center gap-2"
                      initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
                      transition={framerTransition("fast")}
                    >
                      {justAdded ? (
                        <>
                          <Check className="h-4 w-4 text-brass" aria-hidden />
                          Added
                        </>
                      ) : (
                        "Add to Cart"
                      )}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QVGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const prefersReduced = useReducedMotion();
  const safe = Array.isArray(images) && images.length > 0 ? images : ["/placeholder.svg"];

  const handlePrev = () => setIdx((i) => (i - 1 + safe.length) % safe.length);
  const handleNext = () => setIdx((i) => (i + 1) % safe.length);

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-cream paper-surface">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={framerTransition("fast")}
          >
            <Image
              src={safe[idx]}
              alt={`${name} image ${idx + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
        {safe.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-charcoal-ink/70 text-warm-off-white shadow-paper transition-colors hover:bg-charcoal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={handleNext}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-charcoal-ink/70 text-warm-off-white shadow-paper transition-colors hover:bg-charcoal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {safe.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {safe.map((src, i) => (
            <button
              type="button"
              key={`${src}-${i}`}
              className={cn(
                "relative h-16 w-12 flex-shrink-0 overflow-hidden rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass",
                i === idx ? "border-brass" : "border-transparent opacity-70 hover:opacity-100"
              )}
              onClick={() => setIdx(i)}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={src} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="48px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
