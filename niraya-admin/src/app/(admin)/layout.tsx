"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    try {
      const token = localStorage.getItem("niraya_admin_token");
      if (!token) router.replace("/login");
    } catch {
      router.replace("/login");
    }
  }, [router]);
  return <AdminLayout>{children}</AdminLayout>;
}
