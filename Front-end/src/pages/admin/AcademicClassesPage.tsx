import { useState, useEffect } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { academicClassesApi, majorsApi } from '../../api/services';
import type { AdminAcademicClassDto, AdminMajorDto, SaveAdminAcademicClassRequest } from '../../api/types';

const empty: SaveAdminAcademicClassRequest = { majorId: 0, classCode: '', className: '', isActive: true };

export default function AcademicClassesPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminAcademicClassDto | null>(null);
  const [form, setForm] = useState<SaveAdminAcademicClassRequest>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [majors, setMajors] = useState<AdminMajorDto[]>([]);
  const [filterMajor, setFilterMajor] = useState('');

  useEffect(() => {
    majorsApi.list({ pageSize: 200 }).then(r => setMajors(r.items));
  }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setFormError(''); setModal(true); };
  const openEdit = (row: AdminAcademicClassDto) => {
    setEditing(row);
    setForm({ majorId: row.majorId, classCode: row.classCode, className: row.className, isActive: row.isActive });
    setFormError(''); setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await academicClassesApi.update(editing.academicClassId, form);
      else await academicClassesApi.create(form);
      setModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const majorName = (id: number) => majors.find(m => m.majorId === id)?.majorName ?? id;

  return (
    <>
      <CrudPage<AdminAcademicClassDto & { [key: string]: unknown }>
        title="Lớp hành chính"
        fetchList={p => academicClassesApi.list({ ...p, ...(filterMajor ? { majorId: Number(filterMajor) } : {}) }) as never}
        idKey="academicClassId"
        filterParams={filterMajor ? { majorId: Number(filterMajor) } : {}}
        columns={[
          { key: 'classCode', header: 'Mã lớp' },
          { key: 'className', header: 'Tên lớp' },
          { key: 'majorId', header: 'Ngành', render: r => <span>{majorName(r.majorId as number)}</span> },
          { key: 'isActive', header: 'Trạng thái', render: r => <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>{r.isActive ? 'Hoạt động' : 'Ngừng'}</span> },
        ]}
        filters={
          <select value={filterMajor} onChange={e => setFilterMajor(e.target.value)}>
            <option value="">-- Tất cả ngành --</option>
            {majors.map(m => <option key={m.majorId} value={m.majorId}>{m.majorName}</option>)}
          </select>
        }
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await academicClassesApi.delete(row.academicClassId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa lớp hành chính' : 'Thêm lớp hành chính'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label>Ngành *</label>
                <select value={form.majorId} onChange={e => setForm(f => ({ ...f, majorId: Number(e.target.value) }))}>
                  <option value={0}>-- Chọn ngành --</option>
                  {majors.map(m => <option key={m.majorId} value={m.majorId}>{m.majorName}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã lớp *</label>
                  <input value={form.classCode} onChange={e => setForm(f => ({ ...f, classCode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Tên lớp *</label>
                  <input value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} />
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
