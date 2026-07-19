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
  specifications: string;
  features: string[];
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
    specifications: p.specifications,
    features: p.features || [],
  };
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const data: { products: ApiProduct[] } = await apiGet(`/products/featured?limit=${limit}`);
    return (data.products || []).map(mapApiProduct);
  } catch (error) {
    const { mockProducts } = await import('@/data/products');
    return mockProducts.slice(0, limit);
  }
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
  try {
    const data: { products: ApiProduct[]; pagination: PaginatedProducts['pagination'] } = await apiGet(
      `/products${query.toString() ? `?${query.toString()}` : ''}`
    );
    return {
      products: (data.products || []).map(mapApiProduct),
      pagination: data.pagination,
    };
  } catch (error) {
    const { mockProducts } = await import('@/data/products');
    let prods = [...mockProducts];
    if (params.category) prods = prods.filter(p => p.category === params.category);
    if (params.bestSeller) prods = prods.filter(p => p.isBestseller);
    if (params.saleOnly) prods = prods.filter(p => p.salePrice && p.salePrice < p.price);
    
    return {
      products: prods,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: prods.length,
        hasNextPage: false,
        hasPrevPage: false,
      }
    };
  }
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
