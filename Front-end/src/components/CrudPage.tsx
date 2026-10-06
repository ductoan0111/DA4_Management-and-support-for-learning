import { useEffect, useState, useCallback } from 'react';
import { getApiErrorMessage } from '../api/client';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface CrudPageProps<T extends { [key: string]: unknown }> {
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
  title, fetchList, columns, idKey, onAdd, onEdit, onDelete, filters, filterParams, searchKey = 'search', extraActions,
  deleteLabel = 'Xóa', deleteConfirmMessage = 'Bạn có chắc muốn xóa?',
}: CrudPageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      setTotalPages(res.totalPages);
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
    if (!window.confirm(deleteConfirmMessage)) return;
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

  return (
    <div>
      <div className="admin-topbar">
        <h1>{title}</h1>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{totalCount} bản ghi</span>
      </div>
      <div className="admin-content">
        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <div className="card">
          <div className="card-body">
            <div className="toolbar">
              <input
                className="search-input"
                placeholder="Tìm kiếm…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              {filters}
              <div className="spacer" />
              <button className="btn btn-primary" onClick={onAdd}>+ Thêm mới</button>
            </div>

            <div className="table-wrapper">
              {loading ? (
                <div className="admin-loading">Đang tải…</div>
              ) : items.length === 0 ? (
                <div className="empty-state"><div className="icon">📭</div><div>Không có dữ liệu</div></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      {columns.map(c => <th key={c.key}>{c.header}</th>)}
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(row => (
                      <tr key={String(row[idKey])}>
                        {columns.map(c => (
                          <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '')}</td>
                        ))}
                        <td>
                          <div className="actions">
                            {extraActions?.(row)}
                            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(row)}>✏️ Sửa</button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(row)}
                              disabled={deleting === row[idKey]}
                            >
                              🗑️ {deleteLabel}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
                <span>Trang {page} / {totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
