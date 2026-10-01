import { Navigate } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';

export function ProtectedTeacherRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useTeacherAuth();
  if (loading) return <div className="admin-loading" style={{ padding: '4rem', textAlign: 'center' }}>⏳ Đang xác thực…</div>;
  return profile ? <>{children}</> : <Navigate to="/teacher/login" replace />;
}
