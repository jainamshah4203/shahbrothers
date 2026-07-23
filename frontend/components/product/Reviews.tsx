"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiGet, apiPost } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { framerTransition } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Review = {
  _id: string;
  user: { name?: string; email?: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Props = {
  productId: string;
};

type ProductDetailTabsProps = {
  productId: string;
  description: ReactNode;
  className?: string;
};

/** Animated description / reviews tabs for PDP (Motion + framerTransition). */
export function ProductDetailTabs({ productId, description, className }: ProductDetailTabsProps) {
  const [tab, setTab] = useState("description");
  const prefersReduced = useReducedMotion();

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className={cn("w-full", className)}
    >
      <TabsList className="mb-8 h-14 w-full justify-start overflow-x-auto rounded-none border-b border-charcoal-ink/10 bg-transparent">
        <TabsTrigger
          value="description"
          className="rounded-none bg-transparent px-8 py-3 text-base shadow-none transition-all data-[state=active]:border-b-2 data-[state=active]:border-brass data-[state=active]:font-semibold data-[state=active]:text-charcoal-ink data-[state=active]:shadow-none"
        >
          Story & Details
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none bg-transparent px-8 py-3 text-base shadow-none transition-all data-[state=active]:border-b-2 data-[state=active]:border-brass data-[state=active]:font-semibold data-[state=active]:text-charcoal-ink data-[state=active]:shadow-none"
        >
          Customer Reviews
        </TabsTrigger>
      </TabsList>

      <div className="pt-4">
        <AnimatePresence mode="wait" initial={false}>
          {tab === "description" ? (
            <motion.div
              key="description"
              role="tabpanel"
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
              transition={framerTransition("medium")}
              className="prose max-w-3xl font-sans text-lg leading-loose text-muted-sepia"
            >
              {description}
            </motion.div>
          ) : (
            <motion.div
              key="reviews"
              role="tabpanel"
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
              transition={framerTransition("medium")}
            >
              <Reviews productId={productId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tabs>
  );
}

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
        const data = await apiGet<{ reviews?: Review[] }>(`/products/${productId}/reviews`);
        const list = (data?.reviews || []) as Review[];
        if (!ignore) setReviews(list);
      } catch (e: unknown) {
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

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthed) return;
    if (rating < 1 || rating > 5) return;
    const payload = { productId, rating, comment };
    try {
      let created: { review?: Review } | null = null;
      try {
        created = await apiPost<{ review: Review }>(`/products/${productId}/reviews`, payload);
      } catch {
        created = await apiPost<{ review: Review }>(`/reviews`, payload);
      }
      const r = created?.review as Review;
      if (r) setReviews((prev) => [r, ...prev]);
      setComment("");
      setRating(5);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
    }
  }

  return (
    <section>
      <div className="flex items-center gap-4">
        <div className="font-serif text-4xl font-bold text-charcoal-ink">{avg.toFixed(1)}</div>
        <div>
          <StarRow value={avg} />
          <div className="mt-1 font-sans text-sm text-muted-sepia">
            Based on {reviews.length} Reviews
          </div>
        </div>
      </div>

      {loading && <p className="mt-6 font-sans text-sm text-muted-sepia">Loading reviews…</p>}
      {error && <p className="mt-6 font-sans text-sm text-terracotta">{error}</p>}

      {reviews.length === 0 && !loading ? (
        <p className="mt-8 font-sans text-sm text-muted-sepia">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <Card
              key={r._id}
              className="border-charcoal-ink/8 bg-cream p-5 paper-grain transition-shadow hover:shadow-paper"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="font-sans text-sm font-medium text-charcoal-ink">
                  {typeof r.user === "string"
                    ? r.user
                    : r.user?.name || r.user?.email || "User"}
                </div>
                <StarRow value={r.rating} />
              </div>
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-sepia">
                {r.comment}
              </p>
              <div className="mt-4 font-sans text-xs text-muted-sepia/70">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-xl border border-charcoal-ink/8 bg-linen/50 p-6 paper-grain">
        <h3 className="mb-4 font-serif text-lg font-semibold text-charcoal-ink">Write a Review</h3>
        {!mounted ? (
          <div className="h-10" />
        ) : !isAuthed ? (
          <p className="font-sans text-sm text-muted-sepia">
            Please{" "}
            <a
              href={`/auth/login?redirect=/products/id/${productId}`}
              className="font-medium text-fountain-navy underline underline-offset-2 transition-colors hover:text-charcoal-ink"
            >
              sign in
            </a>{" "}
            to write a review.
          </p>
        ) : (
          <form onSubmit={handleSubmitReview} className="max-w-xl space-y-4">
            <div>
              <label className="mb-2 block font-sans text-sm font-medium text-charcoal-ink">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass",
                      rating >= n
                        ? "border-brass bg-cream text-brass"
                        : "border-charcoal-ink/15 text-muted-sepia hover:border-brass/40"
                    )}
                    aria-label={`${n} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block font-sans text-sm font-medium text-charcoal-ink">
                Review
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share details of your experience..."
                required
                className="border-charcoal-ink/15 bg-warm-off-white focus-visible:ring-brass"
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
    <div className="flex items-center gap-0.5 text-brass">
      {Array.from({ length: total }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return (
          <span key={i} className="text-muted-sepia/40">
            ☆
          </span>
        );
      })}
    </div>
  );
}
