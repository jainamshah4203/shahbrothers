import { apiGet } from './api';
import type { Product } from '@/types/product';

// Shape returned by backend (see niraya-backend/src/models/Product.ts)
export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: Array<string | { url: string; alt?: string }>; // backend returns objects
  category: string;
  sizes: string[];
  colors: Array<string | { name: string; hex?: string }>; // backend may return objects
  stock: number;
  brand?: string;
  slug?: string;
  material: string;
  careInstructions: string[];
  isNewProduct?: boolean;
  isBestseller?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function mapApiProduct(p: ApiProduct): Product {
  const imgs = (p.images || []).map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean);
  const colors = (p.colors || []).map((c: any) => (typeof c === 'string' ? c : c?.name)).filter(Boolean);
  return {
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    salePrice: p.salePrice,
    images: imgs,
    category: p.category,
    brand: p.brand,
    slug: p.slug,
    sizes: p.sizes,
    colors: colors as string[],
    inStock: (p.stock ?? 0) > 0,
    isNew: !!p.isNewProduct,
    isBestseller: !!p.isBestseller,
    limited: !!(p as any).limited,
    material: p.material,
    careInstructions: p.careInstructions || [],
  };
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const data: { products: ApiProduct[] } = await apiGet(`/products/featured?limit=${limit}`);
  return (data.products || []).map(mapApiProduct);
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  bestSeller?: boolean;
  saleOnly?: boolean;
  limited?: boolean;
  newOnly?: boolean;
} = {}): Promise<PaginatedProducts> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
  });
  const data: { products: ApiProduct[]; pagination: PaginatedProducts['pagination'] } = await apiGet(
    `/products${query.toString() ? `?${query.toString()}` : ''}`
  );
  return {
    products: (data.products || []).map(mapApiProduct),
    pagination: data.pagination,
  };
}

export async function fetchFeaturedFlagged(limit = 8): Promise<Product[]> {
  const data = await fetchProducts({ limit, featured: true });
  return data.products;
}

export async function fetchBestSellers(limit = 8): Promise<Product[]> {
  const data = await fetchProducts({ limit, bestSeller: true });
  return data.products;
}

export async function fetchOnSale(limit = 8): Promise<Product[]> {
  const data = await fetchProducts({ limit, saleOnly: true });
  return data.products;
}
