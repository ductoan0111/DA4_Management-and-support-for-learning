import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Alert, Typography, Spin, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  BookOutlined,
  CalendarOutlined,
  TableOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { statisticsApi } from '../../api/services';
import type { AdminStatisticsDto } from '../../api/types';

const { Title, Text, Paragraph } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    statisticsApi.get()
      .then(setStats)
      .catch(() => setError('Không thể tải dữ liệu thống kê hệ thống.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: 'Tổng tài khoản',
          value: stats.totalUsers,
          sub: `${stats.activeUsers} tài khoản đang hoạt động`,
          icon: <UserOutlined style={{ fontSize: 24, color: '#2563eb' }} />,
          bg: '#eff6ff',
        },
        {
          label: 'Hồ sơ Sinh viên',
          value: stats.totalStudents,
          sub: `${stats.activeStudents} sinh viên đang học`,
          icon: <SolutionOutlined style={{ fontSize: 24, color: '#16a34a' }} />,
          bg: '#f0fdf4',
        },
        {
          label: 'Hồ sơ Giảng viên',
          value: stats.totalTeachers,
          sub: `${stats.activeTeachers} giảng viên công tác`,
          icon: <TeamOutlined style={{ fontSize: 24, color: '#ca8a04' }} />,
          bg: '#fefce8',
        },
        {
          label: 'Môn học / Học phần',
          value: stats.totalCourses,
          sub: 'Chương trình đào tạo',
          icon: <BookOutlined style={{ fontSize: 24, color: '#7c3aed' }} />,
          bg: '#faf5ff',
        },
        {
          label: 'Lớp học phần',
          value: stats.totalSections,
          sub: `${stats.openSections} lớp đang mở`,
          icon: <TableOutlined style={{ fontSize: 24, color: '#db2777' }} />,
          bg: '#fdf2f8',
        },
        {
          label: 'Tổng số Học kỳ',
          value: stats.totalSemesters,
          sub: 'Các niên khóa đào tạo',
          icon: <CalendarOutlined style={{ fontSize: 24, color: '#0284c7' }} />,
          bg: '#f0f9ff',
        },
        {
          label: 'Lượt sinh viên học',
          value: stats.activeEnrollments,
          sub: 'Lượt đăng ký lớp HP',
          icon: <FormOutlined style={{ fontSize: 24, color: '#ea580c' }} />,
          bg: '#fff7ed',
        },
      ]
    : [];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            Bảng điều khiển hệ thống
          </Title>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>
            Tổng quan dữ liệu và tình trạng vận hành nền tảng quản lý học tập
          </Text>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#fff', padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {error && <Alert message={error} type="error" showIcon />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Spin size="large" tip="Đang tải dữ liệu thống kê…" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {cards.map(c => (
              <Col key={c.label} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                  bodyStyle={{ padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Statistic
                        title={<span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>{c.label}</span>}
                        value={c.value}
                        valueStyle={{ fontWeight: 800, color: '#0f172a', fontSize: '1.75rem' }}
                      />
                      <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block', marginTop: 4 }}>
                        {c.sub}
                      </Text>
                    </div>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: c.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {c.icon}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            title={<span style={{ fontWeight: 700 }}>Thông tin vận hành</span>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Paragraph style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              Hệ thống quản lý và hỗ trợ học tập đang hoạt động ổn định. Quản trị viên có thể sử dụng thanh điều hướng bên trái để quản lý danh sách tài khoản người dùng, hồ sơ giảng viên, sinh viên, cơ cấu tổ chức khoa viện, chuyên ngành, môn học và phân công giảng dạy các lớp học phần theo từng học kỳ.
            </Paragraph>
          </Card>
        </>
      )}
    </Space>
  );
}
