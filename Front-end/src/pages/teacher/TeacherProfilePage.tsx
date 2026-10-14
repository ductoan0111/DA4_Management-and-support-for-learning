import { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, Button, Avatar, Descriptions, Tag, Alert, Typography, App, Space } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BankOutlined,
  BookOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherProfileApi } from '../../api/teacher-services';
import type { UpdateTeacherProfileRequest } from '../../api/teacher-types';
import { ApiError } from '../../api/client';

const { Title, Text } = Typography;

export default function TeacherProfilePage() {
  const { profile, updateProfile } = useTeacherAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<UpdateTeacherProfileRequest>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    form.setFieldsValue({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : undefined,
      gender: profile.gender ?? undefined,
      avatarUrl: profile.avatarUrl ?? '',
      academicTitle: profile.academicTitle ?? '',
      specialization: profile.specialization ?? '',
    });
  }, [profile, form]);

  const onFinish = async (values: UpdateTeacherProfileRequest) => {
    if (!profile) return;
    setSaving(true);
    setError('');
    try {
      const updated = await teacherProfileApi.update(profile.teacherId, values);
      updateProfile(updated);
      message.success('Đã cập nhật hồ sơ thành công!');
    } catch (e) {
      setError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Hồ sơ giảng viên</Title>
        <Text type="secondary">Xem và cập nhật thông tin cá nhân của bạn</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Profile Card */}
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div style={{ padding: '16px 0' }}>
              <Avatar
                size={88}
                src={profile.avatarUrl}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#2563eb', fontSize: 32, marginBottom: 16 }}
              >
                {profile.fullName.charAt(0)}
              </Avatar>

              <Title level={4} style={{ margin: '0 0 4px' }}>
                {profile.fullName}
              </Title>
              <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>
                {profile.academicTitle || 'Giảng viên'}
              </Tag>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, textAlign: 'left' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<Space size={6}><IdcardOutlined /><span>Mã GV</span></Space>}>
                  <Text strong>{profile.teacherCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Space size={6}><UserOutlined /><span>Tài khoản</span></Space>}>
                  {profile.username}
                </Descriptions.Item>
                <Descriptions.Item label={<Space size={6}><MailOutlined /><span>Email</span></Space>}>
                  {profile.email}
                </Descriptions.Item>
                <Descriptions.Item label={<Space size={6}><BankOutlined /><span>Khoa / Bộ môn</span></Space>}>
                  {profile.departmentName}
                </Descriptions.Item>
                <Descriptions.Item label={<Space size={6}><BookOutlined /><span>Chuyên ngành</span></Space>}>
                  {profile.specialization || '—'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>

        {/* Right Column: Edit Form */}
        <Col xs={24} lg={16}>
          <Card
            title="Cập nhật thông tin cá nhân"
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                style={{ marginBottom: 20 }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  >
                    <Input placeholder="Nguyễn Văn A" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0912345678" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Ngày sinh" name="dateOfBirth">
                    <Input type="date" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Giới tính" name="gender">
                    <Select
                      placeholder="Chọn giới tính"
                      allowClear
                      options={[
                        { value: 0, label: 'Nam' },
                        { value: 1, label: 'Nữ' },
                        { value: 2, label: 'Khác' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Học hàm / Học vị" name="academicTitle">
                    <Input placeholder="VD: Tiến sĩ, Thạc sĩ, PGS.TS" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Chuyên ngành nghiên cứu" name="specialization">
                    <Input placeholder="VD: Khoa học máy tính, Hệ thống thông tin" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Đường dẫn ảnh đại diện (URL)" name="avatarUrl">
                <Input placeholder="https://example.com/avatar.jpg" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  size="large"
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
