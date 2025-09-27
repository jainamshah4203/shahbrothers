"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";

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
    <div className="mt-6 space-y-4">
      {/* Qty selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Qty</label>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            className="h-8 w-8 rounded border text-lg"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value || "1", 10);
              if (Number.isFinite(v)) setQty(Math.min(Math.max(1, v), maxQty));
            }}
            className="h-8 w-16 rounded border text-center"
          />
          <button
            type="button"
            className="h-8 w-8 rounded border text-lg"
            onClick={() => setQty((q) => Math.min(q + 1, maxQty))}
          >
            +
          </button>
        </div>
      </div>

      {needColor && (
        <div>
          <label className="text-sm text-muted-foreground">Color</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors!.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`px-3 py-1 rounded border text-sm ${
                  color === c ? "border-foreground" : "border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {needSize && (
        <div>
          <label className="text-sm text-muted-foreground">Size</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes!.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-3 py-1 rounded border text-sm ${
                  size === s ? "border-foreground" : "border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors ${
            canAdd
              ? "bg-foreground text-background hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Add to Cart
        </button>

        {mounted && (
          <button
            type="button"
            onClick={() => (hasWish ? removeWish(product._id) : addWish(product._id))}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm border ${
              hasWish ? "border-foreground" : "border-border"
            }`}
          >
            {hasWish ? "Wishlisted" : "Add to Wishlist"}
          </button>
        )}
      </div>
    </div>
  );
}
