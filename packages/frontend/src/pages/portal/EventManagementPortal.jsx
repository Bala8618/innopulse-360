import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlatformApi } from '../../services/platformApi';
import PaginationControls from '../../components/common/PaginationControls';
import 'reactflow/dist/style.css';

const tabs = [
  'Dashboard',
  'Event List',
  'Event Flow',
  'Registrations',
  'Resource Requests',
  'Approved Participants',
  'Winners',
  'Process Performance'
];

function buildFlow(event) {
  if (!event) return { nodes: [], edges: [] };
  const steps = [
    { label: 'Event Created', date: event.created_at },
    { label: 'Registration Open', date: event.registration_start_date },
    { label: 'Registration Closed', date: event.registration_deadline },
    { label: 'Screening', date: event.screening_date },
    { label: 'Event Conducted', date: event.start_date },
    { label: 'Judging', date: event.judging_date },
    { label: 'Results', date: event.result_date }
  ];
  const nodes = steps.map((s, i) => ({
    id: String(i + 1),
    data: { label: `${s.label}\n${s.date ? new Date(s.date).toLocaleDateString() : '-'}` },
    position: { x: i % 2 ? 500 : 80, y: i * 110 },
    style: {
      background: '#1e3a8a',
      color: '#fff',
      borderRadius: 14,
      padding: '12px 16px',
      width: 280,
      whiteSpace: 'pre-line',
      fontSize: 13,
      fontWeight: 600
    }
  }));
  const edges = nodes.slice(1).map((n, i) => ({
    id: `e${i}`,
    source: nodes[i].id,
    target: n.id,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
    style: { stroke: '#94a3b8', strokeWidth: 2 }
  }));
  return { nodes, edges };
}

