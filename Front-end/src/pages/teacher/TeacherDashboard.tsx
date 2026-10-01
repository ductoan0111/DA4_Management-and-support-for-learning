import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherSectionDto } from '../../api/teacher-types';

const STATUS_LABEL: Record<number, string> = { 0: 'Đã đóng', 1: 'Đang mở', 2: 'Kết thúc' };
const STATUS_BADGE: Record<number, string> = { 0: 'badge-danger', 1: 'badge-success', 2: 'badge-gray' };
const DAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function TeacherDashboard() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId).then(setSections).finally(() => setLoading(false));
  }, [profile]);

  const activeSections = sections.filter(s => s.status === 1);
  const totalStudents = sections.reduce((acc, s) => acc + s.enrolledCount, 0);

  if (!profile) return null;

  return (
    <div>
      <div className="teacher-topbar">
        <h1>Xin chào, {profile.fullName} 👋</h1>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>
      <div className="teacher-content">
        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>📋</div>
            <div className="stat-info">
              <div className="value">{sections.length}</div>
              <div className="label">Tổng lớp HP</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
            <div className="stat-info">
              <div className="value">{activeSections.length}</div>
              <div className="label">Đang mở</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef9c3' }}>🎓</div>
            <div className="stat-info">
              <div className="value">{totalStudents}</div>
              <div className="label">Tổng sinh viên</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f3e8ff' }}>🏛️</div>
            <div className="stat-info">
              <div className="value" style={{ fontSize: '1rem' }}>{profile.academicTitle ?? '—'}</div>
              <div className="label">{profile.departmentName}</div>
            </div>
          </div>
        </div>

        {/* Lớp học phần đang mở */}
        <div className="card">
          <div className="card-header">
            <h2>Lớp học phần đang mở</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/sections')}>
              Xem tất cả →
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {loading ? (
              <div className="admin-loading">Đang tải…</div>
            ) : activeSections.length === 0 ? (
              <div className="empty-state"><div className="icon">📭</div><div>Không có lớp đang mở</div></div>
            ) : (
              <div className="section-grid" style={{ paddingTop: '1rem' }}>
                {activeSections.slice(0, 6).map(s => (
                  <div key={s.sectionId} className="section-card"
                    onClick={() => navigate(`/teacher/sections/${s.sectionId}`)}>
                    <div className="section-code">{s.sectionCode} {s.isPrimary && '⭐'}</div>
                    <div className="section-name">{s.courseName}</div>
                    <div className="section-meta">
                      <span className="meta-tag">{s.semesterName}</span>
                      <span className="meta-tag">{s.credits} TC</span>
                      {s.isPrimary && <span className="meta-tag primary">GV Chính</span>}
                    </div>
                    <div className="section-footer">
                      <span className="enrolled-badge">👥 {s.enrolledCount}/{s.maxStudents ?? '∞'} SV</span>
                      <span className={`badge ${STATUS_BADGE[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { STATUS_LABEL, STATUS_BADGE, DAY_VI };
