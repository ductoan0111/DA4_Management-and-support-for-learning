import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Tag, Alert, Row, Col, Space } from 'antd';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { teachersApi, departmentsApi, usersApi } from '../../api/services';
import type { AdminTeacherDto, AdminDepartmentDto, SaveAdminTeacherRequest } from '../../api/types';

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Ngừng công tác', color: 'error' },
  1: { label: 'Đang công tác', color: 'success' },
};

const empty: SaveAdminTeacherRequest = {
  userId: 0,
  teacherCode: '',
  departmentId: 0,
  academicTitle: '',
  specialization: '',
  status: 1,
};

export default function TeachersPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminTeacherDto | null>(null);
  const [form] = Form.useForm<SaveAdminTeacherRequest>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState<AdminDepartmentDto[]>([]);
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [userOptions, setUserOptions] = useState<Array<{ userId: number; username: string; fullName: string }>>([]);

  useEffect(() => {
    departmentsApi.list({ pageSize: 100 }).then(r => setDepartments(r.items));
  }, []);

  useEffect(() => {
    if (!modal) return;
    usersApi
      .list({ roleId: undefined, pageSize: 100 })
      .then(r =>
        setUserOptions(
          r.items
            .filter(u => u.roleCode === 'TEACHER')
            .map(u => ({ userId: u.userId, username: u.username, fullName: u.fullName }))
        )
      );
  }, [modal]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(empty);
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminTeacherDto) => {
    setEditing(row);
    form.setFieldsValue({
      userId: row.userId,
      teacherCode: row.teacherCode,
      departmentId: row.departmentId,
      academicTitle: row.academicTitle ?? '',
      specialization: row.specialization ?? '',
      status: row.status,
    });
    setFormError('');
    setModal(true);
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      setFormError('');
      if (editing) await teachersApi.update(editing.teacherId, values);
      else await teachersApi.create(values);
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

  const filterParams: Record<string, string | number | boolean | undefined> = {};
  if (filterDept) filterParams.departmentId = Number(filterDept);
  if (filterStatus !== '') filterParams.status = Number(filterStatus);

  return (
    <>
      <CrudPage<AdminTeacherDto & { [key: string]: unknown }>
        title="Giảng viên"
        fetchList={p => teachersApi.list({ ...p, ...filterParams }) as never}
        idKey="teacherId"
        filterParams={filterParams}
        columns={[
          {
            key: 'teacherCode',
            header: 'Mã GV',
            render: r => <Tag color="blue">{String(r.teacherCode)}</Tag>,
          },
          { key: 'fullName', header: 'Họ tên' },
          {
            key: 'departmentId',
            header: 'Khoa',
            render: r => <span>{deptName(r.departmentId as number)}</span>,
          },
          {
            key: 'academicTitle',
            header: 'Học hàm/vị',
            render: r => <span>{r.academicTitle || '—'}</span>,
          },
          {
            key: 'specialization',
            header: 'Chuyên ngành',
            render: r => <span>{r.specialization || '—'}</span>,
          },
          {
            key: 'status',
            header: 'Trạng thái',
            render: r => {
              const info = STATUS_CONFIG[r.status as number] || { label: 'Khác', color: 'default' };
              return <Tag color={info.color}>{info.label}</Tag>;
            },
          },
        ]}
        filters={
          <Space wrap>
            <Select
              style={{ width: 220 }}
              placeholder="Tất cả khoa"
              allowClear
              value={filterDept || undefined}
              onChange={val => setFilterDept(val ?? '')}
              options={departments.map(d => ({ value: String(d.departmentId), label: d.departmentName }))}
            />
            <Select
              style={{ width: 180 }}
              placeholder="Tất cả trạng thái"
              allowClear
              value={filterStatus !== '' ? filterStatus : undefined}
              onChange={val => setFilterStatus(val ?? '')}
              options={[
                { value: '1', label: 'Đang công tác' },
                { value: '0', label: 'Ngừng công tác' },
              ]}
            />
          </Space>
        }
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await teachersApi.delete(row.teacherId);
        }}
      />

      <Modal
        title={editing ? 'Sửa thông tin giảng viên' : 'Thêm giảng viên'}
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
            name="userId"
            label="Tài khoản liên kết (TEACHER role)"
            rules={[{ required: true, message: 'Vui lòng chọn tài khoản' }]}
          >
            {editing ? (
              <Input disabled value={`${editing.fullName} (User #${editing.userId})`} />
            ) : (
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="-- Chọn tài khoản người dùng --"
                options={userOptions.map(u => ({ value: u.userId, label: `${u.username} — ${u.fullName}` }))}
              />
            )}
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={10}>
              <Form.Item
                name="teacherCode"
                label="Mã giảng viên"
                rules={[{ required: true, message: 'Vui lòng nhập mã giảng viên' }]}
              >
                <Input placeholder="VD: GV001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={14}>
              <Form.Item
                name="departmentId"
                label="Khoa công tác"
                rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
              >
                <Select
                  placeholder="-- Chọn khoa --"
                  options={departments.map(d => ({ value: d.departmentId, label: d.departmentName }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="academicTitle" label="Học hàm / Học vị">
                <Input placeholder="VD: Tiến sĩ, Thạc sĩ, PGS.TS" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="specialization" label="Chuyên ngành">
                <Input placeholder="VD: Mạng máy tính" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { value: 1, label: 'Đang công tác' },
                { value: 0, label: 'Ngừng công tác' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
