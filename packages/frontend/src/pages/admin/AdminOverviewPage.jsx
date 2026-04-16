import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiCheckCircle, FiClock, FiUsers, FiXCircle, FiCalendar } from 'react-icons/fi';
import { PlatformApi } from '../../services/platformApi';

export default function AdminOverviewPage() {
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

  const eventParticipation = useMemo(() => {
    const eventIdMap = new Map();
    events.forEach((e) => {
      const key = e.id ?? e.event_id ?? e.eventId ?? e.event_code ?? e.eventCode;
      const name = e.event_name || e.title || e.name || 'Event';
      eventIdMap.set(String(key), { name, count: 0 });
    });
    participants.forEach((p) => {
      const key = String(p.event_id ?? p.eventId ?? p.event_code ?? p.eventCode ?? '');
      const fallbackName = p.event_name || p.eventName || 'Event';
      if (eventIdMap.has(key)) {
        eventIdMap.get(key).count += 1;
      } else if (key) {
        eventIdMap.set(key, { name: fallbackName, count: 1 });
      }
    });
    return Array.from(eventIdMap.values());
  }, [events, participants]);

  const approvalStatus = [
    { status: 'Approved', count: approved },
    { status: 'Pending', count: pending },
    { status: 'Rejected', count: rejected }
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title dark:text-white">Admin Overview</h1>

      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-5">
        <div className="surface-card border-l-4 border-l-blue-600 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Events</p>
            <FiCalendar className="text-slate-500 dark:text-slate-300" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900 dark:text-white">{events.length}</p>
        </div>
        <div className="surface-card border-l-4 border-l-blue-500 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Registrations</p>
            <FiUsers className="text-slate-500 dark:text-slate-300" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900 dark:text-white">{totalRegistrations}</p>
        </div>
        <div className="surface-card border-l-4 border-l-emerald-600 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Approved</p>
            <FiCheckCircle className="text-emerald-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900 dark:text-white">{approved}</p>
        </div>
        <div className="surface-card border-l-4 border-l-amber-500 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Pending</p>
            <FiClock className="text-amber-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900 dark:text-white">{pending}</p>
        </div>
        <div className="surface-card border-l-4 border-l-rose-600 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Rejected</p>
            <FiXCircle className="text-rose-500" />
          </div>
          <p className="mt-2 text-[28px] font-bold text-slate-900 dark:text-white">{rejected}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card p-5">
          <p className="section-title mb-4">Registration Analytics</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalStatus} barSize={28}>
                <defs>
                  <linearGradient id="adminPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Bar dataKey="count" fill="url(#adminPrimary)" radius={[10, 10, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-5">
          <p className="section-title mb-4">Event Participation</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventParticipation}>
                <defs>
                  <linearGradient id="adminSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }} />
                <Bar dataKey="count" fill="url(#adminSecondary)" radius={[10, 10, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: 'Event success rate', items: ['Completed events: 86%', 'Avg. feedback score: 4.5/5', 'Top category: Hackathons'] },
          { title: 'Monthly registrations', items: ['This month: 312', 'Week-over-week: +9%', 'Highest day: Tuesday'] },
          { title: 'Resource requests (food, travel, accommodation)', items: ['Food: 42', 'Travel: 18', 'Accommodation: 11'] },
          { title: 'Approval trends', items: ['Approval rate: 68%', 'Pending backlog: 14', 'Median review time: 2.1 days'] },
          { title: 'Mentor approvals', items: ['Approved mentors: 26', 'Pending: 5', 'Avg. response: 1.3 days'] }
        ].map((block) => (
          <details key={block.title} className="surface-card p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">{block.title}</summary>
            <ul className="mt-2 space-y-1 text-sm text-slate-500 dark:text-slate-400">
              {block.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
