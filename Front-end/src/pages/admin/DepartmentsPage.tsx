import { useState } from 'react';
import { Modal, Form, Input, Switch, Tag, Alert } from 'antd';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { departmentsApi } from '../../api/services';
import type { AdminDepartmentDto, SaveAdminDepartmentRequest } from '../../api/types';

const empty: SaveAdminDepartmentRequest = {
  departmentCode: '',
  departmentName: '',
  description: '',
  isActive: true,
};

export default function DepartmentsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminDepartmentDto | null>(null);
  const [form] = Form.useForm<SaveAdminDepartmentRequest>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(empty);
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminDepartmentDto) => {
    setEditing(row);
    form.setFieldsValue({
      departmentCode: row.departmentCode,
      departmentName: row.departmentName,
      description: row.description ?? '',
      isActive: row.isActive,
    });
    setFormError('');
    setModal(true);
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      setFormError('');
      if (editing) await departmentsApi.update(editing.departmentId, values);
      else await departmentsApi.create(values);
      setModal(false);
      window.dispatchEvent(new Event('crud-refresh'));
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CrudPage<AdminDepartmentDto & { [key: string]: unknown }>
        title="Khoa"
        fetchList={departmentsApi.list as never}
        idKey="departmentId"
        columns={[
          {
            key: 'departmentCode',
            header: 'Mã khoa',
            render: r => <Tag color="blue">{String(r.departmentCode)}</Tag>,
          },
          { key: 'departmentName', header: 'Tên khoa' },
          {
            key: 'isActive',
            header: 'Trạng thái',
            render: r => (
              <Tag color={r.isActive ? 'success' : 'error'}>
                {r.isActive ? 'Hoạt động' : 'Ngừng'}
              </Tag>
            ),
          },
        ]}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await departmentsApi.delete(row.departmentId);
        }}
      />

      <Modal
        title={editing ? 'Sửa khoa' : 'Thêm khoa'}
        open={modal}
        onOk={save}
        onCancel={() => setModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical">
          <Form.Item
            name="departmentCode"
            label="Mã khoa"
            rules={[{ required: true, message: 'Vui lòng nhập mã khoa' }]}
          >
            <Input placeholder="VD: CNTT" />
          </Form.Item>

          <Form.Item
            name="departmentName"
            label="Tên khoa"
            rules={[{ required: true, message: 'Vui lòng nhập tên khoa' }]}
          >
            <Input placeholder="VD: Công nghệ thông tin" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả thông tin về khoa..." />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Đang hoạt động</span>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
