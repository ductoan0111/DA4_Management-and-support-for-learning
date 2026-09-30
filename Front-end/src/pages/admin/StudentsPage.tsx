import { useState, useEffect } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { studentsApi, majorsApi, academicClassesApi, usersApi } from '../../api/services';
import type { AdminStudentDto, AdminMajorDto, AdminAcademicClassDto, CreateAdminStudentRequest, UpdateAdminStudentRequest } from '../../api/types';

const STATUS_LABELS: Record<number, string> = { 0: 'Ngừng học', 1: 'Đang học', 2: 'Tốt nghiệp' };
const STATUS_BADGES: Record<number, string> = { 0: 'badge-danger', 1: 'badge-success', 2: 'badge-info' };

export default function StudentsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminStudentDto | null>(null);
  const [form, setForm] = useState<CreateAdminStudentRequest | UpdateAdminStudentRequest>({ userId: 0, studentCode: '', majorId: 0, enrollmentYear: new Date().getFullYear(), status: 1 } as CreateAdminStudentRequest);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [majors, setMajors] = useState<AdminMajorDto[]>([]);
  const [classes, setClasses] = useState<AdminAcademicClassDto[]>([]);
  const [filterMajor, setFilterMajor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<Array<{ userId: number; username: string; fullName: string }>>([]);

  useEffect(() => {
    majorsApi.list({ pageSize: 200 }).then(r => setMajors(r.items));
  }, []);

  useEffect(() => {
    if (!modal) return;
    usersApi.list({ search: userSearch, pageSize: 50 }).then(r =>
      setUserOptions(r.items.filter(u => u.roleCode === 'STUDENT').map(u => ({ userId: u.userId, username: u.username, fullName: u.fullName })))
    );
  }, [modal, userSearch]);

  const selectedMajorId = (form as CreateAdminStudentRequest).userId !== undefined
    ? (form as CreateAdminStudentRequest & { majorId?: number }).majorId ?? 0
    : (form as UpdateAdminStudentRequest).majorId ?? 0;

  useEffect(() => {
    if (selectedMajorId) {
      academicClassesApi.list({ majorId: selectedMajorId, pageSize: 200 }).then(r => setClasses(r.items));
    } else {
      setClasses([]);
    }
  }, [selectedMajorId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ userId: 0, studentCode: '', majorId: 0, enrollmentYear: new Date().getFullYear(), status: 1 } as CreateAdminStudentRequest);
    setFormError(''); setUserSearch(''); setModal(true);
  };

  const openEdit = (row: AdminStudentDto) => {
    setEditing(row);
    setForm({
      studentCode: row.studentCode, academicClassId: row.academicClassId ?? undefined,
      majorId: row.majorId, enrollmentYear: row.enrollmentYear, status: row.status,
      fullName: row.fullName, email: row.email, phone: row.phone ?? '', isActive: row.isActive,
    } as UpdateAdminStudentRequest);
    setFormError(''); setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await studentsApi.update(editing.studentId, form as UpdateAdminStudentRequest);
      else await studentsApi.create(form as CreateAdminStudentRequest);
      setModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const filterParams: Record<string, string | number | boolean | undefined> = {};
  if (filterMajor) filterParams.majorId = Number(filterMajor);
  if (filterStatus !== '') filterParams.status = Number(filterStatus);

  const majorId = editing ? editing.majorId : (form as CreateAdminStudentRequest).majorId;

  return (
    <>
      <CrudPage<AdminStudentDto & { [key: string]: unknown }>
        title="Sinh viên"
        fetchList={p => studentsApi.list({ ...p, ...filterParams }) as never}
        idKey="studentId"
        filterParams={filterParams}
        columns={[
          { key: 'studentCode', header: 'Mã SV' },
          { key: 'fullName', header: 'Họ tên' },
          { key: 'email', header: 'Email' },
          { key: 'majorName', header: 'Ngành' },
          { key: 'className', header: 'Lớp HC', render: r => r.className ? <span>{r.className as string}</span> : <span className="text-muted">—</span> },
          { key: 'enrollmentYear', header: 'Năm nhập học' },
          { key: 'status', header: 'TT học tập', render: r => <span className={`badge ${STATUS_BADGES[r.status as number]}`}>{STATUS_LABELS[r.status as number]}</span> },
          { key: 'isActive', header: 'TK', render: r => <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>{r.isActive ? '✓' : '✗'}</span> },
        ]}
        filters={<>
          <select value={filterMajor} onChange={e => setFilterMajor(e.target.value)}>
            <option value="">-- Tất cả ngành --</option>
            {majors.map(m => <option key={m.majorId} value={m.majorId}>{m.majorName}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">-- Tất cả TT --</option>
            <option value="1">Đang học</option>
            <option value="0">Ngừng</option>
            <option value="2">Tốt nghiệp</option>
          </select>
        </>}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await studentsApi.delete(row.studentId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? `Sửa sinh viên: ${editing.fullName}` : 'Thêm sinh viên'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}

              {!editing && (
                <div className="form-group">
                  <label>Tài khoản (STUDENT role) *</label>
                  <input placeholder="Tìm theo username…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  <select value={(form as CreateAdminStudentRequest).userId} onChange={e => setForm(f => ({ ...f, userId: Number(e.target.value) }))} style={{ marginTop: 4 }}>
                    <option value={0}>-- Chọn tài khoản --</option>
                    {userOptions.map(u => <option key={u.userId} value={u.userId}>{u.username} — {u.fullName}</option>)}
                  </select>
                </div>
              )}

              {editing && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input value={(form as UpdateAdminStudentRequest).fullName ?? ''} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={(form as UpdateAdminStudentRequest).email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Mã sinh viên *</label>
                  <input value={form.studentCode} onChange={e => setForm(f => ({ ...f, studentCode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Năm nhập học *</label>
                  <input type="number" min={2000} max={2100} value={form.enrollmentYear} onChange={e => setForm(f => ({ ...f, enrollmentYear: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngành *</label>
                  <select value={majorId} onChange={e => setForm(f => ({ ...f, majorId: Number(e.target.value), academicClassId: undefined }))}>
                    <option value={0}>-- Chọn ngành --</option>
                    {majors.map(m => <option key={m.majorId} value={m.majorId}>{m.majorName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Lớp hành chính</label>
                  <select value={form.academicClassId ?? ''} onChange={e => setForm(f => ({ ...f, academicClassId: e.target.value ? Number(e.target.value) : undefined }))}>
                    <option value="">-- Không có --</option>
                    {classes.map(c => <option key={c.academicClassId} value={c.academicClassId}>{c.className}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tình trạng học *</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: Number(e.target.value) }))}>
                    <option value={1}>Đang học</option>
                    <option value={0}>Ngừng học</option>
                    <option value={2}>Tốt nghiệp</option>
                  </select>
                </div>
                {editing && (
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input value={(form as UpdateAdminStudentRequest).phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                )}
              </div>

              {editing && (
                <label className="checkbox-row">
                  <input type="checkbox" checked={(form as UpdateAdminStudentRequest).isActive ?? true} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  Tài khoản hoạt động
                </label>
              )}
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
