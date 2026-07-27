const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: unknown;
  };
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const payload = (await res.json()) as RefreshResponse;
        window.localStorage.setItem(TOKEN_KEY, payload.data.accessToken);
        if (payload.data.refreshToken) {
          window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.data.refreshToken);
        }
        window.localStorage.setItem(USER_KEY, JSON.stringify(payload.data.user));
        window.dispatchEvent(new Event('auth:refreshed'));
        return payload.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function doRequest(path: string, options?: RequestInit, token?: string | null): Promise<Response> {
  const hasBody = options?.body !== undefined;

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : undefined;
  let res = await doRequest(path, options, token);

  if (res.status === 401 && !path.startsWith('/v1/auth/')) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      res = await doRequest(path, options, nextToken);
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(error?.message || error?.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
