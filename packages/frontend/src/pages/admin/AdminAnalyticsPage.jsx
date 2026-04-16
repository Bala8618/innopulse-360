import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiCheckCircle, FiClock, FiUsers, FiXCircle, FiCalendar } from 'react-icons/fi';
import { PlatformApi } from '../../services/platformApi';

export default function AdminAnalyticsPage() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    PlatformApi.adminRaw('events').then((r) => setEvents(r.data.data || []));
    PlatformApi.adminRaw('participants').then((r) => setParticipants(r.data.data || []));
  }, []);

  const pending = participants.filter((p) => p.status === 'pending').length;
  const approved = participants.filter((p) => p.status === 'approved').length;
  const rejected = participants.filter((p) => p.status === 'rejected').length;
  const totalRegistrations = approved + pending + rejected;

  const eventPerformance = useMemo(() => {
    const stats = new Map();
    events.forEach((e) => {
      const key = String(e.id ?? e.event_id ?? e.eventId ?? e.event_code ?? e.eventCode);
      const name = e.event_name || e.title || e.name || 'Event';
      stats.set(key, { name, approved: 0, pending: 0, rejected: 0 });
    });
    participants.forEach((p) => {
      const key = String(p.event_id ?? p.eventId ?? p.event_code ?? p.eventCode ?? '');
      const name = p.event_name || p.eventName || 'Event';
      if (!stats.has(key) && key) {
        stats.set(key, { name, approved: 0, pending: 0, rejected: 0 });
      }
      const entry = stats.get(key);
      if (entry) {
        if (p.status === 'approved') entry.approved += 1;
        else if (p.status === 'rejected') entry.rejected += 1;
        else entry.pending += 1;
      }
    });
    return Array.from(stats.values());
  }, [events, participants]);

  const approvalStatus = [
    { name: 'Approved', value: approved },
    { name: 'Pending', value: pending },
    { name: 'Rejected', value: rejected }
  ];
  const miniSeries = [
    { name: 'Jan', value: 42 },
    { name: 'Feb', value: 56 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 70 },
    { name: 'May', value: 63 },
    { name: 'Jun', value: 78 }
  ];
  const resourceSeries = [
    { name: 'Food', value: 42 },
    { name: 'Travel', value: 18 },
    { name: 'Stay', value: 11 }
  ];

  if (!events.length && !participants.length) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">System Analytics</h1>

      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-5">
        <div className="surface-card border-l-4 border-l-blue-600 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Total Events</p>
            <FiCalendar className="text-slate-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900">{events.length}</p>
        </div>
        <div className="surface-card border-l-4 border-l-blue-500 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Total Students</p>
            <FiUsers className="text-slate-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900">{totalRegistrations}</p>
        </div>
        <div className="surface-card border-l-4 border-l-emerald-600 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Approved</p>
            <FiCheckCircle className="text-emerald-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900">{approved}</p>
        </div>
        <div className="surface-card border-l-4 border-l-amber-500 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Pending</p>
            <FiClock className="text-amber-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900">{pending}</p>
        </div>
        <div className="surface-card border-l-4 border-l-rose-600 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Rejected</p>
            <FiXCircle className="text-rose-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900">{rejected}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-5">
          <p className="section-title mb-4">Student Approval Status</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { status: 'Approved', count: approved },
                { status: 'Pending', count: pending },
                { status: 'Rejected', count: rejected }
              ]} barSize={28}>
                <defs>
                  <linearGradient id="adminStatusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Bar dataKey="count" fill="url(#adminStatusGradient)" radius={[10, 10, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-5">
          <p className="section-title mb-4">Event Participation</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventPerformance}>
                <defs>
                  <linearGradient id="adminApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="adminPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="adminRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#F87171" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Bar dataKey="approved" fill="url(#adminApproved)" stackId="a" radius={[10, 10, 0, 0]} animationDuration={900} />
                <Bar dataKey="pending" fill="url(#adminPending)" stackId="a" radius={[10, 10, 0, 0]} animationDuration={900} />
                <Bar dataKey="rejected" fill="url(#adminRejected)" stackId="a" radius={[10, 10, 0, 0]} animationDuration={900} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-5">
          <p className="section-title mb-4">Approval Ratio</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Legend />
                <Pie data={approvalStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={90} fill="#2563eb" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-5">
          <p className="section-title mb-4">Event Performance Comparison</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventPerformance}>
                <defs>
                  <linearGradient id="adminApproved2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="adminPending2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="adminRejected2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#F87171" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Legend />
                <Bar dataKey="approved" fill="url(#adminApproved2)" stackId="a" radius={[10, 10, 0, 0]} animationDuration={900} />
                <Bar dataKey="pending" fill="url(#adminPending2)" stackId="a" radius={[10, 10, 0, 0]} animationDuration={900} />
                <Bar dataKey="rejected" fill="url(#adminRejected2)" stackId="a" radius={[10, 10, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <details className="surface-card p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">Event Success Rate Analysis</summary>
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniSeries}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </details>
        <details className="surface-card p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">Participant Growth Trend</summary>
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniSeries}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </details>
        <details className="surface-card p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">Resource Request Analysis</summary>
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceSeries} barSize={18}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </details>
        <details className="surface-card p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">Monthly Event Performance</summary>
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniSeries}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Line type="monotone" dataKey="value" stroke="#9333EA" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </details>
        <details className="surface-card p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">Mentor Approval Statistics</summary>
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniSeries}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Line type="monotone" dataKey="value" stroke="#DC2626" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </details>
      </div>
    </div>
  );
}
