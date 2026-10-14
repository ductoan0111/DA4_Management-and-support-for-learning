import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Typography, Spin, Empty, Space, Progress, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherGradesApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherGradeOverviewDto } from '../../api/teacher-types';

const { Title, Text } = Typography;

const getLetterTagColor = (l?: string | null) => {
  switch (l) {
    case 'A':
      return 'success';
    case 'B+':
    case 'B':
      return 'processing';
    case 'C+':
    case 'C':
      return 'warning';
    case 'D+':
    case 'D':
    case 'F':
      return 'error';
    default:
      return 'default';
  }
};

type OverviewItem = TeacherGradeOverviewDto & { sectionCode: string; courseName: string };

export default function TeacherGradesPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState<OverviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId, { status: 1 }).then(async secs => {
      const results = await Promise.all(
        secs.map(s =>
          teacherGradesApi
            .overview(profile.teacherId, s.sectionId)
            .then(o => ({ ...o, sectionCode: s.sectionCode, courseName: s.courseName }))
            .catch(() => null)
        )
      );
      setOverviews(results.filter(Boolean) as OverviewItem[]);
      setLoading(false);
    });
  }, [profile]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Tổng quan điểm số</Title>
          <Text type="secondary">Theo dõi cấu trúc thành phần điểm và kết quả học tập của các lớp học phần</Text>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải tổng quan điểm..." />
        </div>
      ) : overviews.length === 0 ? (
        <Card>
          <Empty description="Không có lớp học phần nào đang mở" />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {overviews.map(o => {
            const isWeightValid = o.totalWeightPercent === 100;

            const studentColumns: ColumnsType<any> = [
              {
                title: 'Mã SV',
                dataIndex: 'studentCode',
                key: 'studentCode',
                width: 120,
                render: (code: string) => <Tag color="blue">{code}</Tag>,
              },
              {
                title: 'Họ và tên',
                dataIndex: 'fullName',
                key: 'fullName',
                render: (name: string) => <Text strong>{name}</Text>,
              },
              {
                title: 'Điểm ước tính (10)',
                dataIndex: 'calculatedScore10',
                key: 'calculatedScore10',
                align: 'center',
                render: (score: number) => <span>{score.toFixed(2)}</span>,
              },
              {
                title: 'Điểm tổng kết (10)',
                dataIndex: 'finalScore10',
                key: 'finalScore10',
                align: 'center',
                render: (score?: number | null) => (
                  <Text strong style={{ color: score !== null && score !== undefined ? '#2563eb' : '#94a3b8' }}>
                    {score !== null && score !== undefined ? score.toFixed(2) : '—'}
                  </Text>
                ),
              },
              {
                title: 'Xếp loại',
                dataIndex: 'letterGrade',
                key: 'letterGrade',
                align: 'center',
                render: (grade?: string | null) => (
                  <Tag color={getLetterTagColor(grade)} style={{ fontWeight: 700 }}>
                    {grade ?? '—'}
                  </Tag>
                ),
              },
              {
                title: 'Tiến độ nhập',
                key: 'progress',
                width: 180,
                render: (_, record) => {
                  const percent =
                    record.totalComponents > 0
                      ? Math.round((record.gradedComponents / record.totalComponents) * 100)
                      : 0;
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                        <span>{record.gradedComponents}/{record.totalComponents} cột điểm</span>
                        <span>{percent}%</span>
                      </div>
                      <Progress percent={percent} size="small" showInfo={false} status={percent === 100 ? 'success' : 'active'} />
                    </div>
                  );
                },
              },
            ];

            return (
              <Card
                key={o.sectionId}
                style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                title={
                  <Row align="middle" justify="space-between" style={{ padding: '4px 0' }}>
                    <Col>
                      <Space size={8} wrap>
                        <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>{o.sectionCode}</Tag>
                        <Text strong style={{ fontSize: 16 }}>{o.courseName}</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() =>
                          navigate(`/teacher/sections/${o.sectionId}`, {
                            state: { tab: 'grades' },
                          })
                        }
                      >
                        Vào sổ điểm
                      </Button>
                    </Col>
                  </Row>
                }
              >
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12} md={8}>
                    <Text type="secondary">Cấu trúc điểm: </Text>
                    <Text strong>{o.componentCount} cột điểm</Text>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Text type="secondary">Tổng trọng số: </Text>
                    <Tag
                      color={isWeightValid ? 'success' : 'error'}
                      icon={isWeightValid ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                    >
                      {o.totalWeightPercent}% {isWeightValid ? '(Đạt chuẩn 100%)' : '(Chưa đủ 100%)'}
                    </Tag>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Text type="secondary">Đã chốt điểm tổng kết: </Text>
                    <Text strong>{o.finalizedStudents}/{o.totalStudents} sinh viên</Text>
                  </Col>
                </Row>

                {o.students.length > 0 ? (
                  <div>
                    <Table
                      dataSource={o.students.slice(0, 5)}
                      columns={studentColumns}
                      rowKey="studentId"
                      pagination={false}
                      size="small"
                      scroll={{ x: 600 }}
                    />
                    {o.students.length > 5 && (
                      <div style={{ textAlign: 'center', paddingTop: 12 }}>
                        <Button
                          type="link"
                          onClick={() =>
                            navigate(`/teacher/sections/${o.sectionId}`, {
                              state: { tab: 'grades' },
                            })
                          }
                        >
                          Xem toàn bộ danh sách {o.students.length} sinh viên →
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Empty description="Lớp chưa có sinh viên đăng ký" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
