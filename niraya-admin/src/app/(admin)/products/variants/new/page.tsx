"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts, ApiProduct } from "@/services/products";
import { createVariant } from "@/services/variants";
import { useRouter } from "next/navigation";
import { SelectSearch } from "@/components/ui/select-search";

export default function NewVariantPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form fields
  const [productId, setProductId] = useState("");
  const [sku, setSku] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [mrp, setMrp] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts({ page: 1, limit: 1000, sortBy: "name", sortOrder: "asc" });
        setProducts(data.products);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // keep discount, price, mrp in sync when user edits
  useEffect(() => {
    if (mrp !== "" && price !== "") {
      const m = Number(mrp);
      const p = Number(price);
      const d = m > 0 ? Math.max(0, Math.round(((m - p) / m) * 100)) : 0;
      setDiscountPercent(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mrp, price]);

  useEffect(() => {
    if (mrp !== "" && discountPercent !== "") {
      const m = Number(mrp);
      const d = Number(discountPercent);
      const p = Math.max(0, Math.round(m * (1 - d / 100)));
      setPrice(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountPercent]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!productId || !sku || mrp === "" || price === "") {
      setError("Please fill required fields: Product, SKU, MRP, Selling Price");
      return;
    }
    try {
      setSaving(true);
      await createVariant({
        productId,
        sku,
        color: color || undefined,
        size: size || undefined,
        mrp: Number(mrp),
        price: Number(price),
        discountPercent: discountPercent === "" ? undefined : Number(discountPercent),
        stock: stock === "" ? 0 : Number(stock),
        images: [],
      });
      router.replace("/products/variants");
    } catch (e: any) {
      setError(e?.message || "Failed to create variant");
    } finally {
      setSaving(false);
    }
  }

  const productOptions = useMemo(() => products.map(p => ({ value: p._id, label: p.name })), [products]);

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Add Product Variant</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Variant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Product *</Label>
                <SelectSearch
                  options={productOptions}
                  value={productId}
                  onChange={(v) => setProductId(v || "")}
                  placeholder="Select options"
                  searchPlaceholder="Search product..."
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" placeholder="Enter sku" value={sku} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSku(e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" placeholder="Enter color" value={color} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Size</Label>
                <Input id="size" placeholder="Select/enter size" value={size} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSize(e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mrp">MRP *</Label>
                <Input id="mrp" type="number" placeholder="Enter MRP" value={mrp} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMrp(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Selling Price *</Label>
                <Input id="price" type="number" placeholder="Enter Selling Price" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input id="discount" type="number" placeholder="Enter Discount Percentage" value={discountPercent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountPercent(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="0" value={stock} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStock(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>

            {/* Media placeholder */}
            <div className="border border-dashed rounded p-6 text-center">
              <Button type="button" variant="outline">Select Media</Button>
            </div>

            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Product Variant"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
