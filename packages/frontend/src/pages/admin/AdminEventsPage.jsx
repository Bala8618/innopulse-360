import { useEffect, useMemo, useState } from 'react';
import { PlatformApi } from '../../services/platformApi';
import PaginationControls from '../../components/common/PaginationControls';

export default function AdminEventsPage() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    PlatformApi.adminRaw('events').then((r) => setRows(r.data.data || []));
  }, []);

  const normalizeStatus = (value) => {
    const raw = String(value || '').toLowerCase().trim();
    if (['open', 'active', 'live'].includes(raw)) return 'open';
    if (['upcoming', 'scheduled'].includes(raw)) return 'upcoming';
    if (['completed', 'done', 'finished'].includes(raw)) return 'completed';
    if (['closed', 'inactive'].includes(raw)) return 'closed';
    return raw;
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery = !q || [r.event_name, r.event_id, r.organizer, r.venue].some((v) => String(v || '').toLowerCase().includes(q));
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
      <h1 className="page-title">Event Monitoring</h1>
      <div className="grid gap-2 md:grid-cols-[1fr_200px]">
        <input
          className="admin-input"
          placeholder="Search events..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <select
          className="admin-select"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Venue</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id}>
                <td>{r.event_name}</td>
                <td>{r.venue}</td>
                <td>{new Date(r.start_date).toLocaleDateString()}</td>
                <td>{new Date(r.end_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${String(r.status || 'open').toLowerCase()}`}>
                    {String(r.status || 'open')}
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
