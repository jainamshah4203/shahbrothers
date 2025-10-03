"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FolderTree, Image as ImageIcon, Package, ShoppingCart, TicketPercent, Users, Eye } from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/dashboard/Overview";
import { OrderStatusChart } from "@/components/dashboard/OrderStatusChart";
import { useEffect, useState } from "react";
import { fetchAdminStats, AdminStatsResponse } from "@/services/admin";

export default function DashboardPage() {
  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stats = await fetchAdminStats();
        if (isMounted) setData(stats);
      } catch (e) {
        console.error("Failed to fetch admin stats", e);
        setError("Failed to load dashboard stats");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex-1 space-y-3 p-3 md:p-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/categories/new">
            <Button size="sm" className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600">
              <FolderTree className="mr-1.5 h-3.5 w-3.5" />
              Add Category
            </Button>
          </Link>
          <Link href="/products/new">
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
              <Package className="mr-1.5 h-3.5 w-3.5" />
              Add Product
            </Button>
          </Link>
          <Link href="/coupons/new">
            <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700">
              <TicketPercent className="mr-1.5 h-3.5 w-3.5" />
              Add Coupon
            </Button>
          </Link>
          <Link href="/media/upload">
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Upload Media
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-8">
          <TabsTrigger value="overview" className="text-xs h-7 px-3">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                <div className="h-7 w-7 rounded-sm bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FolderTree className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{data?.totals.totalCategories ?? 0}</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <div className="h-7 w-7 rounded-sm bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Package className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{data?.totals.totalProducts ?? 0}</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <div className="h-7 w-7 rounded-sm bg-yellow-100 text-yellow-700 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{(data?.totals.totalCustomers ?? 0).toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <div className="h-7 w-7 rounded-sm bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="h-3.5 w-3.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{(data?.totals.totalOrders ?? 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 overflow-hidden border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Order Overview</CardTitle>
                  <CardDescription className="text-xs">Monthly orders performance</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="text-purple-600">{!loading && <Overview data={data?.monthlyOrders || []} />}</div>
              </CardContent>
            </Card>

            <Card className="col-span-3 overflow-hidden border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Status</CardTitle>
                <CardDescription className="text-xs">Pending, Processing, Shipped, Delivered, Cancelled, Unverified</CardDescription>
              </CardHeader>
              <CardContent>
                {!loading && <OrderStatusChart data={data?.orderStatusDistribution || []} />}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <CardDescription className="text-xs">Latest orders from customers</CardDescription>
              </div>
              <Link href="/orders">
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                  <Eye className="h-3 w-3" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}
              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="py-2 pr-4">Order Id</th>
                        <th className="py-2 pr-4">Payment Id</th>
                        <th className="py-2 pr-4">Total Items</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.latestOrders || []).map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-mono text-xs">{row.id}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{row.paymentId}</td>
                          <td className="py-2 pr-4">{row.totalItems}</td>
                          <td className="py-2 pr-4">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground">{row.status}</span>
                          </td>
                          <td className="py-2 pr-4">₹{row.amount}</td>
                          <td className="py-2">{new Date(row.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {(!data || (data.latestOrders || []).length === 0) && (
                        <tr>
                          <td colSpan={6} className="py-4 text-sm text-muted-foreground">No orders yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
