"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import OrderSuccess from "@/components/orders/OrderSuccess";

interface OrderItem {
  product: any;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  status: string;
  total: number;
  subtotal?: number;
  couponDiscount?: number;
  discount?: number;
  shippingFee?: number;
  items: OrderItem[];
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    name?: string;
    phone?: string;
  };
  createdAt?: string;
  paymentMethod?: string;
  email?: string;
  invoiceNumber?: string;
  transactionId?: string;
  notes?: string;
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const placed = (searchParams?.get("placed") || "") === "1";
  const id = params?.id as string | undefined;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  function resolveImageUrl(raw?: string) {
    if (!raw) return "/placeholder.svg";
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/?api\/?$/i, "");
      let url = String(raw).trim();
      const match = url.match(/https?:\/\/[^\s"')]+/i);
      if (match) url = match[0];
      const isAbs = /^https?:\/\//i.test(url);
      if (isAbs) return url;
      if (/^\/(uploads|media|files|static|public)\//i.test(url)) return `${apiBase}${url}`;
      if (url.startsWith('/')) return url; // storefront asset
      return `/${url}`;
    } catch {
      return "/placeholder.svg";
    }
  }

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Try authenticated endpoint first, then public fallbacks
        let data: any = null;
        try {
          data = await apiGet<{ order: Order }>(`/orders/my-orders/${id}`);
        } catch (e1: any) {
          try {
            data = await apiGet<{ order: Order }>(`/orders/${id}`);
          } catch (e2: any) {
            data = await apiGet<{ order: Order }>(`/orders/track/${id}`);
          }
        }
        if (!ignore) setOrder(data.order);
      } catch (e: any) {
        const msg = String(e?.message || "Failed to load order");
        if (!ignore) {
          if (/403/i.test(msg)) setError("Access denied. Please sign in with the same customer account.");
          else if (/401/i.test(msg)) setError("Unauthorized. Please log in to view this order.");
          else setError(msg);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, [id]);

  // QR temporarily disabled to avoid build-time module issues; enable later when desired

  if (loading) return <div>Loading order...</div>;
  if (error) return <div className="text-red-600 whitespace-pre-wrap">{error}</div>;
  if (!order) return <div>Order not found.</div>;

  async function handleDownloadPdf() {
    try {
      if (!order) return;
      setDownloading(true);
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
      const url = `${apiBase}/orders/${order._id}/invoice.pdf`;
      window.open(url, '_blank');
    } catch (e) {
      console.error('Open invoice failed', e);
      alert('Failed to open invoice PDF');
    } finally {
      setDownloading(false);
    }
  }

  // Removed print functionality in favor of server-generated PDF

  const company = {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "NIRAYA",
    logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || "/favicon.ico",
    seal: process.env.NEXT_PUBLIC_COMPANY_SEAL || "",
    address:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
      "Ahmedabad, Gujarat, India",
    gst: process.env.NEXT_PUBLIC_COMPANY_GST || "",
    vat: process.env.NEXT_PUBLIC_COMPANY_VAT || "",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@niraya.example",
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Order #{order._id}</h1>
      {placed && (
        <div className="mt-4">
          <OrderSuccess />
        </div>
      )}
      <div className="mt-3 text-sm text-muted-foreground">Status: {order.status}</div>

      {/* Below: content area split into main (shipping/totals) and right aside (timeline) */}

      <div className="mt-4 flex gap-2 print:hidden">
        <button onClick={handleDownloadPdf} disabled={downloading} className="rounded border px-3 py-1.5 text-sm">
          {downloading ? "Preparing…" : "Download Invoice (PDF)"}
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #niraya-print-area, #niraya-print-area * { visibility: visible; }
          #niraya-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
        /* PDF export high-contrast, larger text */
        .pdf-export { color: #0d0d0d; font-size: 16px; font-weight: 600; }
        .pdf-export h1 { font-size: 28px; font-weight: 700; color: #0d0d0d; }
        .pdf-export h2 { font-size: 22px; font-weight: 700; color: #0d0d0d; }
        .pdf-export .muted { color: #222; }
        .pdf-export .total-big { font-size: 24px; font-weight: 800; }
        /* Avoid splitting item cards across pages */
        #niraya-print-area .order-item-card { break-inside: avoid; page-break-inside: avoid; }
      `}</style>

      <div className="mt-6 border rounded p-4" ref={invoiceRef} id="niraya-print-area">
        {/* Invoice meta (top-right only) */}
        <div className="flex items-start justify-end">
          <div className="text-sm text-right min-w-[260px]">
            <div><span className="text-muted-foreground">Invoice #:</span> {order.invoiceNumber || "—"}</div>
            <div><span className="text-muted-foreground">Order ID:</span> {order._id}</div>
            <div><span className="text-muted-foreground">Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</div>
            <div><span className="text-muted-foreground">Paid via:</span> {order.paymentMethod || "—"} {order.transactionId ? `(Txn: ${order.transactionId})` : ''}</div>
          </div>
        </div>
        {/* Bill To / Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="rounded border p-3">
            <div className="font-medium">Bill To</div>
            <div className="text-sm text-muted-foreground mt-1">
              {order.shippingAddress?.name || "—"}<br/>
              {order.email || "—"}<br/>
              {order.shippingAddress?.phone || ""}
            </div>
          </div>
          <div className="rounded border p-3">
            <div className="font-medium">Ship To</div>
            <div className="text-sm text-muted-foreground mt-1">
              {order.shippingAddress?.street}<br/>
              {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.zipCode]
                .filter(Boolean)
                .join(", ")}
              <br/>
              {order.shippingAddress?.country}
            </div>
          </div>
        </div>
        <h2 className="font-medium">Items</h2>
        <div className="mt-2 space-y-3">
          {order.items.map((it, idx) => {
            const img = resolveImageUrl(it.image);
            const title = it?.product?.name ?? "Product";
            const lineTotal = (it.price ?? 0) * (it.quantity ?? 0);
            return (
              <div key={idx} className="rounded border p-3 order-item-card">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={title}
                    className="h-16 w-16 rounded border object-cover"
                    onError={(e) => { const t=e.currentTarget as HTMLImageElement; t.src='/placeholder.svg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{title}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {it.quantity}
                      {it.size ? ` · Size: ${it.size}` : ""}
                      {it.color ? ` · Color: ${it.color}` : ""}
                    </div>
                    <div className="text-sm mt-1">Price: ₹{it.price} · Line total: ₹{lineTotal}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <h2 className="font-medium">Shipping</h2>
          <div className="text-sm text-muted-foreground mt-2">
            {order.shippingAddress?.street}<br/>
            {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.zipCode]
              .filter(Boolean)
              .join(", ")}
            <br/>
            {order.shippingAddress?.country}
          </div>

          <div className="mt-6">
            <div className="rounded border p-3 max-w-md text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground muted">Subtotal</span><span>₹{(order.subtotal ?? order.total).toLocaleString("en-IN")}</span></div>
              {((order.couponDiscount ?? 0) > 0) && (
                <div className="flex justify-between"><span className="text-muted-foreground muted">Coupon Discount</span><span className="text-green-700">-₹{(order.couponDiscount || 0).toLocaleString("en-IN")}</span></div>
              )}
              {((order.discount ?? 0) > 0) && (
                <div className="flex justify-between"><span className="text-muted-foreground muted">Discount</span><span className="text-green-700">-₹{(order.discount || 0).toLocaleString("en-IN")}</span></div>
              )}
              {((order.shippingFee ?? 0) > 0) && (
                <div className="flex justify-between"><span className="text-muted-foreground muted">Delivery & Shipping</span><span>₹{(order.shippingFee || 0).toLocaleString("en-IN")}</span></div>
              )}
              <div className="flex justify-between pt-2 border-t mt-2 total-big"><span>Amount Payable</span><span>₹{(order.total).toLocaleString("en-IN")}</span></div>
            </div>
          </div>
        </div>

        {/* Right aside: vertical status timeline */}
        <aside className="rounded border p-4">
          <div className="font-medium mb-2">Order Progress</div>
          {(() => {
            const pm = (order.paymentMethod || '').toUpperCase();
            const isCOD = pm === 'COD';
            // Online order flow: Payment accepted → Processing → Shipped → Delivered
            const onlineSteps = [
              { key: 'paid', label: 'Payment Accepted' },
              { key: 'processing', label: 'Order Processing' },
              { key: 'shipped', label: 'Order Has Been Shipped' },
              { key: 'delivered', label: 'Order Successfully Delivered' },
            ] as const;
            // COD order flow: Processing → Shipped → Delivered
            const codSteps = [
              { key: 'processing', label: 'Order Processing' },
              { key: 'shipped', label: 'Order Has Been Shipped' },
              { key: 'delivered', label: 'Order Successfully Delivered' },
            ] as const;
            const steps = isCOD ? codSteps : onlineSteps;
            const status = (order.status || 'Processing').toLowerCase();
            const failed = status === 'failed' || status === 'cancelled';
            // Map status -> step index for each flow
            let currentIdx = 0;
            if (isCOD) {
              if (status === 'shipped') currentIdx = 1;
              else if (status === 'delivered' || status === 'paid') currentIdx = 2;
              else currentIdx = 0; // processing
            } else {
              if (status === 'paid') currentIdx = 0;
              else if (status === 'shipped') currentIdx = 2;
              else if (status === 'delivered') currentIdx = 3;
              else currentIdx = 1; // processing
            }
            return (
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-[14px] top-0 bottom-0 w-0.5 bg-muted" aria-hidden />
                <ul className="space-y-4">
                  {steps.map((s, i) => {
                    const done = i < currentIdx && !failed;
                    const current = i === currentIdx && !failed;
                    const labelCls = done || current ? 'text-foreground' : 'text-muted-foreground';
                    const iconColor = done || current ? '#16a34a' : '#9ca3af';
                    const Dot = () => (
                      done || current ? (
                        <svg className="absolute left-0 top-[1px]" width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <circle cx="12" cy="12" r="9" fill="#16a34a" stroke="#16a34a" strokeWidth="1.5" />
                          <path d="M8 12l3 3 5-5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg className="absolute left-0 top-[1px]" width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                          <circle cx="12" cy="12" r="9" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" />
                        </svg>
                      )
                    );
                    const Icon = () => {
                      switch (s.key) {
                        case 'paid':
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="6" width="18" height="12" rx="2" stroke={iconColor} strokeWidth="1.6"/>
                              <path d="M3 10h18" stroke={iconColor} strokeWidth="1.6"/>
                              <path d="M16 14h3" stroke={iconColor} strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                          );
                        case 'processing':
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 16V8l-3-3H6L3 8v8l3 3h12l3-3z" stroke={iconColor} strokeWidth="1.6"/>
                              <path d="M3 8h18" stroke={iconColor} strokeWidth="1.6"/>
                            </svg>
                          );
                        case 'shipped':
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 7h11v7H3V7z" stroke={iconColor} strokeWidth="1.6"/>
                              <path d="M14 10h4l3 3v1h-7V10z" stroke={iconColor} strokeWidth="1.6"/>
                              <circle cx="7" cy="18" r="2" stroke={iconColor} strokeWidth="1.6"/>
                              <circle cx="17" cy="18" r="2" stroke={iconColor} strokeWidth="1.6"/>
                            </svg>
                          );
                        case 'delivered':
                          return (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 12l9-9 9 9v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7z" stroke={iconColor} strokeWidth="1.6"/>
                              <path d="M9 21v-6h6v6" stroke={iconColor} strokeWidth="1.6"/>
                            </svg>
                          );
                        default:
                          return null;
                      }
                    };
                    return (
                      <li key={s.key} className="relative pl-12">
                        <Dot />
                        <div className={`text-sm ${labelCls} flex items-center gap-2`}>
                          <Icon />
                          <span>{s.label}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {failed && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded border text-sm bg-red-50 text-red-700 border-red-200">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-600" />
                    <span>{order.status}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </aside>
      </div>

      {/* Footer / Terms */}
      <div className="mt-6 text-xs text-muted-foreground">
        {order.notes && (
          <div className="mb-3 p-3 rounded border bg-white text-black">
            <div className="font-medium mb-1">Notes</div>
            <div className="whitespace-pre-wrap text-sm">{order.notes}</div>
          </div>
        )}
        <div className="whitespace-pre-line">
          Thank you for shopping with {company.name}. All sales are subject to our return & replacement policy.
          Returns accepted within 7 days of delivery if the item is unused and in original condition with tags.
          For support, contact {company.email}.
        </div>
        {/* QR disabled */}
        {company.seal && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.seal} alt="Company seal" className="h-14" />
          </div>
        )}
      </div>
    </div>
  );
}
