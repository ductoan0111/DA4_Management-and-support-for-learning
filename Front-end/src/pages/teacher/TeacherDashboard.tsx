import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Tag, Button, Space, Typography, Empty, Spin } from 'antd';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  BankOutlined,
  ArrowRightOutlined,
  BookOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherSectionDto } from '../../api/teacher-types';

const { Title, Text } = Typography;

const STATUS_TAG: Record<number, { color: string; label: string }> = {
  0: { color: 'error', label: 'Đã đóng' },
  1: { color: 'success', label: 'Đang mở' },
  2: { color: 'default', label: 'Kết thúc' },
};

export default function TeacherDashboard() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId).then(setSections).finally(() => setLoading(false));
  }, [profile]);

  const activeSections = sections.filter(s => s.status === 1);
  const totalStudents = sections.reduce((acc, s) => acc + s.enrolledCount, 0);

  if (!profile) return null;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            Xin chào, {profile.fullName} 👋
          </Title>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            Chúc bạn một ngày giảng dạy hiệu quả và tràn đầy năng lượng!
          </Text>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#fff', padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Statistic
                title={<span style={{ fontWeight: 600, color: '#64748b' }}>Tổng lớp học phần</span>}
                value={sections.length}
                valueStyle={{ fontWeight: 800, color: '#0f172a' }}
              />
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AppstoreOutlined style={{ fontSize: 24, color: '#2563eb' }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Statistic
                title={<span style={{ fontWeight: 600, color: '#64748b' }}>Lớp đang giảng dạy</span>}
                value={activeSections.length}
                valueStyle={{ fontWeight: 800, color: '#16a34a' }}
              />
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: '#16a34a' }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Statistic
                title={<span style={{ fontWeight: 600, color: '#64748b' }}>Tổng số sinh viên</span>}
                value={totalStudents}
                valueStyle={{ fontWeight: 800, color: '#ea580c' }}
              />
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UsergroupAddOutlined style={{ fontSize: 24, color: '#ea580c' }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Đơn vị chuyên môn</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{profile.academicTitle ?? 'Giảng viên'}</div>
                <Text type="secondary" style={{ fontSize: '0.75rem' }}>{profile.departmentName}</Text>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BankOutlined style={{ fontSize: 24, color: '#7c3aed' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Active Classes */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOutlined style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 700 }}>Lớp học phần đang mở ({activeSections.length})</span>
          </div>
        }
        extra={
          <Button type="link" onClick={() => navigate('/teacher/sections')} icon={<ArrowRightOutlined />}>
            Xem tất cả các lớp
          </Button>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Spin tip="Đang tải danh sách lớp học phần…" />
          </div>
        ) : activeSections.length === 0 ? (
          <Empty description="Hiện tại chưa có lớp học phần nào đang mở" style={{ padding: '2rem 0' }} />
        ) : (
          <Row gutter={[16, 16]}>
            {activeSections.slice(0, 6).map(s => (
              <Col key={s.sectionId} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  bodyStyle={{ padding: '1.25rem' }}
                  onClick={() => navigate(`/teacher/sections/${s.sectionId}`)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Tag color="blue" style={{ fontWeight: 700, margin: 0 }}>
                        {s.sectionCode}
                      </Tag>
                      <Tag color={STATUS_TAG[s.status]?.color ?? 'default'} style={{ margin: 0 }}>
                        {STATUS_TAG[s.status]?.label ?? 'Khác'}
                      </Tag>
                    </div>

                    <Title level={5} style={{ margin: '0.5rem 0', fontWeight: 700, color: '#0f172a' }}>
                      {s.courseName}
                    </Title>

                    <Space wrap orientation="horizontal" size={[4, 6]} style={{ marginBottom: '1rem' }}>
                      <Tag>{s.semesterName}</Tag>
                      <Tag>{s.credits} tín chỉ</Tag>
                      {s.isPrimary && (
                        <Tag color="gold" icon={<StarFilled />}>
                          GV Chính
                        </Tag>
                      )}
                    </Space>
                  </div>

                  <div style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: '#64748b',
                  }}>
                    <span>👥 {s.enrolledCount}/{s.maxStudents ?? '∞'} sinh viên</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>Chi tiết lớp →</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </Space>
  );
}
