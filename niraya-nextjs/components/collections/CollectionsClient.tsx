"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatINR } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/cart";

function normalizeImageUrl(src: string | undefined): string {
  if (!src) return "/placeholder.svg";
  try {
    let fixed = src.trim();
    fixed = fixed.replace(/unslpash/gi, "unsplash");
    fixed = fixed.replace(/(^|\.)image\.unsplash\.com/gi, "$1images.unsplash.com");
    if (fixed.startsWith("http://")) fixed = fixed.replace("http://", "https://");
    const url = new URL(fixed);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", "600");
      url.searchParams.set("h", "800");
      url.searchParams.set("q", "80");
      return url.toString();
    }
    return fixed;
  } catch {
    return "/placeholder.svg";
  }
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr)).filter(Boolean) as T[];
}

type Props = { products: Product[] };

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzQwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlJy8+PC9zdmc+";

function ImageWithFallback({ src, alt, priority, loading }: { src: string; alt: string; priority?: boolean; loading?: 'eager' | 'lazy' }) {
  const [actualSrc, setActualSrc] = useState(src);
  useEffect(() => setActualSrc(src), [src]);
  return (
    <Image
      src={actualSrc}
      alt={alt}
      fill
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      priority={priority}
      loading={loading}
      onError={() => setActualSrc("/placeholder.svg")}
    />
  );
}

