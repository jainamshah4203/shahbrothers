"use client";

import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { formatINR } from "@/lib/formatCurrency";

const FREE_SHIPPING_THRESHOLD = 1500;

/**
 * Gift-wrapped cart slide-over — ink shipping progress + optional gift note.
 */
export const CartDrawer: React.FC = () => {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const { miniCartOpen, closeMiniCart } = useUIStore();
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.removeItem);
  const removeAll = useCartStore((s) => s.removeAll);
  const setQty = useCartStore((s) => s.setQty);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (miniCartOpen) closeMiniCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!miniCartOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMiniCart();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [miniCartOpen, closeMiniCart]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum + (i.snapshot.salePrice ?? i.snapshot.price) * i.qty,
        0
      ),
    [items]
  );

  const shippingProgress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  const handleCheckout = useCallback(() => {
    closeMiniCart();
    router.push("/checkout");
  }, [closeMiniCart, router]);

  const handleViewCart = useCallback(() => {
    closeMiniCart();
    router.push("/cart");
  }, [closeMiniCart, router]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {miniCartOpen && (
        <div className="fixed inset-0 z-[60]" role="presentation">
          <motion.div
            className="absolute inset-0 bg-charcoal-ink/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMiniCart}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-warm-off-white shadow-floating paper-grain"
          >
            <div className="relative z-[1] flex items-center justify-between border-b border-charcoal-ink/8 px-5 py-4">
              <h2
                id={titleId}
                className="font-serif text-2xl font-medium tracking-tight text-charcoal-ink"
              >
                Your <em className="italic-accent">Parcel</em>
              </h2>
              <button
                type="button"
                onClick={closeMiniCart}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-sepia transition-colors hover:bg-linen hover:text-charcoal-ink focus-ring"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Free shipping ink line */}
            <div className="relative z-[1] space-y-2 border-b border-charcoal-ink/8 px-5 py-4">
              <p className="font-sans text-xs tracking-tight text-muted-sepia">
                {remaining > 0
                  ? `${formatINR(remaining)} away from complimentary shipping`
                  : "Complimentary shipping unlocked"}
              </p>
              <div
                className="h-px w-full overflow-hidden bg-linen"
                role="progressbar"
                aria-valuenow={Math.round(shippingProgress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress toward free shipping"
              >
                <motion.div
                  className="ink-progress h-full"
                  initial={false}
                  animate={{ width: `${shippingProgress * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 24 }}
                />
              </div>
            </div>

            <div className="relative z-[1] flex-1 space-y-4 overflow-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="font-sans text-sm text-muted-sepia">
                  Your cart is empty — explore the collection.
                </p>
              ) : (
                items.map((i) => (
                  <div
                    key={`${i.productId}-${i.size ?? "_"}-${i.color ?? "_"}`}
                    className="flex gap-3"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-[2px] bg-linen debossed">
                      <Image
                        src={i.snapshot.images?.[0] || "/placeholder.svg"}
                        alt={i.snapshot.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 font-sans text-sm font-medium text-charcoal-ink">
                        {i.snapshot.name}
                      </div>
                      {(i.size || i.color) && (
                        <div className="mt-0.5 font-sans text-xs text-muted-sepia">
                          {[i.size && `Size ${i.size}`, i.color && i.color]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-sans text-xs text-muted-sepia">
                          {formatINR(
                            i.snapshot.salePrice ?? i.snapshot.price
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-charcoal-ink/15 text-sm focus-ring"
                            onClick={() =>
                              remove(i.productId, {
                                size: i.size,
                                color: i.color,
                              })
                            }
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-sans text-sm tabular-nums">
                            {i.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-charcoal-ink/15 text-sm focus-ring"
                            onClick={() =>
                              setQty(i.productId, i.qty + 1, {
                                size: i.size,
                                color: i.color,
                              })
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeAll(i.productId, {
                          size: i.size,
                          color: i.color,
                        })
                      }
                      className="self-start font-sans text-xs text-muted-sepia underline-offset-2 hover:underline focus-ring"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}

              {/* Gift message */}
              <div className="rounded-md border border-dashed border-charcoal-ink/15 bg-cream/60 p-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={giftOpen}
                    onChange={(e) => setGiftOpen(e.target.checked)}
                    className="h-4 w-4 rounded border-charcoal-ink/30 text-fountain-navy focus:ring-brass"
                  />
                  <span className="font-sans text-sm text-charcoal-ink">
                    Add a handwritten gift note
                  </span>
                </label>
                <AnimatePresence>
                  {giftOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        value={giftMessage}
                        onChange={(e) =>
                          setGiftMessage(e.target.value.slice(0, 200))
                        }
                        rows={3}
                        placeholder="For someone who writes beautifully…"
                        className="mt-3 w-full resize-none rounded-md border border-charcoal-ink/10 bg-warm-off-white px-3 py-2 font-serif text-base italic leading-relaxed text-charcoal-ink placeholder:text-muted-sepia/50 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
                        aria-label="Gift message"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="relative z-[1] space-y-3 border-t border-charcoal-ink/8 bg-cream/80 px-5 py-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm text-muted-sepia">
                  Subtotal
                </span>
                <span className="font-sans text-base font-semibold tabular-nums text-charcoal-ink">
                  {formatINR(subtotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full rounded-md bg-charcoal-ink py-3.5 font-sans text-sm font-medium tracking-wide text-warm-off-white transition-colors hover:bg-fountain-navy focus-ring disabled:cursor-not-allowed disabled:opacity-40"
              >
                Checkout
              </button>
              <button
                type="button"
                onClick={handleViewCart}
                className="w-full py-2 font-sans text-sm text-muted-sepia underline-offset-4 hover:text-charcoal-ink hover:underline focus-ring"
              >
                View full cart
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
