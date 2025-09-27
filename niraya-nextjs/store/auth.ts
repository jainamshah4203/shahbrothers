"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: () => boolean;
  setAuth: (payload: { token: string | null; user: AuthUser | null }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      isAuthenticated: () => Boolean(get().token),
      setAuth: ({ token, user }) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
    }),
    { name: "niraya-auth" }
  )
);
