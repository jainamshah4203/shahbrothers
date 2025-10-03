"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { apiPost } from "@/lib/api";
import { createRazorpayOrder, loadRazorpayCheckout, verifyRazorpaySignature } from "@/lib/payments";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discountAmount());
  const total = useCartStore((s) => s.total());
  const clearCart = useCartStore((s) => s.clear);

  // Payment method: COD or ONLINE
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const shippingFee = total < 1500 ? 100 : 0;
  const payable = total + shippingFee;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentSucceededRef = useRef(false);

  const canPlace = mounted && items.length > 0 && name && email && address && city && postal;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!canPlace) return;
    // Client-side validation matching backend requirements
    const missing: string[] = [];
    items.forEach((i, idx) => {
      const sc = i.snapshot.sizesCount ?? 0;
      const cc = i.snapshot.colorsCount ?? 0;
      if (sc > 0 && !i.size) missing.push(`Item ${idx + 1} (${i.snapshot.name}): size is required`);
      if (cc > 1 && !i.color) missing.push(`Item ${idx + 1} (${i.snapshot.name}): color is required`);
    });
    if (!address.trim()) missing.push("Street address is required");
    if (!city.trim()) missing.push("City is required");
    if (!state.trim()) missing.push("State is required");
    if (!postal.trim()) missing.push("ZIP/Postal code is required");
    if (!country.trim()) missing.push("Country is required");
    if (missing.length > 0) {
      setError(missing.join("\n"));
      return;
    }
    setLoading(true);
    setError(null);
    const baseItems = items.map((i) => ({
      productId: i.productId,
      qty: i.qty,
      size: i.size,
      color: i.color,
      price: i.snapshot.salePrice ?? i.snapshot.price,
      name: i.snapshot.name,
    }));
    // Align with backend: routes/orders.ts expects
    // items[].product (mongo id), items[].quantity, items[].size, items[].color
    // shippingAddress.street, city, state, zipCode, country
    const methodForOrder: 'COD' | 'Razorpay' = paymentMethod === 'ONLINE' ? 'Razorpay' : 'COD';
    const payload = {
      items: baseItems.map((x) => ({
        product: x.productId,
        quantity: x.qty,
        size: x.size,
        color: x.color,
      })),
      shippingAddress: {
        street: address,
        city,
        state,
        zipCode: postal,
        country,
      },
      // Optional extra fields that backend may ignore
      coupon: coupon ? { code: coupon.code, discount: (typeof discount === 'number' ? discount : (coupon as any).discount || 0) } : undefined,
      amount: payable,
      shippingFee,
      paymentMethod: methodForOrder,
      contact: { name, email, phone },
      notes: notes || undefined,
    };
    try {
      // Persist email locally to help fetch guest orders later
      try { if (email) localStorage.setItem('niraya-last-email', email); } catch {}
      // Online payment via Razorpay: create RP order, open checkout, verify, then place order
      if (paymentMethod === 'ONLINE') {
        await loadRazorpayCheckout();
        const { key, order } = await createRazorpayOrder(payable, `rcpt_${Date.now()}`);
        const options: any = {
          key,
          amount: order.amount,
          currency: order.currency,
          name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'NIRAYA',
          description: 'Order Payment',
          order_id: order.id,
          prefill: { name, email, contact: phone },
          notes: { address },
          modal: {
            // Triggered when user closes the Razorpay modal without paying
            ondismiss: async () => {
              // Only mark as Failed if we did NOT succeed already
              if (!paymentSucceededRef.current) {
                try {
                  await apiPost<any>("/orders", {
                    ...payload,
                    status: 'Failed',
                    notes: 'Payment dismissed by user',
                  });
                  try { clearCart(); } catch {}
                  router.replace('/orders');
                } catch (err) {
                  console.error('Failed to record failed order on dismiss', err);
                }
              }
            },
          },
          handler: async (response: any) => {
            try {
              const ok = await verifyRazorpaySignature({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (!ok?.success) throw new Error('Payment verification failed');
              // proceed to create app order
              paymentSucceededRef.current = true;
              const res = await apiPost<any>("/orders", {
                ...payload,
                transactionId: response.razorpay_payment_id,
                status: 'Paid',
              });
              const orderId = res?.orderId || res?.id || res?._id || res?.order?._id;
              try { clearCart(); } catch {}
              if (orderId) router.replace(`/orders/${orderId}?placed=1`);
              else router.push('/orders?placed=1');
            } catch (err: any) {
              console.error('Payment handler error', err);
              alert(err?.message || 'Payment failed to verify');
            }
          },
          theme: { color: '#0f172a' },
        };
        const rz = new (window as any).Razorpay(options);
        // Listen for explicit payment failure - do not create order here since Razorpay allows retry in-modal
        try {
          rz.on('payment.failed', async (resp: any) => {
            console.warn('Razorpay payment.failed event', resp?.error);
          });
        } catch {}
        rz.open();
        setLoading(false);
        return; // stop normal flow; handler will continue
      }
      // COD flow
      // Try a few common endpoints
      let res: any = null;
      res = await apiPost<any>("/orders", payload);
      const checkoutUrl = res?.checkoutUrl || res?.url;
      const orderId = res?.orderId || res?.id || res?._id || res?.order?._id;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else if (orderId) {
        try { clearCart(); } catch {}
        router.replace(`/orders/${orderId}?placed=1`);
      } else {
        // Fallback: go to orders page; also log response for debugging
        console.warn("Checkout response missing url/id", res);
        router.push('/orders?placed=1');
      }
    } catch (e: any) {
      console.error("Checkout failed:", e);
      setError(e?.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <section className="lg:col-span-2">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <form className="mt-6 space-y-4" onSubmit={handlePlaceOrder}>
          {/* Payment method */}
          <div className="rounded border p-3">
            <div className="text-sm font-medium mb-2">Payment Method</div>
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <span>Cash on Delivery</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payment" value="ONLINE" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} />
                <span>Pay Online</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="rounded border p-2 text-sm" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="rounded border p-2 text-sm" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="rounded border p-2 text-sm" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="rounded border p-2 text-sm" placeholder="Postal Code" value={postal} onChange={(e) => setPostal(e.target.value)} required />
            <input className="rounded border p-2 text-sm" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <input className="rounded border p-2 text-sm" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
            <input className="rounded border p-2 text-sm" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <textarea className="w-full rounded border p-2 text-sm" rows={3} placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <textarea className="w-full rounded border p-2 text-sm" rows={3} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          {error && <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>}
          <button type="submit" disabled={!canPlace || loading} className={`rounded-md px-5 py-2.5 text-sm font-medium ${canPlace ? "bg-foreground text-background" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
            {loading ? "Processing..." : (paymentMethod === 'ONLINE' ? `Pay Now — ₹${payable.toLocaleString('en-IN')}` : "Place Order")}
          </button>
        </form>
      </section>
      <aside className="lg:col-span-1">
        <div className="rounded-md border p-4">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="mt-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            {coupon && <div className="flex justify-between"><span className="text-muted-foreground">Coupon</span><span>{coupon.code}{coupon.type === 'percent' ? ` (${coupon.value}%)` : ''}</span></div>}
            {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-₹{discount.toLocaleString("en-IN")}</span></div>}
            {shippingFee > 0 && (
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery & Shipping</span><span>₹{shippingFee.toLocaleString('en-IN')}</span></div>
            )}
            <div className="flex justify-between font-semibold pt-1 border-t mt-2"><span>Total</span><span>₹{(total + shippingFee).toLocaleString("en-IN")}</span></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
