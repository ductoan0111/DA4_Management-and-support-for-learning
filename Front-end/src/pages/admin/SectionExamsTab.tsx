import { useEffect, useState, type FormEvent } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, Alert, Card, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { sectionsApi } from '../../api/services';
import type { AdminExamDto, SaveAdminExamRequest } from '../../api/types';
import { getApiErrorMessage } from '../../api/client';

const EXAM_TYPES: Record<number, string> = {
  1: 'Kiểm tra',
  2: 'Giữa kỳ',
  3: 'Cuối kỳ',
  4: 'Khác',
};

const EXAM_COLORS: Record<number, string> = {
  1: 'processing',
  2: 'warning',
  3: 'error',
  4: 'default',
};

const EMPTY_EXAM: SaveAdminExamRequest = {
  examName: '',
  examType: 3,
  examDate: '',
  startTime: '07:00',
  durationMinutes: 60,
  room: '',
  note: '',
};

const toApiTime = (value: string) => (value.length === 5 ? `${value}:00` : value);
const toInputTime = (value: string) => value.slice(0, 5);
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN');

export default function SectionExamsTab({ sectionId }: { sectionId: number }) {
  const [items, setItems] = useState<AdminExamDto[]>([]);
  const [form, setForm] = useState<SaveAdminExamRequest>(EMPTY_EXAM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setItems(await sectionsApi.exams(sectionId));
      setError('');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void sectionsApi
      .exams(sectionId)
      .then(data => {
        setItems(data);
        setError('');
      })
      .catch(e => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [sectionId]);

  const resetForm = () => {
    setForm(EMPTY_EXAM);
    setEditingId(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, startTime: toApiTime(form.startTime) };
    try {
      if (editingId === null) await sectionsApi.createExam(sectionId, payload);
      else await sectionsApi.updateExam(sectionId, editingId, payload);
      resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const edit = (item: AdminExamDto) => {
    setEditingId(item.examId);
    setForm({
      examName: item.examName,
      examType: item.examType,
      examDate: item.examDate,
      startTime: toInputTime(item.startTime),
      durationMinutes: item.durationMinutes,
      room: item.room ?? '',
      note: item.note ?? '',
    });
    setError('');
  };

  const remove = async (examId: number) => {
    try {
      await sectionsApi.deleteExam(sectionId, examId);
      if (editingId === examId) resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const columns: ColumnsType<AdminExamDto> = [
    {
      title: 'Kỳ thi',
      dataIndex: 'examName',
      key: 'examName',
      render: (name: string, record) => (
        <div>
          <span style={{ fontWeight: 600 }}>{name}</span>
          {record.note && <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.note}</div>}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'examType',
      key: 'examType',
      render: (type: number) => <Tag color={EXAM_COLORS[type] || 'default'}>{EXAM_TYPES[type] || 'Khác'}</Tag>,
    },
    {
      title: 'Ngày & Giờ',
      key: 'datetime',
      render: (_, record) => (
        <Space size={6}>
          <span>📅 {formatDate(record.examDate)}</span>
          <span>⏰ {toInputTime(record.startTime)}</span>
        </Space>
      ),
    },
    {
      title: 'Thời lượng',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      render: (min: number) => `${min} phút`,
    },
    {
      title: 'Phòng thi',
      dataIndex: 'room',
      key: 'room',
      render: (room?: string | null) => (
        <Tag icon={<EnvironmentOutlined />}>{room || '—'}</Tag>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByFullName',
      key: 'createdByFullName',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => edit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa lịch thi này?"
            onConfirm={() => void remove(record.examId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 8 }}>
        <form onSubmit={submit}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={6}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tên kỳ thi *</label>
              <Input
                required
                maxLength={200}
                placeholder="VD: Thi cuối kỳ"
                value={form.examName}
                onChange={e => setForm({ ...form, examName: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Loại kỳ thi *</label>
              <Select
                style={{ width: '100%' }}
                value={form.examType}
                onChange={val => setForm({ ...form, examType: val })}
                options={Object.entries(EXAM_TYPES).map(([val, label]) => ({ value: Number(val), label }))}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ngày thi *</label>
              <Input
                type="date"
                required
                value={form.examDate}
                onChange={e => setForm({ ...form, examDate: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Giờ thi *</label>
              <Input
                type="time"
                required
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Thời lượng (phút) *</label>
              <Input
                type="number"
                required
                min={1}
                max={1440}
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phòng thi</label>
              <Input
                placeholder="P.301"
                maxLength={50}
                value={form.room}
                onChange={e => setForm({ ...form, room: e.target.value })}
              />
            </Col>
            <Col xs={24} md={18}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ghi chú</label>
              <Input
                placeholder="Nội dung cần lưu ý"
                maxLength={500}
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
              />
            </Col>
            <Col xs={24} md={6} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <Button type="primary" htmlType="submit" loading={saving} icon={editingId === null ? <PlusOutlined /> : undefined}>
                {editingId === null ? 'Thêm lịch thi' : 'Lưu thay đổi'}
              </Button>
              {editingId !== null && <Button onClick={resetForm}>Hủy sửa</Button>}
            </Col>
          </Row>
        </form>
      </Card>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Table
        dataSource={items}
        columns={columns}
        rowKey="examId"
        loading={loading}
        pagination={false}
        size="small"
      />
    </div>
  );
}
