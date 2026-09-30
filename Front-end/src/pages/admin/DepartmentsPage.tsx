import { useState } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { departmentsApi } from '../../api/services';
import type { AdminDepartmentDto, SaveAdminDepartmentRequest } from '../../api/types';

const empty: SaveAdminDepartmentRequest = { departmentCode: '', departmentName: '', isActive: true };

export default function DepartmentsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminDepartmentDto | null>(null);
  const [form, setForm] = useState<SaveAdminDepartmentRequest>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => { setEditing(null); setForm(empty); setFormError(''); setModal(true); };
  const openEdit = (row: AdminDepartmentDto) => {
    setEditing(row);
    setForm({ departmentCode: row.departmentCode, departmentName: row.departmentName, isActive: row.isActive });
    setFormError('');
    setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await departmentsApi.update(editing.departmentId, form);
      else await departmentsApi.create(form);
      setModal(false);
      // trigger re-fetch via key trick
      window.dispatchEvent(new Event('crud-refresh'));
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  return (
    <>
      <CrudPage<AdminDepartmentDto & { [key: string]: unknown }>
        title="Khoa"
        fetchList={departmentsApi.list as never}
        idKey="departmentId"
        columns={[
          { key: 'departmentCode', header: 'Mã khoa' },
          { key: 'departmentName', header: 'Tên khoa' },
          { key: 'isActive', header: 'Trạng thái', render: r => <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>{r.isActive ? 'Hoạt động' : 'Ngừng'}</span> },
        ]}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await departmentsApi.delete(row.departmentId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa khoa' : 'Thêm khoa'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label>Mã khoa *</label>
                <input value={form.departmentCode} onChange={e => setForm(f => ({ ...f, departmentCode: e.target.value }))} placeholder="VD: CNTT" />
              </div>
              <div className="form-group">
                <label>Tên khoa *</label>
                <input value={form.departmentName} onChange={e => setForm(f => ({ ...f, departmentName: e.target.value }))} placeholder="VD: Công nghệ thông tin" />
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
