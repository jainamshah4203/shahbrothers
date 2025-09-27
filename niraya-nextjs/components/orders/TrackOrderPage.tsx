"use client";

import { useState } from "react";
import { apiGet } from "@/lib/api";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Try a few common endpoints
      let data: any = null;
      try {
        data = await apiGet(`/orders/${orderId}?email=${encodeURIComponent(email)}`);
      } catch {
        try {
          data = await apiGet(`/orders/track/${orderId}?email=${encodeURIComponent(email)}`);
        } catch {
          data = await apiGet(`/orders/${orderId}`);
        }
      }
      setResult(data?.order || data);
    } catch (e: any) {
      setError(e?.message || "Failed to track order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Track Order</h1>
      <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleTrack}>
        <input className="rounded border p-2 text-sm" placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
        <input className="rounded border p-2 text-sm" placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className={`rounded px-4 py-2 text-sm font-medium ${loading ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background'}`} disabled={loading}>
          {loading ? 'Checking…' : 'Track'}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-6 rounded border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Order #{(result._id || result.id || '').slice?.(0,8)}</div>
              <div className="text-sm text-muted-foreground">{result.status || 'Processing'}</div>
            </div>
            {typeof result.total === 'number' && (
              <div className="text-sm font-semibold">₹{result.total.toLocaleString('en-IN')}</div>
            )}
          </div>
          {Array.isArray(result.items) && result.items.length > 0 && (
            <ul className="mt-3 text-sm list-disc pl-5">
              {result.items.map((it: any, idx: number) => (
                <li key={idx}>{(it.name || it.product?.name || it.productId)} ×{it.qty || it.quantity}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
