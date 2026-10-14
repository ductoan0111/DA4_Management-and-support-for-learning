import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Outlet, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space, theme } from 'antd';
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
  const { token } = theme.useToken();

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
      key: 'portal-teacher',
      label: <Link to="/teacher">🧑‍🏫 Cổng Giảng viên</Link>,
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
      icon: <DashboardOutlined />,
      label: 'Bảng điều khiển',
      onClick: () => navigate('/admin'),
    },
    {
      type: 'group',
      label: collapsed ? null : 'NGƯỜI DÙNG',
      children: [
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: 'Tài khoản hệ thống',
          onClick: () => navigate('/admin/users'),
        },
        {
          key: '/admin/teachers',
          icon: <TeamOutlined />,
          label: 'Hồ sơ Giảng viên',
          onClick: () => navigate('/admin/teachers'),
        },
        {
          key: '/admin/students',
          icon: <SolutionOutlined />,
          label: 'Hồ sơ Sinh viên',
          onClick: () => navigate('/admin/students'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'HỌC THUẬT',
      children: [
        {
          key: '/admin/departments',
          icon: <BankOutlined />,
          label: 'Quản lý Khoa',
          onClick: () => navigate('/admin/departments'),
        },
        {
          key: '/admin/majors',
          icon: <ApartmentOutlined />,
          label: 'Chuyên ngành',
          onClick: () => navigate('/admin/majors'),
        },
        {
          key: '/admin/academic-classes',
          icon: <ReadOutlined />,
          label: 'Lớp hành chính',
          onClick: () => navigate('/admin/academic-classes'),
        },
        {
          key: '/admin/courses',
          icon: <BookOutlined />,
          label: 'Học phần / Môn học',
          onClick: () => navigate('/admin/courses'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : 'ĐÀO TẠO & LỚP HP',
      children: [
        {
          key: '/admin/semesters',
          icon: <CalendarOutlined />,
          label: 'Học kỳ',
          onClick: () => navigate('/admin/semesters'),
        },
        {
          key: '/admin/course-sections',
          icon: <TableOutlined />,
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
            background: token.colorPrimary,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800,
            flexShrink: 0,
          }}>
            🎓
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2 }}>
                EduAdmin
              </div>
              <Text type="secondary" style={{ fontSize: '0.7rem' }}>
                Cổng quản trị học vụ
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
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
                </Avatar>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ fontSize: '0.875rem', lineHeight: 1.2 }}>
                    {user?.fullName ?? user?.username}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                    {user?.roleCode ?? 'ADMIN'}
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
