"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

type Review = {
  _id: string;
  user: { name?: string; email?: string } | string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
};

type Props = {
  productId: string;
};

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function Reviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  }, [reviews]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the public product reviews endpoint only
        const data = await apiGet<{ reviews?: Review[] }>(`/products/${productId}/reviews`);
        const list = (data?.reviews || []) as Review[];
        if (!ignore) setReviews(list);
      } catch (e: any) {
        // Some backends may restrict non-admin access to /reviews; in that case, just show empty without alarming error
        if (!ignore) {
          console.warn("Reviews load failed", e);
          setReviews([]);
          setError(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [productId]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthed) return;
    if (rating < 1 || rating > 5) return;
    const payload = { productId, rating, comment } as any;
    try {
      // Try POST /products/:id/reviews else POST /reviews
      let created: any = null;
      try {
        created = await apiPost<{ review: Review }>(`/products/${productId}/reviews`, payload);
      } catch {
        created = await apiPost<{ review: Review }>(`/reviews`, payload);
      }
      const r = created?.review as Review;
      if (r) setReviews((prev) => [r, ...prev]);
      setComment("");
      setRating(5);
    } catch (e: any) {
      setError(e.message || "Failed to submit review");
    }
  }

  return (
    <section className="animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">{avg.toFixed(1)}</div>
        <div>
          <StarRow value={avg} />
          <div className="text-sm text-muted-foreground mt-1">Based on {reviews.length} Reviews</div>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Loading reviews…</p>}
      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {reviews.length === 0 && !loading ? (
        <p className="mt-8 text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r._id} className="p-5 hover:shadow-elevation-1 transition-shadow bg-background">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-sm">{typeof r.user === 'string' ? r.user : (r.user?.name || r.user?.email || 'User')}</div>
                <StarRow value={r.rating} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{r.comment}</p>
              <div className="mt-4 text-xs text-muted-foreground/60">{new Date(r.createdAt).toLocaleDateString()}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Write review */}
      <div className="mt-12 p-6 bg-muted/30 rounded-xl border">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
        {!mounted ? (
          <div className="h-10" />
        ) : !isAuthed ? (
          <p className="text-sm text-muted-foreground">
            Please <a href={`/auth/login?redirect=/products/id/${productId}`} className="underline font-medium hover:text-foreground transition-colors">sign in</a> to write a review.
          </p>
        ) : (
          <form onSubmit={submitReview} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {([1,2,3,4,5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`h-10 w-10 rounded-full border flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 ${rating >= n ? 'border-yellow-500 bg-yellow-50 text-yellow-500' : 'border-border text-muted-foreground hover:border-yellow-200'}`}
                    aria-label={`${n} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Review</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share details of your experience..."
                required
              />
            </div>
            <Button type="submit">Submit Review</Button>
          </form>
        )}
      </div>
    </section>
  );
}

function StarRow({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const total = 5;
  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {Array.from({ length: total }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return <span key={i} className="text-muted-foreground">☆</span>;
      })}
    </div>
  );
}
