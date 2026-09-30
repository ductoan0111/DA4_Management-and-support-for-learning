import { useState, useEffect } from 'react';
import { ApiError } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { usersApi } from '../../api/services';
import type { AdminUserDto, AdminRoleDto, CreateAdminUserRequest, UpdateAdminUserRequest } from '../../api/types';

export default function UsersPage() {
  const [modal, setModal] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [editing, setEditing] = useState<AdminUserDto | null>(null);
  const [roles, setRoles] = useState<AdminRoleDto[]>([]);
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Create form
  const [createForm, setCreateForm] = useState<CreateAdminUserRequest>({
    roleId: 0, username: '', email: '', password: '', fullName: '', phone: '', isActive: true,
  });

  // Update form
  const [updateForm, setUpdateForm] = useState<UpdateAdminUserRequest>({
    email: '', fullName: '', phone: '', isActive: true,
  });

  // Password form
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    usersApi.roles().then(setRoles);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setCreateForm({ roleId: roles[0]?.roleId ?? 0, username: '', email: '', password: '', fullName: '', phone: '', isActive: true });
    setFormError(''); setModal(true);
  };

  const openEdit = (row: AdminUserDto) => {
    setEditing(row);
    setUpdateForm({ email: row.email, fullName: row.fullName, phone: row.phone ?? '', isActive: row.isActive });
    setFormError(''); setModal(true);
  };

  const openPwd = (row: AdminUserDto) => {
    setEditing(row); setNewPassword(''); setFormError(''); setPwdModal(true);
  };

  const save = async () => {
    setSaving(true); setFormError('');
    try {
      if (editing) await usersApi.update(editing.userId, updateForm);
      else await usersApi.create(createForm);
      setModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const savePwd = async () => {
    if (!editing) return;
    setSaving(true); setFormError('');
    try {
      await usersApi.resetPassword(editing.userId, { password: newPassword });
      setPwdModal(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally { setSaving(false); }
  };

  const filterParams: Record<string, string | number | boolean | undefined> = {};
  if (filterRole) filterParams.roleId = Number(filterRole);
  if (filterActive !== '') filterParams.isActive = filterActive === 'true';

  return (
    <>
      <CrudPage<AdminUserDto & { [key: string]: unknown }>
        title="Tài khoản"
        fetchList={p => usersApi.list({ ...p, ...filterParams }) as never}
        idKey="userId"
        filterParams={filterParams}
        columns={[
          { key: 'username', header: 'Username' },
          { key: 'fullName', header: 'Họ tên' },
          { key: 'email', header: 'Email' },
          { key: 'roleCode', header: 'Vai trò', render: r => <span className="badge badge-info">{r.roleCode as string}</span> },
          { key: 'isActive', header: 'Trạng thái', render: r => <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>{r.isActive ? 'Hoạt động' : 'Bị khóa'}</span> },
        ]}
        filters={<>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">-- Tất cả vai trò --</option>
            {roles.map(r => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
          </select>
          <select value={filterActive} onChange={e => setFilterActive(e.target.value)}>
            <option value="">-- Tất cả TT --</option>
            <option value="true">Hoạt động</option>
            <option value="false">Bị khóa</option>
          </select>
        </>}
        extraActions={row => (
          <button className="btn btn-secondary btn-sm" onClick={() => openPwd(row as unknown as AdminUserDto)}>🔑 Mật khẩu</button>
        )}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => { await usersApi.update(row.userId, { email: row.email, fullName: row.fullName, phone: row.phone ?? undefined, isActive: false }); }}
      />

      {/* Create/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              {!editing && <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên đăng nhập *</label>
                    <input value={createForm.username} onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu * (≥12 ký tự)</label>
                    <input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Vai trò *</label>
                  <select value={createForm.roleId} onChange={e => setCreateForm(f => ({ ...f, roleId: Number(e.target.value) }))}>
                    <option value={0}>-- Chọn vai trò --</option>
                    {roles.map(r => <option key={r.roleId} value={r.roleId}>{r.roleName} ({r.roleCode})</option>)}
                  </select>
                </div>
              </>}
              <div className="form-group">
                <label>Họ và tên *</label>
                <input value={editing ? updateForm.fullName : createForm.fullName}
                  onChange={e => editing ? setUpdateForm(f => ({ ...f, fullName: e.target.value })) : setCreateForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={editing ? updateForm.email : createForm.email}
                    onChange={e => editing ? setUpdateForm(f => ({ ...f, email: e.target.value })) : setCreateForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input value={editing ? (updateForm.phone ?? '') : (createForm.phone ?? '')}
                    onChange={e => editing ? setUpdateForm(f => ({ ...f, phone: e.target.value })) : setCreateForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <label className="checkbox-row">
                <input type="checkbox"
                  checked={editing ? updateForm.isActive : createForm.isActive}
                  onChange={e => editing ? setUpdateForm(f => ({ ...f, isActive: e.target.checked })) : setCreateForm(f => ({ ...f, isActive: e.target.checked }))} />
                Tài khoản hoạt động
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {pwdModal && editing && (
        <div className="modal-overlay" onClick={() => setPwdModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đặt lại mật khẩu — {editing.username}</h3>
              <button className="modal-close" onClick={() => setPwdModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label>Mật khẩu mới * (12–128 ký tự)</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPwdModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={savePwd} disabled={saving}>{saving ? 'Đang lưu…' : 'Đặt mật khẩu'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
