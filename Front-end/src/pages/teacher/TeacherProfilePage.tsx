import { useEffect, useState } from 'react';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherProfileApi } from '../../api/teacher-services';
import type { UpdateTeacherProfileRequest } from '../../api/teacher-types';
import { ApiError } from '../../api/client';

export default function TeacherProfilePage() {
  const { profile } = useTeacherAuth();
  const [form, setForm] = useState<UpdateTeacherProfileRequest>({
    fullName: '', phone: '', academicTitle: '', specialization: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      dateOfBirth: profile.dateOfBirth ?? undefined,
      gender: profile.gender ?? undefined,
      avatarUrl: profile.avatarUrl ?? '',
      academicTitle: profile.academicTitle ?? '',
      specialization: profile.specialization ?? '',
    });
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setSaving(true); setMsg(''); setError('');
    try {
      await teacherProfileApi.update(profile.teacherId, form);
      setMsg('Đã cập nhật hồ sơ thành công!');
    } catch (e) {
      setError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  if (!profile) return null;

  return (
    <div>
      <div className="teacher-topbar"><h1>Hồ sơ giảng viên</h1></div>
      <div className="teacher-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', maxWidth: 900 }}>
          {/* Profile card */}
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontSize: '2rem', color: '#fff', fontWeight: 700,
              }}>{profile.fullName.charAt(0)}</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{profile.fullName}</div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 2 }}>{profile.academicTitle ?? 'Giảng viên'}</div>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', textAlign: 'left' }}>
                {[
                  ['👤', 'Username', profile.username],
                  ['🏛️', 'Khoa', profile.departmentName],
                  ['📧', 'Email', profile.email],
                  ['🎓', 'Mã GV', profile.teacherCode],
                  ['🔬', 'Chuyên ngành', profile.specialization ?? '—'],
                ].map(([icon, label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span>{icon}</span>
                    <span style={{ color: '#64748b', minWidth: 80 }}>{label}:</span>
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card">
            <div className="card-header"><h2>Cập nhật thông tin</h2></div>
            <div className="card-body">
              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
              {msg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>✅ {msg}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input type="date" value={form.dateOfBirth ?? ''} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value || undefined }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Học hàm / Học vị</label>
                    <input value={form.academicTitle ?? ''} onChange={e => setForm(f => ({ ...f, academicTitle: e.target.value }))} placeholder="VD: Tiến sĩ, Thạc sĩ" />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select value={form.gender ?? ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value ? Number(e.target.value) : undefined }))}>
                      <option value="">-- Không xác định --</option>
                      <option value="0">Nam</option>
                      <option value="1">Nữ</option>
                      <option value="2">Khác</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Chuyên ngành</label>
                  <input value={form.specialization ?? ''} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Ảnh đại diện (URL)</label>
                  <input value={form.avatarUrl ?? ''} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving ? '⏳ Đang lưu…' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
