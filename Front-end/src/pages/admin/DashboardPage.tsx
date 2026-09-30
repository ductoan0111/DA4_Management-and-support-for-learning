import { useEffect, useState } from 'react';
import { statisticsApi } from '../../api/services';
import type { AdminStatisticsDto } from '../../api/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statisticsApi.get().then(setStats).finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Tổng tài khoản', value: stats.totalUsers, sub: `${stats.activeUsers} đang hoạt động`, icon: '👤', color: '#dbeafe', iconColor: '#2563eb' },
        { label: 'Sinh viên', value: stats.totalStudents, sub: `${stats.activeStudents} đang học`, icon: '🎓', color: '#dcfce7', iconColor: '#16a34a' },
        { label: 'Giảng viên', value: stats.totalTeachers, sub: `${stats.activeTeachers} đang công tác`, icon: '🧑‍🏫', color: '#fef9c3', iconColor: '#ca8a04' },
        { label: 'Môn học', value: stats.totalCourses, sub: 'Tổng số môn', icon: '📖', color: '#f3e8ff', iconColor: '#7c3aed' },
        { label: 'Lớp học phần', value: stats.totalSections, sub: `${stats.openSections} đang mở`, icon: '📋', color: '#fce7f3', iconColor: '#db2777' },
        { label: 'Học kỳ', value: stats.totalSemesters, sub: 'Tổng số học kỳ', icon: '📅', color: '#e0f2fe', iconColor: '#0284c7' },
        { label: 'Lượt đăng ký', value: stats.activeEnrollments, sub: 'Đang học', icon: '📝', color: '#ffedd5', iconColor: '#ea580c' },
      ]
    : [];

  return (
    <div>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">Đang tải thống kê…</div>
        ) : (
          <>
            <div className="stats-grid">
              {cards.map(c => (
                <div key={c.label} className="stat-card">
                  <div className="stat-icon" style={{ background: c.color }}>
                    {c.icon}
                  </div>
                  <div className="stat-info">
                    <div className="value">{c.value.toLocaleString()}</div>
                    <div className="label">{c.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-header"><h2>Tổng quan hệ thống</h2></div>
              <div className="card-body">
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Hệ thống đang hoạt động bình thường. Sử dụng menu bên trái để quản lý tài khoản, hồ sơ, và dữ liệu học thuật.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
