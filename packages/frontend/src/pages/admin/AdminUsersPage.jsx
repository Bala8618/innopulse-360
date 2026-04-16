import { useEffect, useMemo, useState } from 'react';
import { PlatformApi } from '../../services/platformApi';
import PaginationControls from '../../components/common/PaginationControls';

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    PlatformApi.adminRaw('participants').then((r) => setRows(r.data.data || []));
  }, []);

  const normalizeStatus = (value) => {
    const raw = String(value || '').toLowerCase().trim();
    if (['approved', 'accept', 'accepted'].includes(raw)) return 'approved';
    if (['pending', 'in_review', 'in review', 'waiting'].includes(raw)) return 'pending';
    if (['rejected', 'declined', 'denied'].includes(raw)) return 'rejected';
    return raw;
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery = !q || [r.student_name, r.email, r.department, r.team_name].some((v) => String(v || '').toLowerCase().includes(q));
      const statusValue = normalizeStatus(r.status || r.registration_status);
      const matchesStatus = status === 'all' || statusValue === status;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, status]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredRows, currentPage]);

  return (
    <div className="space-y-3">
      <h1 className="page-title">User Management</h1>
      <div className="grid gap-2 md:grid-cols-[1fr_200px]">
        <input
          className="admin-input"
          placeholder="Search users..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <select
          className="admin-select"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Event</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id}>
                <td>{r.student_name}</td>
                <td>{r.email}</td>
                <td>{r.department}</td>
                <td>{r.event_id}</td>
                <td>
                  <span className={`status-badge status-${String(r.status || 'pending').toLowerCase()}`}>
                    {String(r.status || 'pending')}
                  </span>
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
    </div>
  );
}
