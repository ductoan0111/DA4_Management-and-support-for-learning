import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherGradesApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherGradeOverviewDto } from '../../api/teacher-types';

export default function TeacherGradesPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState<(TeacherGradeOverviewDto & { sectionCode: string; courseName: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId, { status: 1 }).then(async secs => {
      const results = await Promise.all(
        secs.map(s =>
          teacherGradesApi.overview(profile.teacherId, s.sectionId)
            .then(o => ({ ...o, sectionCode: s.sectionCode, courseName: s.courseName }))
            .catch(() => null)
        )
      );
      setOverviews(results.filter(Boolean) as typeof overviews);
      setLoading(false);
    });
  }, [profile]);

  const letterColor = (l?: string | null) => {
    const map: Record<string, string> = { A: '#16a34a', 'B+': '#2563eb', B: '#0284c7', 'C+': '#7c3aed', C: '#ca8a04', 'D+': '#ea580c', D: '#dc2626', F: '#991b1b' };
    return map[l ?? ''] ?? '#64748b';
  };

  return (
    <div>
      <div className="teacher-topbar"><h1>Tổng quan điểm số</h1></div>
      <div className="teacher-content">
        {loading ? <div className="admin-loading">Đang tải…</div> : overviews.length === 0 ? (
          <div className="empty-state"><div className="icon">📊</div><div>Không có lớp đang mở</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {overviews.map(o => (
              <div key={o.sectionId} className="card">
                <div className="card-header">
                  <div>
                    <h2>{o.sectionCode} — {o.courseName}</h2>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                      {o.componentCount} thành phần · Tổng trọng số: {' '}
                      <strong style={{ color: o.totalWeightPercent === 100 ? '#16a34a' : '#dc2626' }}>
                        {o.totalWeightPercent}%
                      </strong>
                      {o.totalWeightPercent === 100 && <span style={{ color: '#16a34a' }}> ✓ Sẵn sàng</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                      <div>✅ {o.finalizedStudents}/{o.totalStudents} đã có điểm TK</div>
                    </div>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/teacher/sections/${o.sectionId}`, { state: { tab: 'grades' } })}>
                      Nhập điểm →
                    </button>
                  </div>
                </div>
                {o.students.length > 0 && (
                  <div className="card-body" style={{ paddingTop: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Mã SV</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Họ tên</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Điểm ước tính</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Điểm TK</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Xếp loại</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Đã nhập</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.students.slice(0, 5).map(s => (
                            <tr key={s.studentId} style={{ borderTop: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.5rem 0.75rem' }}><span className="badge badge-info">{s.studentCode}</span></td>
                              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{s.fullName}</td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{s.calculatedScore10.toFixed(2)}</td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>{s.finalScore10?.toFixed(2) ?? '—'}</td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 800, color: letterColor(s.letterGrade) }}>{s.letterGrade ?? '—'}</td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                {s.gradedComponents}/{s.totalComponents}
                                <div style={{ height: 4, background: '#e2e8f0', borderRadius: 999, marginTop: 3 }}>
                                  <div style={{ height: '100%', borderRadius: 999, background: s.gradedComponents === s.totalComponents ? '#16a34a' : '#2563eb', width: `${s.totalComponents > 0 ? (s.gradedComponents / s.totalComponents) * 100 : 0}%` }} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {o.students.length > 5 && (
                        <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                          + {o.students.length - 5} sinh viên khác...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
