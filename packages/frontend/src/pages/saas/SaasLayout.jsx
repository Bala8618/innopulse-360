import { useMemo, useRef, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCheckSquare,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiLayers,
  FiFileText,
  FiPlusCircle,
  FiUser
} from 'react-icons/fi';
import useTheme, { cycleTheme } from '../../hooks/useTheme';
import ThemeToggle from '../../components/common/ThemeToggle';

const menu = [
  { to: '/saas/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/saas/event-creation', label: 'Event Creation', icon: FiPlusCircle },
  { to: '/saas/event-flow', label: 'Event Flow Diagram', icon: FiLayers },
  { to: '/saas/event-details', label: 'Event Details', icon: FiFileText },
  { to: '/saas/participant-approval', label: 'Participant Approval', icon: FiCheckSquare }
];

export default function SaasLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const notificationRef = useRef(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pendingBadge = useMemo(() => {
    const cached = localStorage.getItem('saas_pending_count');
    return Number(cached || 0);
  }, [location.pathname]);
  const menuItems = useMemo(() => {
    if (location.pathname === '/saas/event-creation') {
      return menu.filter((item) => item.to === '/saas/event-creation');
    }
    return menu;
  }, [location.pathname]);
  const themeLabel = theme === 'auto' ? `Auto (${resolvedTheme})` : theme;
  const notifications = useMemo(() => {
    const base = [
      { id: 'n1', title: 'System update', message: 'Dashboard sync completed.', time: 'Just now' },
      { id: 'n2', title: 'Event reminder', message: 'Review upcoming event timelines.', time: '10 min ago' }
    ];
    if (pendingBadge > 0) {
      return [{ id: 'n0', title: 'Pending approvals', message: `${pendingBadge} participant approvals are waiting.`, time: 'Now' }, ...base];
    }
    return base;
  }, [pendingBadge]);
  const onLogout = async () => {
    localStorage.removeItem('innopulse_user');
    localStorage.removeItem('saas_pending_count');
    setOpenProfile(false);
    navigate('/login');
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setOpenNotifications(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex h-screen w-full">
        <aside className={`fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-slate-200 bg-white transition-all ${collapsed ? 'w-[88px]' : 'w-[280px]'}`}>
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            {!collapsed && (
              <div>
                <p className="text-lg font-bold text-slate-900">InnoPulse 360</p>
                <p className="text-xs text-slate-500">Event Process Performance</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          <nav className="space-y-1 p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon className="text-base" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.to === '/saas/participant-approval' && pendingBadge > 0 && (
                    <span className="ml-auto rounded-full bg-rose-600 px-2 py-0.5 text-xs text-white">{pendingBadge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <button
            onClick={onLogout}
            className={`mx-3 mb-4 mt-auto flex items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 ${collapsed ? 'w-[56px]' : 'w-auto'}`}
          >
            Logout
          </button>
        </aside>

        <div
          className="flex h-screen flex-col overflow-hidden"
          style={{ marginLeft: collapsed ? 88 : 280, width: `calc(100% - ${collapsed ? 88 : 280}px)` }}
        >
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="flex h-16 items-center justify-between px-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Admin Console</p>
                <p className="text-sm font-semibold text-slate-700">Event Online Process Performance Dashboard</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setOpenNotifications((v) => !v)}
                    className="relative h-9 w-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    title="Notifications"
                  >
                    <span className="inline-flex h-full w-full items-center justify-center"><FiBell /></span>
                    {pendingBadge > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 text-[10px] text-white">{pendingBadge}</span>}
                  </button>
                  {openNotifications && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-lg font-semibold">Notifications</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{notifications.length}</span>
                        </div>
                        <div className="max-h-72 space-y-2 overflow-y-auto">
                          {notifications.map((n) => (
                            <article key={n.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                              <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-600">{n.message}</p>
                              <p className="mt-1 text-[11px] text-slate-500">{n.time}</p>
                            </article>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
                            onClick={() => setOpenNotifications(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <ThemeToggle compact circle />
                <div className="relative">
                  <button
                    onClick={() => setOpenProfile((v) => !v)}
                    className="h-9 w-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    title="Profile"
                  >
                    <span className="inline-flex h-full w-full items-center justify-center"><FiUser /></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-100 px-6 py-6">
            <Outlet />
          </main>
        </div>
      </div>

      {showProfilePanel && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold">Profile Details</h2>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">Name:</span> Admin User</p>
              <p><span className="font-semibold text-slate-800">Role:</span> Admin</p>
              <p><span className="font-semibold text-slate-800">Email:</span> admin@innopulse360.com</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => setShowProfilePanel(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {openProfile && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold">Profile</h2>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">Name:</span> Admin User</p>
              <p><span className="font-semibold text-slate-800">Role:</span> Admin</p>
              <p><span className="font-semibold text-slate-800">Email:</span> admin@innopulse360.com</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-xs" onClick={() => setOpenProfile(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsPanel && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="mt-3 text-sm text-slate-600">Switch UI theme and user preferences for this dashboard.</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setTheme(cycleTheme(theme))}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Change Theme ({themeLabel})
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={() => setShowSettingsPanel(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
