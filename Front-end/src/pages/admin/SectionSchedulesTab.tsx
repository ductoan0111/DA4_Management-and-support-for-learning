import { useEffect, useState, type FormEvent } from 'react';
import { sectionsApi } from '../../api/services';
import type { AdminClassScheduleDto, SaveAdminClassScheduleRequest } from '../../api/types';
import { getApiErrorMessage } from '../../api/client';

const DAYS: Record<number, string> = {
  2: 'Thứ Hai', 3: 'Thứ Ba', 4: 'Thứ Tư', 5: 'Thứ Năm',
  6: 'Thứ Sáu', 7: 'Thứ Bảy', 8: 'Chủ Nhật',
};

const EMPTY_SCHEDULE: SaveAdminClassScheduleRequest = {
  dayOfWeek: 2,
  startTime: '07:00',
  endTime: '09:00',
  room: '',
  building: '',
  effectiveFrom: '',
  effectiveTo: '',
  note: '',
};

const toApiTime = (value: string) => value.length === 5 ? `${value}:00` : value;
const toInputTime = (value: string) => value.slice(0, 5);
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN');

export default function SectionSchedulesTab({ sectionId }: { sectionId: number }) {
  const [items, setItems] = useState<AdminClassScheduleDto[]>([]);
  const [form, setForm] = useState<SaveAdminClassScheduleRequest>(EMPTY_SCHEDULE);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setItems(await sectionsApi.schedules(sectionId));
      setError('');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void sectionsApi.schedules(sectionId)
      .then(data => { setItems(data); setError(''); })
      .catch(e => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [sectionId]);

  const resetForm = () => {
    setForm(EMPTY_SCHEDULE);
    setEditingId(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.endTime <= form.startTime) {
      setError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }
    if (form.effectiveTo < form.effectiveFrom) {
      setError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
      return;
    }

    setSaving(true);
    setError('');
    const payload = { ...form, startTime: toApiTime(form.startTime), endTime: toApiTime(form.endTime) };
    try {
      if (editingId === null) await sectionsApi.createSchedule(sectionId, payload);
      else await sectionsApi.updateSchedule(sectionId, editingId, payload);
      resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const edit = (item: AdminClassScheduleDto) => {
    setEditingId(item.scheduleId);
    setForm({
      dayOfWeek: item.dayOfWeek,
      startTime: toInputTime(item.startTime),
      endTime: toInputTime(item.endTime),
      room: item.room ?? '',
      building: item.building ?? '',
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo,
      note: item.note ?? '',
    });
    setError('');
  };

  const remove = async (scheduleId: number) => {
    if (!window.confirm('Xóa lịch học này?')) return;
    try {
      await sectionsApi.deleteSchedule(sectionId, scheduleId);
      if (editingId === scheduleId) resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div className="section-planning-tab">
      <form className="section-planning-form" onSubmit={submit}>
        <div className="form-group">
          <label>Ngày học *</label>
          <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: Number(e.target.value) })}>
            {Object.entries(DAYS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Bắt đầu *</label>
          <input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Kết thúc *</label>
          <input type="time" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phòng</label>
          <input maxLength={50} value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="P.301" />
        </div>
        <div className="form-group">
          <label>Tòa nhà</label>
          <input maxLength={100} value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} placeholder="Tòa A" />
        </div>
        <div className="form-group">
          <label>Áp dụng từ *</label>
          <input type="date" required value={form.effectiveFrom} onChange={e => setForm({ ...form, effectiveFrom: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Đến ngày *</label>
          <input type="date" required value={form.effectiveTo} onChange={e => setForm({ ...form, effectiveTo: e.target.value })} />
        </div>
        <div className="form-group section-planning-note">
          <label>Ghi chú</label>
          <input maxLength={500} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Nội dung cần lưu ý" />
        </div>
        <div className="section-planning-actions">
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Đang lưu…' : editingId === null ? '+ Thêm lịch học' : 'Lưu thay đổi'}
          </button>
          {editingId !== null && <button className="btn btn-secondary btn-sm" type="button" onClick={resetForm}>Hủy sửa</button>}
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="admin-loading">Đang tải…</div> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Ngày học</th><th>Thời gian</th><th>Phòng học</th><th>Thời gian áp dụng</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
            <tbody>
              {items.length === 0 ? <tr><td colSpan={6} className="section-empty-cell">Chưa có lịch học</td></tr> : items.map(item => (
                <tr key={item.scheduleId}>
                  <td>{DAYS[item.dayOfWeek]}</td>
                  <td>{toInputTime(item.startTime)} – {toInputTime(item.endTime)}</td>
                  <td>{[item.room, item.building].filter(Boolean).join(' · ') || '—'}</td>
                  <td>{formatDate(item.effectiveFrom)} – {formatDate(item.effectiveTo)}</td>
                  <td>{item.note || '—'}</td>
                  <td className="section-row-actions">
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => edit(item)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => void remove(item.scheduleId)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
