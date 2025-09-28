"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { createProduct } from "@/services/products";
import { fetchCategories, type ApiCategory } from "@/services/categories";
import { SelectSearch } from "@/components/ui/select-search";
import { useRouter } from "next/navigation";
import { uploadManyToCloudinaryWithProgress, uploadManyToCloudinarySignedWithProgress } from "@/lib/upload";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [catOptions, setCatOptions] = useState<{ value: string; label: string }[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);
  const [mrp, setMrp] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<number | "">("");
  const [onSale, setOnSale] = useState<boolean>(true);
  const [stock, setStock] = useState<number | "">("");
  const SIZE_OPTIONS = ["XS","S","M","L","XL","XXL"] as const;
  const [sizes, setSizes] = useState<string[]>([]);
  const [imagesText, setImagesText] = useState("");
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [colorsText, setColorsText] = useState<string>("");
  const [noColors, setNoColors] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Load categories from backend (admin-protected)
  useEffect(() => {
    async function loadCats() {
      setCatLoading(true);
      setCatError(null);
      try {
        const res = await fetchCategories({ page: 1, limit: 100 });
        const opts = res.categories.map((c: ApiCategory) => ({ value: c.name, label: c.name }));
        setCatOptions(opts);
        if (!category) setCategory(opts[0]?.value || "");
      } catch (e: any) {
        setCatError(e?.message || "Failed to load categories");
      } finally {
        setCatLoading(false);
      }
    }
    loadCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSize(size: string) {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  // Auto compute discount when MRP/Selling change (allow fractional %)
  useEffect(() => {
    if (mrp !== "" && price !== "") {
      const m = Number(mrp);
      const p = Number(price);
      const d = m > 0 ? Math.max(0, ((m - p) / m) * 100) : 0;
      // Keep one decimal place
      const dFixed = Number(d.toFixed(1));
      setDiscountPercent(dFixed);
      // If selling price >= MRP, treat as not on sale by default
      setOnSale(p < m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mrp, price]);

  async function handleUpload() {
    try {
      const input = fileRef.current;
      if (!input || !input.files || input.files.length === 0) {
        alert('Please select image files to upload');
        return;
      }
      setUploading(true);
      const files = Array.from(input.files);
      setProgress(0);
      let results;
      try {
        // Prefer signed uploads
        results = await uploadManyToCloudinarySignedWithProgress(files, 'niraya/products', (p) => setProgress(p));
      } catch (err) {
        // Optional fallback to unsigned if preset is configured
        const hasPreset = !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (!hasPreset) throw err;
        results = await uploadManyToCloudinaryWithProgress(files, (p) => setProgress(p));
      }
      const urls = results.map(r => r.url).filter(Boolean);
      setImagesText(prev => {
        const base = prev?.trim() ? (prev.trim() + '\n') : '';
        return base + urls.join('\n');
      });
      // If heroIndex is out of range or there were no images earlier, reset to first
      setHeroIndex(0);
      // clear input
      try { input.value = ''; } catch {}
    } catch (err: any) {
      alert(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  function openPicker() {
    const el = fileRef.current;
    if (el) el.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload();
    }
  }

  // Discount is derived from MRP and Selling Price; do not recompute price from discount.

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sizesArr = sizes;
    if (!name || !slug || !description || !category || mrp === "" || price === "" || sizesArr.length === 0) {
      setError("Please fill all required fields");
      return;
    }
    const images = imagesText
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
    if (images.length === 0) {
      setError("Please add at least one image URL");
      return;
    }
    try {
      setSaving(true);
      const colorsArr = noColors ? [] : colorsText.split(',').map(s => s.trim()).filter(Boolean);
      const payload: any = {
        name,
        slug,
        description,
        price: Number(mrp),
        // Include salePrice only when onSale is checked and selling price < MRP
        ...(onSale && Number(price) < Number(mrp) ? { salePrice: Number(price) } : { salePrice: undefined }),
        category,
        stock: stock === "" ? 0 : Number(stock),
        images,
        heroIndex: Math.max(0, Math.min(heroIndex, Math.max(0, images.length - 1))),
        sizes: sizesArr,
        colors: colorsArr,
        material: 'N/A',
        careInstructions: [],
      };
      await createProduct(payload);
      router.replace("/products");
    } catch (e: any) {
      setError(e?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Add Product</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="e.g. Running Shoes" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="unique-slug" value={slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                {catError && <div className="text-xs text-red-600">{catError}</div>}
                <SelectSearch
                  options={catOptions}
                  value={category}
                  onChange={(v) => setCategory(v || "")}
                  placeholder={catLoading ? "Loading categories..." : (catOptions.length ? "Select category" : "No categories found")}
                  searchPlaceholder="Search category..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mrp">MRP</Label>
                <Input id="mrp" type="number" placeholder="0" value={mrp} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMrp(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Selling Price</Label>
                <Input id="price" type="number" placeholder="0" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Percentage (auto)</Label>
                <Input id="discount" type="number" step="0.1" placeholder="0" value={discountPercent} readOnly />
              </div>
            </div>
            {/* On Sale toggle */}
            <div className="flex items-center gap-2">
              <input id="onSale" type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
              <Label htmlFor="onSale">On Sale</Label>
            </div>
            <div className="text-xs text-muted-foreground -mt-2 mb-2">On Sale controls whether a salePrice is saved. salePrice is used only if On Sale is checked and Selling Price is less than MRP.</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="0" value={stock} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStock(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="grid gap-2">
                <Label>Sizes</Label>
                <div className="flex flex-wrap gap-3">
                  {SIZE_OPTIONS.map((sz) => (
                    <label key={sz} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={sizes.includes(sz)} onChange={() => toggleSize(sz)} />
                      <span>{sz}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Colors */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="colors">Colors (comma separated)</Label>
                <Input id="colors" placeholder="Red, Green, Blue" value={colorsText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColorsText(e.target.value)} disabled={noColors} />
              </div>
              <div className="grid gap-2">
                <Label>Color Options</Label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={noColors} onChange={(e) => setNoColors(e.target.checked)} />
                  <span>No color options</span>
                </label>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-1 text-sm text-muted-foreground">
                <div>Computed Discount</div>
                <div>{mrp !== "" && price !== "" ? `${(((Number(mrp) - Number(price)) / Number(mrp)) * 100).toFixed(1)}%` : "—"}</div>
              <Label htmlFor="images">Image URLs (one per line)</Label>
                <textarea id="images" className="border rounded px-3 py-2 min-h-[100px]" placeholder="https://...\nhttps://..." value={imagesText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImagesText(e.target.value)} />
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" />
                  <Button type="button" variant="outline" onClick={openPicker} disabled={uploading}>{uploading ? 'Uploading…' : 'Select files & Upload'}</Button>
                </div>
                {typeof progress === 'number' && (
                  <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded">
                      <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} role="progressbar" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{progress}%</div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" placeholder="Short description" className="border rounded px-3 py-2 min-h-[100px]" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
            </div>

            {/* Gallery + Hero selection */}
            <div className="border rounded p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">Gallery</div>
                <div className="text-sm text-muted-foreground">Select one as Hero</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imagesText.split(/\r?\n/).map((url, idx) => {
                  const u = url.trim();
                  if (!u) return null;
                  return (
                    <label key={idx} className="flex items-center gap-2 border rounded p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt={`img-${idx}`} className="h-16 w-16 object-cover rounded border" />
                      <div className="flex-1">
                        <div className="text-xs truncate max-w-[160px]">{u}</div>
                        <div className="mt-1 text-xs">
                          <input type="radio" name="hero" checked={heroIndex === idx} onChange={() => setHeroIndex(idx)} /> <span>Hero</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Product"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
