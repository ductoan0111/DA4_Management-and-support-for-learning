import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Tag, Alert, Row, Col } from 'antd';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { coursesApi, departmentsApi } from '../../api/services';
import type { AdminCourseDto, AdminDepartmentDto, SaveAdminCourseRequest } from '../../api/types';

const empty: SaveAdminCourseRequest = {
  departmentId: 0,
  courseCode: '',
  courseName: '',
  credits: 3,
  isActive: true,
};

export default function CoursesPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminCourseDto | null>(null);
  const [form] = Form.useForm<SaveAdminCourseRequest>();
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

  const openEdit = (row: AdminCourseDto) => {
    setEditing(row);
    form.setFieldsValue({
      departmentId: row.departmentId,
      courseCode: row.courseCode,
      courseName: row.courseName,
      credits: row.credits,
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
      if (editing) await coursesApi.update(editing.courseId, values);
      else await coursesApi.create(values);
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
      <CrudPage<AdminCourseDto & { [key: string]: unknown }>
        title="Môn học"
        fetchList={p =>
          coursesApi.list({
            ...p,
            ...(filterDept ? { departmentId: Number(filterDept) } : {}),
          }) as never
        }
        idKey="courseId"
        filterParams={filterDept ? { departmentId: Number(filterDept) } : {}}
        columns={[
          {
            key: 'courseCode',
            header: 'Mã môn',
            render: r => <Tag color="blue">{String(r.courseCode)}</Tag>,
          },
          { key: 'courseName', header: 'Tên môn' },
          {
            key: 'departmentId',
            header: 'Khoa',
            render: r => <span>{deptName(r.departmentId as number)}</span>,
          },
          {
            key: 'credits',
            header: 'Số TC',
            render: r => <Tag>{r.credits} tín chỉ</Tag>,
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
          await coursesApi.delete(row.courseId);
        }}
      />

      <Modal
        title={editing ? 'Sửa môn học' : 'Thêm môn học'}
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
            label="Khoa phụ trách"
            rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
          >
            <Select
              placeholder="-- Chọn khoa --"
              options={departments.map(d => ({ value: d.departmentId, label: d.departmentName }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="courseCode"
                label="Mã môn học"
                rules={[{ required: true, message: 'Vui lòng nhập mã môn' }]}
              >
                <Input placeholder="VD: CS101" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="credits"
                label="Số tín chỉ (1–15)"
                rules={[{ required: true, message: 'Nhập số TC' }]}
              >
                <InputNumber min={1} max={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="courseName"
            label="Tên môn học"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn' }]}
          >
            <Input placeholder="VD: Nhập môn lập trình" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả tóm tắt">
            <Input.TextArea rows={3} placeholder="Mô tả mục tiêu, kiến thức môn học..." />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Đang hoạt động</span>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
