"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchCustomers, ApiCustomer } from "@/services/customers";
import { formatINR } from "@/lib/currency";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [items, setItems] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCustomers({ page, limit, search: search || undefined });
      setItems(data.customers);
      setTotal(data.pagination.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  function applyFilters() {
    setPage(1);
    load();
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Customers</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 pb-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Search</label>
              <input className="border rounded px-2 py-1 text-sm w-64" placeholder="Name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button size="sm" onClick={applyFilters}>Apply</Button>
            <div className="ml-auto text-xs text-muted-foreground">Total: {total}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Orders</th>
                  <th className="py-2 pr-4">Total Spent</th>
                  <th className="py-2 pr-4">Last Order</th>
                  <th className="py-2 pr-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.email} className="border-b last:border-0">
                    <td className="py-2 pr-4">{c.name || '-'}</td>
                    <td className="py-2 pr-4">{c.email}</td>
                    <td className="py-2 pr-4">{c.phone || '-'}</td>
                    <td className="py-2 pr-4">{c.ordersCount}</td>
                    <td className="py-2 pr-4 price">{formatINR(c.totalSpent || 0)}</td>
                    <td className="py-2 pr-4 text-xs">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleString() : '-'}</td>
                    <td className="py-2 pr-4 text-xs">{c.joinedAt ? new Date(c.joinedAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-4 text-sm text-muted-foreground">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {loading && <div className="text-sm text-muted-foreground py-2">Loading...</div>}
          {error && <div className="text-sm text-red-600 py-2">{error}</div>}

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2 text-sm">
              <span>Rows per page</span>
              <select className="border rounded px-2 py-1 text-sm" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
              <div>Page {page}</div>
              <Button size="sm" variant="outline" disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
