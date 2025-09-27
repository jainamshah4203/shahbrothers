"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { fetchReviews, approveReview, rejectReview, replyReview, deleteReview, bulkReviews, type Review } from "@/services/reviews";

export default function ReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected]);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchReviews({ page, limit, status: status || undefined, q: q || undefined, rating: rating || undefined });
      setItems(data.reviews);
      setTotal(data.pagination.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, limit, status, rating]);

  function clearSelection() { setSelected({}); }

  async function onApprove(id: string) { await approveReview(id); await load(); }
  async function onReject(id: string) { await rejectReview(id); await load(); }
  async function onDelete(id: string) { if (confirm("Delete this review?")) { await deleteReview(id); await load(); } }
  async function onReply(id: string) { const text = replyMap[id]; await replyReview(id, text || ""); await load(); }
  async function onBulk(action: "approve" | "reject" | "delete") { if (selectedIds.length === 0) return; if (action === 'delete' && !confirm(`Delete ${selectedIds.length} review(s)?`)) return; await bulkReviews(selectedIds, action); clearSelection(); await load(); }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Reviews</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Rating & Review Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 pb-3 flex-wrap">
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Search</label>
              <input className="border rounded px-2 py-1 text-sm w-64" placeholder="Name, email, title, comment" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <select className="border rounded px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-foreground">Rating</label>
              <select className="border rounded px-2 py-1 text-sm" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value={0}>All</option>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}★</option>)}
              </select>
            </div>
            <Button size="sm" onClick={() => { setPage(1); load(); }}>Apply</Button>
            <div className="ml-auto text-xs text-muted-foreground">Total: {total}</div>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2 pb-2">
            <Button variant="outline" size="sm" disabled={selectedIds.length === 0} onClick={() => onBulk('approve')}>Approve</Button>
            <Button variant="outline" size="sm" disabled={selectedIds.length === 0} onClick={() => onBulk('reject')}>Reject</Button>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200" disabled={selectedIds.length === 0} onClick={() => onBulk('delete')}>Delete</Button>
            {selectedIds.length > 0 && <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-3"><input type="checkbox" aria-label="Select all" onChange={(e) => {
                    const ck = e.target.checked; const map: Record<string, boolean> = {}; items.forEach(it => map[it._id] = ck); setSelected(map);
                  }} /></th>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Rating</th>
                  <th className="py-2 pr-3">Title / Comment</th>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">No reviews</td></tr>
                ) : items.map((it) => (
                  <tr key={it._id} className="border-b align-top">
                    <td className="py-2 pr-3"><input type="checkbox" checked={!!selected[it._id]} onChange={(e) => setSelected(prev => ({ ...prev, [it._id]: e.target.checked }))} /></td>
                    <td className="py-2 pr-3"><span className="text-xs text-muted-foreground">{it.productId}</span></td>
                    <td className="py-2 pr-3">{"★".repeat(it.rating)}</td>
                    <td className="py-2 pr-3">
                      <div className="font-medium text-sm">{it.title || "(no title)"}</div>
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-2 max-w-[440px]">{it.comment}</div>
                      <div className="mt-2 flex gap-2 items-center">
                        <input className="border rounded px-2 py-1 text-xs w-64" placeholder="Reply (optional)" value={replyMap[it._id] || it.reply || ''} onChange={(e) => setReplyMap(prev => ({ ...prev, [it._id]: e.target.value }))} />
                        <Button variant="outline" size="sm" onClick={() => onReply(it._id)}>Send</Button>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="text-sm">{it.name || '(anon)'}</div>
                      <div className="text-xs text-muted-foreground">{it.email || ''}</div>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`text-xs rounded px-2 py-1 border ${it.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700' : it.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>{it.status}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onApprove(it._id)}>Approve</Button>
                        <Button variant="outline" size="sm" onClick={() => onReject(it._id)}>Reject</Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200" onClick={() => onDelete(it._id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-muted-foreground">Page {page} / {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
              <select className="border rounded px-2 py-1 text-sm" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                {[10,20,50].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
