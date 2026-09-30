import { useState, useEffect } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { sectionsApi, coursesApi, semestersApi } from '../../api/services';
import type { AdminCourseSectionDto, AdminCourseDto, AdminSemesterDto, SaveAdminCourseSectionRequest } from '../../api/types';
import SectionManagementModal from './SectionManagementModal';

const STATUS_LABELS: Record<number, string> = { 0: 'Đóng', 1: 'Mở', 2: 'Kết thúc' };
const STATUS_BADGES: Record<number, string> = { 0: 'badge-danger', 1: 'badge-success', 2: 'badge-gray' };

const empty: SaveAdminCourseSectionRequest = { courseId: 0, semesterId: 0, sectionCode: '', sectionName: '', maxStudents: 40, status: 1 };

export default function CourseSectionsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminCourseSectionDto | null>(null);
  const [form, setForm] = useState<SaveAdminCourseSectionRequest>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [semesters, setSemesters] = useState<AdminSemesterDto[]>([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [managingId, setManagingId] = useState<number | null>(null);

  useEffect(() => {
    coursesApi.list({ pageSize: 200 }).then(r => setCourses(r.items));
    semestersApi.list({ pageSize: 50 }).then(r => setSemesters(r.items));
  }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setFormError(''); setModal(true); };
  const openEdit = (row: AdminCourseSectionDto) => {
    setEditing(row);
    setForm({ courseId: row.courseId, semesterId: row.semesterId, sectionCode: row.sectionCode, sectionName: row.sectionName ?? '', maxStudents: row.maxStudents ?? 40, status: row.status });
    setFormError(''); setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await sectionsApi.update(editing.sectionId, form);
      else await sectionsApi.create(form);
      setModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const filterParams: Record<string, string | number | boolean | undefined> = {};
  if (filterCourse) filterParams.courseId = Number(filterCourse);
  if (filterSemester) filterParams.semesterId = Number(filterSemester);
  if (filterStatus !== '') filterParams.status = Number(filterStatus);

  const courseName = (id: number) => courses.find(c => c.courseId === id)?.courseName ?? id;
  const semesterName = (id: number) => semesters.find(s => s.semesterId === id)?.semesterName ?? id;

  return (
    <>
      <CrudPage<AdminCourseSectionDto & { [key: string]: unknown }>
        title="Lớp học phần"
        fetchList={p => sectionsApi.list({ ...p, ...filterParams }) as never}
        idKey="sectionId"
        filterParams={filterParams}
        columns={[
          { key: 'sectionCode', header: 'Mã lớp HP' },
          { key: 'courseId', header: 'Môn học', render: r => <span>{courseName(r.courseId as number)}</span> },
          { key: 'semesterId', header: 'Học kỳ', render: r => <span>{semesterName(r.semesterId as number)}</span> },
          { key: 'maxStudents', header: 'Sĩ số tối đa' },
          { key: 'status', header: 'Trạng thái', render: r => <span className={`badge ${STATUS_BADGES[r.status as number]}`}>{STATUS_LABELS[r.status as number]}</span> },
        ]}
        filters={<>
          <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
            <option value="">-- Tất cả HK --</option>
            {semesters.map(s => <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>)}
          </select>
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">-- Tất cả môn --</option>
            {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">-- Tất cả TT --</option>
            <option value="0">Đóng</option>
            <option value="1">Mở</option>
            <option value="2">Kết thúc</option>
          </select>
        </>}
        extraActions={row => (
          <button className="btn btn-secondary btn-sm" onClick={() => setManagingId(row.sectionId)}>👥 Quản lý</button>
        )}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await sectionsApi.delete(row.sectionId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa lớp học phần' : 'Thêm lớp học phần'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label>Môn học *</label>
                <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: Number(e.target.value) }))}>
                  <option value={0}>-- Chọn môn --</option>
                  {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Học kỳ *</label>
                <select value={form.semesterId} onChange={e => setForm(f => ({ ...f, semesterId: Number(e.target.value) }))}>
                  <option value={0}>-- Chọn học kỳ --</option>
                  {semesters.map(s => <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã lớp HP *</label>
                  <input value={form.sectionCode} onChange={e => setForm(f => ({ ...f, sectionCode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Sĩ số tối đa</label>
                  <input type="number" min={1} value={form.maxStudents ?? ''} onChange={e => setForm(f => ({ ...f, maxStudents: e.target.value ? Number(e.target.value) : undefined }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Tên lớp HP</label>
                <input value={form.sectionName ?? ''} onChange={e => setForm(f => ({ ...f, sectionName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Trạng thái *</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: Number(e.target.value) }))}>
                  <option value={0}>Đóng</option>
                  <option value={1}>Mở</option>
                  <option value={2}>Kết thúc</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}

      {managingId !== null && (
        <SectionManagementModal sectionId={managingId} onClose={() => setManagingId(null)} />
      )}
    </>
  );
}
