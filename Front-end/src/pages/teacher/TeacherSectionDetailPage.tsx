import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import {
  teacherSectionsApi, teacherAssignmentsApi, teacherMaterialsApi,
  teacherGradesApi, teacherAnnouncementsApi, teacherStudentsApi,
} from '../../api/teacher-services';
import type {
  TeacherSectionDetailDto, TeacherSectionStudentDto, TeacherAssignmentDto,
  TeacherMaterialDto, TeacherGradeComponentDto, TeacherStudentGradeDto,
  TeacherGradeOverviewDto, TeacherAnnouncementDto,
  CreateAssignmentRequest, CreateMaterialRequest,
  SaveGradeComponentRequest, CreateAnnouncementRequest,
} from '../../api/teacher-types';
import { ApiError } from '../../api/client';

const STATUS_LABEL: Record<number, string> = { 0: 'Đã đóng', 1: 'Đang mở', 2: 'Kết thúc' };
const STATUS_BADGE: Record<number, string> = { 0: 'badge-danger', 1: 'badge-success', 2: 'badge-gray' };
const DAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const ANN_TYPE: Record<number, string> = { 0: 'Chung', 1: 'Bài tập', 2: 'Thi cử', 3: 'Khác' };

type Tab = 'info' | 'students' | 'assignments' | 'materials' | 'grades' | 'announcements';

