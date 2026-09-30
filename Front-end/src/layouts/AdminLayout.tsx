import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../admin.css';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { section: 'Người dùng' },
  { to: '/admin/users', label: 'Tài khoản', icon: '👤' },
  { to: '/admin/teachers', label: 'Giảng viên', icon: '🧑‍🏫' },
  { to: '/admin/students', label: 'Sinh viên', icon: '🎓' },
  { section: 'Học thuật' },
  { to: '/admin/departments', label: 'Khoa', icon: '🏛️' },
  { to: '/admin/majors', label: 'Ngành', icon: '📚' },
  { to: '/admin/academic-classes', label: 'Lớp hành chính', icon: '🏫' },
  { to: '/admin/courses', label: 'Môn học', icon: '📖' },
  { section: 'Đào tạo' },
  { to: '/admin/semesters', label: 'Học kỳ', icon: '📅' },
  { to: '/admin/course-sections', label: 'Lớp học phần', icon: '📋' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>🎓 EduAdmin</h2>
          <p>Hệ thống quản lý</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('section' in item) {
              return <div key={i} className="nav-section">{item.section}</div>;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}</div>
          <div className="info">
            <div className="name">{user?.fullName ?? user?.username}</div>
            <div className="role">{user?.roleCode}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">⏻</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
