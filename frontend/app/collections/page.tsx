import CollectionsClient from "@/components/collections/CollectionsClient";
import { API_URL } from "@/lib/api";
import { fetchProducts } from "@/lib/products";

import type { Product } from "@/types/product";

async function getProducts(filters: {
  featured?: boolean;
  bestSeller?: boolean;
  saleOnly?: boolean;
  limited?: boolean;
  newOnly?: boolean;
}): Promise<Product[]> {
  try {
    const { products } = await fetchProducts(filters);
    return products;
  } catch (e) {
    console.error("Collections fetch error", e);
    return [];
  }
}

export default async function CollectionsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = (await searchParams) ?? {};
  const toBool = (v: string | string[] | undefined) => typeof v === 'string' && /^(1|true|yes)$/i.test(v);
  const products = await getProducts({
    featured: toBool(sp.featured),
    bestSeller: toBool(sp.bestSeller),
    saleOnly: toBool(sp.saleOnly),
    limited: toBool(sp.limited),
    newOnly: toBool(sp.newOnly),
  });

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-serif">Collections</h1>
          <p className="text-muted-foreground mt-2">Browse all collections and filters.</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found. Ensure the backend is running and seeded.</p>
            <p className="text-sm text-muted-foreground mt-2">Backend URL: {API_URL}</p>
          </div>
        ) : (
          <CollectionsClient products={products} />
        )}
      </main>
    </div>
  );
}
