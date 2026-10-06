// Port 5113  → dùng khi chạy bằng "dotnet run" hoặc VS profile "http"
// Port 62225 → dùng khi chạy bằng VS profile "IIS Express"
// Đổi qua file Front-end/.env.local:  VITE_API_URL=http://localhost:62225
const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5113';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function setToken(token: string): void {
  localStorage.setItem('admin_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('admin_token');
}

export class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`API Error ${status}`);
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra'): string {
  if (!(error instanceof ApiError)) return fallback;
  const data = error.data as {
    message?: unknown;
    title?: unknown;
    errors?: Record<string, string[]>;
  } | null;
  if (typeof data?.message === 'string' && data.message) return data.message;
  const validationMessages = data?.errors ? Object.values(data.errors).flat().filter(Boolean) : [];
  if (validationMessages.length > 0) return validationMessages.join(' ');
  if (typeof data?.title === 'string' && data.title) return data.title;
  return `Lỗi ${error.status}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (res.status === 401 && path.startsWith('/api/admin/') && path !== '/api/admin/auth/login') {
      clearToken();
      localStorage.removeItem('admin_user');
      if (window.location.pathname !== '/admin/login') window.location.assign('/admin/login');
    }
    throw new ApiError(res.status, data);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
