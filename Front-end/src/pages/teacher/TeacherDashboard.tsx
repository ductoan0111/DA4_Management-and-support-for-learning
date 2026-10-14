import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
  Progress,
} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  StarFilled,
  ArrowRightOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherSectionsApi } from '../../api/teacher-services';
import type { TeacherSectionDto, TeacherScheduleDto, TeacherExamDto } from '../../api/teacher-types';

const { Title, Text, Paragraph } = Typography;

const STATUS_TAG: Record<number, { color: string; label: string }> = {
  0: { color: 'error', label: 'Đã đóng' },
  1: { color: 'success', label: 'Đang mở' },
  2: { color: 'default', label: 'Kết thúc' },
};

const DAY_NAMES: Record<number, string> = {
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
  5: 'Thứ Năm',
  6: 'Thứ Sáu',
  7: 'Thứ Bảy',
  8: 'Chủ Nhật',
};

export default function TeacherDashboard() {
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<TeacherSectionDto[]>([]);
  const [schedules, setSchedules] = useState<TeacherScheduleDto[]>([]);
  const [exams, setExams] = useState<TeacherExamDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    Promise.all([
      teacherSectionsApi.list(profile.teacherId),
      teacherSectionsApi.schedule(profile.teacherId).catch(() => []),
      teacherSectionsApi.exams(profile.teacherId).catch(() => []),
    ])
      .then(([secList, schList, examList]) => {
        setSections(secList);
        setSchedules(schList);
        setExams(examList);
      })
      .finally(() => setLoading(false));
  }, [profile]);

  // Derived statistics
  const activeSections = useMemo(() => sections.filter(s => s.status === 1), [sections]);
  const primarySections = useMemo(() => sections.filter(s => s.isPrimary), [sections]);
  const secondarySections = useMemo(() => sections.filter(s => !s.isPrimary), [sections]);
  const totalStudents = useMemo(() => sections.reduce((acc, s) => acc + s.enrolledCount, 0), [sections]);
  const totalMax = useMemo(
    () => sections.reduce((acc, s) => acc + (s.maxStudents ?? s.enrolledCount), 0),
    [sections]
  );
  const fillRate = totalMax > 0 ? Math.round((totalStudents / totalMax) * 100) : 0;

  // Day of week mapping (JS: 0=Sun, 1=Mon, ..., 6=Sat -> DB: 2=Mon...8=Sun)
  const todayDayOfWeek = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 8 : day + 1;
  }, []);

  const todaySchedules = useMemo(
    () => schedules.filter(s => s.dayOfWeek === todayDayOfWeek),
    [schedules, todayDayOfWeek]
  );

  // Chart data: enrolled vs capacity
  const capacityChartData = useMemo(() => {
    return sections.slice(0, 8).map(s => ({
      name: s.sectionCode.length > 14 ? s.sectionCode.substring(0, 12) + '…' : s.sectionCode,
      fullName: `${s.sectionCode} - ${s.courseName}`,
      enrolled: s.enrolledCount,
      max: s.maxStudents ?? s.enrolledCount,
    }));
  }, [sections]);

  // Chart data: role breakdown
  const roleDistributionData = useMemo(() => {
    return [
      { name: 'GV Chính', value: primarySections.length, color: '#2563eb' },
      { name: 'GV Phụ', value: secondarySections.length, color: '#10b981' },
    ].filter(d => d.value > 0);
  }, [primarySections, secondarySections]);

  if (!profile) return null;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* ─── Hero Banner ───────────────────────────────────────────────────────── */}
      <div className="teacher-hero-banner">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={16}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: 999, marginBottom: 12, backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: '0.85rem' }}>🎓</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
                {profile.departmentName || 'Khoa Chuyên Môn'} · Năm học 2026-2027
              </span>
            </div>

            <Title level={2} style={{ color: '#ffffff', margin: '0 0 8px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Xin chào, {profile.academicTitle ? `${profile.academicTitle} ` : ''}{profile.fullName} 👋
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.92rem', margin: '0 0 16px', maxWidth: 640 }}>
              Chào mừng bạn đến với Cổng Giảng Viên. Bạn hiện đang phụ trách <b>{sections.length} lớp học phần</b> với tổng cộng <b>{totalStudents} sinh viên</b> đang theo học. Chúc bạn có một ngày làm việc tràn đầy hứng khởi!
            </Paragraph>

            <Space wrap size="middle">
              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={() => navigate('/teacher/sections')}
                style={{
                  background: '#ffffff',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  height: 40,
                  borderRadius: 10,
                  padding: '0 1.25rem',
                }}
              >
                Vào danh sách lớp của tôi
              </Button>
              <Button
                icon={<CalendarOutlined />}
                onClick={() => navigate('/teacher/schedule')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(4px)',
                  height: 40,
                  borderRadius: 10,
                }}
              >
                Lịch dạy & Lịch thi
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => navigate('/teacher/grades')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(4px)',
                  height: 40,
                  borderRadius: 10,
                }}
              >
                Bảng điểm tổng kết
              </Button>
            </Space>
          </Col>

          <Col xs={24} lg={8} style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              padding: '1.25rem',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'left',
              display: 'inline-block',
              minWidth: 260,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Tình trạng hôm nay</span>
                <span style={{
                  background: todaySchedules.length > 0 ? '#10b981' : 'rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  padding: '1px 8px',
                  borderRadius: 999,
                  fontWeight: 700,
                }}>
                  {todaySchedules.length > 0 ? `${todaySchedules.length} ca dạy` : 'Không có ca dạy'}
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 2 }}>
                {DAY_NAMES[todayDayOfWeek]}, {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                {todaySchedules.length > 0
                  ? `Ca kế tiếp: ${todaySchedules[0].startTime.substring(0, 5)} tại P.${todaySchedules[0].room ?? '---'}`
                  : 'Hôm nay không có lịch giảng dạy trên lớp.'}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ─── 4 Metric Stat Cards ─────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="teacher-stat-card"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
              borderLeft: '4px solid #2563eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Tổng lớp học phần
                </Text>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.2, margin: '6px 0 4px' }}>
                  {sections.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                  ⭐ {primarySections.length} lớp chính · {secondarySections.length} lớp phụ
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              }}>
                <BookOutlined style={{ fontSize: 22, color: '#ffffff' }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="teacher-stat-card"
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
              borderLeft: '4px solid #10b981',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Lớp đang giảng dạy
                </Text>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#065f46', lineHeight: 1.2, margin: '6px 0 4px' }}>
                  {activeSections.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                  🟢 Đang mở đăng ký & học tập
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
              }}>
                <CheckCircleOutlined style={{ fontSize: 22, color: '#ffffff' }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="teacher-stat-card"
            style={{
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
              borderLeft: '4px solid #f97316',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Tổng sinh viên
                </Text>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#9a3412', lineHeight: 1.2, margin: '6px 0 4px' }}>
                  {totalStudents}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 600 }}>
                  👥 Tỷ lệ lấp đầy: {fillRate}% sĩ số
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
              }}>
                <UsergroupAddOutlined style={{ fontSize: 22, color: '#ffffff' }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            className="teacher-stat-card"
            style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
              borderLeft: '4px solid #8b5cf6',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Lịch dạy & Lịch thi
                </Text>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#5b21b6', lineHeight: 1.2, margin: '6px 0 4px' }}>
                  {schedules.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>
                  📅 {schedules.length} buổi/tuần · {exams.length} ca thi
                </div>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139,92,246,0.25)',
              }}>
                <CalendarOutlined style={{ fontSize: 22, color: '#ffffff' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Today Schedule Alert & Quick Action Bar ─────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  Lịch giảng dạy hôm nay ({DAY_NAMES[todayDayOfWeek]})
                </span>
                <Tag color={todaySchedules.length > 0 ? 'success' : 'default'} style={{ borderRadius: 999, fontWeight: 700 }}>
                  {todaySchedules.length} ca học
                </Tag>
              </div>
            }
            extra={
              <Button type="link" onClick={() => navigate('/teacher/schedule')} icon={<ArrowRightOutlined />}>
                Xem toàn bộ TKB tuần
              </Button>
            }
            style={{ borderRadius: 14, border: '1px solid #e2e8f0', height: '100%' }}
          >
            {todaySchedules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#64748b' }}>
                      Hôm nay bạn không có lịch lên lớp. Hãy tận dụng thời gian để chuẩn bị giáo án hoặc chấm bài nhé!
                    </span>
                  }
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {todaySchedules.map((sch, idx) => (
                  <div key={idx} className="schedule-today-slot">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontWeight: 800,
                          fontSize: '0.82rem',
                        }}>
                          {sch.startTime.substring(0, 5)} - {sch.endTime.substring(0, 5)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                            {sch.sectionCode} — {sch.courseName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Môn học: {sch.courseCode} {sch.building ? `· ${sch.building}` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Tag color="blue" icon={<EnvironmentOutlined />} style={{ fontWeight: 700, padding: '2px 8px' }}>
                          Phòng: {sch.room ?? 'Chưa xếp'} {sch.building ? `(${sch.building})` : ''}
                        </Tag>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => navigate(`/teacher/sections/${sch.sectionId}`)}
                          style={{ borderRadius: 6, fontWeight: 600 }}
                        >
                          Vào lớp học →
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Quick Shortcuts */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  Lối tắt giảng dạy
                </span>
              </div>
            }
            style={{ borderRadius: 14, border: '1px solid #e2e8f0', height: '100%' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="teacher-quick-btn" onClick={() => navigate('/teacher/assignments')}>
                <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>📝</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Bài tập & Chấm</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Xem bài nộp của SV</div>
              </div>

              <div className="teacher-quick-btn" onClick={() => navigate('/teacher/materials')}>
                <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>📁</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Kho tài liệu</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tải tài liệu môn học</div>
              </div>

              <div className="teacher-quick-btn" onClick={() => navigate('/teacher/grades')}>
                <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>📊</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Bảng điểm</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Nhập điểm thành phần</div>
              </div>

              <div className="teacher-quick-btn" onClick={() => navigate('/teacher/announcements')}>
                <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>📢</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Thông báo lớp</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Gửi tin nhắn cho lớp</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Statistical Charts Section ─────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChartOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  Quy mô sĩ số sinh viên các lớp học phần
                </span>
              </div>
            }
            style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
          >
            {capacityChartData.length === 0 ? (
              <Empty description="Chưa có dữ liệu lớp học phần để thống kê" />
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capacityChartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{ background: '#1e293b', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                              <div style={{ fontWeight: 700, marginBottom: 4 }}>{data.fullName}</div>
                              <div>Đã ghi danh: <strong style={{ color: '#60a5fa' }}>{data.enrolled}</strong> SV</div>
                              <div>Sĩ số tối đa: <strong style={{ color: '#94a3b8' }}>{data.max}</strong> SV</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="enrolled" name="Sinh viên đăng ký" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="max" name="Sĩ số tối đa" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CompassOutlined style={{ color: '#10b981', fontSize: 18 }} />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  Phân bố vai trò giảng dạy
                </span>
              </div>
            }
            style={{ borderRadius: 14, border: '1px solid #e2e8f0', height: '100%' }}
          >
            {roleDistributionData.length === 0 ? (
              <Empty description="Chưa có dữ liệu" />
            ) : (
              <div style={{ width: '100%', height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                  Bạn là <b>GV Chính</b> của {primarySections.length} lớp và <b>GV Phụ</b> của {secondarySections.length} lớp
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* ─── Active Course Sections ─────────────────────────────────────────────── */}
      <Card
        bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOutlined style={{ color: '#2563eb', fontSize: 18 }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Danh sách lớp học phần đang mở ({activeSections.length})
            </span>
          </div>
        }
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/teacher/sections')}
            icon={<ArrowRightOutlined />}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Xem tất cả các lớp
          </Button>
        }
        style={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Spin tip="Đang tải dữ liệu lớp học phần..." />
          </div>
        ) : activeSections.length === 0 ? (
          <Empty description="Hiện tại chưa có lớp học phần nào đang mở" style={{ padding: '2rem 0' }} />
        ) : (
          <Row gutter={[16, 16]}>
            {activeSections.slice(0, 6).map(s => {
              const max = s.maxStudents ?? 0;
              const percent = max > 0 ? Math.min(Math.round((s.enrolledCount / max) * 100), 100) : 0;
              const isFull = max > 0 && s.enrolledCount >= max;

              return (
                <Col key={s.sectionId} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                    bodyStyle={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}
                    onClick={() => navigate(`/teacher/sections/${s.sectionId}`)}
                  >
                    <div>
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
                          <Tag color={STATUS_TAG[s.status]?.color ?? 'default'} style={{ margin: 0, borderRadius: 6 }}>
                            {STATUS_TAG[s.status]?.label ?? 'Khác'}
                          </Tag>
                        </Space>
                      </div>

                      <Title level={5} style={{ margin: '8px 0 10px', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, minHeight: 42 }}>
                        {s.courseName}
                      </Title>

                      <Space wrap size={[6, 6]} style={{ marginBottom: 14 }}>
                        <Tag color="geekblue" style={{ borderRadius: 4 }}>{s.courseCode}</Tag>
                        <Tag color="cyan" style={{ borderRadius: 4 }}>{s.credits} tín chỉ</Tag>
                        <Tag style={{ borderRadius: 4 }}>{s.semesterName}</Tag>
                      </Space>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Sĩ số đăng ký</span>
                        <span style={{ fontWeight: 800, color: isFull ? '#dc2626' : '#2563eb' }}>
                          {s.enrolledCount} / {s.maxStudents ?? '∞'} SV ({percent}%)
                        </span>
                      </div>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={isFull ? '#ef4444' : percent > 80 ? '#3b82f6' : '#10b981'}
                        size="small"
                        style={{ marginBottom: 12 }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          🏛️ {s.academicYear}
                        </span>
                        <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          Quản lý lớp <ArrowRightOutlined style={{ fontSize: 11 }} />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>
    </Space>
  );
}
