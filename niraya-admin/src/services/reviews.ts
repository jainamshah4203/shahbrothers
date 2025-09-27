import { apiGet } from "@/lib/api";
import { apiPost, apiDelete } from "@/lib/api";

export interface Review {
  _id: string;
  productId: string;
  userId?: string;
  name?: string;
  email?: string;
  rating: number;
  title?: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  reply?: string;
  createdAt?: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
  };
}

export async function fetchReviews(params: { page?: number; limit?: number; status?: string; q?: string; productId?: string; rating?: number }) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  if (params.productId) qs.set("productId", params.productId);
  if (params.rating) qs.set("rating", String(params.rating));
  return apiGet<ReviewListResponse>(`/reviews?${qs.toString()}`);
}

export async function approveReview(id: string) {
  return apiPost<{ review: Review }>(`/reviews/${id}/approve`, {});
}
export async function rejectReview(id: string) {
  return apiPost<{ review: Review }>(`/reviews/${id}/reject`, {});
}
export async function replyReview(id: string, reply: string) {
  return apiPost<{ review: Review }>(`/reviews/${id}/reply`, { reply });
}
export async function deleteReview(id: string) {
  return apiDelete<{ success: boolean }>(`/reviews/${id}`);
}
export async function bulkReviews(ids: string[], action: "approve" | "reject" | "delete") {
  return apiPost<{ success: boolean }>(`/reviews/bulk`, { ids, action });
}
