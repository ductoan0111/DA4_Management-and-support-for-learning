import { useState } from 'react';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { semestersApi } from '../../api/services';
import type { AdminSemesterDto, SaveAdminSemesterRequest } from '../../api/types';

const empty: SaveAdminSemesterRequest = { semesterCode: '', semesterName: '', academicYear: '', startDate: '', endDate: '', isCurrent: false };

export default function SemestersPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminSemesterDto | null>(null);
  const [form, setForm] = useState<SaveAdminSemesterRequest>(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => { setEditing(null); setForm(empty); setFormError(''); setModal(true); };
  const openEdit = (row: AdminSemesterDto) => {
    setEditing(row);
    setForm({ semesterCode: row.semesterCode, semesterName: row.semesterName, academicYear: row.academicYear, startDate: row.startDate, endDate: row.endDate, isCurrent: row.isCurrent });
    setFormError(''); setModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await semestersApi.update(editing.semesterId, form);
      else await semestersApi.create(form);
      setModal(false);
      window.dispatchEvent(new Event('crud-refresh'));
    } catch (e) {
      setFormError(getApiErrorMessage(e));
    } finally { setSaving(false); }
  };

  return (
    <>
      <CrudPage<AdminSemesterDto & { [key: string]: unknown }>
        title="Học kỳ"
        fetchList={semestersApi.list as never}
        idKey="semesterId"
        columns={[
          { key: 'semesterCode', header: 'Mã HK' },
          { key: 'semesterName', header: 'Tên học kỳ' },
          { key: 'academicYear', header: 'Năm học' },
          { key: 'startDate', header: 'Bắt đầu' },
          { key: 'endDate', header: 'Kết thúc' },
          { key: 'isCurrent', header: 'Hiện tại', render: r => r.isCurrent ? <span className="badge badge-success">✓ Hiện tại</span> : <span className="badge badge-gray">—</span> },
        ]}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await semestersApi.delete(row.semesterId); }}
      />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa học kỳ' : 'Thêm học kỳ'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Mã học kỳ *</label>
                  <input value={form.semesterCode} onChange={e => setForm(f => ({ ...f, semesterCode: e.target.value }))} placeholder="VD: HK1-2024" />
                </div>
                <div className="form-group">
                  <label>Năm học *</label>
                  <input value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="VD: 2024-2025" />
                </div>
              </div>
              <div className="form-group">
                <label>Tên học kỳ *</label>
                <input value={form.semesterName} onChange={e => setForm(f => ({ ...f, semesterName: e.target.value }))} placeholder="VD: Học kỳ 1 năm 2024-2025" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={form.isCurrent} onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked }))} />
                Đặt làm học kỳ hiện tại (sẽ bỏ cờ của học kỳ khác)
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