export default function TeacherSectionDetailPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();

  const tid = profile?.teacherId ?? 0;
  const sid = Number(sectionId);

  const [tab, setTab] = useState<Tab>('info');
  const [section, setSection] = useState<TeacherSectionDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Per-tab data
  const [students, setStudents] = useState<TeacherSectionStudentDto[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentDto[]>([]);
  const [materials, setMaterials] = useState<TeacherMaterialDto[]>([]);
  const [gradeComponents, setGradeComponents] = useState<TeacherGradeComponentDto[]>([]);
  const [grades, setGrades] = useState<TeacherStudentGradeDto[]>([]);
  const [gradeOverview, setGradeOverview] = useState<TeacherGradeOverviewDto | null>(null);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncementDto[]>([]);

  // Modals
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeacherAssignmentDto | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<CreateAssignmentRequest>({
    title: '', dueAt: '', maxScore: 10, allowLateSubmission: false, isPublished: true,
  });

  const [materialModal, setMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TeacherMaterialDto | null>(null);
  const [materialForm, setMaterialForm] = useState<CreateMaterialRequest>({
    title: '', isVisible: true,
  });

  const [componentModal, setComponentModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<TeacherGradeComponentDto | null>(null);
  const [componentForm, setComponentForm] = useState<SaveGradeComponentRequest>({
    componentName: '', weightPercent: 10, maxScore: 10, displayOrder: 1,
  });

  const [announcementModal, setAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<TeacherAnnouncementDto | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<CreateAnnouncementRequest>({
    title: '', content: '', announcementType: 0, isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Grade editing inline
  const [editingGrade, setEditingGrade] = useState<{ studentId: number; componentId: number } | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [gradeNote, setGradeNote] = useState('');

  useEffect(() => {
    if (!tid || !sid) return;
    teacherSectionsApi.get(tid, sid).then(s => { setSection(s); setLoading(false); }).catch(() => setLoading(false));
  }, [tid, sid]);

  const loadTab = useCallback(async (t: Tab) => {
    if (!tid || !sid) return;
    if (t === 'students' && students.length === 0) {
      teacherStudentsApi.list(tid, sid).then(setStudents);
    }
    if (t === 'assignments') teacherAssignmentsApi.list(tid, sid).then(setAssignments);
    if (t === 'materials') teacherMaterialsApi.list(tid, sid).then(setMaterials);
    if (t === 'grades') {
      teacherGradesApi.components(tid, sid).then(setGradeComponents);
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    }
    if (t === 'announcements') teacherAnnouncementsApi.list(tid, sid).then(setAnnouncements);
  }, [tid, sid]);

  const switchTab = (t: Tab) => { setTab(t); loadTab(t); };

  // Assignment CRUD
  const openAddAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm({ title: '', dueAt: '', maxScore: 10, allowLateSubmission: false, isPublished: true });
    setFormError(''); setAssignmentModal(true);
  };
  const openEditAssignment = (a: TeacherAssignmentDto) => {
    setEditingAssignment(a);
    setAssignmentForm({ title: a.title, description: a.description ?? '', attachmentUrl: a.attachmentUrl ?? '',
      openAt: a.openAt ? a.openAt.substring(0, 16) : '', dueAt: a.dueAt.substring(0, 16),
      maxScore: a.maxScore, allowLateSubmission: a.allowLateSubmission, isPublished: a.isPublished });
    setFormError(''); setAssignmentModal(true);
  };
  const saveAssignment = async () => {
    setSaving(true); setFormError('');
    try {
      if (editingAssignment) await teacherAssignmentsApi.update(tid, sid, editingAssignment.assignmentId, assignmentForm);
      else await teacherAssignmentsApi.create(tid, sid, assignmentForm);
      setAssignmentModal(false);
      teacherAssignmentsApi.list(tid, sid).then(setAssignments);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };
  const deleteAssignment = async (a: TeacherAssignmentDto) => {
    if (!confirm('Xóa bài tập này?')) return;
    await teacherAssignmentsApi.delete(tid, sid, a.assignmentId);
    teacherAssignmentsApi.list(tid, sid).then(setAssignments);
  };

  // Material CRUD
  const openAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({ title: '', isVisible: true });
    setFormError(''); setMaterialModal(true);
  };
  const openEditMaterial = (m: TeacherMaterialDto) => {
    setEditingMaterial(m);
    setMaterialForm({ title: m.title, description: m.description ?? '', materialType: m.materialType ?? '',
      fileUrl: m.fileUrl ?? '', externalUrl: m.externalUrl ?? '', isVisible: m.isVisible });
    setFormError(''); setMaterialModal(true);
  };
  const saveMaterial = async () => {
    setSaving(true); setFormError('');
    try {
      if (editingMaterial) await teacherMaterialsApi.update(tid, sid, editingMaterial.materialId, materialForm);
      else await teacherMaterialsApi.create(tid, sid, materialForm);
      setMaterialModal(false);
      teacherMaterialsApi.list(tid, sid).then(setMaterials);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };
  const deleteMaterial = async (m: TeacherMaterialDto) => {
    if (!confirm('Xóa tài liệu này?')) return;
    await teacherMaterialsApi.delete(tid, sid, m.materialId);
    teacherMaterialsApi.list(tid, sid).then(setMaterials);
  };

  // Grade component CRUD
  const openAddComponent = () => {
    setEditingComponent(null);
    setComponentForm({ componentName: '', weightPercent: 10, maxScore: 10, displayOrder: gradeComponents.length + 1 });
    setFormError(''); setComponentModal(true);
  };
  const openEditComponent = (c: TeacherGradeComponentDto) => {
    setEditingComponent(c);
    setComponentForm({ componentName: c.componentName, weightPercent: Number(c.weightPercent), maxScore: Number(c.maxScore), displayOrder: c.displayOrder });
    setFormError(''); setComponentModal(true);
  };
  const saveComponent = async () => {
    setSaving(true); setFormError('');
    try {
      if (editingComponent) await teacherGradesApi.updateComponent(tid, sid, editingComponent.gradeComponentId, componentForm);
      else await teacherGradesApi.createComponent(tid, sid, componentForm);
      setComponentModal(false);
      teacherGradesApi.components(tid, sid).then(setGradeComponents);
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };
  const deleteComponent = async (c: TeacherGradeComponentDto) => {
    if (!confirm('Xóa thành phần điểm này?')) return;
    try {
      await teacherGradesApi.deleteComponent(tid, sid, c.gradeComponentId);
      teacherGradesApi.components(tid, sid).then(setGradeComponents);
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    } catch (e) {
      alert(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi' : 'Lỗi');
    }
  };

  // Grade upsert
  const startEditGrade = (studentId: number, componentId: number, currentScore?: number | null, currentNote?: string | null) => {
    setEditingGrade({ studentId, componentId });
    setGradeInput(currentScore !== null && currentScore !== undefined ? String(currentScore) : '');
    setGradeNote(currentNote ?? '');
  };
  const saveGrade = async () => {
    if (!editingGrade) return;
    try {
      await teacherGradesApi.upsertGrade(tid, sid, editingGrade.studentId, {
        gradeComponentId: editingGrade.componentId,
        score: gradeInput !== '' ? Number(gradeInput) : undefined,
        note: gradeNote || undefined,
      });
      setEditingGrade(null);
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    } catch (e) {
      alert(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi' : 'Lỗi');
    }
  };

  const finalizeGrades = async () => {
    if (!confirm('Tính điểm tổng kết và lưu vào hệ thống?')) return;
    try {
      const res = await teacherGradesApi.finalize(tid, sid);
      setGradeOverview(res);
      alert('Đã tính điểm tổng kết thành công!');
    } catch (e) {
      alert(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi' : 'Lỗi');
    }
  };

  // Announcement CRUD
  const openAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', content: '', announcementType: 0, isActive: true });
    setFormError(''); setAnnouncementModal(true);
  };
  const openEditAnnouncement = (a: TeacherAnnouncementDto) => {
    setEditingAnnouncement(a);
    setAnnouncementForm({ title: a.title, content: a.content, announcementType: a.announcementType,
      expiresAt: a.expiresAt ? a.expiresAt.substring(0, 16) : undefined, isActive: a.isActive });
    setFormError(''); setAnnouncementModal(true);
  };
  const saveAnnouncement = async () => {
    setSaving(true); setFormError('');
    try {
      if (editingAnnouncement) await teacherAnnouncementsApi.update(tid, editingAnnouncement.announcementId, announcementForm);
      else await teacherAnnouncementsApi.create(tid, sid, announcementForm);
      setAnnouncementModal(false);
      teacherAnnouncementsApi.list(tid, sid).then(setAnnouncements);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };
  const deleteAnnouncement = async (a: TeacherAnnouncementDto) => {
    if (!confirm('Xóa thông báo này?')) return;
    await teacherAnnouncementsApi.delete(tid, a.announcementId);
    teacherAnnouncementsApi.list(tid, sid).then(setAnnouncements);
  };

  if (loading) return <div className="admin-loading" style={{ padding: '3rem' }}>Đang tải…</div>;
  if (!section) return <div className="admin-loading">Không tìm thấy lớp học phần.</div>;

  const totalWeight = gradeComponents.reduce((s, c) => s + Number(c.weightPercent), 0);

  // Build grade table: unique students x components
  const uniqueStudents = Array.from(new Map(grades.map(g => [g.studentId, { studentId: g.studentId, studentCode: g.studentCode, fullName: g.fullName }])).values());
  const gradeMap = new Map(grades.map(g => [`${g.studentId}-${g.gradeComponentId}`, g]));

  const letterColor = (l?: string | null) => {
    if (!l) return '';
    const map: Record<string, string> = { A: 'grade-A', 'B+': 'grade-Bp', B: 'grade-B', 'C+': 'grade-Cp', C: 'grade-C', 'D+': 'grade-Dp', D: 'grade-D', F: 'grade-F' };
    return map[l] ?? '';
  };

  return (
    <div>
      <div className="teacher-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/sections')}>← Quay lại</button>
          <h1>{section.sectionCode} — {section.courseName}</h1>
          <span className={`badge ${STATUS_BADGE[section.status]}`}>{STATUS_LABEL[section.status]}</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {section.semesterName} · {section.credits} TC · 👥 {section.enrolledCount}/{section.maxStudents ?? '∞'}
        </span>
      </div>

      <div className="teacher-content">
        {/* Tabs */}
        <div className="section-detail">
          <div className="detail-tabs">
            {([
              { key: 'info', label: '📋 Thông tin', },
              { key: 'students', label: '🎓 Sinh viên' },
              { key: 'assignments', label: '📝 Bài tập' },
              { key: 'materials', label: '📚 Tài liệu' },
              { key: 'grades', label: '📊 Điểm số' },
              { key: 'announcements', label: '📢 Thông báo' },
            ] as { key: Tab; label: string }[]).map(t => (
              <button key={t.key} className={`detail-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => switchTab(t.key)}>{t.label}</button>
            ))}
          </div>

          <div className="detail-content">

            {/* ── INFO ─────────────────────────────────────────────────────── */}
            {tab === 'info' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Thông tin môn học</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {[
                          ['Mã lớp HP', section.sectionCode],
                          ['Tên lớp HP', section.sectionName ?? '—'],
                          ['Mã môn', section.courseCode],
                          ['Tên môn', section.courseName],
                          ['Số tín chỉ', section.credits],
                          ['Học kỳ', section.semesterName],
                          ['Năm học', section.academicYear],
                          ['Sĩ số', `${section.enrolledCount} / ${section.maxStudents ?? '∞'}`],
                          ['Vai trò', section.isPrimary ? '⭐ Giảng viên chính' : 'Giảng viên phụ'],
                        ].map(([k, v]) => (
                          <tr key={String(k)}>
                            <td style={{ padding: '0.4rem 0', color: '#64748b', width: 130, fontWeight: 600, fontSize: '0.8rem' }}>{k}</td>
                            <td style={{ padding: '0.4rem 0', color: '#1e293b', fontSize: '0.875rem' }}>{String(v)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Thời khóa biểu</h3>
                    {section.schedules.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có lịch học</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {section.schedules.map(sch => (
                          <div key={sch.scheduleId} className="schedule-slot">
                            <div className="slot-time">{DAY_VI[sch.dayOfWeek]} · {sch.startTime.substring(0, 5)} – {sch.endTime.substring(0, 5)}</div>
                            <div className="slot-room">🏢 {sch.room ?? '—'} {sch.building ? `(${sch.building})` : ''}</div>
                            {sch.note && <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 2 }}>{sch.note}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STUDENTS ─────────────────────────────────────────────────── */}
            {tab === 'students' && (
              <div>
                <div style={{ marginBottom: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
                  {students.length} sinh viên đăng ký
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>#</th><th>Mã SV</th><th>Họ tên</th><th>Email</th><th>Số điện thoại</th></tr></thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Chưa có sinh viên</td></tr>
                      ) : students.map((s, i) => (
                        <tr key={s.studentId}>
                          <td>{i + 1}</td>
                          <td><span className="badge badge-info">{s.studentCode}</span></td>
                          <td>{s.fullName}</td>
                          <td>{s.email}</td>
                          <td>{s.phone ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ASSIGNMENTS ──────────────────────────────────────────────── */}
            {tab === 'assignments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{assignments.length} bài tập</div>
                  <button className="btn btn-primary btn-sm" onClick={openAddAssignment}>+ Tạo bài tập</button>
                </div>
                {assignments.length === 0 ? (
                  <div className="empty-state"><div className="icon">📝</div><div>Chưa có bài tập</div></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assignments.map(a => (
                      <div key={a.assignmentId} style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{a.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                              📅 Hạn nộp: {new Date(a.dueAt).toLocaleString('vi-VN')} ·
                              🎯 Max: {a.maxScore} điểm ·
                              📬 {a.totalSubmissions} bài nộp ({a.gradedSubmissions} đã chấm)
                            </div>
                            {a.description && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>{a.description}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                            <span className={`badge ${a.isPublished ? 'badge-success' : 'badge-warning'}`}>
                              {a.isPublished ? '✓ Đã đăng' : '⏸ Nháp'}
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditAssignment(a)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteAssignment(a)}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MATERIALS ────────────────────────────────────────────────── */}
            {tab === 'materials' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{materials.length} tài liệu</div>
                  <button className="btn btn-primary btn-sm" onClick={openAddMaterial}>+ Thêm tài liệu</button>
                </div>
                {materials.length === 0 ? (
                  <div className="empty-state"><div className="icon">📚</div><div>Chưa có tài liệu</div></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {materials.map(m => (
                      <div key={m.materialId} style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                              {m.materialType === 'video' ? '🎬' : m.materialType === 'slide' ? '📊' : '📄'} {m.title}
                            </div>
                            {m.description && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{m.description}</div>}
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                              {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">📎 File</a>}
                              {m.externalUrl && <a href={m.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🔗 Link</a>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span className={`badge ${m.isVisible ? 'badge-success' : 'badge-gray'}`}>{m.isVisible ? 'Hiện' : 'Ẩn'}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditMaterial(m)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteMaterial(m)}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── GRADES ───────────────────────────────────────────────────── */}
            {tab === 'grades' && (
              <div>
                {/* Components header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>Thành phần điểm</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: totalWeight === 100 ? '#16a34a' : '#dc2626' }}>
                      (Tổng trọng số: {totalWeight}%)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={openAddComponent}>+ Thêm thành phần</button>
                    {gradeOverview?.isReadyToFinalize && (
                      <button className="btn btn-primary btn-sm" onClick={finalizeGrades}>✅ Tính điểm TK</button>
                    )}
                  </div>
                </div>

                {gradeComponents.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {gradeComponents.map(c => (
                      <div key={c.gradeComponentId} style={{ background: '#eff6ff', borderRadius: 8, padding: '0.5rem 0.75rem', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1d4ed8' }}>{c.componentName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.weightPercent}% · Max {c.maxScore}đ</span>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#64748b' }} onClick={() => openEditComponent(c)}>✏️</button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#dc2626' }} onClick={() => deleteComponent(c)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grade table */}
                {gradeComponents.length > 0 && uniqueStudents.length > 0 && (
                  <div className="grade-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Mã SV</th>
                          <th>Họ tên</th>
                          {gradeComponents.map(c => <th key={c.gradeComponentId}>{c.componentName}<br/><span style={{ fontWeight: 400, fontSize: '0.7rem' }}>(/{c.maxScore})</span></th>)}
                          <th>Điểm TK (10)</th>
                          <th>Xếp loại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uniqueStudents.map(s => {
                          const overview = gradeOverview?.students.find(x => x.studentId === s.studentId);
                          return (
                            <tr key={s.studentId}>
                              <td><span className="badge badge-info">{s.studentCode}</span></td>
                              <td>{s.fullName}</td>
                              {gradeComponents.map(c => {
                                const g = gradeMap.get(`${s.studentId}-${c.gradeComponentId}`);
                                const isEditing = editingGrade?.studentId === s.studentId && editingGrade.componentId === c.gradeComponentId;
                                return (
                                  <td key={c.gradeComponentId}>
                                    {isEditing ? (
                                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        <input className="grade-input" type="number" min={0} max={c.maxScore}
                                          value={gradeInput} onChange={e => setGradeInput(e.target.value)} autoFocus />
                                        <button className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={saveGrade}>✓</button>
                                        <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setEditingGrade(null)}>✕</button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}
                                        onClick={() => startEditGrade(s.studentId, c.gradeComponentId, g?.score, g?.note)}>
                                        <span style={{ fontWeight: g?.score !== null && g?.score !== undefined ? 700 : 400, color: g?.score !== null && g?.score !== undefined ? '#1e293b' : '#94a3b8' }}>
                                          {g?.score !== null && g?.score !== undefined ? g.score : '—'}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', color: '#2563eb' }}>✏️</span>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="grade-total">{overview ? overview.calculatedScore10.toFixed(2) : '—'}</td>
                              <td className={`grade-letter ${letterColor(overview?.letterGrade)}`}>{overview?.letterGrade ?? '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {gradeComponents.length === 0 && (
                  <div className="empty-state"><div className="icon">📊</div><div>Chưa có thành phần điểm. Hãy thêm để bắt đầu nhập điểm.</div></div>
                )}
              </div>
            )}

            {/* ── ANNOUNCEMENTS ────────────────────────────────────────────── */}
            {tab === 'announcements' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{announcements.length} thông báo</div>
                  <button className="btn btn-primary btn-sm" onClick={openAddAnnouncement}>+ Gửi thông báo</button>
                </div>
                {announcements.length === 0 ? (
                  <div className="empty-state"><div className="icon">📢</div><div>Chưa có thông báo</div></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {announcements.map(a => (
                      <div key={a.announcementId} style={{ background: a.isActive ? '#f0fdf4' : '#f8fafc', borderRadius: 8, padding: '1rem', border: `1px solid ${a.isActive ? '#bbf7d0' : '#e2e8f0'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{a.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                              🏷️ {ANN_TYPE[a.announcementType]} · 🕐 {new Date(a.publishedAt).toLocaleString('vi-VN')}
                              {a.expiresAt && ` · Hết hạn: ${new Date(a.expiresAt).toLocaleString('vi-VN')}`}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#374151', whiteSpace: 'pre-wrap' }}>{a.content}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, marginLeft: '1rem' }}>
                            <span className={`badge ${a.isActive ? 'badge-success' : 'badge-gray'}`}>{a.isActive ? 'Hiện' : 'Ẩn'}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditAnnouncement(a)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteAnnouncement(a)}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ASSIGNMENT MODAL ──────────────────────────────────────────────────── */}
      {assignmentModal && (
        <div className="modal-overlay" onClick={() => setAssignmentModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAssignment ? 'Sửa bài tập' : 'Tạo bài tập mới'}</h3>
              <button className="modal-close" onClick={() => setAssignmentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group"><label>Tiêu đề *</label>
                <input value={assignmentForm.title} onChange={e => setAssignmentForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group"><label>Mô tả</label>
                <textarea rows={3} value={assignmentForm.description ?? ''} onChange={e => setAssignmentForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Mở từ</label>
                  <input type="datetime-local" value={assignmentForm.openAt ?? ''} onChange={e => setAssignmentForm(f => ({ ...f, openAt: e.target.value }))} />
                </div>
                <div className="form-group"><label>Hạn nộp *</label>
                  <input type="datetime-local" value={assignmentForm.dueAt} onChange={e => setAssignmentForm(f => ({ ...f, dueAt: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Điểm tối đa *</label>
                  <input type="number" min={0.1} step={0.1} value={assignmentForm.maxScore} onChange={e => setAssignmentForm(f => ({ ...f, maxScore: Number(e.target.value) }))} />
                </div>
                <div className="form-group"><label>Link tài liệu đính kèm</label>
                  <input value={assignmentForm.attachmentUrl ?? ''} onChange={e => setAssignmentForm(f => ({ ...f, attachmentUrl: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label className="checkbox-row">
                  <input type="checkbox" checked={assignmentForm.allowLateSubmission} onChange={e => setAssignmentForm(f => ({ ...f, allowLateSubmission: e.target.checked }))} />
                  Cho phép nộp muộn
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={assignmentForm.isPublished} onChange={e => setAssignmentForm(f => ({ ...f, isPublished: e.target.checked }))} />
                  Đăng ngay
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAssignmentModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveAssignment} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MATERIAL MODAL ──────────────────────────────────────────────────── */}
      {materialModal && (
        <div className="modal-overlay" onClick={() => setMaterialModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMaterial ? 'Sửa tài liệu' : 'Thêm tài liệu'}</h3>
              <button className="modal-close" onClick={() => setMaterialModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group"><label>Tiêu đề *</label>
                <input value={materialForm.title} onChange={e => setMaterialForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group"><label>Mô tả</label>
                <textarea rows={2} value={materialForm.description ?? ''} onChange={e => setMaterialForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Loại tài liệu</label>
                  <select value={materialForm.materialType ?? ''} onChange={e => setMaterialForm(f => ({ ...f, materialType: e.target.value }))}>
                    <option value="">-- Chọn loại --</option>
                    <option value="slide">📊 Slide</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="video">🎬 Video</option>
                    <option value="doc">📝 Document</option>
                    <option value="other">📁 Khác</option>
                  </select>
                </div>
                <div className="form-group"><label>Link file</label>
                  <input value={materialForm.fileUrl ?? ''} onChange={e => setMaterialForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group"><label>Link ngoài (YouTube, Drive…)</label>
                <input value={materialForm.externalUrl ?? ''} onChange={e => setMaterialForm(f => ({ ...f, externalUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={materialForm.isVisible} onChange={e => setMaterialForm(f => ({ ...f, isVisible: e.target.checked }))} />
                Hiển thị với sinh viên
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMaterialModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveMaterial} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── GRADE COMPONENT MODAL ─────────────────────────────────────────── */}
      {componentModal && (
        <div className="modal-overlay" onClick={() => setComponentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingComponent ? 'Sửa thành phần điểm' : 'Thêm thành phần điểm'}</h3>
              <button className="modal-close" onClick={() => setComponentModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
                Tổng trọng số hiện tại: <strong>{totalWeight}%</strong>
                {editingComponent && <> (không tính "{editingComponent.componentName}": {100 - totalWeight + Number(editingComponent.weightPercent)}% còn lại)</>}
              </div>
              <div className="form-group"><label>Tên thành phần *</label>
                <input value={componentForm.componentName} onChange={e => setComponentForm(f => ({ ...f, componentName: e.target.value }))}
                  placeholder="VD: Điểm chuyên cần, Giữa kỳ, Cuối kỳ" />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Trọng số (%) *</label>
                  <input type="number" min={0.01} max={100} step={0.01} value={componentForm.weightPercent}
                    onChange={e => setComponentForm(f => ({ ...f, weightPercent: Number(e.target.value) }))} />
                </div>
                <div className="form-group"><label>Điểm tối đa *</label>
                  <input type="number" min={0.1} step={0.1} value={componentForm.maxScore}
                    onChange={e => setComponentForm(f => ({ ...f, maxScore: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="form-group"><label>Thứ tự hiển thị *</label>
                <input type="number" min={1} value={componentForm.displayOrder}
                  onChange={e => setComponentForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setComponentModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveComponent} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ANNOUNCEMENT MODAL ───────────────────────────────────────────────── */}
      {announcementModal && (
        <div className="modal-overlay" onClick={() => setAnnouncementModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAnnouncement ? 'Sửa thông báo' : 'Gửi thông báo'}</h3>
              <button className="modal-close" onClick={() => setAnnouncementModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group"><label>Tiêu đề *</label>
                <input value={announcementForm.title} onChange={e => setAnnouncementForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group"><label>Nội dung *</label>
                <textarea rows={5} value={announcementForm.content} onChange={e => setAnnouncementForm(f => ({ ...f, content: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Loại thông báo</label>
                  <select value={announcementForm.announcementType} onChange={e => setAnnouncementForm(f => ({ ...f, announcementType: Number(e.target.value) }))}>
                    <option value={0}>📢 Chung</option>
                    <option value={1}>📝 Bài tập</option>
                    <option value={2}>📋 Thi cử</option>
                    <option value={3}>ℹ️ Khác</option>
                  </select>
                </div>
                <div className="form-group"><label>Hết hạn</label>
                  <input type="datetime-local" value={announcementForm.expiresAt ?? ''} onChange={e => setAnnouncementForm(f => ({ ...f, expiresAt: e.target.value || undefined }))} />
                </div>
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={announcementForm.isActive} onChange={e => setAnnouncementForm(f => ({ ...f, isActive: e.target.checked }))} />
                Hiển thị ngay
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAnnouncementModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveAnnouncement} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
