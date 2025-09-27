"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/store/wishlist";
import { API_URL } from "@/lib/api";

// Use normalized API base that includes '/api' exactly once
const API_BASE = API_URL; // e.g., http://localhost:5000/api

type Product = {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  images?: string[];
  category?: string;
  brand?: string;
};

function normalizeImageUrl(src?: string) {
  if (!src) return "/placeholder.svg";
  try {
    let fixed = src.trim();
    fixed = fixed.replace(/unslpash/gi, "unsplash");
    fixed = fixed.replace(/(^|\.)image\.unsplash\.com/gi, "$1images.unsplash.com");
    if (fixed.startsWith("http://")) fixed = fixed.replace("http://", "https://");
    return fixed;
  } catch {
    return "/placeholder.svg";
  }
}

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const ids = useWishlistStore((s) => s.ids);
  const remove = useWishlistStore((s) => s.remove);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let ignore = false;
    const load = async () => {
      if (ids.length === 0) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        // Fetch concurrently; API_BASE already has '/api'
        const responses = await Promise.all(
          ids.map((id) => fetch(`${API_BASE}/products/${id}`, { cache: "no-store" }).catch(() => null))
        );
        const jsons = await Promise.all(
          responses.map((res) => (res && res.ok ? res.json().catch(() => null) : null))
        );
        const results: Product[] = jsons.map((j: any) => j?.product).filter(Boolean);
        if (!ignore) setProducts(results);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [mounted, ids]);

  const empty = mounted && ids.length === 0;

  if (!mounted) return null;

  if (empty) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-medium">Your wishlist is empty</h2>
        <p className="text-muted-foreground mt-2">Save items to view them here.</p>
        <div className="mt-6">
          <Link href="/collections" className="underline">Browse collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {loading && <p className="text-sm text-muted-foreground mb-4">Loading your wishlist…</p>}
      {products.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground">No items found. They may have been removed.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p._id} className="group">
              <Link href={`/products/id/${p._id}`} className="block">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded border bg-muted">
                  <Image src={normalizeImageUrl(p.images?.[0])} alt={p.name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium line-clamp-1">{p.name}</h3>
                  <div className="text-sm">
                    {p.salePrice ? (
                      <>
                        <span className="font-semibold">₹{p.salePrice.toLocaleString("en-IN")}</span>
                        <span className="text-muted-foreground line-through ml-2">₹{p.price.toLocaleString("en-IN")}</span>
                      </>
                    ) : (
                      <span className="font-semibold">₹{p.price.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                className="mt-2 text-xs text-muted-foreground hover:underline"
                onClick={() => remove(p._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
