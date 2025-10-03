"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError("Please accept the Terms & Privacy Policy");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await apiPost<{ token?: string; user?: any }>("/auth/register", { name, email, password });
      if (data?.token && data?.user) {
        setAuth({ token: data.token, user: data.user });
        if (typeof window !== "undefined") {
          localStorage.setItem("niraya_token", data.token);
          localStorage.setItem("niraya_user", JSON.stringify(data.user));
        }
        router.push("/");
        return;
      }
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      <div>
        <label className="block text-sm mb-1">Full name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
        <p className="mt-1 text-xs text-muted-foreground">Minimum 8 characters recommended.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 border rounded" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        I agree to the <a href="/privacy" className="underline">Privacy Policy</a> and <a href="/terms" className="underline">Terms</a>.
      </label>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
      {!process.env.NEXT_PUBLIC_API_URL && (
        <p className="text-xs text-amber-600">API URL not configured (NEXT_PUBLIC_API_URL)</p>
      )}
      <p className="text-sm text-muted-foreground text-center">
        Already have an account? <a href="/auth/login" className="underline">Sign in</a>
      </p>
    </form>
  );
}
