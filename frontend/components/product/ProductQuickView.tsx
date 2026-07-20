"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatINR } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types/product";

export function ProductQuickView({ product, onClose }: { product: Product | null, onClose: () => void }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const addToCart = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={(open) => { if (!open) { onClose(); setSelectedSize(null); setSelectedColor(null); } }}>
      <DialogContent className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QVGallery images={product.images} name={product.name} />
          <div>
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-semibold">{product.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-2 text-xl font-semibold">{formatINR(product.salePrice ?? product.price)}</div>
            {product.salePrice && (
              <div className="text-sm text-muted-foreground line-through">{formatINR(product.price)}</div>
            )}

            {/* Sizes */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mt-4">
                <div className="text-xs mb-2 text-muted-foreground">Size</div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button type="button" key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-1.5 rounded border text-xs ${selectedSize === s ? 'bg-black text-white border-black' : 'hover:bg-accent'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div className="mt-4">
                <div className="text-xs mb-2 text-muted-foreground">Color</div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, idx) => (
                    <button type="button" key={`${c}-${idx}`} onClick={() => setSelectedColor(c)} className={`px-3 py-1.5 rounded border text-xs ${selectedColor === c ? 'bg-black text-white border-black' : 'hover:bg-accent'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6">
              <Button
                onClick={() => {
                  addToCart(
                    { ...product, sizes: product.sizes || [], colors: product.colors || [] },
                    { qty: 1, size: selectedSize || undefined, color: selectedColor || undefined }
                  );
                  toast({ title: 'Added to cart', description: product.name });
                  onClose();
                  setSelectedSize(null);
                  setSelectedColor(null);
                }}
                className="w-full"
                disabled={
                  (Array.isArray(product.sizes) && product.sizes.length > 0 && !selectedSize) ||
                  (Array.isArray(product.colors) && product.colors.length > 0 && !selectedColor)
                }
              >Add to Cart</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QVGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const safe = Array.isArray(images) && images.length > 0 ? images : ["/placeholder.svg"];
  const prev = () => setIdx((i) => (i - 1 + safe.length) % safe.length);
  const next = () => setIdx((i) => (i + 1) % safe.length);
  return (
    <div>
      <div className="relative aspect-[4/5] w-full">
        <Image src={safe[idx]} alt={`${name} image ${idx + 1}`} fill className="object-cover rounded" sizes="(max-width: 768px) 100vw, 50vw" />
        {safe.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" aria-label="Next image" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white shadow hover:bg-black">
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
            <div key={`${src}-${i}`} className={`relative h-16 w-12 flex-shrink-0 rounded overflow-hidden cursor-pointer border ${i === idx ? 'border-foreground' : 'border-transparent'}`} onClick={() => setIdx(i)}>
              <Image src={src} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="48px" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
