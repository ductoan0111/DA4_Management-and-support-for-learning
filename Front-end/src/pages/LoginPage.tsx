import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../api/client';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      await login(values);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
      } else {
        setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #3b82f6 100%)',
      padding: '1.5rem',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          borderRadius: 16,
          border: 'none',
        }}
        bodyStyle={{ padding: '2.5rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: '#eff6ff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#2563eb',
            fontSize: '2rem',
          }}>
            <SafetyCertificateOutlined />
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            EduAdmin
          </Title>
          <Text type="secondary" style={{ fontSize: '0.875rem' }}>
            Hệ thống Quản lý & Hỗ trợ học tập
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '1.5rem' }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false} size="large">
          <Form.Item
            name="username"
            label={<Text strong>Tên đăng nhập</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Nhập username"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text strong>Mật khẩu</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<LoginOutlined />}
              style={{ height: 46, fontWeight: 600, fontSize: '1rem' }}
            >
              Đăng nhập quản trị
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <Space>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>Bạn là giảng viên?</Text>
            <Link to="/teacher/login" style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem' }}>
              Cổng Giảng Viên →
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}
