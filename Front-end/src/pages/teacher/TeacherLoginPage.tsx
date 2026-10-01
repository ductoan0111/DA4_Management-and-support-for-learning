import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import '../../teacher.css';

export default function TeacherLoginPage() {
  const { login } = useTeacherAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/teacher', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'NOT_TEACHER') setError('Tài khoản này không có quyền giảng viên.');
        else if (err.message === 'TEACHER_PROFILE_NOT_FOUND') setError('Chưa có hồ sơ giảng viên cho tài khoản này.');
        else setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      } else {
        setError('Lỗi kết nối. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-login">
      <div className="teacher-login-card">
        <div className="teacher-login-header">
          <div className="icon">🧑‍🏫</div>
          <h1>Cổng Giảng Viên</h1>
          <p>Đăng nhập để quản lý lớp học</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input id="username" type="text" value={username}
              onChange={e => setUsername(e.target.value)} placeholder="Nhập username" required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Đang đăng nhập…' : '🚀 Đăng nhập'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          Dành riêng cho giảng viên · <a href="/admin/login" style={{ color: '#2563eb' }}>Admin →</a>
        </div>
      </div>
    </div>
  );
}
