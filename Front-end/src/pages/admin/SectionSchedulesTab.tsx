import { useEffect, useState, type FormEvent } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, Alert, Card, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { sectionsApi } from '../../api/services';
import type { AdminClassScheduleDto, SaveAdminClassScheduleRequest } from '../../api/types';
import { getApiErrorMessage } from '../../api/client';

const DAYS: Record<number, string> = {
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
  5: 'Thứ Năm',
  6: 'Thứ Sáu',
  7: 'Thứ Bảy',
  8: 'Chủ Nhật',
};

const EMPTY_SCHEDULE: SaveAdminClassScheduleRequest = {
  dayOfWeek: 2,
  startTime: '07:00',
  endTime: '09:00',
  room: '',
  building: '',
  effectiveFrom: '',
  effectiveTo: '',
  note: '',
};

const toApiTime = (value: string) => (value.length === 5 ? `${value}:00` : value);
const toInputTime = (value: string) => value.slice(0, 5);
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('vi-VN');

export default function SectionSchedulesTab({ sectionId }: { sectionId: number }) {
  const [items, setItems] = useState<AdminClassScheduleDto[]>([]);
  const [form, setForm] = useState<SaveAdminClassScheduleRequest>(EMPTY_SCHEDULE);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setItems(await sectionsApi.schedules(sectionId));
      setError('');
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void sectionsApi
      .schedules(sectionId)
      .then(data => {
        setItems(data);
        setError('');
      })
      .catch(e => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [sectionId]);

  const resetForm = () => {
    setForm(EMPTY_SCHEDULE);
    setEditingId(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.endTime <= form.startTime) {
      setError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }
    if (form.effectiveTo < form.effectiveFrom) {
      setError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
      return;
    }

    setSaving(true);
    setError('');
    const payload = { ...form, startTime: toApiTime(form.startTime), endTime: toApiTime(form.endTime) };
    try {
      if (editingId === null) await sectionsApi.createSchedule(sectionId, payload);
      else await sectionsApi.updateSchedule(sectionId, editingId, payload);
      resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const edit = (item: AdminClassScheduleDto) => {
    setEditingId(item.scheduleId);
    setForm({
      dayOfWeek: item.dayOfWeek,
      startTime: toInputTime(item.startTime),
      endTime: toInputTime(item.endTime),
      room: item.room ?? '',
      building: item.building ?? '',
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo,
      note: item.note ?? '',
    });
    setError('');
  };

  const remove = async (scheduleId: number) => {
    try {
      await sectionsApi.deleteSchedule(sectionId, scheduleId);
      if (editingId === scheduleId) resetForm();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const columns: ColumnsType<AdminClassScheduleDto> = [
    {
      title: 'Ngày học',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day: number) => <Tag color="blue">{DAYS[day] ?? `Thứ ${day}`}</Tag>,
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#64748b' }} />
          <span>{toInputTime(record.startTime)} – {toInputTime(record.endTime)}</span>
        </Space>
      ),
    },
    {
      title: 'Phòng học',
      key: 'room',
      render: (_, record) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#64748b' }} />
          <span>{[record.room, record.building].filter(Boolean).join(' · ') || '—'}</span>
        </Space>
      ),
    },
    {
      title: 'Thời gian áp dụng',
      key: 'effective',
      render: (_, record) => `${formatDate(record.effectiveFrom)} – ${formatDate(record.effectiveTo)}`,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note?: string | null) => note || '—',
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
            title="Xóa lịch học này?"
            onConfirm={() => void remove(record.scheduleId)}
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
            <Col xs={24} sm={8} md={4}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Ngày học *</label>
              <Select
                style={{ width: '100%' }}
                value={form.dayOfWeek}
                onChange={val => setForm({ ...form, dayOfWeek: val })}
                options={Object.entries(DAYS).map(([val, label]) => ({ value: Number(val), label }))}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Bắt đầu *</label>
              <Input
                type="time"
                required
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Kết thúc *</label>
              <Input
                type="time"
                required
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={8} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phòng</label>
              <Input
                placeholder="P.301"
                maxLength={50}
                value={form.room}
                onChange={e => setForm({ ...form, room: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={8} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tòa nhà</label>
              <Input
                placeholder="Tòa A"
                maxLength={100}
                value={form.building}
                onChange={e => setForm({ ...form, building: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={8} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Áp dụng từ *</label>
              <Input
                type="date"
                required
                value={form.effectiveFrom}
                onChange={e => setForm({ ...form, effectiveFrom: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={8} md={3}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Đến ngày *</label>
              <Input
                type="date"
                required
                value={form.effectiveTo}
                onChange={e => setForm({ ...form, effectiveTo: e.target.value })}
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
                {editingId === null ? 'Thêm lịch học' : 'Lưu thay đổi'}
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
        rowKey="scheduleId"
        loading={loading}
        pagination={false}
        size="small"
      />
    </div>
  );
}
