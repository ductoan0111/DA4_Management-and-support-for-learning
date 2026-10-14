import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  App,
  Card,
  Tabs,
  Table,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Descriptions,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Popconfirm,
  Typography,
  Avatar,
  Spin,
  Empty,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  VideoCameraOutlined,
  FilePptOutlined,
  FolderOutlined,
  DownloadOutlined,
  LinkOutlined,
  UserOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StarFilled,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import {
  teacherSectionsApi,
  teacherAssignmentsApi,
  teacherMaterialsApi,
  teacherGradesApi,
  teacherAnnouncementsApi,
  teacherStudentsApi,
} from '../../api/teacher-services';
import type {
  TeacherSectionDetailDto,
  TeacherSectionStudentDto,
  TeacherSectionStudentDetailDto,
  TeacherAssignmentDto,
  TeacherMaterialDto,
  TeacherGradeComponentDto,
  TeacherStudentGradeDto,
  TeacherGradeOverviewDto,
  TeacherAnnouncementDto,
  TeacherSubmissionDto,
  CreateAssignmentRequest,
  CreateMaterialRequest,
  SaveGradeComponentRequest,
  CreateAnnouncementRequest,
} from '../../api/teacher-types';
import { ApiError } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Đã đóng', color: 'error' },
  1: { label: 'Đang mở', color: 'success' },
  2: { label: 'Kết thúc', color: 'default' },
};

const DAY_VI: Record<number, string> = {
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
  5: 'Thứ Năm',
  6: 'Thứ Sáu',
  7: 'Thứ Bảy',
  8: 'Chủ Nhật',
};

const EXAM_TYPE_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Kiểm tra', color: 'processing' },
  2: { label: 'Giữa kỳ', color: 'warning' },
  3: { label: 'Cuối kỳ', color: 'error' },
  4: { label: 'Khác', color: 'default' },
};

const ANN_CONFIG: Record<number, { label: string; color: string }> = {
  0: { label: 'Chung', color: 'blue' },
  1: { label: 'Bài tập', color: 'gold' },
  2: { label: 'Thi cử', color: 'red' },
  3: { label: 'Khác', color: 'purple' },
};

const getLetterTagColor = (l?: string | null) => {
  switch (l) {
    case 'A':
      return 'success';
    case 'B+':
    case 'B':
      return 'processing';
    case 'C+':
    case 'C':
      return 'warning';
    case 'D+':
    case 'D':
    case 'F':
      return 'error';
    default:
      return 'default';
  }
};

const getMaterialIcon = (type?: string | null) => {
  switch (type?.toLowerCase()) {
    case 'slide':
    case 'ppt':
    case 'pptx':
      return <FilePptOutlined style={{ fontSize: 24, color: '#ea580c' }} />;
    case 'pdf':
      return <FilePdfOutlined style={{ fontSize: 24, color: '#dc2626' }} />;
    case 'video':
      return <VideoCameraOutlined style={{ fontSize: 24, color: '#7c3aed' }} />;
    case 'doc':
    case 'docx':
      return <FileWordOutlined style={{ fontSize: 24, color: '#2563eb' }} />;
    default:
      return <FolderOutlined style={{ fontSize: 24, color: '#059669' }} />;
  }
};

type Tab = 'info' | 'students' | 'assignments' | 'materials' | 'grades' | 'announcements';

