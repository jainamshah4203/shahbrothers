export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) handleUnauthorized();
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    credentials: "include",
    body: JSON.stringify(body),
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) handleUnauthorized();
    const msg = (data && (data.message || data.error)) || `${res.status}`;
    throw new Error(String(msg));
  }
  return data as T;
}

export async function apiPut<T>(path: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    credentials: "include",
    body: JSON.stringify(body),
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `${res.status}`;
    throw new Error(String(msg));
  }
  return data as T;
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    credentials: "include",
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `${res.status}`;
    throw new Error(String(msg));
  }
  return data as T;
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('niraya_admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem('niraya_admin_token'); } catch {}
    // Redirect to login on auth failure
    setTimeout(() => { window.location.href = '/login'; }, 50);
  }
}
