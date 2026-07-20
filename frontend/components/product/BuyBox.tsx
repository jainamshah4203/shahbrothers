"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Minus, Plus } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState<number>(1);
  const inStock = typeof product.stock === "number" ? product.stock > 0 : true; // assume in stock if not provided
  const maxQty = typeof product.stock === "number" && product.stock > 0 ? product.stock : 99;

  // If there is exactly one size or color, auto-select it to avoid blocking add-to-cart.
  useEffect(() => {
    if (!size && Array.isArray(product.sizes) && product.sizes.length === 1) {
      setSize(product.sizes[0]);
    }
    if (!color && Array.isArray(product.colors) && product.colors.length === 1) {
      setColor(product.colors[0]);
    }
  }, [product._id, product.sizes, product.colors, size, color]);

  function handleAdd() {
    const mapped = {
      id: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      category: product.category,
      inStock,
    } as any; // conforms to Product used in cart store

    addItem(mapped, { qty, size, color });
    openMiniCart();
  }

  const needSize = (product.sizes?.length || 0) > 0;
  // Only require color if there are 2+ choices. If 0 or 1 color, do not block checkout.
  const needColor = (product.colors?.length || 0) > 1;
  const canAdd = inStock && (!needSize || size) && (!needColor || color);

  return (
    <div className="mt-6 space-y-6">
      {/* Qty selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-muted-foreground w-12">Qty</label>
        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQty((q) => Math.min(q + 1, maxQty))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {needColor && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Color</label>
          <ToggleGroup type="single" value={color} onValueChange={(v) => { if(v) setColor(v); }} className="justify-start flex-wrap gap-2">
            {product.colors!.map((c) => (
              <ToggleGroupItem
                key={c}
                value={c}
                variant="outline"
                className="h-9 px-4 text-sm hover:scale-105 transition-transform"
              >
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {needSize && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Size</label>
          <ToggleGroup type="single" value={size} onValueChange={(v) => { if(v) setSize(v); }} className="justify-start flex-wrap gap-2">
            {product.sizes!.map((s) => (
              <ToggleGroupItem
                key={s}
                value={s}
                variant="outline"
                className="h-9 px-4 text-sm hover:scale-105 transition-transform"
              >
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          size="lg"
          className="w-full sm:flex-1"
        >
          {canAdd ? "Add to Cart" : "Select Options"}
        </Button>

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
    </div>
  );
}
