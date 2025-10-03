import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  categories: ApiCategory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchCategories(params?: { page?: number; limit?: number; search?: string; }): Promise<CategoriesResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<CategoriesResponse>(`/categories${query}`);
}

export async function fetchCategoryById(id: string): Promise<{ category: ApiCategory }> {
  return apiGet<{ category: ApiCategory }>(`/categories/${id}`);
}

export async function createCategory(payload: Partial<ApiCategory>): Promise<{ category: ApiCategory }> {
  return apiPost<{ category: ApiCategory }>("/categories", payload);
}

export async function updateCategory(id: string, payload: Partial<ApiCategory>): Promise<{ category: ApiCategory }> {
  return apiPut<{ category: ApiCategory }>(`/categories/${id}`, payload);
}

export async function deleteCategory(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/categories/${id}`);
}
