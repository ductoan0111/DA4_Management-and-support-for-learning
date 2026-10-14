import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Input, Select, Tag, Button, Typography, Spin, Empty, Space } from 'antd';
import {
  FilePdfOutlined,
  FileWordOutlined,
  VideoCameraOutlined,
  FilePptOutlined,
  FolderOutlined,
  DownloadOutlined,
  LinkOutlined,
  ArrowRightOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherMaterialsApi, teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherMaterialDto, TeacherSectionDto } from '../../api/teacher-types';

const { Title, Text, Paragraph } = Typography;

const getMaterialIcon = (type?: string | null) => {
  switch (type?.toLowerCase()) {
    case 'slide':
    case 'ppt':
    case 'pptx':
      return <FilePptOutlined style={{ fontSize: 28, color: '#ea580c' }} />;
    case 'pdf':
      return <FilePdfOutlined style={{ fontSize: 28, color: '#dc2626' }} />;
    case 'video':
      return <VideoCameraOutlined style={{ fontSize: 28, color: '#7c3aed' }} />;
    case 'doc':
    case 'docx':
      return <FileWordOutlined style={{ fontSize: 28, color: '#2563eb' }} />;
    default:
      return <FolderOutlined style={{ fontSize: 28, color: '#059669' }} />;
  }
};

export default function TeacherMaterialsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [materials, setMaterials] = useState<TeacherMaterialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (!profile) return;
    teacherSectionsApi.list(profile.teacherId).then(setSections);
  }, [profile]);

  useEffect(() => {
    if (!profile || sections.length === 0) return;
    const secs = filterSection ? [{ sectionId: Number(filterSection) }] : sections;
    setLoading(true);
    Promise.all(secs.map(s => teacherMaterialsApi.list(profile.teacherId, s.sectionId, search || undefined)))
      .then(results =>
        setMaterials(
          results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        )
      )
      .finally(() => setLoading(false));
  }, [profile, sections, filterSection, search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Kho tài liệu</Title>
          <Text type="secondary">Tất cả bài giảng, tài liệu tham khảo và học liệu cho sinh viên</Text>
        </div>
        <Space wrap>
          <Input.Search
            placeholder="Tìm theo tên tài liệu..."
            allowClear
            style={{ width: 220 }}
            onSearch={val => setSearch(val.trim())}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Lọc theo lớp học phần"
            value={filterSection}
            onChange={setFilterSection}
            options={[
              { value: '', label: 'Tất cả lớp học phần' },
              ...sections.map(s => ({
                value: String(s.sectionId),
                label: `${s.sectionCode} (${s.courseCode})`,
              })),
            ]}
          />
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải danh sách tài liệu..." />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <Empty description="Không có tài liệu nào" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {materials.map(m => (
            <Col xs={24} sm={12} lg={8} key={m.materialId}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                styles={{
                  body: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 16,
                  },
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div style={{ flexShrink: 0, padding: 6, background: '#f8fafc', borderRadius: 8 }}>
                      {getMaterialIcon(m.materialType)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Tag color="blue" style={{ margin: 0 }}>{m.sectionCode}</Tag>
                        <Tag
                          color={m.isVisible ? 'success' : 'default'}
                          icon={m.isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          style={{ margin: 0 }}
                        >
                          {m.isVisible ? 'Hiện' : 'Ẩn'}
                        </Tag>
                      </div>
                      <Title
                        level={5}
                        ellipsis={{ rows: 2 }}
                        style={{ margin: '8px 0 4px', fontSize: 14, lineHeight: 1.4 }}
                      >
                        {m.title}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {m.courseCode}
                      </Text>
                    </div>
                  </div>

                  {m.description && (
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ fontSize: 12, marginBottom: 12, color: '#64748b' }}
                    >
                      {m.description}
                    </Paragraph>
                  )}

                  <Space wrap size={[6, 6]} style={{ marginBottom: 12 }}>
                    {m.fileUrl && (
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Tải file
                      </Button>
                    )}
                    {m.externalUrl && (
                      <Button
                        size="small"
                        icon={<LinkOutlined />}
                        href={m.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Liên kết
                      </Button>
                    )}
                  </Space>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: 8,
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Space size={4} style={{ fontSize: 11, color: '#94a3b8' }}>
                    <CalendarOutlined />
                    <span>{new Date(m.createdAt).toLocaleDateString('vi-VN')}</span>
                  </Space>

                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() =>
                      navigate(`/teacher/sections/${m.sectionId}`, {
                        state: { tab: 'materials' },
                      })
                    }
                  >
                    Xem lớp <ArrowRightOutlined style={{ fontSize: 10 }} />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
