import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LineChart, Line } from 'recharts';
import { PlatformApi } from '../../services/platformApi';

export default function CollegeManagementPortal() {
  const [reimbursements, setReimbursements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [queries, setQueries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reimbursementQuery, setReimbursementQuery] = useState('');
  const [reimbursementStatus, setReimbursementStatus] = useState('all');
  const [rewardQuery, setRewardQuery] = useState('');
  const [rewardStatus, setRewardStatus] = useState('all');
  const [queryQuery, setQueryQuery] = useState('');
  const [queryStatus, setQueryStatus] = useState('all');

  const load = async () => {
    const [r1, r2, q, a] = await Promise.all([
      PlatformApi.listReimbursements({}),
      PlatformApi.listRewards({}),
      PlatformApi.listQueries({ status: 'open' }),
      PlatformApi.feedbackAnalytics()
    ]);
    setReimbursements(r1.data.data || []);
    setRewards(r2.data.data || []);
    setQueries(q.data.data || []);
    setAnalytics(a.data);
  };
  useEffect(() => { load(); }, []);

  const updateReimbursement = async (id, status) => { await PlatformApi.updateReimbursement(id, { status, remarks: status }); load(); };
  const updateReward = async (id, status) => { await PlatformApi.updateReward(id, { status, reward_points: status === 'approved' ? 100 : 0 }); load(); };
  const replyQuery = async (id) => { await PlatformApi.replyQuery(id, { response: 'Resolved by college management.', responder_role: 'college_management' }); load(); };

  const pie = [
    { name: 'Approved', value: reimbursements.filter((r) => r.status === 'approved').length + rewards.filter((r) => r.status === 'approved').length },
    { name: 'Pending', value: reimbursements.filter((r) => r.status === 'pending').length + rewards.filter((r) => r.status === 'pending').length },
    { name: 'Rejected', value: reimbursements.filter((r) => r.status === 'rejected').length + rewards.filter((r) => r.status === 'rejected').length }
  ];
  const filteredReimbursements = reimbursements.filter((r) => {
    const q = reimbursementQuery.trim().toLowerCase();
    const matchesQuery = !q || [r.reimbursement_code, r.event_id, r.participant_id].some((v) => String(v || '').toLowerCase().includes(q));
    const statusValue = String(r.status || '').toLowerCase();
    const matchesStatus = reimbursementStatus === 'all' || statusValue === reimbursementStatus;
    return matchesQuery && matchesStatus;
  });
  const filteredRewards = rewards.filter((r) => {
    const q = rewardQuery.trim().toLowerCase();
    const matchesQuery = !q || [r.event_name, r.result_type, r.participant_id].some((v) => String(v || '').toLowerCase().includes(q));
    const statusValue = String(r.status || '').toLowerCase();
    const matchesStatus = rewardStatus === 'all' || statusValue === rewardStatus;
    return matchesQuery && matchesStatus;
  });
  const filteredQueries = queries.filter((qItem) => {
    const q = queryQuery.trim().toLowerCase();
    const matchesQuery = !q || [qItem.category, qItem.priority, qItem.description].some((v) => String(v || '').toLowerCase().includes(q));
    const statusValue = String(qItem.status || '').toLowerCase();
    const matchesStatus = queryStatus === 'all' || statusValue === queryStatus;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">College Management Team Portal</h1>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-xl border p-2 dark:border-slate-700">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.byDepartment || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="department" /><YAxis /><Tooltip /><Legend /><Bar dataKey="participants" fill="#2563eb" /><Bar dataKey="wins" fill="#16a34a" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-xl border p-2 dark:border-slate-700">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={pie} dataKey="value" outerRadius={90} label><Cell fill="#16a34a" /><Cell fill="#f59e0b" /><Cell fill="#dc2626" /></Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="h-64 rounded-xl border p-2 dark:border-slate-700">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analytics?.satisfactionTrend || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      </div>

      <section className="rounded-xl border p-3 dark:border-slate-700">
        <h2 className="font-semibold dark:text-white">Reimbursement Approval</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_200px]">
          <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Search reimbursements..." value={reimbursementQuery} onChange={(e) => setReimbursementQuery(e.target.value)} />
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={reimbursementStatus} onChange={(e) => setReimbursementStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="mt-2 space-y-2">{filteredReimbursements.slice(0, 20).map((r) => <div key={r.id} className="flex items-center justify-between rounded border p-2 dark:border-slate-700"><p className="text-sm">#{r.id} code {r.reimbursement_code} - {r.status}</p><div className="space-x-2">{r.status === 'pending' && <><button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => updateReimbursement(r.id, 'approved')}>Approve</button><button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => updateReimbursement(r.id, 'rejected')}>Reject</button></>}</div></div>)}</div>
      </section>

      <section className="rounded-xl border p-3 dark:border-slate-700">
        <h2 className="font-semibold dark:text-white">Rewards Approval</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_200px]">
          <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Search rewards..." value={rewardQuery} onChange={(e) => setRewardQuery(e.target.value)} />
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={rewardStatus} onChange={(e) => setRewardStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="mt-2 space-y-2">{filteredRewards.slice(0, 20).map((r) => <div key={r.id} className="flex items-center justify-between rounded border p-2 dark:border-slate-700"><p className="text-sm">#{r.id} {r.event_name} - {r.result_type} - {r.status}</p><div className="space-x-2">{r.status === 'pending' && <><button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => updateReward(r.id, 'approved')}>Approve</button><button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => updateReward(r.id, 'rejected')}>Reject</button></>}</div></div>)}</div>
      </section>

      <section className="rounded-xl border p-3 dark:border-slate-700">
        <h2 className="font-semibold dark:text-white">Query Management</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_200px]">
          <input className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Search queries..." value={queryQuery} onChange={(e) => setQueryQuery(e.target.value)} />
          <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={queryStatus} onChange={(e) => setQueryStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="mt-2 space-y-2">{filteredQueries.map((q) => <div key={q.id} className="rounded border p-2 dark:border-slate-700"><p className="text-sm font-medium">{q.category} ({q.priority})</p><p className="text-sm text-slate-600 dark:text-slate-300">{q.description}</p><button className="mt-1 rounded bg-blue-600 px-2 py-1 text-xs text-white" onClick={() => replyQuery(q.id)}>Reply</button></div>)}</div>
      </section>
    </div>
  );
}
