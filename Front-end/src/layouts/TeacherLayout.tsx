import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Outlet, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  FormOutlined,
  FolderOpenOutlined,
  BarChartOutlined,
  NotificationOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function TeacherLayout() {
  const { profile, logout } = useTeacherAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/teacher/login', { replace: true });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '0.25rem 0.5rem' }}>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>{profile?.fullName ?? 'Giảng viên'}</div>
          <Text type="secondary" style={{ fontSize: '0.75rem' }}>
            {profile?.academicTitle ? `${profile.academicTitle} · ` : ''}{profile?.teacherCode}
          </Text>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            {profile?.departmentName}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile-link',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/teacher/profile'),
    },
    {
      key: 'portal-admin',
      label: <Link to="/admin">🎓 Cổng Quản trị Admin</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = useMemo(() => [
    {
      key: '/teacher',
      icon: <HomeOutlined />,
      label: 'Tổng quan giảng dạy',
      onClick: () => navigate('/teacher'),
    },
    {
      type: 'group',
      label: collapsed ? null : 'LỚP HỌC PHẦN',
      children: [
        {
          key: '/teacher/sections',
          icon: <AppstoreOutlined />,
          label: 'Lớp của tôi',
          onClick: () => navigate('/teacher/sections'),
        },
        {
          key: '/teacher/schedule',
          icon: <CalendarOutlined />,
          label: 'Lịch dạy & Lịch thi',
          onClick: () => navigate('/teacher/schedule'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'QUẢN LÝ DẠY HỌC',
      children: [
        {
          key: '/teacher/assignments',
          icon: <FormOutlined />,
          label: 'Bài tập & Bài nộp',
          onClick: () => navigate('/teacher/assignments'),
        },
        {
          key: '/teacher/materials',
          icon: <FolderOpenOutlined />,
          label: 'Kho tài liệu môn học',
          onClick: () => navigate('/teacher/materials'),
        },
        {
          key: '/teacher/grades',
          icon: <BarChartOutlined />,
          label: 'Điểm số & Tổng kết',
          onClick: () => navigate('/teacher/grades'),
        },
        {
          key: '/teacher/announcements',
          icon: <NotificationOutlined />,
          label: 'Thông báo lớp học',
          onClick: () => navigate('/teacher/announcements'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'CÁ NHÂN',
      children: [
        {
          key: '/teacher/profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ giảng viên',
          onClick: () => navigate('/teacher/profile'),
        },
      ],
    },
  ], [collapsed, navigate]);

  const selectedKey = location.pathname.endsWith('/') && location.pathname !== '/teacher'
    ? location.pathname.slice(0, -1)
    : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={250}
        theme="light"
        style={{
          borderRight: '1px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '1px 0 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 1.25rem' : '0 1.5rem',
          gap: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800,
            flexShrink: 0,
          }}>
            🧑‍🏫
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.2 }}>
                Teacher Portal
              </div>
              <Text type="secondary" style={{ fontSize: '0.7rem', display: 'block', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.departmentName ?? 'Giảng dạy & Đào tạo'}
              </Text>
            </div>
          )}
        </div>

        <div style={{ height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '0.5rem 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </div>
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 1.5rem',
          background: '#fff',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '1.1rem', width: 40, height: 40 }}
          />

          <Space size="middle">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: 8 }}>
                <Avatar style={{ backgroundColor: token.colorPrimary, fontWeight: 700 }}>
                  {profile?.fullName?.charAt(0)?.toUpperCase() ?? 'G'}
                </Avatar>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ fontSize: '0.875rem', lineHeight: 1.2 }}>
                    {profile?.fullName ?? 'Giảng viên'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                    {profile?.academicTitle ?? profile?.teacherCode ?? 'GIẢNG VIÊN'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '1.5rem', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
