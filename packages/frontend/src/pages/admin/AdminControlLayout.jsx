import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiActivity, FiBarChart2, FiBell, FiClipboard, FiDatabase, FiLogOut, FiServer, FiUsers, FiUser } from 'react-icons/fi';
import ThemeToggle from '../../components/common/ThemeToggle';

const links = [
  { to: '/admin-innopulse-control', label: 'Overview', icon: FiActivity },
  { to: '/admin-innopulse-control/users', label: 'User Management', icon: FiUsers },
  { to: '/admin-innopulse-control/events', label: 'Event Monitoring', icon: FiClipboard },
  { to: '/admin-innopulse-control/registrations', label: 'Registration Monitoring', icon: FiUsers },
  { to: '/admin-innopulse-control/data', label: 'Data Console', icon: FiDatabase },
  { to: '/admin-innopulse-control/analytics', label: 'System Analytics', icon: FiBarChart2 },
  { to: '/admin-innopulse-control/logs', label: 'System Logs', icon: FiServer }
];

export default function AdminControlLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('innopulse_user') || '{}');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = [
    { id: 1, title: 'System sync', message: 'Admin console data refreshed.' },
    { id: 2, title: 'Pending approvals', message: 'Review new participant registrations.' }
  ];
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="flex h-screen w-full">
        <aside className="fixed left-0 top-0 bottom-0 w-[260px] overflow-y-auto p-4 sidebar-shell">
          <div className="mb-4">
            <p className="text-2xl font-bold text-slate-900">InnoPulse 360</p>
            <p className="text-xs text-slate-500">Admin Control</p>
          </div>
          <nav className="space-y-2">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/admin-innopulse-control'}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'sidebar-item-active' : 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`
                  }
                >
                  <Icon className="text-base text-sky-600" />
                  {l.label}
                </NavLink>
              );
            })}
          </nav>
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={() => { localStorage.removeItem('innopulse_user'); navigate('/admin-login'); }}
          >
            <FiLogOut /> Logout
          </button>
        </aside>
        <div className="ml-[260px] flex h-screen w-[calc(100%-260px)] flex-col overflow-hidden bg-transparent">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Admin Portal</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">System Control & Monitoring</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowProfile(false);
                }}
                className="h-9 w-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                title="Notifications"
              >
                <span className="inline-flex h-full w-full items-center justify-center"><FiBell /></span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfile((v) => !v);
                  setShowNotifications(false);
                }}
                className="h-9 w-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                title="Profile"
              >
                <span className="inline-flex h-full w-full items-center justify-center"><FiUser /></span>
              </button>
              <ThemeToggle compact circle />
            </div>
          </header>
          {(showProfile || showNotifications) && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                {showProfile && (
                  <div className="space-y-1 text-sm">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Profile</p>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{user?.name || 'Admin'}</p>
                    <p className="text-slate-600 dark:text-slate-300">{user?.email || 'admin@test.com'}</p>
                    <p className="text-slate-500 dark:text-slate-400">Role: {user?.role || 'admin'}</p>
                  </div>
                )}
                {showNotifications && (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</p>
                    {notifications.map((n) => (
                      <div key={n.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                        <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700 dark:text-slate-200"
                    onClick={() => { setShowProfile(false); setShowNotifications(false); }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          <main className="flex-1 overflow-y-auto bg-slate-100 px-6 py-6 dark:bg-slate-950">
            <div className="mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
