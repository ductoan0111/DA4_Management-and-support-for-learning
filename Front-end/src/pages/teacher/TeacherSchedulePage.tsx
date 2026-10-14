import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Typography, Spin, Empty, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherScheduleDto, TeacherExamDto } from '../../api/teacher-types';

const { Title, Text } = Typography;

const DAYS = [
  { day: 2, label: 'Thứ 2' },
  { day: 3, label: 'Thứ 3' },
  { day: 4, label: 'Thứ 4' },
  { day: 5, label: 'Thứ 5' },
  { day: 6, label: 'Thứ 6' },
  { day: 7, label: 'Thứ 7' },
  { day: 8, label: 'Chủ nhật' },
];

const EXAM_TYPE_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Kiểm tra', color: 'processing' },
  2: { label: 'Giữa kỳ', color: 'warning' },
  3: { label: 'Cuối kỳ', color: 'error' },
  4: { label: 'Khác', color: 'default' },
};

export default function TeacherSchedulePage() {
  const { profile } = useTeacherAuth();
  const [schedules, setSchedules] = useState<TeacherScheduleDto[]>([]);
  const [exams, setExams] = useState<TeacherExamDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    Promise.all([
      teacherSectionsApi.schedule(profile.teacherId),
      teacherSectionsApi.exams(profile.teacherId),
    ])
      .then(([schList, examList]) => {
        setSchedules(schList);
        setExams(examList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profile]);

  // Group schedules by day of week
  const byDay = DAYS.reduce((acc, d) => {
    acc[d.day] = schedules.filter(s => s.dayOfWeek === d.day);
    return acc;
  }, {} as Record<number, TeacherScheduleDto[]>);

  // Compute today's day (JS 0=CN -> 8, 1=T2 -> 2, ...)
  const jsDay = new Date().getDay();
  const todayDbDay = jsDay === 0 ? 8 : jsDay + 1;

  const examColumns: ColumnsType<TeacherExamDto> = [
    {
      title: 'Kỳ thi',
      key: 'examName',
      render: (_, record) => {
        const typeInfo = EXAM_TYPE_CONFIG[record.examType] || { label: 'Khác', color: 'default' };
        return (
          <Space orientation="vertical" size={2}>
            <Text strong style={{ color: '#1e293b' }}>{record.examName}</Text>
            <Tag color={typeInfo.color} style={{ fontSize: 11, margin: 0 }}>
              {typeInfo.label}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Môn học',
      key: 'courseName',
      render: (_, record) => (
        <div>
          <Text strong>{record.courseName}</Text>
          <div>
            <Tag icon={<BookOutlined />} style={{ marginTop: 4 }}>
              {record.courseCode}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Lớp học phần',
      dataIndex: 'sectionCode',
      key: 'sectionCode',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Ngày thi',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#64748b' }} />
          <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
        </Space>
      ),
    },
    {
      title: 'Giờ thi & Thời lượng',
      key: 'time',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#64748b' }} />
          <span>{record.startTime.substring(0, 5)} ({record.durationMinutes} phút)</span>
        </Space>
      ),
    },
    {
      title: 'Phòng thi',
      dataIndex: 'room',
      key: 'room',
      render: (room?: string | null) => (
        <Tag icon={<EnvironmentOutlined />} color="cyan">
          {room || 'Chưa xếp'}
        </Tag>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note?: string | null) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {note || '—'}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Lịch dạy & Lịch thi</Title>
          <Text type="secondary">
            Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </Text>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải lịch dạy và lịch thi..." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* TIMETABLE */}
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: '#2563eb' }} />
                <span>Thời khóa biểu giảng dạy ({schedules.length} ca học)</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            {schedules.length === 0 ? (
              <Empty description="Không có lịch dạy trong tuần" />
            ) : (
              <Row gutter={[12, 12]}>
                {DAYS.map(({ day, label }) => {
                  const isToday = day === todayDbDay;
                  const daySlots = byDay[day] ?? [];

                  return (
                    <Col xs={24} sm={12} md={8} lg={3} xl={3} key={day} style={{ minWidth: 140 }}>
                      <div
                        style={{
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: 13,
                          padding: '8px 4px',
                          background: isToday ? '#2563eb' : '#f1f5f9',
                          color: isToday ? '#fff' : '#475569',
                          borderRadius: '8px 8px 0 0',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {label} {isToday && '★'}
                      </div>
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderTop: 'none',
                          borderRadius: '0 0 8px 8px',
                          padding: 8,
                          minHeight: 180,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        {daySlots.length === 0 ? (
                          <div
                            style={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#cbd5e1',
                              fontSize: 12,
                              minHeight: 80,
                            }}
                          >
                            Trống
                          </div>
                        ) : (
                          daySlots.map(s => (
                            <div
                              key={`${s.sectionId}-${s.scheduleId}`}
                              style={{
                                background: '#fff',
                                borderRadius: 6,
                                padding: '8px 10px',
                                border: '1px solid #e2e8f0',
                                borderLeft: '3px solid #2563eb',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>
                                ⏰ {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                              </div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', lineHeight: 1.3 }}>
                                {s.courseName || s.courseCode}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                {s.sectionCode}
                              </div>
                              <div style={{ fontSize: 11, color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <EnvironmentOutlined />
                                <span>{s.room ?? '—'} {s.building ? `(${s.building})` : ''}</span>
                              </div>
                              {s.note && (
                                <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>
                                  {s.note}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Card>

          {/* EXAMS LIST */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#2563eb' }} />
                <span>Lịch thi & Kiểm tra ({exams.length} ca thi)</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Table
              dataSource={exams}
              columns={examColumns}
              rowKey="examId"
              pagination={{ pageSize: 8, showSizeChanger: true, responsive: true }}
              locale={{ emptyText: <Empty description="Chưa có lịch thi hoặc kiểm tra" /> }}
              scroll={{ x: 800 }}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
