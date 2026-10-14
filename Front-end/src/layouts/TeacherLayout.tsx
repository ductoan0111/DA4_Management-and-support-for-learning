import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space } from 'antd';
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

  const handleLogout = () => {
    logout();
    navigate('/teacher/login', { replace: true });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '0.5rem 0.6rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size={40}
            src={profile?.avatarUrl}
            icon={<UserOutlined />}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0,
              border: '1px solid #e2e8f0',
            }}
          >
            {profile?.fullName?.charAt(0)?.toUpperCase() ?? 'G'}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.fullName ?? 'Giảng viên'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 4,
                border: '1px solid #bfdbfe',
              }}>
                {profile?.academicTitle || 'Giảng viên'}
              </span>
              <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                Mã: {profile?.teacherCode}
              </Text>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🏛️ {profile?.departmentName}
            </div>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile-link',
      icon: <UserOutlined style={{ color: '#2563eb' }} />,
      label: <span style={{ fontWeight: 600 }}>Hồ sơ cá nhân & Chuyên môn</span>,
      onClick: () => navigate('/teacher/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: <span style={{ fontWeight: 600 }}>Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = useMemo(() => [
    {
      key: '/teacher',
      icon: <HomeOutlined style={{ color: '#2563eb', fontSize: 17 }} />,
      label: <span style={{ fontWeight: 600 }}>Tổng quan giảng dạy</span>,
      onClick: () => navigate('/teacher'),
    },
    {
      type: 'group',
      label: collapsed ? null : (
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', letterSpacing: '0.06em' }}>
          LỚP HỌC PHẦN
        </span>
      ),
      children: [
        {
          key: '/teacher/sections',
          icon: <AppstoreOutlined style={{ color: '#10b981', fontSize: 17 }} />,
          label: 'Lớp của tôi',
          onClick: () => navigate('/teacher/sections'),
        },
        {
          key: '/teacher/schedule',
          icon: <CalendarOutlined style={{ color: '#0891b2', fontSize: 17 }} />,
          label: 'Lịch dạy & Lịch thi',
          onClick: () => navigate('/teacher/schedule'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : (
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706', letterSpacing: '0.06em' }}>
          QUẢN LÝ DẠY HỌC
        </span>
      ),
      children: [
        {
          key: '/teacher/assignments',
          icon: <FormOutlined style={{ color: '#ea580c', fontSize: 17 }} />,
          label: 'Bài tập & Bài nộp',
          onClick: () => navigate('/teacher/assignments'),
        },
        {
          key: '/teacher/materials',
          icon: <FolderOpenOutlined style={{ color: '#f59e0b', fontSize: 17 }} />,
          label: 'Kho tài liệu môn học',
          onClick: () => navigate('/teacher/materials'),
        },
        {
          key: '/teacher/grades',
          icon: <BarChartOutlined style={{ color: '#7c3aed', fontSize: 17 }} />,
          label: 'Điểm số & Tổng kết',
          onClick: () => navigate('/teacher/grades'),
        },
        {
          key: '/teacher/announcements',
          icon: <NotificationOutlined style={{ color: '#e11d48', fontSize: 17 }} />,
          label: 'Thông báo lớp học',
          onClick: () => navigate('/teacher/announcements'),
        },
      ],
    },
    {
      type: 'group',
      label: collapsed ? null : (
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.06em' }}>
          CÁ NHÂN
        </span>
      ),
      children: [
        {
          key: '/teacher/profile',
          icon: <UserOutlined style={{ color: '#6366f1', fontSize: 17 }} />,
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
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        theme="light"
        className="teacher-sider"
        style={{
          borderRight: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '1px 0 10px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 1rem' : '0 1.25rem',
          gap: '0.75rem',
          borderBottom: '1px solid #e2e8f0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            flexShrink: 0,
          }}>
            🧑‍🏫
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontWeight: 900,
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}>
                EduTeacher
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span className="pulse-green" />
                <Text type="secondary" style={{ fontSize: '0.72rem', fontWeight: 500 }}>
                  Cổng Thông tin Giảng viên
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

        {!collapsed && profile && (
          <div style={{
            padding: '0.75rem 0.85rem',
            margin: '0.75rem',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
            border: '1px solid #bbf7d0',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <Avatar
              size={36}
              src={profile.avatarUrl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#10b981',
                fontWeight: 700,
                flexShrink: 0,
                border: '1px solid #bbf7d0',
              }}
            >
              {profile.fullName.charAt(0)}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile.academicTitle || 'Giảng viên'}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  padding: '1px 6px',
                  borderRadius: 999,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {profile.teacherCode}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.departmentName || 'Khoa Chuyên Môn'}
              </div>
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
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '0.78rem',
              fontWeight: 600,
              lineHeight: 1.4,
            }}>
              <span>🧑‍🏫</span>
              <span>Cổng Quản lý Giảng dạy & Học phần</span>
            </div>
          </div>

          <Space size="middle" style={{ lineHeight: 'normal' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              color: '#64748b',
              background: '#f1f5f9',
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}>
              <span>📅</span>
              <span style={{ fontWeight: 500 }}>
                {new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>

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
                <Avatar
                  size={36}
                  src={profile?.avatarUrl}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                    flexShrink: 0,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {profile?.fullName?.charAt(0)?.toUpperCase() ?? 'G'}
                </Avatar>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1 }}>
                  <Text strong style={{ fontSize: '0.82rem', lineHeight: 1.2, color: '#0f172a' }}>
                    {profile?.fullName ?? 'Giảng viên'}
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 4,
                      lineHeight: '14px',
                    }}>
                      {profile?.academicTitle || 'GIẢNG VIÊN'}
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
