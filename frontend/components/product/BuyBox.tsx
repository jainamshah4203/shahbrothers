"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check, Minus, Plus } from "lucide-react";
import { framerTransition } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

type BuyBoxProps = {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    images: string[];
    category: string;
    stock: number;
    sizes?: string[];
    colors?: string[];
  };
};

export default function BuyBox({ product }: BuyBoxProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const hasWish = useWishlistStore((s) => s.has(product._id));
  const addWish = useWishlistStore((s) => s.add);
  const removeWish = useWishlistStore((s) => s.remove);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => setMounted(true), []);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState<number>(1);
  const inStock = typeof product.stock === "number" ? product.stock > 0 : true;
  const maxQty = typeof product.stock === "number" && product.stock > 0 ? product.stock : 99;

  useEffect(() => {
    if (!size && Array.isArray(product.sizes) && product.sizes.length === 1) {
      setSize(product.sizes[0]);
    }
    if (!color && Array.isArray(product.colors) && product.colors.length === 1) {
      setColor(product.colors[0]);
    }
  }, [product._id, product.sizes, product.colors, size, color]);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 1600);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  function handleAdd() {
    const mapped: Product = {
      id: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      category: product.category,
      inStock,
      sizes: product.sizes || [],
      colors: product.colors || [],
      specifications: "",
      features: [],
    };

    addItem(mapped, { qty, size, color });
    setJustAdded(true);
    openMiniCart();
  }

  const needSize = (product.sizes?.length || 0) > 0;
  const needColor = (product.colors?.length || 0) > 1;
  const canAdd = inStock && (!needSize || size) && (!needColor || color);

  return (
    <div className="mt-6 space-y-6 rounded-xl border border-charcoal-ink/8 bg-cream/80 p-5 paper-surface paper-grain sm:p-6">
      {/* Qty selector */}
      <div className="flex items-center gap-4">
        <label className="w-12 font-sans text-sm font-medium text-muted-sepia">Qty</label>
        <div className="inline-flex items-center gap-2 rounded-full border border-charcoal-ink/10 bg-warm-off-white p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full focus-visible:ring-brass"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-sans text-sm font-medium text-charcoal-ink">{qty}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full focus-visible:ring-brass"
            onClick={() => setQty((q) => Math.min(q + 1, maxQty))}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {needColor && (
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-medium text-muted-sepia">Color</label>
          <ToggleGroup
            type="single"
            value={color}
            onValueChange={(v) => {
              if (v) setColor(v);
            }}
            className="flex-wrap justify-start gap-2"
          >
            {product.colors!.map((c) => (
              <ToggleGroupItem
                key={c}
                value={c}
                variant="outline"
                className="h-9 rounded-full border-charcoal-ink/15 px-4 text-sm transition-transform hover:scale-[1.02] data-[state=on]:border-brass data-[state=on]:bg-linen data-[state=on]:text-charcoal-ink focus-visible:ring-brass"
              >
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {needSize && (
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-medium text-muted-sepia">Size</label>
          <ToggleGroup
            type="single"
            value={size}
            onValueChange={(v) => {
              if (v) setSize(v);
            }}
            className="flex-wrap justify-start gap-2"
          >
            {product.sizes!.map((s) => (
              <ToggleGroupItem
                key={s}
                value={s}
                variant="outline"
                className="h-9 rounded-full border-charcoal-ink/15 px-4 text-sm transition-transform hover:scale-[1.02] data-[state=on]:border-brass data-[state=on]:bg-linen data-[state=on]:text-charcoal-ink focus-visible:ring-brass"
              >
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
        <motion.div
          className="w-full sm:flex-1"
          animate={justAdded && !prefersReduced ? { scale: [1, 0.97, 1] } : { scale: 1 }}
          transition={framerTransition("click")}
        >
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            size="lg"
            className={cn(
              "w-full transition-colors",
              justAdded && "bg-fountain-navy hover:bg-fountain-navy"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={justAdded ? "added" : canAdd ? "add" : "select"}
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
                ) : canAdd ? (
                  "Add to Cart"
                ) : (
                  "Select Options"
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>

        {mounted && (
          <Button
            type="button"
            variant={hasWish ? "default" : "outline"}
            size="lg"
            onClick={() => (hasWish ? removeWish(product._id) : addWish(product._id))}
            className="w-full sm:w-auto"
          >
            {hasWish ? "Wishlisted" : "Add to Wishlist"}
          </Button>
        )}
      </div>

      {!inStock && (
        <p className="font-sans text-sm text-terracotta">Currently out of stock</p>
      )}
    </div>
  );
}
