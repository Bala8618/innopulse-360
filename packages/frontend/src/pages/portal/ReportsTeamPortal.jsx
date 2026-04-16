import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlatformApi } from '../../services/platformApi';
import PaginationControls from '../../components/common/PaginationControls';

const tabs = ['Dashboard', 'Submitted Reports', 'Review Reports', 'Event Ratings'];

export default function ReportsTeamPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]);
  const [events, setEvents] = useState([]);
  const [forms, setForms] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [ratingQuery, setRatingQuery] = useState('');
  const [ratingPage, setRatingPage] = useState(1);
  const ratingPageSize = 10;

  const load = async () => {
    const [ev, formsRes, fbRes] = await Promise.all([
      PlatformApi.listEvents(),
      PlatformApi.listFeedbackForms(),
      PlatformApi.listFeedback()
    ]);
    setEvents(ev.data.data || []);
    setForms(formsRes.data.data || []);
    setFeedback(fbRes.data.data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const hashTab = decodeURIComponent((location.hash || '').replace('#', ''));
    if (hashTab && tabs.includes(hashTab) && hashTab !== tab) setTab(hashTab);
  }, [location.hash, tab]);

  const onSetTab = (next) => {
    setTab(next);
    navigate(`/portal/reports-team#${encodeURIComponent(next)}`, { replace: true });
  };

  const filteredFeedback = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feedback.filter((r) => {
      const matchesQuery = !q || [r.event_id, r.participant_id, r.suggestion].some((v) => String(v || '').toLowerCase().includes(q));
      return matchesQuery;
    });
  }, [feedback, query]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => filteredFeedback.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredFeedback, currentPage]);
  const filteredRatings = useMemo(() => {
    const q = ratingQuery.trim().toLowerCase();
    return events.filter((e) => {
      const matchesQuery = !q || [e.event_name, e.domain, e.organizer].some((v) => String(v || '').toLowerCase().includes(q));
      return matchesQuery;
    });
  }, [events, ratingQuery]);
  const ratingTotalPages = Math.max(1, Math.ceil(filteredRatings.length / ratingPageSize));
  const currentRatingPage = Math.min(ratingPage, ratingTotalPages);
  const pageRatings = useMemo(() => filteredRatings.slice((currentRatingPage - 1) * ratingPageSize, currentRatingPage * ratingPageSize), [filteredRatings, currentRatingPage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold dark:text-white">Reports Team Portal</h1>
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
            { label: 'Total Events', value: events.length },
            { label: 'Submitted Reports', value: feedback.length },
            { label: 'Feedback Forms', value: forms.length },
            { label: 'Pending Reviews', value: feedback.length }
          ].map((c) => (
            <div key={c.label} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{c.label}</p>
              <p className="mt-2 text-2xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {(tab === 'Submitted Reports' || tab === 'Review Reports') && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 grid gap-2 md:grid-cols-[1fr_200px]">
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search reports..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
            <button className="rounded bg-blue-600 px-3 py-2 text-xs text-white" onClick={load}>Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">Event</th><th className="px-2 py-1 text-left">Participant</th><th className="px-2 py-1 text-left">Submitted</th></tr></thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-2 py-1">{r.event_id}</td>
                    <td className="px-2 py-1">{r.participant_id}</td>
                    <td className="px-2 py-1">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredFeedback.length}
              pageSize={pageSize}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {tab === 'Event Ratings' && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Event Ratings Overview</p>
          <div className="mb-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search events..."
              value={ratingQuery}
              onChange={(e) => { setRatingQuery(e.target.value); setRatingPage(1); }}
            />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {pageRatings.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>{e.event_name}</span>
                <span className="font-semibold">Rating: 4.{(e.id % 5) + 1}</span>
              </div>
            ))}
          </div>
          <PaginationControls
            page={currentRatingPage}
            totalPages={ratingTotalPages}
            totalItems={filteredRatings.length}
            pageSize={ratingPageSize}
            onPrev={() => setRatingPage((p) => Math.max(1, p - 1))}
            onNext={() => setRatingPage((p) => Math.min(ratingTotalPages, p + 1))}
          />
        </div>
      )}
    </div>
  );
}
