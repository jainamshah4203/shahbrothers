"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiProduct, fetchProducts, deleteProduct, updateProductFlags, bulkUpdateProducts } from "@/services/products";

type BulkAction = 'feature'|'unfeature'|'bestseller'|'unbestseller'|'limited'|'unlimited'|'new'|'unnew';

type BulkFlags = { featured: boolean; isBestseller: boolean; limited: boolean; isNewProduct: boolean };

function BulkToolbar({ count, onApply }: { count: number; onApply: (flags: BulkFlags) => Promise<void> | void }) {
  const [flags, setFlags] = useState<BulkFlags>({ featured: false, isBestseller: false, limited: false, isNewProduct: false });
  const [busy, setBusy] = useState(false);
  function setFlag<K extends keyof BulkFlags>(key: K, val: boolean) { setFlags((f) => ({ ...f, [key]: val })); }
  async function handleApply() {
    try {
      setBusy(true);
      await onApply(flags);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 p-2 border rounded">
      <div className="text-xs text-muted-foreground">Bulk actions for {count} item(s): Checked = On, Unchecked = Off</div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={flags.featured} onChange={(e) => setFlag('featured', e.target.checked)} /> Featured
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={flags.isBestseller} onChange={(e) => setFlag('isBestseller', e.target.checked)} /> Best Seller
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={flags.limited} onChange={(e) => setFlag('limited', e.target.checked)} /> Limited
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={flags.isNewProduct} onChange={(e) => setFlag('isNewProduct', e.target.checked)} /> New
      </label>
      <button className="border rounded px-3 py-1.5 text-sm" onClick={handleApply} disabled={busy}>{busy ? 'Applying…' : 'Apply'}</button>
    </div>
  );
}

export default function ProductsPage() {
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filterFeatured, setFilterFeatured] = useState<string>("");
  const [filterBest, setFilterBest] = useState<string>("");
  const [filterSale, setFilterSale] = useState<string>("");
  const [filterLimited, setFilterLimited] = useState<string>("");
  const [filterNew, setFilterNew] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const params: any = { page, limit, sortBy, sortOrder, search };
      if (filterFeatured === '1') params.featured = true;
      if (filterBest === '1') params.sortBy = sortBy; // keep
      if (filterBest === '1') params.sortOrder = sortOrder;
      if (filterBest === '1') params.bestSeller = true;
      if (filterSale === '1') params.saleOnly = true;
      if (filterLimited === '1') params.limited = true;
      if (filterNew === '1') params.newOnly = true;
      const data = await fetchProducts(params);
      setItems(data.products);
      setTotal(data.pagination.totalProducts);
      // clear selections when dataset changes
      setSelected({});
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const rows = [
      ["Product Name", "Slug", "Category", "MRP", "Selling Price", "Discount%", "Stock", "Created"],
      ...items.map((p) => {
        const mrp = p.price;
        const sell = p.salePrice ?? p.price;
        const discount = mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
        return [
          p.name,
          p.slug,
          p.category || "",
          String(mrp),
          String(sell),
          String(discount),
          String(p.stock ?? 0),
          p.createdAt ? new Date(p.createdAt).toISOString() : "",
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/\"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    try {
      await deleteProduct(id);
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (e: any) {
      alert(e?.message || "Failed to delete product");
    }
  }

  // No duplicate/view actions per request

  return (
    <div className="p-3 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">All Products</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}>Export</Button>
          <Link href="/products/new"><Button size="sm">Add Product</Button></Link>
          <Link href="/products/variants/new"><Button size="sm" variant="outline">Add Variant</Button></Link>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 pb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
              placeholder="Search by name or slug"
              className="border rounded px-3 py-2 text-sm w-64"
            />
            <div className="flex items-center gap-2 text-sm">
              <select className="border rounded px-2 py-1" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="createdAt">Created</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
              <select className="border rounded px-2 py-1" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <select className="border rounded px-2 py-1" value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}>
                <option value="">All</option>
                <option value="1">Featured</option>
              </select>
              <select className="border rounded px-2 py-1" value={filterBest} onChange={(e) => setFilterBest(e.target.value)}>
                <option value="">All</option>
                <option value="1">Best Sellers</option>
              </select>
              <select className="border rounded px-2 py-1" value={filterSale} onChange={(e) => setFilterSale(e.target.value)}>
                <option value="">All</option>
                <option value="1">On Sale</option>
              </select>
              <select className="border rounded px-2 py-1" value={filterLimited} onChange={(e) => setFilterLimited(e.target.value)}>
                <option value="">All</option>
                <option value="1">Limited</option>
              </select>
              <select className="border rounded px-2 py-1" value={filterNew} onChange={(e) => setFilterNew(e.target.value)}>
                <option value="">All</option>
                <option value="1">New</option>
              </select>
              <Button size="sm" variant="outline" onClick={() => { setPage(1); load(); }}>Apply</Button>
            </div>
          </div>

          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-2"><input type="checkbox" aria-label="Select all" onChange={(e) => {
                      const ck = e.target.checked; const map: Record<string, boolean> = {}; items.forEach(it => map[it._id] = ck); setSelected(map);
                    }} /></th>
                    <th className="py-2 pr-4">Product Name</th>
                    <th className="py-2 pr-4">Slug</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">MRP</th>
                    <th className="py-2 pr-4">Selling Price</th>
                    <th className="py-2 pr-4">Discount %</th>
                    <th className="py-2 pr-4">Featured</th>
                    <th className="py-2 pr-4">Best Seller</th>
                    <th className="py-2 pr-4">Limited</th>
                    <th className="py-2 pr-4">New</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => {
                    const mrp = p.price;
                    const sell = p.salePrice ?? p.price;
                    const discount = mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
                    return (
                      <tr key={p._id} className="border-b last:border-0">
                        <td className="py-2 pr-2"><input type="checkbox" checked={!!selected[p._id]} onChange={(e) => setSelected(prev => ({ ...prev, [p._id]: e.target.checked }))} /></td>
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground">{p.slug}</td>
                        <td className="py-2 pr-4">{p.category || '-'}</td>
                        <td className="py-2 pr-4">₹{mrp}</td>
                        <td className="py-2 pr-4">₹{sell}</td>
                        <td className="py-2 pr-4">{discount}%</td>
                        <td className="py-2 pr-4">
                          <Button size="sm" variant="outline" onClick={async () => {
                            await updateProductFlags(p._id, { featured: !p.featured });
                            setItems(prev => prev.map(x => x._id === p._id ? { ...x, featured: !p.featured } : x));
                          }}>{p.featured ? 'On' : 'Off'}</Button>
                        </td>
                        <td className="py-2 pr-4">
                          <Button size="sm" variant="outline" onClick={async () => {
                            await updateProductFlags(p._id, { isBestseller: !(p as any).isBestseller });
                            setItems(prev => prev.map(x => x._id === p._id ? { ...x, isBestseller: !(p as any).isBestseller } : x));
                          }}>{(p as any).isBestseller ? 'On' : 'Off'}</Button>
                        </td>
                        <td className="py-2 pr-4">
                          <Button size="sm" variant="outline" onClick={async () => {
                            await updateProductFlags(p._id, { limited: !p.limited });
                            setItems(prev => prev.map(x => x._id === p._id ? { ...x, limited: !p.limited } : x));
                          }}>{p.limited ? 'On' : 'Off'}</Button>
                        </td>
                        <td className="py-2 pr-4">
                          <Button size="sm" variant="outline" onClick={async () => {
                            await updateProductFlags(p._id, { isNewProduct: !(p as any).isNewProduct });
                            setItems(prev => prev.map(x => x._id === p._id ? { ...x, isNewProduct: !(p as any).isNewProduct } : x));
                          }}>{(p as any).isNewProduct ? 'On' : 'Off'}</Button>
                        </td>
                        <td className="py-2 pr-4">{p.stock}</td>
                        <td className="py-2 relative">
                          <div className="flex items-center gap-2">
                            <button aria-label="Actions" className="border rounded px-2 py-1 text-sm" onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}>···</button>
                          </div>
                          {openMenuId === p._id && (
                            <div className="absolute z-50 mt-1 right-0 w-40 rounded border bg-white shadow">
                              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100" onClick={() => { setOpenMenuId(null); }}>
                                <Link href={`/products/${p._id}/edit`}>Edit</Link>
                              </button>
                              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => handleDelete(p._id)}>Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-4 text-sm text-muted-foreground">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Bulk actions toolbar */}
          {Object.values(selected).some(Boolean) && (
            <BulkToolbar
              count={Object.keys(selected).filter(id => selected[id]).length}
              onApply={async (flags) => {
                const ids = Object.keys(selected).filter(id => selected[id]);
                if (ids.length === 0) return;
                // Determine actions based on checkbox state: checked => set, unchecked => unset
                const actions: BulkAction[] = [
                  flags.featured ? 'feature' : 'unfeature',
                  flags.isBestseller ? 'bestseller' : 'unbestseller',
                  flags.limited ? 'limited' : 'unlimited',
                  flags.isNewProduct ? 'new' : 'unnew',
                ];
                for (const act of actions) {
                  await bulkUpdateProducts(ids, act);
                }
                await load();
              }}
            />
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
