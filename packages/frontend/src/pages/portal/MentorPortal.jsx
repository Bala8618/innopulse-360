import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlatformApi } from '../../services/platformApi';
import PaginationControls from '../../components/common/PaginationControls';

const tabs = ['Dashboard', 'OD Requests', 'Reward Requests', 'Assign Reward Points'];

export default function MentorPortal() {
  const user = JSON.parse(localStorage.getItem('innopulse_user') || '{}');
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]);
  const [odRows, setOdRows] = useState([]);
  const [rewardRows, setRewardRows] = useState([]);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [rewardQuery, setRewardQuery] = useState('');
  const [rewardStatus, setRewardStatus] = useState('all');
  const [rewardPage, setRewardPage] = useState(1);
  const rewardPageSize = 10;

  const load = async () => {
    const [odRes, rewardRes] = await Promise.all([
      PlatformApi.listOdRequests({ mentor_email: user.email }),
      PlatformApi.listRewards()
    ]);
    setOdRows(odRes.data.data || []);
    setRewardRows(rewardRes.data.data || []);
  };
  useEffect(() => { load(); }, [user.email]);

  useEffect(() => {
    const hashTab = decodeURIComponent((location.hash || '').replace('#', ''));
    if (hashTab && tabs.includes(hashTab) && hashTab !== tab) setTab(hashTab);
  }, [location.hash, tab]);

  const onSetTab = (next) => {
    setTab(next);
    navigate(`/portal/mentor#${encodeURIComponent(next)}`, { replace: true });
  };

  const updateOd = async (id, statusValue) => {
    await PlatformApi.updateOdRequest(id, { status: statusValue, parent_notified: true });
    setMessage(`OD request ${statusValue}`);
    setTimeout(() => setMessage(''), 2000);
    load();
  };

  const updateReward = async (id, statusValue, reward_points) => {
    await PlatformApi.updateReward(id, { status: statusValue, reward_points });
    setMessage(`Reward request ${statusValue}`);
    setTimeout(() => setMessage(''), 2000);
    load();
  };

  const filteredOd = useMemo(() => {
    const q = query.trim().toLowerCase();
    return odRows.filter((r) => {
      const matchesQuery = !q || [r.event_code, r.participant_id, r.parent_email].some((v) => String(v || '').toLowerCase().includes(q));
      const statusValue = String(r.status || '').toLowerCase();
      const matchesStatus = status === 'all' || statusValue === status;
      return matchesQuery && matchesStatus;
    });
  }, [odRows, query, status]);
  const totalPages = Math.max(1, Math.ceil(filteredOd.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => filteredOd.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredOd, currentPage]);
  const filteredRewards = useMemo(() => {
    const q = rewardQuery.trim().toLowerCase();
    return rewardRows.filter((r) => {
      const matchesQuery = !q || [r.event_name, r.event_id, r.participant_id, r.result_type]
        .some((v) => String(v || '').toLowerCase().includes(q));
      const statusValue = String(r.status || '').toLowerCase();
      const matchesStatus = rewardStatus === 'all' || statusValue === rewardStatus;
      return matchesQuery && matchesStatus;
    });
  }, [rewardRows, rewardQuery, rewardStatus]);
  const rewardTotalPages = Math.max(1, Math.ceil(filteredRewards.length / rewardPageSize));
  const currentRewardPage = Math.min(rewardPage, rewardTotalPages);
  const pageRewards = useMemo(() => filteredRewards.slice((currentRewardPage - 1) * rewardPageSize, currentRewardPage * rewardPageSize), [filteredRewards, currentRewardPage]);

  useEffect(() => {
    setPage(1);
  }, [odRows.length, query, status]);
  useEffect(() => {
    setRewardPage(1);
  }, [rewardRows.length, rewardQuery, rewardStatus]);

  const pendingOd = odRows.filter((r) => r.status === 'pending').length;
  const approvedOd = odRows.filter((r) => r.status === 'approved').length;
  const pendingRewards = rewardRows.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold dark:text-white">Mentor Portal</h1>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => onSetTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {message && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      {tab === 'Dashboard' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Pending OD', value: pendingOd },
            { label: 'Approved OD', value: approvedOd },
            { label: 'Reward Requests', value: rewardRows.length },
            { label: 'Pending Rewards', value: pendingRewards }
          ].map((c) => (
            <div key={c.label} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{c.label}</p>
              <p className="mt-2 text-2xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'OD Requests' && (
        <div className="space-y-3">
          <div className="grid gap-2 md:grid-cols-[1fr_200px]">
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search OD requests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">Event</th><th className="px-3 py-2 text-left">Participant</th><th className="px-3 py-2 text-left">Parent Email</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
              <tbody>{pageRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.event_code}</td>
                  <td className="px-3 py-2">{r.participant_id}</td>
                  <td className="px-3 py-2">{r.parent_email}</td>
                  <td className="px-3 py-2 capitalize">{r.status}</td>
                  <td className="px-3 py-2">
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => updateOd(r.id, 'approved')}>Approve</button>
                        <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => updateOd(r.id, 'rejected')}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
            <PaginationControls
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredOd.length}
              pageSize={pageSize}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {(tab === 'Reward Requests' || tab === 'Assign Reward Points') && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Reward Requests</p>
          <div className="mb-3 grid gap-2 md:grid-cols-[1fr_200px]">
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search rewards..."
              value={rewardQuery}
              onChange={(e) => setRewardQuery(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={rewardStatus}
              onChange={(e) => setRewardStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">Event</th><th className="px-2 py-1 text-left">Participant</th><th className="px-2 py-1 text-left">Result</th><th className="px-2 py-1 text-left">Status</th><th className="px-2 py-1 text-left">Actions</th></tr></thead>
              <tbody>
                {pageRewards.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-2 py-1">{r.event_name || r.event_id}</td>
                    <td className="px-2 py-1">{r.participant_id}</td>
                    <td className="px-2 py-1">{r.result_type}</td>
                    <td className="px-2 py-1 capitalize">{r.status}</td>
                    <td className="px-2 py-1">
                      {r.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => updateReward(r.id, 'approved', r.reward_points || 10)}>Approve</button>
                          <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => updateReward(r.id, 'rejected', 0)}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              page={currentRewardPage}
              totalPages={rewardTotalPages}
              totalItems={filteredRewards.length}
              pageSize={rewardPageSize}
              onPrev={() => setRewardPage((p) => Math.max(1, p - 1))}
              onNext={() => setRewardPage((p) => Math.min(rewardTotalPages, p + 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
