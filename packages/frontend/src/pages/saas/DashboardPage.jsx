import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { FiActivity, FiArrowUpRight, FiCalendar, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';
import { SaasApi } from '../../services/saasApi';
import { PlatformApi } from '../../services/platformApi';

const cardMeta = [
  { key: 'total_events', label: 'Total Events', icon: FiCalendar, trend: '+8%', hint: 'All programs created', impact: 'Tracks scale and throughput' },
  { key: 'total_registrations', label: 'Registrations', icon: FiUsers, trend: '+12%', hint: 'New sign-ups', impact: 'Measures program demand' },
  { key: 'pending_approvals', label: 'Pending Approvals', icon: FiClock, trend: '+4%', hint: 'Awaiting action', impact: 'Highlights immediate bottlenecks' },
  { key: 'approved_participants', label: 'Approved Participants', icon: FiCheckCircle, trend: '+9%', hint: 'Approved teams', impact: 'Shows readiness to execute' },
  { key: 'active_events', label: 'Active Events', icon: FiActivity, trend: '+2%', hint: 'Live right now', impact: 'Indicates operational load' }
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackAnalytics, setFeedbackAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    SaasApi.dashboardStats()
      .then((res) => {
        if (!mounted) return;
        setStats(res.data);
        localStorage.setItem('saas_pending_count', String(res.data?.cards?.pending_approvals || 0));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Unable to load dashboard stats. Configure MySQL and sample data.');
      })
      .finally(() => mounted && setLoading(false));
    PlatformApi.feedbackAnalytics()
      .then((res) => {
        if (!mounted) return;
        setFeedbackAnalytics(res.data || null);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const pieData = useMemo(() => {
    const split = stats?.charts?.approvalSplit || [];
    const approved = split.find((x) => x.status === 'approved')?.value || 0;
    const rejected = split.find((x) => x.status === 'rejected')?.value || 0;
    return [
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected }
    ];
  }, [stats]);

  const maxCardValue = useMemo(() => {
    const values = cardMeta.map((card) => Number(stats?.cards?.[card.key] || 0));
    return Math.max(...values, 1);
  }, [stats]);

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6">Loading dashboard...</div>;
  if (error) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-700">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cardMeta.map((card) => {
          const Icon = card.icon;
          const value = Number(stats?.cards?.[card.key] || 0);
          const progress = Math.min((value / maxCardValue) * 100, 100);
          return (
            <article key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon />
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                <FiArrowUpRight />
                {card.trend} vs last period
              </div>
              <p className="mt-2 text-xs text-slate-500">{card.hint} — {card.impact}</p>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" style={{ width: `${progress}%` }} />
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Event vs Registrations</h2>
            <p className="text-xs text-slate-500">Which events drive demand</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.charts?.eventVsRegistrations || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event_name" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Approvals Health</h2>
            <p className="text-xs text-slate-500">Approval quality control</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  <Cell fill="#4f46e5" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Daily Registration Growth</h2>
          <p className="text-xs text-slate-500">Momentum across the last 14 days</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.charts?.dailyGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="registrations" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      {feedbackAnalytics && (
        <div className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Feedback Satisfaction Trend</h2>
              <p className="text-xs text-slate-500">Quality perception over time</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feedbackAnalytics.satisfactionTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#9333ea" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Feedback by Department</h2>
              <p className="text-xs text-slate-500">Participation and wins</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackAnalytics.byDepartment || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participants" fill="#2563eb" />
                  <Bar dataKey="wins" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
