import { useState } from 'react';
import { Modal, Form, Input, Switch, Tag, Alert, Row, Col } from 'antd';
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

export default function SemestersPage() {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminSemesterDto | null>(null);
  const [form] = Form.useForm<SaveAdminSemesterRequest>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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
        fetchList={semestersApi.list as never}
        idKey="semesterId"
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
            header: 'Hiện tại',
            render: r =>
              r.isCurrent ? <Tag color="success">✓ Hiện tại</Tag> : <Tag color="default">—</Tag>,
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

          <Form.Item name="isCurrent" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch /> <span style={{ marginLeft: 8 }}>Đặt làm học kỳ hiện tại</span>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
