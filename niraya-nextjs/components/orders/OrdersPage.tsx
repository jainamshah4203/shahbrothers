"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderSuccess from "@/components/orders/OrderSuccess";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import Image from "next/image";

interface OrderItem {
  product?: { _id?: string; name?: string } | string;
  quantity: number;
  size?: string;
  color?: string;
  price?: number;
  image?: string;
}
interface Order {
  _id: string;
  id?: string;
  status?: string;
  total?: number;
  createdAt?: string;
  items?: OrderItem[];
  invoiceNumber?: string;
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const placed = (searchParams?.get("placed") || "") === "1";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prefer customer-scoped endpoints; avoid admin /orders unless explicitly allowed
        let data: any = null;
        const tryChain = async () => {
          try {
            return await apiGet<{ orders: Order[] }>("/orders/my-orders");
          } catch (err: any) {
            const msg = String(err?.message || "");
            // If it's 404 Not Found, try alternative user endpoints; if 401/403, bubble up
            if (/403|401/i.test(msg)) throw err;
            try {
              return await apiGet<{ orders: Order[] }>("/orders/my");
            } catch (err2: any) {
              const msg2 = String(err2?.message || "");
              if (/403|401/i.test(msg2)) throw err2;
              try {
                return await apiGet<{ orders: Order[] }>("/users/me/orders");
              } catch (err3: any) {
                // Do NOT fallback to /orders (admin) unless the message indicates allowed
                throw err3;
              }
            }
          }
        };
        data = await tryChain();
        let list: Order[] = data?.orders || [];

        // Fallback: include guest orders by stored email, if any
        try {
          const email = typeof window !== 'undefined' ? localStorage.getItem('niraya-last-email') : null;
          if (email) {
            const byEmail = await apiGet<{ orders: Order[] }>(`/orders/by-email?email=${encodeURIComponent(email)}`);
            const merged = new Map<string, Order>();
            [...list, ...(byEmail?.orders || [])].forEach((o) => {
              const key = (o._id || o.id) as string;
              if (key && !merged.has(key)) merged.set(key, o);
            });
            list = Array.from(merged.values()).sort((a,b) => new Date(b.createdAt||'').getTime() - new Date(a.createdAt||'').getTime());
          }
        } catch {}

        if (!ignore) setOrders(list);
      } catch (e: any) {
        if (!ignore) {
          const msg = String(e?.message || "Failed to load orders");
          if (/403/i.test(msg)) {
            setError("Access denied. Please sign in with a customer account to view your orders.");
          } else if (/401/i.test(msg)) {
            setError("Unauthorized. Please log in to view your orders.");
          } else {
            setError(msg);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your Orders</h1>
      {placed && (
        <div className="mt-4">
          <OrderSuccess />
        </div>
      )}
      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading orders…</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {!loading && orders.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
      )}
      <ul className="mt-6 space-y-4">
        {orders.map((o) => {
          const oid = o._id || o.id;
          const status = o.status || "Processing";
          const statusStyle = (() => {
            switch ((status || '').toLowerCase()) {
              case 'paid': return 'bg-green-50 text-green-700 border-green-200';
              case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
              case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
              case 'failed': return 'bg-red-50 text-red-700 border-red-200';
              case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
              default: return 'bg-blue-50 text-blue-700 border-blue-200'; // Processing
            }
          })();
          return (
            <li key={oid}>
              <Link href={`/orders/${oid}`} className="block rounded border p-4 hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">Order #{String(oid).slice(0,8)} {o.invoiceNumber ? <span className="text-xs text-muted-foreground">· Invoice {o.invoiceNumber}</span> : null}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center border px-2.5 py-1 rounded text-base font-semibold ${statusStyle}`}>{status}</span>
                      <span className="text-sm text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                    {o.items && o.items.length > 0 && (
                      <div className="mt-3">
                        <div className="flex gap-3">
                          {o.items.slice(0,3).map((i, idx) => {
                            const title = typeof i.product === 'string' ? i.product : (i.product?.name || 'Item');
                            const q = i.quantity ?? 0;
                            const img = i.image || "/images/placeholder-product.svg";
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="relative h-10 w-10 rounded border overflow-hidden bg-muted">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt={title} className="h-full w-full object-cover" onError={(e) => { const t=e.currentTarget as HTMLImageElement; t.src='/images/placeholder-product.svg'; }} />
                                </div>
                                <div className="text-sm text-muted-foreground max-w-[180px] truncate">{title} x{q}</div>
                              </div>
                            );
                          })}
                        </div>
                        {o.items.length > 3 && (
                          <div className="text-xs text-muted-foreground mt-1">+ {o.items.length - 3} more item(s)</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-base font-semibold whitespace-nowrap">₹{(o.total || 0).toLocaleString("en-IN")}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
