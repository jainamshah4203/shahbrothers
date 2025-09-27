"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthed) {
      const redirect = encodeURIComponent(pathname || "/");
      router.replace(`/auth/login?redirect=${redirect}`);
    }
  }, [mounted, isAuthed, pathname, router]);

  if (!mounted) return null;
  if (!isAuthed) return null;
  return <>{children}</>;
}
