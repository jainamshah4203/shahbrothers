"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Expecting { token, user }
      const data = await apiPost<{ token: string; user: any }>("/auth/login", { email, password });
      setAuth({ token: data.token, user: data.user });
      if (typeof window !== "undefined") {
        localStorage.setItem("niraya_token", data.token);
        localStorage.setItem("niraya_user", JSON.stringify(data.user));
      }
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      <div>
        <label className="block text-sm mb-1">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      {!process.env.NEXT_PUBLIC_API_URL && (
        <p className="text-xs text-amber-600">API URL not configured (NEXT_PUBLIC_API_URL)</p>
      )}
      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account? <a href="/auth/register" className="underline">Register</a>
      </p>
    </form>
  );
}
