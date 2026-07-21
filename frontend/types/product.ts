export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  limited?: boolean;
  specifications: string;
  features: string[];
  // optional fields from backend
  slug?: string;
  brand?: string;
  /** e.g. "120 GSM" — shown as a minimalist product badge */
  paperWeight?: string;
  /** e.g. "Thread Bound", "Staple Bound" */
  bindingStyle?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: Date;
}