export default function EventManagementPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]);
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [requests, setRequests] = useState([]);
  const [queries, setQueries] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [message, setMessage] = useState('');
  const [eventQuery, setEventQuery] = useState('');
  const [eventStatus, setEventStatus] = useState('all');
  const [eventPage, setEventPage] = useState(1);
  const [requestQuery, setRequestQuery] = useState('');
  const [requestStatus, setRequestStatus] = useState('pending');
  const [queryQuery, setQueryQuery] = useState('');
  const [queryStatus, setQueryStatus] = useState('open');
  const [requestPage, setRequestPage] = useState(1);
  const requestPageSize = 10;
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrationQuery, setRegistrationQuery] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('all');
  const [registrationPage, setRegistrationPage] = useState(1);
  const registrationPageSize = 10;
  const [approvedQuery, setApprovedQuery] = useState('');
  const [approvedPage, setApprovedPage] = useState(1);
  const approvedPageSize = 10;
  const [winnersQuery, setWinnersQuery] = useState('');
  const [winnersPage, setWinnersPage] = useState(1);
  const winnersPageSize = 10;

  const load = async () => {
    const [evRes, reqRes, qRes, pRes, rRes] = await Promise.all([
      PlatformApi.listEvents(),
      PlatformApi.listRequests({ status: requestStatus === 'all' ? '' : requestStatus }),
      PlatformApi.listQueries({ status: queryStatus === 'all' ? '' : queryStatus }),
      PlatformApi.adminRaw('participants'),
      PlatformApi.listRewards()
    ]);
    setEvents(evRes.data.data || []);
    setRequests(reqRes.data.data || []);
    setQueries(qRes.data.data || []);
    setParticipants(pRes.data.data || []);
    setRewards(rRes.data.data || []);
  };
  useEffect(() => { load(); }, [requestStatus, queryStatus]);

  useEffect(() => {
    const hashTab = decodeURIComponent((location.hash || '').replace('#', ''));
    if (hashTab && tabs.includes(hashTab) && hashTab !== tab) {
      setTab(hashTab);
    }
  }, [location.hash, tab]);

  const onSetTab = (next) => {
    setTab(next);
    navigate(`/portal/event-management#${encodeURIComponent(next)}`, { replace: true });
  };

  const decideRequest = async (id, status) => {
    await PlatformApi.updateRequest(id, { status, reimbursement_code: status === 'approved' ? `RMB-${id}` : null });
    setMessage(`Request ${status}`);
    setTimeout(() => setMessage(''), 2000);
    load();
  };

  const reply = async (id) => {
    await PlatformApi.replyQuery(id, { response: 'Your request is under review.', responder_role: 'event_management' });
    load();
  };

  const filteredRequests = useMemo(() => {
    const q = requestQuery.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) =>
      [r.type, r.event?.event_name, r.event_id, r.participant?.student_name, r.participant_id]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [requests, requestQuery]);

  const filteredEvents = useMemo(() => {
    const q = eventQuery.trim().toLowerCase();
    return events.filter((e) => {
      const statusValue = String(e.status || e.registration_status || '').toLowerCase();
      const matchesStatus = eventStatus === 'all' || statusValue === eventStatus;
      const matchesQuery = !q || [e.event_name, e.event_id, e.domain, e.organizer, e.venue]
        .some((v) => String(v || '').toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [events, eventQuery, eventStatus]);

  const filteredRegistrations = useMemo(() => {
    const q = registrationQuery.trim().toLowerCase();
    return participants.filter((p) => {
      const statusValue = String(p.status || '').toLowerCase();
      const matchesStatus = registrationStatus === 'all' || statusValue === registrationStatus;
      const matchesQuery = !q || [
        p.student_name,
        p.college_name,
        p.department,
        p.team_name,
        p.event_id
      ].some((v) => String(v || '').toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [participants, registrationQuery, registrationStatus]);

  const approved = participants.filter((p) => p.status === 'approved');
  const rejected = participants.filter((p) => p.status === 'rejected');
  const totalParticipants = participants.length;
  const derivedPending = totalParticipants - approved.length - rejected.length;
  const pending = participants.filter((p) => p.status === 'pending');
  const pendingCount = Math.max(0, derivedPending || pending.length);
  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));
  const flow = buildFlow(selectedEvent);

  const filteredApproved = useMemo(() => {
    const q = approvedQuery.trim().toLowerCase();
    return approved.filter((p) => {
      const matchesQuery = !q || [p.student_name, p.college_name, p.department, p.event_id]
        .some((v) => String(v || '').toLowerCase().includes(q));
      return matchesQuery;
    });
  }, [approved, approvedQuery]);

  const filteredWinners = useMemo(() => {
    const q = winnersQuery.trim().toLowerCase();
    return rewards.filter((r) => r.result_type === 'Winner').filter((r) => {
      const matchesQuery = !q || [r.event_name, r.event_id, r.participant_id, r.result_type]
        .some((v) => String(v || '').toLowerCase().includes(q));
      return matchesQuery;
    });
  }, [rewards, winnersQuery]);

  const filteredQueries = useMemo(() => {
    const q = queryQuery.trim().toLowerCase();
    if (!q) return queries;
    return queries.filter((r) =>
      [r.category, r.priority, r.description]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [queries, queryQuery]);

  const requestTotalPages = Math.max(1, Math.ceil(filteredRequests.length / requestPageSize));
  const currentRequestPage = Math.min(requestPage, requestTotalPages);
  const pageRequests = useMemo(
    () => filteredRequests.slice((currentRequestPage - 1) * requestPageSize, currentRequestPage * requestPageSize),
    [filteredRequests, currentRequestPage]
  );
  const eventTotalPages = Math.max(1, Math.ceil(filteredEvents.length / 10));
  const currentEventPage = Math.min(eventPage, eventTotalPages);
  const pageEvents = useMemo(
    () => filteredEvents.slice((currentEventPage - 1) * 10, currentEventPage * 10),
    [filteredEvents, currentEventPage]
  );
  const registrationTotalPages = Math.max(1, Math.ceil(filteredRegistrations.length / registrationPageSize));
  const currentRegistrationPage = Math.min(registrationPage, registrationTotalPages);
  const pageRegistrations = useMemo(
    () => filteredRegistrations.slice((currentRegistrationPage - 1) * registrationPageSize, currentRegistrationPage * registrationPageSize),
    [filteredRegistrations, currentRegistrationPage]
  );
  const approvedTotalPages = Math.max(1, Math.ceil(filteredApproved.length / approvedPageSize));
  const currentApprovedPage = Math.min(approvedPage, approvedTotalPages);
  const pageApproved = useMemo(
    () => filteredApproved.slice((currentApprovedPage - 1) * approvedPageSize, currentApprovedPage * approvedPageSize),
    [filteredApproved, currentApprovedPage]
  );
  const winnersTotalPages = Math.max(1, Math.ceil(filteredWinners.length / winnersPageSize));
  const currentWinnersPage = Math.min(winnersPage, winnersTotalPages);
  const pageWinners = useMemo(
    () => filteredWinners.slice((currentWinnersPage - 1) * winnersPageSize, currentWinnersPage * winnersPageSize),
    [filteredWinners, currentWinnersPage]
  );

  useEffect(() => {
    setRequestPage(1);
  }, [requests.length, requestQuery, requestStatus]);
  useEffect(() => {
    setEventPage(1);
  }, [events.length, eventQuery, eventStatus]);
  useEffect(() => {
    setRegistrationPage(1);
  }, [participants.length, registrationQuery, registrationStatus]);
  useEffect(() => {
    setApprovedPage(1);
  }, [approved.length, approvedQuery]);
  useEffect(() => {
    setWinnersPage(1);
  }, [rewards.length, winnersQuery]);


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold dark:text-white">Event Team Portal</h1>
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
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {[
              { label: 'Total Events', value: events.length },
              { label: 'Active Events', value: events.filter((e) => e.status === 'active' || e.status === 'upcoming').length },
              { label: 'Total Participants', value: totalParticipants },
              { label: 'Approved', value: approved.length },
              { label: 'Pending', value: pendingCount },
              { label: 'Rejected', value: rejected.length }
            ].map((c) => (
              <div key={c.label} className="rounded-xl border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">{c.label}</p>
                <p className="mt-2 text-2xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold">Event Participation</p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={events.map((e) => ({ name: e.event_name, registrations: participants.filter((p) => p.event_id === e.id).length }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="registrations" fill="#1e3a8a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold">Approval Ratio</p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ label: 'Approved', value: approved.length }, { label: 'Pending', value: pendingCount }, { label: 'Rejected', value: rejected.length }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1e3a8a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Event List' && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Event List</p>
            <button className="rounded bg-blue-600 px-3 py-2 text-xs text-white" onClick={() => navigate('/saas/event-creation')}>Create Event</button>
          </div>
          <div className="mb-3 grid gap-2 md:grid-cols-[1fr_200px]">
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search events..."
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">Event ID</th><th className="px-3 py-2 text-left">Event Name</th><th className="px-3 py-2 text-left">Domain</th><th className="px-3 py-2 text-left">Participants</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
              <tbody>
                {pageEvents.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2">{e.event_id || `EVT-${e.id}`}</td>
                    <td className="px-3 py-2">{e.event_name}</td>
                    <td className="px-3 py-2">{e.domain || '-'}</td>
                    <td className="px-3 py-2">{participants.filter((p) => p.event_id === e.id).length}</td>
                    <td className="px-3 py-2 capitalize">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              page={currentEventPage}
              totalPages={eventTotalPages}
              totalItems={filteredEvents.length}
              pageSize={10}
              onPrev={() => setEventPage((p) => Math.max(1, p - 1))}
              onNext={() => setEventPage((p) => Math.min(eventTotalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {tab === 'Event Flow' && (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="rounded-xl border bg-white p-3 shadow-sm">
            <p className="mb-2 text-sm font-semibold">Select Event</p>
            <select className="w-full rounded-lg border p-2" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
              <option value="">Choose event</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.event_name}</option>)}
            </select>
          </div>
          <div className="rounded-xl border bg-white p-3 shadow-sm">
            {selectedEvent ? (
              <div className="h-[520px]">
                <ReactFlow nodes={flow.nodes} edges={flow.edges} fitView>
                  <Background color="#e2e8f0" gap={16} size={1} />
                  <Controls />
                </ReactFlow>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select an event to view flow.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'Registrations' && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Registrations</p>
          <div className="mb-3 grid gap-2 md:grid-cols-[1fr_200px]">
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search registrations..."
              value={registrationQuery}
              onChange={(e) => setRegistrationQuery(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={registrationStatus}
              onChange={(e) => setRegistrationStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">College</th><th className="px-3 py-2 text-left">Department</th><th className="px-3 py-2 text-left">Event</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
              <tbody>
                {pageRegistrations.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.student_name}</td>
                    <td className="px-3 py-2">{p.college_name}</td>
                    <td className="px-3 py-2">{p.department}</td>
                    <td className="px-3 py-2">{events.find((e) => e.id === p.event_id)?.event_name || p.event_id}</td>
                    <td className="px-3 py-2 capitalize">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              page={currentRegistrationPage}
              totalPages={registrationTotalPages}
              totalItems={filteredRegistrations.length}
              pageSize={registrationPageSize}
              onPrev={() => setRegistrationPage((p) => Math.max(1, p - 1))}
              onNext={() => setRegistrationPage((p) => Math.min(registrationTotalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {tab === 'Resource Requests' && (
        <section className="rounded-xl border p-3">
          <h2 className="font-semibold">Resource Requests</h2>
          <div className="mt-2 grid gap-2 md:grid-cols-[1fr_200px]">
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search requests..."
              value={requestQuery}
              onChange={(e) => { setRequestQuery(e.target.value); setRequestPage(1); }}
            />
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={requestStatus}
              onChange={(e) => setRequestStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">Type</th><th className="px-2 py-1 text-left">Event</th><th className="px-2 py-1 text-left">Participant</th><th className="px-2 py-1 text-left">Actions</th></tr></thead>
              <tbody>{pageRequests.map((r) => <tr key={r.id} className="border-t"><td className="px-2 py-1 capitalize">{r.type}</td><td className="px-2 py-1">{r.event?.event_name || r.event_id}</td><td className="px-2 py-1">{r.participant?.student_name || r.participant_id}</td><td className="px-2 py-1"><button className="mr-2 rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => decideRequest(r.id, 'approved')}>Approve</button><button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => decideRequest(r.id, 'rejected')}>Reject</button></td></tr>)}</tbody>
            </table>
            <PaginationControls
              page={currentRequestPage}
              totalPages={requestTotalPages}
              totalItems={filteredRequests.length}
              pageSize={requestPageSize}
              onPrev={() => setRequestPage((p) => Math.max(1, p - 1))}
              onNext={() => setRequestPage((p) => Math.min(requestTotalPages, p + 1))}
            />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold">Participant Queries</h3>
            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_200px]">
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                placeholder="Search queries..."
                value={queryQuery}
                onChange={(e) => setQueryQuery(e.target.value)}
              />
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={queryStatus}
                onChange={(e) => setQueryStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="mt-2 space-y-2">
              {filteredQueries.map((q) => (
                <article key={q.id} className="rounded-lg border p-2">
                  <p className="font-medium">{q.category} • Priority {q.priority}</p>
                  <p className="text-sm text-slate-600">{q.description}</p>
                  <button className="mt-2 rounded bg-blue-600 px-2 py-1 text-xs text-white" onClick={() => reply(q.id)}>Send Response</button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'Approved Participants' && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Approved Participants</p>
          <div className="mb-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search approved participants..."
              value={approvedQuery}
              onChange={(e) => setApprovedQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">Participant</th><th className="px-2 py-1 text-left">College</th><th className="px-2 py-1 text-left">Event</th><th className="px-2 py-1 text-left">Approval Date</th></tr></thead>
              <tbody>
                {pageApproved.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-2 py-1">{p.student_name}</td>
                    <td className="px-2 py-1">{p.college_name}</td>
                    <td className="px-2 py-1">{events.find((e) => e.id === p.event_id)?.event_name || p.event_id}</td>
                    <td className="px-2 py-1">{new Date(p.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              page={currentApprovedPage}
              totalPages={approvedTotalPages}
              totalItems={filteredApproved.length}
              pageSize={approvedPageSize}
              onPrev={() => setApprovedPage((p) => Math.max(1, p - 1))}
              onNext={() => setApprovedPage((p) => Math.min(approvedTotalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {tab === 'Winners' && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Winners</p>
          <div className="mb-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Search winners..."
              value={winnersQuery}
              onChange={(e) => setWinnersQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">Event</th><th className="px-2 py-1 text-left">Participant</th><th className="px-2 py-1 text-left">Position</th><th className="px-2 py-1 text-left">Prize</th></tr></thead>
              <tbody>
                {pageWinners.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-2 py-1">{r.event_name || r.event_id}</td>
                    <td className="px-2 py-1">{r.participant_id}</td>
                    <td className="px-2 py-1">{r.result_type}</td>
                    <td className="px-2 py-1">{r.reward_points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              page={currentWinnersPage}
              totalPages={winnersTotalPages}
              totalItems={filteredWinners.length}
              pageSize={winnersPageSize}
              onPrev={() => setWinnersPage((p) => Math.max(1, p - 1))}
              onNext={() => setWinnersPage((p) => Math.min(winnersTotalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {tab === 'Process Performance' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold">Event Completion Overview</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ label: 'Approved', value: approved.length }, { label: 'Rejected', value: rejected.length }, { label: 'Pending', value: pendingCount }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e3a8a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold">Top Performing Events</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={events.map((e) => ({ name: e.event_name, value: participants.filter((p) => p.event_id === e.id && p.status === 'approved').length }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f172a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
