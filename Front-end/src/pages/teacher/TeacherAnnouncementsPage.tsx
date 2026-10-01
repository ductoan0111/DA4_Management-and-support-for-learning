import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherAnnouncementsApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherAnnouncementDto, TeacherSectionDto } from '../../api/teacher-types';

const ANN_TYPE: Record<number, string> = { 0: '📢 Chung', 1: '📝 Bài tập', 2: '📋 Thi cử', 3: 'ℹ️ Khác' };
const ANN_COLOR: Record<number, string> = { 0: '#dbeafe', 1: '#fef9c3', 2: '#fee2e2', 3: '#f3e8ff' };

export default function TeacherAnnouncementsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId).then(setSections);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    teacherAnnouncementsApi.list(profile.teacherId, filterSection ? Number(filterSection) : undefined)
      .then(setAnnouncements).finally(() => setLoading(false));
  }, [profile, filterSection]);

  return (
    <div>
      <div className="teacher-topbar">
        <h1>Thông báo</h1>
        <select style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.875rem' }}
          value={filterSection} onChange={e => setFilterSection(e.target.value)}>
          <option value="">Tất cả lớp</option>
          {sections.map(s => <option key={s.sectionId} value={s.sectionId}>{s.sectionCode}</option>)}
        </select>
      </div>
      <div className="teacher-content">
        {loading ? <div className="admin-loading">Đang tải…</div> : announcements.length === 0 ? (
          <div className="empty-state"><div className="icon">📢</div><div>Chưa có thông báo</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {announcements.map(a => (
              <div key={a.announcementId} style={{
                background: '#fff', borderRadius: 10, padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                borderLeft: `4px solid ${ANN_COLOR[a.announcementType]}`,
                opacity: a.isActive ? 1 : 0.6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                      <span style={{ background: ANN_COLOR[a.announcementType], padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
                        {ANN_TYPE[a.announcementType]}
                      </span>
                      {a.sectionCode && <span className="badge badge-info">{a.sectionCode}</span>}
                      {!a.isActive && <span className="badge badge-gray">Ẩn</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{a.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      🕐 {new Date(a.publishedAt).toLocaleString('vi-VN')}
                      {a.expiresAt && ` · Hết hạn: ${new Date(a.expiresAt).toLocaleString('vi-VN')}`}
                    </div>
                    <div style={{ marginTop: '0.5rem', color: '#374151', fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {a.content.length > 200 ? a.content.substring(0, 200) + '…' : a.content}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, marginLeft: '1rem' }}>
                    {a.sectionId && (
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/teacher/sections/${a.sectionId}`, { state: { tab: 'announcements' } })}>
                        Xem lớp →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
