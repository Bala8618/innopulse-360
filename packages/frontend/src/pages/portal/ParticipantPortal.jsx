import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import 'reactflow/dist/style.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlatformApi } from '../../services/platformApi';

const tabs = [
  'Dashboard',
  'Available Events',
  'Event Flow',
  'Event Registration',
  'Registered Events',
  'OD Application',
  'Rewards Submission'
];
const FEEDBACK_QUESTIONS = [
  'Q1: How clear were the event announcement and eligibility criteria?',
  'Q2: How easy was the event registration process?',
  'Q3: How helpful was the event communication before the hackathon?',
  'Q4: How satisfied are you with the registration confirmation and updates?',
  'Q5: How relevant was the problem statement to real-world challenges?',
  'Q6: How clear were the rules, timeline, and submission requirements?',
  'Q7: How user-friendly was the event portal and navigation experience?',
  'Q8: How satisfied are you with the event schedule and time management?',
  'Q9: Rate the quality of accommodation support provided.',
  'Q10: Rate the hygiene and quality of food arrangements.',
  'Q11: Rate the punctuality and convenience of travel support.',
  'Q12: How fair was the reimbursement and support process?',
  'Q13: How responsive was the event management team to your requests?',
  'Q14: How effective was mentor guidance during the event?',
  'Q15: How timely was OD/permission approval communication?',
  'Q16: How useful were mentor interactions for improving your idea?',
  'Q17: How fair and transparent was the shortlisting process?',
  'Q18: How fair and professional was the jury evaluation process?',
  'Q19: How clear was the judging rubric and scoring criteria?',
  'Q20: How satisfied are you with the demo/presentation review process?',
  'Q21: How well did the event support teamwork and collaboration?',
  'Q22: How satisfied are you with the technical infrastructure (internet, venue, tools)?',
  'Q23: How well did the event improve your innovation and problem-solving skills?',
  'Q24: How confident are you about applying what you learned after this event?',
  'Q25: How satisfied are you with winner/reward declaration transparency?',
  'Q26: How smooth was the certificate/reward claim process?',
  'Q27: How likely are you to participate in future events by this organizer?',
  'Q28: How likely are you to recommend this event to your peers?',
  'Q29: Overall, how satisfied are you with the complete event experience?',
  'Q30: How strongly do you agree that this event delivered value for your time and effort?'
];

function flowNodes(flow, event) {
  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '-');
  const createdDate = event?.created_at || event?.start_date;
  const regOpenDate = event?.created_at || event?.start_date;
  const regCloseDate = event?.registration_deadline || event?.start_date;
  const startDate = event?.start_date;
  const endDate = event?.end_date;
  const judgingDate = endDate ? new Date(new Date(endDate).getTime() + 24 * 3600 * 1000).toISOString() : null;
  const winnerDate = endDate ? new Date(new Date(endDate).getTime() + 2 * 24 * 3600 * 1000).toISOString() : null;

  const dateByStep = {
    'Event Created': fmt(createdDate),
    'Registration Open': fmt(regOpenDate),
    'Registration Closed': fmt(regCloseDate),
    'Participant Approval': fmt(regCloseDate),
    'Hackathon Start': fmt(startDate),
    Submission: fmt(endDate),
    Judging: fmt(judgingDate),
    'Winner Announcement': fmt(winnerDate)
  };

  const palette = [
    'linear-gradient(135deg,#2563eb,#1d4ed8)',
    'linear-gradient(135deg,#0ea5e9,#0369a1)',
    'linear-gradient(135deg,#7c3aed,#5b21b6)',
    'linear-gradient(135deg,#16a34a,#166534)',
    'linear-gradient(135deg,#ea580c,#c2410c)',
    'linear-gradient(135deg,#db2777,#be185d)'
  ];

  const nodes = (flow || []).map((f, i) => ({
    id: String(i + 1),
    data: { label: `${f.label}\n${f.date ? fmt(f.date) : (dateByStep[f.label] || '-')}` },
    position: { x: i % 2 ? 560 : 60, y: i * 120 },
    style: {
      background: palette[i % palette.length],
      color: '#fff',
      borderRadius: 18,
      padding: '14px 18px',
      width: 320,
      minHeight: 74,
      fontSize: 14,
      fontWeight: 700,
      whiteSpace: 'pre-line',
      lineHeight: 1.35,
      border: '1px solid rgba(255,255,255,0.28)',
      boxShadow: '0 16px 36px rgba(2,6,23,0.24)'
    }
  }));

  const edges = nodes.slice(1).map((n, i) => ({
    id: `e${i}`,
    source: nodes[i].id,
    target: n.id,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
    style: { stroke: '#94a3b8', strokeWidth: 2.2 }
  }));
  return { nodes, edges };
}

