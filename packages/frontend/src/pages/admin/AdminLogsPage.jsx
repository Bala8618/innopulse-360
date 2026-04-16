import { useState } from 'react';

export default function AdminLogsPage() {
  const logs = [
    'System started',
    'User login: admin@test.com',
    'Event created: InnoPulse Event 3',
    'Participant registered: student12@example.com',
    'Feedback submitted: Event 1'
  ];
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  const filtered = logs.filter((log) => {
    const text = log.toLowerCase();
    const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());
    const matchesType = type === 'all'
      || (type === 'system' && text.includes('system'))
      || (type === 'user' && text.includes('user'))
      || (type === 'event' && text.includes('event'))
      || (type === 'feedback' && text.includes('feedback'));
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold dark:text-white">System Logs</h1>
      <div className="grid gap-2 md:grid-cols-[1fr_200px]">
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          placeholder="Search logs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="system">System</option>
          <option value="user">User</option>
          <option value="event">Event</option>
          <option value="feedback">Feedback</option>
        </select>
      </div>
      <div className="rounded-xl border p-3 text-sm dark:border-slate-700">
        {filtered.map((l, i) => (
          <div key={i} className="border-b py-2 text-slate-600 last:border-b-0 dark:border-slate-700 dark:text-slate-300">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
