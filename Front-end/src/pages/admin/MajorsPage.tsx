import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Tag, Alert, Row, Col } from 'antd';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { majorsApi, departmentsApi } from '../../api/services';
import type { AdminMajorDto, AdminDepartmentDto, SaveAdminMajorRequest } from '../../api/types';

const empty: SaveAdminMajorRequest = {
  departmentId: 0,
  majorCode: '',
  majorName: '',
  description: '',
  isActive: true,
};

export default function MajorsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminMajorDto | null>(null);
  const [form] = Form.useForm<SaveAdminMajorRequest>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState<AdminDepartmentDto[]>([]);
  const [filterDept, setFilterDept] = useState<string>('');

  useEffect(() => {
    departmentsApi.list({ pageSize: 100 }).then(r => setDepartments(r.items));
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(empty);
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminMajorDto) => {
    setEditing(row);
    form.setFieldsValue({
      departmentId: row.departmentId,
      majorCode: row.majorCode,
      majorName: row.majorName,
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
      if (editing) await majorsApi.update(editing.majorId, values);
      else await majorsApi.create(values);
      setModal(false);
      window.dispatchEvent(new Event('crud-refresh'));
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const deptName = (id: number) => departments.find(d => d.departmentId === id)?.departmentName ?? id;

  return (
    <>
      <CrudPage<AdminMajorDto & { [key: string]: unknown }>
        title="Ngành học"
        fetchList={p =>
          majorsApi.list({
            ...p,
            ...(filterDept ? { departmentId: Number(filterDept) } : {}),
          }) as never
        }
        idKey="majorId"
        filterParams={filterDept ? { departmentId: Number(filterDept) } : {}}
        columns={[
          {
            key: 'majorCode',
            header: 'Mã ngành',
            render: r => <Tag color="blue">{String(r.majorCode)}</Tag>,
          },
          { key: 'majorName', header: 'Tên ngành' },
          {
            key: 'departmentId',
            header: 'Khoa',
            render: r => <span>{deptName(r.departmentId as number)}</span>,
          },
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
        filters={
          <Select
            style={{ width: 220 }}
            placeholder="Tất cả khoa"
            allowClear
            value={filterDept || undefined}
            onChange={val => setFilterDept(val ?? '')}
            options={departments.map(d => ({ value: String(d.departmentId), label: d.departmentName }))}
          />
        }
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await majorsApi.delete(row.majorId);
        }}
      />

      <Modal
        title={editing ? 'Sửa ngành' : 'Thêm ngành'}
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
          <Form.Item
            name="departmentId"
            label="Khoa trực thuộc"
            rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
          >
            <Select
              placeholder="-- Chọn khoa --"
              options={departments.map(d => ({ value: d.departmentId, label: d.departmentName }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={10}>
              <Form.Item
                name="majorCode"
                label="Mã ngành"
                rules={[{ required: true, message: 'Vui lòng nhập mã ngành' }]}
              >
                <Input placeholder="VD: CNTT" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={14}>
              <Form.Item
                name="majorName"
                label="Tên ngành"
                rules={[{ required: true, message: 'Vui lòng nhập tên ngành' }]}
              >
                <Input placeholder="VD: Công nghệ thông tin" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả tóm tắt về ngành đào tạo..." />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Đang hoạt động</span>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
