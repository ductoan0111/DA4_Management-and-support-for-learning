import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Tag, Alert, Row, Col, Space } from 'antd';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { studentsApi, majorsApi, academicClassesApi, usersApi } from '../../api/services';
import type { AdminStudentDto, AdminMajorDto, AdminAcademicClassDto, CreateAdminStudentRequest, UpdateAdminStudentRequest } from '../../api/types';

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Ngừng học', color: 'error' },
  1: { label: 'Đang học', color: 'success' },
  2: { label: 'Tốt nghiệp', color: 'blue' },
};

export default function StudentsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminStudentDto | null>(null);
  const [form] = Form.useForm<any>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [majors, setMajors] = useState<AdminMajorDto[]>([]);
  const [classes, setClasses] = useState<AdminAcademicClassDto[]>([]);
  const [filterMajor, setFilterMajor] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [userOptions, setUserOptions] = useState<Array<{ userId: number; username: string; fullName: string }>>([]);

  useEffect(() => {
    majorsApi.list({ pageSize: 100 }).then(r => setMajors(r.items));
  }, []);

  useEffect(() => {
    if (!modal) return;
    usersApi
      .list({ pageSize: 100 })
      .then(r =>
        setUserOptions(
          r.items
            .filter(u => u.roleCode === 'STUDENT')
            .map(u => ({ userId: u.userId, username: u.username, fullName: u.fullName }))
        )
      );
  }, [modal]);

  const onMajorChange = (majorId?: number) => {
    if (!majorId) {
      setClasses([]);
      form.setFieldValue('academicClassId', undefined);
      return;
    }
    academicClassesApi.list({ majorId, pageSize: 100 }).then(r => {
      setClasses(r.items);
    });
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      userId: undefined,
      studentCode: '',
      majorId: undefined,
      academicClassId: undefined,
      enrollmentYear: new Date().getFullYear(),
      status: 1,
    });
    setClasses([]);
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminStudentDto) => {
    setEditing(row);
    if (row.majorId) {
      academicClassesApi.list({ majorId: row.majorId, pageSize: 100 }).then(r => setClasses(r.items));
    }
    form.setFieldsValue({
      studentCode: row.studentCode,
      academicClassId: row.academicClassId ?? undefined,
      majorId: row.majorId,
      enrollmentYear: row.enrollmentYear,
      status: row.status,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone ?? '',
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
      if (editing) {
        await studentsApi.update(editing.studentId, values as UpdateAdminStudentRequest);
      } else {
        await studentsApi.create(values as CreateAdminStudentRequest);
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

  const filterParams: Record<string, string | number | boolean | undefined> = {};
  if (filterMajor) filterParams.majorId = Number(filterMajor);
  if (filterStatus !== '') filterParams.status = Number(filterStatus);

  return (
    <>
      <CrudPage<AdminStudentDto & { [key: string]: unknown }>
        title="Sinh viên"
        fetchList={p => studentsApi.list({ ...p, ...filterParams }) as never}
        idKey="studentId"
        filterParams={filterParams}
        columns={[
          {
            key: 'studentCode',
            header: 'Mã SV',
            render: r => <Tag color="blue">{String(r.studentCode)}</Tag>,
          },
          { key: 'fullName', header: 'Họ tên' },
          { key: 'email', header: 'Email' },
          { key: 'majorName', header: 'Ngành' },
          {
            key: 'className',
            header: 'Lớp HC',
            render: r => (r.className ? <span>{r.className as string}</span> : <span style={{ color: '#94a3b8' }}>—</span>),
          },
          { key: 'enrollmentYear', header: 'Năm nhập học' },
          {
            key: 'status',
            header: 'TT học tập',
            render: r => {
              const info = STATUS_CONFIG[r.status as number] || { label: 'Khác', color: 'default' };
              return <Tag color={info.color}>{info.label}</Tag>;
            },
          },
          {
            key: 'isActive',
            header: 'Tài khoản',
            render: r => (
              <Tag color={r.isActive ? 'success' : 'error'}>
                {r.isActive ? 'Hoạt động' : 'Khóa'}
              </Tag>
            ),
          },
        ]}
        filters={
          <Space wrap>
            <Select
              style={{ width: 220 }}
              placeholder="Tất cả ngành học"
              allowClear
              value={filterMajor || undefined}
              onChange={val => setFilterMajor(val ?? '')}
              options={majors.map(m => ({ value: String(m.majorId), label: m.majorName }))}
            />
            <Select
              style={{ width: 160 }}
              placeholder="Tất cả trạng thái"
              allowClear
              value={filterStatus !== '' ? filterStatus : undefined}
              onChange={val => setFilterStatus(val ?? '')}
              options={[
                { value: '1', label: 'Đang học' },
                { value: '0', label: 'Ngừng học' },
                { value: '2', label: 'Tốt nghiệp' },
              ]}
            />
          </Space>
        }
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await studentsApi.delete(row.studentId);
        }}
      />

      <Modal
        title={editing ? `Sửa sinh viên: ${editing.fullName}` : 'Thêm sinh viên mới'}
        open={modal}
        onOk={save}
        onCancel={() => setModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={620}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item
              name="userId"
              label="Tài khoản liên kết (STUDENT role)"
              rules={[{ required: true, message: 'Vui lòng chọn tài khoản sinh viên' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="-- Chọn tài khoản người dùng --"
                options={userOptions.map(u => ({ value: u.userId, label: `${u.username} — ${u.fullName}` }))}
              />
            </Form.Item>
          )}

          {editing && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="fullName" label="Họ và tên">
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="email" label="Email">
                  <Input placeholder="sv@example.com" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="studentCode"
                label="Mã sinh viên"
                rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên' }]}
              >
                <Input placeholder="VD: SV001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="enrollmentYear"
                label="Năm nhập học"
                rules={[{ required: true, message: 'Nhập năm nhập học' }]}
              >
                <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="majorId"
                label="Chuyên ngành"
                rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành' }]}
              >
                <Select
                  placeholder="-- Chọn ngành --"
                  onChange={onMajorChange}
                  options={majors.map(m => ({ value: m.majorId, label: m.majorName }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="academicClassId" label="Lớp hành chính">
                <Select
                  placeholder="-- Chọn lớp hành chính --"
                  allowClear
                  options={classes.map(c => ({ value: c.academicClassId, label: c.className }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Tình trạng học tập">
                <Select
                  options={[
                    { value: 1, label: 'Đang học' },
                    { value: 0, label: 'Ngừng học' },
                    { value: 2, label: 'Tốt nghiệp' },
                  ]}
                />
              </Form.Item>
            </Col>
            {editing && (
              <Col xs={24} sm={12}>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input placeholder="0912345678" />
                </Form.Item>
              </Col>
            )}
          </Row>

          {editing && (
            <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch /> <span style={{ marginLeft: 8 }}>Tài khoản đang hoạt động</span>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
