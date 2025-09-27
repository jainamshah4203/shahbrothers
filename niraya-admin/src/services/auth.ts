import { apiPost } from "@/lib/api";

export interface AuthResponse {
  token: string;
  user: { _id: string; name: string; email: string; role: "user" | "admin" };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse>("/auth/login", { email, password });
  if (typeof window !== "undefined") {
    localStorage.setItem("niraya_admin_token", res.token);
  }
  return res;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await apiPost<AuthResponse>("/auth/register", { name, email, password });
  if (typeof window !== "undefined") {
    localStorage.setItem("niraya_admin_token", res.token);
  }
  return res;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("niraya_admin_token");
  }
}
