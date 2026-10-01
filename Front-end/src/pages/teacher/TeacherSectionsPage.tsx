import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherSectionDto } from '../../api/teacher-types';

const STATUS_LABEL: Record<number, string> = { 0: 'Đã đóng', 1: 'Đang mở', 2: 'Kết thúc' };
const STATUS_BADGE: Record<number, string> = { 0: 'badge-danger', 1: 'badge-success', 2: 'badge-gray' };

export default function TeacherSectionsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!profile) return;
    const params = filterStatus !== '' ? { status: Number(filterStatus) } : undefined;
    setLoading(true);
    teacherSectionsApi.list(profile.teacherId, params).then(setSections).finally(() => setLoading(false));
  }, [profile, filterStatus]);

  // Group by academic year
  const grouped = sections.reduce((acc, s) => {
    const key = `${s.academicYear} – ${s.semesterName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, TeacherSectionDto[]>);

  return (
    <div>
      <div className="teacher-topbar">
        <h1>Lớp học phần của tôi</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang mở</option>
            <option value="0">Đã đóng</option>
            <option value="2">Kết thúc</option>
          </select>
        </div>
      </div>
      <div className="teacher-content">
        {loading ? (
          <div className="admin-loading">Đang tải…</div>
        ) : sections.length === 0 ? (
          <div className="empty-state"><div className="icon">📭</div><div>Không có lớp học phần</div></div>
        ) : (
          Object.entries(grouped).map(([groupKey, items]) => (
            <div key={groupKey} style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#475569', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📅 {groupKey}
              </h3>
              <div className="section-grid">
                {items.map(s => (
                  <div key={s.sectionId} className="section-card"
                    onClick={() => navigate(`/teacher/sections/${s.sectionId}`)}>
                    <div className="section-code">{s.sectionCode} {s.isPrimary && '⭐'}</div>
                    <div className="section-name">{s.courseName}</div>
                    <div className="section-meta">
                      <span className="meta-tag">{s.courseCode}</span>
                      <span className="meta-tag">{s.credits} tín chỉ</span>
                      {s.isPrimary && <span className="meta-tag primary">GV Chính</span>}
                    </div>
                    <div className="section-footer">
                      <span className="enrolled-badge">👥 {s.enrolledCount}/{s.maxStudents ?? '∞'} sinh viên</span>
                      <span className={`badge ${STATUS_BADGE[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
