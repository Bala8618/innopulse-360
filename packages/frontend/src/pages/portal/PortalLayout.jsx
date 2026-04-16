import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiCheckSquare,
  FiClipboard,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiLayers,
  FiList,
  FiLogOut,
  FiMessageSquare,
  FiTruck,
  FiUser
} from 'react-icons/fi';
import ThemeToggle from '../../components/common/ThemeToggle';

function moduleHash(label) { return `#${encodeURIComponent(label)}`; }

function menuByRole(role) {
  const participantItems = [
    { label: 'Dashboard', icon: FiBarChart2 },
    { label: 'Available Events', icon: FiList },
    { label: 'Event Flow', icon: FiLayers },
    { label: 'Event Registration', icon: FiEdit3 },
    { label: 'Registered Events', icon: FiCheckSquare },
    { label: 'OD Application', icon: FiClipboard },
    { label: 'Rewards Submission', icon: FiAward }
  ];

  if (role === 'participant') {
    return participantItems.map((m) => ({ to: `/portal/participant${moduleHash(m.label)}`, label: m.label, icon: m.icon, hashItem: true }));
  }
  if (role === 'event_management') {
    const items = [
      { label: 'Dashboard', icon: FiBarChart2 },
      { label: 'Event List', icon: FiList },
      { label: 'Event Flow', icon: FiLayers },
      { label: 'Registrations', icon: FiCheckSquare },
      { label: 'Resource Requests', icon: FiTruck },
      { label: 'Approved Participants', icon: FiUser },
      { label: 'Winners', icon: FiAward },
      { label: 'Process Performance', icon: FiBarChart2 }
    ];
    return items.map((m) => ({ to: `/portal/event-management${moduleHash(m.label)}`, label: m.label, icon: m.icon, hashItem: true }));
  }
  if (role === 'college_management') {
    return [{ to: '/portal/college-management', label: 'College Management', icon: FiBarChart2 }];
  }
  if (role === 'reports_team') {
    const items = [
      { label: 'Dashboard', icon: FiBarChart2 },
      { label: 'Submitted Reports', icon: FiFileText },
      { label: 'Review Reports', icon: FiClipboard },
      { label: 'Event Ratings', icon: FiAward }
    ];
    return items.map((m) => ({ to: `/portal/reports-team${moduleHash(m.label)}`, label: m.label, icon: m.icon, hashItem: true }));
  }
  if (role === 'mentor') {
    const items = [
      { label: 'Dashboard', icon: FiBarChart2 },
      { label: 'OD Requests', icon: FiClipboard },
      { label: 'Reward Requests', icon: FiAward },
      { label: 'Assign Reward Points', icon: FiCheckSquare }
    ];
    return items.map((m) => ({ to: `/portal/mentor${moduleHash(m.label)}`, label: m.label, icon: m.icon, hashItem: true }));
  }
  return [];
}

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const user = JSON.parse(localStorage.getItem('innopulse_user') || '{}');
  const links = useMemo(() => menuByRole(user.role), [user.role]);
  const activeHash = decodeURIComponent((location.hash || '').replace('#', ''));
  const portalTitle = {
    participant: 'Participant Portal',
    event_management: 'Event Management Portal',
    college_management: 'College Management Portal',
    mentor: 'Mentor Portal',
    reports_team: 'Reports Team Portal'
  }[user.role] || 'Portal';
  const notifications = [
    { id: 1, title: 'Updates available', message: 'New events and approvals ready.' },
    { id: 2, title: 'Reminder', message: 'Check your latest requests.' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="flex h-screen w-full">
        <aside className="sidebar-shell fixed left-0 top-0 bottom-0 w-[260px] overflow-y-auto p-4">
          <div className="mb-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">InnoPulse</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Event Operations</p>
            </div>
          </div>

          <div className="mb-5 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
            <p className="text-sm font-semibold text-slate-900">{portalTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{user?.name || 'Welcome'}</p>
          </div>

          <nav className="space-y-2">
            {links.map((l) => {
              const Icon = l.icon;
              const isActive = l.hashItem ? activeHash === l.label : location.pathname === l.to;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                >
                  <Icon className="text-lg text-sky-600" />
                  <span>{l.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => { localStorage.removeItem('innopulse_user'); navigate('/login'); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </aside>

        <div className="ml-[260px] flex h-screen w-[calc(100%-260px)] flex-col overflow-hidden bg-transparent">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Workspace</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{portalTitle}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role?.replace('_', ' ') || 'Role'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowNotifications((v) => !v); setShowProfile(false); }}
                  className="focus-ring relative h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                  title="Notifications"
                >
                  <span className="inline-flex h-full w-full items-center justify-center"><FiBell /></span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProfile((v) => !v); setShowNotifications(false); }}
                  className="focus-ring h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                  title="Profile"
                >
                  <span className="inline-flex h-full w-full items-center justify-center"><FiUser /></span>
                </button>
                <ThemeToggle compact circle />
              </div>
            </div>
          </header>

          {(showProfile || showNotifications) && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
              <div className="glass-panel w-full max-w-md p-4">
                {showProfile && (
                  <div className="space-y-2 text-sm text-slate-800 dark:text-slate-100">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Profile</p>
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="text-slate-600 dark:text-slate-300">{user?.email || 'user@test.com'}</p>
                    <p className="text-slate-500 dark:text-slate-400">Role: {user?.role || '-'}</p>
                  </div>
                )}
                {showNotifications && (
                  <div className="space-y-3">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</p>
                    {notifications.map((n) => (
                      <div key={n.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <p className="font-semibold text-slate-800 dark:text-white">{n.title}</p>
                        <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    className="rounded-2xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
                    onClick={() => { setShowProfile(false); setShowNotifications(false); }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto bg-slate-100 px-6 py-6 dark:bg-slate-950">
            <div className="glass-panel mx-auto w-full max-w-6xl p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
