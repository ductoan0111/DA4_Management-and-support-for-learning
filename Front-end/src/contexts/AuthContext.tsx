import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, setToken, clearToken, ApiError } from '../api/client';
import type { AdminUserDto, LoginRequest, LoginResponse } from '../api/types';

interface AuthState {
  user: AdminUserDto | null;
  loading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserDto | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('admin_token')));

  useEffect(() => {
    // Try to restore session by checking if token exists
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    // Validate token by calling statistics (lightweight)
    api.get<{ totalUsers: number }>('/api/admin/statistics')
      .then(() => {
        // Token valid – restore saved user info
        const saved = localStorage.getItem('admin_user');
        if (saved) setUser(JSON.parse(saved));
      })
      .catch((e: ApiError) => {
        if (e.status === 401 || e.status === 403) {
          clearToken();
          localStorage.removeItem('admin_user');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (req: LoginRequest) => {
    const res = await api.post<LoginResponse>('/api/admin/auth/login', req);
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('admin_user', JSON.stringify(res.user));
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
