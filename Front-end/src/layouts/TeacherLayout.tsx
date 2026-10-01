import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import '../teacher.css';
import '../admin.css';

const navItems = [
  { to: '/teacher', label: 'Tổng quan', icon: '🏠', end: true },
  { section: 'Lớp học phần' },
  { to: '/teacher/sections', label: 'Lớp của tôi', icon: '📋' },
  { to: '/teacher/schedule', label: 'Lịch dạy', icon: '📅' },
  { section: 'Quản lý' },
  { to: '/teacher/assignments', label: 'Bài tập', icon: '📝' },
  { to: '/teacher/materials', label: 'Tài liệu', icon: '📚' },
  { to: '/teacher/grades', label: 'Điểm số', icon: '📊' },
  { to: '/teacher/announcements', label: 'Thông báo', icon: '📢' },
  { section: 'Tài khoản' },
  { to: '/teacher/profile', label: 'Hồ sơ', icon: '👤' },
];

export default function TeacherLayout() {
  const { profile, logout } = useTeacherAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/teacher/login', { replace: true });
  };

  return (
    <div className="teacher-shell">
      <aside className="teacher-sidebar">
        <div className="sidebar-logo">
          <h2>🧑‍🏫 Teacher Portal</h2>
          <p>{profile?.departmentName ?? 'Hệ thống giảng dạy'}</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('section' in item) return <div key={i} className="nav-section">{item.section}</div>;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <span className="icon">{item.icon}</span>{item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{profile?.fullName?.charAt(0)?.toUpperCase() ?? 'G'}</div>
          <div className="info">
            <div className="name">{profile?.fullName ?? 'Giảng viên'}</div>
            <div className="role">{profile?.academicTitle ?? profile?.teacherCode ?? ''}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">⏻</button>
        </div>
      </aside>
      <main className="teacher-main">
        <Outlet />
      </main>
    </div>
  );
}
