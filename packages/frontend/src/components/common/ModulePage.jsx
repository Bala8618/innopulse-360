import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { DashboardService } from '../../services/dashboardService';
import AdminEventManagement from '../../layouts/AdminEventManagement';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function KpiCard({ label, value, tone = 'blue' }) {
  const toneMap = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/60 text-blue-800 border-blue-200 dark:from-blue-950/40 dark:to-blue-900/10 dark:text-blue-200 dark:border-blue-900',
    green: 'bg-gradient-to-br from-green-50 to-green-100/60 text-green-800 border-green-200 dark:from-green-950/40 dark:to-green-900/10 dark:text-green-200 dark:border-green-900',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-800 border-amber-200 dark:from-amber-950/40 dark:to-amber-900/10 dark:text-amber-200 dark:border-amber-900',
    rose: 'bg-gradient-to-br from-rose-50 to-rose-100/60 text-rose-800 border-rose-200 dark:from-rose-950/40 dark:to-rose-900/10 dark:text-rose-200 dark:border-rose-900'
  };

  return (
    <article className={`rounded-xl border p-4 shadow-sm ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}

function DataTable({ columns, rows, emptyMessage, rowActions }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => columns.some((col) => {
      const raw = col.render ? col.render(row) : row[col.key];
      return String(raw ?? '').toLowerCase().includes(q);
    }));
  }, [rows, columns, query]);

  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function downloadCsv() {
    const header = columns.map((c) => `"${String(c.label).replace(/"/g, '""')}"`).join(',');
    const body = filteredRows.map((row) =>
      columns.map((col) => {
        const raw = col.render ? col.render(row) : row[col.key];
        return `"${String(raw ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'module-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!columns?.length) {
    return <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{emptyMessage}</div>;
  }

  if (!rows.length) {
    return <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-brand-400 dark:focus:ring-brand-900/30"
          placeholder="Search in table..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <button
          type="button"
          onClick={downloadCsv}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              {columns.map((col) => <th key={col.key} className="px-3 py-2">{col.label}</th>)}
              {rowActions?.length ? <th className="px-3 py-2">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => (
              <tr key={row._id || idx} className="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/30">
                {columns.map((col) => <td key={col.key} className="px-3 py-2 text-slate-700 dark:text-slate-200">{col.render ? col.render(row) : (row[col.key] ?? '-')}</td>)}
                {rowActions?.length ? (
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {rowActions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => action.onClick(row)}
                          className={`rounded px-2 py-1 text-xs font-semibold transition ${action.variant === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-700' : action.variant === 'success' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-300">
        <span>{filteredRows.length} records</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-slate-300 px-2 py-1 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Prev
          </button>
          <span>Page {currentPage} / {totalPages}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border border-slate-300 px-2 py-1 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatDateOnly(value) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString();
}

function ConfirmModal({ open, title, description, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-display text-xl font-bold dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-200">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
}

const moduleBlueprint = {
  '/dashboard/user/profile': ['Update contact and institution profile', 'Attach resume/portfolio URL', 'Manage visibility preferences'],
  '/dashboard/user/event-flow': ['Search registered events', 'View round-by-round timeline', 'Track shortlist and winner stages'],
  '/dashboard/user/team': ['View team members and domain alignment', 'Track team status and mentor mapping', 'Coordinate deliverables and deadlines'],
  '/dashboard/user/registration-status': ['Track application review stage', 'View approval timeline', 'Check next required actions'],
  '/dashboard/user/shortlist-status': ['Observe shortlist outcome', 'Read remarks from admin panel', 'View progression to finals'],
  '/dashboard/user/collaboration': ['Shared notes with team and mentor', 'Action items and blockers', 'Sprint-level progress updates'],
  '/dashboard/user/accommodation': ['Allocation status and room details', 'Check-in/check-out visibility', 'Support escalation link'],
  '/dashboard/user/food': ['Meal preference and diet controls', 'Allergy information', 'Approval status tracking'],
  '/dashboard/user/mentoring': ['Upcoming mentor sessions', 'Session notes and outcomes', 'Pending mentor feedback'],
  '/dashboard/user/activity-points': ['Apply for approved activity points', 'Upload supporting proof', 'Track admin decision'],
  '/dashboard/user/winners': ['View winning results', 'Submit reward claim with proof', 'Track claim decision'],
  '/dashboard/user/prototype-upload': ['Upload links for demo/prototype', 'Version and timestamp history', 'Submission quality checklist'],
  '/dashboard/user/jury-feedback': ['Jury remarks by criterion', 'Improvement recommendations', 'Score progression snapshot'],
  '/dashboard/user/certificates': ['Certificate generation status', 'Download signed certificate', 'Verification code tracking'],
  '/dashboard/user/support': ['Open support ticket', 'SLA response tracking', 'Resolved issue history'],
  '/dashboard/mentor/assigned-teams': ['Team-domain assignment matrix', 'Priority indicators', 'Session scheduling shortcuts'],
  '/dashboard/mentor/session-logs': ['Daily session journal', 'Action recommendations', 'Session completion status'],
  '/dashboard/mentor/feedback': ['Structured feedback capture', 'Risk and blocker tagging', 'Escalation to admin'],
  '/dashboard/mentor/team-progress': ['Milestone completion tracking', 'Prototype readiness index', 'Team-level trend insights'],
  '/dashboard/mentor/approvals': ['Review mentor/OD requests', 'Approve or reject with remarks', 'Maintain transparent workflow'],
  '/dashboard/jury/evaluations': ['Evaluation queue with status', 'Criteria-wise score capture', 'Auto total-score calculation'],
  '/dashboard/jury/viva-records': ['Viva Q&A records', 'Answer scoring', 'Review notes history'],
  '/dashboard/admin/event-overview': ['Cross-functional event control panel', 'Lifecycle status timeline', 'Operational bottleneck indicators'],
  '/dashboard/admin/event-flow': ['Search event by code/title', 'View timeline of registration, rounds and closure', 'Expose process flow for all teams'],
  '/dashboard/admin/shortlisted-teams': ['Shortlist management board', 'Waitlist and reject controls', 'Decision audit trail'],
  '/dashboard/admin/team-formation': ['Team creation and assignment', 'Domain balancing', 'Mentor allocation support'],
  '/dashboard/admin/travel-management': ['Travel approval pipeline', 'Cost visibility by request', 'Decision turnaround monitoring'],
  '/dashboard/admin/accommodation-management': ['Room allocation board', 'Occupancy and utilization tracking', 'Allocation exceptions'],
  '/dashboard/admin/food-management': ['Food planning and approvals', 'Dietary accommodation list', 'Daily consumption coverage'],
  '/dashboard/admin/mentor-management': ['Mentor onboarding and assignment', 'Engagement metrics', 'Performance insights'],
  '/dashboard/admin/jury-management': ['Jury panel composition', 'Evaluation load balancing', 'Completion monitoring'],
  '/dashboard/admin/submissions': ['Submission pipeline', 'Completeness checks', 'Compliance gate status'],
  '/dashboard/admin/domain-analytics': ['Domain-wise average performance', 'Team count and variance', 'Trend comparison'],
  '/dashboard/admin/leaderboard': ['Live rank list', 'Score breakdown controls', 'Tie-breaker governance'],
  '/dashboard/admin/winning-projects': ['Winner declaration workflow', 'Prize mapping', 'Announcement readiness'],
  '/dashboard/admin/reports': ['Downloadable performance reports', 'Operational KPI snapshots', 'Executive summary pack'],
  '/dashboard/admin/users': ['User directory management', 'Role updates and status', 'Activity visibility'],
  '/dashboard/admin/settings': ['Platform config controls', 'Security and policy settings', 'Notification preferences'],
  '/dashboard/admin/faq': ['Knowledge base entries', 'Moderator updates', 'Search and tagging controls'],
  '/dashboard/admin/notifications': ['Broadcast and targeted notifications', 'Delivery status', 'Read-receipt tracking']
  ,
  '/dashboard/admin/mentor-approvals': ['Monitor mentor request decisions', 'Audit pending and resolved approvals', 'Escalate unresolved requests'],
  '/dashboard/admin/activity-points': ['Review activity point requests', 'Approve/reject with remarks', 'Track institutional credits'],
  '/dashboard/management/travel': ['Approve/reject travel requests', 'Set free or cost-based service', 'Add management remarks'],
  '/dashboard/management/accommodation': ['Approve/reject room allocations', 'Configure room cost or free stay', 'Track occupancy decisions'],
  '/dashboard/management/food': ['Approve/reject meal requests', 'Configure paid/free meal service', 'Maintain food service notes'],
  '/dashboard/report-team/templates': ['Create event feedback questionnaires', 'Configure question types and options', 'Activate templates for participants'],
  '/dashboard/report-team/responses': ['Analyze participant responses', 'Track satisfaction ratings', 'Capture improvement suggestions'],
  '/dashboard/rewards-team/reward-claims': ['Review winner proof submissions', 'Approve or reject reward claims', 'Finalize rewards operations'],
  '/dashboard/rewards-team/activity-points': ['Review activity-point requests', 'Approve or reject with remark', 'Close points allocation cycle']
  ,
  '/dashboard/admin/reward-claims': ['Review reward claims submitted by winners', 'Approve or reject claims', 'Track payout readiness']
};

export default function ModulePage({ route }) {
  const location = useLocation();
  const rawPath = route?.path || location.pathname;
  const role = route?.role;
  const effectiveRole = role;
  const currentPath = rawPath;
  const title = route?.label || 'Dashboard Module';

  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submissionForm, setSubmissionForm] = useState({ title: '', description: '', prototypeUrl: '', event: '' });
  const [travelForm, setTravelForm] = useState({ event: '', sourceCity: '', destinationCity: '', mode: 'train', amount: '' });
  const [accommodationForm, setAccommodationForm] = useState({ event: '', hotelName: '', checkIn: '', checkOut: '', roomType: 'double' });
  const [foodForm, setFoodForm] = useState({ event: '', preference: 'veg', allergies: '', mealSlots: 'lunch,dinner' });
  const [mentorApprovalForm, setMentorApprovalForm] = useState({
    event: '',
    mentorId: '',
    mentorEmail: '',
    requestType: 'mentor-approval',
    reason: '',
    proofUrl: ''
  });
  const [activityPointsForm, setActivityPointsForm] = useState({ event: '', pointsRequested: '', summary: '', proofUrl: '' });
  const [rewardClaimForm, setRewardClaimForm] = useState({ winnerId: '', proofUrl: '', remarks: '' });
  const [reportTemplateForm, setReportTemplateForm] = useState({
    event: '',
    title: '',
    description: '',
    question1: 'Rate event organization',
    question2: 'Rate jury support',
    question3: 'Rate mentor support'
  });
  const [reportResponseForm, setReportResponseForm] = useState({ templateId: '', rating: 5, suggestion: '' });
  const [registrationForm, setRegistrationForm] = useState({
    event: '',
    ideaTitle: '',
    ideaSummary: '',
    domain: '',
    teamPreferenceName: '',
    teamMembersInput: ''
  });
  const [reportForm, setReportForm] = useState({ event: '', eventRating: 5, participantFeedback: '', wouldRecommend: true });

  const [selectedEventFlowId, setSelectedEventFlowId] = useState('');
  const [eventOptions, setEventOptions] = useState([]);
  const [mentorOptions, setMentorOptions] = useState([]);
  const [adminEventOptions, setAdminEventOptions] = useState([]);
  const [adminTeamOptions, setAdminTeamOptions] = useState([]);
  const [openEventOptions, setOpenEventOptions] = useState([]);
  const [eventRankings, setEventRankings] = useState([]);
  const [participantWinners, setParticipantWinners] = useState([]);
  const [participantRewardClaims, setParticipantRewardClaims] = useState([]);
  const [rewardClaims, setRewardClaims] = useState([]);
  const [winnerForm, setWinnerForm] = useState({ event: '', team: '', rank: '', prize: '' });
  const [editingWinnerId, setEditingWinnerId] = useState('');
  const [modal, setModal] = useState({ open: false, title: '', description: '', onConfirm: null });
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (!notice.text) return undefined;
    const timer = setTimeout(() => setNotice({ type: '', text: '' }), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (currentPath !== '/dashboard/admin/event-flow') return;
    if (!rows.length) return;
    if (rows.some((row) => row._id === selectedEventFlowId)) return;
    setSelectedEventFlowId(rows[0]._id);
  }, [currentPath, rows, selectedEventFlowId]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError('');
      setFormMessage('');

      try {
        if (effectiveRole === 'participant') {
          const { data } = await DashboardService.participantOverview();
          if (mounted) setOverview(data.data);
          const eventsResult = await DashboardService.participantEvents();
          if (mounted) setEventOptions(eventsResult.data.data || []);

          if (currentPath.includes('/registration-status')) {
            const [openEventsResult, registrationResult, mentorsResult] = await Promise.all([
              DashboardService.participantOpenEvents(),
              DashboardService.participantRegistrations(),
              DashboardService.participantMentors()
            ]);
            if (mounted) {
              setOpenEventOptions(openEventsResult.data.data || []);
              setRows(registrationResult.data.data || []);
              setMentorOptions(mentorsResult.data.data || []);
            }
          } else if (currentPath.includes('/idea-submission') || currentPath.endsWith('/dashboard/user')) {
            const result = await DashboardService.participantSubmissions();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/travel')) {
            const result = await DashboardService.participantTravel();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/accommodation')) {
            const result = await DashboardService.participantAccommodation();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/food')) {
            const result = await DashboardService.participantFood();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/event-flow')) {
            const result = await DashboardService.participantRegistrations();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/mentoring')) {
            const [result, mentorsResult] = await Promise.all([
              DashboardService.participantMentorApprovals(),
              DashboardService.participantMentors()
            ]);
            if (mounted) {
              setRows(result.data.data || []);
              setMentorOptions(mentorsResult.data.data || []);
            }
          } else if (currentPath.includes('/activity-points')) {
            const result = await DashboardService.participantActivityPoints();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/winners') || currentPath.includes('/certificates')) {
            const [winnerResult, claimResult] = await Promise.all([
              DashboardService.participantWinners(),
              DashboardService.participantRewardClaims()
            ]);
            if (mounted) {
              setParticipantWinners(winnerResult.data.data || []);
              setParticipantRewardClaims(claimResult.data.data || []);
              setRows(claimResult.data.data || []);
            }
          } else if (currentPath.includes('/performance')) {
            const result = await DashboardService.participantReports();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/support')) {
            const [templatesResult, responsesResult] = await Promise.all([
              DashboardService.participantReportTemplates(),
              DashboardService.participantReports()
            ]);
            if (mounted) {
              setRows(templatesResult.data.data || []);
              setParticipantRewardClaims(responsesResult.data.data || []);
            }
          } else if (currentPath.includes('/notifications')) {
            const result = await DashboardService.participantNotifications();
            if (mounted) setRows(result.data.data || []);
          } else {
            if (mounted) setRows([]);
          }
        }

        if (effectiveRole === 'mentor') {
          const { data } = await DashboardService.mentorOverview();
          if (mounted) setOverview(data.data);

          if (currentPath.includes('/assigned-teams')) {
            const result = await DashboardService.mentorAssignedTeams();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/approvals')) {
            const result = await DashboardService.mentorApprovals();
            if (mounted) setRows(result.data.data || []);
          } else {
            const result = await DashboardService.mentorSessionLogs();
            if (mounted) setRows(result.data.data || []);
          }
        }

        if (effectiveRole === 'jury') {
          const { data } = await DashboardService.juryOverview();
          if (mounted) setOverview(data.data);

          if (currentPath.includes('/viva-records')) {
            const result = await DashboardService.juryVivaRecords();
            if (mounted) setRows(result.data.data || []);
          } else {
            const result = await DashboardService.juryEvaluations();
            if (mounted) setRows(result.data.data || []);
          }
        }

        if (effectiveRole === 'admin') {
          const { data } = await DashboardService.adminOverview();
          if (mounted) setOverview(data.data);

          const adminFetchMap = {
            '/dashboard/admin/event-flow': DashboardService.adminEvents,
            '/dashboard/admin/registrations': DashboardService.adminRegistrations,
            '/dashboard/admin/shortlisted-teams': DashboardService.adminShortlist,
            '/dashboard/admin/team-formation': DashboardService.adminTeams,
            '/dashboard/admin/travel-management': DashboardService.adminTravel,
            '/dashboard/admin/accommodation-management': DashboardService.adminAccommodation,
            '/dashboard/admin/food-management': DashboardService.adminFood,
            '/dashboard/admin/mentor-management': DashboardService.adminMentorSessions,
            '/dashboard/admin/jury-management': DashboardService.adminJuryEvaluations,
            '/dashboard/admin/submissions': DashboardService.adminSubmissions,
            '/dashboard/admin/domain-analytics': DashboardService.adminDomainAnalytics,
            '/dashboard/admin/leaderboard': DashboardService.adminLeaderboard,
            '/dashboard/admin/winning-projects': DashboardService.adminWinners,
            '/dashboard/admin/reward-claims': DashboardService.adminRewardClaims,
            '/dashboard/admin/reports': DashboardService.adminReports,
            '/dashboard/admin/mentor-approvals': DashboardService.adminMentorApprovals,
            '/dashboard/admin/activity-points': DashboardService.adminActivityPoints,
            '/dashboard/admin/users': DashboardService.adminUsers,
            '/dashboard/admin/audit-logs': DashboardService.adminAuditLogs,
            '/dashboard/admin/notifications': DashboardService.adminNotifications
          };

          const fetcher = adminFetchMap[currentPath];
          if (fetcher && currentPath === '/dashboard/admin/winning-projects') {
            const [winnerResult, claimResult, eventsResult, teamsResult] = await Promise.all([
              DashboardService.adminWinners(),
              DashboardService.adminRewardClaims(),
              DashboardService.adminEvents(),
              DashboardService.adminTeams()
            ]);
            if (mounted) {
              setRows(winnerResult.data.data || []);
              setRewardClaims(claimResult.data.data || []);
              setAdminEventOptions(eventsResult.data.data || []);
              setAdminTeamOptions(teamsResult.data.data || []);
            }
          } else if (fetcher) {
            const result = await fetcher();
            if (mounted) setRows(result.data.data || []);
            if (currentPath === '/dashboard/admin/reports') {
              const rankResult = await DashboardService.adminEventRankings();
              if (mounted) setEventRankings(rankResult.data.data || []);
            }
          } else if (mounted) {
            setRows([]);
          }
        }

        if (effectiveRole === 'management') {
          const { data } = await DashboardService.managementOverview();
          if (mounted) setOverview(data.data);

          if (currentPath.includes('/travel')) {
            const result = await DashboardService.managementTravel();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/accommodation')) {
            const result = await DashboardService.managementAccommodation();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/food')) {
            const result = await DashboardService.managementFood();
            if (mounted) setRows(result.data.data || []);
          } else if (mounted) {
            setRows([]);
          }
        }

        if (effectiveRole === 'report_team') {
          const { data } = await DashboardService.reportTeamOverview();
          if (mounted) setOverview(data.data);

          if (currentPath.includes('/templates')) {
            const [result, events] = await Promise.all([
              DashboardService.reportTeamTemplates(),
              DashboardService.adminEvents()
            ]);
            if (mounted) {
              setRows(result.data.data || []);
              setAdminEventOptions(events.data.data || []);
            }
          } else if (currentPath.includes('/responses')) {
            const result = await DashboardService.reportTeamResponses();
            if (mounted) setRows(result.data.data || []);
          } else if (mounted) {
            setRows([]);
          }
        }

        if (effectiveRole === 'rewards_team') {
          const { data } = await DashboardService.rewardsTeamOverview();
          if (mounted) setOverview(data.data);

          if (currentPath.includes('/reward-claims')) {
            const result = await DashboardService.rewardsTeamRewardClaims();
            if (mounted) setRows(result.data.data || []);
          } else if (currentPath.includes('/activity-points')) {
            const result = await DashboardService.rewardsTeamActivityPoints();
            if (mounted) setRows(result.data.data || []);
          } else if (mounted) {
            setRows([]);
          }
        }
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || 'Failed to load module data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [currentPath, effectiveRole]);

  const participantPerformance = useMemo(() => {
    const submissions = overview?.submissions || [];
    const avgCompletion = submissions.length
      ? submissions.reduce((acc, item) => acc + (item.completionPercent || 0), 0) / submissions.length
      : 0;

    return {
      labels: ['Completion', 'Mentor', 'Jury', 'Participation'],
      datasets: [{
        label: 'Participant Performance',
        data: [avgCompletion, 78, 81, 87],
        backgroundColor: ['#0ea5e9', '#22c55e', '#6366f1', '#f59e0b']
      }]
    };
  }, [overview]);

  const mentorTrend = useMemo(() => {
    const sessions = rows || [];
    const points = sessions.slice(0, 7).reverse();
    return {
      labels: points.map((_, i) => `S${i + 1}`),
      datasets: [{
        label: 'Mentor Score Trend',
        data: points.map((s) => s.mentorScore || 0),
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29,78,216,0.2)',
        fill: true,
        tension: 0.3
      }]
    };
  }, [rows]);

  const juryStatus = useMemo(() => {
    const evaluations = rows || [];
    const completed = evaluations.filter((e) => e.status === 'completed').length;
    const pending = Math.max(evaluations.length - completed, 0);

    return {
      labels: ['Completed', 'Pending'],
      datasets: [{ data: [completed, pending], backgroundColor: ['#16a34a', '#f59e0b'] }]
    };
  }, [rows]);

  const mentorColumns = currentPath.includes('/assigned-teams')
    ? [
      { key: 'name', label: 'Team' },
      { key: 'domain', label: 'Domain' },
      { key: 'status', label: 'Status' },
      { key: 'members', label: 'Members', render: (row) => row.members?.length || 0 }
    ]
    : currentPath.includes('/approvals')
      ? [
        { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
        { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' },
        { key: 'requestType', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Requested', render: (row) => formatDate(row.createdAt) }
      ]
      : [
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'conductedSessions', label: 'Conducted' },
      { key: 'assignedSessions', label: 'Assigned' },
      { key: 'mentorScore', label: 'Score' },
      { key: 'updatedAt', label: 'Updated', render: (row) => formatDate(row.updatedAt) }
      ];

  const juryColumns = currentPath.includes('/viva-records')
    ? [
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'question', label: 'Question' },
      { key: 'answer', label: 'Answer' },
      { key: 'score', label: 'Score' }
    ]
    : [
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'status', label: 'Status' },
      { key: 'totalScore', label: 'Score' },
      { key: 'updatedAt', label: 'Updated', render: (row) => formatDate(row.updatedAt) }
    ];

  const adminColumnsMap = {
    '/dashboard/admin': [
      { key: 'title', label: 'Event' },
      { key: 'eventCode', label: 'Event Code' },
      { key: 'eventType', label: 'Type' },
      { key: 'teamRule', label: 'Team Rule', render: (row) => `${row.minTeamSize || 1}-${row.maxTeamSize || 1}` },
      { key: 'registrationStartDate', label: 'Reg Start', render: (row) => formatDate(row.registrationStartDate) },
      { key: 'registrationDeadline', label: 'Reg End', render: (row) => formatDate(row.registrationDeadline) },
      { key: 'status', label: 'Status' },
      { key: 'startDate', label: 'Start', render: (row) => formatDate(row.startDate) },
      { key: 'endDate', label: 'End', render: (row) => formatDate(row.endDate) }
    ],
    '/dashboard/admin/event-overview': [
      { key: 'title', label: 'Event' },
      { key: 'eventCode', label: 'Event Code' },
      { key: 'eventType', label: 'Type' },
      { key: 'teamRule', label: 'Team Rule', render: (row) => `${row.minTeamSize || 1}-${row.maxTeamSize || 1}` },
      { key: 'registrationStartDate', label: 'Reg Start', render: (row) => formatDate(row.registrationStartDate) },
      { key: 'registrationDeadline', label: 'Reg End', render: (row) => formatDate(row.registrationDeadline) },
      { key: 'status', label: 'Status' },
      { key: 'startDate', label: 'Start', render: (row) => formatDate(row.startDate) },
      { key: 'endDate', label: 'End', render: (row) => formatDate(row.endDate) }
    ],
    '/dashboard/admin/event-flow': [
      { key: 'title', label: 'Event' },
      { key: 'eventCode', label: 'Event Code' },
      { key: 'registrationStartDate', label: 'Reg Start', render: (row) => formatDate(row.registrationStartDate) },
      { key: 'registrationDeadline', label: 'Reg End', render: (row) => formatDate(row.registrationDeadline) },
      { key: 'rounds', label: 'Rounds', render: (row) => row.rounds?.length || 0 },
      { key: 'startDate', label: 'Event Start', render: (row) => formatDate(row.startDate) },
      { key: 'endDate', label: 'Event End', render: (row) => formatDate(row.endDate) }
    ],
    '/dashboard/admin/registrations': [
      { key: 'ideaTitle', label: 'Idea' },
      { key: 'domain', label: 'Domain' },
      { key: 'status', label: 'Status' },
      { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' }
    ],
    '/dashboard/admin/shortlisted-teams': [
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
      { key: 'status', label: 'Status' },
      { key: 'remarks', label: 'Remarks' }
    ],
    '/dashboard/admin/team-formation': [
      { key: 'name', label: 'Team' },
      { key: 'domain', label: 'Domain' },
      { key: 'status', label: 'Status' },
      { key: 'mentor', label: 'Mentor', render: (row) => row.mentor?.name || '-' }
    ],
    '/dashboard/admin/travel-management': [
      { key: 'user', label: 'User', render: (row) => row.user?.name || '-' },
      { key: 'sourceCity', label: 'From' },
      { key: 'destinationCity', label: 'To' },
      { key: 'mode', label: 'Mode' },
      { key: 'status', label: 'Status' }
    ],
    '/dashboard/admin/accommodation-management': [
      { key: 'user', label: 'User', render: (row) => row.user?.name || '-' },
      { key: 'hotelName', label: 'Hotel' },
      { key: 'roomType', label: 'Room' },
      { key: 'status', label: 'Status' }
    ],
    '/dashboard/admin/food-management': [
      { key: 'user', label: 'User', render: (row) => row.user?.name || '-' },
      { key: 'preference', label: 'Preference' },
      { key: 'status', label: 'Status' }
    ],
    '/dashboard/admin/mentor-management': mentorColumns,
    '/dashboard/admin/jury-management': juryColumns,
    '/dashboard/admin/submissions': [
      { key: 'title', label: 'Title' },
      { key: 'participant', label: 'Participant', render: (row) => row.participant?.name || '-' },
      { key: 'status', label: 'Status' },
      { key: 'completionPercent', label: 'Completion %' }
    ],
    '/dashboard/admin/domain-analytics': [
      { key: 'domain', label: 'Domain' },
      { key: 'averageScore', label: 'Average Score' },
      { key: 'teamCount', label: 'Teams' }
    ],
    '/dashboard/admin/leaderboard': [
      { key: 'rank', label: 'Rank' },
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'score', label: 'Score' }
    ],
    '/dashboard/admin/winning-projects': [
      { key: 'rank', label: 'Rank' },
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'prize', label: 'Prize' },
      { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' }
    ],
    '/dashboard/admin/reports': [
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'IPI', label: 'IPI' },
      { key: 'teamInnovationScore', label: 'Team Score' },
      { key: 'eventOperationalEfficiency', label: 'Ops Efficiency' }
    ],
    '/dashboard/admin/users': [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' }
    ],
    '/dashboard/admin/audit-logs': [
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
      { key: 'user', label: 'User', render: (row) => row.user?.email || '-' },
      { key: 'createdAt', label: 'Time', render: (row) => formatDate(row.createdAt) }
    ],
    '/dashboard/admin/notifications': [
      { key: 'title', label: 'Title' },
      { key: 'recipient', label: 'Recipient', render: (row) => row.recipient?.email || '-' },
      { key: 'type', label: 'Type' },
      { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) }
    ],
    '/dashboard/admin/mentor-approvals': [
      { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
      { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' },
      { key: 'mentor', label: 'Mentor', render: (row) => row.mentor?.name || '-' },
      { key: 'requestType', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Requested', render: (row) => formatDate(row.createdAt) }
    ],
    '/dashboard/admin/activity-points': [
      { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
      { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' },
      { key: 'pointsRequested', label: 'Points' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Requested', render: (row) => formatDate(row.createdAt) }
    ],
    '/dashboard/admin/reward-claims': [
      { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
      { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' },
      { key: 'winner', label: 'Rank', render: (row) => row.winner?.rank || '-' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Requested', render: (row) => formatDate(row.createdAt) }
    ]
  };
  const adminColumns = adminColumnsMap[currentPath];
  const pendingRegistrationIds = useMemo(
    () => rows.filter((item) => item.status === 'pending' && item._id).map((item) => item._id),
    [rows]
  );
  const selectedOpenEvent = useMemo(
    () => openEventOptions.find((ev) => ev.eventCode === registrationForm.event) || null,
    [openEventOptions, registrationForm.event]
  );

  async function onCreateSubmission(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createSubmission(submissionForm);
      setFormMessage('Submission saved successfully');
      setNotice({ type: 'success', text: 'Submission saved successfully' });
      const result = await DashboardService.participantSubmissions();
      setRows(result.data.data || []);
      setSubmissionForm({ title: '', description: '', prototypeUrl: '', event: '' });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Submission failed');
    }
  }

  async function onCreateTravel(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createTravel({ ...travelForm, amount: Number(travelForm.amount) });
      setFormMessage('Travel request submitted');
      setNotice({ type: 'success', text: 'Travel request submitted' });
      const result = await DashboardService.participantTravel();
      setRows(result.data.data || []);
      setTravelForm({ event: '', sourceCity: '', destinationCity: '', mode: 'train', amount: '' });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Travel request failed');
    }
  }

  async function onCreateAccommodation(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createParticipantAccommodation(accommodationForm);
      setNotice({ type: 'success', text: 'Accommodation request submitted' });
      const result = await DashboardService.participantAccommodation();
      setRows(result.data.data || []);
      setAccommodationForm({ event: '', hotelName: '', checkIn: '', checkOut: '', roomType: 'double' });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Accommodation request failed');
    }
  }

  async function onCreateFood(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createParticipantFood({
        ...foodForm,
        allergies: foodForm.allergies ? foodForm.allergies.split(',').map((x) => x.trim()).filter(Boolean) : [],
        mealSlots: foodForm.mealSlots ? foodForm.mealSlots.split(',').map((x) => x.trim()).filter(Boolean) : ['lunch']
      });
      setNotice({ type: 'success', text: 'Food request submitted' });
      const result = await DashboardService.participantFood();
      setRows(result.data.data || []);
      setFoodForm({ event: '', preference: 'veg', allergies: '', mealSlots: 'lunch,dinner' });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Food request failed');
    }
  }

  async function onCreateRegistration(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      const payload = {
        ...registrationForm,
        teamMembersInput: registrationForm.teamMembersInput
          ? registrationForm.teamMembersInput.split(',').map((m) => m.trim()).filter(Boolean)
          : []
      };
      await DashboardService.createParticipantRegistration(payload);
      setFormMessage('Registration submitted successfully');
      setNotice({ type: 'success', text: 'Registration submitted successfully' });
      const result = await DashboardService.participantRegistrations();
      setRows(result.data.data || []);
      setRegistrationForm({
        event: '',
        ideaTitle: '',
        ideaSummary: '',
        domain: '',
        teamPreferenceName: '',
        teamMembersInput: ''
      });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Registration failed');
    }
  }

  async function onCreateMentorApproval(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createParticipantMentorApproval(mentorApprovalForm);
      setFormMessage('Mentor approval request submitted');
      setNotice({ type: 'success', text: 'Mentor approval request submitted' });
      const result = await DashboardService.participantMentorApprovals();
      setRows(result.data.data || []);
      setMentorApprovalForm({
        event: '',
        mentorId: '',
        mentorEmail: '',
        requestType: 'mentor-approval',
        reason: '',
        proofUrl: ''
      });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Mentor approval request failed');
    }
  }

  async function onCreateActivityPoints(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createParticipantActivityPoints({
        ...activityPointsForm,
        pointsRequested: Number(activityPointsForm.pointsRequested)
      });
      setFormMessage('Activity points request submitted');
      setNotice({ type: 'success', text: 'Activity points request submitted' });
      const result = await DashboardService.participantActivityPoints();
      setRows(result.data.data || []);
      setActivityPointsForm({ event: '', pointsRequested: '', summary: '', proofUrl: '' });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Activity point request failed');
    }
  }

  async function onCreateRewardClaim(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createParticipantRewardClaim(rewardClaimForm);
      setFormMessage('Reward claim submitted');
      setNotice({ type: 'success', text: 'Reward claim submitted' });
      const [winnerResult, claimResult] = await Promise.all([
        DashboardService.participantWinners(),
        DashboardService.participantRewardClaims()
      ]);
      setParticipantWinners(winnerResult.data.data || []);
      setParticipantRewardClaims(claimResult.data.data || []);
      setRows(claimResult.data.data || []);
      setRewardClaimForm({ winnerId: '', proofUrl: '', remarks: '' });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Reward claim failed');
    }
  }

  async function onSaveWinner(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      if (editingWinnerId) {
        await DashboardService.adminUpdateWinner(editingWinnerId, {
          event: winnerForm.event,
          team: winnerForm.team,
          rank: Number(winnerForm.rank),
          prize: winnerForm.prize
        });
        setNotice({ type: 'success', text: 'Winner updated' });
      } else {
        await DashboardService.adminCreateWinner({
          event: winnerForm.event,
          team: winnerForm.team,
          rank: Number(winnerForm.rank),
          prize: winnerForm.prize
        });
        setNotice({ type: 'success', text: 'Winner declared' });
      }
      setWinnerForm({ event: '', team: '', rank: '', prize: '' });
      setEditingWinnerId('');
      const [winnerResult, claimResult] = await Promise.all([
        DashboardService.adminWinners(),
        DashboardService.adminRewardClaims()
      ]);
      setRows(winnerResult.data.data || []);
      setRewardClaims(claimResult.data.data || []);
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Winner save failed');
    }
  }

  async function onCreateReportTemplate(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.reportTeamCreateTemplate({
        event: reportTemplateForm.event,
        title: reportTemplateForm.title,
        description: reportTemplateForm.description,
        questions: [
          { question: reportTemplateForm.question1, type: 'rating', required: true },
          { question: reportTemplateForm.question2, type: 'rating', required: true },
          { question: reportTemplateForm.question3, type: 'rating', required: true }
        ]
      });
      setNotice({ type: 'success', text: 'Report template created' });
      const result = await DashboardService.reportTeamTemplates();
      setRows(result.data.data || []);
      setReportTemplateForm({
        event: '',
        title: '',
        description: '',
        question1: 'Rate event organization',
        question2: 'Rate jury support',
        question3: 'Rate mentor support'
      });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Template creation failed');
    }
  }

  async function onSubmitReportResponse(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.createParticipantReportResponse({
        templateId: reportResponseForm.templateId,
        answers: [{ question: 'Overall Rating', type: 'rating', value: Number(reportResponseForm.rating) }],
        suggestion: reportResponseForm.suggestion
      });
      setNotice({ type: 'success', text: 'Report response submitted' });
      setReportResponseForm({ templateId: '', rating: 5, suggestion: '' });
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Report submission failed');
    }
  }

  async function onSubmitReport(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      await DashboardService.submitParticipantReport({
        ...reportForm,
        eventRating: Number(reportForm.eventRating)
      });
      setFormMessage('Performance report submitted');
      setNotice({ type: 'success', text: 'Performance report submitted' });
      const result = await DashboardService.participantReports();
      setRows(result.data.data || []);
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Report submission failed');
    }
  }

  async function refreshCurrentAdminData() {
    const adminFetchMap = {
      '/dashboard/admin/event-overview': DashboardService.adminEvents,
      '/dashboard/admin/registrations': DashboardService.adminRegistrations,
      '/dashboard/admin/travel-management': DashboardService.adminTravel,
      '/dashboard/admin/activity-points': DashboardService.adminActivityPoints,
      '/dashboard/admin/mentor-approvals': DashboardService.adminMentorApprovals,
      '/dashboard/admin/reward-claims': DashboardService.adminRewardClaims
    };
    const fetcher = adminFetchMap[currentPath];
    if (!fetcher) return;
    const result = await fetcher();
    setRows(result.data.data || []);
  }

  async function onBulkApproveRegistrations() {
    if (!pendingRegistrationIds.length) {
      setNotice({ type: 'error', text: 'No pending registrations found' });
      return;
    }

    setActionBusy(true);
    try {
      await DashboardService.adminBulkApproveRegistrations(pendingRegistrationIds);
      await refreshCurrentAdminData();
      setNotice({ type: 'success', text: `Approved ${pendingRegistrationIds.length} pending registration(s)` });
    } catch (err) {
      setNotice({ type: 'error', text: err?.response?.data?.message || 'Bulk approval failed' });
    } finally {
      setActionBusy(false);
    }
  }

  function openConfirm(titleText, descriptionText, callback) {
    setModal({
      open: true,
      title: titleText,
      description: descriptionText,
      onConfirm: async () => {
        setActionBusy(true);
        try {
          await callback();
          setModal({ open: false, title: '', description: '', onConfirm: null });
          setNotice({ type: 'success', text: 'Action completed successfully' });
        } catch (err) {
          setNotice({ type: 'error', text: err?.response?.data?.message || 'Action failed' });
        } finally {
          setActionBusy(false);
        }
      }
    });
  }

  const registrationActions = [
    {
      label: 'Approve',
      variant: 'success',
      onClick: (row) => openConfirm(
        'Approve Registration',
        `Approve registration for ${row.user?.name || 'this participant'}?`,
        async () => {
          await DashboardService.adminUpdateRegistrationStatus(row._id, 'approved');
          await refreshCurrentAdminData();
        }
      )
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Reject Registration',
        `Reject registration for ${row.user?.name || 'this participant'}?`,
        async () => {
          await DashboardService.adminUpdateRegistrationStatus(row._id, 'rejected');
          await refreshCurrentAdminData();
        }
      )
    }
  ];

  const travelActions = [
    {
      label: 'Approve',
      variant: 'success',
      onClick: (row) => openConfirm(
        'Approve Travel Request',
        `Approve travel request from ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.adminUpdateTravelStatus(row._id, 'approved');
          await refreshCurrentAdminData();
        }
      )
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Reject Travel Request',
        `Reject travel request from ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.adminUpdateTravelStatus(row._id, 'rejected');
          await refreshCurrentAdminData();
        }
      )
    }
  ];

  const mentorApprovalActions = [
    {
      label: 'Approve',
      variant: 'success',
      onClick: (row) => openConfirm(
        'Approve Request',
        `Approve ${row.requestType || 'request'} for ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.mentorUpdateApprovalStatus(row._id, 'approved');
          await refreshCurrentAdminData();
          if (effectiveRole === 'mentor') {
            const result = await DashboardService.mentorApprovals();
            setRows(result.data.data || []);
          }
        }
      )
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Reject Request',
        `Reject ${row.requestType || 'request'} for ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.mentorUpdateApprovalStatus(row._id, 'rejected');
          if (effectiveRole === 'mentor') {
            const result = await DashboardService.mentorApprovals();
            setRows(result.data.data || []);
          }
        }
      )
    }
  ];

  const activityPointActions = [
    {
      label: 'Approve',
      variant: 'success',
      onClick: (row) => openConfirm(
        'Approve Activity Points',
        `Approve ${row.pointsRequested} points for ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.adminUpdateActivityPointsStatus(row._id, 'approved');
          await refreshCurrentAdminData();
        }
      )
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Reject Activity Points',
        `Reject activity points request from ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.adminUpdateActivityPointsStatus(row._id, 'rejected');
          await refreshCurrentAdminData();
        }
      )
    }
  ];

  const winnerActions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setEditingWinnerId(row._id);
        setWinnerForm({
          event: row.event?._id || '',
          team: row.team?._id || '',
          rank: row.rank || '',
          prize: row.prize || ''
        });
      }
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Delete Winner',
        `Delete winner record for rank ${row.rank}?`,
        async () => {
          await DashboardService.adminDeleteWinner(row._id);
          const [winnerResult, claimResult] = await Promise.all([
            DashboardService.adminWinners(),
            DashboardService.adminRewardClaims()
          ]);
          setRows(winnerResult.data.data || []);
          setRewardClaims(claimResult.data.data || []);
          if (editingWinnerId === row._id) {
            setEditingWinnerId('');
            setWinnerForm({ event: '', team: '', rank: '', prize: '' });
          }
        }
      )
    }
  ];

  const rewardClaimActions = [
    {
      label: 'Approve',
      variant: 'success',
      onClick: (row) => openConfirm(
        'Approve Reward Claim',
        `Approve reward claim of ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.adminUpdateRewardClaimStatus(row._id, 'approved');
          await refreshCurrentAdminData();
        }
      )
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Reject Reward Claim',
        `Reject reward claim of ${row.user?.name || 'participant'}?`,
        async () => {
          await DashboardService.adminUpdateRewardClaimStatus(row._id, 'rejected');
          await refreshCurrentAdminData();
        }
      )
    }
  ];

  const managementActions = [
    {
      label: 'Approve',
      variant: 'success',
      onClick: (row) => openConfirm(
        'Approve Request',
        'Approve this request?',
        async () => {
          if (currentPath.includes('/management/travel')) await DashboardService.managementUpdateTravelStatus(row._id, { status: 'approved', isFree: false, costConfigured: row.amount || 0 });
          if (currentPath.includes('/management/accommodation')) await DashboardService.managementUpdateAccommodationStatus(row._id, { status: 'allocated', isFree: false, costConfigured: row.costConfigured || 0 });
          if (currentPath.includes('/management/food')) await DashboardService.managementUpdateFoodStatus(row._id, { status: 'approved', isFree: true, costConfigured: 0 });
          if (currentPath.includes('/management/travel')) {
            const result = await DashboardService.managementTravel();
            setRows(result.data.data || []);
          } else if (currentPath.includes('/management/accommodation')) {
            const result = await DashboardService.managementAccommodation();
            setRows(result.data.data || []);
          } else if (currentPath.includes('/management/food')) {
            const result = await DashboardService.managementFood();
            setRows(result.data.data || []);
          }
        }
      )
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Reject Request',
        'Reject this request?',
        async () => {
          if (currentPath.includes('/management/travel')) await DashboardService.managementUpdateTravelStatus(row._id, { status: 'rejected', isFree: false, costConfigured: 0 });
          if (currentPath.includes('/management/accommodation')) await DashboardService.managementUpdateAccommodationStatus(row._id, { status: 'rejected', isFree: false, costConfigured: 0 });
          if (currentPath.includes('/management/food')) await DashboardService.managementUpdateFoodStatus(row._id, { status: 'rejected', isFree: false, costConfigured: 0 });
          if (currentPath.includes('/management/travel')) {
            const result = await DashboardService.managementTravel();
            setRows(result.data.data || []);
          } else if (currentPath.includes('/management/accommodation')) {
            const result = await DashboardService.managementAccommodation();
            setRows(result.data.data || []);
          } else if (currentPath.includes('/management/food')) {
            const result = await DashboardService.managementFood();
            setRows(result.data.data || []);
          }
        }
      )
    }
  ];

  const showBlueprint = Boolean(moduleBlueprint[currentPath]);
  const selectedFlowEvent = useMemo(() => {
    if (!rows.length) return null;
    const current = rows.find((row) => row._id === selectedEventFlowId);
    return current || rows[0];
  }, [rows, selectedEventFlowId]);
  const flowSteps = useMemo(() => {
    if (!selectedFlowEvent) return [];
    const steps = [];

    const pushStep = (label, dateValue) => {
      const parsed = dateValue ? new Date(dateValue) : null;
      steps.push({
        label,
        date: formatDateOnly(dateValue),
        sort: parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : Number.MAX_SAFE_INTEGER
      });
    };

    pushStep('Registration Opens', selectedFlowEvent.registrationStartDate);
    pushStep('Registration Closes', selectedFlowEvent.registrationDeadline);
    pushStep('Event Starts', selectedFlowEvent.startDate);

    if (Array.isArray(selectedFlowEvent.rounds) && selectedFlowEvent.rounds.length) {
      selectedFlowEvent.rounds.forEach((round, index) => {
        const roundName = round.name || `Round ${index + 1}`;
        pushStep(`${roundName} Starts`, round.startDate);
        pushStep(`${roundName} Ends`, round.endDate);
      });
    } else {
      if (selectedFlowEvent.round1Name || selectedFlowEvent.round1StartDate || selectedFlowEvent.round1EndDate) {
        pushStep(`${selectedFlowEvent.round1Name || 'Round 1'} Starts`, selectedFlowEvent.round1StartDate);
        pushStep(`${selectedFlowEvent.round1Name || 'Round 1'} Ends`, selectedFlowEvent.round1EndDate);
      }
      if (selectedFlowEvent.round2Name || selectedFlowEvent.round2StartDate || selectedFlowEvent.round2EndDate) {
        pushStep(`${selectedFlowEvent.round2Name || 'Round 2'} Starts`, selectedFlowEvent.round2StartDate);
        pushStep(`${selectedFlowEvent.round2Name || 'Round 2'} Ends`, selectedFlowEvent.round2EndDate);
      }
    }

    pushStep('Event Ends', selectedFlowEvent.endDate);
    pushStep('Winners Declared', selectedFlowEvent.endDate);

    return steps
      .filter((step) => step.label)
      .sort((a, b) => a.sort - b.sort);
  }, [selectedFlowEvent]);

  return (
    <div className="animate-fade-in space-y-5">
      {notice.text && (
        <div className={`rounded-xl border p-3 text-sm ${notice.type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40'}`}
        >
          {notice.text}
        </div>
      )}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40">{error}</div>}
      {loading && <div className="text-sm text-slate-500 dark:text-slate-400">Loading module data...</div>}

      {effectiveRole === 'participant' && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <KpiCard label="Teams" value={overview?.teams?.length || 0} tone="blue" />
            <KpiCard label="Submissions" value={overview?.submissions?.length || 0} tone="green" />
            <KpiCard label="Notifications" value={overview?.notifications?.length || 0} tone="amber" />
          </div>

          {currentPath.includes('/performance') && (
            <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
              <form onSubmit={onSubmitReport} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Post-Event Report Submission</h2>
                <select
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={reportForm.event}
                  onChange={(e) => setReportForm({ ...reportForm, event: e.target.value })}
                  required
                >
                  <option value="">Select Registered Event</option>
                  {eventOptions.map((ev) => (
                    <option key={ev._id} value={ev.eventCode}>
                      {ev.eventCode} - {ev.title}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={reportForm.eventRating}
                  onChange={(e) => setReportForm({ ...reportForm, eventRating: e.target.value })}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Bad</option>
                </select>
                <textarea
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  rows={3}
                  placeholder="Feedback about event operations and outcomes"
                  value={reportForm.participantFeedback}
                  onChange={(e) => setReportForm({ ...reportForm, participantFeedback: e.target.value })}
                  required
                />
                <label className="flex items-center gap-2 text-sm dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={reportForm.wouldRecommend}
                    onChange={(e) => setReportForm({ ...reportForm, wouldRecommend: e.target.checked })}
                  />
                  I would recommend this event
                </label>
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit Report</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <Bar data={participantPerformance} options={{ plugins: { legend: { position: 'top' } } }} />
              </div>
            </div>
          )}

          {currentPath.includes('/registration-status') && (
            <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
              <form onSubmit={onCreateRegistration} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Register For Event</h2>
                <select
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={registrationForm.event}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, event: e.target.value })}
                  required
                >
                  <option value="">Select Open Event</option>
                  {openEventOptions.map((ev) => (
                    <option key={ev._id} value={ev.eventCode}>
                      {ev.eventCode} - {ev.title}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  placeholder="Idea Title"
                  value={registrationForm.ideaTitle}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, ideaTitle: e.target.value })}
                  required
                />
                <input
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  placeholder="Domain"
                  value={registrationForm.domain}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, domain: e.target.value })}
                  required
                />
                {selectedOpenEvent?.eventType !== 'individual' && (
                  <>
                    <input
                      className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Preferred Team Name (optional)"
                      value={registrationForm.teamPreferenceName}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, teamPreferenceName: e.target.value })}
                    />
                    <input
                      className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Team Members (comma separated, optional)"
                      value={registrationForm.teamMembersInput}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, teamMembersInput: e.target.value })}
                    />
                  </>
                )}
                <textarea
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  rows={3}
                  placeholder="Idea Summary"
                  value={registrationForm.ideaSummary}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, ideaSummary: e.target.value })}
                  required
                />
                {selectedOpenEvent && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Event Workflow</p>
                    <p className="text-slate-600 dark:text-slate-300">Type: {selectedOpenEvent.eventType || '-'} | Team: {selectedOpenEvent.minTeamSize || 1}-{selectedOpenEvent.maxTeamSize || 1}</p>
                    <p className="text-slate-600 dark:text-slate-300">Registration: {formatDate(selectedOpenEvent.registrationStartDate)} {'->'} {formatDate(selectedOpenEvent.registrationDeadline)}</p>
                    <p className="text-slate-600 dark:text-slate-300">Event: {formatDate(selectedOpenEvent.startDate)} {'->'} {formatDate(selectedOpenEvent.endDate)}</p>
                    <p className="text-slate-600 dark:text-slate-300">Prize Pool: {selectedOpenEvent.prizePool || 0}</p>
                    {selectedOpenEvent.rounds?.length ? (
                      <ul className="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                        {selectedOpenEvent.rounds.map((round, idx) => (
                          <li key={`${round.name}-${idx}`}>
                            {round.name}: {formatDate(round.startDate)} {'->'} {formatDate(round.endDate)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit Registration</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>

              <DataTable
                columns={[
                  { key: '_id', label: 'Registration ID' },
                  { key: 'participantId', label: 'Participant ID', render: (row) => row.user || '-' },
                  { key: 'eventId', label: 'Event ID', render: (row) => row.event?._id || '-' },
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'eventCode', label: 'Code', render: (row) => row.event?.eventCode || '-' },
                  { key: 'eventType', label: 'Type', render: (row) => row.event?.eventType || '-' },
                  { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
                  { key: 'domain', label: 'Domain' },
                  { key: 'status', label: 'Status' },
                  { key: 'createdAt', label: 'Applied', render: (row) => formatDate(row.createdAt) }
                ]}
                rows={rows}
                emptyMessage="No registrations yet"
              />
            </div>
          )}

          {currentPath.includes('/idea-submission') && (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onCreateSubmission} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Submit Idea / Prototype</h2>
                <select
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={submissionForm.event}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, event: e.target.value })}
                  required
                >
                  <option value="">Select Event Code</option>
                  {eventOptions.map((ev) => (
                    <option key={ev._id} value={ev.eventCode}>
                      {ev.eventCode} - {ev.title}
                    </option>
                  ))}
                </select>
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Title" value={submissionForm.title} onChange={(e) => setSubmissionForm({ ...submissionForm, title: e.target.value })} required />
                <textarea className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Description" value={submissionForm.description} onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })} required />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Prototype URL" value={submissionForm.prototypeUrl} onChange={(e) => setSubmissionForm({ ...submissionForm, prototypeUrl: e.target.value })} required />
                {submissionForm.event && <p className="text-xs text-slate-500 dark:text-slate-300">Using Event Code: {submissionForm.event}</p>}
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>

              <DataTable
                columns={[
                  { key: 'title', label: 'Title' },
                  { key: 'status', label: 'Status' },
                  { key: 'completionPercent', label: 'Completion %' },
                  { key: 'updatedAt', label: 'Updated', render: (row) => formatDate(row.updatedAt) }
                ]}
                rows={rows}
                emptyMessage="No submissions found"
              />
            </div>
          )}

          {currentPath.includes('/travel') && (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onCreateTravel} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Create Travel Request</h2>
                <select
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={travelForm.event}
                  onChange={(e) => setTravelForm({ ...travelForm, event: e.target.value })}
                  required
                >
                  <option value="">Select Event Code</option>
                  {eventOptions.map((ev) => (
                    <option key={ev._id} value={ev.eventCode}>
                      {ev.eventCode} - {ev.title}
                    </option>
                  ))}
                </select>
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Source City" value={travelForm.sourceCity} onChange={(e) => setTravelForm({ ...travelForm, sourceCity: e.target.value })} required />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Destination City" value={travelForm.destinationCity} onChange={(e) => setTravelForm({ ...travelForm, destinationCity: e.target.value })} required />
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={travelForm.mode} onChange={(e) => setTravelForm({ ...travelForm, mode: e.target.value })}>
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="cab">Cab</option>
                </select>
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" min="0" placeholder="Amount" value={travelForm.amount} onChange={(e) => setTravelForm({ ...travelForm, amount: e.target.value })} required />
                {travelForm.event && <p className="text-xs text-slate-500 dark:text-slate-300">Using Event Code: {travelForm.event}</p>}
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit Request</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>

              <DataTable
                columns={[
                  { key: 'sourceCity', label: 'From' },
                  { key: 'destinationCity', label: 'To' },
                  { key: 'mode', label: 'Mode' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'status', label: 'Status' }
                ]}
                rows={rows}
                emptyMessage="No travel requests found"
              />
            </div>
          )}

          {currentPath.includes('/accommodation') && (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onCreateAccommodation} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Apply Accommodation</h2>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={accommodationForm.event} onChange={(e) => setAccommodationForm({ ...accommodationForm, event: e.target.value })} required>
                  <option value="">Select Event Code</option>
                  {eventOptions.map((ev) => <option key={ev._id} value={ev.eventCode}>{ev.eventCode} - {ev.title}</option>)}
                </select>
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Preferred Hotel" value={accommodationForm.hotelName} onChange={(e) => setAccommodationForm({ ...accommodationForm, hotelName: e.target.value })} required />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={accommodationForm.checkIn} onChange={(e) => setAccommodationForm({ ...accommodationForm, checkIn: e.target.value })} required />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={accommodationForm.checkOut} onChange={(e) => setAccommodationForm({ ...accommodationForm, checkOut: e.target.value })} required />
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={accommodationForm.roomType} onChange={(e) => setAccommodationForm({ ...accommodationForm, roomType: e.target.value })}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                </select>
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>
              <DataTable
                columns={[
                  { key: 'hotelName', label: 'Hotel' },
                  { key: 'roomType', label: 'Room' },
                  { key: 'costConfigured', label: 'Cost' },
                  { key: 'isFree', label: 'Free', render: (row) => row.isFree ? 'Yes' : 'No' },
                  { key: 'status', label: 'Status' }
                ]}
                rows={rows}
                emptyMessage="No accommodation requests found"
              />
            </div>
          )}

          {currentPath.includes('/food') && (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onCreateFood} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Apply Food Plan</h2>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={foodForm.event} onChange={(e) => setFoodForm({ ...foodForm, event: e.target.value })} required>
                  <option value="">Select Event Code</option>
                  {eventOptions.map((ev) => <option key={ev._id} value={ev.eventCode}>{ev.eventCode} - {ev.title}</option>)}
                </select>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={foodForm.preference} onChange={(e) => setFoodForm({ ...foodForm, preference: e.target.value })}>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="vegan">Vegan</option>
                  <option value="jain">Jain</option>
                </select>
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Allergies (comma separated)" value={foodForm.allergies} onChange={(e) => setFoodForm({ ...foodForm, allergies: e.target.value })} />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Meal Slots (comma separated)" value={foodForm.mealSlots} onChange={(e) => setFoodForm({ ...foodForm, mealSlots: e.target.value })} />
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>
              <DataTable
                columns={[
                  { key: 'preference', label: 'Preference' },
                  { key: 'costConfigured', label: 'Cost' },
                  { key: 'isFree', label: 'Free', render: (row) => row.isFree ? 'Yes' : 'No' },
                  { key: 'status', label: 'Status' }
                ]}
                rows={rows}
                emptyMessage="No food requests found"
              />
            </div>
          )}

          {currentPath.includes('/event-flow') && (
            <DataTable
              columns={[
                { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                { key: 'eventCode', label: 'Code', render: (row) => row.event?.eventCode || '-' },
                { key: 'registrationStartDate', label: 'Reg Start', render: (row) => formatDate(row.event?.registrationStartDate) },
                { key: 'registrationDeadline', label: 'Reg End', render: (row) => formatDate(row.event?.registrationDeadline) },
                { key: 'startDate', label: 'Event Start', render: (row) => formatDate(row.event?.startDate) },
                { key: 'endDate', label: 'Event End', render: (row) => formatDate(row.event?.endDate) },
                { key: 'status', label: 'Registration Status', render: (row) => row.status || '-' }
              ]}
              rows={rows}
              emptyMessage="No event flow records"
            />
          )}

          {currentPath.includes('/support') && (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onSubmitReportResponse} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Submit Final Report</h2>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={reportResponseForm.templateId} onChange={(e) => setReportResponseForm({ ...reportResponseForm, templateId: e.target.value })} required>
                  <option value="">Select Report Template</option>
                  {rows.map((template) => <option key={template._id} value={template._id}>{template.title} ({template.event?.eventCode || '-'})</option>)}
                </select>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={reportResponseForm.rating} onChange={(e) => setReportResponseForm({ ...reportResponseForm, rating: e.target.value })}>
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Bad</option>
                </select>
                <textarea className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" rows={3} placeholder="Suggestion box" value={reportResponseForm.suggestion} onChange={(e) => setReportResponseForm({ ...reportResponseForm, suggestion: e.target.value })} />
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit Report</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>
              <DataTable
                columns={[
                  { key: 'title', label: 'Template' },
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'createdAt', label: 'Published', render: (row) => formatDate(row.createdAt) }
                ]}
                rows={rows}
                emptyMessage="No report templates available"
              />
            </div>
          )}

          {currentPath.includes('/mentoring') && (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onCreateMentorApproval} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Mentor / OD Approval Request</h2>
                <input
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  list="participant-event-codes"
                  placeholder="Type Event Code (e.g. EVT-...)"
                  value={mentorApprovalForm.event}
                  onChange={(e) => setMentorApprovalForm({ ...mentorApprovalForm, event: e.target.value })}
                  required
                />
                <datalist id="participant-event-codes">
                  {eventOptions.map((ev) => <option key={ev._id} value={ev.eventCode}>{ev.title}</option>)}
                </datalist>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={mentorApprovalForm.mentorId} onChange={(e) => setMentorApprovalForm({ ...mentorApprovalForm, mentorId: e.target.value, mentorEmail: '' })}>
                  <option value="">Select Mentor</option>
                  {mentorOptions.map((mentor) => <option key={mentor._id} value={mentor._id}>{mentor.name} - {mentor.email}</option>)}
                </select>
                <input
                  className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                  list="mentor-emails"
                  placeholder="Or type Mentor Email"
                  value={mentorApprovalForm.mentorEmail}
                  onChange={(e) => setMentorApprovalForm({ ...mentorApprovalForm, mentorEmail: e.target.value, mentorId: '' })}
                />
                <datalist id="mentor-emails">
                  {mentorOptions.map((mentor) => <option key={mentor._id} value={mentor.email}>{mentor.name}</option>)}
                </datalist>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={mentorApprovalForm.requestType} onChange={(e) => setMentorApprovalForm({ ...mentorApprovalForm, requestType: e.target.value })}>
                  <option value="mentor-approval">Mentor Approval</option>
                  <option value="od-approval">OD Approval</option>
                </select>
                <textarea className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" rows={3} placeholder="Reason" value={mentorApprovalForm.reason} onChange={(e) => setMentorApprovalForm({ ...mentorApprovalForm, reason: e.target.value })} required />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Proof URL (optional)" value={mentorApprovalForm.proofUrl} onChange={(e) => setMentorApprovalForm({ ...mentorApprovalForm, proofUrl: e.target.value })} />
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit Request</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>
              <DataTable
                columns={[
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'mentor', label: 'Mentor', render: (row) => row.mentor?.name || '-' },
                  { key: 'requestType', label: 'Type' },
                  { key: 'status', label: 'Status' },
                  { key: 'createdAt', label: 'Requested', render: (row) => formatDate(row.createdAt) }
                ]}
                rows={rows}
                emptyMessage="No mentor approval requests found"
              />
            </div>
          )}

          {currentPath.includes('/activity-points') && (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onCreateActivityPoints} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Apply For Activity Points</h2>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={activityPointsForm.event} onChange={(e) => setActivityPointsForm({ ...activityPointsForm, event: e.target.value })} required>
                  <option value="">Select Event Code</option>
                  {eventOptions.map((ev) => <option key={ev._id} value={ev.eventCode}>{ev.eventCode} - {ev.title}</option>)}
                </select>
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" min="1" placeholder="Requested Points" value={activityPointsForm.pointsRequested} onChange={(e) => setActivityPointsForm({ ...activityPointsForm, pointsRequested: e.target.value })} required />
                <textarea className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" rows={3} placeholder="Summary of achievement" value={activityPointsForm.summary} onChange={(e) => setActivityPointsForm({ ...activityPointsForm, summary: e.target.value })} required />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Proof URL" value={activityPointsForm.proofUrl} onChange={(e) => setActivityPointsForm({ ...activityPointsForm, proofUrl: e.target.value })} required />
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit Activity Points</button>
                {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
              </form>
              <DataTable
                columns={[
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'pointsRequested', label: 'Points' },
                  { key: 'status', label: 'Status' },
                  { key: 'createdAt', label: 'Requested', render: (row) => formatDate(row.createdAt) }
                ]}
                rows={rows}
                emptyMessage="No activity point requests found"
              />
            </div>
          )}

          {(currentPath.includes('/winners') || currentPath.includes('/certificates')) && (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                <form onSubmit={onCreateRewardClaim} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <h2 className="font-semibold dark:text-white">Claim Winner Reward</h2>
                  <select
                    className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                    value={rewardClaimForm.winnerId}
                    onChange={(e) => setRewardClaimForm({ ...rewardClaimForm, winnerId: e.target.value })}
                    required
                  >
                    <option value="">Select Winning Record</option>
                    {participantWinners.map((winner) => (
                      <option key={winner._id} value={winner._id}>
                        {winner.event?.eventCode || '-'} | Rank {winner.rank} | {winner.prize}
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Proof URL"
                    value={rewardClaimForm.proofUrl}
                    onChange={(e) => setRewardClaimForm({ ...rewardClaimForm, proofUrl: e.target.value })}
                    required
                  />
                  <textarea
                    className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                    rows={3}
                    placeholder="Remarks (optional)"
                    value={rewardClaimForm.remarks}
                    onChange={(e) => setRewardClaimForm({ ...rewardClaimForm, remarks: e.target.value })}
                  />
                  <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Submit Claim</button>
                  {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
                </form>

                <DataTable
                  columns={[
                    { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                    { key: 'eventCode', label: 'Code', render: (row) => row.event?.eventCode || '-' },
                    { key: 'rank', label: 'Rank' },
                    { key: 'prize', label: 'Prize' },
                    { key: 'declarationDate', label: 'Declared', render: (row) => formatDate(row.declarationDate) }
                  ]}
                  rows={participantWinners}
                  emptyMessage="No winning records found for your account"
                />
              </div>

              <DataTable
                columns={[
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'winner', label: 'Rank', render: (row) => row.winner?.rank || '-' },
                  { key: 'status', label: 'Claim Status' },
                  { key: 'createdAt', label: 'Submitted', render: (row) => formatDate(row.createdAt) }
                ]}
                rows={participantRewardClaims}
                emptyMessage="No reward claims submitted yet"
              />
            </div>
          )}

          {currentPath.includes('/notifications') && (
            <DataTable
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'message', label: 'Message' },
                { key: 'type', label: 'Type' },
                { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) }
              ]}
              rows={rows}
              emptyMessage="No notifications"
            />
          )}

          {!currentPath.includes('/idea-submission') && !currentPath.includes('/travel') && !currentPath.includes('/accommodation') && !currentPath.includes('/food') && !currentPath.includes('/event-flow') && !currentPath.includes('/mentoring') && !currentPath.includes('/activity-points') && !currentPath.includes('/winners') && !currentPath.includes('/certificates') && !currentPath.includes('/support') && !currentPath.includes('/notifications') && !currentPath.includes('/performance') && !currentPath.includes('/registration-status') && (
            <DataTable
              columns={[
                { key: 'title', label: 'Submission' },
                { key: 'status', label: 'Status' },
                { key: 'completionPercent', label: 'Completion %' }
              ]}
              rows={overview?.submissions || []}
              emptyMessage="No submissions yet"
            />
          )}
        </>
      )}

      {effectiveRole === 'mentor' && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <KpiCard label="Assigned Teams" value={overview?.assignedTeams?.length || 0} tone="blue" />
            <KpiCard label="Session Logs" value={rows.length} tone="green" />
            <KpiCard label="Avg Mentor Score" value={Math.round(rows.reduce((a, s) => a + (s.mentorScore || 0), 0) / Math.max(rows.length, 1))} tone="amber" />
          </div>

          {currentPath.includes('/performance') ? (
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <Line data={mentorTrend} options={{ plugins: { legend: { position: 'top' } } }} />
            </div>
          ) : (
            <DataTable
              columns={mentorColumns}
              rows={rows}
              emptyMessage="No mentor records yet"
              rowActions={currentPath.includes('/approvals') ? mentorApprovalActions : null}
            />
          )}
        </>
      )}

      {effectiveRole === 'jury' && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <KpiCard label="Evaluations" value={rows.length} tone="blue" />
            <KpiCard label="Completed" value={rows.filter((r) => r.status === 'completed').length} tone="green" />
            <KpiCard label="Pending" value={rows.filter((r) => r.status !== 'completed').length} tone="amber" />
          </div>

          {(currentPath.includes('/analytics') || currentPath.includes('/leaderboard')) ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><Doughnut data={juryStatus} /></div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <Bar
                  data={{
                    labels: rows.slice(0, 6).map((_, i) => `Team ${i + 1}`),
                    datasets: [{ label: 'Jury Score', data: rows.slice(0, 6).map((r) => r.totalScore || 0), backgroundColor: '#2563eb' }]
                  }}
                />
              </div>
            </div>
          ) : (
            <DataTable columns={juryColumns} rows={rows} emptyMessage="No jury records yet" />
          )}
        </>
      )}

      {effectiveRole === 'admin' && (
        <>
          <div className="grid gap-3 md:grid-cols-5">
            <KpiCard label="Events" value={overview?.events || 0} tone="blue" />
            <KpiCard label="Registrations" value={overview?.registrations || 0} tone="green" />
            <KpiCard label="Teams" value={overview?.teams || 0} tone="amber" />
            <KpiCard label="Evaluations" value={overview?.evaluations || 0} tone="rose" />
            <KpiCard label="Winners" value={overview?.winners || 0} tone="blue" />
          </div>

          <>
              {currentPath === '/dashboard/admin/event-overview' || currentPath === '/dashboard/admin' ? (<AdminEventManagement />) : currentPath === '/dashboard/admin/event-flow' ? (
                <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Select Event</h2>
                      <select
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                        value={selectedFlowEvent?._id || ''}
                        onChange={(e) => setSelectedEventFlowId(e.target.value)}
                      >
                        <option value="">Choose an event</option>
                        {rows.map((event) => (
                          <option key={event._id} value={event._id}>
                            {event.title} ({event.eventCode})
                          </option>
                        ))}
                      </select>
                      {selectedFlowEvent ? (
                        <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                          <p className="font-semibold">{selectedFlowEvent.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Code: {selectedFlowEvent.eventCode}</p>
                          <p>Type: {selectedFlowEvent.eventType || 'team'}</p>
                          <p>Teams: {selectedFlowEvent.minTeamSize || 1} to {selectedFlowEvent.maxTeamSize || 1}</p>
                          <p>Domains: {(selectedFlowEvent.domains || []).join(', ') || 'Not set'}</p>
                          <p>Status: {selectedFlowEvent.status || 'open'}</p>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No event selected.</p>
                      )}
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Workflow Notes</h3>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                        {selectedFlowEvent?.workflowNotes || 'No workflow notes provided.'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <h2 className="font-semibold dark:text-white">Event Flow Timeline</h2>
                      <div className="mt-3 space-y-3">
                        {flowSteps.length ? (
                          flowSteps.map((step, idx) => (
                            <div key={`${step.label}-${idx}`} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                              <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" />
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{step.date}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400">No timeline data available.</p>
                        )}
                      </div>
                    </div>
                    <DataTable
                      columns={adminColumns}
                      rows={rows}
                      emptyMessage="No events found"
                    />
                  </div>
                </div>
              ) : currentPath === '/dashboard/admin/winning-projects' ? (
                <div className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                    <form onSubmit={onSaveWinner} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <h2 className="font-semibold dark:text-white">{editingWinnerId ? 'Update Winner' : 'Declare Winner'}</h2>
                      <select
                        className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                        value={winnerForm.event}
                        onChange={(e) => setWinnerForm({ ...winnerForm, event: e.target.value })}
                        required
                      >
                        <option value="">Select Event</option>
                        {adminEventOptions.map((event) => (
                          <option key={event._id} value={event._id}>{event.title} ({event.eventCode})</option>
                        ))}
                      </select>
                      <select
                        className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                        value={winnerForm.team}
                        onChange={(e) => setWinnerForm({ ...winnerForm, team: e.target.value })}
                        required
                      >
                        <option value="">Select Team</option>
                        {adminTeamOptions
                          .filter((team) => !winnerForm.event || team.event?._id === winnerForm.event)
                          .map((team) => (
                            <option key={team._id} value={team._id}>{team.name} ({team.domain})</option>
                          ))}
                      </select>
                      <input
                        className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                        type="number"
                        min="1"
                        placeholder="Rank"
                        value={winnerForm.rank}
                        onChange={(e) => setWinnerForm({ ...winnerForm, rank: e.target.value })}
                        required
                      />
                      <input
                        className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800"
                        placeholder="Prize"
                        value={winnerForm.prize}
                        onChange={(e) => setWinnerForm({ ...winnerForm, prize: e.target.value })}
                        required
                      />
                      <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">
                        {editingWinnerId ? 'Update Winner' : 'Declare Winner'}
                      </button>
                      {editingWinnerId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWinnerId('');
                            setWinnerForm({ event: '', team: '', rank: '', prize: '' });
                          }}
                          className="w-full rounded-lg border border-slate-300 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </form>
                    <DataTable
                      columns={adminColumns}
                      rows={rows}
                      emptyMessage="No winners declared yet"
                      rowActions={winnerActions}
                    />
                  </div>

                  <DataTable
                    columns={[
                      { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                      { key: 'team', label: 'Team', render: (row) => row.team?.name || '-' },
                      { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' },
                      { key: 'winner', label: 'Rank', render: (row) => row.winner?.rank || '-' },
                      { key: 'status', label: 'Claim Status' },
                      { key: 'createdAt', label: 'Submitted', render: (row) => formatDate(row.createdAt) }
                    ]}
                    rows={rewardClaims}
                    emptyMessage="No reward claims submitted"
                    rowActions={rewardClaimActions}
                  />
                </div>
              ) : currentPath === '/dashboard/admin/reports' ? (
                <div className="space-y-4">
                  <DataTable
                    columns={adminColumns}
                    rows={rows}
                    emptyMessage="No performance reports found"
                  />
                  <DataTable
                    columns={[
                      { key: 'weightedScore', label: 'Weighted Score' },
                      { key: 'eventTitle', label: 'Event' },
                      { key: 'eventCode', label: 'Code' },
                      { key: 'averageRating', label: 'Avg Rating' },
                      { key: 'feedbackCount', label: 'Feedback Count' },
                      { key: 'recommendRate', label: 'Recommend %' }
                    ]}
                    rows={eventRankings}
                    emptyMessage="No event rankings yet"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {currentPath === '/dashboard/admin/registrations' && (
                    <div className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Pending approvals: <span className="font-semibold">{pendingRegistrationIds.length}</span>
                      </p>
                      <button
                        type="button"
                        disabled={!pendingRegistrationIds.length || actionBusy}
                        onClick={() => openConfirm(
                          'Bulk Approve Registrations',
                          `Approve all pending registrations (${pendingRegistrationIds.length})?`,
                          onBulkApproveRegistrations
                        )}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionBusy ? 'Processing...' : 'Approve All Pending'}
                      </button>
                    </div>
                  )}
                  <DataTable
                    columns={adminColumns}
                    rows={rows}
                    emptyMessage="No records found for this module"
                    rowActions={
                      currentPath === '/dashboard/admin/registrations'
                        ? registrationActions
                        : null
                    }
                  />
                </div>
              )}
          </>
        </>
      )}

      {effectiveRole === 'report_team' && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <KpiCard label="Templates" value={overview?.templates || 0} tone="blue" />
            <KpiCard label="Responses" value={overview?.responses || 0} tone="green" />
          </div>
          {currentPath.includes('/templates') ? (
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <form onSubmit={onCreateReportTemplate} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h2 className="font-semibold dark:text-white">Create Report Template</h2>
                <select className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={reportTemplateForm.event} onChange={(e) => setReportTemplateForm({ ...reportTemplateForm, event: e.target.value })} required>
                  <option value="">Select Event</option>
                  {adminEventOptions.map((event) => <option key={event._id} value={event._id}>{event.title} ({event.eventCode})</option>)}
                </select>
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Template Title" value={reportTemplateForm.title} onChange={(e) => setReportTemplateForm({ ...reportTemplateForm, title: e.target.value })} required />
                <textarea className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" rows={2} placeholder="Description" value={reportTemplateForm.description} onChange={(e) => setReportTemplateForm({ ...reportTemplateForm, description: e.target.value })} />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Question 1" value={reportTemplateForm.question1} onChange={(e) => setReportTemplateForm({ ...reportTemplateForm, question1: e.target.value })} />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Question 2" value={reportTemplateForm.question2} onChange={(e) => setReportTemplateForm({ ...reportTemplateForm, question2: e.target.value })} />
                <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Question 3" value={reportTemplateForm.question3} onChange={(e) => setReportTemplateForm({ ...reportTemplateForm, question3: e.target.value })} />
                <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">Create Template</button>
              </form>
              <DataTable
                columns={[
                  { key: 'title', label: 'Template' },
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'questions', label: 'Questions', render: (row) => row.questions?.length || 0 },
                  { key: 'isActive', label: 'Active', render: (row) => row.isActive ? 'Yes' : 'No' }
                ]}
                rows={rows}
                emptyMessage="No templates created"
              />
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'template', label: 'Template', render: (row) => row.template?.title || '-' },
                { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                { key: 'participant', label: 'Participant', render: (row) => row.participant?.name || '-' },
                { key: 'createdAt', label: 'Submitted', render: (row) => formatDate(row.createdAt) }
              ]}
              rows={rows}
              emptyMessage="No participant responses"
            />
          )}
        </>
      )}

      {effectiveRole === 'rewards_team' && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <KpiCard label="Reward Claims Pending" value={overview?.rewardClaimsPending || 0} tone="blue" />
            <KpiCard label="Activity Points Pending" value={overview?.activityPointsPending || 0} tone="amber" />
          </div>
          <DataTable
            columns={
              currentPath.includes('/reward-claims')
                ? [
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' },
                  { key: 'winner', label: 'Rank', render: (row) => row.winner?.rank || '-' },
                  { key: 'status', label: 'Status' }
                ]
                : [
                  { key: 'event', label: 'Event', render: (row) => row.event?.title || '-' },
                  { key: 'user', label: 'Participant', render: (row) => row.user?.name || '-' },
                  { key: 'pointsRequested', label: 'Points' },
                  { key: 'status', label: 'Status' }
                ]
            }
            rows={rows}
            emptyMessage="No rewards team records"
            rowActions={
              currentPath.includes('/reward-claims')
                ? [
                  {
                    label: 'Approve',
                    variant: 'success',
                    onClick: async (row) => {
                      await DashboardService.rewardsTeamUpdateRewardClaimStatus(row._id, { status: 'approved' });
                      const result = await DashboardService.rewardsTeamRewardClaims();
                      setRows(result.data.data || []);
                    }
                  },
                  {
                    label: 'Reject',
                    variant: 'danger',
                    onClick: async (row) => {
                      await DashboardService.rewardsTeamUpdateRewardClaimStatus(row._id, { status: 'rejected' });
                      const result = await DashboardService.rewardsTeamRewardClaims();
                      setRows(result.data.data || []);
                    }
                  }
                ]
                : [
                  {
                    label: 'Approve',
                    variant: 'success',
                    onClick: async (row) => {
                      await DashboardService.rewardsTeamUpdateActivityPointsStatus(row._id, { status: 'approved' });
                      const result = await DashboardService.rewardsTeamActivityPoints();
                      setRows(result.data.data || []);
                    }
                  },
                  {
                    label: 'Reject',
                    variant: 'danger',
                    onClick: async (row) => {
                      await DashboardService.rewardsTeamUpdateActivityPointsStatus(row._id, { status: 'rejected' });
                      const result = await DashboardService.rewardsTeamActivityPoints();
                      setRows(result.data.data || []);
                    }
                  }
                ]
            }
          />
        </>
      )}

      {showBlueprint && (
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Module Action Checklist</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            {moduleBlueprint[currentPath].map((line) => <li key={line}>- {line}</li>)}
          </ul>
        </article>
      )}

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        description={modal.description}
        onCancel={() => setModal({ open: false, title: '', description: '', onConfirm: null })}
        onConfirm={modal.onConfirm || (() => {})}
      />
    </div>
  );
}
