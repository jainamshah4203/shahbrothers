"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function MiniCart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { miniCartOpen, closeMiniCart } = useUIStore();
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.removeItem);
  const removeAll = useCartStore((s) => s.removeAll);
  const setQty = useCartStore((s) => s.setQty);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-close the drawer on route change so overlay never stays on top
  useEffect(() => {
    if (!mounted) return;
    if (miniCartOpen) closeMiniCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const subtotal = items.reduce((sum, i) => sum + (i.snapshot.salePrice ?? i.snapshot.price) * i.qty, 0);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 ${miniCartOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${miniCartOpen ? "opacity-100" : "opacity-0"}`}
        onClick={closeMiniCart}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[380px] bg-background border-l border-border shadow-xl transition-transform ${
          miniCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Your Cart</h3>
          <button onClick={closeMiniCart} className="text-sm text-muted-foreground">Close</button>
        </div>

        <div className="p-4 space-y-4 overflow-auto h-[calc(100%-160px)]">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            items.map((i) => (
              <div key={`${i.productId}-${i.size ?? "_"}-${i.color ?? "_"}`} className="flex gap-3">
                <div className="relative h-16 w-12 overflow-hidden rounded border bg-muted">
                  <Image src={i.snapshot.images?.[0] || "/placeholder.svg"} alt={i.snapshot.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium line-clamp-1">{i.snapshot.name}</div>
                  {(i.size || i.color) && (
                    <div className="text-xs text-muted-foreground">
                      {i.size && <span>Size: {i.size}</span>}
                      {i.size && i.color && <span>{" · "}</span>}
                      {i.color && <span>Color: {i.color}</span>}
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    {/* Show only unit price here; subtotal shown below */}
                    <div className="text-xs text-muted-foreground">
                      ₹{(i.snapshot.salePrice ?? i.snapshot.price).toLocaleString("en-IN")}
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Decrease quantity"
                        className="h-6 w-6 rounded border text-xs"
                        onClick={() => remove(i.productId, { size: i.size, color: i.color })}
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{i.qty}</span>
                      <button
                        aria-label="Increase quantity"
                        className="h-6 w-6 rounded border text-xs"
                        onClick={() => setQty(i.productId, i.qty + 1, { size: i.size, color: i.color })}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeAll(i.productId, { size: i.size, color: i.color })} className="text-xs text-muted-foreground hover:underline">Remove</button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              // Close first to avoid overlay persisting on mobile, then navigate SPA
              try { closeMiniCart(); } catch {}
              router.push('/cart');
            }}
            className="w-full inline-flex items-center justify-center rounded-md px-4 py-2 bg-foreground text-background text-sm"
          >
            View Cart
          </button>
        </div>
      </aside>
    </div>
  );
}
