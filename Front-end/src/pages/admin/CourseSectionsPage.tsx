import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Tag, Alert, Row, Col, Space } from 'antd';
import { UsergroupAddOutlined } from '@ant-design/icons';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { sectionsApi, coursesApi, semestersApi } from '../../api/services';
import type { AdminCourseSectionDto, AdminCourseDto, AdminSemesterDto, SaveAdminCourseSectionRequest } from '../../api/types';
import SectionManagementModal from './SectionManagementModal';

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Đóng', color: 'error' },
  1: { label: 'Mở', color: 'success' },
  2: { label: 'Kết thúc', color: 'default' },
};

const empty: SaveAdminCourseSectionRequest = {
  courseId: 0,
  semesterId: 0,
  sectionCode: '',
  sectionName: '',
  maxStudents: 40,
  status: 1,
};

export default function CourseSectionsPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminCourseSectionDto | null>(null);
  const [form] = Form.useForm<SaveAdminCourseSectionRequest>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [semesters, setSemesters] = useState<AdminSemesterDto[]>([]);
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterSemester, setFilterSemester] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [managingId, setManagingId] = useState<number | null>(null);

  useEffect(() => {
    coursesApi.list({ pageSize: 100 }).then(r => setCourses(r.items));
    semestersApi.list({ pageSize: 50 }).then(r => setSemesters(r.items));
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(empty);
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminCourseSectionDto) => {
    setEditing(row);
    form.setFieldsValue({
      courseId: row.courseId,
      semesterId: row.semesterId,
      sectionCode: row.sectionCode,
      sectionName: row.sectionName ?? '',
      maxStudents: row.maxStudents ?? 40,
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
      if (editing) await sectionsApi.update(editing.sectionId, values);
      else await sectionsApi.create(values);
      setModal(false);
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const filterParams: Record<string, string | number | boolean | undefined> = {};
  if (filterCourse) filterParams.courseId = Number(filterCourse);
  if (filterSemester) filterParams.semesterId = Number(filterSemester);
  if (filterStatus !== '') filterParams.status = Number(filterStatus);

  const courseName = (id: number) => courses.find(c => c.courseId === id)?.courseName ?? id;
  const semesterName = (id: number) => semesters.find(s => s.semesterId === id)?.semesterName ?? id;

  return (
    <>
      <CrudPage<AdminCourseSectionDto & { [key: string]: unknown }>
        title="Lớp học phần"
        fetchList={p => sectionsApi.list({ ...p, ...filterParams }) as never}
        idKey="sectionId"
        filterParams={filterParams}
        columns={[
          {
            key: 'sectionCode',
            header: 'Mã lớp HP',
            render: r => <Tag color="blue">{String(r.sectionCode)}</Tag>,
          },
          {
            key: 'courseId',
            header: 'Môn học',
            render: r => <span>{courseName(r.courseId as number)}</span>,
          },
          {
            key: 'semesterId',
            header: 'Học kỳ',
            render: r => <span>{semesterName(r.semesterId as number)}</span>,
          },
          {
            key: 'maxStudents',
            header: 'Sĩ số tối đa',
            render: r => <span>{r.maxStudents ?? '∞'}</span>,
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
              style={{ width: 180 }}
              placeholder="Tất cả học kỳ"
              value={filterSemester || undefined}
              onChange={val => setFilterSemester(val ?? '')}
              allowClear
              options={semesters.map(s => ({ value: String(s.semesterId), label: s.semesterName }))}
            />
            <Select
              showSearch
              optionFilterProp="label"
              style={{ width: 220 }}
              placeholder="Tất cả môn học"
              value={filterCourse || undefined}
              onChange={val => setFilterCourse(val ?? '')}
              allowClear
              options={courses.map(c => ({ value: String(c.courseId), label: c.courseName }))}
            />
            <Select
              style={{ width: 140 }}
              placeholder="Trạng thái"
              value={filterStatus !== '' ? filterStatus : undefined}
              onChange={val => setFilterStatus(val ?? '')}
              allowClear
              options={[
                { value: '1', label: 'Đang mở' },
                { value: '0', label: 'Đã đóng' },
                { value: '2', label: 'Kết thúc' },
              ]}
            />
          </Space>
        }
        extraActions={row => (
          <Button
            size="small"
            icon={<UsergroupAddOutlined />}
            onClick={() => setManagingId(row.sectionId)}
          >
            Quản lý
          </Button>
        )}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await sectionsApi.delete(row.sectionId);
        }}
      />

      <Modal
        title={editing ? 'Sửa lớp học phần' : 'Thêm lớp học phần'}
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
            name="courseId"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="-- Chọn môn học --"
              options={courses.map(c => ({ value: c.courseId, label: `${c.courseCode} — ${c.courseName}` }))}
            />
          </Form.Item>

          <Form.Item
            name="semesterId"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
          >
            <Select
              placeholder="-- Chọn học kỳ --"
              options={semesters.map(s => ({ value: s.semesterId, label: `${s.semesterName} (${s.academicYear})` }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item
                name="sectionCode"
                label="Mã lớp học phần"
                rules={[{ required: true, message: 'Vui lòng nhập mã lớp HP' }]}
              >
                <Input placeholder="VD: CS101.01" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item name="maxStudents" label="Sĩ số tối đa">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="sectionName" label="Tên lớp HP (nếu có)">
            <Input placeholder="VD: Lớp lý thuyết sáng thứ 2" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select
              options={[
                { value: 1, label: 'Mở' },
                { value: 0, label: 'Đóng' },
                { value: 2, label: 'Kết thúc' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {managingId !== null && (
        <SectionManagementModal sectionId={managingId} onClose={() => setManagingId(null)} />
      )}
    </>
  );
}
