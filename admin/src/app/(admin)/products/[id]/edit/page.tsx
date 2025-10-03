"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SelectSearch } from "@/components/ui/select-search";
import { ApiProduct, fetchProductById, updateProduct } from "@/services/products";
import { uploadManyToCloudinarySignedWithProgress, uploadManyToCloudinaryWithProgress } from "@/lib/upload";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tops");
  const [mrp, setMrp] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const SIZE_OPTIONS = ["XS","S","M","L","XL","XXL"] as const;
  const [sizes, setSizes] = useState<string[]>([]);
  const [imagesText, setImagesText] = useState("");
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [onSale, setOnSale] = useState<boolean>(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [colorsText, setColorsText] = useState<string>("");
  const [noColors, setNoColors] = useState<boolean>(false);

  function toggleSize(size: string) {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  useEffect(() => {
    (async () => {
      try {
        const { product } = await fetchProductById(id);
        hydrate(product);
      } catch (e: any) {
        setError(e?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
        results = await uploadManyToCloudinarySignedWithProgress(files, 'niraya/products', (p) => setProgress(p));
      } catch (err) {
        // fallback if unsigned preset exists
        const hasPreset = !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (!hasPreset) throw err;
        results = await uploadManyToCloudinaryWithProgress(files, (p) => setProgress(p));
      }
      const urls = results.map(r => r.url).filter(Boolean);
      setImagesText(prev => {
        const base = prev?.trim() ? (prev.trim() + '\n') : '';
        return base + urls.join('\n');
      });
      setHeroIndex(0);
      try { if (input) input.value = ''; } catch {}
    } catch (e: any) {
      alert(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  function openPicker() { const el = fileRef.current; if (el) el.click(); }
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) { if (e.target.files && e.target.files.length > 0) { await handleUpload(); } }

  function hydrate(p: ApiProduct) {
    setName(p.name || "");
    setSlug(p.slug || "");
    setDescription(p.description || "");
    setCategory(p.category || "Tops");
    setMrp(p.price ?? "");
    setPrice(p.salePrice ?? p.price ?? "");
    const mrpVal = p.price ?? 0;
    const sellVal = p.salePrice ?? p.price ?? 0;
    const d = mrpVal > 0 ? ((mrpVal - sellVal) / mrpVal) * 100 : 0;
    setDiscountPercent(Number(d.toFixed(1)));
    setStock(p.stock ?? "");
    const arr = Array.isArray(p.images) ? p.images : [];
    setImagesText(arr.join("\n"));
    setHeroIndex(typeof p.heroIndex === 'number' ? p.heroIndex : 0);
    const sizesArr = Array.isArray((p as any).sizes) ? (p as any).sizes : [];
    setSizes(sizesArr);
    const colorsArr = Array.isArray((p as any).colors) ? (p as any).colors : [];
    setColorsText(colorsArr.join(","));
    setNoColors(colorsArr.length === 0);
    setOnSale(!!p.salePrice && (p.salePrice as any) < (p.price as any));
  }

  useEffect(() => {
    if (mrp !== "" && price !== "") {
      const m = Number(mrp);
      const p = Number(price);
      const d = m > 0 ? Math.max(0, ((m - p) / m) * 100) : 0;
      setDiscountPercent(Number(d.toFixed(1)));
      setOnSale(p < m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mrp, price]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sizesArr = sizes;
    if (!name || !slug || !category || mrp === "" || price === "" || sizesArr.length === 0) {
      setError("Please fill required fields: Name, Slug, Category, MRP, Selling Price, Sizes");
      return;
    }
    try {
      setSaving(true);
      const images = imagesText
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean);
      const colorsArr = noColors ? [] : colorsText.split(',').map(s => s.trim()).filter(Boolean);
      await updateProduct(id, {
        name,
        slug,
        description,
        price: Number(mrp),
        ...(onSale && Number(price) < Number(mrp) ? { salePrice: Number(price) } : { salePrice: undefined }),
        category,
        stock: stock === "" ? 0 : Number(stock),
        images,
        heroIndex: Math.max(0, Math.min(heroIndex, Math.max(0, images.length - 1))),
        sizes: sizesArr,
        colors: colorsArr,
        material: 'N/A',
      });
      router.replace("/products");
    } catch (e: any) {
      setError(e?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3 md:p-4 space-y-4">
      <h1 className="text-xl font-semibold">Edit Product</h1>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <SelectSearch
                    options={[
                      { value: "Tops", label: "Tops" },
                      { value: "Bottoms", label: "Bottoms" },
                      { value: "Dresses", label: "Dresses" },
                      { value: "Outerwear", label: "Outerwear" },
                      { value: "Knitwear", label: "Knitwear" },
                      { value: "Shoes", label: "Shoes" },
                      { value: "Accessories", label: "Accessories" },
                    ]}
                    value={category}
                    onChange={(v) => setCategory(v || "Tops")}
                    placeholder="Select options"
                    searchPlaceholder="Search category..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mrp">MRP</Label>
                  <Input id="mrp" type="number" value={mrp} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMrp(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Selling Price</Label>
                  <Input id="price" type="number" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount Percentage (auto)</Label>
                  <Input id="discount" type="number" value={discountPercent} readOnly />
                </div>
              </div>

              {/* On Sale toggle */}
              <div className="flex items-center gap-2">
                <input id="onSale" type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
                <Label htmlFor="onSale">On Sale</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" value={stock} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStock(e.target.value === "" ? "" : Number(e.target.value))} />
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

              <div className="grid gap-2">
                <Label htmlFor="images">Image URLs (one per line)</Label>
                <textarea id="images" className="border rounded px-3 py-2 min-h-[100px]" value={imagesText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImagesText(e.target.value)} />
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

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" className="border rounded px-3 py-2 min-h-[100px]" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
              </div>

              {/* Media preview + hero selection */}
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

              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
