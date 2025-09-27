"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ApiCoupon, fetchCoupons, deleteCoupon as apiDeleteCoupon, exportCoupons, importCoupons } from "@/services/coupons";

export default function CouponsPage() {
  const [items, setItems] = useState<ApiCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [includeExpired, setIncludeExpired] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCoupons({ page, limit, search: search || undefined, includeExpired });
      setItems(data.coupons);
      setTotal(data.pagination.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, includeExpired]);

  function openMenu(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY + 4 });
    setOpenMenuId(prev => (prev === id ? null : id));
  }

  useEffect(() => {
    function onClickOutside(ev: MouseEvent) {
      if (!menuRef.current) return;
      if (openMenuId && !menuRef.current.contains(ev.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [openMenuId]);

  async function onDelete(id: string) {
    if (!confirm('Delete this coupon?')) return;
    try {
      await apiDeleteCoupon(id);
      setItems(prev => prev.filter(c => c._id !== id));
      setOpenMenuId(null);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  }

  function applyFilters() {
    setPage(1);
    load();
  }

  async function handleExport() {
    try {
      setExporting(true);
      const blob = await exportCoupons();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coupons-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(e?.message || 'Failed to export');
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const result = await importCoupons(text);
      alert(`Import complete: ${result.created} created${result.errors.length ? `, ${result.errors.length} errors` : ''}`);
      if (result.created > 0) load();
    } catch (e: any) {
      alert(e?.message || 'Failed to import');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">All Coupons</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? 'Importing...' : 'Import CSV'}
          </Button>
          <Link href="/coupons/analytics"><Button size="sm" variant="outline">Analytics</Button></Link>
          <Link href="/coupons/new"><Button size="sm">Add Coupon</Button></Link>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 pb-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Search</label>
              <input className="border rounded px-2 py-1 text-sm w-64" placeholder="Code" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input 
                id="includeExpired" 
                type="checkbox" 
                checked={includeExpired} 
                onChange={(e) => setIncludeExpired(e.target.checked)} 
              />
              <label htmlFor="includeExpired" className="text-xs text-muted-foreground">Show expired</label>
            </div>
            <Button size="sm" onClick={applyFilters}>Apply</Button>
            <div className="ml-auto text-xs text-muted-foreground">Total: {total}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Value</th>
                  <th className="py-2 pr-4">Min Order</th>
                  <th className="py-2 pr-4">Max Discount</th>
                  <th className="py-2 pr-4">Usage</th>
                  <th className="py-2 pr-4">Active</th>
                  <th className="py-2 pr-4">Valid</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const validRange = [c.startDate ? new Date(c.startDate).toLocaleDateString() : '—', c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'].join(' → ');
                  return (
                    <tr key={c._id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">{c.code}</td>
                      <td className="py-2 pr-4">{c.type}</td>
                      <td className="py-2 pr-4">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td>
                      <td className="py-2 pr-4">{c.minOrder ? `₹${c.minOrder}` : '—'}</td>
                      <td className="py-2 pr-4">{c.maxDiscount ? `₹${c.maxDiscount}` : '—'}</td>
                      <td className="py-2 pr-4">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                      <td className="py-2 pr-4">{c.active ? 'Yes' : 'No'}</td>
                      <td className="py-2 pr-4 text-xs">{validRange}</td>
                      <td className="py-2 pr-4">
                        <button className="border rounded px-2 py-1 text-sm" onClick={(e) => openMenu(c._id, e as any)}>···</button>
                        {openMenuId === c._id && menuPos && createPortal(
                          <div ref={menuRef} style={{ position: 'fixed', left: menuPos.x, top: menuPos.y }} className="z-[1000] w-36 rounded border bg-white shadow">
                            <Link className="block px-3 py-2 text-sm hover:bg-gray-100" href={`/coupons/${c._id}/edit`}>Edit</Link>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => onDelete(c._id)}>Delete</button>
                          </div>,
                          document.body
                        )}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="py-4 text-sm text-muted-foreground">No coupons found.</td>
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
