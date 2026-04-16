import { useEffect, useMemo, useState } from 'react';
import { FiBell, FiChevronDown, FiChevronUp, FiLogOut, FiUser } from 'react-icons/fi';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { allDashboardRoutes } from '../routes/dashboardRouteMap';
import ThemeToggle from '../components/common/ThemeToggle';
import { DashboardService } from '../services/dashboardService';
import useSocket from '../hooks/useSocket';
import Toast from '../components/common/Toast';

const menuConfig = {
  admin: [
    { key: 'events', title: 'Event Management', paths: ['/dashboard/admin', '/dashboard/admin/event-overview'] },
    { key: 'reports', title: 'Reports', paths: ['/dashboard/admin/reports'] }
  ],
  participant: [
    { key: 'core', title: 'Core', paths: ['/dashboard/user', '/dashboard/user/profile', '/dashboard/user/notifications', '/dashboard/user/performance'] },
    { key: 'event', title: 'Event Journey', paths: ['/dashboard/user/registration-status', '/dashboard/user/event-flow', '/dashboard/user/shortlist-status', '/dashboard/user/idea-submission', '/dashboard/user/prototype-upload', '/dashboard/user/jury-feedback', '/dashboard/user/certificates', '/dashboard/user/winners'] },
    { key: 'management', title: 'Management', paths: ['/dashboard/user/travel', '/dashboard/user/accommodation', '/dashboard/user/food', '/dashboard/user/mentoring', '/dashboard/user/activity-points', '/dashboard/user/support', '/dashboard/user/collaboration', '/dashboard/user/team'] }
  ],
  mentor: [
    { key: 'dashboard', title: 'Dashboard', paths: ['/dashboard/mentor'] },
    { key: 'requests', title: 'Approval Requests', paths: ['/dashboard/mentor/requests'] }
  ]
};

function groupMenuByRole(role, menu) {
  const config = menuConfig[role];
  if (!config) {
    return [{ key: 'menu', title: 'Menu', items: menu }];
  }

  return config
    .map(section => ({ ...section, items: menu.filter(m => section.paths.includes(m.path)) }))
    .filter(section => section.items.length > 0);
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('innopulse_user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const [now, setNow] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [toasts, setToasts] = useState([]);
  const socket = useSocket();

  const menu = allDashboardRoutes.filter((route) => route.role === user?.role);
  const groupedMenu = useMemo(() => groupMenuByRole(user?.role, menu), [menu, user?.role]);
  const [openSections, setOpenSections] = useState({});
  const active = menu.find((item) => item.path === location.pathname);
  const workspaceTitle = {
    admin: 'Admin Workspace',
    participant: 'Participant Workspace',
    mentor: 'Mentor Workspace',
    reports_team: 'Reports Workspace'
  }[user?.role] || 'Workspace';
  const currentDate = now.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const currentTime = now.toLocaleTimeString();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initialOpen = {};
    groupedMenu.forEach((section) => {
      initialOpen[section.key] = section.items.some((item) => item.path === location.pathname);
    });
    setOpenSections((prev) => ({ ...initialOpen, ...prev }));
  }, [groupedMenu, location.pathname]);

  useEffect(() => {
    let activeMount = true;
    async function loadNotifications() {
      try {
        const result = await DashboardService.myNotifications();
        if (activeMount) setNotifications(result.data.data || []);
      } catch {
        if (activeMount) setNotifications([]);
      }
    }
    loadNotifications();

    if (socket) {
      const handleNotification = (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        setToasts((prev) => [...prev, { id: Date.now(), message: newNotification.message, type: newNotification.type }]);
      };
      socket.on('notification', handleNotification);
      return () => {
        socket.off('notification', handleNotification);
        activeMount = false;
      };
    }

    return () => { activeMount = false; };
  }, [user?._id, user?.role, location.pathname, socket]);

  const onLogout = () => {
    localStorage.removeItem('innopulse_user');
    navigate('/login');
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="app-shell">
      <div className="flex h-screen w-full">
        <aside className="fixed left-0 top-0 bottom-0 w-[290px] overflow-y-auto p-4 sidebar-shell">
          <Link to="/home" className="block font-display text-xl font-bold text-slate-900">InnoPulse 360</Link>
          <p className="mt-1 text-xs text-slate-500">From Vision to Victory</p>
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-slate-600 capitalize">{user?.role}</p>
            <p className="mt-1 text-xs text-slate-500">{user?.email || 'No email'}</p>
          </div>

          <nav className="mt-5 max-h-[62vh] space-y-3 overflow-y-auto pr-1 text-sm">
            {groupedMenu.map((section) => (
              <div key={section.key}>
                <button
                  type="button"
                  onClick={() => setOpenSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                  className="flex w-full items-center justify-between rounded-3xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:bg-slate-100"
                >
                  <span>{section.title}</span>
                  {openSections[section.key] ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openSections[section.key] && (
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `sidebar-item ${isActive ? 'sidebar-item-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button onClick={onLogout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            <FiLogOut /> Logout
          </button>
        </aside>

        <div className="ml-[290px] flex h-screen w-[calc(100%-290px)] flex-col overflow-hidden space-y-4">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
                <h1 className="font-display text-2xl font-bold text-slate-900">{workspaceTitle}</h1>
                <p className="text-sm text-slate-500">{active?.label || 'Dashboard'}</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-xs font-medium text-slate-700">
                  <p>{currentDate}</p>
                  <p>{currentTime}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotificationPanel((v) => !v);
                    setShowProfilePanel(false);
                  }}
                  className="focus-ring relative h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                  title="Notifications"
                >
                  <span className="inline-flex h-full w-full items-center justify-center text-base"><FiBell /></span>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 text-[10px] text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfilePanel((v) => !v);
                    setShowNotificationPanel(false);
                  }}
                  className="focus-ring h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                  title="Profile"
                >
                  <span className="inline-flex h-full w-full items-center justify-center text-base"><FiUser /></span>
                </button>
                <ThemeToggle compact circle />
              </div>
            </div>
            {(showProfilePanel || showNotificationPanel) && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                  {showProfilePanel && (
                    <div className="space-y-1 text-sm">
                      <p className="text-lg font-semibold text-slate-900">Profile</p>
                      <p className="font-medium text-slate-800">{user?.name || 'User'}</p>
                      <p className="text-slate-600">{user?.email}</p>
                      <p className="capitalize text-slate-600">Role: {user?.role}</p>
                      <p className="text-slate-500">User ID: {user?.id}</p>
                    </div>
                  )}
                  {showNotificationPanel && (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-slate-900">Notifications</p>
                      {notifications.length ? (
                        <ul className="max-h-52 space-y-2 overflow-y-auto">
                          {notifications.slice(0, 10).map((n) => (
                            <li key={n._id} className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
                              <p className="font-medium text-slate-800">{n.title || 'Notification'}</p>
                              <p className="text-slate-600">{n.message || '-'}</p>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-slate-600">No notifications yet.</p>}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
                      onClick={() => { setShowProfilePanel(false); setShowNotificationPanel(false); }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </header>

          <section className="flex-1 overflow-y-auto bg-slate-100 p-6">
            <Outlet />
          </section>
        </div>
      </div>
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
