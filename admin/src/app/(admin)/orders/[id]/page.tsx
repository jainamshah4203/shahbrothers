"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState, use as useUnwrap } from "react";
import { ApiOrder, fetchOrderById, updateOrderStatus } from "@/services/orders";
import { Button } from "@/components/ui/button";

export default function OrderDetailPage({ params }: { params: any }) {
  // In Next.js 15+, params can be a Promise. Unwrap with React.use()
  const unwrappedParams = (params && typeof params.then === "function") ? useUnwrap(params) : params;
  const orderId: string = unwrappedParams?.id;
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [status, setStatus] = useState<ApiOrder['status'] | "">("");

  async function load() {
    setLoading(true);
    try {
      const { order } = await fetchOrderById(orderId);
      setOrder(order);
      setStatus(order.status);
    } catch (e: any) {
      setError(e?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const addr = order?.shippingAddress as any;
  const online = order?.paymentMethod && order?.paymentMethod !== 'COD' ? 'Online' : 'COD';

  async function onSaveStatus() {
    if (!order) return;
    try {
      setSaving(true);
      const { order: updated } = await updateOrderStatus(order._id, status as any);
      setOrder(updated);
      setToast('Order status updated');
      setTimeout(() => setToast(null), 2000);
    } catch (e: any) {
      alert(e?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Order Details</h1>
      {toast && (
        <div className="rounded bg-green-50 text-green-700 text-sm px-3 py-2 border border-green-200 inline-block">{toast}</div>
      )}

      {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {order && (
        <>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="font-medium mb-2">Order</div>
                  <div className="space-y-1">
                    <div><span className="text-muted-foreground">Order ID:</span> <span className="font-mono text-xs">{order._id}</span></div>
                    <div><span className="text-muted-foreground">Payment:</span> {online}</div>
                    {order.transactionId && (
                      <div><span className="text-muted-foreground">Transaction ID:</span> {order.transactionId}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <select className="border rounded px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <Button size="sm" disabled={saving || status === order.status} onClick={onSaveStatus}>{saving ? 'Saving...' : 'Save Status'}</Button>
                    </div>
                    <div><span className="text-muted-foreground">Created:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Order Summary</div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal ?? order.total}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>₹{order.discount ?? 0}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Coupon Discount</span><span>₹{order.couponDiscount ?? 0}</span></div>
                    <div className="flex justify-between font-semibold"><span>Total</span><span>₹{order.totalAmount ?? order.total}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => {
                    // Resolve final image URL
                    const rawUrl = ((it as any).image || (it as any)?.snapshot?.image || (it as any)?.product?.image || '') as string;
                    const isAbsolute = /^https?:\/\//i.test(rawUrl);
                    const isRoot = rawUrl.startsWith('/');
                    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';
                    const storeBase = process.env.NEXT_PUBLIC_STORE_URL || '';
                    let imgUrl = rawUrl;
                    if (!isAbsolute && isRoot) {
                      // Heuristic: backend-served uploads vs storefront assets
                      if (/^\/(uploads|media|files|static|public)\//i.test(rawUrl)) {
                        imgUrl = backendBase ? `${backendBase}${rawUrl}` : rawUrl;
                      } else {
                        imgUrl = storeBase ? `${storeBase}${rawUrl}` : rawUrl;
                      }
                    } else if (!isAbsolute && rawUrl) {
                      // Relative without leading slash
                      if (/^(uploads|media|files|static|public)\//i.test(rawUrl)) {
                        imgUrl = backendBase ? `${backendBase}/${rawUrl}` : `/${rawUrl}`;
                      } else {
                        imgUrl = storeBase ? `${storeBase}/${rawUrl}` : `/${rawUrl}`;
                      }
                    }
                    // If the string contains extra data, extract the first absolute URL token
                    const match = imgUrl && imgUrl.match(/https?:\/\/[^\s"'),)]+/i);
                    const safeUrl = match ? match[0] : imgUrl;
                    return (
                      <tr key={it._id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <div className="flex items-start gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={safeUrl || "/images/placeholder-product.svg"}
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                if (!target.src.endsWith('/images/placeholder-product.svg')) {
                                  target.src = '/images/placeholder-product.svg';
                                }
                              }}
                              alt={it.product?.name || 'Item'}
                              className="h-12 w-12 object-cover rounded border"
                            />
                            <div>
                              <div className="font-medium">{it.product?.name || 'Item'}</div>
                              {it.product?.slug && (
                                <div className="text-xs">
                                  <a
                                    className="text-blue-600 hover:underline"
                                    href={`${process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'}/products/${it.product.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View on storefront
                                  </a>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">{(it as any).sku ? `SKU: ${(it as any).sku}` : ''}</div>
                              <div className="text-xs text-muted-foreground">{it.color ? `Color: ${it.color}` : ''}</div>
                              <div className="text-xs text-muted-foreground">{it.size ? `Size: ${it.size}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-4">₹{it.price}</td>
                        <td className="py-2 pr-4">{it.quantity}</td>
                        <td className="py-2 pr-4">₹{it.price * it.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Shipping Address</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const parts = [
                      addr?.name,
                      order?.email,
                      addr?.phone,
                      addr?.street,
                      addr?.address2 || addr?.line2 || addr?.apartment || addr?.suite,
                      addr?.landmark,
                      `${addr?.city || ''}${addr?.state ? (addr?.city ? ', ' : '') + addr?.state : ''}`.trim(),
                      addr?.zipCode,
                      addr?.country,
                    ].filter(Boolean);
                    const text = parts.join('\n');
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(text).then(() => setToast('Address copied')).catch(() => setToast('Copy failed'));
                    } else {
                      setToast('Copy not supported');
                    }
                    setTimeout(() => setToast(null), 1500);
                  }}
                >
                  Copy address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">Street</div>
                    <div className="break-words">{addr?.street || '-'}</div>
                  </div>
                  {(addr?.address2 || addr?.line2 || addr?.apartment || addr?.suite) && (
                    <div className="flex items-start gap-3 py-1">
                      <div className="w-28 text-muted-foreground">Address 2</div>
                      <div className="break-words">{addr?.address2 || addr?.line2 || addr?.apartment || addr?.suite}</div>
                    </div>
                  )}
                  {addr?.landmark && (
                    <div className="flex items-start gap-3 py-1">
                      <div className="w-28 text-muted-foreground">Landmark</div>
                      <div className="break-words">{addr?.landmark}</div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">City</div>
                    <div>{addr?.city || '-'}</div>
                  </div>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">State</div>
                    <div>{addr?.state || '-'}</div>
                  </div>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">Pincode</div>
                    <div>{addr?.zipCode || '-'}</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">Name</div>
                    <div className="font-medium">{addr?.name || '-'}</div>
                  </div>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">Email</div>
                    <div className="break-all">{order.email || '-'}</div>
                  </div>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">Phone</div>
                    <div>{addr?.phone || '-'}</div>
                  </div>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-28 text-muted-foreground">Country</div>
                    <div>{addr?.country || '-'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
