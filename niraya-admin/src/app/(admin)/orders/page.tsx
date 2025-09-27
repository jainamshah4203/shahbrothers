"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ApiOrder, fetchOrders, deleteOrder as apiDeleteOrder } from "@/services/orders";
import { formatINR } from "@/lib/currency";

export default function OrdersPage() {
  const [items, setItems] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchOrders({ page, limit, email: email || undefined, status: status || undefined, paymentMethod: paymentMethod || undefined });
      setItems(data.orders);
      setTotal(data.pagination.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this order? This action cannot be undone.')) return;
    try {
      await apiDeleteOrder(id);
      setItems(prev => prev.filter(o => o._id !== id));
      setOpenMenuId(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete order');
    }
  }

  function openMenu(oId: string, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.bottom + window.scrollY + 4;
    setMenuPos({ x, y });
    setOpenMenuId(prev => (prev === oId ? null : oId));
  }

  useEffect(() => {
    function onClickOutside(ev: MouseEvent) {
      if (!menuRef.current) return;
      if (openMenuId && !menuRef.current.contains(ev.target as Node)) {
        setOpenMenuId(null);
      }
    }
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpenMenuId(null);
    }
    function onScrollOrResize() {
      if (openMenuId) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [openMenuId]);

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Orders</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Search by email" className="border rounded px-3 py-2 text-sm w-56" />
              <select className="border rounded px-2 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select className="border rounded px-2 py-2 text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">All Payments</option>
                <option value="COD">COD</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { setPage(1); load(); }}>Apply</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEmail(""); setStatus(""); setPaymentMethod(""); setPage(1); load(); }}>Reset</Button>
            </div>
          </div>

          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Payment</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Country</th>
                    <th className="py-2 pr-4">State</th>
                    <th className="py-2 pr-4">City</th>
                    <th className="py-2 pr-4">Pincode</th>
                    <th className="py-2 pr-4">Total Item</th>
                    <th className="py-2 pr-4">Subtotal</th>
                    <th className="py-2 pr-4">Discount</th>
                    <th className="py-2 pr-4">Coupon Discount</th>
                    <th className="py-2 pr-4">Total Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => {
                    const addr = o.shippingAddress || ({} as any);
                    const online = o.paymentMethod && o.paymentMethod !== 'COD' ? 'Online' : 'COD';
                    return (
                      <tr key={o._id} className="border-b last:border-0">
                        <td className="py-2 pr-4 text-xs font-mono">{o._id}</td>
                        <td className="py-2 pr-4">{online}</td>
                        <td className="py-2 pr-4">{addr.name || '-'}</td>
                        <td className="py-2 pr-4">{o.email || '-'}</td>
                        <td className="py-2 pr-4">{addr.phone || '-'}</td>
                        <td className="py-2 pr-4">{addr.country || '-'}</td>
                        <td className="py-2 pr-4">{addr.state || '-'}</td>
                        <td className="py-2 pr-4">{addr.city || '-'}</td>
                        <td className="py-2 pr-4">{addr.zipCode || '-'}</td>
                        <td className="py-2 pr-4">{Array.isArray(o.items) ? o.items.length : 0}</td>
                        <td className="py-2 pr-4 price">{formatINR(o.subtotal ?? o.total)}</td>
                        <td className="py-2 pr-4 price">{formatINR(o.discount ?? 0)}</td>
                        <td className="py-2 pr-4 price">{formatINR(o.couponDiscount ?? 0)}</td>
                        <td className="py-2 pr-4 price">{formatINR(o.totalAmount ?? o.total)}</td>
                        <td className="py-2 pr-4">{o.status}</td>
                        <td className="py-2 pr-4 text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                        <td className="py-2 pr-4">
                          <button aria-label="Actions" className="border rounded px-2 py-1 text-sm" onClick={(e) => openMenu(o._id, e)}>···</button>
                          {openMenuId === o._id && menuPos && createPortal(
                            <div ref={menuRef} style={{ position: 'fixed', left: menuPos.x, top: menuPos.y }} className="z-[1000] w-48 rounded border bg-white shadow-lg">
                              <Link className="block px-3 py-2 text-sm hover:bg-gray-100" href={`/orders/${o._id}`}>View details</Link>
                              {(() => {
                                const slug = (o as any)?.items?.[0]?.product?.slug as string | undefined;
                                const storeBase = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
                                return slug ? (
                                  <a
                                    className="block px-3 py-2 text-sm hover:bg-gray-100"
                                    href={`${storeBase}/product/${slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View product
                                  </a>
                                ) : null;
                              })()}
                              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => handleDelete(o._id)}>Delete</button>
                            </div>,
                            document.body
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-sm text-muted-foreground">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-3 text-sm">
            <div>Rows per page
              <select className="ml-2 border rounded px-2 py-1" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <div>Page {page}</div>
              <Button size="sm" variant="outline" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