export default function ParticipantPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('innopulse_user') || '{}');
  const [tab, setTab] = useState(tabs[0]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [details, setDetails] = useState(null);
  const [myRegs, setMyRegs] = useState([]);
  const [myRegSearch, setMyRegSearch] = useState('');
  const [myRegStatus, setMyRegStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [feedbackAnswers, setFeedbackAnswers] = useState({});
  const [myFeedback, setMyFeedback] = useState([]);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState(null);
  const [feedbackEventRegId, setFeedbackEventRegId] = useState('');
  const [eventsLoading, setEventsLoading] = useState(false);
  const [requestOptions, setRequestOptions] = useState({
    accommodation: false,
    food: false,
    travel: false
  });

  const loadPortalData = async () => {
    setEventsLoading(true);
    try {
      const [eventsRes, myRegsRes, qRes, myFbRes, analyticsRes] = await Promise.all([
        PlatformApi.listEvents(),
        PlatformApi.myRegistrations(user.email),
        PlatformApi.listFeedbackForms(),
        PlatformApi.myFeedback(user.email),
        PlatformApi.feedbackAnalytics()
      ]);
      setEvents(eventsRes?.data?.data || []);
      setMyRegs(myRegsRes?.data?.data || []);
      setQuestions(qRes?.data?.data || []);
      setMyFeedback(myFbRes?.data?.data || []);
      setFeedbackAnalytics(analyticsRes?.data || null);
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to load events. Check backend API and refresh.');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [user.email]);

  useEffect(() => {
    const hashTab = decodeURIComponent((location.hash || '').replace('#', ''));
    if (hashTab && tabs.includes(hashTab) && hashTab !== tab) {
      setTab(hashTab);
    }
  }, [location.hash, tab]);

  const onSetTab = (next) => {
    setTab(next);
    navigate(`/portal/participant#${encodeURIComponent(next)}`, { replace: true });
  };

  useEffect(() => {
    if (!selectedEventId) return;
    PlatformApi.getEventDetails(selectedEventId).then((r) => setDetails(r.data));
    PlatformApi.getLogistics(selectedEventId).then((r) => setLogistics(r.data));
  }, [selectedEventId]);

  const domains = useMemo(() => {
    const set = new Set(events.map((e) => String(e.domain || '').trim()).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const visibleEvents = events.filter((e) => String(e.registration_status || '').toLowerCase() !== 'closed');
    const q = search.toLowerCase().trim();
    const statusMatch = (e) => {
      if (statusFilter === 'all') return true;
      const s = String(e.status || e.registration_status || '').toLowerCase();
      return s === statusFilter;
    };
    const domainMatch = (e) => {
      if (domainFilter === 'all') return true;
      return String(e.domain || '').toLowerCase() === domainFilter.toLowerCase();
    };
    const base = visibleEvents.filter(statusMatch).filter(domainMatch);
    if (!q) return base;
    return base.filter((e) => e.event_name.toLowerCase().includes(q) || String(e.event_id || '').toLowerCase().includes(q));
  }, [events, search, statusFilter, domainFilter]);

  const filteredMyRegs = useMemo(() => {
    const q = myRegSearch.trim().toLowerCase();
    return myRegs.filter((r) => {
      const statusVal = String(r.status || '').toLowerCase();
      const matchesStatus = myRegStatus === 'all' || statusVal === myRegStatus;
      const matchesQuery = !q || [
        r.registration_id,
        r.participant_id,
        r.team_name,
        r.event?.event_name
      ].some((v) => String(v || '').toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [myRegs, myRegSearch, myRegStatus]);

  const selectedReg = myRegs[0];
  const selectedEvent = useMemo(() => events.find((e) => String(e.id) === String(selectedEventId)), [events, selectedEventId]);
  const completedRegistrations = useMemo(() => myRegs.filter((r) => {
    const e = r.event;
    if (!e) return false;
    return e.status === 'completed' || (e.end_date && new Date(e.end_date) < new Date());
  }), [myRegs]);
  const selectedFeedbackReg = useMemo(() => completedRegistrations.find((r) => String(r.id) === String(feedbackEventRegId)), [completedRegistrations, feedbackEventRegId]);
  const alreadySubmitted = useMemo(() => {
    if (!selectedFeedbackReg) return false;
    return myFeedback.some((f) => Number(f.event_id) === Number(selectedFeedbackReg.event_id) && Number(f.participant_id) === Number(selectedFeedbackReg.id));
  }, [myFeedback, selectedFeedbackReg]);
  const renderedQuestions = useMemo(() => {
    const forms = Array.isArray(questions) ? questions : [];
    if (selectedFeedbackReg) {
      const form = forms.find((f) => Number(f.event_id) === Number(selectedFeedbackReg.event_id));
      if (form?.questions?.length) return form.questions;
    }
    return FEEDBACK_QUESTIONS;
  }, [questions, selectedFeedbackReg]);

  const submit = async (fn, successMessage = 'Submitted successfully') => {
    try {
      await fn();
      setMessage(successMessage);
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Action failed');
    }
  };

  const graph = flowNodes(details?.flow || [], details?.event);
  const onRegisterClick = (eventId) => {
    setSelectedEventId(String(eventId));
    onSetTab('Event Registration');
  };
  const onViewDetails = (eventId) => {
    setSelectedEventId(String(eventId));
    onSetTab('Event Flow');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">Participant Dashboard</h1>
      {message && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      <div className="space-y-3">
          {tab === 'Dashboard' && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Total Events', value: events.length },
                  { label: 'My Registrations', value: myRegs.length },
                  { label: 'Approved', value: myRegs.filter((r) => r.status === 'approved').length },
                  { label: 'Pending', value: myRegs.filter((r) => r.status === 'pending').length }
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold dark:text-white">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Track your event registrations, OD requests, rewards, and report submissions from the left navigation.
              </div>
            </div>
          )}

          {tab === 'Available Events' && (
            <div className="space-y-3">
              <div className="grid gap-2 md:grid-cols-[1fr_180px_180px]">
                <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
                <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                  {domains.map((d) => <option key={d} value={d}>{d === 'all' ? 'All Domains' : d}</option>)}
                </select>
              </div>
              {eventsLoading && <p className="text-sm text-slate-500">Loading events...</p>}
              {!eventsLoading && filteredEvents.length === 0 && (
                <div className="rounded-xl border border-dashed p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  No active events found.
                  <button className="ml-2 rounded bg-blue-600 px-2 py-1 text-xs text-white" onClick={loadPortalData}>Reload events</button>
                </div>
              )}
              {!eventsLoading && filteredEvents.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEvents.map((e) => (
                    <article key={e.id} className="rounded-xl border p-3 dark:border-slate-700">
                      <p className="font-semibold dark:text-white">{e.event_name}</p>
                      <p className="text-xs text-slate-500">Event ID: {e.event_id || `EVT-${e.id}`}</p>
                      <p className="text-xs text-slate-500">Domain: {e.domain || '-'}</p>
                      <p className="text-xs text-slate-500">Registration Deadline: {e.registration_deadline ? new Date(e.registration_deadline).toLocaleDateString() : '-'}</p>
                      <p className="text-xs text-slate-500">Seats Remaining: {Number(e.max_participants || 0) - Number(e.registrations_count || 0)}</p>
                      <div className="mt-2 flex gap-2">
                        <button className="rounded bg-slate-900 px-2 py-1 text-xs text-white" onClick={() => onViewDetails(e.id)}>View</button>
                        <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white" onClick={() => onRegisterClick(e.id)}>Register</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

      {tab === 'Event Flow' && (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Select Event</p>
            <input className="mb-2 w-full rounded-lg border p-2 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
              <option value="">Choose event</option>{filteredEvents.map((e) => <option key={e.id} value={e.id}>{e.event_name}</option>)}
            </select>
            {filteredEvents.length === 0 && <p className="mt-2 text-xs text-amber-600">No events loaded. Go to Available Events and click Reload events.</p>}
            <p className="mt-2 text-xs text-slate-500">Pick any active event to view complete workflow.</p>
          </div>
          {details && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50 via-white to-indigo-50 p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
              <div className="rounded-xl border border-white/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/80">
                <p className="text-2xl font-bold tracking-tight dark:text-white">{details.event.event_name}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">{details.event.description}</p>
                <p className="mt-2 text-xs text-slate-500">Rules: {details.event.rules}</p>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2 dark:text-slate-300">
                  <p>Venue: {details.event.venue || '-'}</p>
                  <p>Organizer: {details.event.organizer || '-'}</p>
                  <p>Prize: {details.event.prize_details || '-'}</p>
                  <p>Fee: {details.event.registration_fee || 'Free'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold dark:text-white">Timeline</p>
                <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
                  <p>Registration Start: {details.event.registration_start_date ? new Date(details.event.registration_start_date).toLocaleString() : '-'}</p>
                  <p>Registration End: {details.event.registration_deadline ? new Date(details.event.registration_deadline).toLocaleString() : '-'}</p>
                  <p>Screening: {details.event.screening_date ? new Date(details.event.screening_date).toLocaleString() : '-'}</p>
                  <p>Event Start: {details.event.start_date ? new Date(details.event.start_date).toLocaleString() : '-'}</p>
                  <p>Event End: {details.event.end_date ? new Date(details.event.end_date).toLocaleString() : '-'}</p>
                  <p>Judging: {details.event.judging_date ? new Date(details.event.judging_date).toLocaleString() : '-'}</p>
                  <p>Result Announcement: {details.event.result_date ? new Date(details.event.result_date).toLocaleString() : '-'}</p>
                </div>
                <button className="mt-3 rounded bg-blue-600 px-3 py-2 text-xs text-white" onClick={() => onRegisterClick(details.event.id)}>Register for this Event</button>
              </div>
              <div className="h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <ReactFlow nodes={graph.nodes} edges={graph.edges} fitView fitViewOptions={{ padding: 0.12 }}>
                  <Background color="#cbd5e1" gap={18} size={1.2} />
                  <Controls showInteractive />
                </ReactFlow>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'Event Registration' && (
        <div className="space-y-3">
          {!selectedEventId && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              Select an event from `Available Events` and click Register to open the form.
            </div>
          )}
          {selectedEvent && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
              <p className="font-semibold dark:text-white">Selected Event (Created by Admin)</p>
              <p className="text-slate-600 dark:text-slate-300">{selectedEvent.event_name}</p>
              <p className="text-xs text-slate-500">Event ID: {selectedEvent.id} | Date: {new Date(selectedEvent.start_date).toLocaleDateString()} | Organizer: {selectedEvent.organizer}</p>
            </div>
          )}
          <form
            key={selectedEventId || 'no-event'}
            className="grid gap-2 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload = Object.fromEntries(new FormData(e.currentTarget));
                const res = await PlatformApi.registerEvent(payload);
                const created = res?.data?.data || {};
                const requestTypes = Object.entries(requestOptions)
                  .filter(([, enabled]) => enabled)
                  .map(([type]) => type);
                if (requestTypes.length) {
                  await Promise.all(
                    requestTypes.map((type) =>
                      PlatformApi.createRequest({
                        event_id: payload.event_id,
                        participant_id: created.id,
                        type
                      })
                    )
                  );
                }
                await PlatformApi.myRegistrations(payload.email).then((r) => setMyRegs(r.data.data || []));
                setMessage(`Registration successful. ID: ${created.registration_id || '-'} | Participant ID: ${created.participant_id || '-'}`);
                setTimeout(() => setMessage(''), 3500);
                e.currentTarget.reset();
                setRequestOptions({ accommodation: false, food: false, travel: false });
                setSelectedEventId('');
                onSetTab('Registered Events');
              } catch (err) {
                setMessage(err?.response?.data?.message || 'Registration failed');
              }
            }}
          >
            <input name="student_name" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Student Name" required />
            <input name="college_name" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="College Name" required />
            <select name="department" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" required defaultValue="">
              <option value="" disabled>Select Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="IT">IT</option>
              <option value="CIVIL">CIVIL</option>
            </select>
            <select name="year" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" required defaultValue="">
              <option value="" disabled>Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <input name="email" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Email" required />
            <input name="phone" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Phone" required />
            <input name="team_name" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Team Name" required />
            <input name="team_members" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Team Members" required />
            <input name="project_title" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Project Title" />
            <input name="abstract_url" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Abstract Upload URL" />
            <input name="id_proof_url" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="ID Proof Upload URL" />
            <input name="event_id" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} placeholder="Event ID" required />
            <button className="rounded bg-blue-600 px-3 py-2 text-white md:col-span-2">Submit Registration</button>
          </form>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 font-semibold dark:text-white">Optional Requests (Food / Travel / Accommodation)</p>
            <div className="grid gap-2 md:grid-cols-3">
              {['accommodation', 'food', 'travel'].map((type) => (
                <label key={type} className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-xs dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={requestOptions[type]}
                    onChange={(e) => setRequestOptions((prev) => ({ ...prev, [type]: e.target.checked }))}
                  />
                  <span>Request {type}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Requests will be submitted along with your registration.</p>
          </div>
        </div>
      )}

      {tab === 'Registered Events' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
            <p className="font-semibold dark:text-white">Registered Events</p>
            <p className="text-slate-600 dark:text-slate-300">Logged in as: {user.email || 'participant'}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-[1fr_200px]">
            <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Search registrations..." value={myRegSearch} onChange={(e) => setMyRegSearch(e.target.value)} />
            <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={myRegStatus} onChange={(e) => setMyRegStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {filteredMyRegs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No registrations found yet.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredMyRegs.map((r) => (
                <article key={r.id} className="rounded-xl border border-slate-200 p-3 shadow-sm dark:border-slate-700">
                  <p className="text-lg font-semibold dark:text-white">{r.event?.event_name || `Event ${r.event_id}`}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Registration ID: {r.registration_id}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Participant ID: {r.participant_id}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Team: {r.team_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Status: <span className="font-semibold capitalize">{r.status}</span></p>
                  <p className="mt-1 text-xs text-slate-500">
                    Registered on: {new Date(r.created_at).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}


      {tab === 'OD Application' && (
        <form className="grid gap-2 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(() => PlatformApi.createOdRequest(Object.fromEntries(new FormData(e.currentTarget)))); }}>
          <input name="event_id" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Event ID" required />
          <input name="participant_id" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Participant ID" required />
          <input name="event_code" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Event Code" required />
          <input name="mentor_name" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Mentor Name" required />
          <input name="mentor_email" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Mentor Email" required />
          <input name="parent_email" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Parent Email" required />
          <button className="rounded bg-blue-600 px-3 py-2 text-white md:col-span-2">Submit OD Request</button>
        </form>
      )}

      {tab === 'Rewards Submission' && (
        <form className="grid gap-2 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(() => PlatformApi.createReward(Object.fromEntries(new FormData(e.currentTarget)))); }}>
          <input name="event_id" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Event ID" required />
          <input name="participant_id" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Participant ID" required />
          <input name="event_name" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Event Name" required />
          <select name="result_type" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800"><option>Participated</option><option>Winner</option><option>Runner-up</option></select>
          <input name="certificate_url" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Certificate URL" />
          <input name="proof_url" className="rounded border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Screenshot Proof URL" />
          <button className="rounded bg-blue-600 px-3 py-2 text-white md:col-span-2">Submit Reward Request</button>
        </form>
      )}

      </div>
    </div>
  );
}
