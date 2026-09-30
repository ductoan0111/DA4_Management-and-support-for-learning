import { useState, useEffect } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { teachersApi, departmentsApi, usersApi } from '../../api/services';
import type { AdminTeacherDto, AdminDepartmentDto, SaveAdminTeacherRequest } from '../../api/types';

const STATUS_LABELS: Record<number, string> = { 0: 'Ngừng', 1: 'Đang công tác' };
const STATUS_BADGES: Record<number, string> = { 0: 'badge-danger', 1: 'badge-success' };

const empty: SaveAdminTeacherRequest = { userId: 0, teacherCode: '', departmentId: 0, academicTitle: '', specialization: '', status: 1 };

export default function TeachersPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminTeacherDto | null>(null);
  const [form, setForm] = useState<SaveAdminTeacherRequest>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState<AdminDepartmentDto[]>([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<Array<{ userId: number; username: string; fullName: string }>>([]);

  useEffect(() => {
    departmentsApi.list({ pageSize: 100 }).then(r => setDepartments(r.items));
  }, []);

  useEffect(() => {
    if (!modal) return;
    usersApi.list({ roleId: undefined, search: userSearch, pageSize: 50 }).then(r =>
      setUserOptions(r.items.filter(u => u.roleCode === 'TEACHER').map(u => ({ userId: u.userId, username: u.username, fullName: u.fullName })))
    );
  }, [modal, userSearch]);

  const openAdd = () => { setEditing(null); setForm(empty); setFormError(''); setUserSearch(''); setModal(true); };
  const openEdit = (row: AdminTeacherDto) => {
    setEditing(row);
    setForm({ userId: row.userId, teacherCode: row.teacherCode, departmentId: row.departmentId, academicTitle: row.academicTitle ?? '', specialization: row.specialization ?? '', status: row.status });
    setFormError(''); setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await teachersApi.update(editing.teacherId, form);
      else await teachersApi.create(form);
      setModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const deptName = (id: number) => departments.find(d => d.departmentId === id)?.departmentName ?? id;

  const filterParams: Record<string, string | number | boolean | undefined> = {};
  if (filterDept) filterParams.departmentId = Number(filterDept);
  if (filterStatus !== '') filterParams.status = Number(filterStatus);

  return (
    <>
      <CrudPage<AdminTeacherDto & { [key: string]: unknown }>
        title="Giảng viên"
        fetchList={p => teachersApi.list({ ...p, ...filterParams }) as never}
        idKey="teacherId"
        filterParams={filterParams}
        columns={[
          { key: 'teacherCode', header: 'Mã GV' },
          { key: 'userId', header: 'User ID' },
          { key: 'departmentId', header: 'Khoa', render: r => <span>{deptName(r.departmentId as number)}</span> },
          { key: 'academicTitle', header: 'Học hàm/vị' },
          { key: 'specialization', header: 'Chuyên ngành' },
          { key: 'status', header: 'Trạng thái', render: r => <span className={`badge ${STATUS_BADGES[r.status as number]}`}>{STATUS_LABELS[r.status as number]}</span> },
        ]}
        filters={<>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">-- Tất cả khoa --</option>
            {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">-- Tất cả TT --</option>
            <option value="1">Đang công tác</option>
            <option value="0">Ngừng</option>
          </select>
        </>}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await teachersApi.delete(row.teacherId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa giảng viên' : 'Thêm giảng viên'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label>Tài khoản (TEACHER role) *</label>
                {editing ? (
                  <input value={`User #${form.userId}`} disabled style={{ background: '#f8fafc' }} />
                ) : (<>
                  <input placeholder="Tìm theo username hoặc họ tên…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  <select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: Number(e.target.value) }))} style={{ marginTop: 4 }}>
                    <option value={0}>-- Chọn tài khoản --</option>
                    {userOptions.map(u => <option key={u.userId} value={u.userId}>{u.username} — {u.fullName}</option>)}
                  </select>
                </>)}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã giảng viên *</label>
                  <input value={form.teacherCode} onChange={e => setForm(f => ({ ...f, teacherCode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Khoa *</label>
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: Number(e.target.value) }))}>
                    <option value={0}>-- Chọn khoa --</option>
                    {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Học hàm/học vị</label>
                  <input value={form.academicTitle ?? ''} onChange={e => setForm(f => ({ ...f, academicTitle: e.target.value }))} placeholder="VD: Tiến sĩ, Thạc sĩ" />
                </div>
                <div className="form-group">
                  <label>Chuyên ngành</label>
                  <input value={form.specialization ?? ''} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Trạng thái *</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: Number(e.target.value) }))}>
                  <option value={1}>Đang công tác</option>
                  <option value={0}>Ngừng công tác</option>
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
    </>
  );
}
