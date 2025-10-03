"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  miniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      miniCartOpen: false,
      openMiniCart: () => set({ miniCartOpen: true }),
      closeMiniCart: () => set({ miniCartOpen: false }),
    }),
    { name: "niraya-ui" }
  )
);
