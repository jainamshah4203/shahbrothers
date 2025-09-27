// Normalize base URL so '/api' is present exactly once
const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TRIMMED = RAW_BASE.replace(/\/$/, '');
export const API_URL = TRIMMED.endsWith('/api') ? TRIMMED : `${TRIMMED}/api`;

export async function apiGet<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...authHeader(),
    },
    // Ensure no caching for dynamic sections like New Arrivals
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: any, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...authHeader(),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data as T;
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('niraya_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
