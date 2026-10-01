import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, setToken, clearToken, ApiError } from '../api/client';
import type { TeacherProfileDto } from '../api/teacher-types';

interface TeacherAuthState {
  profile: TeacherProfileDto | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const TeacherAuthContext = createContext<TeacherAuthState>(null!);

const TEACHER_TOKEN_KEY = 'teacher_token';
const TEACHER_PROFILE_KEY = 'teacher_profile';

export function TeacherAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<TeacherProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TEACHER_TOKEN_KEY);
    const saved = localStorage.getItem(TEACHER_PROFILE_KEY);
    if (!token || !saved) { setLoading(false); return; }

    // Restore token for the api client & validate
    setToken(token);
    const p = JSON.parse(saved) as TeacherProfileDto;

    api.get<TeacherProfileDto>(`/api/teachers/${p.teacherId}/profile`)
      .then(fresh => { setProfile(fresh); localStorage.setItem(TEACHER_PROFILE_KEY, JSON.stringify(fresh)); })
      .catch((e: ApiError) => {
        if (e.status === 401 || e.status === 403) {
          localStorage.removeItem(TEACHER_TOKEN_KEY);
          clearToken();
        } else {
          // network error – restore from cache
          setProfile(p);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    // Dùng endpoint /api/auth/login — cho phép tất cả roles (TEACHER, STUDENT, ADMIN)
    const res = await api.post<{
      userId: number; roleId: number; roleCode: string; roleName: string;
      studentId: number | null; teacherId: number | null;
      identifier: string; fullName: string; email: string;
      phone: string | null; avatarUrl: string | null; token: string;
    }>('/api/auth/login', { identifier: username, password, role: 'TEACHER' });

    if (res.roleCode !== 'TEACHER') {
      throw new Error('NOT_TEACHER');
    }
    if (!res.teacherId) {
      throw new Error('TEACHER_PROFILE_NOT_FOUND');
    }

    setToken(res.token);
    localStorage.setItem(TEACHER_TOKEN_KEY, res.token);

    const p = await api.get<TeacherProfileDto>(`/api/teachers/${res.teacherId}/profile`);
    setProfile(p);
    localStorage.setItem(TEACHER_PROFILE_KEY, JSON.stringify(p));
  };

  const logout = () => {
    localStorage.removeItem(TEACHER_TOKEN_KEY);
    localStorage.removeItem(TEACHER_PROFILE_KEY);
    clearToken();
    setProfile(null);
  };

  return (
    <TeacherAuthContext.Provider value={{ profile, loading, login, logout }}>
      {children}
    </TeacherAuthContext.Provider>
  );
}

export function useTeacherAuth() {
  return useContext(TeacherAuthContext);
}
