"use client";

import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export interface CartLineItem {
  productId: string;
  qty: number;
  // Optional selections (not wired yet in UI)
  size?: string;
  color?: string;
  // Snapshot for quick render
  snapshot: Pick<Product, "name" | "price" | "salePrice" | "images" | "category" | "inStock"> & {
    sizesCount?: number;
    colorsCount?: number;
  };
}

export interface CartState {
  items: CartLineItem[];
  addItem: (product: Product, opts?: { qty?: number; size?: string; color?: string }) => void;
  removeItem: (productId: string, opts?: { size?: string; color?: string }) => void;
  removeAll: (productId: string, opts?: { size?: string; color?: string }) => void;
  setQty: (productId: string, qty: number, opts?: { size?: string; color?: string }) => void;
  clear: () => void;
  count: () => number;
  // Coupon & totals
  coupon: { 
    code: string; 
    type: "percent" | "fixed"; 
    value: number;
    discount?: number;
    finalTotal?: number;
  } | null;
  setCoupon: (coupon: { 
    code: string; 
    type: "percent" | "fixed"; 
    value: number;
    discount?: number;
    finalTotal?: number;
  }) => void;
  clearCoupon: () => void;
  subtotal: () => number;
  discountAmount: () => number;
  total: () => number;
}

const creator: StateCreator<CartState> = (set, get) => ({
      items: [],
      coupon: null,
      addItem: (product, opts) => {
        const { qty = 1, size, color } = opts || {};
        set((state) => {
          const idx = state.items.findIndex((i) => i.productId === product.id && i.size === size && i.color === color);
          if (idx >= 0) {
            const copy = [...state.items];
            copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
            return { items: copy };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                qty,
                size,
                color,
                snapshot: {
                  name: product.name,
                  price: product.price,
                  salePrice: product.salePrice,
                  images: product.images,
                  category: product.category,
                  inStock: product.inStock,
                  sizesCount: Array.isArray((product as any).sizes) ? (product as any).sizes.length : 0,
                  colorsCount: Array.isArray((product as any).colors) ? (product as any).colors.length : 0,
                },
              },
            ],
          };
        });
      },
      removeItem: (productId, opts) =>
        set((state) => {
          const { size, color } = opts || {};
          const idx = state.items.findIndex((i) => i.productId === productId && (size ? i.size === size : true) && (color ? i.color === color : true));
          if (idx < 0) return { items: state.items };
          const copy = [...state.items];
          const line = copy[idx];
          if (line.qty > 1) {
            copy[idx] = { ...line, qty: line.qty - 1 };
            return { items: copy };
          }
          copy.splice(idx, 1);
          return { items: copy };
        }),
      removeAll: (productId, opts) =>
        set((state) => {
          const { size, color } = opts || {};
          return {
            items: state.items.filter((i) =>
              !(i.productId === productId && (size ? i.size === size : true) && (color ? i.color === color : true))
            ),
          };
        }),
      setQty: (productId, qty, opts) =>
        set((state) => {
          const { size, color } = opts || {};
          const idx = state.items.findIndex((i) => i.productId === productId && (size ? i.size === size : true) && (color ? i.color === color : true));
          if (idx < 0) return { items: state.items };
          if (qty <= 0) {
            const filtered = state.items.filter((_, j) => j !== idx);
            return { items: filtered };
          }
          const copy = [...state.items];
          copy[idx] = { ...copy[idx], qty };
          return { items: copy };
        }),
      clear: () => set({ items: [], coupon: null }),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      setCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
      subtotal: () => get().items.reduce((sum, i) => sum + (i.snapshot.salePrice ?? i.snapshot.price) * i.qty, 0),
      discountAmount: () => {
        const cp = get().coupon;
        if (!cp) return 0;
        // Use backend-calculated discount if available, otherwise fallback to local calculation
        if (typeof cp.discount === 'number') return cp.discount;
        const sub = get().subtotal();
        if (cp.type === "percent") return Math.min(sub, Math.round((sub * cp.value) / 100));
        return Math.min(sub, cp.value);
      },
      total: () => {
        const cp = get().coupon;
        // Use backend-calculated finalTotal if available
        if (cp && typeof cp.finalTotal === 'number') return cp.finalTotal;
        const sub = get().subtotal();
        const disc = get().discountAmount();
        return Math.max(0, sub - disc);
      },
});

export const useCartStore = create<CartState>()(persist(creator, { name: "niraya-cart" }));
