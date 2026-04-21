// Server-side: calls Kong proxy
// Client-side: calls Next.js /api/* routes (which proxy to Kong)

const KONG = process.env.KONG_PROXY_URL ?? 'http://localhost:8000';

async function kongFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (process.env.KONG_API_KEY) {
    (headers as Record<string, string>)['X-Api-Key'] = process.env.KONG_API_KEY;
  }
  const res = await fetch(`${KONG}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  if (!res.ok) throw new Error(`Kong ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  bins:         () => kongFetch<unknown[]>('/v1/bins'),
  bin:          (id: string) => kongFetch<unknown>(`/v1/bins/${id}`),

  alerts:       () => kongFetch<unknown[]>('/v1/alerts'),
  markRead:     (id: string) => kongFetch<unknown>(`/v1/alerts/${id}/read`, { method: 'PATCH' }),
  markAllRead:  () => kongFetch<unknown>('/v1/alerts/read-all', { method: 'PATCH' }),

  routes:       () => kongFetch<unknown[]>('/v1/pickup-routes'),
  route:        (id: string) => kongFetch<unknown>(`/v1/pickup-routes/${id}`),

  analytics:    () => kongFetch<unknown>('/v1/analytics'),

  zones:        () => kongFetch<unknown[]>('/v1/zones'),
};