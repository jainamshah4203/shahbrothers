"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchVariants, ApiVariant, deleteVariant } from "@/services/variants";
import { fetchProducts, ApiProduct } from "@/services/products";
import { SelectSearch } from "@/components/ui/select-search";

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState<ApiVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [menuId, setMenuId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Delete this variant? This action cannot be undone.')) return;
    try {
      await deleteVariant(id);
      setVariants(prev => prev.filter(v => v._id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete variant');
    }
  }

  async function load() {
    setLoading(true);
    try {
      const data = await fetchVariants({ page, limit, search, productId: productId || undefined, color: color || undefined, size: size || undefined });
      setVariants(data.variants);
      setTotal(data.pagination.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load variants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Load products for filter dropdown once
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts({ page: 1, limit: 1000, sortBy: "name", sortOrder: "asc" });
        setProducts(data.products);
      } catch {
        // ignore
      }
    })();
  }, []);

  const productMap = useMemo(() => Object.fromEntries(products.map(p => [p._id, p.name])), [products]);

  function exportCsv() {
    const rows = [
      ["Product", "SKU", "Color", "Size", "MRP", "Price", "Discount%", "Stock", "Created"],
      ...variants.map(v => [
        v.productName || productMap[v.productId] || v.productId,
        v.sku || "",
        v.color || "",
        v.size || "",
        String(v.mrp ?? 0),
        String(v.price ?? 0),
        String(v.discountPercent ?? (v.mrp ? Math.max(0, Math.round(((v.mrp - v.price) / v.mrp) * 100)) : 0)),
        String(v.stock ?? 0),
        v.createdAt ? new Date(v.createdAt).toISOString() : "",
      ])
    ];
    const csv = rows.map(r => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variants_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Product Variants</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}>Export</Button>
          <Link href="/products/variants/new"><Button size="sm">Add Variant</Button></Link>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end justify-between gap-2 pb-3">
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
                placeholder="Search by SKU/Color/Size"
                className="border rounded px-3 py-2 text-sm w-56"
              />
              <div className="w-64">
                <SelectSearch
                  options={[{ value: "", label: "All Products" }, ...products.map(p => ({ value: p._id, label: p.name }))]}
                  value={productId}
                  onChange={(v) => setProductId(v ?? "")}
                  placeholder="All Products"
                  searchPlaceholder="Search product..."
                />
              </div>
              <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Color" className="border rounded px-3 py-2 text-sm w-32" />
              <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="Size" className="border rounded px-3 py-2 text-sm w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { setPage(1); load(); }}>Apply</Button>
              <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setProductId(""); setColor(""); setSize(""); setPage(1); load(); }}>Reset</Button>
            </div>
          </div>

          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Color</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">MRP</th>
                    <th className="py-2 pr-4">Selling Price</th>
                    <th className="py-2 pr-4">Discount %</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v._id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{v.productName || productMap[v.productId] || v.productId}</td>
                      <td className="py-2 pr-4">{v.color || '-'}</td>
                      <td className="py-2 pr-4">{v.size || '-'}</td>
                      <td className="py-2 pr-4">₹{v.mrp}</td>
                      <td className="py-2 pr-4">₹{v.price}</td>
                      <td className="py-2 pr-4">{v.discountPercent ?? Math.max(0, Math.round(((v.mrp - v.price) / (v.mrp || 1)) * 100))}%</td>
                      <td className="py-2 relative">
                        <button aria-label="Actions" className="border rounded px-2 py-1 text-sm" onClick={() => setMenuId(menuId === v._id ? null : v._id)}>···</button>
                        {menuId === v._id && (
                          <div className="absolute z-50 mt-1 right-0 w-36 rounded border bg-white shadow">
                            <Link className="block px-3 py-2 text-sm hover:bg-gray-100" href={`/products/variants/${v._id}/edit`}>Edit</Link>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => handleDelete(v._id)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {variants.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-sm text-muted-foreground">No variants found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination for products list backing the rows */}
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
