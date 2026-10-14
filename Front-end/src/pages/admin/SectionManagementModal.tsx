import { useState, useEffect } from 'react';
import { Modal, Tabs, Table, Select, Checkbox, Button, Tag, Popconfirm, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  StarFilled,
} from '@ant-design/icons';
import { sectionsApi, teachersApi, studentsApi } from '../../api/services';
import type { AdminSectionTeacherDto, AdminEnrollmentDto, AdminTeacherDto, AdminStudentDto, PagedResult } from '../../api/types';
import { getApiErrorMessage } from '../../api/client';
import SectionSchedulesTab from './SectionSchedulesTab';
import SectionExamsTab from './SectionExamsTab';

const ENROLL_STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: 'Đã hủy', color: 'error' },
  1: { label: 'Đang học', color: 'success' },
  2: { label: 'Hoàn thành', color: 'blue' },
};

async function loadAllPages<T>(fetchPage: (page: number) => Promise<PagedResult<T>>): Promise<T[]> {
  const first = await fetchPage(1);
  if (first.totalPages <= 1) return first.items;
  const remaining = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) => fetchPage(index + 2))
  );
  return [first, ...remaining].flatMap(result => result.items);
}

export default function SectionManagementModal({
  sectionId,
  onClose,
}: {
  sectionId: number;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>('teachers');
  const [teachers, setTeachers] = useState<AdminSectionTeacherDto[]>([]);
  const [students, setStudents] = useState<AdminEnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Teacher assignment
  const [allTeachers, setAllTeachers] = useState<AdminTeacherDto[]>([]);
  const [selTeacher, setSelTeacher] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState(false);

  // Student enrollment
  const [allStudents, setAllStudents] = useState<AdminStudentDto[]>([]);
  const [selStudent, setSelStudent] = useState<string>('');
  const [enrollStatus, setEnrollStatus] = useState<number>(1);

  useEffect(() => {
    Promise.all([
      loadAllPages(page => sectionsApi.teachers(sectionId, page, 100)).then(setTeachers),
      loadAllPages(page => sectionsApi.students(sectionId, page, 100)).then(setStudents),
      loadAllPages(page => teachersApi.list({ page, pageSize: 100, status: 1 })).then(setAllTeachers),
      loadAllPages(page => studentsApi.list({ page, pageSize: 100, status: 1 })).then(setAllStudents),
    ])
      .catch(() => setError('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [sectionId]);

  const refresh = () => {
    Promise.all([
      loadAllPages(page => sectionsApi.teachers(sectionId, page, 100)).then(setTeachers),
      loadAllPages(page => sectionsApi.students(sectionId, page, 100)).then(setStudents),
    ]).catch(() => setError('Không thể làm mới dữ liệu lớp học phần.'));
  };

  const assignTeacher = async () => {
    if (!selTeacher) return;
    try {
      await sectionsApi.assignTeacher(sectionId, Number(selTeacher), { isPrimary });
      setSelTeacher('');
      refresh();
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const removeTeacher = async (teacherId: number) => {
    try {
      await sectionsApi.removeTeacher(sectionId, teacherId);
      refresh();
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const enroll = async () => {
    if (!selStudent) return;
    try {
      await sectionsApi.enroll(sectionId, Number(selStudent), { status: enrollStatus });
      setSelStudent('');
      refresh();
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const cancelEnrollment = async (studentId: number) => {
    try {
      await sectionsApi.cancelEnrollment(sectionId, studentId);
      refresh();
    } catch (e) {
      alert(getApiErrorMessage(e));
    }
  };

  const teacherColumns: ColumnsType<AdminSectionTeacherDto> = [
    {
      title: 'Mã GV',
      dataIndex: 'teacherCode',
      key: 'teacherCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Họ tên giảng viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'isPrimary',
      key: 'isPrimary',
      render: (primary: boolean) =>
        primary ? (
          <Tag color="gold" icon={<StarFilled />}>
            GV Chính
          </Tag>
        ) : (
          <Tag color="default">GV Phụ</Tag>
        ),
    },
    {
      title: 'Ngày phân công',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Bỏ phân công giảng viên này?"
          onConfirm={() => removeTeacher(record.teacherId)}
          okText="Bỏ"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Bỏ
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const studentColumns: ColumnsType<AdminEnrollmentDto> = [
    {
      title: 'Mã SV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Họ tên sinh viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const info = ENROLL_STATUS_MAP[status] || { label: 'Khác', color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrolledAt',
      key: 'enrolledAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Popconfirm
          title="Hủy đăng ký của sinh viên này?"
          onConfirm={() => cancelEnrollment(record.studentId)}
          okText="Hủy ĐK"
          cancelText="Đóng"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Hủy ĐK
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={<span>Quản lý lớp học phần #{sectionId}</span>}
      open
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={900}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'teachers',
            label: (
              <span>
                <UserOutlined /> Giảng viên ({teachers.length})
              </span>
            ),
            children: (
              <div>
                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn giảng viên để phân công"
                    style={{ minWidth: 260, flex: 1 }}
                    value={selTeacher || undefined}
                    onChange={setSelTeacher}
                    options={allTeachers.map(t => ({
                      value: String(t.teacherId),
                      label: `${t.teacherCode} — ${t.fullName}`,
                    }))}
                  />
                  <Checkbox checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)}>
                    Giảng viên chính
                  </Checkbox>
                  <Button type="primary" icon={<PlusOutlined />} onClick={assignTeacher} disabled={!selTeacher}>
                    Phân công
                  </Button>
                </div>
                <Table
                  dataSource={teachers}
                  columns={teacherColumns}
                  rowKey="teacherId"
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </div>
            ),
          },
          {
            key: 'students',
            label: (
              <span>
                <TeamOutlined /> Sinh viên ({students.length})
              </span>
            ),
            children: (
              <div>
                {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn sinh viên để thêm vào lớp"
                    style={{ minWidth: 260, flex: 1 }}
                    value={selStudent || undefined}
                    onChange={setSelStudent}
                    options={allStudents.map(s => ({
                      value: String(s.studentId),
                      label: `${s.studentCode} — ${s.fullName}`,
                    }))}
                  />
                  <Select
                    style={{ width: 140 }}
                    value={enrollStatus}
                    onChange={setEnrollStatus}
                    options={[
                      { value: 1, label: 'Đang học' },
                      { value: 2, label: 'Hoàn thành' },
                      { value: 0, label: 'Đã hủy' },
                    ]}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={enroll} disabled={!selStudent}>
                    Đăng ký
                  </Button>
                </div>
                <Table
                  dataSource={students}
                  columns={studentColumns}
                  rowKey="enrollmentId"
                  loading={loading}
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                  size="small"
                />
              </div>
            ),
          },
          {
            key: 'schedules',
            label: (
              <span>
                <CalendarOutlined /> Lịch học
              </span>
            ),
            children: <SectionSchedulesTab sectionId={sectionId} />,
          },
          {
            key: 'exams',
            label: (
              <span>
                <FileTextOutlined /> Lịch thi
              </span>
            ),
            children: <SectionExamsTab sectionId={sectionId} />,
          },
        ]}
      />
    </Modal>
  );
}
