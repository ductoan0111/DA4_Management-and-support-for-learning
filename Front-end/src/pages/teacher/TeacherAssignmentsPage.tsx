import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherAssignmentsApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherAssignmentDto, TeacherSectionDto } from '../../api/teacher-types';

export default function TeacherAssignmentsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId, { status: 1 }).then(setSections);
  }, [profile]);

  useEffect(() => {
    if (!profile || sections.length === 0) return;
    const secs = filterSection ? [{ sectionId: Number(filterSection) }] : sections;
    setLoading(true);
    Promise.all(secs.map(s => teacherAssignmentsApi.list(profile.teacherId, s.sectionId)))
      .then(results => setAssignments(results.flat().sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime())))
      .finally(() => setLoading(false));
  }, [profile, sections, filterSection]);

  const now = new Date();

  return (
    <div>
      <div className="teacher-topbar">
        <h1>Tất cả bài tập</h1>
        <select style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.875rem' }}
          value={filterSection} onChange={e => setFilterSection(e.target.value)}>
          <option value="">Tất cả lớp HP</option>
          {sections.map(s => <option key={s.sectionId} value={s.sectionId}>{s.sectionCode} — {s.courseName}</option>)}
        </select>
      </div>
      <div className="teacher-content">
        {loading ? <div className="admin-loading">Đang tải…</div> : assignments.length === 0 ? (
          <div className="empty-state"><div className="icon">📝</div><div>Không có bài tập</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignments.map(a => {
              const due = new Date(a.dueAt);
              const isOverdue = due < now;
              return (
                <div key={a.assignmentId} style={{
                  background: '#fff', borderRadius: 10, padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                  borderLeft: `4px solid ${isOverdue ? '#dc2626' : a.isPublished ? '#16a34a' : '#ca8a04'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{a.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                        📚 {a.courseCode} · {a.sectionCode} ·
                        📅 Hạn: <span style={{ color: isOverdue ? '#dc2626' : '#1e293b', fontWeight: 600 }}>{due.toLocaleString('vi-VN')}</span>
                        {isOverdue && ' ⚠️'}
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.75rem' }}>
                        <span>🎯 Max: <strong>{a.maxScore}đ</strong></span>
                        <span>📬 Nộp: <strong>{a.totalSubmissions}</strong></span>
                        <span>✅ Chấm: <strong>{a.gradedSubmissions}/{a.totalSubmissions}</strong></span>
                        {a.allowLateSubmission && <span>⏰ Cho phép trễ</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <span className={`badge ${a.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {a.isPublished ? '✓ Đã đăng' : '⏸ Nháp'}
                      </span>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/teacher/sections/${a.sectionId}`, { state: { tab: 'assignments' } })}>
                        Xem lớp →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
