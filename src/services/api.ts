import { isStaticMode } from '../lib/static-mode';
import { handleMockApi } from '../mocks/api';

const API_BASE = '/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (isStaticMode) {
    return (await handleMockApi(endpoint, options)) as T;
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    retryable?: boolean;
  };
  if (!response.ok) {
    const err = new Error(data.error || `Request failed with status ${response.status}`) as Error & {
      retryable?: boolean;
      status?: number;
    };
    err.retryable = data.retryable !== false;
    err.status = response.status;
    throw err;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
  contact: {
    submitInquiry: (payload: {
      name: string;
      email: string;
      category: string;
      message: string;
    }) =>
      apiFetch<{ ok: boolean; ticketId: string }>('/contact/inquiry', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  }
};
