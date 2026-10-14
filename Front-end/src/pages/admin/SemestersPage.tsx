import { useState, useMemo } from 'react';
import { Modal, Form, Input, Switch, Tag, Alert, Row, Col, Select } from 'antd';
import { getApiErrorMessage } from '../../api/client';
import CrudPage from '../../components/CrudPage';
import { semestersApi } from '../../api/services';
import type { AdminSemesterDto, SaveAdminSemesterRequest } from '../../api/types';

const empty: SaveAdminSemesterRequest = {
  semesterCode: '',
  semesterName: '',
  academicYear: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
};

function getSemesterStatus(r: AdminSemesterDto) {
  // If backend provided status property
  if (r.status === 'current') {
    return {
      label: '✓ Hiện tại',
      color: 'success',
      style: {
        borderRadius: 999,
        padding: '2px 10px',
        fontWeight: 600,
        background: '#ecfdf5',
        color: '#059669',
        border: '1px solid #a7f3d0',
      },
    };
  }
  if (r.status === 'finished') {
    return {
      label: '⏹ Kết thúc',
      color: 'default',
      style: {
        borderRadius: 999,
        padding: '2px 10px',
        fontWeight: 600,
        background: '#f8fafc',
        color: '#64748b',
        border: '1px solid #e2e8f0',
      },
    };
  }
  if (r.status === 'upcoming') {
    return {
      label: '⏳ Sắp tới',
      color: 'processing',
      style: {
        borderRadius: 999,
        padding: '2px 10px',
        fontWeight: 600,
        background: '#eff6ff',
        color: '#2563eb',
        border: '1px solid #bfdbfe',
      },
    };
  }

  // Fallback calculation based on dates and isCurrent
  if (r.isCurrent) {
    return {
      label: '✓ Hiện tại',
      color: 'success',
      style: {
        borderRadius: 999,
        padding: '2px 10px',
        fontWeight: 600,
        background: '#ecfdf5',
        color: '#059669',
        border: '1px solid #a7f3d0',
      },
    };
  }

  if (r.startDate && r.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(r.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(r.endDate);
    end.setHours(23, 59, 59, 999);

    if (today > end) {
      return {
        label: '⏹ Kết thúc',
        color: 'default',
        style: {
          borderRadius: 999,
          padding: '2px 10px',
          fontWeight: 600,
          background: '#f8fafc',
          color: '#64748b',
          border: '1px solid #e2e8f0',
        },
      };
    }

    if (today < start) {
      return {
        label: '⏳ Sắp tới',
        color: 'processing',
        style: {
          borderRadius: 999,
          padding: '2px 10px',
          fontWeight: 600,
          background: '#eff6ff',
          color: '#2563eb',
          border: '1px solid #bfdbfe',
        },
      };
    }

    return {
      label: '✓ Hiện tại',
      color: 'success',
      style: {
        borderRadius: 999,
        padding: '2px 10px',
        fontWeight: 600,
        background: '#ecfdf5',
        color: '#059669',
        border: '1px solid #a7f3d0',
      },
    };
  }

  return {
    label: '—',
    color: 'default',
    style: { borderRadius: 999, padding: '2px 10px' },
  };
}

export default function SemestersPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminSemesterDto | null>(null);
  const [form] = Form.useForm<SaveAdminSemesterRequest>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const filterParams = useMemo(() => {
    const p: Record<string, string | number | boolean | undefined> = {};
    if (filterStatus) p.status = filterStatus;
    return p;
  }, [filterStatus]);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(empty);
    setFormError('');
    setModal(true);
  };

  const openEdit = (row: AdminSemesterDto) => {
    setEditing(row);
    form.setFieldsValue({
      semesterCode: row.semesterCode,
      semesterName: row.semesterName,
      academicYear: row.academicYear,
      startDate: row.startDate ? row.startDate.substring(0, 10) : '',
      endDate: row.endDate ? row.endDate.substring(0, 10) : '',
      isCurrent: row.isCurrent,
    });
    setFormError('');
    setModal(true);
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      setFormError('');
      if (editing) await semestersApi.update(editing.semesterId, values);
      else await semestersApi.create(values);
      setModal(false);
      window.dispatchEvent(new Event('crud-refresh'));
    } catch (e: any) {
      if (e?.errorFields) return;
      setFormError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CrudPage<AdminSemesterDto & { [key: string]: unknown }>
        title="Học kỳ"
        fetchList={p => semestersApi.list({ ...p, ...filterParams }) as never}
        idKey="semesterId"
        filterParams={filterParams}
        filters={
          <Select
            allowClear
            placeholder="Lọc theo trạng thái"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 170, borderRadius: 8 }}
            options={[
              { value: 'current', label: '✓ Hiện tại' },
              { value: 'upcoming', label: '⏳ Sắp tới' },
              { value: 'finished', label: '⏹ Kết thúc' },
            ]}
          />
        }
        columns={[
          {
            key: 'semesterCode',
            header: 'Mã HK',
            render: r => <Tag color="blue">{String(r.semesterCode)}</Tag>,
          },
          { key: 'semesterName', header: 'Tên học kỳ' },
          { key: 'academicYear', header: 'Năm học' },
          {
            key: 'startDate',
            header: 'Bắt đầu',
            render: r => (r.startDate ? new Date(String(r.startDate)).toLocaleDateString('vi-VN') : '—'),
          },
          {
            key: 'endDate',
            header: 'Kết thúc',
            render: r => (r.endDate ? new Date(String(r.endDate)).toLocaleDateString('vi-VN') : '—'),
          },
          {
            key: 'isCurrent',
            header: 'Trạng thái',
            render: r => {
              const info = getSemesterStatus(r as AdminSemesterDto);
              return (
                <Tag color={info.color} style={info.style}>
                  {info.label}
                </Tag>
              );
            },
          },
        ]}
        onAdd={openAdd}
        onEdit={openEdit as never}
        onDelete={async row => {
          await semestersApi.delete(row.semesterId);
        }}
      />

      <Modal
        title={editing ? 'Sửa học kỳ' : 'Thêm học kỳ'}
        open={modal}
        onOk={save}
        onCancel={() => setModal(false)}
        confirmLoading={saving}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
        width={560}
      >
        {formError && <Alert message={formError} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="semesterCode"
                label="Mã học kỳ"
                rules={[{ required: true, message: 'Vui lòng nhập mã học kỳ' }]}
              >
                <Input placeholder="VD: HK1-2024" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="academicYear"
                label="Năm học"
                rules={[{ required: true, message: 'Vui lòng nhập năm học' }]}
              >
                <Input placeholder="VD: 2024-2025" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="semesterName"
            label="Tên học kỳ"
            rules={[{ required: true, message: 'Vui lòng nhập tên học kỳ' }]}
          >
            <Input placeholder="VD: Học kỳ 1 năm 2024-2025" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isCurrent" valuePropName="checked" style={{ marginBottom: 4 }}>
            <Switch /> <span style={{ marginLeft: 8, fontWeight: 600 }}>Đặt làm học kỳ hiện tại</span>
          </Form.Item>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 52 }}>
            Trạng thái tự động: <b>Hiện tại</b> (trong thời gian học kỳ), <b>Sắp tới</b> (chưa đến ngày bắt đầu), <b>Kết thúc</b> (đã qua ngày kết thúc). Bật tùy chọn trên để ưu tiên làm học kỳ hiện tại.
          </div>
        </Form>
      </Modal>
    </>
  );
}
