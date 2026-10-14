import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Table, Input, Button, Space, Popconfirm, Typography, Alert, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getApiErrorMessage } from '../api/client';

const { Title, Text } = Typography;

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface CrudPageProps<T extends { [key: string]: unknown }> {
  title: string;
  fetchList: (params: Record<string, string | number | boolean | undefined>) => Promise<{ items: T[]; totalCount: number; page: number; pageSize: number; totalPages: number }>;
  columns: Column<T>[];
  idKey: keyof T;
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => Promise<void>;
  filters?: React.ReactNode;
  filterParams?: Record<string, string | number | boolean | undefined>;
  searchKey?: string;
  extraActions?: (row: T) => React.ReactNode;
  deleteLabel?: string;
  deleteConfirmMessage?: string;
}

export default function CrudPage<T extends { [key: string]: unknown }>({
  title,
  fetchList,
  columns,
  idKey,
  onAdd,
  onEdit,
  onDelete,
  filters,
  filterParams,
  searchKey = 'search',
  extraActions,
  deleteLabel = 'Xóa',
  deleteConfirmMessage = 'Bạn có chắc chắn muốn xóa bản ghi này?',
}: CrudPageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number | boolean | undefined> = { page, pageSize: 20, ...filterParams };
      if (search) params[searchKey] = search;
      const res = await fetchList(params);
      setItems(res.items);
      setTotalCount(res.totalCount);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Không thể tải dữ liệu'));
    } finally {
      setLoading(false);
    }
  }, [fetchList, page, search, filterParams, searchKey]);

  useEffect(() => {
    const run = () => { void load(); };
    const timer = window.setTimeout(run, 0);
    window.addEventListener('crud-refresh', run);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('crud-refresh', run);
    };
  }, [load]);

  const handleDelete = async (row: T) => {
    setDeleting(row[idKey]);
    try {
      await onDelete(row);
      load();
    } catch (e) {
      alert(getApiErrorMessage(e, 'Xóa thất bại'));
    } finally {
      setDeleting(null);
    }
  };

  const tableColumns = useMemo(() => [
    ...columns.map(c => ({
      key: c.key,
      dataIndex: c.key,
      title: c.header,
      render: (_: unknown, record: T) => (c.render ? c.render(record) : String(record[c.key] ?? '—')),
    })),
    {
      key: '__actions',
      title: 'Thao tác',
      width: 170,
      render: (_: unknown, record: T) => (
        <Space size="small">
          {extraActions?.(record)}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#2563eb' }} />}
              onClick={() => onEdit(record)}
            >
              Sửa
            </Button>
          </Tooltip>
          <Popconfirm
            title={deleteConfirmMessage}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleting === record[idKey] }}
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title={deleteLabel}>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={deleting === record[idKey]}
              >
                {deleteLabel}
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ], [columns, extraActions, onEdit, deleteConfirmMessage, deleteLabel, deleting, idKey]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #2563eb 0%, #7c3aed 100%)', borderRadius: 4 }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {title}
            </Title>
            <Text type="secondary" style={{ fontSize: '0.82rem' }}>
              Quản lý và cập nhật danh mục học vụ hệ thống
            </Text>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          fontSize: '0.82rem',
          padding: '0.35rem 0.95rem',
          borderRadius: 999,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 1px 4px rgba(37,99,235,0.08)',
        }}>
          <span>📊</span>
          <span>Tổng cộng: <strong style={{ color: '#2563eb' }}>{totalCount}</strong> bản ghi</span>
        </div>
      </div>

      {error && <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />}

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: '1.25rem' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <Space wrap size="middle">
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tìm kiếm…"
              allowClear
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: 260, borderRadius: 8 }}
            />
            {filters}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => load()}
              title="Làm mới dữ liệu"
              style={{ borderRadius: 8 }}
            />
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            style={{
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
              borderRadius: 8,
              padding: '0 1.25rem',
              height: 38,
            }}
          >
            Thêm mới
          </Button>
        </div>

        <Table
          rowKey={(record) => String(record[idKey])}
          columns={tableColumns}
          dataSource={items}
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total: totalCount,
            onChange: (p) => setPage(p),
            showTotal: (total) => `Tổng ${total} mục`,
            showSizeChanger: false,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </Space>
  );
}
