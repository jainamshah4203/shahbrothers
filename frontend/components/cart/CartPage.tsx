"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { validateCoupon } from "@/lib/coupons";

function normalizeImageUrl(src: string | undefined): string {
  if (!src) return "/placeholder.svg";
  try {
    let fixed = src.trim();
    fixed = fixed.replace(/unslpash/gi, "unsplash");
    fixed = fixed.replace(/(^|\.)image\.unsplash\.com/gi, "$1images.unsplash.com");
    if (fixed.startsWith("http://")) fixed = fixed.replace("http://", "https://");
    const url = new URL(fixed);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", "200");
      url.searchParams.set("h", "260");
      url.searchParams.set("q", "70");
      return url.toString();
    }
    return fixed;
  } catch {
    return "/placeholder.svg";
  }
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.removeItem);
  const removeAll = useCartStore((s) => s.removeAll);
  const setQty = useCartStore((s) => s.setQty);
  const clear = useCartStore((s) => s.clear);
  const coupon = useCartStore((s) => s.coupon);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);
  const storeSubtotal = useCartStore((s) => s.subtotal());
  const discountAmount = useCartStore((s) => s.discountAmount());
  const total = useCartStore((s) => s.total());
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = storeSubtotal;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
        <div className="mt-6">
          <Link href="/collections" className="underline">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <section className="lg:col-span-2 space-y-4">
        {items.map((line) => (
          <div key={`${line.productId}-${line.size ?? ''}-${line.color ?? ''}`} className="flex gap-4 rounded-md border p-3">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded bg-muted">
              <Image src={normalizeImageUrl(line.snapshot.images?.[0])} alt={line.snapshot.name} fill className="object-cover" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium line-clamp-1">{line.snapshot.name}</h3>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {line.size ? `Size: ${line.size}` : null}
                    {line.size && line.color ? ", " : null}
                    {line.color ? `Color: ${line.color}` : null}
                  </div>
                </div>
                <button className="text-sm text-muted-foreground hover:underline" onClick={() => removeAll(line.productId, { size: line.size, color: line.color })}>
                  Remove
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {/* Qty controls */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Qty</span>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      className="h-7 w-7 rounded border text-sm"
                      onClick={() => remove(line.productId, { size: line.size, color: line.color })}
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{line.qty}</span>
                    <button
                      aria-label="Increase quantity"
                      className="h-7 w-7 rounded border text-sm"
                      onClick={() => setQty(line.productId, line.qty + 1, { size: line.size, color: line.color })}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="font-medium">
                  ₹{((line.snapshot.salePrice ?? line.snapshot.price) * line.qty).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="pt-2">
          <button className="text-sm text-muted-foreground hover:underline" onClick={() => clear()}>Clear cart</button>
        </div>
      </section>

      <aside className="lg:col-span-1">
        <div className="rounded-md border p-4">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {/* Coupon input */}
          <div className="mt-4">
            {!coupon ? (
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 rounded border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="rounded bg-foreground text-background px-3 py-2 text-sm disabled:opacity-50"
                  disabled={applyingCoupon}
                  onClick={async () => {
                    const c = code.trim();
                    if (!c) { 
                      setCouponMsg("Enter a coupon code"); 
                      return; 
                    }
                    
                    setApplyingCoupon(true);
                    setCouponMsg(null);
                    
                    try {
                      const result = await validateCoupon(c, subtotal);
                      
                      if (result.valid && result.coupon) {
                        setCoupon({
                          code: result.coupon.code,
                          type: result.coupon.type,
                          value: result.coupon.value,
                          discount: result.discount,
                          finalTotal: result.finalTotal,
                        });
                        setCouponMsg(`Applied ${result.coupon.type === 'percent' ? `${result.coupon.value}%` : `₹${result.coupon.value}`} off`);
                        setCode("");
                      } else {
                        setCouponMsg(result.message || "Invalid coupon");
                      }
                    } catch (error) {
                      setCouponMsg("Failed to validate coupon. Please try again.");
                    } finally {
                      setApplyingCoupon(false);
                    }
                  }}
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">Coupon:</span> {coupon.code} {coupon.type === "percent" ? `(${coupon.value}% )` : `(₹${coupon.value})`}
                </div>
                <button className="text-muted-foreground hover:underline" onClick={() => clearCoupon()}>Remove</button>
              </div>
            )}
            {couponMsg && <p className="mt-2 text-xs text-muted-foreground">{couponMsg}</p>}
          </div>
          {/* Discount and total */}
          {discountAmount > 0 && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">-₹{discountAmount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm">Total</span>
            <span className="text-lg font-semibold">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Shipping and taxes calculated at checkout.</p>
          <button
            type="button"
            className="mt-4 w-full rounded-md bg-foreground text-background py-2.5 text-sm font-medium"
            onClick={() => router.push("/checkout")}
          >
            Proceed to Checkout
          </button>
          <div className="mt-3 text-center">
            <Link href="/collections" className="text-sm text-muted-foreground hover:underline">Continue shopping</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
