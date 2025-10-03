import { apiGet, apiPost, apiPut, apiDelete, API_BASE_URL } from "@/lib/api";

export type CouponType = "percent" | "fixed";

export interface ApiCoupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number;
  perUserLimit?: number;
  active: boolean;
  usedCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponsResponse {
  coupons: ApiCoupon[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchCoupons(params?: { page?: number; limit?: number; search?: string; includeExpired?: boolean }): Promise<CouponsResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.includeExpired) qs.set("includeExpired", "true");
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<CouponsResponse>(`/coupons${query}`);
}

export async function createCoupon(payload: Partial<ApiCoupon>): Promise<{ coupon: ApiCoupon }> {
  const body = { ...payload, code: String(payload.code || '').toUpperCase() };
  return apiPost<{ coupon: ApiCoupon }>(`/coupons`, body);
}

export async function updateCoupon(id: string, payload: Partial<ApiCoupon>): Promise<{ coupon: ApiCoupon }> {
  const body = { ...payload, code: payload.code ? String(payload.code).toUpperCase() : undefined };
  return apiPut<{ coupon: ApiCoupon }>(`/coupons/${id}`, body);
}

export async function deleteCoupon(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/coupons/${id}`);
}

export async function fetchCouponById(id: string): Promise<{ coupon: ApiCoupon }> {
  return apiGet<{ coupon: ApiCoupon }>(`/coupons/${id}`);
}

export async function exportCoupons(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/coupons/export`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to export coupons');
  return response.blob();
}

export async function importCoupons(csvData: string): Promise<{ created: number; errors: string[] }> {
  return apiPost<{ created: number; errors: string[] }>(`/coupons/import`, { csvData });
}

export interface CouponAnalytics {
  overview: {
    totalUsage: number;
    totalDiscount: number;
    totalOrderValue: number;
    avgDiscount: number;
    avgOrderValue: number;
  };
  topCoupons: Array<{
    _id: string;
    usageCount: number;
    totalDiscount: number;
    totalOrderValue: number;
    avgDiscount: number;
  }>;
  recentUsage: Array<{
    _id: string;
    couponCode: string;
    usedAt: string;
    orderTotal: number;
    discountAmount: number;
  }>;
  usageByDate: Array<{
    _id: string;
    count: number;
    totalDiscount: number;
  }>;
}

export async function fetchCouponAnalytics(params?: { startDate?: string; endDate?: string; couponId?: string }): Promise<CouponAnalytics> {
  const qs = new URLSearchParams();
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  if (params?.couponId) qs.set("couponId", params.couponId);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<CouponAnalytics>(`/coupons/analytics${query}`);
}
