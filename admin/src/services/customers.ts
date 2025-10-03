import { apiGet } from "@/lib/api";

export interface ApiCustomer {
  email: string;
  name?: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  userId?: string | null;
  joinedAt?: string | null;
}

export interface CustomersResponse {
  customers: ApiCustomer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchCustomers(params?: { page?: number; limit?: number; search?: string }): Promise<CustomersResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<CustomersResponse>(`/customers${query}`);
}
