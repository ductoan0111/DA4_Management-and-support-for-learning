// Port 5113  → dùng khi chạy bằng "dotnet run" hoặc VS profile "http"
// Port 62225 → dùng khi chạy bằng VS profile "IIS Express"
// Đổi qua file Front-end/.env.local:  VITE_API_URL=http://localhost:62225
const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5113';

function getToken(path: string): string | null {
  if (path.startsWith('/api/teachers/')) {
    return localStorage.getItem('teacher_token') ?? localStorage.getItem('admin_token');
  }
  if (path.startsWith('/api/admin/')) {
    return localStorage.getItem('admin_token');
  }
  if (window.location.pathname.startsWith('/teacher')) {
    return localStorage.getItem('teacher_token') ?? localStorage.getItem('admin_token');
  }
  return localStorage.getItem('admin_token') ?? localStorage.getItem('teacher_token');
}

export function setToken(token: string): void {
  localStorage.setItem('admin_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('admin_token');
}

export function setTeacherToken(token: string): void {
  localStorage.setItem('teacher_token', token);
}

export function clearTeacherToken(): void {
  localStorage.removeItem('teacher_token');
  localStorage.removeItem('teacher_profile');
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
  const token = getToken(path);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (res.status === 401) {
      if (path.startsWith('/api/admin/') && path !== '/api/admin/auth/login') {
        clearToken();
        localStorage.removeItem('admin_user');
        if (window.location.pathname !== '/admin/login') window.location.assign('/admin/login');
      } else if (path.startsWith('/api/teachers/')) {
        clearTeacherToken();
        if (window.location.pathname !== '/teacher/login') window.location.assign('/teacher/login');
      }
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
