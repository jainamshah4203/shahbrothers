"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiCategory, fetchCategories, deleteCategory } from "@/services/categories";

export default function CategoriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCategories({ page, limit, search });
      setItems(data.categories);
      setTotal(data.pagination.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? This action cannot be undone.')) return;
    try {
      await deleteCategory(id);
      setItems(prev => prev.filter(c => c._id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete category');
    }
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">All Categories</h1>
        <Button type="button" size="sm" onClick={() => router.push('/categories/new')}>Add Category</Button>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Categories</CardTitle>
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
            <Button size="sm" variant="outline" onClick={() => { setPage(1); load(); }}>Search</Button>
          </div>

          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-4">Category Name</th>
                    <th className="py-2 pr-4">Slug</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c._id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{c.name}</td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">{c.slug}</td>
                      <td className="py-2 relative">
                        <button aria-label="Actions" className="border rounded px-2 py-1 text-sm" onClick={() => setMenuId(menuId === c._id ? null : c._id)}>···</button>
                        {menuId === c._id && (
                          <div className="absolute z-50 mt-1 right-0 w-36 rounded border bg-white shadow">
                            <Link className="block px-3 py-2 text-sm hover:bg-gray-100" href={`/categories/${c._id}/edit`}>Edit</Link>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600" onClick={() => handleDelete(c._id)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-sm text-muted-foreground">No categories found.</td>
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
