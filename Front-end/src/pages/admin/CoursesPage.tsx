import { useState, useEffect } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { coursesApi, departmentsApi } from '../../api/services';
import type { AdminCourseDto, AdminDepartmentDto, SaveAdminCourseRequest } from '../../api/types';

const empty: SaveAdminCourseRequest = { departmentId: 0, courseCode: '', courseName: '', credits: 3, isActive: true };

export default function CoursesPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminCourseDto | null>(null);
  const [form, setForm] = useState<SaveAdminCourseRequest>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState<AdminDepartmentDto[]>([]);
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    departmentsApi.list({ pageSize: 100 }).then(r => setDepartments(r.items));
  }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setFormError(''); setModal(true); };
  const openEdit = (row: AdminCourseDto) => {
    setEditing(row);
    setForm({ departmentId: row.departmentId, courseCode: row.courseCode, courseName: row.courseName, credits: row.credits, description: row.description ?? '', isActive: row.isActive });
    setFormError(''); setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await coursesApi.update(editing.courseId, form);
      else await coursesApi.create(form);
      setModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const deptName = (id: number) => departments.find(d => d.departmentId === id)?.departmentName ?? id;

  return (
    <>
      <CrudPage<AdminCourseDto & { [key: string]: unknown }>
        title="Môn học"
        fetchList={p => coursesApi.list({ ...p, ...(filterDept ? { departmentId: Number(filterDept) } : {}) }) as never}
        idKey="courseId"
        filterParams={filterDept ? { departmentId: Number(filterDept) } : {}}
        columns={[
          { key: 'courseCode', header: 'Mã môn' },
          { key: 'courseName', header: 'Tên môn' },
          { key: 'departmentId', header: 'Khoa', render: r => <span>{deptName(r.departmentId as number)}</span> },
          { key: 'credits', header: 'Số TC' },
          { key: 'isActive', header: 'Trạng thái', render: r => <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>{r.isActive ? 'Hoạt động' : 'Ngừng'}</span> },
        ]}
        filters={
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">-- Tất cả khoa --</option>
            {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
          </select>
        }
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await coursesApi.delete(row.courseId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa môn học' : 'Thêm môn học'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label>Khoa *</label>
                <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: Number(e.target.value) }))}>
                  <option value={0}>-- Chọn khoa --</option>
                  {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã môn *</label>
                  <input value={form.courseCode} onChange={e => setForm(f => ({ ...f, courseCode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Số tín chỉ * (1–15)</label>
                  <input type="number" min={1} max={15} value={form.credits} onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Tên môn *</label>
                <input value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea rows={3} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                Đang hoạt động
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
