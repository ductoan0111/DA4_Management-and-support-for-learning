import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Select, Tag, Typography, Empty, Spin, Space } from 'antd';
import {
  BookOutlined,
  UsergroupAddOutlined,
  StarFilled,
  CalendarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherSectionDto } from '../../api/teacher-types';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Đã đóng', color: 'error' },
  1: { label: 'Đang mở', color: 'success' },
  2: { label: 'Kết thúc', color: 'default' },
};

export default function TeacherSectionsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    if (!profile) return;
    const params = filterStatus !== '' ? { status: Number(filterStatus) } : undefined;
    setLoading(true);
    teacherSectionsApi.list(profile.teacherId, params).then(setSections).finally(() => setLoading(false));
  }, [profile, filterStatus]);

  // Group by academic year & semester
  const grouped = sections.reduce((acc, s) => {
    const key = `${s.academicYear} – ${s.semesterName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, TeacherSectionDto[]>);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Lớp học phần của tôi</Title>
          <Text type="secondary">Quản lý danh sách lớp học phần được phân công giảng dạy</Text>
        </div>
        <Space>
          <Select
            style={{ width: 180 }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: '1', label: 'Đang mở' },
              { value: '0', label: 'Đã đóng' },
              { value: '2', label: 'Kết thúc' },
            ]}
          />
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải danh sách lớp học phần..." />
        </div>
      ) : sections.length === 0 ? (
        <Card>
          <Empty description="Không tìm thấy lớp học phần nào" />
        </Card>
      ) : (
        Object.entries(grouped).map(([groupKey, items]) => (
          <div key={groupKey} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CalendarOutlined style={{ color: '#2563eb', fontSize: 18 }} />
              <Text strong style={{ fontSize: 16, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {groupKey}
              </Text>
              <Tag color="blue">{items.length} lớp</Tag>
            </div>

            <Row gutter={[16, 16]}>
              {items.map(s => {
                const statusInfo = STATUS_CONFIG[s.status] || { label: 'Khác', color: 'default' };
                return (
                  <Col xs={24} sm={12} lg={8} key={s.sectionId}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/teacher/sections/${s.sectionId}`)}
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                      }}
                      styles={{
                        body: {
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: 20,
                        },
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <Text strong style={{ color: '#2563eb', fontSize: 14 }}>
                            {s.sectionCode}
                          </Text>
                          <Space size={4}>
                            {s.isPrimary && (
                              <Tag color="gold" icon={<StarFilled />} style={{ margin: 0 }}>
                                GV Chính
                              </Tag>
                            )}
                            <Tag color={statusInfo.color} style={{ margin: 0 }}>
                              {statusInfo.label}
                            </Tag>
                          </Space>
                        </div>

                        <Title level={5} style={{ margin: '4px 0 12px', lineHeight: 1.4, minHeight: 40 }}>
                          {s.courseName}
                        </Title>

                        <Space wrap size={[6, 6]} style={{ marginBottom: 16 }}>
                          <Tag icon={<BookOutlined />}>{s.courseCode}</Tag>
                          <Tag>{s.credits} tín chỉ</Tag>
                        </Space>
                      </div>

                      <div
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: 12,
                          marginTop: 'auto',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Space size={6}>
                          <UsergroupAddOutlined style={{ color: '#64748b' }} />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            <strong style={{ color: '#1e293b' }}>{s.enrolledCount}</strong>/{s.maxStudents ?? '∞'} SV
                          </Text>
                        </Space>

                        <Text style={{ color: '#2563eb', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                          Chi tiết <ArrowRightOutlined style={{ fontSize: 11 }} />
                        </Text>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        ))
      )}
    </div>
  );
}
