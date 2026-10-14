import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Tag, Button, Typography, Spin, Empty, Space, Row, Col, Progress } from 'antd';
import {
  CalendarOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherAssignmentsApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherAssignmentDto, TeacherSectionDto } from '../../api/teacher-types';

const { Title, Text } = Typography;

export default function TeacherAssignmentsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState<string>('');

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId, { status: 1 }).then(setSections);
  }, [profile]);

  useEffect(() => {
    if (!profile || sections.length === 0) return;
    const secs = filterSection ? [{ sectionId: Number(filterSection) }] : sections;
    setLoading(true);
    Promise.all(secs.map(s => teacherAssignmentsApi.list(profile.teacherId, s.sectionId)))
      .then(results =>
        setAssignments(
          results.flat().sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime())
        )
      )
      .finally(() => setLoading(false));
  }, [profile, sections, filterSection]);

  const now = new Date();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Tất cả bài tập</Title>
          <Text type="secondary">Theo dõi tiến độ nộp bài và chấm điểm các lớp học phần</Text>
        </div>
        <Select
          style={{ width: 280 }}
          placeholder="Lọc theo lớp học phần"
          value={filterSection}
          onChange={setFilterSection}
          options={[
            { value: '', label: 'Tất cả lớp học phần' },
            ...sections.map(s => ({
              value: String(s.sectionId),
              label: `${s.sectionCode} — ${s.courseName}`,
            })),
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải danh sách bài tập..." />
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <Empty description="Không có bài tập nào" />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assignments.map(a => {
            const due = new Date(a.dueAt);
            const isOverdue = due < now;
            const gradedPercent =
              a.totalSubmissions > 0
                ? Math.round((a.gradedSubmissions / a.totalSubmissions) * 100)
                : 0;

            return (
              <Card
                key={a.assignmentId}
                hoverable
                style={{
                  borderRadius: 12,
                  borderLeft: `4px solid ${isOverdue ? '#ef4444' : a.isPublished ? '#10b981' : '#f59e0b'}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={16}>
                    <Space size={8} wrap style={{ marginBottom: 4 }}>
                      <Tag color="blue">{a.sectionCode}</Tag>
                      <Tag>{a.courseCode}</Tag>
                      <Tag color={a.isPublished ? 'success' : 'warning'}>
                        {a.isPublished ? '✓ Đã đăng' : '⏸ Nháp'}
                      </Tag>
                      {a.allowLateSubmission && <Tag color="purple">Cho phép nộp trễ</Tag>}
                    </Space>

                    <Title level={5} style={{ margin: '4px 0 8px' }}>
                      {a.title}
                    </Title>

                    <Space wrap size={[16, 8]} style={{ fontSize: 13, color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined style={{ color: isOverdue ? '#ef4444' : '#64748b' }} />
                        Hạn nộp:{' '}
                        <Text strong style={{ color: isOverdue ? '#ef4444' : '#1e293b' }}>
                          {due.toLocaleString('vi-VN')}
                        </Text>
                        {isOverdue && <Tag color="error" icon={<ExclamationCircleOutlined />} style={{ marginLeft: 4 }}>Đã hết hạn</Tag>}
                      </span>

                      <span>
                        🎯 Điểm tối đa: <strong style={{ color: '#1e293b' }}>{a.maxScore}đ</strong>
                      </span>
                    </Space>
                  </Col>

                  <Col xs={24} md={8}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                      <div style={{ width: '100%', maxWidth: 220 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <Text type="secondary">Tiến độ chấm điểm</Text>
                          <Text strong>{a.gradedSubmissions}/{a.totalSubmissions} ({gradedPercent}%)</Text>
                        </div>
                        <Progress
                          percent={gradedPercent}
                          size="small"
                          status={gradedPercent === 100 && a.totalSubmissions > 0 ? 'success' : 'active'}
                        />
                      </div>

                      <Button
                        type="primary"
                        ghost
                        icon={<ArrowRightOutlined />}
                        onClick={() =>
                          navigate(`/teacher/sections/${a.sectionId}`, {
                            state: { tab: 'assignments' },
                          })
                        }
                      >
                        Vào lớp chấm bài
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