export default function TeacherSectionDetailPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { profile } = useTeacherAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const tid = profile?.teacherId ?? 0;
  const sid = Number(sectionId);

  const [tab, setTab] = useState<Tab>('info');
  const [section, setSection] = useState<TeacherSectionDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Per-tab data
  const [students, setStudents] = useState<TeacherSectionStudentDto[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignmentDto[]>([]);
  const [materials, setMaterials] = useState<TeacherMaterialDto[]>([]);
  const [gradeComponents, setGradeComponents] = useState<TeacherGradeComponentDto[]>([]);
  const [grades, setGrades] = useState<TeacherStudentGradeDto[]>([]);
  const [gradeOverview, setGradeOverview] = useState<TeacherGradeOverviewDto | null>(null);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncementDto[]>([]);

  // Modals & forms
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeacherAssignmentDto | null>(null);
  const [assignmentForm] = Form.useForm<CreateAssignmentRequest>();

  const [materialModal, setMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TeacherMaterialDto | null>(null);
  const [materialForm] = Form.useForm<CreateMaterialRequest>();

  const [componentModal, setComponentModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<TeacherGradeComponentDto | null>(null);
  const [componentForm] = Form.useForm<SaveGradeComponentRequest>();

  const [announcementModal, setAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<TeacherAnnouncementDto | null>(null);
  const [announcementForm] = Form.useForm<CreateAnnouncementRequest>();

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Submissions modal & state
  const [submissionsModal, setSubmissionsModal] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<TeacherAssignmentDto | null>(null);
  const [submissions, setSubmissions] = useState<TeacherSubmissionDto[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState('');
  const [gradingSubmissionId, setGradingSubmissionId] = useState<number | null>(null);
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [gradingSaving, setGradingSaving] = useState(false);

  // Student detail modal & state
  const [studentDetailModal, setStudentDetailModal] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<TeacherSectionStudentDetailDto | null>(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  // Grade editing inline
  const [editingGrade, setEditingGrade] = useState<{ studentId: number; componentId: number } | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [gradeNote, setGradeNote] = useState('');

  useEffect(() => {
    if (!tid || !sid) return;
    teacherSectionsApi
      .get(tid, sid)
      .then(s => {
        setSection(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tid, sid]);

  const loadTabData = useCallback(async (t: Tab) => {
    if (!tid || !sid) return;
    if (t === 'students') {
      teacherStudentsApi.list(tid, sid).then(setStudents);
    }
    if (t === 'assignments') {
      teacherAssignmentsApi.list(tid, sid).then(setAssignments);
    }
    if (t === 'materials') {
      teacherMaterialsApi.list(tid, sid).then(setMaterials);
    }
    if (t === 'grades') {
      teacherGradesApi.components(tid, sid).then(setGradeComponents);
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    }
    if (t === 'announcements') {
      teacherAnnouncementsApi.list(tid, sid).then(setAnnouncements);
    }
  }, [tid, sid]);

  const onTabChange = (key: string) => {
    const t = key as Tab;
    setTab(t);
    loadTabData(t);
  };

  // Assignment CRUD
  const openAddAssignment = () => {
    setEditingAssignment(null);
    assignmentForm.resetFields();
    assignmentForm.setFieldsValue({
      title: '',
      dueAt: '',
      maxScore: 10,
      allowLateSubmission: false,
      isPublished: true,
    });
    setFormError('');
    setAssignmentModal(true);
  };

  const openEditAssignment = (a: TeacherAssignmentDto) => {
    setEditingAssignment(a);
    assignmentForm.setFieldsValue({
      title: a.title,
      description: a.description ?? '',
      attachmentUrl: a.attachmentUrl ?? '',
      openAt: a.openAt ? a.openAt.substring(0, 16) : undefined,
      dueAt: a.dueAt ? a.dueAt.substring(0, 16) : '',
      maxScore: a.maxScore,
      allowLateSubmission: a.allowLateSubmission,
      isPublished: a.isPublished,
    });
    setFormError('');
    setAssignmentModal(true);
  };

  const saveAssignment = async () => {
    try {
      const values = await assignmentForm.validateFields();
      setSaving(true);
      setFormError('');
      if (editingAssignment) {
        await teacherAssignmentsApi.update(tid, sid, editingAssignment.assignmentId, values);
        message.success('Cập nhật bài tập thành công');
      } else {
        await teacherAssignmentsApi.create(tid, sid, values);
        message.success('Tạo bài tập thành công');
      }
      setAssignmentModal(false);
      teacherAssignmentsApi.list(tid, sid).then(setAssignments);
    } catch (e: any) {
      if (e?.errorFields) return; // Form validation failed
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi lưu bài tập');
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = async (a: TeacherAssignmentDto) => {
    try {
      await teacherAssignmentsApi.delete(tid, sid, a.assignmentId);
      message.success('Đã xóa bài tập');
      teacherAssignmentsApi.list(tid, sid).then(setAssignments);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi xóa bài tập' : 'Lỗi');
    }
  };

  // Submissions management & grading
  const openSubmissions = async (a: TeacherAssignmentDto) => {
    setSelectedAssignmentForSubmissions(a);
    setSubmissionsLoading(true);
    setSubmissionsModal(true);
    setGradingSubmissionId(null);
    setSubmissionFilterStatus('');
    try {
      const data = await teacherAssignmentsApi.submissions(tid, sid, a.assignmentId);
      setSubmissions(data);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi tải bài nộp' : 'Lỗi');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const startGrading = (sub: TeacherSubmissionDto) => {
    setGradingSubmissionId(sub.submissionId);
    setGradingScore(sub.score !== null && sub.score !== undefined ? String(sub.score) : '');
    setGradingFeedback(sub.feedback ?? '');
  };

  const submitGrade = async (sub: TeacherSubmissionDto) => {
    if (!selectedAssignmentForSubmissions) return;
    const scoreNum = Number(gradingScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > selectedAssignmentForSubmissions.maxScore) {
      message.error(`Điểm phải từ 0 đến ${selectedAssignmentForSubmissions.maxScore}`);
      return;
    }
    setGradingSaving(true);
    try {
      const updated = await teacherAssignmentsApi.grade(
        tid,
        sid,
        selectedAssignmentForSubmissions.assignmentId,
        sub.submissionId,
        {
          score: scoreNum,
          feedback: gradingFeedback.trim() || undefined,
        }
      );
      setSubmissions(prev => prev.map(s => (s.submissionId === updated.submissionId ? updated : s)));
      setGradingSubmissionId(null);
      message.success('Chấm điểm thành công!');
      teacherAssignmentsApi.list(tid, sid).then(setAssignments);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi chấm điểm' : 'Lỗi');
    } finally {
      setGradingSaving(false);
    }
  };

  // Student detail
  const openStudentDetail = async (studentId: number) => {
    setStudentDetailLoading(true);
    setStudentDetailModal(true);
    try {
      const detail = await teacherStudentsApi.get(tid, sid, studentId);
      setSelectedStudentForDetail(detail);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi tải hồ sơ sinh viên' : 'Lỗi');
      setStudentDetailModal(false);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  // Material CRUD
  const openAddMaterial = () => {
    setEditingMaterial(null);
    materialForm.resetFields();
    materialForm.setFieldsValue({ title: '', isVisible: true });
    setFormError('');
    setMaterialModal(true);
  };

  const openEditMaterial = (m: TeacherMaterialDto) => {
    setEditingMaterial(m);
    materialForm.setFieldsValue({
      title: m.title,
      description: m.description ?? '',
      materialType: m.materialType ?? '',
      fileUrl: m.fileUrl ?? '',
      externalUrl: m.externalUrl ?? '',
      isVisible: m.isVisible,
    });
    setFormError('');
    setMaterialModal(true);
  };

  const saveMaterial = async () => {
    try {
      const values = await materialForm.validateFields();
      setSaving(true);
      setFormError('');
      if (editingMaterial) {
        await teacherMaterialsApi.update(tid, sid, editingMaterial.materialId, values);
        message.success('Cập nhật tài liệu thành công');
      } else {
        await teacherMaterialsApi.create(tid, sid, values);
        message.success('Thêm tài liệu thành công');
      }
      setMaterialModal(false);
      teacherMaterialsApi.list(tid, sid).then(setMaterials);
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi lưu tài liệu');
    } finally {
      setSaving(false);
    }
  };

  const deleteMaterial = async (m: TeacherMaterialDto) => {
    try {
      await teacherMaterialsApi.delete(tid, sid, m.materialId);
      message.success('Đã xóa tài liệu');
      teacherMaterialsApi.list(tid, sid).then(setMaterials);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi xóa tài liệu' : 'Lỗi');
    }
  };

  // Grade component CRUD
  const openAddComponent = () => {
    setEditingComponent(null);
    componentForm.resetFields();
    componentForm.setFieldsValue({
      componentName: '',
      weightPercent: 10,
      maxScore: 10,
      displayOrder: gradeComponents.length + 1,
    });
    setFormError('');
    setComponentModal(true);
  };

  const openEditComponent = (c: TeacherGradeComponentDto) => {
    setEditingComponent(c);
    componentForm.setFieldsValue({
      componentName: c.componentName,
      weightPercent: Number(c.weightPercent),
      maxScore: Number(c.maxScore),
      displayOrder: c.displayOrder,
    });
    setFormError('');
    setComponentModal(true);
  };

  const saveComponent = async () => {
    try {
      const values = await componentForm.validateFields();
      setSaving(true);
      setFormError('');
      if (editingComponent) {
        await teacherGradesApi.updateComponent(tid, sid, editingComponent.gradeComponentId, values);
        message.success('Cập nhật thành phần điểm thành công');
      } else {
        await teacherGradesApi.createComponent(tid, sid, values);
        message.success('Thêm thành phần điểm thành công');
      }
      setComponentModal(false);
      teacherGradesApi.components(tid, sid).then(setGradeComponents);
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const deleteComponent = async (c: TeacherGradeComponentDto) => {
    try {
      await teacherGradesApi.deleteComponent(tid, sid, c.gradeComponentId);
      message.success('Đã xóa thành phần điểm');
      teacherGradesApi.components(tid, sid).then(setGradeComponents);
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi' : 'Lỗi');
    }
  };

  // Grade upsert
  const startEditGrade = (studentId: number, componentId: number, currentScore?: number | null, currentNote?: string | null) => {
    setEditingGrade({ studentId, componentId });
    setGradeInput(currentScore !== null && currentScore !== undefined ? String(currentScore) : '');
    setGradeNote(currentNote ?? '');
  };

  const saveGrade = async () => {
    if (!editingGrade) return;
    try {
      await teacherGradesApi.upsertGrade(tid, sid, editingGrade.studentId, {
        gradeComponentId: editingGrade.componentId,
        score: gradeInput !== '' ? Number(gradeInput) : undefined,
        note: gradeNote || undefined,
      });
      setEditingGrade(null);
      message.success('Đã lưu điểm');
      teacherGradesApi.grades(tid, sid).then(setGrades);
      teacherGradesApi.overview(tid, sid).then(setGradeOverview);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi' : 'Lỗi');
    }
  };

  const finalizeGrades = async () => {
    try {
      const res = await teacherGradesApi.finalize(tid, sid);
      setGradeOverview(res);
      message.success('Đã tính điểm tổng kết thành công!');
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi' : 'Lỗi');
    }
  };

  // Announcement CRUD
  const openAddAnnouncement = () => {
    setEditingAnnouncement(null);
    announcementForm.resetFields();
    announcementForm.setFieldsValue({
      title: '',
      content: '',
      announcementType: 0,
      isActive: true,
    });
    setFormError('');
    setAnnouncementModal(true);
  };

  const openEditAnnouncement = (a: TeacherAnnouncementDto) => {
    setEditingAnnouncement(a);
    announcementForm.setFieldsValue({
      title: a.title,
      content: a.content,
      announcementType: a.announcementType,
      expiresAt: a.expiresAt ? a.expiresAt.substring(0, 16) : undefined,
      isActive: a.isActive,
    });
    setFormError('');
    setAnnouncementModal(true);
  };

  const saveAnnouncement = async () => {
    try {
      const values = await announcementForm.validateFields();
      setSaving(true);
      setFormError('');
      if (editingAnnouncement) {
        await teacherAnnouncementsApi.update(tid, editingAnnouncement.announcementId, values);
        message.success('Cập nhật thông báo thành công');
      } else {
        await teacherAnnouncementsApi.create(tid, sid, values);
        message.success('Đăng thông báo thành công');
      }
      setAnnouncementModal(false);
      teacherAnnouncementsApi.list(tid, sid).then(setAnnouncements);
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(e instanceof ApiError ? (e.data as { message?: string })?.message ?? `Lỗi ${e.status}` : 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (a: TeacherAnnouncementDto) => {
    try {
      await teacherAnnouncementsApi.delete(tid, a.announcementId);
      message.success('Đã xóa thông báo');
      teacherAnnouncementsApi.list(tid, sid).then(setAnnouncements);
    } catch (e) {
      message.error(e instanceof ApiError ? (e.data as { message?: string })?.message ?? 'Lỗi' : 'Lỗi');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Đang tải thông tin lớp học phần..." />
      </div>
    );
  }

  if (!section) {
    return (
      <Card style={{ margin: 24, textAlign: 'center' }}>
        <Empty description="Không tìm thấy lớp học phần" />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/teacher/sections')}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const totalWeight = gradeComponents.reduce((s, c) => s + Number(c.weightPercent), 0);
  const statusInfo = STATUS_CONFIG[section.status] || { label: 'Khác', color: 'default' };

  // Unique students for grades tab
  const uniqueStudents = Array.from(
    new Map(
      grades.map(g => [g.studentId, { studentId: g.studentId, studentCode: g.studentCode, fullName: g.fullName }])
    ).values()
  );
  const gradeMap = new Map(grades.map(g => [`${g.studentId}-${g.gradeComponentId}`, g]));

  // Student list table columns
  const studentColumns: ColumnsType<TeacherSectionStudentDto> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã SV',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, record) => (
        <a onClick={() => openStudentDetail(record.studentId)} style={{ fontWeight: 600 }}>
          {name}
        </a>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone?: string | null) => phone || '—',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button size="small" icon={<UserOutlined />} onClick={() => openStudentDetail(record.studentId)}>
          Xem hồ sơ
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Top Header Card */}
      <Card style={{ marginBottom: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space size={12} wrap align="center">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teacher/sections')}>
                Lớp học phần
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {section.sectionCode} — {section.courseName}
              </Title>
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
              {section.isPrimary && <Tag color="gold" icon={<StarFilled />}>GV Chính</Tag>}
            </Space>
          </Col>
          <Col>
            <Space size={16} wrap style={{ color: '#64748b', fontSize: 13 }}>
              <span>📅 {section.semesterName} ({section.academicYear})</span>
              <span>📚 {section.credits} tín chỉ</span>
              <span>👥 <strong>{section.enrolledCount}</strong>/{section.maxStudents ?? '∞'} sinh viên</span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={tab}
          onChange={onTabChange}
          items={[
            {
              key: 'info',
              label: '📋 Thông tin',
              children: (
                <div>
                  <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                      <Title level={5} style={{ marginBottom: 16 }}>
                        Thông tin chi tiết môn học
                      </Title>
                      <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Mã lớp học phần">
                          <Tag color="blue">{section.sectionCode}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên lớp học phần">
                          {section.sectionName || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã môn học">
                          <Tag>{section.courseCode}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên môn học">
                          {section.courseName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số tín chỉ">
                          {section.credits} tín chỉ
                        </Descriptions.Item>
                        <Descriptions.Item label="Học kỳ">
                          {section.semesterName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm học">
                          {section.academicYear}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sĩ số sinh viên">
                          <strong>{section.enrolledCount}</strong> / {section.maxStudents ?? '∞'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vai trò phân công">
                          {section.isPrimary ? (
                            <Tag color="gold" icon={<StarFilled />}>Giảng viên chính</Tag>
                          ) : (
                            <Tag>Giảng viên phụ</Tag>
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Title level={5} style={{ marginBottom: 16 }}>
                        Thời khóa biểu lớp học
                      </Title>
                      {section.schedules.length === 0 ? (
                        <Empty description="Chưa có lịch học" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                          {section.schedules.map(sch => (
                            <Card key={sch.scheduleId} size="small" style={{ background: '#f8fafc', borderRadius: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong style={{ color: '#2563eb' }}>
                                  {DAY_VI[sch.dayOfWeek] ?? `Thứ ${sch.dayOfWeek}`} · {sch.startTime.substring(0, 5)} - {sch.endTime.substring(0, 5)}
                                </Text>
                                <Tag icon={<EnvironmentOutlined />} color="cyan">
                                  {sch.room ?? '—'} {sch.building ? `(${sch.building})` : ''}
                                </Tag>
                              </div>
                              {sch.note && (
                                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                  {sch.note}
                                </Text>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}

                      <Title level={5} style={{ marginBottom: 16 }}>
                        Lịch thi & Kiểm tra
                      </Title>
                      {section.exams.length === 0 ? (
                        <Empty description="Chưa có lịch thi" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {section.exams.map(ex => {
                            const typeInfo = EXAM_TYPE_CONFIG[ex.examType] || { label: 'Khác', color: 'default' };
                            return (
                              <Card key={ex.examId} size="small" style={{ background: '#fffbeb', borderColor: '#fef08a', borderRadius: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <Text strong style={{ color: '#92400e' }}>{ex.examName}</Text>
                                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                                </div>
                                <div style={{ fontSize: 12, color: '#b45309', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                  <span>📅 {new Date(ex.examDate).toLocaleDateString('vi-VN')}</span>
                                  <span>⏰ {ex.startTime.substring(0, 5)} ({ex.durationMinutes} phút)</span>
                                  <span>🏢 Phòng: {ex.room || '—'}</span>
                                </div>
                                {ex.note && (
                                  <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4, display: 'block' }}>
                                    {ex.note}
                                  </Text>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'students',
              label: `🎓 Sinh viên (${students.length})`,
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Danh sách sinh viên chính thức trong lớp học phần</Text>
                    <Tag color="blue">{students.length} sinh viên</Tag>
                  </div>
                  <Table
                    dataSource={students}
                    columns={studentColumns}
                    rowKey="studentId"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    locale={{ emptyText: <Empty description="Chưa có sinh viên nào đăng ký" /> }}
                  />
                </div>
              ),
            },
            {
              key: 'assignments',
              label: `📝 Bài tập (${assignments.length})`,
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text type="secondary">Quản lý các đề bài tập và chấm điểm bài nộp của sinh viên</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddAssignment}>
                      Tạo bài tập
                    </Button>
                  </div>

                  {assignments.length === 0 ? (
                    <Empty description="Chưa có bài tập nào" />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {assignments.map(a => {
                        const due = new Date(a.dueAt);
                        const isOverdue = due < new Date();
                        return (
                          <Card key={a.assignmentId} size="small" style={{ borderRadius: 8 }}>
                            <Row justify="space-between" align="middle" gutter={[12, 12]}>
                              <Col xs={24} md={16}>
                                <Space size={8} wrap style={{ marginBottom: 4 }}>
                                  <Tag color={a.isPublished ? 'success' : 'warning'}>
                                    {a.isPublished ? 'Đã đăng' : 'Nháp'}
                                  </Tag>
                                  <Text strong style={{ fontSize: 15 }}>{a.title}</Text>
                                  {a.allowLateSubmission && <Tag color="purple">Cho nộp trễ</Tag>}
                                </Space>

                                <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                  <span>
                                    📅 Hạn nộp: <Text strong style={{ color: isOverdue ? '#dc2626' : '#1e293b' }}>{due.toLocaleString('vi-VN')}</Text>
                                  </span>
                                  <span>🎯 Thang điểm: <strong>{a.maxScore}đ</strong></span>
                                  <span>📬 Bài nộp: <strong>{a.totalSubmissions}</strong> (đã chấm: {a.gradedSubmissions})</span>
                                </div>

                                {a.description && (
                                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '6px 0 0', fontSize: 13 }}>
                                    {a.description}
                                  </Paragraph>
                                )}
                              </Col>

                              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                                <Space wrap>
                                  <Button
                                    type="primary"
                                    ghost
                                    onClick={() => openSubmissions(a)}
                                  >
                                    Bài nộp ({a.gradedSubmissions}/{a.totalSubmissions})
                                  </Button>
                                  <Button icon={<EditOutlined />} onClick={() => openEditAssignment(a)} />
                                  <Popconfirm
                                    title="Xóa bài tập này?"
                                    description="Tất cả bài nộp của sinh viên cũng sẽ bị xóa."
                                    onConfirm={() => deleteAssignment(a)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button danger icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'materials',
              label: `📚 Tài liệu (${materials.length})`,
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text type="secondary">Tài liệu, giáo trình, bài giảng tải lên cho sinh viên</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddMaterial}>
                      Thêm tài liệu
                    </Button>
                  </div>

                  {materials.length === 0 ? (
                    <Empty description="Chưa có tài liệu nào" />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {materials.map(m => (
                        <Col xs={24} sm={12} lg={8} key={m.materialId}>
                          <Card
                            size="small"
                            style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 8 }}
                            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                                <div style={{ flexShrink: 0, padding: 4 }}>
                                  {getMaterialIcon(m.materialType)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Tag color={m.isVisible ? 'success' : 'default'} style={{ margin: 0 }}>
                                      {m.isVisible ? 'Hiện' : 'Ẩn'}
                                    </Tag>
                                  </div>
                                  <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: '4px 0', fontSize: 14 }}>
                                    {m.title}
                                  </Title>
                                </div>
                              </div>

                              {m.description && (
                                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 12, marginBottom: 8 }}>
                                  {m.description}
                                </Paragraph>
                              )}

                              <Space wrap size={[6, 6]} style={{ marginBottom: 8 }}>
                                {m.fileUrl && (
                                  <Button size="small" icon={<DownloadOutlined />} href={m.fileUrl} target="_blank">
                                    File
                                  </Button>
                                )}
                                {m.externalUrl && (
                                  <Button size="small" icon={<LinkOutlined />} href={m.externalUrl} target="_blank">
                                    Link
                                  </Button>
                                )}
                              </Space>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                              </Text>
                              <Space size={4}>
                                <Button size="small" icon={<EditOutlined />} onClick={() => openEditMaterial(m)} />
                                <Popconfirm
                                  title="Xóa tài liệu này?"
                                  onConfirm={() => deleteMaterial(m)}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                              </Space>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ),
            },
            {
              key: 'grades',
              label: '📊 Sổ điểm',
              children: (
                <div>
                  {/* Grade components management bar */}
                  <Card size="small" style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 8 }}>
                    <Row justify="space-between" align="middle" gutter={[12, 12]}>
                      <Col>
                        <Space size={8} wrap>
                          <Text strong>Cấu trúc thành phần điểm:</Text>
                          <Tag
                            color={totalWeight === 100 ? 'success' : 'error'}
                            icon={totalWeight === 100 ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                          >
                            Tổng trọng số: {totalWeight}% {totalWeight === 100 ? '(Đủ chuẩn 100%)' : '(Chưa đủ 100%)'}
                          </Tag>
                        </Space>
                      </Col>
                      <Col>
                        <Space wrap>
                          <Button icon={<PlusOutlined />} onClick={openAddComponent}>
                            Thêm cột điểm
                          </Button>
                          {gradeOverview?.isReadyToFinalize && (
                            <Popconfirm
                              title="Tính và chốt điểm tổng kết?"
                              description="Hệ thống sẽ cập nhật điểm tổng kết thang 10, thang 4 và xếp loại chữ."
                              onConfirm={finalizeGrades}
                              okText="Đồng ý"
                              cancelText="Hủy"
                            >
                              <Button type="primary" icon={<CalculatorOutlined />}>
                                Tính điểm TK
                              </Button>
                            </Popconfirm>
                          )}
                        </Space>
                      </Col>
                    </Row>

                    {gradeComponents.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        {gradeComponents.map(c => (
                          <Tag
                            key={c.gradeComponentId}
                            color="blue"
                            style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            <span style={{ fontWeight: 600 }}>{c.componentName}</span>
                            <span style={{ fontSize: 11, color: '#64748b' }}>({c.weightPercent}% - max {c.maxScore}đ)</span>
                            <EditOutlined
                              style={{ cursor: 'pointer', marginLeft: 4 }}
                              onClick={() => openEditComponent(c)}
                            />
                            <Popconfirm
                              title="Xóa thành phần điểm này?"
                              onConfirm={() => deleteComponent(c)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <DeleteOutlined style={{ cursor: 'pointer', color: '#ef4444' }} />
                            </Popconfirm>
                          </Tag>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Grades grid */}
                  {gradeComponents.length === 0 ? (
                    <Empty description="Chưa có thành phần điểm. Vui lòng bấm 'Thêm cột điểm' để thiết lập bảng điểm." />
                  ) : uniqueStudents.length === 0 ? (
                    <Empty description="Lớp chưa có sinh viên đăng ký để nhập điểm." />
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Mã SV</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Họ tên</th>
                            {gradeComponents.map(c => (
                              <th key={c.gradeComponentId} style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <div>{c.componentName}</div>
                                <div style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>({c.maxScore}đ)</div>
                              </th>
                            ))}
                            <th style={{ padding: '8px 12px', textAlign: 'center', background: '#e0f2fe' }}>Điểm TK (10)</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center', background: '#e0f2fe' }}>Xếp loại</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueStudents.map(s => {
                            const overview = gradeOverview?.students.find(x => x.studentId === s.studentId);
                            return (
                              <tr key={s.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 12px' }}>
                                  <Tag color="blue">{s.studentCode}</Tag>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{s.fullName}</td>

                                {gradeComponents.map(c => {
                                  const g = gradeMap.get(`${s.studentId}-${c.gradeComponentId}`);
                                  const isEditing =
                                    editingGrade?.studentId === s.studentId &&
                                    editingGrade.componentId === c.gradeComponentId;

                                  return (
                                    <td key={c.gradeComponentId} style={{ padding: '6px 8px', textAlign: 'center' }}>
                                      {isEditing ? (
                                        <Space.Compact style={{ width: 110 }}>
                                          <Input
                                            type="number"
                                            min={0}
                                            max={c.maxScore}
                                            step={0.1}
                                            size="small"
                                            value={gradeInput}
                                            onChange={e => setGradeInput(e.target.value)}
                                            autoFocus
                                            onPressEnter={saveGrade}
                                          />
                                          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={saveGrade} />
                                          <Button size="small" icon={<CloseOutlined />} onClick={() => setEditingGrade(null)} />
                                        </Space.Compact>
                                      ) : (
                                        <div
                                          onClick={() => startEditGrade(s.studentId, c.gradeComponentId, g?.score, g?.note)}
                                          style={{
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            background: g?.score !== null && g?.score !== undefined ? '#f8fafc' : 'transparent',
                                          }}
                                          title="Nhấp để nhập điểm"
                                        >
                                          <span
                                            style={{
                                              fontWeight: g?.score !== null && g?.score !== undefined ? 700 : 400,
                                              color: g?.score !== null && g?.score !== undefined ? '#1e293b' : '#94a3b8',
                                            }}
                                          >
                                            {g?.score !== null && g?.score !== undefined ? g.score : '—'}
                                          </span>
                                          <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}

                                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, background: '#f0f9ff' }}>
                                  {overview ? overview.calculatedScore10.toFixed(2) : '—'}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center', background: '#f0f9ff' }}>
                                  <Tag color={getLetterTagColor(overview?.letterGrade)} style={{ fontWeight: 700, margin: 0 }}>
                                    {overview?.letterGrade ?? '—'}
                                  </Tag>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'announcements',
              label: `📢 Thông báo (${announcements.length})`,
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text type="secondary">Thông báo dành riêng cho sinh viên lớp học phần này</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddAnnouncement}>
                      Gửi thông báo
                    </Button>
                  </div>

                  {announcements.length === 0 ? (
                    <Empty description="Chưa có thông báo nào" />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {announcements.map(a => {
                        const typeInfo = ANN_CONFIG[a.announcementType] || { label: 'Khác', color: 'default' };
                        return (
                          <Card
                            key={a.announcementId}
                            size="small"
                            style={{
                              borderRadius: 8,
                              opacity: a.isActive ? 1 : 0.65,
                            }}
                          >
                            <Row justify="space-between" align="top" gutter={[12, 12]}>
                              <Col xs={24} md={18}>
                                <Space size={8} wrap style={{ marginBottom: 4 }}>
                                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                                  <Text strong style={{ fontSize: 15 }}>{a.title}</Text>
                                  {!a.isActive && <Tag color="default">Đã ẩn</Tag>}
                                </Space>

                                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 12, marginBottom: 8 }}>
                                  <span>🕐 {new Date(a.publishedAt).toLocaleString('vi-VN')}</span>
                                  {a.expiresAt && <span>Hết hạn: {new Date(a.expiresAt).toLocaleString('vi-VN')}</span>}
                                </div>

                                <Paragraph
                                  style={{
                                    whiteSpace: 'pre-wrap',
                                    margin: 0,
                                    fontSize: 13,
                                    color: '#334155',
                                  }}
                                  ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}
                                >
                                  {a.content}
                                </Paragraph>
                              </Col>

                              <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                                <Space>
                                  <Button icon={<EditOutlined />} onClick={() => openEditAnnouncement(a)} />
                                  <Popconfirm
                                    title="Xóa thông báo này?"
                                    onConfirm={() => deleteAnnouncement(a)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button danger icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ASSIGNMENT MODAL */}
      <Modal
        title={editingAssignment ? 'Sửa bài tập' : 'Tạo bài tập mới'}
        open={assignmentModal}
        onOk={saveAssignment}
        onCancel={() => setAssignmentModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={assignmentForm} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài tập' }]}
          >
            <Input placeholder="VD: Bài tập lớn số 1 - Phân tích yêu cầu" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả / Yêu cầu">
            <Input.TextArea rows={3} placeholder="Nội dung hướng dẫn chi tiết cho sinh viên..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="openAt" label="Mở từ ngày">
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dueAt"
                label="Hạn nộp"
                rules={[{ required: true, message: 'Vui lòng chọn hạn nộp' }]}
              >
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="maxScore"
                label="Thang điểm tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập thang điểm' }]}
              >
                <InputNumber min={0.1} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="attachmentUrl" label="Liên kết đính kèm">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>

          <Space size={24}>
            <Form.Item name="allowLateSubmission" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch /> <span style={{ marginLeft: 8 }}>Cho phép nộp muộn</span>
            </Form.Item>
            <Form.Item name="isPublished" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch /> <span style={{ marginLeft: 8 }}>Công khai bài tập ngay</span>
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* MATERIAL MODAL */}
      <Modal
        title={editingMaterial ? 'Sửa tài liệu' : 'Thêm tài liệu'}
        open={materialModal}
        onOk={saveMaterial}
        onCancel={() => setMaterialModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={560}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={materialForm} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề tài liệu"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề tài liệu' }]}
          >
            <Input placeholder="VD: Slide bài giảng Chương 1" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về tài liệu..." />
          </Form.Item>

          <Form.Item name="materialType" label="Định dạng / Thể loại">
            <Select
              allowClear
              placeholder="Chọn loại tài liệu"
              options={[
                { value: 'slide', label: '📊 Slide trình chiếu' },
                { value: 'pdf', label: '📄 Tài liệu PDF' },
                { value: 'video', label: '🎬 Video bài giảng' },
                { value: 'doc', label: '📝 Văn bản / Word' },
                { value: 'other', label: '📁 Khác' },
              ]}
            />
          </Form.Item>

          <Form.Item name="fileUrl" label="Đường dẫn file (Tải về)">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="externalUrl" label="Liên kết trực tuyến (Drive, YouTube, Docs...)">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="isVisible" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Hiển thị với sinh viên</span>
          </Form.Item>
        </Form>
      </Modal>

      {/* GRADE COMPONENT MODAL */}
      <Modal
        title={editingComponent ? 'Sửa thành phần điểm' : 'Thêm thành phần điểm'}
        open={componentModal}
        onOk={saveComponent}
        onCancel={() => setComponentModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={480}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          Tổng trọng số hiện tại: <strong>{totalWeight}%</strong>
          {editingComponent && ` (chưa tính "${editingComponent.componentName}")`}
        </div>
        <Form form={componentForm} layout="vertical">
          <Form.Item
            name="componentName"
            label="Tên cột điểm"
            rules={[{ required: true, message: 'Vui lòng nhập tên cột điểm' }]}
          >
            <Input placeholder="VD: Chuyên cần, Kiểm tra giữa kỳ, Thi cuối kỳ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="weightPercent"
                label="Trọng số (%)"
                rules={[{ required: true, message: 'Vui lòng nhập trọng số' }]}
              >
                <InputNumber min={0.1} max={100} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxScore"
                label="Điểm tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa' }]}
              >
                <InputNumber min={0.1} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="displayOrder" label="Thứ tự hiển thị">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ANNOUNCEMENT MODAL */}
      <Modal
        title={editingAnnouncement ? 'Sửa thông báo' : 'Gửi thông báo lớp'}
        open={announcementModal}
        onOk={saveAnnouncement}
        onCancel={() => setAnnouncementModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={announcementForm} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề thông báo"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Thông báo nghỉ học và học bù tuần sau" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung thông báo"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập chi tiết nội dung thông báo..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="announcementType" label="Loại thông báo">
                <Select
                  options={[
                    { value: 0, label: '📢 Chung' },
                    { value: 1, label: '📝 Bài tập' },
                    { value: 2, label: '📋 Thi cử' },
                    { value: 3, label: 'ℹ️ Khác' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="expiresAt" label="Hết hạn hiển thị lúc">
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Hiển thị ngay cho sinh viên</span>
          </Form.Item>
        </Form>
      </Modal>

      {/* SUBMISSIONS & GRADING MODAL */}
      <Modal
        title={
          selectedAssignmentForSubmissions ? (
            <div>
              <Title level={5} style={{ margin: 0 }}>
                📬 Bài nộp: {selectedAssignmentForSubmissions.title}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hạn nộp: {new Date(selectedAssignmentForSubmissions.dueAt).toLocaleString('vi-VN')} · Thang điểm: {selectedAssignmentForSubmissions.maxScore}đ
              </Text>
            </div>
          ) : (
            'Bài nộp sinh viên'
          )
        }
        open={submissionsModal}
        onCancel={() => setSubmissionsModal(false)}
        footer={[
          <Button key="close" onClick={() => setSubmissionsModal(false)}>
            Đóng
          </Button>,
        ]}
        width={850}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text strong>
            Tổng cộng: {submissions.length} bài nộp ({submissions.filter(s => s.status === 2).length} đã chấm)
          </Text>
          <Select
            style={{ width: 160 }}
            value={submissionFilterStatus}
            onChange={setSubmissionFilterStatus}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: '0', label: 'Chờ chấm' },
              { value: '2', label: 'Đã chấm' },
            ]}
          />
        </div>

        {submissionsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="Đang tải danh sách bài nộp..." />
          </div>
        ) : submissions.length === 0 ? (
          <Empty description="Chưa có sinh viên nào nộp bài" />
        ) : (
          <div style={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {submissions
              .filter(s => submissionFilterStatus === '' || String(s.status) === submissionFilterStatus)
              .map(sub => {
                const isGradingThis = gradingSubmissionId === sub.submissionId;
                return (
                  <Card
                    key={sub.submissionId}
                    size="small"
                    style={{
                      background: sub.status === 2 ? '#f0fdf4' : '#fff',
                      borderColor: sub.status === 2 ? '#bbf7d0' : '#e2e8f0',
                      borderRadius: 8,
                    }}
                  >
                    <Row justify="space-between" align="middle" gutter={[8, 8]}>
                      <Col>
                        <Space size={8} wrap>
                          <Tag color="blue">{sub.studentCode}</Tag>
                          <Text strong>{sub.fullName}</Text>
                          {sub.isLate && <Tag color="error">Nộp muộn</Tag>}
                          <Tag color={sub.status === 2 ? 'success' : 'warning'}>
                            {sub.status === 2 ? '✓ Đã chấm' : '⏳ Chờ chấm'}
                          </Tag>
                        </Space>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          Nộp: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                          {sub.gradedAt && ` · Chấm: ${new Date(sub.gradedAt).toLocaleString('vi-VN')}`}
                        </div>
                      </Col>

                      <Col>
                        <Space>
                          {sub.status === 2 && !isGradingThis && (
                            <Text strong style={{ fontSize: 16, color: '#16a34a' }}>
                              {sub.score} / {selectedAssignmentForSubmissions?.maxScore}đ
                            </Text>
                          )}
                          {!isGradingThis && (
                            <Button
                              type={sub.status === 2 ? 'default' : 'primary'}
                              size="small"
                              onClick={() => startGrading(sub)}
                            >
                              {sub.status === 2 ? 'Sửa điểm' : 'Chấm điểm'}
                            </Button>
                          )}
                        </Space>
                      </Col>
                    </Row>

                    {/* Submission text content / file */}
                    <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, marginTop: 10, fontSize: 13 }}>
                      <Text strong style={{ color: '#475569', display: 'block', marginBottom: 4 }}>
                        Nội dung bài làm:
                      </Text>
                      <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                        {sub.textContent || <Text type="secondary" italic>Không có nội dung văn bản</Text>}
                      </div>
                      {sub.fileUrl && (
                        <div style={{ marginTop: 8 }}>
                          <Button size="small" icon={<DownloadOutlined />} href={sub.fileUrl} target="_blank">
                            Tải / Mở file đính kèm
                          </Button>
                        </div>
                      )}
                    </div>

                    {sub.feedback && !isGradingThis && (
                      <div style={{ background: '#ecfdf5', padding: '6px 10px', borderRadius: 6, marginTop: 8, fontSize: 12 }}>
                        <Text strong style={{ color: '#065f46' }}>Nhận xét: </Text>
                        <span>{sub.feedback}</span>
                      </div>
                    )}

                    {/* Inline Grading Form */}
                    {isGradingThis && (
                      <div style={{ background: '#eff6ff', padding: 12, borderRadius: 6, marginTop: 10, border: '1px solid #bfdbfe' }}>
                        <Text strong style={{ color: '#1d4ed8', display: 'block', marginBottom: 8 }}>
                          ✍️ Nhập điểm & Nhận xét
                        </Text>
                        <Row gutter={12} align="bottom">
                          <Col xs={24} sm={6}>
                            <label style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>
                              Điểm (/{selectedAssignmentForSubmissions?.maxScore}):
                            </label>
                            <Input
                              type="number"
                              min={0}
                              max={selectedAssignmentForSubmissions?.maxScore}
                              step={0.1}
                              value={gradingScore}
                              onChange={e => setGradingScore(e.target.value)}
                              placeholder="Điểm"
                              autoFocus
                            />
                          </Col>
                          <Col xs={24} sm={14}>
                            <label style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>
                              Nhận xét bài làm:
                            </label>
                            <Input
                              value={gradingFeedback}
                              onChange={e => setGradingFeedback(e.target.value)}
                              placeholder="Nhận xét góp ý cho sinh viên..."
                            />
                          </Col>
                          <Col xs={24} sm={4}>
                            <Space>
                              <Button
                                type="primary"
                                loading={gradingSaving}
                                onClick={() => submitGrade(sub)}
                              >
                                Lưu
                              </Button>
                              <Button onClick={() => setGradingSubmissionId(null)}>Hủy</Button>
                            </Space>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        )}
      </Modal>

      {/* STUDENT DETAIL MODAL */}
      <Modal
        title="🎓 Hồ sơ sinh viên trong lớp học phần"
        open={studentDetailModal}
        onCancel={() => setStudentDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setStudentDetailModal(false)}>
            Đóng
          </Button>,
        ]}
        width={560}
      >
        {studentDetailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="Đang tải thông tin sinh viên..." />
          </div>
        ) : selectedStudentForDetail ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Avatar
                size={56}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#2563eb', fontSize: 24 }}
              >
                {selectedStudentForDetail.fullName.charAt(0)}
              </Avatar>
              <div>
                <Title level={5} style={{ margin: '0 0 4px' }}>
                  {selectedStudentForDetail.fullName}
                </Title>
                <Space size={6}>
                  <Tag color="blue">{selectedStudentForDetail.studentCode}</Tag>
                  <Tag color="green">
                    {selectedStudentForDetail.enrollmentStatus === 1 ? 'Đang học' : 'Khác'}
                  </Tag>
                </Space>
              </div>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Email">{selectedStudentForDetail.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedStudentForDetail.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedStudentForDetail.dateOfBirth
                  ? new Date(selectedStudentForDetail.dateOfBirth).toLocaleDateString('vi-VN')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedStudentForDetail.gender === 1
                  ? 'Nam'
                  : selectedStudentForDetail.gender === 2
                  ? 'Nữ'
                  : 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên ngành">
                {selectedStudentForDetail.majorName} ({selectedStudentForDetail.majorCode})
              </Descriptions.Item>
              <Descriptions.Item label="Lớp hành chính">
                {selectedStudentForDetail.className
                  ? `${selectedStudentForDetail.className} (${selectedStudentForDetail.classCode})`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký">
                {new Date(selectedStudentForDetail.enrolledAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm tổng kết (10)">
                <Text strong style={{ color: '#2563eb' }}>
                  {selectedStudentForDetail.finalScore10 !== null &&
                  selectedStudentForDetail.finalScore10 !== undefined
                    ? selectedStudentForDetail.finalScore10.toFixed(2)
                    : 'Chưa có'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Xếp loại chữ">
                <Tag color={getLetterTagColor(selectedStudentForDetail.letterGrade)}>
                  {selectedStudentForDetail.letterGrade || '—'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <Empty description="Không tìm thấy thông tin sinh viên" />
        )}
      </Modal>
    </div>
  );
}
