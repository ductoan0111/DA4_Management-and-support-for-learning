import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Tag, Button, Typography, Spin, Empty, Space, Row, Col } from 'antd';
import {
  ClockCircleOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherAnnouncementsApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherAnnouncementDto, TeacherSectionDto } from '../../api/teacher-types';

const { Title, Text, Paragraph } = Typography;

const ANN_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Chung', color: 'blue' },
  1: { label: 'Bài tập', color: 'gold' },
  2: { label: 'Thi cử', color: 'red' },
  3: { label: 'Khác', color: 'purple' },
};

export default function TeacherAnnouncementsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState<string>('');

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId).then(setSections);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    teacherAnnouncementsApi
      .list(profile.teacherId, filterSection ? Number(filterSection) : undefined)
      .then(setAnnouncements)
      .finally(() => setLoading(false));
  }, [profile, filterSection]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Thông báo</Title>
          <Text type="secondary">Tất cả thông báo đã phát tới sinh viên các lớp học phần</Text>
        </div>
        <Select
          style={{ width: 240 }}
          placeholder="Lọc theo lớp học phần"
          value={filterSection}
          onChange={setFilterSection}
          options={[
            { value: '', label: 'Tất cả lớp học phần' },
            ...sections.map(s => ({
              value: String(s.sectionId),
              label: s.sectionCode,
            })),
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải danh sách thông báo..." />
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <Empty description="Chưa có thông báo nào" />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {announcements.map(a => {
            const typeInfo = ANN_CONFIG[a.announcementType] || { label: 'Khác', color: 'default' };

            return (
              <Card
                key={a.announcementId}
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  opacity: a.isActive ? 1 : 0.65,
                }}
              >
                <Row gutter={[16, 16]} justify="space-between" align="top">
                  <Col xs={24} md={18}>
                    <Space size={8} wrap style={{ marginBottom: 8 }}>
                      <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                      {a.sectionCode && <Tag color="blue">{a.sectionCode}</Tag>}
                      {!a.isActive && <Tag color="default">Đã ẩn</Tag>}
                    </Space>

                    <Title level={5} style={{ margin: '4px 0 8px' }}>
                      {a.title}
                    </Title>

                    <Space wrap size={[16, 4]} style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                      <Space size={4}>
                        <ClockCircleOutlined />
                        <span>Đăng lúc: {new Date(a.publishedAt).toLocaleString('vi-VN')}</span>
                      </Space>
                      {a.expiresAt && (
                        <Space size={4}>
                          <CalendarOutlined />
                          <span>Hết hạn: {new Date(a.expiresAt).toLocaleString('vi-VN')}</span>
                        </Space>
                      )}
                    </Space>

                    <Paragraph
                      style={{
                        whiteSpace: 'pre-wrap',
                        color: '#334155',
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                      ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
                    >
                      {a.content}
                    </Paragraph>
                  </Col>

                  {a.sectionId && (
                    <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                      <Button
                        type="default"
                        icon={<ArrowRightOutlined />}
                        onClick={() =>
                          navigate(`/teacher/sections/${a.sectionId}`, {
                            state: { tab: 'announcements' },
                          })
                        }
                      >
                        Xem lớp
                      </Button>
                    </Col>
                  )}
                </Row>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
