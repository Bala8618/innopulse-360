import { useEffect, useMemo, useState } from 'react';
import { PlatformApi } from '../../services/platformApi';
import PaginationControls from '../../components/common/PaginationControls';

const tables = ['events', 'participants', 'event_requests', 'reimbursements', 'od_requests', 'rewards', 'feedback', 'queries'];

export default function AdminDataConsole() {
  const [table, setTable] = useState('events');
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [payload, setPayload] = useState('{}');
  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const pageSize = 20;

  const load = async () => {
    const [raw, a] = await Promise.all([
      PlatformApi.adminRaw(table),
      PlatformApi.feedbackAnalytics().catch(() => ({ data: null }))
    ]);
    setRows(raw.data.data || []);
    setAnalytics(a?.data || null);
  };

  useEffect(() => { load(); }, [table]);
  useEffect(() => { setPage(1); }, [table, rows.length]);

  const columns = useMemo(() => (rows[0] ? Object.keys(rows[0]).slice(0, 8) : []), [rows]);
  const normalizeStatus = (value) => {
    const raw = String(value || '').toLowerCase().trim();
    if (['approved', 'accept', 'accepted'].includes(raw)) return 'approved';
    if (['pending', 'in_review', 'in review', 'waiting'].includes(raw)) return 'pending';
    if (['rejected', 'declined', 'denied'].includes(raw)) return 'rejected';
    if (['open', 'active', 'live'].includes(raw)) return 'open';
    if (['upcoming', 'scheduled'].includes(raw)) return 'upcoming';
    if (['completed', 'done', 'finished'].includes(raw)) return 'completed';
    if (['closed', 'inactive'].includes(raw)) return 'closed';
    return raw;
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery = !q || columns.some((c) => String(r[c] ?? '').toLowerCase().includes(q));
      const statusValue = normalizeStatus(r.status || r.registration_status);
      const matchesStatus = statusFilter === 'all' || statusValue === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter, columns]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredRows, currentPage]);

  const updateRow = async () => {
    setError('');
    setMessage('');
    if (!editId) {
      setError('Select a row to edit.');
      return;
    }
    let parsed = {};
    try {
      parsed = JSON.parse(payload || '{}');
    } catch {
      setError('Invalid JSON. Please correct the payload format.');
      return;
    }
    try {
      await PlatformApi.adminUpdate(table, editId, parsed);
      setMessage(`Row #${editId} updated successfully.`);
      setEditId(null);
      setPayload('{}');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Update failed.');
    }
  };

  const deleteRow = async (id) => {
    setError('');
    setMessage('');
    if (!window.confirm(`Delete row #${id} from ${table}?`)) return;
    try {
      await PlatformApi.adminDelete(table, id);
      setMessage(`Row #${id} deleted successfully.`);
      if (editId === id) {
        setEditId(null);
        setPayload('{}');
      }
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="page-title">Admin Data Console</h1>
      {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">{message}</p>}
      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <select className="admin-select max-w-[220px]" value={table} onChange={(e) => setTable(e.target.value)}>
          {tables.map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400">{rows.length} records</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <input
          className="admin-input"
          placeholder="Search records..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="admin-table-container">
        <table className="admin-table text-xs">
          <thead>
            <tr>
              {columns.map((c) => <th key={c}>{c}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => <td key={c} className="align-middle">{String(r[c]).slice(0, 60)}</td>)}
                <td className="align-middle">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
                      onClick={() => { setEditId(r.id); setPayload(JSON.stringify(r, null, 2)); setError(''); setMessage('Edit mode opened. Update and click Update.'); }}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-700"
                      onClick={() => deleteRow(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredRows.length}
          pageSize={pageSize}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-base font-semibold dark:text-white">Edit Row #{editId} ({table})</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Update JSON and click Save Changes.</p>
            <textarea
              className="mt-3 h-72 w-full rounded-xl border border-slate-200 bg-white p-2 font-mono text-xs shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500/30"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-700 dark:text-slate-200" onClick={() => { setEditId(null); setPayload('{}'); }}>
                Cancel
              </button>
              <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700" onClick={updateRow}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
