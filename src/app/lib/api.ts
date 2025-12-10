// src/lib/api.ts
const API_BASE =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_PROD_URL        // e.g. "https://api.myapp.com"
    : import.meta.env.VITE_API_DEV_URL ?? 'http://localhost:8000'; // fallback for dev

async function request<T = unknown>(
  endpoint: string,
  init?: RequestInit
): Promise<T> {
   const url = /https?:\/\//.test(endpoint)
    ? endpoint.trim()                          
    : `${API_BASE.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const res = await fetch(url, { ...init, headers: { ...init?.headers } });

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
  get<T = unknown>(endpoint: string) {
    return request<T>(endpoint, { method: 'GET' });
  },
  post<T = unknown>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },
  put<T = unknown>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },
  patch<T = unknown>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },
  delete<T = unknown>(endpoint: string) {
    return request<T>(endpoint, { method: 'DELETE' });
  },
} as const;
