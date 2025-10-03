import { apiGet, apiDelete, apiPut } from "@/lib/api";

export interface ApiOrderItem {
  _id: string;
  product: { name: string; slug?: string };
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  image?: string;
  sku?: string;
}

export interface ApiOrderAddress {
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ApiOrder {
  _id: string;
  userId?: string;
  email?: string;
  paymentMethod?: 'COD' | 'Prepaid' | 'Razorpay' | 'Stripe' | 'Other';
  items: ApiOrderItem[];
  itemsCount?: number;
  subtotal?: number;
  discount?: number;
  couponDiscount?: number;
  total: number;
  totalAmount?: number;
  transactionId?: string;
  status: 'Processing' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: ApiOrderAddress;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersResponse {
  orders: ApiOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchOrders(params?: { page?: number; limit?: number; email?: string; status?: string; paymentMethod?: string; }): Promise<OrdersResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.email) qs.set("email", params.email);
  if (params?.status) qs.set("status", params.status);
  if (params?.paymentMethod) qs.set("paymentMethod", params.paymentMethod);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<OrdersResponse>(`/orders${query}`);
}

export async function fetchOrderById(id: string): Promise<{ order: ApiOrder }> {
  return apiGet<{ order: ApiOrder }>(`/orders/${id}`);
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: 'Processing' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled') {
  return apiPut<{ order: ApiOrder }>(`/orders/${id}/status`, { status });
}
