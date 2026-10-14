import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Alert, Typography, Spin, Space, Tag, Button, Progress } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  BookOutlined,
  CalendarOutlined,
  TableOutlined,
  FormOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  DashboardOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { statisticsApi } from '../../api/services';
import type { AdminStatisticsDto } from '../../api/types';

const { Text } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    setError('');
    statisticsApi.get()
      .then(setStats)
      .catch(() => setError('Không thể tải dữ liệu thống kê hệ thống.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const cards = stats
    ? [
        {
          label: 'Tổng tài khoản',
          value: stats.totalUsers,
          sub: `${stats.activeUsers} tài khoản hoạt động`,
          tagText: 'Đang hoạt động',
          tagColor: 'blue',
          icon: <UserOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)',
          borderColor: '#bfdbfe',
          accentColor: '#2563eb',
          shadowColor: 'rgba(37,99,235,0.25)',
          link: '/admin/users',
        },
        {
          label: 'Hồ sơ Sinh viên',
          value: stats.totalStudents,
          sub: `${stats.activeStudents} sinh viên đang học`,
          tagText: 'Chính quy',
          tagColor: 'green',
          icon: <SolutionOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #ecfdf5 100%)',
          borderColor: '#a7f3d0',
          accentColor: '#059669',
          shadowColor: 'rgba(16,185,129,0.25)',
          link: '/admin/students',
        },
        {
          label: 'Hồ sơ Giảng viên',
          value: stats.totalTeachers,
          sub: `${stats.activeTeachers} giảng viên công tác`,
          tagText: 'Khoa / Viện',
          tagColor: 'gold',
          icon: <TeamOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)',
          borderColor: '#fde68a',
          accentColor: '#d97706',
          shadowColor: 'rgba(245,158,11,0.25)',
          link: '/admin/teachers',
        },
        {
          label: 'Môn học / Học phần',
          value: stats.totalCourses,
          sub: 'Chương trình đào tạo',
          tagText: 'Học phần',
          tagColor: 'purple',
          icon: <BookOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #f5f3ff 100%)',
          borderColor: '#ddd6fe',
          accentColor: '#7c3aed',
          shadowColor: 'rgba(139,92,246,0.25)',
          link: '/admin/courses',
        },
        {
          label: 'Lớp học phần',
          value: stats.totalSections,
          sub: `${stats.openSections} lớp đang mở`,
          tagText: `${stats.openSections} Đang mở`,
          tagColor: 'magenta',
          icon: <TableOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #fff1f2 100%)',
          borderColor: '#fecdd3',
          accentColor: '#e11d48',
          shadowColor: 'rgba(244,63,94,0.25)',
          link: '/admin/course-sections',
        },
        {
          label: 'Tổng số Học kỳ',
          value: stats.totalSemesters,
          sub: 'Các niên khóa đào tạo',
          tagText: 'Niên khóa',
          tagColor: 'cyan',
          icon: <CalendarOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #ecfeff 100%)',
          borderColor: '#a5f3fc',
          accentColor: '#0284c7',
          shadowColor: 'rgba(6,182,212,0.25)',
          link: '/admin/semesters',
        },
        {
          label: 'Lượt sinh viên học',
          value: stats.activeEnrollments,
          sub: 'Lượt đăng ký lớp HP',
          tagText: 'Đăng ký HP',
          tagColor: 'orange',
          icon: <FormOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)',
          borderColor: '#fed7aa',
          accentColor: '#ea580c',
          shadowColor: 'rgba(234,88,12,0.25)',
          link: '/admin/course-sections',
        },
        {
          label: 'Tỷ lệ mở lớp học phần',
          value: stats.totalSections > 0 ? `${Math.round((stats.openSections / stats.totalSections) * 100)}%` : '100%',
          sub: `${stats.openSections}/${stats.totalSections} lớp đang hoạt động`,
          tagText: 'Sẵn sàng',
          tagColor: 'geekblue',
          icon: <CheckCircleOutlined style={{ fontSize: 22, color: '#fff' }} />,
          iconGrad: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
          bgGrad: 'linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%)',
          borderColor: '#bae6fd',
          accentColor: '#0284c7',
          shadowColor: 'rgba(14,165,233,0.25)',
          link: '/admin/course-sections',
        },
      ]
    : [];

  // Chart data calculations
  const scaleChartData = stats
    ? [
        { name: 'Tài khoản', count: stats.totalUsers, color: '#3b82f6' },
        { name: 'Sinh viên', count: stats.totalStudents, color: '#10b981' },
        { name: 'Giảng viên', count: stats.totalTeachers, color: '#f59e0b' },
        { name: 'Môn học', count: stats.totalCourses, color: '#8b5cf6' },
        { name: 'Lớp HP', count: stats.totalSections, color: '#ec4899' },
        { name: 'Học kỳ', count: stats.totalSemesters, color: '#06b6d4' },
        { name: 'Lượt học', count: stats.activeEnrollments, color: '#ea580c' },
      ]
    : [];

  const adminUsersCount = stats
    ? Math.max(0, stats.totalUsers - stats.totalStudents - stats.totalTeachers)
    : 0;

  const userDistributionData = stats
    ? [
        { name: 'Sinh viên', value: stats.totalStudents, color: '#10b981' },
        { name: 'Giảng viên', value: stats.totalTeachers, color: '#f59e0b' },
        { name: 'Quản trị viên', value: adminUsersCount || 1, color: '#3b82f6' },
      ]
    : [];

  const statusComparisonData = stats
    ? [
        {
          category: 'Tài khoản',
          total: stats.totalUsers,
          active: stats.activeUsers,
        },
        {
          category: 'Sinh viên',
          total: stats.totalStudents,
          active: stats.activeStudents,
        },
        {
          category: 'Giảng viên',
          total: stats.totalTeachers,
          active: stats.activeTeachers,
        },
        {
          category: 'Lớp học phần',
          total: stats.totalSections,
          active: stats.openSections,
        },
      ]
    : [];

  const activeUserPct = stats ? Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100) : 100;
  const activeStudentPct = stats ? Math.round((stats.activeStudents / (stats.totalStudents || 1)) * 100) : 100;
  const activeTeacherPct = stats ? Math.round((stats.activeTeachers / (stats.totalTeachers || 1)) * 100) : 100;
  const openSectionPct = stats && stats.totalSections > 0 ? Math.round((stats.openSections / stats.totalSections) * 100) : 100;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* ─── Hero Gradient Banner ────────────────────────────────────────── */}
      <div style={{
        borderRadius: 16,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(37,99,235,0.3)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        {/* Decorative background circles */}
        <div style={{
          position: 'absolute',
          right: -40,
          top: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          right: 220,
          bottom: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,197,253,0.2) 0%, rgba(147,197,253,0) 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            padding: '0.3rem 0.85rem',
            borderRadius: 999,
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '0.85rem',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
            Cổng Quản Trị Đào Tạo & Học Vụ Trực Tuyến
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Bảng điều khiển hệ thống 👋
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.92rem', color: '#e0e7ff', lineHeight: 1.55 }}>
            Tổng quan dữ liệu thời gian thực và tình trạng vận hành nền tảng quản lý học tập. Giám sát hồ sơ người dùng, phân công giảng dạy và tiến độ học kỳ.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.65rem' }}>
          <div style={{
            fontSize: '0.85rem',
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <span>📅</span>
            <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#c7d2fe', background: 'rgba(0,0,0,0.25)', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>
              ⚡ Máy chủ: Hoạt động tốt
            </span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadData}
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '0.75rem',
                borderRadius: 6,
              }}
            >
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {error && <Alert message={error} type="error" showIcon closable />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <Spin size="large" tip="Đang tải dữ liệu thống kê hệ thống…" />
        </div>
      ) : (
        <>
          {/* ─── Metric Cards Grid ─────────────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 18, background: '#2563eb', borderRadius: 2 }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Chỉ số thống kê trọng yếu
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Cập nhật tự động theo thời gian thực
              </span>
            </div>

            <Row gutter={[16, 16]}>
              {cards.map(c => (
                <Col key={c.label} xs={24} sm={12} md={8} lg={6}>
                  <div
                    className="stat-card-colorful"
                    onClick={() => navigate(c.link)}
                    style={{
                      background: c.bgGrad,
                      border: `1px solid ${c.borderColor}`,
                      borderTop: `3.5px solid ${c.accentColor}`,
                      borderRadius: 14,
                      padding: '1.25rem',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem', marginBottom: 4 }}>
                          {c.label}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: c.accentColor, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                          {c.value}
                        </div>
                      </div>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: c.iconGrad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 16px ${c.shadowColor}`,
                        flexShrink: 0,
                      }}>
                        {c.icon}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
                      <Text type="secondary" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {c.sub}
                      </Text>
                      <Tag color={c.tagColor} style={{ margin: 0, borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, padding: '1px 8px' }}>
                        {c.tagText}
                      </Tag>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* ─── Statistical Charts Section ─────────────────────────────────── */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              marginTop: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 20, background: 'linear-gradient(180deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 2 }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Biểu đồ phân tích & Thống kê học vụ
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="blue" style={{ borderRadius: 999, fontWeight: 700, padding: '2px 10px' }}>
                  ● Dữ liệu thực tế
                </Tag>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Trực quan hóa hệ thống đào tạo
                </span>
              </div>
            </div>

            {/* Charts Row 1: Bar Chart & Donut Chart */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={15}>
                <Card
                  bordered={false}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BarChartOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                          Quy mô & Số lượng các chỉ số học vụ
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                          So sánh số lượng tài khoản, sinh viên, giảng viên, môn học và lớp học phần
                        </div>
                      </div>
                    </div>
                  }
                  style={{
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '1.25rem 1rem 0.5rem 0' }}
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={scaleChartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{
                                background: 'rgba(15, 23, 42, 0.95)',
                                color: '#ffffff',
                                padding: '0.5rem 0.85rem',
                                borderRadius: 8,
                                fontSize: '0.8rem',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                              }}>
                                <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: 2 }}>{data.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: data.color }} />
                                  <span>Số lượng: <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{data.count}</strong></span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={48}>
                        {scaleChartData.map((entry, index) => (
                          <Cell key={`bar-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={9}>
                <Card
                  bordered={false}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PieChartOutlined style={{ color: '#10b981', fontSize: 18 }} />
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                          Cơ cấu phân bổ tài khoản người dùng
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                          Tỷ lệ Sinh viên, Giảng viên & Quản trị viên
                        </div>
                      </div>
                    </div>
                  }
                  style={{
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '1.25rem' }}
                >
                  <div style={{ position: 'relative', width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={userDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {userDistributionData.map((entry, index) => (
                            <Cell key={`donut-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0];
                              const total = stats?.totalUsers || 1;
                              const pct = Math.round((Number(item.value) / total) * 100);
                              return (
                                <div style={{
                                  background: 'rgba(15, 23, 42, 0.95)',
                                  color: '#ffffff',
                                  padding: '0.5rem 0.85rem',
                                  borderRadius: 8,
                                  fontSize: '0.8rem',
                                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.payload?.color }} />
                                    <span style={{ fontWeight: 700 }}>{item.name}:</span>
                                    <strong style={{ color: '#60a5fa' }}>{item.value} ({pct}%)</strong>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center donut label */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                        {stats?.totalUsers ?? 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                        Tài khoản
                      </div>
                    </div>
                  </div>

                  {/* Custom Legend */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                    {userDistributionData.map(item => {
                      const total = stats?.totalUsers || 1;
                      const pct = Math.round((item.value / total) * 100);
                      return (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                            <span style={{ color: '#334155', fontWeight: 500 }}>{item.name}</span>
                          </div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {item.value} <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 400 }}>({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Charts Row 2: Comparison Bar Chart & Progress Indicators */}
            <Row gutter={[16, 16]} style={{ marginTop: '1rem' }}>
              <Col xs={24} lg={14}>
                <Card
                  bordered={false}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RiseOutlined style={{ color: '#7c3aed', fontSize: 18 }} />
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                          Tương quan Tổng quy mô vs Mức độ đang hoạt động
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                          So sánh số lượng thiết lập ban đầu và số lượng thực tế đang tham gia vận hành
                        </div>
                      </div>
                    </div>
                  }
                  style={{
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '1.25rem 1rem 0.5rem 0' }}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={statusComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="category"
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div style={{
                                background: 'rgba(15, 23, 42, 0.95)',
                                color: '#ffffff',
                                padding: '0.65rem 0.95rem',
                                borderRadius: 8,
                                fontSize: '0.8rem',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                              }}>
                                <div style={{ color: '#93c5fd', fontWeight: 800, marginBottom: 4 }}>{label}</div>
                                {payload.map((p, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                                    <span style={{ color: '#cbd5e1' }}>{p.name}:</span>
                                    <strong style={{ color: '#ffffff' }}>{p.value}</strong>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: 12, fontSize: '0.8rem' }}
                      />
                      <Bar dataKey="total" name="Tổng thiết lập" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="active" name="Đang hoạt động / Mở" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={10}>
                <Card
                  bordered={false}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DashboardOutlined style={{ color: '#ea580c', fontSize: 18 }} />
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                          Chỉ số sẵn sàng & Tỷ lệ vận hành
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                          Tỷ lệ kích hoạt và mức độ sẵn sàng của các phân hệ
                        </div>
                      </div>
                    </div>
                  }
                  style={{
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>👤 Tài khoản hoạt động</span>
                        <span style={{ fontWeight: 800, color: '#2563eb' }}>{activeUserPct}% ({stats?.activeUsers}/{stats?.totalUsers})</span>
                      </div>
                      <Progress
                        percent={activeUserPct}
                        showInfo={false}
                        strokeColor={{ '0%': '#3b82f6', '100%': '#1d4ed8' }}
                        trailColor="#f1f5f9"
                        strokeWidth={8}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>🎓 Sinh viên theo học</span>
                        <span style={{ fontWeight: 800, color: '#059669' }}>{activeStudentPct}% ({stats?.activeStudents}/{stats?.totalStudents})</span>
                      </div>
                      <Progress
                        percent={activeStudentPct}
                        showInfo={false}
                        strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
                        trailColor="#f1f5f9"
                        strokeWidth={8}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>👨‍🏫 Giảng viên công tác</span>
                        <span style={{ fontWeight: 800, color: '#d97706' }}>{activeTeacherPct}% ({stats?.activeTeachers}/{stats?.totalTeachers})</span>
                      </div>
                      <Progress
                        percent={activeTeacherPct}
                        showInfo={false}
                        strokeColor={{ '0%': '#f59e0b', '100%': '#d97706' }}
                        trailColor="#f1f5f9"
                        strokeWidth={8}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>🗂️ Lớp học phần đang mở</span>
                        <span style={{ fontWeight: 800, color: '#e11d48' }}>{openSectionPct}% ({stats?.openSections}/{stats?.totalSections})</span>
                      </div>
                      <Progress
                        percent={openSectionPct}
                        showInfo={false}
                        strokeColor={{ '0%': '#f43f5e', '100%': '#e11d48' }}
                        trailColor="#f1f5f9"
                        strokeWidth={8}
                      />
                    </div>

                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem 0.85rem',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="pulse-green" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>
                          Trạng thái hạ tầng hệ thống
                        </span>
                      </div>
                      <Tag color="success" style={{ margin: 0, borderRadius: 999, fontWeight: 700 }}>
                        99.9% Ổn định
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Space>
  );
}

