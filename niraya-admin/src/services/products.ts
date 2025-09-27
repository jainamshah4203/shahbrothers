import { apiGet } from "@/lib/api";
import { apiPost, apiPut, apiDelete } from "@/lib/api";

export interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  images: string[];
  category?: string;
  brand?: string;
  slug: string;
  stock: number;
  featured?: boolean;
  isBestseller?: boolean;
  limited?: boolean;
  isNewProduct?: boolean;
  sizes?: string[];
  colors?: string[];
  heroIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchProductById(id: string): Promise<{ product: ApiProduct }> {
  return apiGet<{ product: ApiProduct }>(`/products/${id}`);
}

export interface ProductsResponse {
  products: ApiProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchProducts(params?: { page?: number; limit?: number; search?: string; category?: string; sortBy?: string; sortOrder?: "asc" | "desc"; featured?: boolean; bestSeller?: boolean; saleOnly?: boolean; limited?: boolean; newOnly?: boolean; }): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.category) qs.set("category", params.category);
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params?.featured) qs.set("featured", "true");
  if (params?.bestSeller) qs.set("bestSeller", "true");
  if (params?.saleOnly) qs.set("saleOnly", "true");
  if (params?.limited) qs.set("limited", "true");
  if (params?.newOnly) qs.set("newOnly", "true");
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<ProductsResponse>(`/products${query}`);
}

export async function fetchProductsCount(): Promise<number> {
  const data = await fetchProducts({ limit: 1, page: 1 });
  return data.pagination.totalProducts;
}

export async function createProduct(payload: any): Promise<{ product: ApiProduct }> {
  return apiPost<{ product: ApiProduct }>("/products", payload);
}

export async function updateProduct(id: string, payload: any): Promise<{ product: ApiProduct }> {
  return apiPut<{ product: ApiProduct }>(`/products/${id}`, payload);
}

export async function updateProductFlags(id: string, flags: { featured?: boolean; isBestseller?: boolean; limited?: boolean; isNewProduct?: boolean }) {
  return updateProduct(id, flags);
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/products/${id}`);
}

export async function bulkUpdateProducts(ids: string[], action: 'feature'|'unfeature'|'bestseller'|'unbestseller'|'limited'|'unlimited'|'new'|'unnew') {
  return apiPost<{ success: boolean }>(`/products/bulk`, { ids, action });
}
