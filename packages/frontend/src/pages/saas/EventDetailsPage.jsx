import { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiClock, FiDollarSign, FiMapPin, FiTag, FiUsers } from 'react-icons/fi';
import { SaasApi } from '../../services/saasApi';

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function durationText(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  const ms = b - a;
  if (Number.isNaN(ms) || ms <= 0) return '-';
  const hours = Math.round(ms / (1000 * 60 * 60));
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem ? `${days}d ${rem}h` : `${days} days`;
}

export default function EventDetailsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    SaasApi.getEvents({ page: 1, limit: 100 })
      .then((res) => {
        const rows = res.data?.data || [];
        setEvents(rows);
        if (rows.length) setSelectedId(rows[0].id);
        setError('');
      })
      .catch((err) => setError(err?.response?.data?.message || 'Unable to load event details.'));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.event_name?.toLowerCase().includes(q) || e.domain?.toLowerCase().includes(q));
  }, [events, search]);

  const selected = useMemo(() => events.find((e) => e.id === selectedId), [events, selectedId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold dark:text-white">Event Details</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Search and open full event information.</p>
        {error && <p className="mt-3 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">{error}</p>}
        <input
          className="mt-3 w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Search event by name or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-3 max-h-[66vh] space-y-2 overflow-y-auto pr-1">
          {filtered.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedId(ev.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left transition ${selectedId === ev.id ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`}
            >
              <p className="font-semibold">{ev.event_name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ev.domain || 'General'} • {ev.event_type}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {!selected ? (
          <div className="flex min-h-[70vh] items-center justify-center text-slate-500 dark:text-slate-400">Select an event to view details.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-blue-100">Event Overview</p>
              <h2 className="mt-1 text-2xl font-bold">{selected.event_name}</h2>
              <p className="mt-2 text-sm text-blue-100">{selected.description || '-'}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"><FiMapPin /> Venue / Platform</p>
                <p className="mt-1 font-medium dark:text-slate-100">{selected.venue || '-'}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"><FiTag /> Event Type</p>
                <p className="mt-1 font-medium dark:text-slate-100">{selected.event_type} • {selected.event_mode || 'Team'}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"><FiClock /> Duration</p>
                <p className="mt-1 font-medium dark:text-slate-100">{durationText(selected.start_date, selected.end_date)}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"><FiUsers /> Max Participants</p>
                <p className="mt-1 font-medium dark:text-slate-100">{selected.max_participants || '-'}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"><FiDollarSign /> Registration Fee</p>
                <p className="mt-1 font-medium dark:text-slate-100">{selected.registration_fee || 'Free'}</p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"><FiCalendar /> Status</p>
                <p className="mt-1 font-medium capitalize dark:text-slate-100">{selected.status || '-'}</p>
              </article>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <article className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Key Dates</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  <li>Registration Start: {formatDate(selected.registration_start_date)}</li>
                  <li>Registration Deadline: {formatDate(selected.registration_deadline)}</li>
                  <li>Event Start: {formatDate(selected.start_date)}</li>
                  <li>Event End: {formatDate(selected.end_date)}</li>
                  <li>Screening: {formatDate(selected.screening_date)}</li>
                  <li>Judging: {formatDate(selected.judging_date)}</li>
                  <li>Result: {formatDate(selected.result_date)}</li>
                </ul>
              </article>
              <article className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Prize & Problem Statement</p>
                <p className="mt-2 text-sm font-medium dark:text-slate-100">Prize: {selected.prize_details || '-'}</p>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{selected.problem_statement || 'Problem statement is not specified for this event.'}</p>
              </article>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
