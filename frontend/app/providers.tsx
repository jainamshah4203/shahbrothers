"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { SmoothScrollProvider } from "@/components/Animations/SmoothScrollProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SmoothScrollProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SmoothScrollProvider>
  );
}