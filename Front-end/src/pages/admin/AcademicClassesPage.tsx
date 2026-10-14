import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Tag, Alert, Row, Col } from 'antd';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { academicClassesApi, majorsApi } from '../../api/services';
import type { AdminAcademicClassDto, AdminMajorDto, SaveAdminAcademicClassRequest } from '../../api/types';

const empty: SaveAdminAcademicClassRequest = {
  majorId: 0,
  classCode: '',
  className: '',
  intakeYear: new Date().getFullYear(),
  graduationYear: undefined,
  isActive: true,
};

export default function AcademicClassesPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminAcademicClassDto | null>(null);
  const [form] = Form.useForm<SaveAdminAcademicClassRequest>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [majors, setMajors] = useState<AdminMajorDto[]>([]);
  const [filterMajor, setFilterMajor] = useState<string>('');

  useEffect(() => {
    majorsApi.list({ pageSize: 100 }).then(r => setMajors(r.items));
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(empty);
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminAcademicClassDto) => {
    setEditing(row);
    form.setFieldsValue({
      majorId: row.majorId,
      classCode: row.classCode,
      className: row.className,
      intakeYear: row.intakeYear,
      graduationYear: row.graduationYear ?? undefined,
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
      if (editing) await academicClassesApi.update(editing.academicClassId, values);
      else await academicClassesApi.create(values);
      setModal(false);
      window.dispatchEvent(new Event('crud-refresh'));
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const majorName = (id: number) => majors.find(m => m.majorId === id)?.majorName ?? id;

  return (
    <>
      <CrudPage<AdminAcademicClassDto & { [key: string]: unknown }>
        title="Lớp hành chính"
        fetchList={p =>
          academicClassesApi.list({
            ...p,
            ...(filterMajor ? { majorId: Number(filterMajor) } : {}),
          }) as never
        }
        idKey="academicClassId"
        filterParams={filterMajor ? { majorId: Number(filterMajor) } : {}}
        columns={[
          {
            key: 'classCode',
            header: 'Mã lớp',
            render: r => <Tag color="blue">{String(r.classCode)}</Tag>,
          },
          { key: 'className', header: 'Tên lớp' },
          {
            key: 'majorId',
            header: 'Ngành',
            render: r => <span>{majorName(r.majorId as number)}</span>,
          },
          { key: 'intakeYear', header: 'Khóa tuyển sinh' },
          {
            key: 'graduationYear',
            header: 'Năm tốt nghiệp',
            render: r => <span>{r.graduationYear ? String(r.graduationYear) : '—'}</span>,
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
            placeholder="Tất cả ngành học"
            allowClear
            value={filterMajor || undefined}
            onChange={val => setFilterMajor(val ?? '')}
            options={majors.map(m => ({ value: String(m.majorId), label: m.majorName }))}
          />
        }
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await academicClassesApi.delete(row.academicClassId);
        }}
      />

      <Modal
        title={editing ? 'Sửa lớp hành chính' : 'Thêm lớp hành chính'}
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
            name="majorId"
            label="Chuyên ngành"
            rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}
          >
            <Select
              placeholder="-- Chọn ngành học --"
              options={majors.map(m => ({ value: m.majorId, label: `${m.majorCode} — ${m.majorName}` }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={10}>
              <Form.Item
                name="classCode"
                label="Mã lớp"
                rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}
              >
                <Input placeholder="VD: CNTT2024A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={14}>
              <Form.Item
                name="className"
                label="Tên lớp"
                rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}
              >
                <Input placeholder="VD: Lớp Công nghệ thông tin K2024A" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="intakeYear"
                label="Năm nhập học"
                rules={[{ required: true, message: 'Vui lòng nhập năm nhập học' }]}
              >
                <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="graduationYear" label="Năm tốt nghiệp dự kiến">
                <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Đang hoạt động</span>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
