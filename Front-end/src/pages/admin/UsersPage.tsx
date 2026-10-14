import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Tag, Alert, Row, Col, Space, Button } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { usersApi } from '../../api/services';
import type { AdminUserDto, AdminRoleDto, CreateAdminUserRequest, UpdateAdminUserRequest } from '../../api/types';

export default function UsersPage() {
  const [modal, setModal] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [editing, setEditing] = useState<AdminUserDto | null>(null);
  const [roles, setRoles] = useState<AdminRoleDto[]>([]);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form] = Form.useForm<any>();
  const [pwdForm] = Form.useForm<{ password: string }>();

  useEffect(() => {
    usersApi.roles().then(setRoles);
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      roleId: roles[0]?.roleId ?? 0,
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      isActive: true,
    });
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminUserDto) => {
    setEditing(row);
    form.setFieldsValue({
      roleId: row.roleId,
      username: row.username,
      email: row.email,
      fullName: row.fullName,
      phone: row.phone ?? '',
      isActive: row.isActive,
    });
    setFormError('');
    setModal(true);
  };

  const openPwd = (row: AdminUserDto) => {
    setEditing(row);
    pwdForm.resetFields();
    setFormError('');
    setPwdModal(true);
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      setFormError('');
      if (editing) {
        await usersApi.update(editing.userId, {
          email: values.email,
          fullName: values.fullName,
          phone: values.phone || undefined,
          isActive: values.isActive,
        } as UpdateAdminUserRequest);

        if (values.roleId !== editing.roleId) {
          await usersApi.setRole(editing.userId, { roleId: values.roleId });
        }
      } else {
        await usersApi.create(values as CreateAdminUserRequest);
      }
      setModal(false);
      window.dispatchEvent(new Event('crud-refresh'));
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const savePwd = async () => {
    if (!editing) return;
    try {
      const values = await pwdForm.validateFields();
      setSaving(true);
      setFormError('');
      await usersApi.resetPassword(editing.userId, { password: values.password });
      setPwdModal(false);
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
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
          {
            key: 'roleCode',
            header: 'Vai trò',
            render: r => <Tag color="blue">{String(r.roleCode)}</Tag>,
          },
          {
            key: 'isActive',
            header: 'Trạng thái',
            render: r => (
              <Tag color={r.isActive ? 'success' : 'error'}>
                {r.isActive ? 'Hoạt động' : 'Bị khóa'}
              </Tag>
            ),
          },
        ]}
        filters={
          <Space wrap>
            <Select
              style={{ width: 180 }}
              placeholder="Tất cả vai trò"
              allowClear
              value={filterRole || undefined}
              onChange={val => setFilterRole(val ?? '')}
              options={roles.map(r => ({ value: String(r.roleId), label: `${r.roleName} (${r.roleCode})` }))}
            />
            <Select
              style={{ width: 160 }}
              placeholder="Tất cả trạng thái"
              allowClear
              value={filterActive !== '' ? filterActive : undefined}
              onChange={val => setFilterActive(val ?? '')}
              options={[
                { value: 'true', label: 'Đang hoạt động' },
                { value: 'false', label: 'Bị khóa' },
              ]}
            />
          </Space>
        }
        extraActions={row => (
          <Button
            size="small"
            icon={<KeyOutlined />}
            onClick={() => openPwd(row as unknown as AdminUserDto)}
          >
            Mật khẩu
          </Button>
        )}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await usersApi.update(row.userId, {
            email: row.email,
            fullName: row.fullName,
            phone: row.phone ?? undefined,
            isActive: false,
          });
        }}
        deleteLabel="Khóa"
        deleteConfirmMessage="Bạn có chắc muốn khóa tài khoản này?"
      />

      {/* Create / Edit User Modal */}
      <Modal
        title={editing ? `Sửa tài khoản: ${editing.username}` : 'Thêm tài khoản mới'}
        open={modal}
        onOk={save}
        onCancel={() => setModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={560}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical">
          {!editing && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                >
                  <Input placeholder="VD: teacher01" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu khởi tạo"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                    { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                  ]}
                >
                  <Input.Password placeholder="Tối thiểu 6 ký tự" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            name="roleId"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              options={roles.map(r => ({ value: r.roleId, label: `${r.roleName} (${r.roleCode})` }))}
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Tài khoản đang hoạt động</span>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        title={`Đặt lại mật khẩu: ${editing?.username}`}
        open={pwdModal}
        onOk={savePwd}
        onCancel={() => setPwdModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Đặt mật khẩu"
        cancelText="Hủy"
        width={420}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
