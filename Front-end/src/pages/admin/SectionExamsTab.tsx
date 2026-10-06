import { useEffect, useState, type FormEvent } from 'react';
import { sectionsApi } from '../../api/services';
import type { AdminExamDto, SaveAdminExamRequest } from '../../api/types';
import { getApiErrorMessage } from '../../api/client';

const EXAM_TYPES: Record<number, string> = {
  1: 'Kiểm tra', 2: 'Giữa kỳ', 3: 'Cuối kỳ', 4: 'Khác',
};

const EMPTY_EXAM: SaveAdminExamRequest = {
  examName: '',
  examType: 3,
  examDate: '',
  startTime: '07:00',
  durationMinutes: 60,
  room: '',
  note: '',
};

const toApiTime = (value: string) => value.length === 5 ? `${value}:00` : value;
const toInputTime = (value: string) => value.slice(0, 5);
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN');

export default function SectionExamsTab({ sectionId }: { sectionId: number }) {
  const [items, setItems] = useState<AdminExamDto[]>([]);
  const [form, setForm] = useState<SaveAdminExamRequest>(EMPTY_EXAM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setItems(await sectionsApi.exams(sectionId));
      setError('');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void sectionsApi.exams(sectionId)
      .then(data => { setItems(data); setError(''); })
      .catch(e => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [sectionId]);

  const resetForm = () => {
    setForm(EMPTY_EXAM);
    setEditingId(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, startTime: toApiTime(form.startTime) };
    try {
      if (editingId === null) await sectionsApi.createExam(sectionId, payload);
      else await sectionsApi.updateExam(sectionId, editingId, payload);
      resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const edit = (item: AdminExamDto) => {
    setEditingId(item.examId);
    setForm({
      examName: item.examName,
      examType: item.examType,
      examDate: item.examDate,
      startTime: toInputTime(item.startTime),
      durationMinutes: item.durationMinutes,
      room: item.room ?? '',
      note: item.note ?? '',
    });
    setError('');
  };

  const remove = async (examId: number) => {
    if (!window.confirm('Xóa lịch thi này?')) return;
    try {
      await sectionsApi.deleteExam(sectionId, examId);
      if (editingId === examId) resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div className="section-planning-tab">
      <form className="section-planning-form" onSubmit={submit}>
        <div className="form-group section-planning-name">
          <label>Tên kỳ thi *</label>
          <input required maxLength={200} value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })} placeholder="Thi cuối kỳ" />
        </div>
        <div className="form-group">
          <label>Loại *</label>
          <select value={form.examType} onChange={e => setForm({ ...form, examType: Number(e.target.value) })}>
            {Object.entries(EXAM_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Ngày thi *</label>
          <input type="date" required value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Giờ thi *</label>
          <input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Thời lượng (phút) *</label>
          <input type="number" required min={1} max={1440} value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Phòng thi</label>
          <input maxLength={50} value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="P.301" />
        </div>
        <div className="form-group section-planning-note">
          <label>Ghi chú</label>
          <input maxLength={500} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Nội dung cần lưu ý" />
        </div>
        <div className="section-planning-actions">
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Đang lưu…' : editingId === null ? '+ Thêm lịch thi' : 'Lưu thay đổi'}
          </button>
          {editingId !== null && <button className="btn btn-secondary btn-sm" type="button" onClick={resetForm}>Hủy sửa</button>}
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="admin-loading">Đang tải…</div> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Kỳ thi</th><th>Loại</th><th>Ngày giờ</th><th>Thời lượng</th><th>Phòng</th><th>Người tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              {items.length === 0 ? <tr><td colSpan={7} className="section-empty-cell">Chưa có lịch thi</td></tr> : items.map(item => (
                <tr key={item.examId}>
                  <td><strong>{item.examName}</strong>{item.note && <div className="section-cell-note">{item.note}</div>}</td>
                  <td><span className="badge badge-info">{EXAM_TYPES[item.examType]}</span></td>
                  <td>{formatDate(item.examDate)} · {toInputTime(item.startTime)}</td>
                  <td>{item.durationMinutes} phút</td>
                  <td>{item.room || '—'}</td>
                  <td>{item.createdByFullName}</td>
                  <td className="section-row-actions">
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => edit(item)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => void remove(item.examId)}>Xóa</button>
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
