"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { fetchCouponById, updateCoupon } from "@/services/coupons";
import { useRouter } from "next/navigation";

export default function EditCouponPage({ params }: { params: any }) {
  const router = useRouter();
  const couponId = params?.id;
  
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState<number | "">("");
  const [minOrder, setMinOrder] = useState<number | "">("");
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [perUserLimit, setPerUserLimit] = useState<number | "">("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!couponId) return;
      try {
        setLoading(true);
        const { coupon } = await fetchCouponById(couponId);
        setCode(coupon.code);
        setType(coupon.type);
        setValue(coupon.value);
        setMinOrder(coupon.minOrder ?? "");
        setMaxDiscount(coupon.maxDiscount ?? "");
        setStartDate(coupon.startDate ? coupon.startDate.split('T')[0] : "");
        setEndDate(coupon.endDate ? coupon.endDate.split('T')[0] : "");
        setUsageLimit(coupon.usageLimit ?? "");
        setPerUserLimit(coupon.perUserLimit ?? "");
        setActive(coupon.active);
      } catch (e: any) {
        setError(e?.message || "Failed to load coupon");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [couponId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return setError("Code is required");
    if (value === "" || Number(value) < 0) return setError("Value is required");
    if (type === "percent" && Number(value) > 100) return setError("Percent cannot exceed 100");
    
    try {
      setSaving(true);
      await updateCoupon(couponId, {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrder: minOrder === "" ? undefined : Number(minOrder),
        maxDiscount: maxDiscount === "" ? undefined : Number(maxDiscount),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        usageLimit: usageLimit === "" ? undefined : Number(usageLimit),
        perUserLimit: perUserLimit === "" ? undefined : Number(perUserLimit),
        active,
      });
      router.replace("/coupons");
    } catch (e: any) {
      setError(e?.message || "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-3 md:p-4">
        <div className="text-sm text-muted-foreground">Loading coupon...</div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Edit Coupon</h1>
      <Card className="border-0 shadow-sm max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Coupon Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" placeholder="e.g. SAVE20" value={code} onChange={(e: any) => setCode(e.target.value.toUpperCase())} />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <select className="border rounded px-2 py-2" value={type} onChange={(e: any) => setType(e.target.value)}>
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" placeholder="0" value={value} onChange={(e: any) => setValue(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minOrder">Min Order</Label>
                <Input id="minOrder" type="number" placeholder="0" value={minOrder} onChange={(e: any) => setMinOrder(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxDiscount">Max Discount (cap)</Label>
                <Input id="maxDiscount" type="number" placeholder="0" value={maxDiscount} onChange={(e: any) => setMaxDiscount(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="usageLimit">Total Usage Limit</Label>
                <Input id="usageLimit" type="number" placeholder="Unlimited" value={usageLimit} onChange={(e: any) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perUserLimit">Per-User Limit</Label>
                <Input id="perUserLimit" type="number" placeholder="Unlimited" value={perUserLimit} onChange={(e: any) => setPerUserLimit(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input id="active" type="checkbox" checked={active} onChange={(e: any) => setActive(e.target.checked)} />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Coupon"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
