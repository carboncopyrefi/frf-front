// src/lib/api.ts
const API_BASE =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_PROD_URL        // e.g. "https://api.myapp.com"
    : import.meta.env.VITE_API_DEV_URL ?? 'http://localhost:8000'; // fallback for dev

async function request<T = unknown>(
  endpoint: string,
  init?: RequestInit & { token?: string }
): Promise<T> {
   const url = /https?:\/\//.test(endpoint)
    ? endpoint.trim()                          
    : `${API_BASE.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: HeadersInit = {
    ...init?.headers,
    ...(init?.token && { Authorization: `Bearer ${init.token}` }), // JWT
  };  

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Network error');
    throw new Error(`API ${res.status} – ${text}`);
  }

  // if server returns 204 or empty body, just return void
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return (await res.text()) as T;

  return res.json();
}

export const api = {
  get<T = unknown>(endpoint: string, token: string | null = null) {
    return request<T>(endpoint, { method: 'GET', token: token ?? undefined });
  },
  post<T = unknown>(endpoint: string, body: unknown, token: string | null = null) {
    return request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      token: token ?? undefined,
    });
  },
  put<T = unknown>(endpoint: string, body: unknown, token: string | null = null) {
    return request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      token: token ?? undefined,
    });
  },
  patch<T = unknown>(endpoint: string, body: unknown, token: string | null = null) {
    return request<T>(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      token: token ?? undefined,
    });
  },
  delete<T = unknown>(endpoint: string, token: string | null = null) {
    return request<T>(endpoint, { method: 'DELETE', token: token ?? undefined, });
  },
} as const;
