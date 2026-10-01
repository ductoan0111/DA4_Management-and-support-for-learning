import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherMaterialsApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherMaterialDto, TeacherSectionDto } from '../../api/teacher-types';

const MATERIAL_ICONS: Record<string, string> = {
  slide: '📊', pdf: '📄', video: '🎬', doc: '📝', other: '📁',
};

export default function TeacherMaterialsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [materials, setMaterials] = useState<TeacherMaterialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId).then(setSections);
  }, [profile]);

  useEffect(() => {
    if (!profile || sections.length === 0) return;
    const secs = filterSection ? [{ sectionId: Number(filterSection) }] : sections;
    setLoading(true);
    Promise.all(secs.map(s => teacherMaterialsApi.list(profile.teacherId, s.sectionId, search || undefined)))
      .then(results => setMaterials(results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .finally(() => setLoading(false));
  }, [profile, sections, filterSection, search]);

  return (
    <div>
      <div className="teacher-topbar">
        <h1>Kho tài liệu</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            placeholder="Tìm kiếm…" value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            value={filterSection} onChange={e => setFilterSection(e.target.value)}>
            <option value="">Tất cả lớp</option>
            {sections.map(s => <option key={s.sectionId} value={s.sectionId}>{s.sectionCode}</option>)}
          </select>
        </div>
      </div>
      <div className="teacher-content">
        {loading ? <div className="admin-loading">Đang tải…</div> : materials.length === 0 ? (
          <div className="empty-state"><div className="icon">📚</div><div>Không có tài liệu</div></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {materials.map(m => (
              <div key={m.materialId} style={{ background: '#fff', borderRadius: 10, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                    {MATERIAL_ICONS[m.materialType ?? 'other'] ?? '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📚 {m.courseCode} · {m.sectionCode}</div>
                    {m.description && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>{m.description}</div>}
                    <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">📎 Tải file</a>}
                      {m.externalUrl && <a href={m.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🔗 Mở link</a>}
                      <span className={`badge ${m.isVisible ? 'badge-success' : 'badge-gray'}`} style={{ marginLeft: 'auto' }}>
                        {m.isVisible ? '👁️ Hiện' : '🙈 Ẩn'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(m.createdAt).toLocaleDateString('vi-VN')}</span>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/teacher/sections/${m.sectionId}`, { state: { tab: 'materials' } })}>
                    Xem lớp →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
