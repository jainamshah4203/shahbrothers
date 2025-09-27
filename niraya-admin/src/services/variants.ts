import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export interface ApiVariant {
  _id: string;
  productId: string;
  productName?: string;
  productSlug?: string;
  sku?: string;
  color?: string;
  size?: string;
  mrp: number;
  price: number;
  discountPercent?: number;
  stock: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchVariantById(id: string): Promise<{ variant: ApiVariant }> {
  return apiGet<{ variant: ApiVariant }>(`/variants/${id}`);
}

export interface VariantsResponse {
  variants: ApiVariant[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchVariants(params?: { page?: number; limit?: number; search?: string; productId?: string; color?: string; size?: string; }): Promise<VariantsResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.productId) qs.set("productId", params.productId);
  if (params?.color) qs.set("color", params.color);
  if (params?.size) qs.set("size", params.size);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<VariantsResponse>(`/variants${query}`);
}

export async function createVariant(payload: Partial<ApiVariant>): Promise<{ variant: ApiVariant }> {
  return apiPost<{ variant: ApiVariant }>("/variants", payload);
}

export async function updateVariant(id: string, payload: Partial<ApiVariant>): Promise<{ variant: ApiVariant }> {
  return apiPut<{ variant: ApiVariant }>(`/variants/${id}`, payload);
}

export async function deleteVariant(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/variants/${id}`);
}
