import keycloak from '@/core/auth/keycloak';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

function buildHeaders(hasBody: boolean, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    // Fastify's default JSON body parser rejects a request that declares
    // this content-type but sends no body (e.g. DELETE with no payload),
    // so only set it when there's actually a body to send.
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(extra as Record<string, string>),
  };
  const token = keycloak.token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    keycloak.logout({ redirectUri: window.location.origin + '/login' });
    throw new ApiError(401, 'Unauthorized', 'Session expirée, reconnexion en cours…');
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      const bodyError = typeof body?.error === 'string' ? body.error : body?.error?.message;
      message = body?.message ?? bodyError ?? message;
    } catch { }
    throw new ApiError(res.status, res.statusText, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: buildHeaders(body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  return handleResponse<T>(res);
}

async function uploadFile<T>(path: string, file: File, signal?: AbortSignal): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const formData = new FormData();
  formData.append('file', file);

  const token = keycloak.token;
  const res = await fetch(url, {
    method: 'POST',
    // No Content-Type here: the browser sets it (with the multipart boundary)
    // when the body is a FormData instance.
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
    signal,
  });
  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>('GET', path, undefined, signal),

  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>('POST', path, body, signal),

  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>('PUT', path, body, signal),

  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    request<T>('PATCH', path, body, signal),

  delete: <T>(path: string, signal?: AbortSignal) =>
    request<T>('DELETE', path, undefined, signal),

  upload: <T>(path: string, file: File, signal?: AbortSignal) =>
    uploadFile<T>(path, file, signal),
};
