import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ReadOutlined,
  BankOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  BookOutlined,
  CalendarOutlined,
  TableOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '0.25rem 0.5rem' }}>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>{user?.fullName ?? user?.username}</div>
          <Text type="secondary" style={{ fontSize: '0.75rem' }}>{user?.email ?? user?.roleCode}</Text>
        </div>
      ),
      disabled: true,
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
      key: '/admin',
      icon: <DashboardOutlined style={{ color: '#2563eb', fontSize: 16 }} />,
      label: <span style={{ fontWeight: 600 }}>Bảng điều khiển</span>,
      onClick: () => navigate('/admin'),
    },
    {
      type: 'group',
      label: collapsed ? null : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.06em' }}>NGƯỜI DÙNG</span>,
      children: [
        {
          key: '/admin/users',
          icon: <UserOutlined style={{ color: '#0284c7', fontSize: 16 }} />,
          label: 'Tài khoản hệ thống',
          onClick: () => navigate('/admin/users'),
        },
        {
          key: '/admin/teachers',
          icon: <TeamOutlined style={{ color: '#d97706', fontSize: 16 }} />,
          label: 'Hồ sơ Giảng viên',
          onClick: () => navigate('/admin/teachers'),
        },
        {
          key: '/admin/students',
          icon: <SolutionOutlined style={{ color: '#059669', fontSize: 16 }} />,
          label: 'Hồ sơ Sinh viên',
          onClick: () => navigate('/admin/students'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '0.06em' }}>HỌC THUẬT</span>,
      children: [
        {
          key: '/admin/departments',
          icon: <BankOutlined style={{ color: '#7c3aed', fontSize: 16 }} />,
          label: 'Quản lý Khoa',
          onClick: () => navigate('/admin/departments'),
        },
        {
          key: '/admin/majors',
          icon: <ApartmentOutlined style={{ color: '#ec4899', fontSize: 16 }} />,
          label: 'Chuyên ngành',
          onClick: () => navigate('/admin/majors'),
        },
        {
          key: '/admin/academic-classes',
          icon: <ReadOutlined style={{ color: '#0891b2', fontSize: 16 }} />,
          label: 'Lớp hành chính',
          onClick: () => navigate('/admin/academic-classes'),
        },
        {
          key: '/admin/courses',
          icon: <BookOutlined style={{ color: '#4f46e5', fontSize: 16 }} />,
          label: 'Học phần / Môn học',
          onClick: () => navigate('/admin/courses'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e11d48', letterSpacing: '0.06em' }}>ĐÀO TẠO & LỚP HP</span>,
      children: [
        {
          key: '/admin/semesters',
          icon: <CalendarOutlined style={{ color: '#ea580c', fontSize: 16 }} />,
          label: 'Học kỳ',
          onClick: () => navigate('/admin/semesters'),
        },
        {
          key: '/admin/course-sections',
          icon: <TableOutlined style={{ color: '#e11d48', fontSize: 16 }} />,
          label: 'Lớp học phần',
          onClick: () => navigate('/admin/course-sections'),
        },
      ],
    },
  ], [collapsed, navigate]);

  // Determine current active menu item
  const selectedKey = location.pathname.endsWith('/') && location.pathname !== '/admin'
    ? location.pathname.slice(0, -1)
    : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        theme="light"
        style={{
          borderRight: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '2px 0 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 1rem' : '0 1.25rem',
          gap: '0.85rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            flexShrink: 0,
          }}>
            🎓
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontWeight: 900,
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}>
                EduAdmin
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span className="pulse-green" />
                <Text type="secondary" style={{ fontSize: '0.72rem', fontWeight: 500 }}>
                  Cổng quản trị học vụ
                </Text>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ borderRight: 0, background: 'transparent' }}
          />
        </div>

        {!collapsed && (
          <div style={{
            padding: '0.85rem 1rem',
            margin: '0.75rem',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
            border: '1px solid #dbeafe',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>Hệ thống Quản lý</span>
              <span style={{
                fontSize: '0.65rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '1px 7px',
                borderRadius: 999,
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
              }}>Online</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Quản trị & Hỗ trợ học tập
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ background: '#f8fafc' }}>
        <Header style={{
          padding: '0 1.5rem',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64,
          lineHeight: 'normal',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', lineHeight: 'normal' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '1.15rem', width: 38, height: 38, borderRadius: 8, color: '#475569' }}
            />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.25rem 0.75rem',
              borderRadius: 999,
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              color: '#2563eb',
              fontSize: '0.78rem',
              fontWeight: 600,
              lineHeight: 1.4,
            }}>
              <span>🛡️</span>
              <span>Khu vực Quản trị Hệ thống</span>
            </div>
          </div>

          <Space size="middle" style={{ lineHeight: 'normal' }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                padding: '0.3rem 0.65rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                lineHeight: 'normal',
                transition: 'all 0.2s',
              }}>
                <Avatar size={34} style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  flexShrink: 0,
                }}>
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? 'Q'}
                </Avatar>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1 }}>
                  <Text strong style={{ fontSize: '0.82rem', lineHeight: 1.2, color: '#0f172a' }}>
                    {user?.fullName ?? user?.username}
                  </Text>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 4,
                      lineHeight: '14px',
                      letterSpacing: '0.04em',
                    }}>
                      {user?.roleCode ?? 'ADMIN'}
                    </span>
                  </div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '1.75rem', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
