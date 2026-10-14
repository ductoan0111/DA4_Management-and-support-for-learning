import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Select,
  Tag,
  Typography,
  Empty,
  Spin,
  Space,
  Input,
  Progress,
  Button,
  Tooltip,
} from 'antd';
import {
  BookOutlined,
  StarFilled,
  CalendarOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  BarChartOutlined,
  FormOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherSectionDto } from '../../api/teacher-types';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Đã đóng', color: 'error' },
  1: { label: 'Đang mở', color: 'success' },
  2: { label: 'Kết thúc', color: 'default' },
};

export default function TeacherSectionsPage() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const fetchSections = () => {
    if (!profile) return;
    const params = filterStatus !== '' ? { status: Number(filterStatus) } : undefined;
    setLoading(true);
    teacherSectionsApi
      .list(profile.teacherId, params)
      .then(setSections)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, [profile, filterStatus]);

  // Client-side search filtering
  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.trim().toLowerCase();
    return sections.filter(
      s =>
        s.sectionCode.toLowerCase().includes(q) ||
        s.courseName.toLowerCase().includes(q) ||
        s.courseCode.toLowerCase().includes(q) ||
        s.semesterName.toLowerCase().includes(q)
    );
  }, [sections, search]);

  // Group by academic year & semester
  const grouped = useMemo(() => {
    return filteredSections.reduce((acc, s) => {
      const key = `${s.academicYear} – ${s.semesterName}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {} as Record<string, TeacherSectionDto[]>);
  }, [filteredSections]);

  const primaryCount = useMemo(() => sections.filter(s => s.isPrimary).length, [sections]);
  const totalStudents = useMemo(() => sections.reduce((acc, s) => acc + s.enrolledCount, 0), [sections]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* ─── Page Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 4, height: 26, background: 'linear-gradient(180deg, #10b981 0%, #2563eb 100%)', borderRadius: 4 }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Lớp học phần của tôi
            </Title>
            <Text type="secondary" style={{ fontSize: '0.82rem' }}>
              Quản lý danh sách lớp học phần được phân công giảng dạy và theo dõi sĩ số
            </Text>
          </div>
        </div>

        {/* Filter Bar */}
        <Space wrap size="middle">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo mã lớp, tên môn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 250, borderRadius: 8 }}
          />

          <Select
            style={{ width: 170, borderRadius: 8 }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: '1', label: '🟢 Đang mở' },
              { value: '0', label: '🔴 Đã đóng' },
              { value: '2', label: '⚪ Kết thúc' },
            ]}
          />

          <Button icon={<ReloadOutlined />} onClick={fetchSections} title="Làm mới danh sách" style={{ borderRadius: 8 }} />
        </Space>
      </div>

      {/* ─── Metric Summary Strip ──────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '0.75rem 1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>TỔNG SỐ LỚP</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{sections.length}</div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 12,
            padding: '0.75rem 1rem',
            boxShadow: '0 1px 3px rgba(37,99,235,0.05)',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600 }}>GV CHÍNH</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{primaryCount}</div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '0.75rem 1rem',
            boxShadow: '0 1px 3px rgba(16,185,129,0.05)',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>GV PHỤ</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>{sections.length - primaryCount}</div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 12,
            padding: '0.75rem 1rem',
            boxShadow: '0 1px 3px rgba(234,88,12,0.05)',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#9a3412', fontWeight: 600 }}>TỔNG SINH VIÊN</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>{totalStudents}</div>
          </div>
        </Col>
      </Row>

      {/* ─── Class List Grouped by Semester ────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải danh sách lớp học phần..." />
        </div>
      ) : filteredSections.length === 0 ? (
        <Card style={{ borderRadius: 14, border: '1px solid #e2e8f0', textAlign: 'center', padding: '2rem 0' }}>
          <Empty description={search ? 'Không tìm thấy lớp học phần phù hợp với từ khóa' : 'Chưa có lớp học phần nào'} />
        </Card>
      ) : (
        Object.entries(grouped).map(([groupKey, items]) => (
          <div key={groupKey} style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              background: '#f1f5f9',
              padding: '0.4rem 0.85rem',
              borderRadius: 8,
              width: 'fit-content',
            }}>
              <CalendarOutlined style={{ color: '#2563eb', fontSize: 16 }} />
              <Text strong style={{ fontSize: '0.92rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {groupKey}
              </Text>
              <Tag color="blue" style={{ borderRadius: 999, fontWeight: 700, margin: 0 }}>
                {items.length} lớp
              </Tag>
            </div>

            <Row gutter={[16, 16]}>
              {items.map(s => {
                const statusInfo = STATUS_CONFIG[s.status] || { label: 'Khác', color: 'default' };
                const max = s.maxStudents ?? 0;
                const percent = max > 0 ? Math.min(Math.round((s.enrolledCount / max) * 100), 100) : 0;
                const isFull = max > 0 && s.enrolledCount >= max;

                return (
                  <Col xs={24} sm={12} lg={8} key={s.sectionId}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 14,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all 0.25s ease',
                      }}
                      bodyStyle={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1.25rem',
                      }}
                      onClick={() => navigate(`/teacher/sections/${s.sectionId}`)}
                    >
                      <div>
                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Tag color="blue" style={{ fontWeight: 800, margin: 0, borderRadius: 6, padding: '2px 8px' }}>
                            {s.sectionCode}
                          </Tag>
                          <Space size={4}>
                            {s.isPrimary && (
                              <Tag color="gold" icon={<StarFilled />} style={{ margin: 0, borderRadius: 6, fontWeight: 700 }}>
                                GV Chính
                              </Tag>
                            )}
                            <Tag color={statusInfo.color} style={{ margin: 0, borderRadius: 6 }}>
                              {statusInfo.label}
                            </Tag>
                          </Space>
                        </div>

                        {/* Course Name */}
                        <Title level={5} style={{ margin: '6px 0 10px', lineHeight: 1.35, minHeight: 44, fontWeight: 800, color: '#0f172a' }}>
                          {s.courseName}
                        </Title>

                        {/* Tags */}
                        <Space wrap size={[6, 6]} style={{ marginBottom: 14 }}>
                          <Tag icon={<BookOutlined />} color="geekblue" style={{ borderRadius: 4 }}>
                            {s.courseCode}
                          </Tag>
                          <Tag color="cyan" style={{ borderRadius: 4 }}>
                            {s.credits} tín chỉ
                          </Tag>
                          <Tag style={{ borderRadius: 4 }}>
                            {s.semesterName}
                          </Tag>
                        </Space>
                      </div>

                      {/* Footer & Progress */}
                      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: '0.8rem' }}>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>Sĩ số đăng ký</span>
                          <span style={{ fontWeight: 800, color: isFull ? '#dc2626' : '#2563eb' }}>
                            {s.enrolledCount} / {s.maxStudents ?? '∞'} ({percent}%)
                          </span>
                        </div>
                        <Progress
                          percent={percent}
                          showInfo={false}
                          strokeColor={isFull ? '#ef4444' : percent > 80 ? '#3b82f6' : '#10b981'}
                          size="small"
                          style={{ marginBottom: 12 }}
                        />

                        {/* Quick Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                          <Space size={4} onClick={e => e.stopPropagation()}>
                            <Tooltip title="Xem bảng điểm lớp">
                              <Button
                                size="small"
                                icon={<BarChartOutlined />}
                                onClick={() => navigate(`/teacher/sections/${s.sectionId}?tab=grades`)}
                                style={{ borderRadius: 6, fontSize: '0.75rem' }}
                              >
                                Điểm
                              </Button>
                            </Tooltip>
                            <Tooltip title="Xem bài tập">
                              <Button
                                size="small"
                                icon={<FormOutlined />}
                                onClick={() => navigate(`/teacher/sections/${s.sectionId}?tab=assignments`)}
                                style={{ borderRadius: 6, fontSize: '0.75rem' }}
                              >
                                Bài tập
                              </Button>
                            </Tooltip>
                            <Tooltip title="Xem tài liệu">
                              <Button
                                size="small"
                                icon={<FolderOpenOutlined />}
                                onClick={() => navigate(`/teacher/sections/${s.sectionId}?tab=materials`)}
                                style={{ borderRadius: 6, fontSize: '0.75rem' }}
                              >
                                Tài liệu
                              </Button>
                            </Tooltip>
                          </Space>

                          <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Chi tiết <ArrowRightOutlined style={{ fontSize: 11 }} />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        ))
      )}
    </Space>
  );
}
