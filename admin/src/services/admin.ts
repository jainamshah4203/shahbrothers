import { apiGet } from "@/lib/api";

export interface AdminTotals {
  totalCategories: number;
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
}

export interface MonthlyPoint { month: string; count: number; total: number }
export interface StatusPoint { status: string; count: number }

export interface LatestOrderRow {
  id: string;
  paymentId: string;
  totalItems: number;
  status: string;
  amount: number;
  createdAt: string;
}

export interface AdminStatsResponse {
  totals: AdminTotals;
  monthlyOrders: MonthlyPoint[];
  orderStatusDistribution: StatusPoint[];
  latestOrders: LatestOrderRow[];
  latestReviews: any[];
}

export async function fetchAdminStats(): Promise<AdminStatsResponse> {
  return apiGet<AdminStatsResponse>("/admin/stats");
}
