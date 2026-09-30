import { useState, useEffect } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { majorsApi, departmentsApi } from '../../api/services';
import type { AdminMajorDto, AdminDepartmentDto, SaveAdminMajorRequest } from '../../api/types';

const empty: SaveAdminMajorRequest = { departmentId: 0, majorCode: '', majorName: '', isActive: true };

export default function MajorsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminMajorDto | null>(null);
  const [form, setForm] = useState<SaveAdminMajorRequest>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState<AdminDepartmentDto[]>([]);
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    departmentsApi.list({ pageSize: 100 }).then(r => setDepartments(r.items));
  }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setFormError(''); setModal(true); };
  const openEdit = (row: AdminMajorDto) => {
    setEditing(row);
    setForm({ departmentId: row.departmentId, majorCode: row.majorCode, majorName: row.majorName, isActive: row.isActive });
    setFormError('');
    setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await majorsApi.update(editing.majorId, form);
      else await majorsApi.create(form);
      setModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const deptName = (id: number) => departments.find(d => d.departmentId === id)?.departmentName ?? id;

  return (
    <>
      <CrudPage<AdminMajorDto & { [key: string]: unknown }>
        title="Ngành học"
        fetchList={p => majorsApi.list({ ...p, ...(filterDept ? { departmentId: Number(filterDept) } : {}) }) as never}
        idKey="majorId"
        filterParams={filterDept ? { departmentId: Number(filterDept) } : {}}
        columns={[
          { key: 'majorCode', header: 'Mã ngành' },
          { key: 'majorName', header: 'Tên ngành' },
          { key: 'departmentId', header: 'Khoa', render: r => <span>{deptName(r.departmentId as number)}</span> },
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
        onDelete={async row => { await majorsApi.delete(row.majorId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa ngành' : 'Thêm ngành'}</h3>
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
                  <label>Mã ngành *</label>
                  <input value={form.majorCode} onChange={e => setForm(f => ({ ...f, majorCode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Tên ngành *</label>
                  <input value={form.majorName} onChange={e => setForm(f => ({ ...f, majorName: e.target.value }))} />
                </div>
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
