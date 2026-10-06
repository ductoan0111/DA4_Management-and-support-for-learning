import { useState, useEffect } from 'react';
import { sectionsApi, teachersApi, studentsApi } from '../../api/services';
import type { AdminSectionTeacherDto, AdminEnrollmentDto, AdminTeacherDto, AdminStudentDto, PagedResult } from '../../api/types';
import { getApiErrorMessage } from '../../api/client';
import SectionSchedulesTab from './SectionSchedulesTab';
import SectionExamsTab from './SectionExamsTab';

const ENROLL_STATUS: Record<number, string> = { 0: 'Đã hủy', 1: 'Đang học', 2: 'Hoàn thành' };
const ENROLL_BADGE: Record<number, string> = { 0: 'badge-danger', 1: 'badge-success', 2: 'badge-info' };
const SECTION_TABS = [
  { id: 'teachers', label: '👨‍🏫 Giảng viên' },
  { id: 'students', label: '🎓 Sinh viên' },
  { id: 'schedules', label: '🗓️ Lịch học' },
  { id: 'exams', label: '📝 Lịch thi' },
] as const;
type SectionTab = (typeof SECTION_TABS)[number]['id'];

async function loadAllPages<T>(fetchPage: (page: number) => Promise<PagedResult<T>>): Promise<T[]> {
  const first = await fetchPage(1);
  if (first.totalPages <= 1) return first.items;
  const remaining = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) => fetchPage(index + 2)),
  );
  return [first, ...remaining].flatMap(result => result.items);
}

export default function SectionManagementModal({ sectionId, onClose }: { sectionId: number; onClose: () => void }) {
  const [tab, setTab] = useState<SectionTab>('teachers');
  const [teachers, setTeachers] = useState<AdminSectionTeacherDto[]>([]);
  const [students, setStudents] = useState<AdminEnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Teacher assignment
  const [allTeachers, setAllTeachers] = useState<AdminTeacherDto[]>([]);
  const [selTeacher, setSelTeacher] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  // Student enrollment
  const [allStudents, setAllStudents] = useState<AdminStudentDto[]>([]);
  const [selStudent, setSelStudent] = useState('');
  const [enrollStatus, setEnrollStatus] = useState(1);

  useEffect(() => {
    Promise.all([
      loadAllPages(page => sectionsApi.teachers(sectionId, page, 100)).then(setTeachers),
      loadAllPages(page => sectionsApi.students(sectionId, page, 100)).then(setStudents),
      loadAllPages(page => teachersApi.list({ page, pageSize: 100, status: 1 })).then(setAllTeachers),
      loadAllPages(page => studentsApi.list({ page, pageSize: 100, status: 1 })).then(setAllStudents),
    ]).catch(() => setError('Không thể tải dữ liệu')).finally(() => setLoading(false));
  }, [sectionId]);

  const refresh = () => {
    Promise.all([
      loadAllPages(page => sectionsApi.teachers(sectionId, page, 100)).then(setTeachers),
      loadAllPages(page => sectionsApi.students(sectionId, page, 100)).then(setStudents),
    ]).catch(() => setError('Không thể làm mới dữ liệu lớp học phần.'));
  };

  const assignTeacher = async () => {
    if (!selTeacher) return;
    try {
      await sectionsApi.assignTeacher(sectionId, Number(selTeacher), { isPrimary });
      setSelTeacher(''); refresh();
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const removeTeacher = async (teacherId: number) => {
    if (!window.confirm('Bỏ phân công giảng viên này?')) return;
    try { await sectionsApi.removeTeacher(sectionId, teacherId); refresh(); }
    catch (e) { alert(getApiErrorMessage(e)); }
  };

  const enroll = async () => {
    if (!selStudent) return;
    try {
      await sectionsApi.enroll(sectionId, Number(selStudent), { status: enrollStatus });
      setSelStudent(''); refresh();
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const cancelEnrollment = async (studentId: number) => {
    if (!window.confirm('Hủy đăng ký sinh viên này?')) return;
    try { await sectionsApi.cancelEnrollment(sectionId, studentId); refresh(); }
    catch (e) { alert(getApiErrorMessage(e)); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quản lý lớp học phần #{sectionId}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="section-management-tabs">
          {SECTION_TABS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{ padding: '0.75rem 0.5rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                borderBottom: tab === item.id ? '2px solid #2563eb' : '2px solid transparent', color: tab === item.id ? '#2563eb' : '#64748b' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ minHeight: 300 }}>
          {(tab === 'teachers' || tab === 'students') && error && <div className="alert alert-error">{error}</div>}
          {(tab === 'teachers' || tab === 'students') && loading ? <div className="admin-loading">Đang tải…</div> : (
            tab === 'teachers' ? (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select value={selTeacher} onChange={e => setSelTeacher(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>
                    <option value="">-- Chọn giảng viên --</option>
                    {allTeachers.map(t => <option key={t.teacherId} value={t.teacherId}>{t.teacherCode} — {t.fullName}</option>)}
                  </select>
                  <label className="checkbox-row"><input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} /> GV chính</label>
                  <button className="btn btn-primary btn-sm" onClick={assignTeacher}>Phân công</button>
                </div>
                <table>
                  <thead><tr><th>Mã GV</th><th>Họ tên</th><th>Vai trò</th><th>Ngày PC</th><th></th></tr></thead>
                  <tbody>
                    {teachers.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có giảng viên</td></tr> :
                      teachers.map(t => (
                        <tr key={t.teacherId}>
                          <td>{t.teacherCode}</td>
                          <td>{t.fullName}</td>
                          <td>{t.isPrimary ? <span className="badge badge-info">Chính</span> : <span className="badge badge-gray">Phụ</span>}</td>
                          <td>{new Date(t.assignedAt).toLocaleDateString('vi-VN')}</td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => removeTeacher(t.teacherId)}>Bỏ</button></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            ) : tab === 'students' ? (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select value={selStudent} onChange={e => setSelStudent(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>
                    <option value="">-- Chọn sinh viên --</option>
                    {allStudents.map(s => <option key={s.studentId} value={s.studentId}>{s.studentCode} — {s.fullName}</option>)}
                  </select>
                  <select value={enrollStatus} onChange={e => setEnrollStatus(Number(e.target.value))} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d1d5db' }}>
                    <option value={1}>Đang học</option>
                    <option value={2}>Hoàn thành</option>
                    <option value={0}>Hủy</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={enroll}>Đăng ký</button>
                </div>
                <table>
                  <thead><tr><th>Mã SV</th><th>Họ tên</th><th>Trạng thái</th><th>Ngày ĐK</th><th></th></tr></thead>
                  <tbody>
                    {students.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có sinh viên</td></tr> :
                      students.map(s => (
                        <tr key={s.enrollmentId}>
                          <td>{s.studentCode}</td>
                          <td>{s.fullName}</td>
                          <td><span className={`badge ${ENROLL_BADGE[s.status]}`}>{ENROLL_STATUS[s.status]}</span></td>
                          <td>{new Date(s.enrolledAt).toLocaleDateString('vi-VN')}</td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => cancelEnrollment(s.studentId)}>Hủy ĐK</button></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            ) : tab === 'schedules' ? (
              <SectionSchedulesTab sectionId={sectionId} />
            ) : (
              <SectionExamsTab sectionId={sectionId} />
            )
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
