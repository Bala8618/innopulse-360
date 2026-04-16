import { useEffect, useMemo, useState } from 'react';
import { SaasApi } from '../../services/saasApi';
import PaginationControls from '../../components/common/PaginationControls';

export default function ParticipantApprovalPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    try {
      const { data } = await SaasApi.getParticipants({ status, search, page: 1, limit: 100 });
      setRows(data.data || []);
      const pending = (data.data || []).filter((r) => r.status === 'pending').length;
      localStorage.setItem('saas_pending_count', String(pending));
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load participants. Configure MySQL.');
    }
  };

  useEffect(() => {
    load();
  }, [status, search]);

  useEffect(() => {
    setPage(1);
  }, [status, search, rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [rows, currentPage]
  );

  const approve = async (id) => {
    await SaasApi.approveParticipant(id);
    load();
  };

  const reject = async () => {
    if (!rejecting) return;
    await SaasApi.rejectParticipant(rejecting, { reason });
    setRejecting(null);
    setReason('');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Participant Approval</h1>
        {error && <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-2 border-b border-slate-200 p-3 md:grid-cols-[1fr_220px]">
          <input className="input-field" placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Show Pending</option>
            <option value="approved">Show Approved</option>
            <option value="rejected">Show Rejected</option>
            <option value="">Show All</option>
          </select>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              {['Student Name', 'College', 'Email', 'Team Name', 'Event Name', 'Registration Date', 'Status', 'Actions'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? pageRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 text-slate-900">{r.student_name}</td>
                <td className="px-3 py-2 text-slate-600">{r.college}</td>
                <td className="px-3 py-2 text-slate-600">{r.email}</td>
                <td className="px-3 py-2 text-slate-600">{r.team_name}</td>
                <td className="px-3 py-2 text-slate-600">{r.event_name}</td>
                <td className="px-3 py-2 text-slate-600">{new Date(r.registration_date).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-1 text-xs ${r.status === 'approved' ? 'bg-indigo-50 text-indigo-700' : r.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {r.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => approve(r.id)} className="btn-primary px-3 py-1 text-xs">Approve</button>
                      <button onClick={() => setRejecting(r.id)} className="rounded-lg bg-rose-600 px-3 py-1 text-xs text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">Reject</button>
                    </div>
                  ) : r.status === 'rejected' ? (
                    <span className="text-xs text-slate-500">{r.rejection_reason || '-'}</span>
                  ) : <span className="text-xs text-slate-500">Approved</span>}
                </td>
              </tr>
            )) : <tr><td className="px-3 py-4" colSpan={8}>No participants found.</td></tr>}
          </tbody>
        </table>
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          totalItems={rows.length}
          pageSize={pageSize}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4">
            <h2 className="font-semibold text-slate-900">Reject Participant</h2>
            <textarea className="input-field mt-3 min-h-[110px]" rows={4} placeholder="Reason for rejection..." value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setRejecting(null)}>Cancel</button>
              <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" onClick={reject}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
