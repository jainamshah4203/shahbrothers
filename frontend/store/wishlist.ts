"use client";

import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistState {
  ids: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

const creator: StateCreator<WishlistState> = (set, get) => ({
  ids: [],
  add: (productId: string) => set((s) => (s.ids.includes(productId) ? s : { ids: [...s.ids, productId] })),
  remove: (productId: string) => set((s) => ({ ids: s.ids.filter((id) => id !== productId) })),
  has: (productId: string) => get().ids.includes(productId),
  clear: () => set({ ids: [] }),
});

export const useWishlistStore = create<WishlistState>()(persist(creator, { name: "niraya-wishlist" }));