export default function CollectionsClient({ products }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Derive facets
  const allCategories = useMemo(() => unique(products.map((p) => p.category)), [products]);
  const allColors = useMemo(() => unique(products.flatMap((p) => p.colors || [])), [products]);
  const allSizes = useMemo(() => unique(products.flatMap((p) => p.sizes || [])), [products]);
  const priceMin = useMemo(() => Math.min(...products.map((p) => p.salePrice ?? p.price)), [products]);
  const priceMax = useMemo(() => Math.max(...products.map((p) => p.salePrice ?? p.price)), [products]);

  // UI state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(priceMin || 0);
  const [maxPrice, setMaxPrice] = useState<number>(priceMax || 0);
  const [sort, setSort] = useState<string>("default");
  const [perPage, setPerPage] = useState<number>(8); // load-more: start with 8
  const [page, setPage] = useState<number>(1);
  const [q, setQ] = useState<string>("");
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Initialize from URL q, page, perPage params
  useEffect(() => {
    const initialQ = searchParams.get("q") || "";
    const initialPage = Number(searchParams.get("page") || "1");
    const initialPer = Number(searchParams.get("perPage") || "8");
    setQ(initialQ);
    if (!Number.isNaN(initialPage) && initialPage > 0) setPage(initialPage);
    if (!Number.isNaN(initialPer) && initialPer > 0) setPerPage(initialPer);
  }, [searchParams]);

  useEffect(() => {
    setMinPrice(priceMin || 0);
    setMaxPrice(priceMax || 0);
  }, [priceMin, priceMax]);

  // Filtering
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const price = p.salePrice ?? p.price;
      const inCategory = selectedCategories.length ? selectedCategories.includes(p.category) : true;
      const hasColor = selectedColors.length ? (p.colors || []).some((c) => selectedColors.includes(c)) : true;
      const hasSize = selectedSizes.length ? (p.sizes || []).some((s) => selectedSizes.includes(s)) : true;
      const inPrice = price >= minPrice && price <= maxPrice;
      const qq = q.trim().toLowerCase();
      const matchesQuery = qq
        ? [p.name, p.brand, p.category].some((f) => (f || "").toLowerCase().includes(qq))
        : true;
      return inCategory && hasColor && hasSize && inPrice && matchesQuery;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case "name-asc":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return list;
  }, [products, selectedCategories, selectedColors, selectedSizes, minPrice, maxPrice, sort, q]);

  const totalPages = 1; // load-more mode uses a single page
  const current = filtered.slice(0, perPage);

  useEffect(() => {
    // reset when filters or sort change
    setPage(1);
    setPerPage(8);
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("page", "1");
    sp.set("perPage", "8");
    router.replace(`/collections?${sp.toString()}`);
  }, [selectedCategories, selectedColors, selectedSizes, minPrice, maxPrice, sort, router, searchParams]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="lg:col-span-1 space-y-8">
        {/* Category */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide">Category</h3>
            <button className="text-xs text-muted-foreground hover:underline" onClick={() => setSelectedCategories([])}>Clear</button>
          </div>
          <div className="mt-3 space-y-2 max-h-48 overflow-auto pr-2">
            {allCategories.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedCategories.includes(c)} onChange={(e) => {
                  setSelectedCategories((prev) => e.target.checked ? [...prev, c] : prev.filter((x) => x !== c));
                }} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </section>

      {/* Quick View Modal */}
      <Dialog open={!!quickView} onOpenChange={(open) => { if (!open) { setQuickView(null); setSelectedSize(""); setSelectedColor(""); } }}>
        <DialogContent className="max-w-2xl">
          {quickView && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quickView.images?.[0] || '/placeholder.svg'} alt={quickView.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl font-semibold">{quickView.name}</DialogTitle>
                </DialogHeader>
                <div className="mt-2 flex items-center gap-2">
                  {quickView.salePrice ? (
                    <>
                      <span className="text-xl font-semibold">{formatINR(quickView.salePrice)}</span>
                      <span className="text-muted-foreground line-through">{formatINR(quickView.price)}</span>
                    </>
                  ) : (
                    <span className="text-xl font-semibold">{formatINR(quickView.price)}</span>
                  )}
                </div>

                {/* Color pills */}
                {Array.isArray(quickView.colors) && quickView.colors.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs mb-2 text-muted-foreground">Color</div>
                    <div className="flex flex-wrap gap-2">
                      {quickView.colors.map((c) => (
                        <button key={c} type="button" onClick={() => setSelectedColor(c)} className={`px-3 py-1.5 rounded border text-xs ${selectedColor === c ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size pills */}
                {Array.isArray(quickView.sizes) && quickView.sizes.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs mb-2 text-muted-foreground">Size</div>
                    <div className="flex flex-wrap gap-2">
                      {quickView.sizes.map((s) => (
                        <button key={s} type="button" onClick={() => setSelectedSize(s)} className={`px-3 py-1.5 rounded border text-xs ${selectedSize === s ? 'bg-foreground text-background border-foreground' : 'hover:bg-accent'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    className="w-full md:w-auto"
                    disabled={
                      (Array.isArray(quickView.sizes) && quickView.sizes.length > 0 && !selectedSize) ||
                      (Array.isArray(quickView.colors) && quickView.colors.length > 0 && !selectedColor)
                    }
                    onClick={() => {
                      try {
                        const add = useCartStore.getState().addItem;
                        add(quickView as any, { qty: 1, size: selectedSize || undefined, color: selectedColor || undefined });
                        setQuickView(null);
                        setSelectedSize("");
                        setSelectedColor("");
                      } catch {}
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

        {/* Color */}
        {allColors.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide">Color</h3>
              <button className="text-xs text-muted-foreground hover:underline" onClick={() => setSelectedColors([])}>Clear</button>
            </div>
            <div className="mt-3 space-y-2 max-h-48 overflow-auto pr-2">
              {allColors.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selectedColors.includes(c)} onChange={(e) => {
                    setSelectedColors((prev) => e.target.checked ? [...prev, c] : prev.filter((x) => x !== c));
                  }} />
                  <span className="capitalize">{c}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Size */}
        {allSizes.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide">Size</h3>
              <button className="text-xs text-muted-foreground hover:underline" onClick={() => setSelectedSizes([])}>Clear</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {allSizes.map((s) => (
                <button key={s} type="button" onClick={() => setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                  className={`px-3 py-1 rounded border text-sm ${selectedSizes.includes(s) ? "border-foreground" : "border-border"}`}>
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Price */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide">Price</h3>
            <button className="text-xs text-muted-foreground hover:underline" onClick={() => { setMinPrice(priceMin); setMaxPrice(priceMax); }}>Reset</button>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input type="number" className="h-9 w-24 rounded border px-2" value={minPrice} min={priceMin} max={maxPrice} onChange={(e) => setMinPrice(Math.min(Number(e.target.value || 0), maxPrice))} />
              <span className="text-sm">to</span>
              <input type="number" className="h-9 w-24 rounded border px-2" value={maxPrice} min={minPrice} max={priceMax} onChange={(e) => setMaxPrice(Math.max(Number(e.target.value || 0), minPrice))} />
            </div>
            <input type="range" min={priceMin} max={priceMax} value={minPrice} onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))} />
            <input type="range" min={priceMin} max={priceMax} value={maxPrice} onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))} />
          </div>
        </section>

        <button
          type="button"
          className="w-full mt-4 rounded-md border px-4 py-2 text-sm"
          onClick={() => {
            setSelectedCategories([]);
            setSelectedColors([]);
            setSelectedSizes([]);
            setMinPrice(priceMin);
            setMaxPrice(priceMax);
            setSort("default");
            setPage(1);
            setPerPage(8);
            const sp = new URLSearchParams(Array.from(searchParams.entries()));
            sp.delete("q");
            sp.delete("category");
            sp.set("page", "1");
            sp.set("perPage", "8");
            router.replace(`/collections?${sp.toString()}`);
          }}
        >
          Clear All Filters
        </button>
      </aside>

      {/* Main grid */}
      <section className="lg:col-span-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                const sp = new URLSearchParams(Array.from(searchParams.entries()));
                if (e.target.value) sp.set("q", e.target.value); else sp.delete("q");
                router.replace(`/collections?${sp.toString()}`);
              }}
              placeholder="Search products..."
              className="h-9 w-56 rounded border px-2 text-sm"
            />
          </div>
          {/* Removed 'Show N' toggles for load-more UX */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort</label>
            <select className="h-9 rounded border px-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {current.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No products match filters.</div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
            {current.map((p, i) => (
              <li key={p.id} className="group">
                <div className="relative">
                  <Link href={p.slug ? `/products/${p.slug}` : `/products/id/${p.id}`} className="block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-muted">
                      <ImageWithFallback
                        src={normalizeImageUrl(p.images?.[0])}
                        alt={p.name}
                        priority={i < 4}
                        loading={i < 4 ? "eager" : "lazy"}
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {p.isBestseller && (
                          <Badge variant="secondary">BESTSELLER</Badge>
                        )}
                        {p.isNew && (
                          <Badge className="bg-primary text-primary-foreground">NEW</Badge>
                        )}
                        {typeof p.salePrice === 'number' && p.salePrice < p.price && (
                          <Badge className="bg-destructive text-destructive-foreground">-
                            {Math.round(((p.price - p.salePrice) / p.price) * 100)}%
                          </Badge>
                        )}
                        {p.limited && (
                          <Badge variant="outline" className="bg-background/90">LIMITED</Badge>
                        )}
                      </div>
                      {/* Hover Quick View button */}
                      <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${"group-hover:opacity-100 group-hover:translate-y-0 opacity-0 translate-y-4"}`}>
                        <Button
                          className="w-full luxury-button"
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(p); }}
                        >
                          Quick View
                        </Button>
                      </div>
                    </div>
                  </Link>
                </div>
                <Link href={p.slug ? `/products/${p.slug}` : `/products/id/${p.id}`} className="block">
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">{p.brand}</p>
                    <h3 className="text-base font-medium line-clamp-1">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      {p.salePrice ? (
                        <>
                          <span className="font-semibold">₹{p.salePrice.toLocaleString("en-IN")}</span>
                          <span className="text-sm text-muted-foreground line-through">₹{p.price.toLocaleString("en-IN")}</span>
                        </>
                      ) : (
                        <span className="font-semibold">₹{p.price.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Load more */}
        <div className="flex items-center justify-center mt-8">
          {perPage < filtered.length ? (
            <button
              className="px-4 py-2 text-sm rounded border"
              onClick={() => {
                const next = Math.min(filtered.length, perPage + 8);
                setPerPage(next);
                const sp = new URLSearchParams(Array.from(searchParams.entries()));
                sp.set("perPage", String(next));
                sp.set("page", "1");
                router.replace(`/collections?${sp.toString()}`);
              }}
            >
              Load more
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
