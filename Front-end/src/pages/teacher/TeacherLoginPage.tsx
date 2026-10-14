import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, Alert, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';

const { Title, Text } = Typography;

export default function TeacherLoginPage() {
  const { login } = useTeacherAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      await login(values.username, values.password);
      navigate('/teacher', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'NOT_TEACHER') setError('Tài khoản này không có quyền giảng viên.');
        else if (err.message === 'TEACHER_PROFILE_NOT_FOUND') setError('Chưa có hồ sơ giảng viên cho tài khoản này.');
        else setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
      } else {
        setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillAccount = (username: string, pass: string) => {
    form.setFieldsValue({ username, password: pass });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2647 0%, #1e3a5f 50%, #2563eb 100%)',
      padding: '1.5rem',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          borderRadius: 16,
          border: 'none',
        }}
        bodyStyle={{ padding: '2.5rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '3rem',
            lineHeight: 1,
            marginBottom: '0.75rem',
          }}>
            🧑‍🏫
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            Cổng Giảng Viên
          </Title>
          <Text type="secondary" style={{ fontSize: '0.875rem' }}>
            Đăng nhập để quản lý lớp học phần & điểm số
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="username"
            label={<Text strong>Tên đăng nhập</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Nhập username (VD: gv001)"
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
              Đăng nhập giảng dạy
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          marginTop: '1rem',
          padding: '0.875rem',
          background: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
            <ExperimentOutlined style={{ color: '#2563eb' }} /> Tài khoản mẫu thử nghiệm:
          </div>
          <Space wrap size="small">
            <Button
              size="small"
              onClick={() => fillAccount('gv001', '123456')}
              style={{ fontSize: '0.75rem' }}
            >
              ThS. Nguyễn Minh Anh (gv001)
            </Button>
            <Button
              size="small"
              onClick={() => fillAccount('gv002', '123456')}
              style={{ fontSize: '0.75rem' }}
            >
              TS. Trần Quốc Huy (gv002)
            </Button>
          </Space>
        </div>

        <Divider style={{ margin: '1.25rem 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Space>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>Dành riêng cho giảng viên ·</Text>
            <Link to="/admin/login" style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.85rem' }}>
              Cổng Quản trị Admin →
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}
