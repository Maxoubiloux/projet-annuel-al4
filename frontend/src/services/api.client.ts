const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const TOKEN_KEY = 'auth_token';

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
  const res = await doRequest(path, options, token);

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
