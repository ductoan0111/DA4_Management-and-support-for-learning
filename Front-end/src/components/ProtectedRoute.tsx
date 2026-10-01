import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="admin-loading">Đang kiểm tra phiên đăng nhập…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
