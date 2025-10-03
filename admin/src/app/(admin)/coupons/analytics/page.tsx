"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { fetchCouponAnalytics, CouponAnalytics } from "@/services/coupons";
import Link from "next/link";

export default function CouponAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCouponAnalytics({ 
        startDate: startDate || undefined, 
        endDate: endDate || undefined 
      });
      setAnalytics(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters() {
    load();
  }

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        <div className="text-sm text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 md:p-4">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Coupon Analytics</h1>
        <Link href="/coupons"><Button size="sm" variant="outline">Back to Coupons</Button></Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={applyFilters}>Apply</Button>
            <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); load(); }}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{analytics.overview.totalUsage}</div>
                <div className="text-xs text-muted-foreground">Total Usage</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">₹{Math.round(analytics.overview.totalDiscount).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Discount</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">₹{Math.round(analytics.overview.totalOrderValue).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Order Value</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">₹{Math.round(analytics.overview.avgDiscount)}</div>
                <div className="text-xs text-muted-foreground">Avg Discount</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">₹{Math.round(analytics.overview.avgOrderValue)}</div>
                <div className="text-xs text-muted-foreground">Avg Order Value</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Coupons */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Top Performing Coupons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCoupons.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No usage data available</div>
                  ) : (
                    analytics.topCoupons.map((coupon, index) => (
                      <div key={coupon._id} className="flex items-center justify-between p-3 rounded border">
                        <div>
                          <div className="font-medium">{coupon._id}</div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.usageCount} uses • ₹{Math.round(coupon.totalDiscount)} total discount
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{Math.round(coupon.avgDiscount)}</div>
                          <div className="text-xs text-muted-foreground">avg discount</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Usage */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Recent Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentUsage.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No recent usage</div>
                  ) : (
                    analytics.recentUsage.map((usage) => (
                      <div key={usage._id} className="flex items-center justify-between p-3 rounded border">
                        <div>
                          <div className="font-medium">{usage.couponCode}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(usage.usedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{usage.discountAmount}</div>
                          <div className="text-xs text-muted-foreground">on ₹{usage.orderTotal}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage by Date Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Usage Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.usageByDate.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">No usage data for the selected period</div>
              ) : (
                <div className="space-y-2">
                  {analytics.usageByDate.map((day) => (
                    <div key={day._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                      <div className="text-sm">{new Date(day._id).toLocaleDateString()}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">{day.count} uses</div>
                        <div className="text-sm font-medium">₹{Math.round(day.totalDiscount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
